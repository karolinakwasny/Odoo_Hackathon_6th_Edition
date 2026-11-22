"""Runs the coordinator (coordinator.py) on chunks/ and reports the run over WebSocket.

Run from this folder (start the workers separately with ./start_workers.sh):
    pip install fastapi "uvicorn[standard]"
    python3 -m uvicorn api:app --port 8000

The coordinator does not start by itself. It starts when a client sends
{"type": "request", "project_id": "math"} (start_workers.sh or the Start button do this).

Messages to clients:
    welcome, progress, chunk_progress    from ../ws_data.txt
    state    the coordinator's full snapshot (workers, countries, chunks), as in its Tkinter window
    log      one line of the coordinator's log
Messages from clients:
    request  start the run
    speed    {"type": "speed", "country": "DE", "mode": "L" | "M" | "H"}
"""
import asyncio
import os
import queue
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from coordinator import CoordinatorEngine

HERE = Path(__file__).parent
PROJECT_ID, PROJECT_NAME = "math", "Math chunks"

events: queue.Queue = queue.Queue()
engine = CoordinatorEngine(events, chunks_dir=HERE / "chunks")
clients: dict[str, WebSocket] = {}  # node_id -> connection
run_started = False             # True while a run is going; a new "request" starts the next run after it
completed_before = 0            # chunks completed in earlier runs since the backend started
last_state: dict | None = None  # latest coordinator snapshot, sent to new clients
logs: list[dict] = []           # coordinator log lines, the last 200 are kept

app = FastAPI()

def percent() -> float:
    states = list(engine.chunk_states.values())
    return round(100 * states.count("done") / len(states), 1) if states else 0.0


def progress_msg() -> dict:
    states = list(engine.chunk_states.values())
    return {
        "type": "progress",
        "projects": [{
            "id": PROJECT_ID,
            "done": states.count("done"),
            "running": states.count("in_progress"),
            "total": len(states),
            "percent": percent(),
            # all chunks completed since the backend started, over every run
            "completed_total": completed_before + (states.count("done") if run_started else 0),
        }],
        # donating nodes = coordinator workers that are currently connected
        "nodes_online": sum(w.status in ("idle", "busy") for w in engine.workers.values()),
    }


def state_msg() -> dict:
    return {"type": "state", "run_started": run_started, **(last_state or {})}


async def broadcast(msg: dict) -> None:
    for ws in list(clients.values()):
        try:
            await ws.send_json(msg)
        except Exception:
            pass

async def forward_coordinator_events() -> None:
    """The coordinator reports changes on a queue; pass them on to every connected client."""
    global last_state, run_started, completed_before
    while True:
        changed = False
        while not events.empty():
            kind, payload = events.get()
            if kind == "log":
                entry = {"time": time.strftime("%H:%M:%S"), **payload}
                logs.append(entry)
                del logs[:-200]
                await broadcast({"type": "log", **entry})
            elif kind == "state":
                last_state = payload
            elif kind == "finished" and run_started:
                # the run is over: add its chunks to the total and allow the next run
                completed_before += list(engine.chunk_states.values()).count("done")
                run_started = False
            changed = changed or kind in ("state", "finished")
        if changed:
            await broadcast(state_msg())
            await broadcast(progress_msg())
            for chunk, state in list(engine.chunk_states.items()):
                if state == "in_progress":
                    await broadcast({
                        "type": "chunk_progress",
                        "project_id": PROJECT_ID,
                        "chunk": chunk,
                        "percent": engine.chunk_percents[chunk],
                    })
        await asyncio.sleep(0.2)


@app.on_event("startup")
async def start_forwarding() -> None:
    # only forwards updates; the coordinator itself waits for a "request"
    asyncio.create_task(forward_coordinator_events())
    # Worker countries from start_workers.sh (e.g. "BE,BE,SE,..."), so they show before the run.
    # When the run starts, each worker reports its country itself, which takes over.
    countries = os.environ.get("WORKER_COUNTRIES", "").split(",")
    for slot, country in zip(engine.workers.values(), countries):
        if country.strip():
            slot.country = country.strip().upper()
    engine.emit_state()  # so the page can show the workers before the run starts


async def start_run() -> bool:
    global run_started
    if run_started:
        return False
    run_started = True
    engine.start()
    return True

@app.websocket("/ws")
async def watch(ws: WebSocket):
    await ws.accept()
    node_id = uuid.uuid4().hex[:6]
    clients[node_id] = ws
    await ws.send_json({
        "type": "welcome",
        "node_id": node_id,
        "projects": [{"id": PROJECT_ID, "name": PROJECT_NAME, "percent": percent()}],
    })
    await ws.send_json(progress_msg())
    await ws.send_json(state_msg())
    for entry in logs:
        await ws.send_json({"type": "log", **entry})
    try:
        while True:
            try:
                msg = await ws.receive_json()
            except ValueError:  # not valid JSON
                continue
            if msg.get("type") == "request":
                await start_run()
            elif msg.get("type") == "speed":
                engine.set_country_speed(str(msg.get("country", "")), str(msg.get("mode", "")))
    except WebSocketDisconnect:
        pass
    finally:
        del clients[node_id]
