#!/usr/bin/env python3
"""Extract per-subject accuracy from population JSON log (last epoch)."""
import json
import os
import re
import statistics
import sys
from pathlib import Path

SUB_RE = re.compile(r"/(\d{3})_test_acc1$")


def last_json(path: Path):
    last = None
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                last = json.loads(line)
            except json.JSONDecodeError:
                continue
    return last


def extract_per_subject(flat: dict):
    rows = []
    whole = None
    for k, v in flat.items():
        if k.endswith("/test_whole_acc1"):
            whole = float(v)
            continue
        m = SUB_RE.search(k.replace("\\", "/"))
        if m:
            rows.append((m.group(1), float(v)))
    rows.sort(key=lambda x: x[0])
    return whole, rows


def find_pop_log(root: Path):
    candidates = []
    for dirpath, _, filenames in os.walk(root):
        if "population_sub-all" not in dirpath:
            continue
        for name in filenames:
            if name.startswith("log_") and name.endswith("_training"):
                candidates.append(Path(dirpath) / name)
    if not candidates:
        return None
    return max(candidates, key=lambda p: p.stat().st_mtime)


def main():
    if len(sys.argv) < 2:
        print("Usage: extract_population_per_subject.py <log_root_or_log_file>")
        sys.exit(1)
    arg = Path(sys.argv[1]).expanduser()
    log = arg if arg.is_file() else find_pop_log(arg)
    if log is None or not log.is_file():
        print(f"No population training log under {arg}")
        sys.exit(1)

    flat = last_json(log)
    if not flat:
        print(f"Empty log: {log}")
        sys.exit(1)

    whole, rows = extract_per_subject(flat)
    print(f"log: {log}")
    print(f"subjects: {len(rows)}")
    if whole is not None:
        vals = [v for _, v in rows]
        print(f"test_whole_acc1: {whole:.4f}")
        if vals:
            print(f"mean(per-subject keys): {statistics.mean(vals):.4f}")
    print("subject,acc_pct")
    for sid, acc in rows:
        print(f"{sid},{acc:.4f}")


if __name__ == "__main__":
    main()
