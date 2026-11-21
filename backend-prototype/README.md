# Backend prototype

The backend has two separate parts:

1. **Computing:** `coordinator.py` hands the chunks in `chunks/` to the `worker.py` processes over TCP, exactly as in the original prototype.
2. **Reporting:** a WebSocket server sends the progress of that run to anyone connected, using the
   `welcome`, `progress` and `error` messages defined in `../ws_data.txt`.

| File | What it is |
|---|---|
| `api.py` | **New.** Starts the workers and the coordinator run, and serves the WebSocket at `/ws`. |
| `coordinator.py` | Distributes the chunks (`CoordinatorEngine`). **Unchanged.** `api.py` uses its engine; the Tkinter window isn't opened. |
| `worker.py` | Computes one chunk and returns the solutions. **Unchanged.** `api.py` starts one per entry in `WORKER_ENDPOINTS` (2 workers, ports 5051 and 5052). |
| `chunks/` | The 17 chunk CSVs that get computed. **Unchanged.** Together they form one project, `math` ("Math chunks"). |
| `mockup_math_creation.py` | Generates new chunk CSVs. **Unchanged.** Not used by `api.py`; run it by hand to make a new chunk set. |

## Running it

```bash
pip install fastapi "uvicorn[standard]"
```

```bash
cd backend-prototype && python3 -m uvicorn api:app --port 8000
```

As soon as the server starts, it launches the workers and the coordinator starts computing the chunks.
Connect to `ws://localhost:8000/ws` to follow the progress. To compute everything again, restart the server.
Stopping the server also stops the workers.

## WebSocket messages

Only these messages from `ws_data.txt` are used:

**`welcome`**: sent once when a client connects. `node_id` is a random 6-character ID for that connection.
```json
{"type": "welcome", "node_id": "a65062", "projects": [{"id": "math", "name": "Math chunks", "percent": 0.0}]}
```

**`progress`**: sent right after `welcome`, then to every connected client each time the coordinator's state changes
(a chunk is assigned or finished, a worker connects or disconnects).
```json
{"type": "progress", "projects": [{"id": "math", "done": 4, "running": 2, "total": 17, "percent": 23.5}], "nodes_online": 2}
```
- `done` / `running` / `total` are the coordinator's chunk states (`done`, `in_progress`, all chunks).
- `nodes_online` is the number of coordinator workers that are currently connected (status `idle` or `busy`). It drops to 0 when the run finishes, because the coordinator then disconnects from the workers.

**`error`**: the reply to anything a client sends. In this setup the coordinator assigns the work,
so the client-side messages (`request`, `result`, `pause`, `chunk_progress`) aren't used.
```json
{"type": "error", "message": "this server only sends progress; the coordinator assigns the work"}
```

`work`, `no_work`, `ack` and the client-side messages aren't used.

## Example client

```python
import asyncio, json, websockets

async def main():
    async with websockets.connect("ws://localhost:8000/ws") as ws:
        async for raw in ws:
            print(json.loads(raw))

asyncio.run(main())
```

## Not covered

- The results the coordinator collects (`engine.results`) aren't sent anywhere, because `ws_data.txt` has no message for them.
- There's no way to start, pause or restart a run from a client. The run starts when the server starts.
- The frontend (`../compute-commons-admin/`) is unchanged and not connected. It could connect to `/ws` and show the `progress` messages.
