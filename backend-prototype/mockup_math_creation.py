import csv
import random
import shutil
from pathlib import Path

OPERATORS = ("+", "-", "*", "/")
CHUNKS_DIR = Path("chunks")


def prompt_positive_int(prompt_text: str, allow_zero: bool = False) -> int:
    while True:
        raw = input(prompt_text).strip()
        try:
            val = int(raw)
            if allow_zero and val >= 0:
                return val
            if not allow_zero and val > 0:
                return val
            print("Please enter a valid integer.")
        except ValueError:
            print("Invalid input. Please enter a whole number.")


def generate_chunk_files(
    total_lines: int,
    chunk_size: int,
    chunks_dir: Path = CHUNKS_DIR,
    min_val: int = 1,
    max_val: int = 1000,
    seed: int | None = None,
) -> list[Path]:
    if seed is not None:
        random.seed(seed)

    if chunks_dir.exists():
        shutil.rmtree(chunks_dir)
    chunks_dir.mkdir(parents=True, exist_ok=True)

    created_files: list[Path] = []
    chunk_index = 1
    rows_written_in_chunk = 0
    current_file = None
    current_writer = None

    def open_next_chunk(idx: int):
        path = chunks_dir / f"chunk_{idx:04d}.csv"
        f = path.open(mode="w", newline="", encoding="utf-8")
        writer = csv.writer(f)
        writer.writerow(["left_operand", "operator", "right_operand"])
        created_files.append(path)
        return path, f, writer

    try:
        if total_lines > 0:
            _, current_file, current_writer = open_next_chunk(chunk_index)

        for _ in range(total_lines):
            if rows_written_in_chunk == chunk_size:
                current_file.close()
                chunk_index += 1
                rows_written_in_chunk = 0
                _, current_file, current_writer = open_next_chunk(chunk_index)

            left = random.randint(min_val, max_val)
            op = random.choice(OPERATORS)
            right = random.randint(max(1, min_val), max_val) if op == "/" else random.randint(min_val, max_val)

            current_writer.writerow([left, op, right])
            rows_written_in_chunk += 1
    finally:
        if current_file is not None and not current_file.closed:
            current_file.close()

    return created_files


def main() -> None:
    total_lines = prompt_positive_int("Total number of math operation lines to generate: ", allow_zero=True)
    chunk_size = prompt_positive_int("Lines per chunk CSV file: ", allow_zero=False)

    files = generate_chunk_files(total_lines=total_lines, chunk_size=chunk_size)
    print(f"Created {len(files)} chunk file(s) in '{CHUNKS_DIR.resolve()}'.")


if __name__ == "__main__":
    main()