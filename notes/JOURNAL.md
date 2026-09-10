# Journal stage ST-EEGFormer — Maxime Lacombe

> Copie locale / brouillon. Source canonique visée : `torch-brain-eeg/notes/JOURNAL.md` (branch `shared-context`).

---

## 2026-09-10 (jeu.) — Recommandations Cuong → rapport ESME v2

Mail de Cuong (« Some recommendations for your report ») : décrire plus clairement l'architecture et l'algorithme de **ST-EEGFormer et LaBraM**, réfléchir en profondeur à **comment améliorer ces algorithmes**, ajouter des slides avec figures de modèles, envoyer le rapport ≥ 1 semaine avant la soutenance (21/09).

Fait dans `docs/rapport-esme-inge3/` :
- Ch. 3 : § 3.4.2–3.4.4 réécrits (ViT sur signal brut, algorithme MAE pas à pas, tailles), § 3.5 LaBraM entièrement nouveau (encodeur lu dans `benchmark/neural_networks/models/labram.py` : 200 Hz, patch 1 s, TemporalConv 3 convs, pos_embed 128+1, time_embed 16, base 200/12/10 ; pré-entraînement VQ + masked EEG modeling d'après le papier), tableau point à point, **figure 3.2** (`make_fig_architectures.py`).
- Ch. 7 : **§ 7.7 « Comment améliorer ces algorithmes ? »** — 4 leviers (entrée, représentation, objectif, adaptation/mesure), statut réalisé / prêt à tester / prospectif, tableau de synthèse. Recul → § 7.8.
- Faits périmés corrigés : résumé/abstract (LOSO « en cours » → 53,55 % ± 3,20 %), tableau RSE ch. 2, sujets durs = observation de discussion (ch. 5, 6), § 5.11 (3–10 sept.), biblio (LaBraM ICLR 2024, He & Wu 2020).
- DOCX + PDF régénérés (54 p., ~21 200 mots), TOC via Word COM (pywin32 absent → PowerShell).
- Slides soutenance : `presentations/ST-EEGFormer_soutenance_ESME_2026-09-21_architectures.pptx` (3 slides, notes FR) via `pptx_build/build_defense_0921.js`.

**Audit du soir (complétude / sources)** :
- LaBraM 8 192 × 64 codes, masque 0,5, ~2 500 h, 5,8 M / 46 M / 369 M → **confirmés dans l'article ICLR 2024** (tables 3–4). Plus rien « à confirmer ».
- ST-EEGFormer : 0,1–64 Hz, 128 Hz, z-score, fenêtres 6 s / pas 0,5 s, 142 électrodes, 16 × A100-80 Go, 32 614 h-GPU, masque 0,75 → confirmés dans `STEEGFormer.pdf` (annexes E).
- Chiffres ch. 5–6 recroisés avec le JOURNAL complet de `torch-brain-eeg` (récupéré via `gh api`, 38 sections avril→sept.) : tous présents.
- `EGG_STATE.pdf` (racine POUR LE STAGE) = la revue *Critical Review* elle-même (Kuruppu, Wagh, Kremen & Varatharajah, *J. Neural Eng.* 23, 021001, 2026) — le rapport disait à tort qu'elle était absente. Corrigé ch. 3, 5, biblio.
- Morioka et al. 2014 = *NeuroImage* 90:128–139, doi 10.1016/j.neuroimage.2013.12.035 (Ishii dernier auteur). Corrigé ch. 2, 4, biblio.
- BIBLIO : 32 entrées, **toutes avec DOI / arXiv / dépôt**, chaque lien résolu (HTTP ou Crossref). Azabou 2025 (ICLR, OpenReview `IuU0wcO0mo`), CalM / CAPT (Xu, Zhang, Zhang, Tsinghua), POCO (Duan et al., NeurIPS 2025), MNE ajoutés.
- Cadre ESME (mail scolarité + infos clés mars 2026, wiki) : pas de consignes de rédaction, barème = grille Romanet ; rapport « visé par l'entreprise » → visa Cuong/Ishii à obtenir avant le 14/09.
- DOCX/PDF régénérés : **55 p., ~21 700 mots** (avec garde, TOC, biblio, annexes).
- **Reste à faire : deck soutenance 20 min complet** (les 3 slides architecture ne sont qu'un bloc).

Réunion Liz du 9 sept. : recap des constats du 2 sept. (deck `ST-EEGFormer_Liz_meeting_2026-09-09_PRESENT.pptx`). Tests EA / CSD / artefacts toujours **non exécutés** sur mnode.

## 2026-09-02 (mer.) — Mail Cuong + réunion Liz + LOSO fini + VPN

### Mail envoyé à Cuong (PHI Tien Cuong + Ishii-sensei en CC)

Résumé factuel envoyé :

- **Population** (43 suj.) : **61.7%** test acc — parité LaBraM ~62%, LDA 55.7%.
- **LOSO** : **41/41 folds COMPLETED**, mean finetune-stage **~53.5%** (`summarize_g2_json_logs.py` sur `~/data/g2_outputs/spatial_loo`).
- **Réunion Liz (2 sept.)** : comparaison per-subject ST-EEGFormer vs LaBraM → sujets durs communs **004, 019, 020, 031, 046** (+ autres). Suite : EA, Laplacian, artifact rejection. Script prêt : `benchmark/spatial_attention/test_liz_preprocessing.py`.
- **VPN A100** : identifiants reçus **1 sept.** (Sawada → TSG). **Setup OK 2 sept. soir** depuis appart Kyoto : certificats + Cisco Secure Client → `vpngw-ng.atr.jp` → `ssh maxime.lacombe@abi-dgx-a100.cns.atr.jp` OK, **8× A100 40GB** (`nvidia-smi`, GPUs idle).
- **Cluster CPUs** : promis de consulter **Kubo-san** + doc MNODE avant prochains `sbatch`.

### État technique

| Métrique | Valeur | Source |
|---|---:|---|
| Population whole test acc | 61.66% ≈ 61.7% | `spatial_v2_population2/population_sub-all_43` |
| LOSO mean (41 folds) | 53.55% ± 3.2% | mnode `summarize_g2_json_logs.py` |
| LaBraM population | ~62% | Liz |
| LDA | 55.7% | baseline labo |
| Chance | 50% | — |

### Next

- [x] VPN : certificats + Cisco Secure Client depuis appart Kyoto → `abi-dgx-a100.cns.atr.jp` OK (2 sept.)
- [ ] `run_on_mnode.sh` ou `--only-hard` pour tests preprocessing Liz
- [ ] Kubo-san : `cpus-per-task` / `num_workers`
- [ ] Sync cette section vers `torch-brain-eeg/notes/JOURNAL.md` si pas déjà fait

### Fichiers / notes

- Tuto VPN local : `notes/VPN_ATR_setup.md`
- Debrief Liz : `presentations/LIZ_DEBRIEF_2026-09-02.md` (+ CSV/HTML dans `presentations/` et `notes/meetings/` sur torch-brain-eeg)

---

## 2026-09-03 (jeu.) — Cuong : 2–3 p. + ESME

Cuong confirme : **2–3 pages** pour la semaine prochaine (fait + problèmes). Rapport long = **fin de stage**. ESME : rapport 40–50 p. Moodle **14/09**, soutenance **21/09** (20 min), CR SAS mensuels.

**Envoyé** (sans proposer de meeting) : 2–3 p. pour la semaine pro ; visa labo avant Moodle.

**Livrable Cuong :** `presentations/progress_report_cuong_2026-09.docx` (+ `.md`).

**Rapport ESME** (`…/rapport-esme-inge3/`) : chapitres actualisés avec LOSO **53,55 % ± 3,20 %** (41 plis).

Jusqu’au labo (mer. 9) : relire le 2–3 p., avancer ESME. Tests Liz + Kubo = mercredi.
