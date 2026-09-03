#!/usr/bin/env python3
"""Bar chart from liz_table_population_all_subjects.csv"""
import csv
from pathlib import Path

import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent
CSV = ROOT / "liz_table_population_all_subjects.csv"
OUT = ROOT / "liz_graph_population_per_subject.png"

rows = []
with CSV.open(encoding="utf-8") as f:
    for r in csv.DictReader(f):
        rows.append((r["subject"], float(r["population_acc_pct"])))
rows.sort(key=lambda x: -x[1])

sids = [r[0] for r in rows]
vals = [r[1] for r in rows]
colors = ["#1f8a4c" if v >= 70 else "#c0392b" if v < 50 else "#2f6fed" for v in vals]

fig, ax = plt.subplots(figsize=(10, 14), dpi=150)
ax.barh(range(len(sids)), vals, color=colors, height=0.72)
ax.set_yticks(range(len(sids)))
ax.set_yticklabels(sids, fontsize=8)
ax.invert_yaxis()
ax.set_xlim(0, 100)
ax.axvline(50, color="#888", linestyle="--", linewidth=1)
ax.axvline(61.66, color="#1f8a4c", linestyle="--", linewidth=1)
ax.set_xlabel("Accuracy (%)")
ax.set_title("Population — per-subject accuracy (N=43, whole 61.66%)")
ax.text(0.02, 0.01, "spatial_v2_population2 · train+test all subjects", transform=ax.transAxes, fontsize=8, color="#5c6570")
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
fig.tight_layout()
fig.savefig(OUT, bbox_inches="tight", facecolor="white")
print("Wrote", OUT)
