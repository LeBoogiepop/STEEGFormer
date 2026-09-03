#!/usr/bin/env python3
"""Generate a portfolio hero image for ST-EEGFormer (eegformer.jpg).

Dark-themed composite: MNE topomap + multichannel EEG traces.
Uses the 64-channel BioSemi montage from the spatial-attention pipeline.
Falls back to realistic synthetic EEG when no local pickle is available.
"""

from __future__ import annotations

import argparse
import pickle
from pathlib import Path

import matplotlib.pyplot as plt
import mne
import numpy as np
from matplotlib import colormaps
from matplotlib.gridspec import GridSpec

# 64-channel ViT montage (spatial attention / DTU layout)
CH_NAMES = [
    "Fp1", "AF7", "AF3", "F1", "F3", "F5", "F7", "FT7", "FC5", "FC3", "FC1",
    "C1", "C3", "C5", "T7", "TP7", "CP5", "CP3", "CP1", "P1", "P3", "P5", "P7",
    "P9", "PO7", "PO3", "O1", "Iz", "Oz", "POz", "Pz", "CPz",
    "Fpz", "Fp2", "AF8", "AF4", "AFz", "Fz", "F2", "F4", "F6", "F8", "FT8",
    "FC6", "FC4", "FC2", "FCz", "Cz", "C2", "C4", "C6", "T8", "TP8", "CP6",
    "CP4", "CP2", "P2", "P4", "P6", "P8", "P10", "PO8", "PO4", "O2",
]

SFREQ = 256
BG = "#0a0e14"
PANEL = "#111820"
GRID = "#1c2530"
TEXT = "#8b9cb3"
ACCENT = "#3dd6c6"


def _make_info() -> mne.Info:
    info = mne.create_info(CH_NAMES, SFREQ, ch_types="eeg")
    info.set_montage("standard_1005", on_missing="ignore")
    return info


def _load_trial(pkl_path: Path | None) -> np.ndarray:
    """Return one trial shaped (n_channels, n_times)."""
    if pkl_path and pkl_path.exists():
        with open(pkl_path, "rb") as f:
            blob = pickle.load(f)
        x = blob.get("trainX") or blob.get("testX")
        if x is None:
            raise ValueError(f"No trainX/testX in {pkl_path}")
        trial = np.asarray(x[0], dtype=np.float64)
        if trial.shape[0] != len(CH_NAMES):
            # BCI-IV-2a etc.: reindex not supported here, use synthetic
            raise ValueError(f"Expected {len(CH_NAMES)} channels, got {trial.shape[0]}")
        return trial

    return _synthetic_trial(_make_info())


def _synthetic_trial(info: mne.Info, duration_s: float = 8.0) -> np.ndarray:
    """Band-limited synthetic EEG with occipital alpha (attention paradigm)."""
    rng = np.random.default_rng(42)
    n_times = int(duration_s * SFREQ)
    times = np.arange(n_times) / SFREQ
    data = rng.normal(0, 8e-6, (len(CH_NAMES), n_times))

    locs = np.array([ch["loc"][:3] for ch in info["chs"]])
    # Posterior channels carry stronger alpha (spatial attention cue)
    posterior = (-locs[:, 1] + locs[:, 2]) / (np.linalg.norm(locs, axis=1) + 1e-8)
    posterior = (posterior - posterior.min()) / (posterior.max() - posterior.min() + 1e-8)

    for i, weight in enumerate(posterior):
        phase = rng.uniform(0, 2 * np.pi)
        data[i] += (12e-6 + 35e-6 * weight) * np.sin(2 * np.pi * 10.0 * times + phase)
        data[i] += (3e-6 + 8e-6 * weight) * np.sin(2 * np.pi * 20.0 * times + phase * 0.7)

    # Occasional eye-blink-like transient on frontal channels
    blink_t = 2.4
    blink_idx = int(blink_t * SFREQ)
    frontal = locs[:, 1] > 0.05
    blink = np.exp(-0.5 * ((np.arange(n_times) - blink_idx) / (0.08 * SFREQ)) ** 2)
    data[frontal] += 120e-6 * blink

    return data


def _alpha_power(data: np.ndarray, info: mne.Info) -> np.ndarray:
    filtered = mne.filter.filter_data(data, SFREQ, 8.0, 13.0, verbose=False)
    return (filtered ** 2).mean(axis=1)


def _style_ax(ax: plt.Axes, hide_spines: bool = True) -> None:
    ax.set_facecolor(PANEL)
    ax.tick_params(colors=TEXT, labelsize=8, length=0)
    if hide_spines:
        for spine in ax.spines.values():
            spine.set_visible(False)


def render(output: Path, pkl_path: Path | None = None) -> None:
    info = _make_info()
    data = _load_trial(pkl_path)
    power = _alpha_power(data, info)

    # Trace panel: 3 s window, 16 channels evenly spaced over scalp
    trace_ch_idx = np.linspace(0, len(CH_NAMES) - 1, 16, dtype=int)
    t0, t1 = int(1.0 * SFREQ), int(4.0 * SFREQ)
    segment = data[:, t0:t1]
    times = np.arange(segment.shape[1]) / SFREQ

    fig = plt.figure(figsize=(14, 7), facecolor=BG)
    gs = GridSpec(1, 2, width_ratios=[1.05, 1.0], wspace=0.08, left=0.04, right=0.96, top=0.88, bottom=0.10)

    ax_map = fig.add_subplot(gs[0, 0])
    ax_map.set_facecolor(PANEL)
    im, _ = mne.viz.plot_topomap(
        power,
        info,
        axes=ax_map,
        cmap="magma",
        contours=6,
        outlines="head",
        sensors=True,
        show=False,
        extrapolate="head",
        border="mean",
        vlim=(np.percentile(power, 5), np.percentile(power, 95)),
    )
    ax_map.set_title("Alpha power (8–13 Hz)", color=TEXT, fontsize=11, pad=10, fontweight="medium")

    cbar = fig.colorbar(im, ax=ax_map, fraction=0.046, pad=0.02)
    cbar.ax.yaxis.set_tick_params(color=TEXT, labelsize=7)
    cbar.outline.set_edgecolor(GRID)
    plt.setp(cbar.ax.yaxis.get_ticklabels(), color=TEXT)
    cbar.set_label("µV²", color=TEXT, fontsize=8)

    ax_wav = fig.add_subplot(gs[0, 1])
    _style_ax(ax_wav, hide_spines=True)
    cmap = colormaps["viridis"]
    spacing = np.std(segment) * 6.5 + 1e-12
    for k, ch_i in enumerate(trace_ch_idx):
        color = cmap(0.15 + 0.75 * k / (len(trace_ch_idx) - 1))
        ax_wav.plot(times, segment[ch_i] + k * spacing, color=color, lw=0.75, alpha=0.92)
    ax_wav.set_xlim(times[0], times[-1])
    ax_wav.set_yticks([])
    ax_wav.set_xlabel("Time (s)", color=TEXT, fontsize=9)
    ax_wav.set_title("Multichannel EEG", color=TEXT, fontsize=11, pad=10, fontweight="medium")
    ax_wav.grid(True, color=GRID, alpha=0.35, lw=0.4)

    # Channel labels on the right
    for k, ch_i in enumerate(trace_ch_idx):
        ax_wav.text(
            times[-1] + 0.05,
            k * spacing,
            CH_NAMES[ch_i],
            color=TEXT,
            fontsize=6.5,
            va="center",
            ha="left",
        )

    fig.suptitle(
        "ST-EEGFormer · Spatial attention EEG",
        color="#e6edf3",
        fontsize=14,
        fontweight="semibold",
        y=0.97,
    )

    output.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output, dpi=220, facecolor=BG, bbox_inches="tight", pad_inches=0.15)
    plt.close(fig)
    print(f"Saved {output.resolve()} ({output.stat().st_size // 1024} KB)")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("eegformer.jpg"),
        help="Output image path (default: eegformer.jpg)",
    )
    parser.add_argument(
        "--pkl",
        type=Path,
        default=None,
        help="Optional pickle with trainX/testX (64 ch, 256 Hz)",
    )
    args = parser.parse_args()
    render(args.output, args.pkl)


if __name__ == "__main__":
    main()
