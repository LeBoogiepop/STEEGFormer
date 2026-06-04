#!/usr/bin/env python3
"""Prepare BCI Competition IV-2a subject .pkl files for ST-EEGFormer benchmark.

Output format per subject matches `BCI2aDataset` expectation:
{
  "trainX": np.ndarray [N_train, C, T],
  "trainY": List[str],
  "testX":  np.ndarray [N_test, C, T],
  "testY":  List[str],
}
"""

from __future__ import annotations

import argparse
import os
import pickle
import time
from pathlib import Path

import numpy as np
from moabb.datasets import BNCI2014_001
from moabb.paradigms import MotorImagery
from requests.exceptions import ConnectionError as RequestsConnectionError


EXPECTED_LABELS = {"left_hand", "right_hand", "feet", "tongue"}


def _fix_time_len(x: np.ndarray, target_t: int) -> np.ndarray:
    """Crop or right-pad time axis to target_t."""
    if x.shape[-1] == target_t:
        return x
    if x.shape[-1] > target_t:
        return x[..., :target_t]
    pad = target_t - x.shape[-1]
    return np.pad(x, ((0, 0), (0, 0), (0, pad)), mode="edge")


def convert_subject(
    dataset: BNCI2014_001,
    paradigm: MotorImagery,
    subject_id: int,
    out_dir: Path,
    target_t: int,
    max_retries: int,
    retry_sleep_s: int,
) -> None:
    out_path = out_dir / f"A{subject_id:02d}.pkl"
    if out_path.exists():
        print(f"Skip A{subject_id:02d}.pkl (already exists).", flush=True)
        return

    last_err = None
    x = y = meta = None
    for attempt in range(1, max_retries + 1):
        try:
            x, y, meta = paradigm.get_data(dataset=dataset, subjects=[subject_id])
            break
        except (TimeoutError, RequestsConnectionError) as err:
            last_err = err
            print(
                f"Subject {subject_id}: download/read timeout (attempt {attempt}/{max_retries}).",
                flush=True,
            )
            if attempt < max_retries:
                time.sleep(retry_sleep_s)
    if x is None or y is None or meta is None:
        raise RuntimeError(
            f"Subject {subject_id}: failed after {max_retries} attempts: {last_err}"
        )
    sessions = meta["session"].astype(str).to_numpy()
    y = np.asarray(y).astype(str)

    train_mask = sessions == "0train"
    test_mask = sessions == "1test"
    if not train_mask.any() or not test_mask.any():
        raise RuntimeError(
            f"Subject {subject_id}: missing train/test split in session metadata."
        )

    train_x = _fix_time_len(x[train_mask], target_t).astype(np.float32)
    test_x = _fix_time_len(x[test_mask], target_t).astype(np.float32)
    train_y = y[train_mask].tolist()
    test_y = y[test_mask].tolist()

    labels_here = set(train_y) | set(test_y)
    if labels_here - EXPECTED_LABELS:
        raise RuntimeError(
            f"Subject {subject_id}: unexpected labels found: {sorted(labels_here)}"
        )

    out = {
        "trainX": train_x,
        "trainY": train_y,
        "testX": test_x,
        "testY": test_y,
    }
    with out_path.open("wb") as f:
        pickle.dump(out, f, protocol=pickle.HIGHEST_PROTOCOL)

    print(
        f"Saved {out_path.name}: train={train_x.shape}, test={test_x.shape}, "
        f"labels={sorted(labels_here)}",
        flush=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output_dir",
        type=Path,
        default=Path(
            "/Users/boogiepop/Desktop/STAGE ISHI/data/benchmark_preprocessed_datasets/bci_iv2a"
        ),
    )
    parser.add_argument(
        "--subjects",
        type=int,
        nargs="*",
        default=list(range(1, 10)),
        help="Subject IDs to export (default: 1..9).",
    )
    parser.add_argument(
        "--fs",
        type=int,
        default=256,
        help="Resample rate used by benchmark config.",
    )
    parser.add_argument(
        "--task_time",
        type=float,
        default=4.0,
        help="Window duration in seconds used by benchmark config.",
    )
    parser.add_argument(
        "--moabb_data_root",
        type=Path,
        default=Path("/Users/boogiepop/Desktop/STAGE ISHI/data/moabb"),
        help="Where MOABB downloads raw BNCI data.",
    )
    parser.add_argument(
        "--max_retries",
        type=int,
        default=5,
        help="Retries per subject when download times out.",
    )
    parser.add_argument(
        "--retry_sleep_s",
        type=int,
        default=20,
        help="Sleep between retries in seconds.",
    )
    args = parser.parse_args()

    args.output_dir.mkdir(parents=True, exist_ok=True)
    args.moabb_data_root.mkdir(parents=True, exist_ok=True)
    os.environ["MOABB_DATASETS_PATH"] = str(args.moabb_data_root)

    target_t = int(args.fs * args.task_time)
    dataset = BNCI2014_001()
    paradigm = MotorImagery(
        n_classes=4,
        fmin=0.5,
        fmax=45.0,
        tmin=0.0,
        tmax=args.task_time,
        resample=args.fs,
    )

    for sid in args.subjects:
        convert_subject(
            dataset,
            paradigm,
            sid,
            args.output_dir,
            target_t,
            max_retries=args.max_retries,
            retry_sleep_s=args.retry_sleep_s,
        )

    print(f"Done. Wrote subject files to: {args.output_dir}", flush=True)


if __name__ == "__main__":
    main()
