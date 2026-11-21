"""Runs coordinator.py + worker.py on chunks/ and reports the run over WebSocket
with the welcome / progress / error messages from ../ws_data.txt.

Run from this folder:
    pip install fastapi "uvicorn[standard]"
    python3 -m uvicorn api:app --port 8000

On startup it launches one worker.py per entry in coordinator.WORKER_ENDPOINTS and starts the
coordinator run. Watchers connect to ws://localhost:8000/ws to follow the progress.
"""
import asyncio
import queue
import subprocess
import sys
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from coordinator import WORKER_ENDPOINTS, CoordinatorEngine

HERE = Path(__file__).parent
PROJECT_ID, PROJECT_NAME = "math", "Math chunks"

events: queue.Queue = queue.Queue()
engine = CoordinatorEngine(events, chunks_dir=HERE / "chunks")
clients: dict[str, WebSocket] = {}  # node_id -> connection
workers: list[subprocess.Popen] = []

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
        }],
        # donating nodes = coordinator workers that are currently connected
        "nodes_online": sum(w.status in ("idle", "busy") for w in engine.workers.values()),
    }


async def broadcast(msg: dict) -> None:
    for ws in list(clients.values()):
        try:
            await ws.send_json(msg)
        except Exception:
            pass


async def forward_coordinator_events() -> None:
    """The coordinator reports changes on a queue; send progress whenever its state changes."""
    while True:
        changed = False
        while not events.empty():
            kind, _ = events.get()
            changed = changed or kind in ("state", "finished")
        if changed:
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
async def start_run() -> None:
    for name, host, port in WORKER_ENDPOINTS:
        workers.append(subprocess.Popen([sys.executable, str(HERE / "worker.py"), "--name", name, "--host", host, "--port", str(port)]))
    time.sleep(1)  # give the workers a moment to start listening before the coordinator connects
    engine.start()
    asyncio.create_task(forward_coordinator_events())


@app.on_event("shutdown")
def stop_workers() -> None:
    for w in workers:
        w.terminate()


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
    try:
        while True:
            await ws.receive_text()
            await ws.send_json({"type": "error", "message": "this server only sends progress; the coordinator assigns the work"})
    except WebSocketDisconnect:
        pass
    finally:
        del clients[node_id]
