#!/usr/bin/env bash
# Starts the backend (api.py) and the 10 workers in this one terminal tab.
# The coordinator then waits: start the run with "Start run" on the Coordinator page
# of the admin app (or anything that sends {"type": "request", "project_id": "math"}).
# Press Ctrl+C to stop everything.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Prefer Python 3.13 (coordinator.py needs 3.10+, and it works even with a (.venv) active),
# then python3, falling back to python
if [[ -x /Library/Frameworks/Python.framework/Versions/3.13/bin/python3 ]]; then
    PYTHON_EXE="/Library/Frameworks/Python.framework/Versions/3.13/bin/python3"
elif command -v python3 >/dev/null 2>&1; then
    PYTHON_EXE="python3"
else
    PYTHON_EXE="python"
fi

# 10 entries matching Worker-1 .. Worker-10.
# Leave an entry empty ("") to be prompted for that worker's country in this tab.
COUNTRIES=("BE" "BE" "BE" "SE" "SE" "SE" "HU" "SE" "HU" "HU")

# Ctrl+C (or closing the tab) stops the backend and all workers
trap 'kill $(jobs -p) 2>/dev/null' INT TERM EXIT

# 1st: the backend. It waits for a "request" before it starts the coordinator.
# WORKER_COUNTRIES tells it the workers' countries up front, so the page shows them before the run.
WORKER_COUNTRIES="$(IFS=,; echo "${COUNTRIES[*]}")" "$PYTHON_EXE" -m uvicorn api:app --port 8000 --timeout-graceful-shutdown 2 &
sleep 2

# Then the 10 workers
for i in $(seq 1 10); do
    port=$((5050 + i))
    worker_name="Worker-$i"
    country="${COUNTRIES[$((i - 1))]}"

    if [[ -z "${country// }" ]]; then
        "$PYTHON_EXE" worker.py --name "$worker_name" --port "$port" &
    else
        "$PYTHON_EXE" worker.py --name "$worker_name" --country "$country" --port "$port" &
    fi
    sleep 0.15
done

echo "Backend and 10 workers started. Click \"Start run\" on the Coordinator page to begin. Ctrl+C stops everything."
wait
