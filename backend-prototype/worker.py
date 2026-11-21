import argparse
import csv
import json
import re
import socket
import time
from pathlib import Path

STEP_DELAYS = {
    "L": 0.9,
    "M": 0.6,
    "H": 0.3,
}

PROJECT_ID = "wildfire"


def extract_chunk_number(chunk_name: str) -> int:
    match = re.search(r"(\d+)", chunk_name)
    if not match:
        raise ValueError(f"Could not extract numeric chunk ID from '{chunk_name}'")
    return int(match.group(1))


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


def load_rows_from_chunk(chunk_path: Path) -> list[tuple[float, str, float]]:
    rows: list[tuple[float, str, float]] = []
    with chunk_path.open(mode="r", newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader, None)
        if header is not None:
            try:
                rows.append((float(header[0]), str(header[1]), float(header[2])))
            except (ValueError, IndexError):
                pass

        for row in reader:
            if not row:
                continue
            rows.append((float(row[0]), str(row[1]), float(row[2])))
    return rows


def prompt_country_code() -> str:
    while True:
        code = input("Enter worker country code (e.g., BE, NL, DE, FR): ").strip().upper()
        if code:
            return code
        print("Country code cannot be empty.")


def run_worker(worker_name: str, country: str, host: str, port: int) -> None:
    country = country.strip().upper()
    current_mode = "M"
    current_step_delay = STEP_DELAYS[current_mode]

    print(
        f"Program 2 ({worker_name} [{country}]): listening on {host}:{port} "
        f"(default speed M = {current_step_delay:.1f}s per calculation)..."
    )

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind((host, port))
        server.listen(1)

        while True:
            conn, addr = server.accept()
            with conn:
                print(f"Program 2 ({worker_name} [{country}]): connected to Program 1 at {addr}")

                # Announce worker identity & country to coordinator
                hello_msg = (
                    json.dumps({
                        "type": "hello",
                        "worker": worker_name,
                        "country": country,
                    })
                    + "\n"
                ).encode("utf-8")
                conn.sendall(hello_msg)

                buffer = ""
                while True:
                    chunk = conn.recv(4096)
                    if not chunk:
                        print(
                            f"Program 2 ({worker_name} [{country}]): "
                            "Program 1 disconnected; waiting for next connection..."
                        )
                        break

                    buffer += chunk.decode("utf-8")
                    while "\n" in buffer:
                        raw_msg, buffer = buffer.split("\n", 1)
                        msg = json.loads(raw_msg)
                        msg_type = msg.get("type")

                        if msg_type == "speed":
                            mode = str(msg.get("mode", "")).upper()
                            if mode in STEP_DELAYS:
                                current_mode = mode
                                current_step_delay = STEP_DELAYS[mode]
                                print(
                                    f"Program 2 ({worker_name} [{country}]): speed set to {current_mode} "
                                    f"({current_step_delay:.1f}s per calculation)."
                                )

                        elif msg_type == "chunk":
                            chunk_name = msg["chunk_name"]
                            chunk_path = Path(msg["chunk_path"])
                            chunk_num = extract_chunk_number(chunk_name)
                            rows = load_rows_from_chunk(chunk_path)
                            total_rows = len(rows)

                            print(
                                f"Program 2 ({worker_name} [{country}]): working on '{chunk_name}' "
                                f"(chunk #{chunk_num}, {total_rows} calculations)..."
                            )

                            solutions: list[float] = []
                            for idx, (left, op, right) in enumerate(rows, start=1):
                                if idx > 1:
                                    time.sleep(current_step_delay)

                                sol = evaluate_row(left, op, right)
                                solutions.append(sol)

                                percent = round((idx / total_rows) * 100) if total_rows > 0 else 100
                                progress_msg = (
                                    json.dumps({
                                        "type": "chunk_progress",
                                        "project_id": PROJECT_ID,
                                        "chunk": chunk_num,
                                        "percent": percent,
                                    })
                                    + "\n"
                                )
                                conn.sendall(progress_msg.encode("utf-8"))
                                print(
                                    f"Program 2 ({worker_name} [{country}]): chunk #{chunk_num} "
                                    f"at {percent}% ({idx}/{total_rows})"
                                )

                            print(
                                f"Program 2 ({worker_name} [{country}]): finished '{chunk_name}'; "
                                f"sending {len(solutions)} solutions back."
                            )
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
                            print(f"Program 2 ({worker_name} [{country}]): received shutdown signal.")
                            return


def main() -> None:
    parser = argparse.ArgumentParser(description="Math chunk worker")
    parser.add_argument("--name", default="worker-1", help="Worker label")
    parser.add_argument("--country", default=None, help="Country code (e.g., BE, NL, DE)")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host")
    parser.add_argument("--port", type=int, default=5051, help="Bind port")
    args = parser.parse_args()

    country = args.country if args.country else prompt_country_code()
    run_worker(args.name, country, args.host, args.port)


if __name__ == "__main__":
    main()