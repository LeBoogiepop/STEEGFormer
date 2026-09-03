# STATUT rédaction — 3 septembre 2026

## État global : **rapport v1 + actualisation LOSO (2 sept.)**

Les chapitres 1, 4–8, plan, annexes ont été mis à jour : **LOSO 41/41 COMPLETED**, mean **53,55 % ± 3,20 %** (script officiel, stade finetune). Population inchangée **61,66 %**.

| Fichier | État 3/09 |
|---|---|
| `00_PLAN.md` | chiffres LOSO autorisés |
| `01`–`04` | objectif 5 et protocole LOSO actualisés |
| `05_travail_realise.md` | **§ 5.10** (LOSO fini, Liz, VPN A100) |
| `06_resultats.md` | **§ 6.4** chiffré |
| `07_discussion.md` | 7.2–7.3, 7.6 actualisés |
| `08_conclusion.md` | objectif LOSO = atteint |
| `ANNEXES.md` | mean LOSO + A100 |

## Consignes de fond

- Mean LOSO **uniquement** 53,55 % ± 3,20 % (41 plis, `acc1_whole` finetune). Ne pas citer le zero-shot ~56,7 % comme mean officiel.
- Ne pas présenter 53,5 % comme comparable tel quel au LOSO LaBraM ~62 %.
- ST-EEGFormer = patches continus + MAE ; LaBraM = VQ.
- Pré-entraînement à **128 Hz**.
- LDA 55,7 % = 8 sujets `part0`, pas 43.

## Prochaines actions (ordre)

1. **Rapport 2–3 p. Cuong** : `STEEGFormer/presentations/progress_report_cuong_2026-09.docx` (3 sept.).
2. Relecture + mise en page Word ESME (canevas école).
3. Figures : schéma v1/v2 ; courbe epochs population.
4. Visa labo (Cuong) **avant** Moodle **14/09**.
5. Tests Liz (EA / laplacien) sur mnode — pas bloquant pour le dépôt si non faits.
6. Slides soutenance 20 min (21/09).

## Rappels d’échéance

- Moodle : **lundi 14 septembre 2026** — https://moodle.esme.fr/course/view.php?id=1736
- Soutenance : **21 septembre 2026**, 10:00–11:00 CEST / 17:00–18:00 JST, Lamine Amour
- Convention : **30 septembre 2026**
