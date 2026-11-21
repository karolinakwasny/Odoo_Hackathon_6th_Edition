#!/bin/bash
# Starts the three workers that coordinator.py expects (WORKER_ENDPOINTS).
# Run from anywhere:  ./backend-prototype/start_workers.sh
# Press Ctrl+C to stop all of them.

# cd "$(dirname "$0")"

# python3 worker.py --name Worker-1 --country DE --port 5051 &
# python3 worker.py --name Worker-2 --country NL --port 5052 &
# python3 worker.py --name Worker-3 --country FR --port 5053 &

# wait

# trap 'kill $(jobs -p) 2>/dev/null' INT TERM EXIT



cd "$(dirname "$0")"
PY=/Library/Frameworks/Python.framework/Versions/3.13/bin/python3   # always 3.13, even with (.venv)

$PY worker.py --name Worker-1 --country DE --port 5051 &
$PY worker.py --name Worker-2 --country NL --port 5052 &
$PY worker.py --name Worker-3 --country FR --port 5053 &
sleep 1   # let the workers start listening

$PY -c 'import asyncio, json, websockets
async def go():
    async with websockets.connect("ws://localhost:8000/ws") as ws:
        await ws.send(json.dumps({"type": "request", "project_id": "math"}))
asyncio.run(go())' && echo "Run started."

trap 'kill $(jobs -p) 2>/dev/null' INT TERM EXIT
wait