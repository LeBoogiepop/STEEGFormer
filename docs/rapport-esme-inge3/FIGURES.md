# Figures

## Disponibles

| Fichier | Légende proposée | Source | Chapitre |
|---|---|---|---|
| `figures/fig_steegformer_overview.png` | **Figure 2.1** — Architecture MAE et protocoles d’évaluation de ST-EEGFormer (figure 1 du papier Yang et al., ICLR 2026). Panneau (a) : les six protocoles. Panneau (b) : le modèle. | `STEEGFormer/assets/graphic_overview.png` | 2 |
| `figures/fig_steegformer_ranks.png` | **Figure 3.1** — Rangs moyens du benchmark (figure 3 du papier). Vert : réseaux convolutifs classiques ; violet : sondes linéaires ; rouge : fine-tuning complet. Notation : `-l` = *large*, `(l)` = sonde linéaire, `(f)` = fine-tuning. | `STEEGFormer/assets/rank_figure3.png` | 3 |

Mention obligatoire à conserver sous les deux figures : elles sont extraites du papier Yang et al. (ICLR 2026) — © 2026 Computational Neuroscience Group, KU Leuven pour les figures et le nom « ST-EEGFormer ». La licence MIT du dépôt couvre le code, **pas** ces figures.

## À produire

| Figure prévue | Contenu | Données sources | Chapitre visé |
|---|---|---|---|
| **Figure 4.1** | Schéma de la chaîne de prétraitement : conversion v1 (au hasard) contre v2 (alignée référence), avec les six étapes et la fenêtre 2 s → 8 s | annexe D et E du rapport | 4 |
| **Figure 6.1** | Courbe d’apprentissage du run population : exactitude d’apprentissage et `test_whole_acc1` sur les epochs 0–49, avec la zone d’échauffement grisée | tableau du § 6.3 (journal de bord, 6 juillet 2026) | 6 |
| *Optionnel* | Histogramme des exactitudes LDA par sujet, illustrant la variabilité inter-sujets (39,6 % à 70,8 %) | tableau du § 6.2 | 6 ou 7 |
| *Optionnel* | Diagramme des rôles et des rituels du laboratoire | § 2.5 | 2 |

Les deux figures principales à produire n’exigent **aucun calcul GPU supplémentaire** : toutes les valeurs sont déjà consignées dans le journal de bord.
