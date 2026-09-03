# Ce que Liz a proposé — et comment le tester

Réunion du **2 sept. 2026**. Liz a suggéré d’améliorer le **preprocessing** avant de retoucher le modèle.

## Les 3 idées (en français simple)

| Idée | C’est quoi ? | Pourquoi ? | Déjà dans `spatial_attention_v2` ? |
|------|----------------|------------|-------------------------------------|
| **Euclidean Alignment (EA)** | On « recale » les trials EEG pour que tous les sujets aient la même structure de covariance (whitening). | Réduit le **covariate shift** entre sujets — utile en LOSO et en population. | **Non** |
| **Laplacian (CSD)** | Filtre spatial qui accentue les activités locales (surface Laplacian / current source density). | Moins de bruit global, parfois mieux pour attention spatiale (occipital). | **Non** (seulement average reference) |
| **Artifact rejection** | Enlever les trials trop sales (clignements, gros pics). | Les sujets « durs » (004, 019, …) peuvent être des artefacts, pas du signal. | **Partiel** (bandpass, notch 60 Hz, EOG hors ref) |

**À demander à Liz** : qu’est-ce qu’elle fait *en plus* dans `set_to_pkl` ? (ICA ? seuil amplitude ? ASR ?)

---

## Ce qu’on a déjà (v2)

Dans `prepare_atr_nbp_spatial_attention.py` (repo torch-brain-eeg) :

- référence moyenne (EEG seulement)
- bandpass 0.1–75 Hz + notch 60 Hz
- resample 256 Hz, baseline période contrôle, fenêtre attention 8 s
- sortie : `~/data/g2_transfer/spatial_attention_v2/*.pkl`

---

## Test rapide (sans relancer ST-EEGFormer)

Script : `benchmark/spatial_attention/test_liz_preprocessing.py`

Il compare **CSP + LDA** sur le split train/test de chaque `.pkl` (même logique que le baseline LDA ~55.7%, mais ici CSP+LDA).

### Sur mnode

```bash
cd ~/torch-brain-eeg/code/STEEGFormer   # ou ton clone STEEGFormer

pip install --user pyriemann mne scikit-learn   # une fois

# Tous les sujets (~5–15 min CPU)
python3 benchmark/spatial_attention/test_liz_preprocessing.py \
  --data-dir ~/data/g2_transfer/spatial_attention_v2

# Seulement les sujets durs (rapide)
python3 benchmark/spatial_attention/test_liz_preprocessing.py \
  --data-dir ~/data/g2_transfer/spatial_attention_v2 \
  --only-hard
```

Tu verras une ligne par sujet et une **moyenne** par config :

- `baseline`
- `+ EA`
- `+ Laplacian`
- `+ artifacts` (trials avec pic > 150 µV enlevés)
- `+ EA + artifacts`

### Comment lire le résultat

- Si **EA** ou **Laplacian** monte la moyenne **et** les sujets durs → ça vaut le coup de refaire les `.pkl` en `spatial_attention_v3` et **un** run population (pas 41 folds LOSO).
- Si **rien ne bouge** en LDA → peu probable que le ViT gagne beaucoup ; demander à Liz son pipeline exact.

---

## Suite si un truc marche

1. Modifier `prepare_atr_nbp_spatial_attention.py` → exporter `spatial_attention_v3/`
2. Un run **population** ST-EEGFormer (comparer à 61.7%)
3. Montrer à Liz le même tableau per-subject qu’avant

---

## Sujets durs communs (ST-EEGFormer + LaBraM)

**004, 019, 020, 031, 046** (+ **015** à regarder pour corrélations left/right)

Population ST-EEGFormer : **61.7%** · LaBraM ~62% · LDA ~55.7% · chance 50%.
