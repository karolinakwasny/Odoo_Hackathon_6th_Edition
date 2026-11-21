import json
import queue
import re
import socket
import threading
import tkinter as tk
from dataclasses import dataclass
from pathlib import Path
from tkinter import scrolledtext, ttk

CHUNKS_DIR = Path("chunks")

# Fixed list of worker endpoints the coordinator connects to
WORKER_ENDPOINTS: list[tuple[str, str, int]] = [
    ("Worker-1", "127.0.0.1", 5051),
    ("Worker-2", "127.0.0.1", 5052),
]

# 10 distinct colors for workers (wraps around at index 10 -> 0)
WORKER_COLORS: list[str] = [
    "#1565C0",  # 1: Blue
    "#2E7D32",  # 2: Green
    "#C62828",  # 3: Red
    "#6A1B9A",  # 4: Purple
    "#EF6C00",  # 5: Deep Orange
    "#00838F",  # 6: Teal
    "#AD1457",  # 7: Magenta / Rose
    "#4E342E",  # 8: Brown
    "#283593",  # 9: Indigo
    "#558B2F",  # 10: Olive Green
]


def extract_chunk_number(chunk_name: str) -> int:
    match = re.search(r"(\d+)", chunk_name)
    if not match:
        raise ValueError(f"Could not extract numeric chunk ID from '{chunk_name}'")
    return int(match.group(1))


@dataclass
class WorkerSlot:
    name: str
    host: str
    port: int
    color: str
    status: str = "offline"      # offline | idle | busy | error
    current_chunk: str | None = None
    speed_mode: str = "M"
    sock: socket.socket | None = None
    send_lock: threading.Lock = None

    def __post_init__(self) -> None:
        if self.send_lock is None:
            self.send_lock = threading.Lock()


class CoordinatorEngine:
    def __init__(
        self,
        log_queue: queue.Queue,
        endpoints: list[tuple[str, str, int]] = WORKER_ENDPOINTS,
        chunks_dir: Path = CHUNKS_DIR,
    ) -> None:
        self.log_queue = log_queue
        self.chunks_dir = chunks_dir
        self.workers: dict[str, WorkerSlot] = {
            name: WorkerSlot(
                name=name,
                host=host,
                port=port,
                color=WORKER_COLORS[idx % len(WORKER_COLORS)],
            )
            for idx, (name, host, port) in enumerate(endpoints)
        }
        self.chunk_order: list[int] = []
        self.chunk_names: dict[int, str] = {}
        self.chunk_states: dict[int, str] = {}     # chunk_num -> pending | in_progress | done
        self.chunk_percents: dict[int, int] = {}   # chunk_num -> 0..100
        self.chunk_paths: dict[int, Path] = {}
        self.results: dict[int, list[float]] = {}

        self._state_lock = threading.Lock()
        self._stop_event = threading.Event()
        self._dispatch_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._running = False

    def log(self, msg: str, worker_name: str | None = None) -> None:
        self.log_queue.put(("log", {"msg": msg, "worker": worker_name}))

    def emit_state(self) -> None:
        with self._state_lock:
            workers_snap = [
                {
                    "name": w.name,
                    "addr": f"{w.host}:{w.port}",
                    "color": w.color,
                    "status": w.status,
                    "chunk": w.current_chunk or "-",
                    "speed": w.speed_mode,
                }
                for w in self.workers.values()
            ]
            chunks_snap = [
                {
                    "num": num,
                    "name": self.chunk_names[num],
                    "state": self.chunk_states[num],
                    "percent": self.chunk_percents[num],
                }
                for num in self.chunk_order
            ]
            total = len(chunks_snap)
            done = sum(1 for c in chunks_snap if c["state"] == "done")
            overall_pct = (done / total * 100.0) if total > 0 else 0.0

        self.log_queue.put((
            "state",
            {
                "workers": workers_snap,
                "chunks": chunks_snap,
                "done": done,
                "total": total,
                "overall_pct": overall_pct,
            },
        ))

    def set_worker_speed(self, worker_name: str, mode: str) -> None:
        normalized = mode.upper()
        if normalized not in ("L", "M", "H"):
            return

        with self._state_lock:
            slot = self.workers.get(worker_name)
            if not slot:
                return
            slot.speed_mode = normalized
            sock = slot.sock
            send_lock = slot.send_lock

        self.log(f"Program 1: setting {worker_name} speed to '{normalized}'.", worker_name=worker_name)
        self.emit_state()

        if sock is not None:
            payload = (json.dumps({"type": "speed", "mode": normalized}) + "\n").encode("utf-8")
            try:
                with send_lock:
                    sock.sendall(payload)
            except OSError as exc:
                self.log(
                    f"Program 1: failed sending speed '{normalized}' to {worker_name}: {exc}",
                    worker_name=worker_name,
                )

    def start(self) -> None:
        if self._running:
            self.log("Program 1: a run is already active.")
            return
        self._running = True
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run_orchestrator, daemon=True)
        self._thread.start()

    def _load_chunks(self) -> bool:
        if not self.chunks_dir.exists() or not self.chunks_dir.is_dir():
            self.log(f"Program 1: chunk folder '{self.chunks_dir}' not found. Run mockup_math_creation.py first.")
            return False

        csv_files = sorted(self.chunks_dir.glob("chunk_*.csv"))
        if not csv_files:
            self.log(f"Program 1: no 'chunk_*.csv' files found in '{self.chunks_dir}'.")
            return False

        order: list[int] = []
        names: dict[int, str] = {}
        states: dict[int, str] = {}
        percents: dict[int, int] = {}
        paths: dict[int, Path] = {}

        for p in csv_files:
            num = extract_chunk_number(p.name)
            order.append(num)
            names[num] = p.name
            states[num] = "pending"
            percents[num] = 0
            paths[num] = p

        with self._state_lock:
            self.chunk_order = order
            self.chunk_names = names
            self.chunk_states = states
            self.chunk_percents = percents
            self.chunk_paths = paths
            self.results = {}

        self.log(f"Program 1: loaded {len(csv_files)} chunks into memory as 'pending'.")
        return True

    def _worker_loop(self, slot: WorkerSlot) -> None:
        try:
            self.log(
                f"Program 1: connecting to {slot.name} at {slot.host}:{slot.port}...",
                worker_name=slot.name,
            )
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.5)
            sock.connect((slot.host, slot.port))

            with self._state_lock:
                slot.sock = sock
                slot.status = "idle"
                slot.current_chunk = None
                initial_speed = slot.speed_mode

            self.log(
                f"Program 1: connected to {slot.name} (speed={initial_speed}).",
                worker_name=slot.name,
            )
            with slot.send_lock:
                sock.sendall((json.dumps({"type": "speed", "mode": initial_speed}) + "\n").encode("utf-8"))
            self.emit_state()

            buffer = ""
            while not self._stop_event.is_set():
                assigned_num: int | None = None

                # Claim at most ONE pending chunk for this worker
                with self._state_lock:
                    if slot.status == "idle" and slot.current_chunk is None:
                        for num in self.chunk_order:
                            if self.chunk_states[num] == "pending":
                                self.chunk_states[num] = "in_progress"
                                self.chunk_percents[num] = 0
                                slot.status = "busy"
                                slot.current_chunk = self.chunk_names[num]
                                assigned_num = num
                                break

                if assigned_num is not None:
                    chunk_name = self.chunk_names[assigned_num]
                    chunk_path = self.chunk_paths[assigned_num]
                    self.log(
                        f"Program 1: assigning '{chunk_name}' (chunk #{assigned_num}) to {slot.name} "
                        f"(marked in_progress).",
                        worker_name=slot.name,
                    )
                    self.emit_state()

                    msg = (
                        json.dumps({
                            "type": "chunk",
                            "chunk_name": chunk_name,
                            "chunk_path": str(chunk_path.resolve()),
                        })
                        + "\n"
                    ).encode("utf-8")

                    with slot.send_lock:
                        sock.sendall(msg)

                    # Read progress updates until final "results" arrives for this chunk
                    finished_chunk = False
                    while not self._stop_event.is_set() and not finished_chunk:
                        try:
                            data = sock.recv(4096)
                            if not data:
                                raise RuntimeError(
                                    f"{slot.name} closed connection while working on '{chunk_name}'."
                                )
                            buffer += data.decode("utf-8")

                            while "\n" in buffer:
                                raw_line, buffer = buffer.split("\n", 1)
                                reply = json.loads(raw_line)
                                r_type = reply.get("type")

                                if r_type == "chunk_progress":
                                    prog_chunk = int(reply.get("chunk", assigned_num))
                                    pct = int(reply.get("percent", 0))
                                    with self._state_lock:
                                        if prog_chunk in self.chunk_percents and self.chunk_states[prog_chunk] != "done":
                                            self.chunk_percents[prog_chunk] = pct
                                    self.log(
                                        f"Program 1: {slot.name} progress on chunk #{prog_chunk}: {pct}%",
                                        worker_name=slot.name,
                                    )
                                    self.emit_state()

                                elif r_type == "results":
                                    solutions = reply.get("solutions", [])
                                    with self._state_lock:
                                        self.chunk_states[assigned_num] = "done"
                                        self.chunk_percents[assigned_num] = 100
                                        self.results[assigned_num] = solutions
                                        slot.status = "idle"
                                        slot.current_chunk = None

                                    self.log(
                                        f"Program 1: {slot.name} finished '{chunk_name}'; marked as DONE. "
                                        f"Solutions: {solutions}",
                                        worker_name=slot.name,
                                    )
                                    self.emit_state()
                                    finished_chunk = True
                                    break
                        except socket.timeout:
                            continue
                else:
                    with self._state_lock:
                        all_done = all(st == "done" for st in self.chunk_states.values())
                    if all_done:
                        break
                    self._dispatch_event.wait(timeout=0.2)

        except Exception as exc:
            with self._state_lock:
                if slot.current_chunk:
                    try:
                        c_num = extract_chunk_number(slot.current_chunk)
                        if self.chunk_states.get(c_num) == "in_progress":
                            self.chunk_states[c_num] = "pending"
                            self.chunk_percents[c_num] = 0
                            self.log(
                                f"Program 1: returned '{slot.current_chunk}' to pending after {slot.name} error.",
                                worker_name=slot.name,
                            )
                    except ValueError:
                        pass
                slot.status = "error"
                slot.current_chunk = None
                if slot.sock is not None:
                    try:
                        slot.sock.close()
                    except OSError:
                        pass
                    slot.sock = None
            self.log(f"Program 1: {slot.name} error—{exc}", worker_name=slot.name)
            self.emit_state()
        finally:
            with self._state_lock:
                if slot.sock is not None:
                    try:
                        slot.sock.close()
                    except OSError:
                        pass
                    slot.sock = None
                if slot.status not in ("offline", "error"):
                    slot.status = "offline"
                slot.current_chunk = None
            self.emit_state()

    def _run_orchestrator(self) -> None:
        try:
            if not self._load_chunks():
                return
            self.emit_state()

            threads = [
                threading.Thread(target=self._worker_loop, args=(slot,), daemon=True)
                for slot in self.workers.values()
            ]
            for t in threads:
                t.start()
            for t in threads:
                t.join()

            with self._state_lock:
                done_count = sum(1 for st in self.chunk_states.values() if st == "done")
                total_count = len(self.chunk_states)

            self.log(f"Program 1: orchestration finished ({done_count}/{total_count} chunks marked done).")
        finally:
            self._running = False
            self.log_queue.put(("finished", None))


class CoordinatorApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Program 1 — Multi-Worker Chunk Coordinator")
        self.root.geometry("1120x640")

        self.log_queue: queue.Queue = queue.Queue()
        self.engine = CoordinatorEngine(self.log_queue)
        self.speed_vars: dict[str, tk.StringVar] = {}
        self.worker_labels: dict[str, tk.Label] = {}
        self.worker_tags: dict[str, str] = {}
        self.chunk_tiles: dict[int, tk.Label] = {}

        self._build_ui()
        self._poll_queue()

    def _build_ui(self) -> None:
        main_pane = tk.Frame(self.root)
        main_pane.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Left side: Controls, workers, and colored logs
        left_panel = tk.Frame(main_pane)
        left_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))

        top = tk.Frame(left_panel)
        top.pack(fill=tk.X, pady=(0, 8))

        self.start_btn = tk.Button(top, text="Start Run", command=self.on_start)
        self.start_btn.pack(side=tk.LEFT)

        self.chunk_summary_var = tk.StringVar(value="Chunks: 0 pending | 0 in_progress | 0 done")
        tk.Label(top, textvariable=self.chunk_summary_var).pack(side=tk.LEFT, padx=14)

        workers_box = tk.LabelFrame(
            left_panel,
            text="Workers & Per-Worker Step Speed (L=0.9s, M=0.6s, H=0.3s)",
            padx=10,
            pady=6,
        )
        workers_box.pack(fill=tk.X, pady=(0, 8))

        for idx, (name, slot) in enumerate(self.engine.workers.items()):
            row = tk.Frame(workers_box, pady=2)
            row.pack(fill=tk.X)

            var = tk.StringVar(value=slot.speed_mode)
            self.speed_vars[name] = var

            lbl = tk.Label(
                row,
                text=f"{name} ({slot.host}:{slot.port}) — status: {slot.status} | chunk: -",
                fg=slot.color,
                anchor="w",
            )
            lbl.pack(side=tk.LEFT, fill=tk.X, expand=True)
            self.worker_labels[name] = lbl

            for mode in ("L", "M", "H"):
                rb = tk.Radiobutton(
                    row,
                    text=mode,
                    variable=var,
                    value=mode,
                    indicatoron=False,
                    width=4,
                    command=lambda w=name, m=mode: self.engine.set_worker_speed(w, m),
                )
                rb.pack(side=tk.LEFT, padx=2)

        self.log_area = scrolledtext.ScrolledText(
            left_panel, wrap=tk.WORD, state=tk.DISABLED, font=("Consolas", 10)
        )
        self.log_area.pack(fill=tk.BOTH, expand=True)

        for idx, (name, slot) in enumerate(self.engine.workers.items()):
            tag_name = f"worker_{idx % len(WORKER_COLORS)}"
            self.worker_tags[name] = tag_name
            self.log_area.tag_config(tag_name, foreground=slot.color)

        # Right side: Project completion visualizer (Red = not done, Green = done)
        right_panel = tk.LabelFrame(main_pane, text="Project Completion Visualizer", width=330, padx=12, pady=12)
        right_panel.pack(side=tk.RIGHT, fill=tk.Y)
        right_panel.pack_propagate(False)

        self.overall_pct_var = tk.StringVar(value="0.0% Completed (0 / 0 chunks)")
        tk.Label(
            right_panel,
            textvariable=self.overall_pct_var,
            font=("TkDefaultFont", 11, "bold"),
        ).pack(anchor="w", pady=(0, 6))

        self.progress_bar = ttk.Progressbar(right_panel, orient="horizontal", mode="determinate", maximum=100)
        self.progress_bar.pack(fill=tk.X, pady=(0, 12))

        legend = tk.Frame(right_panel)
        legend.pack(fill=tk.X, pady=(0, 10))
        tk.Label(legend, text="  Not Done  ", bg="#C62828", fg="white", padx=6, pady=2).pack(side=tk.LEFT, padx=(0, 8))
        tk.Label(legend, text="  Done  ", bg="#2E7D32", fg="white", padx=6, pady=2).pack(side=tk.LEFT)

        self.chunks_grid = tk.Frame(right_panel)
        self.chunks_grid.pack(fill=tk.BOTH, expand=True)

    def _rebuild_chunk_tiles(self, chunks: list[dict]) -> None:
        for widget in self.chunks_grid.winfo_children():
            widget.destroy()
        self.chunk_tiles.clear()

        cols = 4
        for idx, ch in enumerate(chunks):
            num = ch["num"]
            r, c = divmod(idx, cols)
            tile = tk.Label(
                self.chunks_grid,
                text=f"#{num}\n{ch['percent']}%",
                width=7,
                height=2,
                bg="#C62828",
                fg="white",
                font=("Consolas", 9, "bold"),
                relief=tk.RAISED,
                bd=1,
            )
            tile.grid(row=r, column=c, padx=4, pady=4)
            self.chunk_tiles[num] = tile

    def on_start(self) -> None:
        self.start_btn.config(state=tk.DISABLED)
        self.engine.start()

    def _append_log(self, entry: dict) -> None:
        msg = entry["msg"]
        worker_name = entry.get("worker")
        tag = self.worker_tags.get(worker_name) if worker_name else None

        self.log_area.config(state=tk.NORMAL)
        if tag:
            self.log_area.insert(tk.END, msg + "\n", tag)
        else:
            self.log_area.insert(tk.END, msg + "\n")
        self.log_area.see(tk.END)
        self.log_area.config(state=tk.DISABLED)

    def _apply_state(self, payload: dict) -> None:
        for w in payload["workers"]:
            name = w["name"]
            if name in self.worker_labels:
                self.worker_labels[name].config(
                    text=f"{name} ({w['addr']}) — status: {w['status']} | chunk: {w['chunk']}",
                    fg=w["color"],
                )
            if name in self.speed_vars:
                self.speed_vars[name].set(w["speed"])

        chunks = payload["chunks"]
        if chunks and set(self.chunk_tiles.keys()) != {c["num"] for c in chunks}:
            self._rebuild_chunk_tiles(chunks)

        for ch in chunks:
            num = ch["num"]
            tile = self.chunk_tiles.get(num)
            if tile is not None:
                is_done = ch["state"] == "done"
                bg = "#2E7D32" if is_done else "#C62828"
                pct_text = "100%" if is_done else f"{ch['percent']}%"
                tile.config(text=f"#{num}\n{pct_text}", bg=bg)

        done = payload["done"]
        total = payload["total"]
        overall_pct = payload["overall_pct"]

        self.overall_pct_var.set(f"{overall_pct:.1f}% Completed ({done} / {total} chunks)")
        self.progress_bar["value"] = overall_pct

        p_cnt = sum(1 for c in chunks if c["state"] == "pending")
        ip_cnt = sum(1 for c in chunks if c["state"] == "in_progress")
        d_cnt = done
        self.chunk_summary_var.set(
            f"Chunks: {p_cnt} pending | {ip_cnt} in_progress | {d_cnt} done"
        )

    def _poll_queue(self) -> None:
        while not self.log_queue.empty():
            kind, payload = self.log_queue.get_nowait()
            if kind == "log":
                self._append_log(payload)
            elif kind == "state":
                self._apply_state(payload)
            elif kind == "finished":
                self.start_btn.config(state=tk.NORMAL)

        self.root.after(100, self._poll_queue)


def main() -> None:
    root = tk.Tk()
    CoordinatorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()