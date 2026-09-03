# AGENTS.md — Contexte projet ST-EEGFormer (stage Ishii Lab)

> Contexte agent pour ce dépôt. Lire **en premier** dans tout nouveau chat (local, Mac, **Cursor Cloud**).
> Journal détaillé : `notes/JOURNAL.md` (copie synchronisée ; canonique aussi sur `LeBoogiepop/torch-brain-eeg`).

## Qui / quoi

- **Stagiaire** : Maxime Lacombe — Ishii Lab (Kyoto / ATR), stage ~6 mois depuis avril 2026.
- **Collègues** : Liz (côté **LaBraM** / comparaison), encadrement **Cuong** + **Ishii-sensei**.
- **Ligne actuelle** : évaluation **ST-EEGFormer** sur **ATR spatial attention** (comparaison LaBraM),
  après pivot depuis la cible initiale Figure G.2 / BCI-IV-2a.

## Setup machines

| Machine | Rôle | Repo | Particularités |
|---|---|---|---|
| 🍎 Mac | dev / rédaction | `LeBoogiepop/torch-brain-eeg` (`code/STEEGFormer/`) ou clone standalone | CPU ; Okinawa sept. 2026 |
| 🪟 Windows | GPU local | **`LeBoogiepop/STEEGFormer`** (ce repo, branche `shared-context`) | runs lourds |
| ☁️ mnode | Slurm / données | SSH `lacombe-m@10.232.11.170` | datasets + outputs LOSO |
| ☁️ A100 | GPU distant | `ssh maxime.lacombe@abi-dgx-a100.cns.atr.jp` | VPN requis ; conda `steeegformer` |

- Sur Mac les chemins sont préfixés `code/STEEGFormer/...` ; **ici ce sont les mêmes fichiers à la racine**.
- **Second cerveau** (`G:\2ndCerveau`) : wiki perso, **pas sur GitHub** — Maxime sync à part.
- **Rapport ESME** : `docs/rapport-esme-inge3/` (chapitres `.md` dans ce repo).

## État technique (sept. 2026)

- Pipeline ST-EEGFormer **exécutable** (local + cluster Slurm / mnode + A100 via VPN).
- Dataset labo **spatial attention** : 43 sujets, 8 s @ 256 Hz, prep alignée Liz (`spatial_attention_v2`).
- Config population gagnante : `layer_decay 1.0`, `mix_up 0.0`, `lr 3e-4`, warmup 5, 50 ep, batch 4.

| Métrique | Valeur | Notes |
|---|---:|---|
| Population (43) | **61.66% ≈ 61.7%** | `spatial_v2_population2/population_sub-all_43` |
| LOSO mean (41 folds) | **53.55% ± 3.20%** | mnode `~/data/g2_outputs/spatial_loo` — **≠ comparable** au 61.7% population sans alignement protocole |
| LaBraM population | ~62% | Liz |
| LDA | 55.7% | baseline labo |
| Chance | 50% | — |

- **LOSO** : **41/41 COMPLETED** (pas 43 dossiers leave-out ; ex. `leave_out_sub-060` sans JSON).
- **Réunion Liz (2 sept.)** : sujets durs communs **004, 019, 020, 031, 046** (+ **015** à surveiller).
  Suite : Euclidean Alignment, Laplacian/CSD, artifact rejection → `benchmark/spatial_attention/`.
- Tokenisation : ST-EEGFormer = **raw patches + MAE** ; LaBraM = **VQ discret**.
- **VPN ATR** : OK depuis appart Kyoto → A100 ; **mnode non joignable via VPN** (données restent sur mnode).
  Guide : `notes/VPN_ATR_setup.md` (pas de mots de passe dans le repo).

## Livrables & échéances (sept. 2026)

| Échéance | Livrable | Fichier |
|---|---|---|
| Semaine du 8 sept. | Rapport court Cuong (2–3 p., EN) | `presentations/progress_report_cuong_2026-09.docx` |
| **14 sept.** | Rapport ESME Moodle (40–50 p.) | `docs/rapport-esme-inge3/` |
| **21 sept.** | Soutenance ESME (20 min) | — |
| ~9 sept. (retour labo) | Tests preprocessing Liz sur mnode | `benchmark/spatial_attention/run_on_mnode.sh` |

**Objectif recherche (Cuong)** : gagner **quelques %** vs ~61.7% / parité LaBraM.

## Correctifs d'exécution locale (NE PAS casser)

Le repo upstream suppose un contexte HPC (chemins `/lustre1/...`, assets non versionnés).
Patches locaux en place :

- `benchmark/neural_networks/util/dataset_specs_local_bci_iv2a.yaml` : chemins locaux.
- `benchmark/neural_networks/util/utils.py` :
  - import `fbssvepdnn` optionnel ;
  - fallback `sen_chan_idx.pkl` → mapping identité ;
  - chargement checkpoint ViT tolérant ;
  - loss classification = `SoftTargetCrossEntropy`.
- `benchmark/neural_networks/wandb_downstream_evaluation.py` : `--disable_wandb`, offline, `model.to(device)`.
- `benchmark/neural_networks/wandb_engine_finetune_eeg.py` : pas de crash si W&B désactivé.
- Script data BCI-IV-2a : `benchmark/neural_networks/util/prepare_bci_iv2a_moabb.py`.

## Conventions d'exécution

- **W&B désactivé** par défaut en local (`--disable_wandb`).
- Windows/Mac CPU : `num_workers=0`.
- Checkpoints **non versionnés** (`.gitignore`) : placer manuellement dans `models/` :
  - `STEEGFormer_large_weights_only_196.pth` (~1.2 Go)
  - `labram-base.pth` (~92 Mo)
- Cluster : mnode + `module load slurm/23.02.7`.

## Cursor Cloud / nouveau Mac — démarrage rapide

1. **Clone** : `git clone -b shared-context https://github.com/LeBoogiepop/STEEGFormer.git`
2. **Ouvrir** le dossier dans Cursor → l’agent lit ce fichier automatiquement (`AGENTS.md`).
3. **Lire** la dernière section datée de `notes/JOURNAL.md`.
4. **Ne pas supposer** : données mnode, checkpoints, second cerveau — absents du repo.
5. **Branche de travail** : `shared-context` (Windows + Mac + Cloud alignés).
6. Monorepo alternatif : `LeBoogiepop/torch-brain-eeg` branche `shared-context` (`code/STEEGFormer/`).

Pour regénérer des decks : `cd pptx_build && npm install && node build_*.js`.
Pour le rapport Cuong docx : `npm install` à la racine puis `node pptx_build/build_progress_report_cuong.js`.

## Pour l'agent

- Lire `notes/JOURNAL.md` (dernière section datée) avant de proposer des actions.
- Ne pas réintroduire chemins HPC (`/lustre1/...`) ni W&B interactif.
- **Ne pas inventer** de métriques : LOSO = 53.55% ± 3.20% (41 folds), population = 61.7%.
- Ne pas committer mots de passe VPN/SSH.
- Communication factuelle : setup prêt + ce qui manque + next step exécutable.
