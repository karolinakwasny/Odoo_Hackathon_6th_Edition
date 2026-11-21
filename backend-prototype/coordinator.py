import json
import queue
import socket
import threading
import tkinter as tk
from dataclasses import dataclass
from pathlib import Path
from tkinter import scrolledtext

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
        self.chunk_states: dict[str, str] = {}   # chunk_name -> pending | in_progress | done
        self.chunk_paths: dict[str, Path] = {}
        self.results: dict[str, list[float]] = {}

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
            chunks_snap = dict(self.chunk_states)
        self.log_queue.put(("state", {"workers": workers_snap, "chunks": chunks_snap}))

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

        with self._state_lock:
            self.chunk_states = {p.name: "pending" for p in csv_files}
            self.chunk_paths = {p.name: p for p in csv_files}
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
            sock.settimeout(1.0)
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
                assigned_chunk: str | None = None

                # Claim at most ONE pending chunk for this worker
                with self._state_lock:
                    if slot.status == "idle" and slot.current_chunk is None:
                        for name, state in self.chunk_states.items():
                            if state == "pending":
                                self.chunk_states[name] = "in_progress"
                                slot.status = "busy"
                                slot.current_chunk = name
                                assigned_chunk = name
                                break

                if assigned_chunk is not None:
                    chunk_path = self.chunk_paths[assigned_chunk]
                    self.log(
                        f"Program 1: assigning '{assigned_chunk}' to {slot.name} (marked in_progress).",
                        worker_name=slot.name,
                    )
                    self.emit_state()

                    msg = (
                        json.dumps({
                            "type": "chunk",
                            "chunk_name": assigned_chunk,
                            "chunk_path": str(chunk_path.resolve()),
                        })
                        + "\n"
                    ).encode("utf-8")

                    with slot.send_lock:
                        sock.sendall(msg)

                    # Wait for this worker's result on the assigned chunk
                    reply = None
                    while not self._stop_event.is_set() and reply is None:
                        try:
                            data = sock.recv(4096)
                            if not data:
                                raise RuntimeError(
                                    f"{slot.name} closed connection while working on '{assigned_chunk}'."
                                )
                            buffer += data.decode("utf-8")
                            if "\n" in buffer:
                                raw_line, buffer = buffer.split("\n", 1)
                                reply = json.loads(raw_line)
                        except socket.timeout:
                            continue

                    if reply is not None and reply.get("type") == "results":
                        solutions = reply.get("solutions", [])
                        with self._state_lock:
                            self.chunk_states[assigned_chunk] = "done"
                            self.results[assigned_chunk] = solutions
                            slot.status = "idle"
                            slot.current_chunk = None

                        self.log(
                            f"Program 1: {slot.name} finished '{assigned_chunk}'; marked as DONE. "
                            f"Solutions: {solutions}",
                            worker_name=slot.name,
                        )
                        self.emit_state()
                else:
                    # Check if all chunks are done
                    with self._state_lock:
                        all_done = all(st == "done" for st in self.chunk_states.values())
                    if all_done:
                        break
                    self._dispatch_event.wait(timeout=0.2)

        except Exception as exc:
            with self._state_lock:
                if slot.current_chunk and self.chunk_states.get(slot.current_chunk) == "in_progress":
                    self.chunk_states[slot.current_chunk] = "pending"
                    self.log(
                        f"Program 1: returned '{slot.current_chunk}' to pending after {slot.name} error.",
                        worker_name=slot.name,
                    )
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
        self.root.geometry("860x580")

        self.log_queue: queue.Queue = queue.Queue()
        self.engine = CoordinatorEngine(self.log_queue)
        self.speed_vars: dict[str, tk.StringVar] = {}
        self.worker_labels: dict[str, tk.Label] = {}
        self.worker_tags: dict[str, str] = {}

        self._build_ui()
        self._poll_queue()

    def _build_ui(self) -> None:
        top = tk.Frame(self.root, padx=12, pady=10)
        top.pack(fill=tk.X)

        self.start_btn = tk.Button(top, text="Start Run", command=self.on_start)
        self.start_btn.pack(side=tk.LEFT)

        self.chunk_summary_var = tk.StringVar(value="Chunks: 0 pending | 0 in_progress | 0 done")
        tk.Label(top, textvariable=self.chunk_summary_var).pack(side=tk.LEFT, padx=16)

        workers_box = tk.LabelFrame(self.root, text="Workers & Per-Worker Speed (L=3s, M=2s, H=1s)", padx=12, pady=8)
        workers_box.pack(fill=tk.X, padx=12, pady=(0, 10))

        for idx, (name, slot) in enumerate(self.engine.workers.items()):
            row = tk.Frame(workers_box, pady=3)
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
            self.root, wrap=tk.WORD, state=tk.DISABLED, font=("Consolas", 10)
        )
        self.log_area.pack(fill=tk.BOTH, expand=True, padx=12, pady=(0, 12))

        for idx, (name, slot) in enumerate(self.engine.workers.items()):
            tag_name = f"worker_{idx % len(WORKER_COLORS)}"
            self.worker_tags[name] = tag_name
            self.log_area.tag_config(tag_name, foreground=slot.color)

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

        states = list(payload["chunks"].values())
        p_cnt = sum(1 for s in states if s == "pending")
        ip_cnt = sum(1 for s in states if s == "in_progress")
        d_cnt = sum(1 for s in states if s == "done")
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