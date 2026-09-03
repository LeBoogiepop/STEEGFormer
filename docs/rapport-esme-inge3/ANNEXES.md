# Annexes

Ces annexes ne comptent pas dans le volume principal du rapport. Elles rassemblent ce qui doit être vérifiable sans alourdir la lecture.

## Annexe A — Glossaire

| Terme | Définition |
|---|---|
| **BCI** | *Brain–Computer Interface* : système inférant une intention ou un état à partir de l’activité cérébrale. |
| **EEG** | Électroencéphalographie : mesure non invasive des potentiels électriques du scalp. |
| **EOG** | Électro-oculogramme : voies dédiées aux mouvements oculaires, ici exclues de la référence et du modèle. |
| **Modèle de fondation (FM)** | Grand modèle pré-entraîné de façon auto-supervisée sur de grandes données non annotées, puis adapté à des tâches aval. |
| **Auto-supervision** | Apprentissage dont la cible est construite à partir du signal lui-même (ex. reconstruire une partie masquée). |
| **MAE** | *Masked Autoencoder* : on masque une fraction des *tokens*, l’encodeur ne voit que le reste, un décodeur reconstruit les parties masquées. |
| **ViT** | *Vision Transformer* : transformeur opérant sur une séquence de *patches* projetés linéairement. |
| **Token / patch** | Ici, un segment de 16 échantillons d’**un seul** canal, projeté en un vecteur. |
| **VQ / codebook** | Quantification vectorielle : remplacer un morceau de signal par l’indice d’un mot d’un dictionnaire appris (approche de LaBraM, pas de ST-EEGFormer). |
| **TPE / SPE** | Encodages positionnels temporel (sinusoïdal) et spatial (plongement appris par électrode). |
| **Linear probing** | Encodeur gelé, apprentissage d’une seule couche linéaire. |
| **Fine-tuning** | Réapprentissage de l’encodeur entier avec la tête. |
| **layer_decay** | Décroissance du taux d’apprentissage vers les couches d’entrée : facteur `layer_decay^(N−i)` pour la couche *i*. |
| **mixup** | Augmentation mélangeant deux exemples et leurs étiquettes. |
| **Population / per-subject / LOSO** | Protocoles d’évaluation : tous les sujets regroupés ; un modèle par sujet ; un sujet tenu à l’écart puis adapté. |
| **Slurm** | Ordonnanceur de travaux du cluster (`sbatch`, `squeue`, `--gres=gpu:...`). |
| **Chance / hasard** | Niveau de performance d’un tirage aléatoire : 50 % à 2 classes, 25 % à 4 classes. |

## Annexe B — Configuration retenue (run population et LOSO)

```text
--optimizer_spec finetune
--layer_decay 1.0
--lr 0.0003
--mix_up 0.0
--smoothing 0.1
--clip_grad 1.0
--train_epochs 50            --train_warmup_epochs 5
--finetune_epochs 30         --finetune_warmup_epochs 3
--train_batch_size 4         --finetune_batch_size 4
--num_workers 0
--vit_pretrained_model_dir  STEEGFormer_large_weights_only_196.pth
--dataset_yaml              spatial_attention_v2/dataset_specs_lab.yaml
export CUDA_VISIBLE_DEVICES=0 CUDA_MODULE_LOADING=LAZY
export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True
```

Modèle : `vit_large_patch16` — dimension 1024, 24 blocs, 16 têtes, *patch* de 16 échantillons, fusion des *tokens* par moyenne, tête linéaire à 2 sorties, coût `SoftTargetCrossEntropy`.

## Annexe C — Spécification du jeu de données du laboratoire

```yaml
spatial_attention:
  data_dir: <chemin local>/spatial_attention_v2
  task_time: 8          # secondes (était 2 dans la version défectueuse)
  fold: 1
  fs: 256               # rééchantillonné à 128 Hz par la transformation ViT
  n_channels: 68        # dont 4 EOG écartés -> 64 canaux pour le ViT
  labram_divisor: 100
  eegpt_divisor: 1000
  chan_names: [Fp1, AF7, AF3, F1, ... , SO2, IO2, LO1, LO2]
```

## Annexe D — Chaîne de prétraitement (conversion v2)

| Étape | Paramètre |
|---|---|
| Typage EOG | `SO2`, `IO2`, `LO1`, `LO2` → type `eog` |
| Référence | moyenne, voies EEG uniquement |
| Passe-bande | 0,1–75 Hz, FIR à phase nulle, fenêtre de Hamming |
| Notch | 60 Hz |
| Rééchantillonnage | 256 Hz (certaines sessions sont à 512 Hz) |
| Ligne de base | moyenne par canal de la période contrôle précédente, soustraite |
| Fenêtre | 8 s à partir de l’onset d’attention → 2048 échantillons |
| Étiquettes | événement `1` → *left*, événement `2` → *right* ; essais `Control` (`8`) non utilisés comme classe |
| Mapping d’événements | explicite : `{"1":1, "2":2, "8":8, "16":16, "64":64, "128":128, "255":255}` |
| Découpage | par **session** : 1–6 apprentissage / 7–8 test, repli proportionnel si moins de 8 sessions |
| Sortie | `<sujet>.pkl` : `trainX (n, 68, 2048)`, `trainY`, `testX`, `testY` |

## Annexe E — Comparaison des deux conversions

| Étape | Conversion v1 (au hasard) | Conversion v2 (alignée référence) |
|---|---|---|
| Filtrage | aucun | passe-bande 0,1–75 Hz + notch 60 Hz |
| Référence | aucune | moyenne (EEG seul) |
| Ligne de base | aucune | moyenne de la période contrôle |
| Fenêtre | 2 s (512 échantillons) | **8 s** (2048 échantillons) |
| Fréquence | 256 Hz supposé, pas de rééchantillonnage | rééchantillonnage explicite vers 256 Hz |
| Sujets | 8 (`part0`) | **43** (`part0`–`part6`) |
| LDA de contrôle | 51,0 % (quasi hasard) | **55,7 %** |

## Annexe F — Résultats bruts cités dans le rapport

**BCI Competition IV-2a** (4 classes, hasard 25 %) :

| Protocole | Machine | Résultat |
|---|---|---|
| population (100 epochs, hyperparamètres auteurs) | `kng08` | 26,39 % |
| leave-one-out fine-tune (9 plis, 100 + 50 epochs) | `gnode01` | 25,56 ± 0,58 % |

Détail des plis LOO : A01 26,12 % · A02 25,39 % · A03 24,88 % · A04 25,08 % · A05 25,42 % · A06 26,50 % · A07 24,96 % · A08 26,20 % · A09 25,50 %.

**Attention spatiale, conversion v1** (2 classes, hasard 50 %, 8 sujets) : LOO fine-tune 49,49 ± 1,77 % · per-subject 50,39 ± 1,62 % · LDA 51,0 %.

**Attention spatiale, conversion v2, LDA par sujet** (8 premiers sujets) : 002 64,6 % · 003 52,1 % · 004 66,7 % · 005 52,1 % · 006 43,8 % · 007 70,8 % · 008 56,2 % · 009 39,6 % → moyenne **55,7 %**.

**Attention spatiale, conversion v2, ST-EEGFormer population 43 sujets**, trajectoire de `test_whole_acc1` : ~50 % jusqu’à l’epoch 25 · 58,4 % (ep. 30) · 56,9 % (ep. 35) · 61,5 % (ep. 40) · 60,8 % (ep. 45) · **61,66 % (ep. 49)**, avec une exactitude d’apprentissage de 70,2 % à l’epoch 49.

**LOSO** (2 sept. 2026) : `~/data/g2_outputs/spatial_loo`, **41** `COMPLETED`, mean `summarize_g2_json_logs.py` **53,55 % ± 3,20 %** (`acc1_whole`, *finetune*). `leave_out_sub-060` sans JSON. Pas 43 dossiers leave-out.

## Annexe G — Environnements de calcul utilisés

| Machine | Matériel | Système / remarques |
|---|---|---|
| PC Windows | GPU grand public | Python 3.10 ; `num_workers = 0` (multiprocessing) |
| MacBook Pro du laboratoire | CPU uniquement | Python 3.11 ; runs longs non tenables |
| `kng07` / `kng08` | 2 × Tesla V100 32 Go | nœuds partagés, MPS ; ~55 min/epoch en population 43 sujets |
| `gnode01` | 3 × RTX 4500 Ada | utilisé pour le LOO BCI |
| `kng11` | 4 × A6000 | LOSO via Slurm (`--gres=gpu:a6000:1`) |
| `abi-dgx-a100` (ATR, VPN) | 8 × A100 40 Go | accès OK 2 sept. 2026 ; données encore sur mnode |
| `kng12` | 8 × A4000 | `--gres=gpu:a4000:1` ; indisponible à la date de soumission |
| `mnode` | nœud de connexion Slurm | `module load slurm/23.02.7` avant `sbatch` |

## Annexe H — Inventaire des contributions logicielles

**Code amont** (dépôt Yang et al., licence MIT) : modèle ViT EEG, pré-entraînement MAE, boucle d’évaluation aval, jeux de spécifications d’origine.

**Ajouts et correctifs réalisés pendant le stage** :

- `util/prepare_atr_nbp_spatial_attention.py` — conversion EEGLAB → format benchmark, avec la chaîne de prétraitement de l’annexe D ;
- `util/prepare_bci_iv2a_moabb.py` — préparation du jeu public via MOABB, avec reprise et tolérance réseau ;
- `util/dataset_specs_local_bci_iv2a.yaml`, `util/dataset_specs_lab_spatial_attention.yaml` — chemins et paramètres locaux à la place des chemins HPC ;
- `util/utils.py` — import optionnel d’une dépendance SSVEP, chargement du mapping de canaux, chargement tolérant du point de contrôle, fonction de coût de classification ;
- `wandb_downstream_evaluation.py` — option de désactivation du suivi d’expériences, compatibilité CPU/GPU, **marqueur `COMPLETED` par pli** ;
- `wandb_engine_finetune_eeg.py`, `util/misc.py` — robustesse de journalisation ;
- `scripts/summarize_g2_json_logs.py` — agrégation hors ligne des journaux JSON ;
- scripts d’orchestration : `run_g2_*.ps1` (Windows), `run_loo.sh`, `run_loo.slurm` (cluster) ;
- `pptx_build/*.js` — génération scriptée des supports de présentation.

**Contribution de ma collègue Liz Costato**, citée mais non réalisée par moi : pipeline de prétraitement de référence (`set_to_pkl.py` / `set_to_h5.py`) et résultats LaBraM.

## Annexe I — Éléments à compléter avant dépôt

- Référence complète de Morioka et al. (2014) et de la revue *Critical Review* (PDF absents de la machine de rédaction).
- Canevas de page de garde et logos officiels de l’école, non disponibles sur ce poste.
- LOSO agrégé **déjà disponible** (41 plis, 53,55 % ± 3,20 %) — à relire avec Cuong avant dépôt.
- LDA recalculée sur les 43 sujets, si le temps le permet (coût négligeable).
- Figures à produire : schéma comparatif des conversions v1/v2 et courbe d’apprentissage du run population.
