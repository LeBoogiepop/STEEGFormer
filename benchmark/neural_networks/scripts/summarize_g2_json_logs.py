#!/usr/bin/env python3
"""
Aggregate final test accuracy from offline JSON logs (W&B disabled path).

Looks under --log-root for subfolders (e.g. population_sub-all_9/fold0/log_*),
reads the last non-empty JSON line per log file, and picks test_whole_acc1
preferring the *finetune* stage when both train and finetune logs exist.

Example:
  python summarize_g2_json_logs.py --log-root "C:/.../outputs/g2_full_leave-one-out-finetuning"
"""
from __future__ import annotations

import argparse
import json
import os
import re
import statistics
from typing import Any, Dict, List, Optional, Tuple


def _last_json_line(path: str) -> Optional[Dict[str, Any]]:
    last: Optional[Dict[str, Any]] = None
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                last = json.loads(line)
            except json.JSONDecodeError:
                continue
    return last


def _acc_from_flat(flat: Dict[str, Any]) -> Optional[float]:
    for key in sorted(flat.keys()):
        if key.endswith("/test_whole_acc1"):
            try:
                return float(flat[key])
            except (TypeError, ValueError):
                return None
    return None


def collect_run_accs(group_dir: str) -> List[float]:
    """Return 0 or 1 accuracy for a run group (e.g. population_sub-all_9 or leave_out_sub-A01).

    Walks the group dir for ``log_*`` files. Stage is identified by the filename
    suffix (``_finetune`` vs ``_training``); the finetune-stage log is preferred
    when present (LOO Fine-Tune), otherwise the training-stage log is used.
    """
    if not os.path.isdir(group_dir):
        return []
    files: List[str] = []
    for cur_root, _dirs, names in os.walk(group_dir):
        for name in names:
            if name.startswith("log_"):
                files.append(os.path.join(cur_root, name))
    finetune_logs = [f for f in files if f.endswith("_finetune")]
    training_logs = [f for f in files if f.endswith("_training")]
    if finetune_logs:
        chosen = sorted(finetune_logs)[-1:]
    elif training_logs:
        chosen = sorted(training_logs)[-1:]
    else:
        chosen = sorted(files)[-1:]
    out: List[float] = []
    for path in chosen:
        flat = _last_json_line(path)
        if not flat:
            continue
        acc = _acc_from_flat(flat)
        if acc is not None:
            out.append(acc)
    return out


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument(
        "--log-root",
        required=True,
        help="e.g. .../outputs/g2_full_population (contains group subdirs)",
    )
    args = p.parse_args()
    root = args.log_root
    if not os.path.isdir(root):
        raise SystemExit(f"Not a directory: {root}")

    values: List[float] = []
    rows: List[Tuple[str, float]] = []
    for entry in sorted(os.listdir(root)):
        sub = os.path.join(root, entry)
        if not os.path.isdir(sub):
            continue
        # only subject-like protocol folders
        if not re.match(r"(population_|leave_out_|per_subject_)", entry):
            continue
        run_accs = collect_run_accs(sub)
        if not run_accs:
            print(f"{entry}: (no json metrics yet)")
            continue
        v = run_accs[0]
        values.append(v)
        rows.append((entry, v))

    print(f"log_root: {root}")
    print(f"runs with metrics: {len(values)}")
    for name, v in rows:
        print(f"  {name}: acc1_whole = {v:.4f}")
    if values:
        m = statistics.mean(values)
        s = statistics.stdev(values) if len(values) > 1 else 0.0
        print(f"mean +/- std (acc1, whole test): {m:.4f} +/- {s:.4f}")


if __name__ == "__main__":
    main()
