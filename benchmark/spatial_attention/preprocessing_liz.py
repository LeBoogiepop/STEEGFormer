"""Preprocessing helpers for Liz's suggestions (EA, Laplacian/CSD, artifact rejection)."""

from __future__ import annotations

from typing import Tuple

import mne
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin

# 64-channel montage used in spatial_attention_v2 (BioSemi / ViT layout)
CH_NAMES_64 = [
    "Fp1", "AF7", "AF3", "F1", "F3", "F5", "F7", "FT7", "FC5", "FC3", "FC1",
    "C1", "C3", "C5", "T7", "TP7", "CP5", "CP3", "CP1", "P1", "P3", "P5", "P7",
    "P9", "PO7", "PO3", "O1", "Iz", "Oz", "POz", "Pz", "CPz",
    "Fpz", "Fp2", "AF8", "AF4", "AFz", "Fz", "F2", "F4", "F6", "F8", "FT8",
    "FC6", "FC4", "FC2", "FCz", "Cz", "C2", "C4", "C6", "T8", "TP8", "CP6",
    "CP4", "CP2", "P2", "P4", "P6", "P8", "P10", "PO8", "PO4", "O2",
]


def _make_info(n_channels: int, sfreq: float) -> mne.Info:
    if n_channels != len(CH_NAMES_64):
        raise ValueError(
            f"Laplacian/CSD needs {len(CH_NAMES_64)} channels, got {n_channels}. "
            "Re-run from raw with the standard montage or skip --laplacian."
        )
    info = mne.create_info(CH_NAMES_64, sfreq, ch_types="eeg")
    info.set_montage("standard_1005", on_missing="ignore")
    return info


class LaplacianCSD(BaseEstimator, TransformerMixin):
    """Surface Laplacian via MNE current-source density (spatial high-pass)."""

    def __init__(self, sfreq: float = 256.0):
        self.sfreq = sfreq
        self._info = None

    def fit(self, X, y=None):
        X = np.asarray(X)
        self._info = _make_info(X.shape[1], self.sfreq)
        return self

    def transform(self, X):
        if self._info is None:
            raise RuntimeError("Call fit before transform.")
        X = np.asarray(X, dtype=np.float64)
        out = np.empty_like(X)
        for i in range(X.shape[0]):
            raw = mne.io.RawArray(X[i], self._info.copy(), verbose=False)
            csd = mne.preprocessing.compute_current_source_density(raw, verbose=False)
            out[i] = csd.get_data()
        return out


def reject_amplitude_trials(
    X: np.ndarray,
    y: np.ndarray,
    *,
    peak_uv: float | None = 150.0,
    ptp_uv: float | None = None,
) -> Tuple[np.ndarray, np.ndarray, int]:
    """Drop trials with large amplitude (simple artifact rejection on epoched data).

    Uses peak absolute value per trial (max over channels×time) unless ptp_uv is set.
    Returns (X_kept, y_kept, n_rejected).
    """
    X = np.asarray(X)
    y = np.asarray(y)
    if peak_uv is not None:
        metric = np.max(np.abs(X), axis=(1, 2))
        keep = metric <= peak_uv
    elif ptp_uv is not None:
        metric = np.ptp(X, axis=2).max(axis=1)
        keep = metric <= ptp_uv
    else:
        return X, y, 0
    n_rej = int((~keep).sum())
    return X[keep], y[keep], n_rej
