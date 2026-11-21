import argparse
import csv
import json
import socket
import time
from pathlib import Path

SPEED_DELAYS = {
    "L": 3.0,
    "M": 2.0,
    "H": 1.0,
}


def evaluate_row(left: float, op: str, right: float) -> float:
    if op == "+":
        return left + right
    if op == "-":
        return left - right
    if op == "*":
        return left * right
    if op == "/":
        if right == 0:
            raise ZeroDivisionError("Division by zero in input row")
        return left / right
    raise ValueError(f"Unsupported operator: {op}")


def evaluate_chunk_file(chunk_path: Path) -> list[float]:
    solutions: list[float] = []
    with chunk_path.open(mode="r", newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader, None)
        if header is not None:
            try:
                float(header[0])
                solutions.append(evaluate_row(float(header[0]), str(header[1]), float(header[2])))
            except (ValueError, IndexError):
                pass

        for row in reader:
            if not row:
                continue
            solutions.append(evaluate_row(float(row[0]), str(row[1]), float(row[2])))
    return solutions


def run_worker(worker_name: str, host: str, port: int) -> None:
    current_mode = "M"
    current_delay = SPEED_DELAYS[current_mode]

    print(f"Program 2 ({worker_name}): listening on {host}:{port} (default speed M = {current_delay:.1f}s)...")

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind((host, port))
        server.listen(1)

        while True:
            conn, addr = server.accept()
            with conn:
                print(f"Program 2 ({worker_name}): connected to Program 1 at {addr}")
                buffer = ""

                while True:
                    chunk = conn.recv(4096)
                    if not chunk:
                        print(f"Program 2 ({worker_name}): Program 1 disconnected; waiting for next connection...")
                        break

                    buffer += chunk.decode("utf-8")
                    while "\n" in buffer:
                        raw_msg, buffer = buffer.split("\n", 1)
                        msg = json.loads(raw_msg)
                        msg_type = msg.get("type")

                        if msg_type == "speed":
                            mode = str(msg.get("mode", "")).upper()
                            if mode in SPEED_DELAYS:
                                current_mode = mode
                                current_delay = SPEED_DELAYS[mode]
                                print(
                                    f"Program 2 ({worker_name}): speed set to {current_mode} "
                                    f"({current_delay:.1f}s for upcoming chunks)."
                                )

                        elif msg_type == "chunk":
                            chunk_name = msg["chunk_name"]
                            chunk_path = Path(msg["chunk_path"])
                            print(f"Program 2 ({worker_name}): working on '{chunk_name}'...")

                            solutions = evaluate_chunk_file(chunk_path)

                            print(
                                f"Program 2 ({worker_name}): finished calculating '{chunk_name}'; "
                                f"pausing {current_delay:.1f}s (mode {current_mode}) before sending..."
                            )
                            time.sleep(current_delay)

                            print(f"Program 2 ({worker_name}): sending {len(solutions)} solutions for '{chunk_name}'.")
                            response = (
                                json.dumps({
                                    "type": "results",
                                    "chunk_name": chunk_name,
                                    "solutions": solutions,
                                })
                                + "\n"
                            )
                            conn.sendall(response.encode("utf-8"))

                        elif msg_type == "shutdown":
                            print(f"Program 2 ({worker_name}): received shutdown signal.")
                            return


def main() -> None:
    parser = argparse.ArgumentParser(description="Math chunk worker")
    parser.add_argument("--name", default="worker-1", help="Worker label")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host")
    parser.add_argument("--port", type=int, default=5051, help="Bind port")
    args = parser.parse_args()
    run_worker(args.name, args.host, args.port)


if __name__ == "__main__":
    main()