# Plan du rapport — Stage INGE3 ESME

Budget cible : **40–50 pages hors annexes** (~12 000–15 000 mots).
Sources de vérité : `torch-brain-eeg/notes/JOURNAL.md`, puis `STEEGFormer/AGENTS.md`, puis `STEEGFormer/README.md`.
`torch-brain-eeg/AGENTS.md` est **périmé** (cible G.2 / BCI-IV-2a) : ne pas s’y fier pour l’état d’août 2026.

| Fichier | Chapitre | Mots | Sources principales | État 20/08 |
|---|---|---|---|---|
| `00_page_de_garde.md` | Garde, résumés, remerciements | 590 | convention ESME, journal | v1 |
| `01_introduction.md` | Problématique, objectifs | 1 185 | convention, journal avril–mai, papier Yang | v1 enrichie (vulgarisation) |
| `02_contexte_labo.md` | Labo, organisation, BCI, attention spatiale, **RSE** | 2 000 | journal, papier (empreinte GPU), exploration MNE | v1 enrichie |
| `03_etat_de_lart.md` | EEG classique, FM EEG, ST-EEGFormer, LaBraM, CalM/CAPT, POYO | 3 357 | PDF Yang et al. + supplément, code, fiche 13/08 | **écrit** |
| `04_methodes.md` | Données, prétraitement, adaptation, protocoles, cluster | 2 092 | `prepare_atr_*`, YAML, `models_vit_eeg.py`, `data_transform.py`, `lr_decay.py` | **écrit** |
| `05_travail_realise.md` | Chronologie + ingénierie + difficultés | 1 955 | journal avril→août | v1 + § 5.9 |
| `06_resultats.md` | Population uniquement | 1 130 | journal 23/06–07/07, `summarize_g2_json_logs.py` | v1 précisée |
| `07_discussion.md` | Limites, retours 19/08, perspectives, recul | 2 372 | journal 23/07, 06/08, 13/08, 19/08 | **écrit** |
| `08_conclusion.md` | Bilan + compétences | 1 002 | — | **écrit** |
| `BIBLIO.md` / `ANNEXES.md` | Bibliographie, glossaire, configs, résultats bruts | hors quota | — | **écrits** |

## Chiffres autorisés (population, 43 sujets)

Hasard 50 % · LDA 55,7 % · ST-EEGFormer **61,66 % ≈ 61,7 %** · LaBraM ~62 % (Liz Costato).
Configuration : `layer_decay 1.0`, `mix_up 0.0`, `smoothing 0.1`, `lr 3e-4`, warmup 5, 50 epochs, batch 4.
LOSO : **41/41** `COMPLETED` au 2 sept. 2026. Mean `summarize_g2_json_logs.py` (acc1_whole, stade finetune) : **53,55 % ± 3,20 %**. Pas 43 plis : IDs absents (ex. 010) ; `leave_out_sub-060` sans JSON. Ce n’est **pas** le chiffre population.

## Interdits maintenus

Inventer un mean LOSO autre que 53,55 % ± 3,20 % (41 plis, finetune) · tokeniseur VQ attribué à ST-EEGFormer · pré-entraînement décrit comme étant à 256 Hz (il est à 128 Hz) · confusion BCI-IV-2a (4 classes, 25 %) / attention spatiale (2 classes, 50 %) · attribution des ~62 % LaBraM à Maxime · invention d’une politique RSE ou d’un organigramme ATR/Kyoto.

## Suite

Voir `STATUT.md` § « Prochaines actions » : relecture, deux figures à produire, références manquantes, mise en page, visa du laboratoire avant dépôt Moodle du 14 septembre 2026.
