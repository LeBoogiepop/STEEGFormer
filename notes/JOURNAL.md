# Journal stage ST-EEGFormer — Maxime Lacombe

> Copie locale / brouillon. Source canonique visée : `torch-brain-eeg/notes/JOURNAL.md` (branch `shared-context`).

---

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
