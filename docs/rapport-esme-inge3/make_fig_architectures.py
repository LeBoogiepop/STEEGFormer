# -*- coding: utf-8 -*-
"""Figure 3.2 — ST-EEGFormer-large vs LaBraM-base, pas à pas, sur une fenêtre 8 s x 64 canaux.

Toutes les valeurs proviennent du code du dépôt :
  benchmark/neural_networks/models/models_vit_eeg.py, pretrain/models_mae_eeg.py (ST-EEGFormer)
  benchmark/neural_networks/models/labram.py, util/utils.py (LaBraM, fs aval = 200 Hz)
Sortie : figures/fig_architectures_comparees.png
"""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

OUT = Path(__file__).resolve().parent / "figures" / "fig_architectures_comparees.png"

INK = "#17272D"
BLUE = "#2F5F8F"
BLUE_L = "#E6EEF6"
RED = "#A23B2B"
RED_L = "#F7E7E3"
GREY = "#5F6E73"
LINE = "#B9C4CA"

STEPS_ST = [
    ("Entrée", "64 canaux × 8 s @ 256 Hz\n→ rééchantillonné à 128 Hz : 64 × 1 024"),
    ("Découpage", "patches de 16 échantillons (125 ms),\nnon recouvrants → 64 × 64 = 4 096 patches"),
    ("Plongement", "Linear(16 → 1 024)\n+ codage temporel sinusoïdal (quand)\n+ plongement d’électrode appris, 145 slots (où)\n+ token [CLS]"),
    ("Encodeur", "ViT-large : 24 blocs, 16 têtes, D = 1 024\nattention plate sur les 4 097 tokens\n(≈ 302 M paramètres)"),
    ("Pré-entraînement", "MAE : 75 % des patches masqués\ndécodeur léger (D = 512, 8 blocs) → Linear(512 → 16)\nperte = MSE sur les 16 échantillons des patches masqués"),
    ("Aval", "décodeur jeté · moyenne des tokens\n→ tête linéaire (2 classes)"),
]

STEPS_LB = [
    ("Entrée", "64 canaux × 8 s @ 256 Hz\n→ rééchantillonné à 200 Hz : 64 × 1 600"),
    ("Découpage", "patches de 200 échantillons (1 s)\n→ 64 × 8 = 512 patches"),
    ("Plongement", "3 convolutions temporelles (GroupNorm, GELU)\n→ vecteur de 200\n+ plongement d’électrode appris, 128 slots\n+ plongement temporel appris, 16 slots · [CLS]"),
    ("Encodeur", "Transformeur base : 12 blocs, 10 têtes, D = 200\nattention plate sur les 513 tokens\n(≈ 5,8 M paramètres)"),
    ("Pré-entraînement", "① tokeniseur VQ : chaque patch → indice d’un dictionnaire,\n   appris en reconstruisant amplitude + phase de Fourier\n② masquage 50 % → prédire l’indice du code masqué\n   (entropie croisée)"),
    ("Aval", "tokeniseur jeté · moyenne des tokens\n→ tête linéaire (2 classes)"),
]


def column(ax, x0, title, subtitle, steps, accent):
    ax.text(x0 + 0.5, 0.965, title, ha="center", va="center", fontsize=13, fontweight="bold", color=INK)
    ax.text(x0 + 0.5, 0.935, subtitle, ha="center", va="center", fontsize=9, color=GREY, style="italic")
    top, bottom = 0.90, 0.03
    n = len(steps)
    h = (top - bottom) / n
    for i, (label, body) in enumerate(steps):
        y1 = top - i * h
        y0 = y1 - h + 0.012
        is_pre = label == "Pré-entraînement"
        face = RED_L if is_pre else BLUE_L
        edge = RED if is_pre else accent
        box = FancyBboxPatch((x0 + 0.03, y0), 0.94, y1 - y0 - 0.004,
                             boxstyle="round,pad=0.004,rounding_size=0.008",
                             linewidth=1.2, edgecolor=edge, facecolor=face)
        ax.add_patch(box)
        ax.text(x0 + 0.06, y1 - 0.016, label.upper(), ha="left", va="top", fontsize=8.5,
                fontweight="bold", color=edge)
        ax.text(x0 + 0.06, y1 - 0.042, body, ha="left", va="top", fontsize=9.6, color=INK,
                linespacing=1.3)
        if i < n - 1:
            ax.annotate("", xy=(x0 + 0.5, y0 - 0.001), xytext=(x0 + 0.5, y0 + 0.011),
                        arrowprops=dict(arrowstyle="-|>", color=GREY, lw=1.0))


def main() -> None:
    fig, ax = plt.subplots(figsize=(12.5, 9.6), dpi=200)
    ax.set_xlim(0, 2.08)
    ax.set_ylim(0, 1)
    ax.axis("off")
    column(ax, 0.0, "ST-EEGFormer-large (Yang et al., 2026)",
           "représentation continue · reconstruction du signal", STEPS_ST, BLUE)
    ax.plot([1.04, 1.04], [0.03, 0.92], color=LINE, lw=1, ls="--")
    column(ax, 1.08, "LaBraM-base (Jiang et al., 2024)",
           "représentation discrète · prédiction de codes", STEPS_LB, BLUE)
    fig.text(0.5, 0.008,
             "Lecture : mêmes données (fenêtre 8 s, 64 EEG). Rouge = ce qui distingue vraiment les deux modèles, "
             "l’objectif de pré-entraînement. Valeurs lues dans le code du dépôt (fs aval 128 Hz / 200 Hz).",
             ha="center", va="bottom", fontsize=8, color=GREY)
    fig.tight_layout(rect=(0, 0.02, 1, 1))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(OUT, facecolor="white")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
