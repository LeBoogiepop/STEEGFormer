#!/usr/bin/env python3
"""Generate PNG graphs for Liz debrief. Run: python presentations/make_liz_graphs.py"""
from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

OUT = Path(__file__).resolve().parent

ROWS = [
    ("007", 81.25, 82.81), ("051", 81.25, 79.69), ("029", 79.69, 93.75),
    ("048", 73.44, 85.94), ("003", 70.31, 46.88), ("047", 70.31, 78.13),
    ("026", 68.75, 87.50), ("024", 67.19, 59.38), ("050", 64.06, 45.31),
    ("021", 62.50, 64.06), ("028", 62.50, 56.25), ("053", 62.50, 62.50),
    ("013", 60.94, 48.44), ("023", 59.38, 57.81), ("031", 59.38, 64.06),
    ("005", 57.81, 50.00), ("006", 57.81, 60.94), ("032", 57.81, 56.25),
    ("041", 57.81, 59.38), ("042", 56.25, 29.69), ("052", 56.25, 46.88),
    ("008", 54.69, 53.13), ("011", 54.69, 51.56), ("012", 53.13, 43.75),
    ("025", 53.13, 45.31), ("022", 51.56, 53.13), ("014", 50.00, 40.63),
    ("036", 50.00, 48.44), ("046", 50.00, 60.94), ("055", 48.44, 50.00),
    ("002", 46.88, 51.56), ("009", 46.88, 42.19), ("045", 45.31, 50.00),
    ("015", 43.75, 42.19), ("020", 43.75, 53.13), ("043", 43.75, 48.44),
    ("056", 43.75, 46.88), ("004", 42.19, 51.56), ("033", 42.19, 51.56),
    ("019", 35.94, 59.38),
]


def bar_color(v: float) -> str:
    if v >= 70:
        return "#1f8a4c"
    if v < 50:
        return "#c0392b"
    if v < 60:
        return "#b8860b"
    return "#2f6fed"


def plot_population() -> Path:
    labels = ["Chance", "LDA", "ST-EEGFormer", "LaBraM"]
    values = [50.0, 55.7, 61.66, 62.0]
    colors = ["#9aa3ad", "#6b7b8c", "#2f6fed", "#1f8a4c"]

    fig, ax = plt.subplots(figsize=(8, 5), dpi=150)
    bars = ax.bar(labels, values, color=colors, width=0.55, edgecolor="white", linewidth=0.8)
    ax.axhline(50, color="#888", linestyle="--", linewidth=1, alpha=0.7)
    ax.set_ylim(45, 68)
    ax.set_ylabel("Accuracy (%)")
    ax.set_title("Population decoding — spatial attention (43 subjects)")
    for bar, v in zip(bars, values):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.4,
            f"{v:.1f}%",
            ha="center",
            va="bottom",
            fontsize=11,
            fontweight="bold",
        )
    ax.text(
        0.02,
        0.02,
        "Train + test on all subjects · chance 50%",
        transform=ax.transAxes,
        fontsize=9,
        color="#5c6570",
    )
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    fig.tight_layout()
    path = OUT / "liz_graph_population.png"
    fig.savefig(path, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    return path


def plot_loso(zero_shot: bool = True) -> Path:
    data = sorted(ROWS, key=lambda x: x[1], reverse=True)
    sids = [r[0] for r in data]
    vals = [r[1] if zero_shot else r[2] for r in data]
    colors = [bar_color(v) for v in vals]

    fig_h = max(10, len(sids) * 0.28)
    fig, ax = plt.subplots(figsize=(10, fig_h), dpi=150)
    y = np.arange(len(sids))
    ax.barh(y, vals, color=colors, height=0.72, edgecolor="white", linewidth=0.5)
    ax.set_yticks(y)
    ax.set_yticklabels(sids, fontsize=8)
    ax.invert_yaxis()
    ax.set_xlim(0, 100)
    ax.set_xlabel("Held-out accuracy (%)")
    title = "LOSO zero-shot" if zero_shot else "LOSO after calibration"
    ax.set_title(f"{title} — per subject (N=40, sub-059 excluded)")
    ax.axvline(50, color="#888", linestyle="--", linewidth=1, label="Chance 50%")
    ax.axvline(61.7, color="#1f8a4c", linestyle="--", linewidth=1, label="Population 61.7%")
    mean_v = float(np.mean(vals))
    ax.axvline(mean_v, color="#b8860b", linestyle=":", linewidth=1.2, label=f"Partial mean {mean_v:.1f}%")
    for i, v in enumerate(vals):
        if v >= 70 or v < 45:
            ax.text(v + 0.8, i, f"{v:.1f}", va="center", fontsize=7)
    ax.legend(loc="lower right", fontsize=8, framealpha=0.9)
    ax.text(
        0.02,
        0.01,
        "Leave-one-subject-out · source mnode spatial_loo logs · 1 Sep 2026",
        transform=ax.transAxes,
        fontsize=8,
        color="#5c6570",
    )
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    fig.tight_layout()
    suffix = "loso_zero_shot" if zero_shot else "loso_calibration"
    path = OUT / f"liz_graph_{suffix}.png"
    fig.savefig(path, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    return path


def main() -> None:
    paths = [plot_population(), plot_loso(True), plot_loso(False)]
    print("Wrote:")
    for p in paths:
        print(f"  {p}")


if __name__ == "__main__":
    main()
