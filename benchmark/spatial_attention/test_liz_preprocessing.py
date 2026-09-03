#!/usr/bin/env python3
"""Quick LDA benchmark for Liz's preprocessing ideas on spatial attention .pkl files.

Compares per-subject test accuracy (train/test split already in each .pkl):
  - baseline: bandpass + CSP + LDA
  - + Euclidean Alignment (fit on train only)
  - + Laplacian (MNE CSD)
  - + amplitude artifact rejection

Run on mnode (example):
  python3 benchmark/spatial_attention/test_liz_preprocessing.py \\
    --data-dir ~/data/g2_transfer/spatial_attention_v2

Dependencies (once): pip install pyriemann mne scikit-learn
"""

from __future__ import annotations

import argparse
import pickle
import sys
from pathlib import Path

import numpy as np
from mne.decoding import CSP
from mne.filter import filter_data
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.metrics import accuracy_score
from sklearn.pipeline import Pipeline

# Allow running as script from repo root or this folder
_HERE = Path(__file__).resolve().parent
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))

from euclidean_alignment import EuclideanAlignment  # noqa: E402
from preprocessing_liz import LaplacianCSD, reject_amplitude_trials  # noqa: E402

HARD_SUBJECTS = ["004", "019", "020", "031", "046", "015"]
DEFAULT_DATA_DIR = Path.home() / "data/g2_transfer/spatial_attention_v2"


def bandpass_trials(X: np.ndarray, fs: float) -> np.ndarray:
    return np.stack(
        [
            filter_data(
                trial,
                sfreq=fs,
                l_freq=0.1,
                h_freq=40.0,
                method="iir",
                iir_params=dict(order=3, ftype="butter"),
                verbose=False,
            )
            for trial in X
        ],
        axis=0,
    )


def eval_subject(
    train_x: np.ndarray,
    train_y: np.ndarray,
    test_x: np.ndarray,
    test_y: np.ndarray,
    *,
    fs: float,
    use_ea: bool,
    use_laplacian: bool,
    use_artifact_reject: bool,
    reject_peak_uv: float,
) -> dict:
    train_x = np.asarray(train_x, dtype=np.float64)
    test_x = np.asarray(test_x, dtype=np.float64)
    train_y = np.asarray(train_y)
    test_y = np.asarray(test_y)

    n_rej = 0
    if use_artifact_reject:
        train_x, train_y, n_rej_tr = reject_amplitude_trials(
            train_x, train_y, peak_uv=reject_peak_uv
        )
        test_x, test_y, n_rej_te = reject_amplitude_trials(
            test_x, test_y, peak_uv=reject_peak_uv
        )
        n_rej = n_rej_tr + n_rej_te

    if train_x.shape[0] < 4 or test_x.shape[0] < 2:
        return {"acc": float("nan"), "n_train": train_x.shape[0], "n_test": test_x.shape[0], "n_rejected": n_rej}

    train_x = bandpass_trials(train_x, fs)
    test_x = bandpass_trials(test_x, fs)

    steps = []
    if use_ea:
        steps.append(("ea", EuclideanAlignment(estimator="lwf")))
    if use_laplacian:
        steps.append(("laplacian", LaplacianCSD(sfreq=fs)))
    steps.extend(
        [
            ("csp", CSP(n_components=4, reg="oas")),
            ("lda", LinearDiscriminantAnalysis()),
        ]
    )
    pipe = Pipeline(steps)
    pipe.fit(train_x, train_y)
    pred = pipe.predict(test_x)
    acc = accuracy_score(test_y, pred) * 100.0
    return {
        "acc": acc,
        "n_train": int(train_x.shape[0]),
        "n_test": int(test_x.shape[0]),
        "n_rejected": n_rej,
    }


def load_pkl(path: Path) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    with open(path, "rb") as f:
        d = pickle.load(f)
    return d["trainX"], d["trainY"], d["testX"], d["testY"]


def subject_id_from_name(name: str) -> str:
    # sub-004.pkl -> 004
    stem = Path(name).stem
    if stem.startswith("sub-"):
        return stem.replace("sub-", "")
    return stem


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--data-dir", type=Path, default=DEFAULT_DATA_DIR)
    p.add_argument("--fs", type=float, default=256.0)
    p.add_argument("--only-hard", action="store_true", help="Only hard subjects from Liz debrief")
    p.add_argument("--reject-peak-uv", type=float, default=150.0, help="Artifact peak threshold (µV)")
    args = p.parse_args()

    data_dir = args.data_dir.expanduser()
    if not data_dir.is_dir():
        raise SystemExit(f"Data dir not found: {data_dir}")

    pkls = sorted(data_dir.glob("*.pkl"))
    if not pkls:
        raise SystemExit(f"No .pkl in {data_dir}")

    configs = [
        ("baseline", dict(use_ea=False, use_laplacian=False, use_artifact_reject=False)),
        ("+ EA", dict(use_ea=True, use_laplacian=False, use_artifact_reject=False)),
        ("+ Laplacian", dict(use_ea=False, use_laplacian=True, use_artifact_reject=False)),
        ("+ artifacts", dict(use_ea=False, use_laplacian=False, use_artifact_reject=True)),
        ("+ EA + artifacts", dict(use_ea=True, use_laplacian=False, use_artifact_reject=True)),
    ]

    rows = []
    for pkl in pkls:
        sid = subject_id_from_name(pkl.name)
        if args.only_hard and sid not in HARD_SUBJECTS:
            continue
        train_x, train_y, test_x, test_y = load_pkl(pkl)
        for label, kw in configs:
            try:
                res = eval_subject(
                    train_x,
                    train_y,
                    test_x,
                    test_y,
                    fs=args.fs,
                    reject_peak_uv=args.reject_peak_uv,
                    **kw,
                )
            except Exception as exc:  # noqa: BLE001 — report and continue other subjects
                res = {"acc": float("nan"), "error": str(exc)}
            rows.append({"subject": sid, "config": label, **res})

    # Print table
    n_subjects = len({r["subject"] for r in rows}) if rows else 0
    print(f"data_dir: {data_dir}")
    print(f"subjects: {n_subjects}")
    print()

    by_config: dict[str, list[float]] = {}
    for r in rows:
        if "error" in r:
            print(f"  {r['subject']} {r['config']}: ERROR {r['error']}")
            continue
        acc = r["acc"]
        if np.isnan(acc):
            continue
        by_config.setdefault(r["config"], []).append(acc)
        extra = ""
        if r.get("n_rejected"):
            extra = f" (rejected {r['n_rejected']} trials)"
        print(f"  sub-{r['subject']} {r['config']:16s} acc={acc:6.2f}%{extra}")

    print()
    for label, _ in configs:
        accs = by_config.get(label, [])
        if not accs:
            continue
        print(
            f"MEAN {label:16s}: {np.mean(accs):.2f}% ± {np.std(accs):.2f}%  (n={len(accs)} subjects)"
        )


if __name__ == "__main__":
    main()
