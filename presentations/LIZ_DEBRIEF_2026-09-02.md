# Debrief Liz — 2 sept. 2026

ST-EEGFormer sur ATR spatial attention (gauche / droite, 43 sujets).
Source : logs JSON `~/data/g2_outputs/spatial_loo` sur mnode, extraits le **1 sept. 2026 ~15:30 JST**. Tu n’as **pas** besoin de relancer les commandes.

**À citer :** population **61.7%** (LaBraM ~62%, LDA 55.7%, chance 50%).
**À ne pas citer comme résultat final :** moyenne LOSO (059 pas fini).

**Graphiques (double-clic pour ouvrir) :**
- `presentations/liz_graph_population.png` — population vs chance / LDA / LaBraM
- `presentations/liz_graph_loso_zero_shot.png` — LOSO par sujet (zero-shot)
- `presentations/liz_graph_loso_calibration.png` — LOSO après calibration
- `presentations/LIZ_DEBRIEF_2026-09-02.html` — version interactive dans le navigateur

**Tableau complet (tous les sujets, toutes les colonnes) :**
- **LOSO** : `presentations/liz_table_all_subjects.html` / `.csv`
- **Population (43 sujets)** : `presentations/liz_table_population_all_subjects.html` / `.csv`
- **Graph population par sujet** : `presentations/liz_graph_population_per_subject.png`

---

## Quoi dire (anglais)

1. Population decoding is 61.7%, matching LaBraM around 62%.
2. Leave-one-subject-out is 40 of 41 folds. Subject 059 is still training; I will not quote a final LOSO mean.
3. Held-out accuracy is very uneven: six subjects at 70–81%, eleven below chance. Best 007/051 at 81%, worst 019 at 36%.
4. I do not yet have left-versus-right class-wise accuracy. If you have that split for LaBraM, we can compare.

---

## Ce que mesurent les chiffres

Chaque ligne = un fold **leave-one-out** : on entraîne sur les autres, on teste le sujet laissé de côté.

- **Zero-shot** = étape `training` → `sub-XXX_test_acc1` (le vrai score « ce sujet-là »).
- **After calib.** = étape `finetune` sur ce sujet (calibration). Moyenne presque identique, écart beaucoup plus grand.
- **Ce n’est pas** le 61.7% population (là on train+test sur tout le monde).

41 dossiers leave-out (pas 43 : des IDs absents, ex. 010). **059 en cours** (job 111061, ~15 h restantes au 1 sept. 15h).

---

## Zero-shot — 40 sujets

Moyenne partielle **56.7% ± 11.3** (min 35.9, max 81.3). **Ne pas dire « LOSO = 57% ».**

**Faciles (≥70%)**

| Sujet | Zero-shot | Après calib. |
|---|---:|---:|
| 007 | 81.3% | 82.8% |
| 051 | 81.3% | 79.7% |
| 029 | 79.7% | 93.8% |
| 048 | 73.4% | 85.9% |
| 003 | 70.3% | 46.9% |
| 047 | 70.3% | 78.1% |

**Durs (&lt;50%)**

| Sujet | Zero-shot | Après calib. |
|---|---:|---:|
| 019 | 35.9% | 59.4% |
| 004 | 42.2% | 51.6% |
| 033 | 42.2% | 51.6% |
| 015 | 43.8% | 42.2% |
| 020 | 43.8% | 53.1% |
| 043 | 43.8% | 48.4% |
| 056 | 43.8% | 46.9% |
| 045 | 45.3% | 50.0% |
| 002 | 46.9% | 51.6% |
| 009 | 46.9% | 42.2% |
| 055 | 48.4% | 50.0% |

Répartition : **6** ≥70% · **23** entre 50 et 70% · **11** &lt;50%.

---

## Table complète
| Subject | Status | Zero-shot | Bal. | Kappa | Calib. | Bal. | Kappa | Delta | Bucket |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| 002 | done | 46.9% | 50.0% | 0.00 | 51.6% | 52.1% | 0.04 | +4.68% | hard (<50%) |
| 003 | done | 70.3% | 68.8% | 0.38 | 46.9% | 45.8% | -0.08 | -23.43% | easy (>=70%) |
| 004 | done | 42.2% | 39.6% | -0.21 | 51.6% | 52.1% | 0.04 | +9.37% | hard (<50%) |
| 005 | done | 57.8% | 56.2% | 0.13 | 50.0% | 47.9% | -0.04 | -7.81% | mid (50-60%) |
| 006 | done | 57.8% | 56.2% | 0.13 | 60.9% | 60.4% | 0.21 | +3.13% | mid (50-60%) |
| 007 | done | 81.2% | 79.2% | 0.58 | 82.8% | 81.2% | 0.63 | +1.56% | easy (>=70%) |
| 008 | done | 54.7% | 54.2% | 0.08 | 53.1% | 52.1% | 0.04 | -1.56% | mid (50-60%) |
| 009 | done | 46.9% | 47.9% | -0.04 | 42.2% | 41.7% | -0.17 | -4.69% | hard (<50%) |
| 011 | done | 54.7% | 54.2% | 0.08 | 51.6% | 47.9% | -0.04 | -3.13% | mid (50-60%) |
| 012 | done | 53.1% | 52.1% | 0.04 | 43.8% | 41.7% | -0.17 | -9.38% | mid (50-60%) |
| 013 | done | 60.9% | 58.3% | 0.17 | 48.4% | 50.0% | 0.00 | -12.50% | ok (60-70%) |
| 014 | done | 50.0% | 43.8% | -0.13 | 40.6% | 43.8% | -0.13 | -9.37% | mid (50-60%) |
| 015 | done | 43.8% | 41.7% | -0.17 | 42.2% | 43.8% | -0.13 | -1.56% | hard (<50%) |
| 019 | done | 35.9% | 37.5% | -0.25 | 59.4% | 60.4% | 0.21 | +23.44% | hard (<50%) |
| 020 | done | 43.8% | 45.8% | -0.08 | 53.1% | 52.1% | 0.04 | +9.38% | hard (<50%) |
| 021 | done | 62.5% | 60.4% | 0.21 | 64.1% | 64.6% | 0.29 | +1.56% | ok (60-70%) |
| 022 | done | 51.6% | 52.1% | 0.04 | 53.1% | 52.1% | 0.04 | +1.57% | mid (50-60%) |
| 023 | done | 59.4% | 56.2% | 0.13 | 57.8% | 52.1% | 0.04 | -1.57% | mid (50-60%) |
| 024 | done | 67.2% | 66.7% | 0.33 | 59.4% | 56.2% | 0.13 | -7.81% | ok (60-70%) |
| 025 | done | 53.1% | 50.0% | 0.00 | 45.3% | 45.8% | -0.08 | -7.82% | mid (50-60%) |
| 026 | done | 68.8% | 66.7% | 0.33 | 87.5% | 87.5% | 0.75 | +18.75% | ok (60-70%) |
| 028 | done | 62.5% | 60.4% | 0.21 | 56.2% | 54.2% | 0.08 | -6.25% | ok (60-70%) |
| 029 | done | 79.7% | 77.1% | 0.54 | 93.8% | 91.7% | 0.83 | +14.06% | easy (>=70%) |
| 031 | done | 59.4% | 64.6% | 0.29 | 64.1% | 68.8% | 0.38 | +4.68% | mid (50-60%) |
| 032 | done | 57.8% | 56.2% | 0.13 | 56.2% | 56.2% | 0.13 | -1.56% | mid (50-60%) |
| 033 | done | 42.2% | 43.8% | -0.13 | 51.6% | 52.1% | 0.04 | +9.37% | hard (<50%) |
| 036 | done | 50.0% | 52.1% | 0.04 | 48.4% | 47.9% | -0.04 | -1.56% | mid (50-60%) |
| 041 | done | 57.8% | 56.2% | 0.13 | 59.4% | 58.3% | 0.17 | +1.57% | mid (50-60%) |
| 042 | done | 56.2% | 56.2% | 0.13 | 29.7% | 31.2% | -0.38 | -26.56% | mid (50-60%) |
| 043 | done | 43.8% | 45.8% | -0.08 | 48.4% | 50.0% | 0.00 | +4.69% | hard (<50%) |
| 045 | done | 45.3% | 45.8% | -0.08 | 50.0% | 45.8% | -0.08 | +4.69% | hard (<50%) |
| 046 | done | 50.0% | 50.0% | 0.00 | 60.9% | 62.5% | 0.25 | +10.94% | mid (50-60%) |
| 047 | done | 70.3% | 68.8% | 0.38 | 78.1% | 81.2% | 0.63 | +7.82% | easy (>=70%) |
| 048 | done | 73.4% | 72.9% | 0.46 | 85.9% | 87.5% | 0.75 | +12.50% | easy (>=70%) |
| 050 | done | 64.1% | 62.5% | 0.25 | 45.3% | 45.8% | -0.08 | -18.75% | ok (60-70%) |
| 051 | done | 81.2% | 81.2% | 0.63 | 79.7% | 81.2% | 0.63 | -1.56% | easy (>=70%) |
| 052 | done | 56.2% | 54.2% | 0.08 | 46.9% | 50.0% | 0.00 | -9.37% | mid (50-60%) |
| 053 | done | 62.5% | 62.5% | 0.25 | 62.5% | 64.6% | 0.29 | +0.00% | ok (60-70%) |
| 055 | done | 48.4% | 45.8% | -0.08 | 50.0% | 50.0% | 0.00 | +1.56% | hard (<50%) |
| 056 | done | 43.8% | 43.8% | -0.13 | 46.9% | 47.9% | -0.04 | +3.13% | hard (<50%) |
| 059 | running | 48.4% | 50.0% | 0.00 | — | — | — | — | hard (<50%) |

## Gauche vs droite — on n’a pas le chiffre

Les JSON n’ont **que des scalaires** (acc, balanced acc, kappa, AUC). Pas de prédictions, pas de matrice de confusion. Les confusion plots allaient sur W&B, désactivé en local.

Balanced acc ≈ acc brute sur beaucoup de sujets → pas un effondrement évident sur une seule classe. **Ça ne dit pas** si left ou right est mieux.

**Demande à Liz :** a-t-elle recall left / recall right pour LaBraM sur les mêmes sujets ? Si oui, on comparera dès qu’on aura le nôtre (eval court après 059).

---

## À ne pas dire

- « LOSO = 57% » / un mean final
- « On bat / on perd LaBraM en LOSO » (elle n’a peut-être pas le même protocole ; 059 manque)
- Un biais gauche/droite inventé
- GitHub, Slurm, job 111061
