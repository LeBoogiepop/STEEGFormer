# Figures

## Disponibles

| Fichier | Légende proposée | Source | Chapitre |
|---|---|---|---|
| `figures/fig_steegformer_overview.png` | **Figure 2.1** — Architecture MAE et protocoles d’évaluation de ST-EEGFormer (figure 1 du papier Yang et al., ICLR 2026). Panneau (a) : les six protocoles. Panneau (b) : le modèle. | `STEEGFormer/assets/graphic_overview.png` | 2 |
| `figures/fig_steegformer_ranks.png` | **Figure 3.1** — Rangs moyens du benchmark (figure 3 du papier). Vert : réseaux convolutifs classiques ; violet : sondes linéaires ; rouge : fine-tuning complet. Notation : `-l` = *large*, `(l)` = sonde linéaire, `(f)` = fine-tuning. | `STEEGFormer/assets/rank_figure3.png` | 3 |
| `figures/fig_architectures_comparees.png` | **Figure 3.2** — ST-EEGFormer-large et LaBraM-base pas à pas sur une fenêtre 8 s × 64 canaux ; en rouge l’objectif de pré-entraînement, seule différence de fond. | `make_fig_architectures.py` (valeurs lues dans le code du dépôt) — figure originale, réutilisable en soutenance | 3 |
| `figures/fig_pipeline_v1_v2.png` | **Figure 5.1** — Chaîne de conversion v1 (juin) vs v2 (alignée Liz). | produite (août 2026) | 6 |
| `figures/fig_courbe_epochs.png` | **Figure 6.1** — Courbe d’apprentissage du run population (50 epochs). | produite (août 2026) | 6 |

Mention obligatoire à conserver sous les deux figures : elles sont extraites du papier Yang et al. (ICLR 2026) — © 2026 Computational Neuroscience Group, KU Leuven pour les figures et le nom « ST-EEGFormer ». La licence MIT du dépôt couvre le code, **pas** ces figures.

## À produire

| Figure prévue | Contenu | Données sources | Chapitre visé |
|---|---|---|---|
| *Optionnel* | Histogramme des exactitudes LDA par sujet, illustrant la variabilité inter-sujets (39,6 % à 70,8 %) | tableau du § 6.2 | 6 ou 7 |
| *Optionnel* | Distribution des 41 plis LOSO (nécessite le JSON agrégé de mnode) | `summarize_g2_json_logs.py` | 6 |

Aucune figure restante n’exige de calcul GPU supplémentaire.
