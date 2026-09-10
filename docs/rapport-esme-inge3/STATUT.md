# STATUT rédaction — 10 septembre 2026

## État global : **rapport v2 — prêt pour relecture Cuong**

Réponse aux recommandations de Cuong (mail du 10 sept.) : architecture + algorithme de **ST-EEGFormer et LaBraM** réécrits pas à pas (ch. 3), section « **comment améliorer ces algorithmes** » ajoutée (§ 7.7), figure comparative originale (fig. 3.2), slides architecture pour la soutenance. Tous les chapitres vérifiés contre le code du dépôt et les chiffres autorisés. DOCX + PDF régénérés : **54 pages, ~21 200 mots** (page de garde, TOC, biblio et annexes inclus).

| Fichier | État 10/09 |
|---|---|
| `00_page_de_garde.md` | résumé / abstract : LOSO chiffré (plus « en cours ») |
| `01_introduction.md` | § 1.5 annonce ch. 3 (architectures) et § 7.7 (leviers) |
| `02_contexte_labo.md` | tableau RSE : LOSO terminé |
| `03_etat_de_lart.md` | **§ 3.4.2–3.4.4 réécrits** (ST-EEGFormer, algorithme MAE pas à pas, tableau des tailles) ; **§ 3.5.1–3.5.4 nouveaux** (LaBraM : encodeur lu dans `labram.py`, tokeniseur VQ + masked EEG modeling, tableau point à point, **figure 3.2**) |
| `05_travail_realise.md` | § 5.10 nuancé (sujets durs = observation de discussion) ; **§ 5.11** (3–10 sept.) |
| `06_resultats.md` | § 6.4 : sujets durs nuancés, « non chiffré au 10/09 » |
| `07_discussion.md` | **§ 7.7 nouveau** : 4 leviers (entrée / représentation / objectif / adaptation-mesure), statuts réalisé / prêt / prospectif, tableau de synthèse ; Recul → § 7.8 |
| `08_conclusion.md` | résultat en deux phrases (population + LOSO), renvoi § 7.7 |
| `BIBLIO.md` | **32 entrées, toutes avec lien (DOI / arXiv / dépôt) résolu le 10/09** ; Morioka 2014, Kuruppu 2026 (revue), Azabou 2025, CalM, CAPT, POCO complétés ; MNE ajouté |
| `FIGURES.md` | fig. 3.2 ajoutée ; « à produire » nettoyé |
| `make_fig_architectures.py` | **nouveau** — génère `figures/fig_architectures_comparees.png` |
| `Lacombe_Maxime_Rapport_Stage_ESME_INGE3.docx` / `.pdf` | régénérés 10/09 (TOC mise à jour via Word) |

Slides soutenance (architectures) : `presentations/ST-EEGFormer_soutenance_ESME_2026-09-21_architectures.pptx` (3 slides, notes orateur FR ; script `pptx_build/build_defense_0921.js`).

## Consignes de fond (inchangées, toutes vérifiées le 10/09)

- Mean LOSO **uniquement** 53,55 % ± 3,20 % (41 plis, `acc1_whole` finetune). Ne pas citer le zero-shot ~56,7 % comme mean officiel.
- Ne pas présenter 53,5 % comme comparable tel quel au LOSO LaBraM ~62 %.
- ST-EEGFormer = patches continus + MAE (128 Hz, patch 16 = 125 ms, masque 75 %, MSE). LaBraM = VQ (200 Hz, patch 200 = 1 s, masque 50 %, entropie croisée sur indices).
- LDA 55,7 % = 8 sujets `part0`, pas 43.
- Sujets durs 004/019/020/031/046 = observation de la discussion du 2 sept., pas une analyse statistique.
- Tests EA / CSD / artefacts : code écrit, **non exécuté**. Aucun gain chiffré.

## Audit du 10/09 (soir) — ce qui a été vérifié, et contre quoi

| Affirmation | Source vérifiée |
|---|---|
| ST-EEGFormer : patch 16, masque 0,75, décodeur 512/8, mean pooling, TPE sinusoïdal / SPE appris, tailles S/B/L | code `models_vit_eeg.py`, `models_mae_eeg.py`, `utils.py` |
| Pré-entraînement : 0,1–64 Hz, 128 Hz, z-score par canal, fenêtres 6 s / pas 0,5 s, 142 électrodes, > 8 M segments, 16 × A100-80 Go, 32 614 h-GPU, 400 epochs | `STEEGFormer.pdf` (annexes E.3–E.5, texte relu le 10/09) |
| LaBraM : `TemporalConv` 15/8/7-3-3, 200 Hz, patch 200, base 200/12/10, mean pooling | code `labram.py` + `utils.py` |
| LaBraM : dictionnaire 8 192 × 64, masque 0,5, ~2 500 h, 5,8 M / 46 M / 369 M | article ICLR 2024 (tables 3–4, § 2.2–2.3) — **plus « à confirmer »** |
| Chiffres ch. 5–6 (55,7 · 51,0 · 49,49 · 50,39 · 26,39 · 25,56 · 61,66 · trajectoire ep. 30→49 · 55 min/epoch · 302 M) | tous retrouvés dans `torch-brain-eeg/notes/JOURNAL.md` complet (avril→sept.) |
| 32 références bibliographiques | DOI / arXiv / GitHub résolus un par un (HTTP 200/202 ou Crossref) |

**Cadre ESME** (source : mail scolarité + « Infos clés INGE3 » mars 2026, `G:\2ndCerveau`) : **pas de consignes de rédaction**, pas de canevas ; le barème est la grille Romanet (forme / missions / RSE obligatoire / outils-difficultés / compétences / recul). Couverture : vulgarisation (résumés, § 1.1), objectifs (§ 1.3–1.4), contexte labo + scientifique (ch. 2–3), RSE (§ 2.6), outils et difficultés (ch. 4–5), compétences (§ 8.2), recul (§ 7.8). Le PDF de la grille lui-même n’est plus sur ce poste (Téléchargements) — critères repris depuis le prompt du 20/08.

## Points restants avant dépôt

- Longueur : 54 pages **avec** page de garde, TOC, biblio et annexes ; le corps (ch. 1–8) tient dans la cible 40–50. Si Cuong trouve long : couper § 5 (chronologie) en premier.
- **Visa du laboratoire** (exigence ESME « rapport visé par l’entreprise ») : à obtenir de Cuong / Ishii-sensei avant le 14/09.
- Canevas / logos ESME : non disponibles ici.
- LDA sur 43 sujets : optionnel.

## Prochaines actions (ordre)

1. **Envoyer le DOCX/PDF à Cuong** pour relecture (≥ 1 semaine avant la soutenance du 21/09 → au plus tard 14/09).
2. Intégrer ses retours ; canevas école / logos si fournis.
3. Dépôt Moodle **14/09**.
4. **Deck soutenance 20 min complet — À FAIRE** (barème : clarté, visuel, pertinence, Q&A, originalité). Les 3 slides architecture ne sont qu’un bloc à insérer ; il faut : contexte/mission, données, pipeline, résultats (population + LOSO), difficultés, leviers § 7.7, bilan compétences, questions anticipées. Dry-run avant le 21/09.
5. Tests Liz (EA / laplacien / artefacts) sur mnode — non bloquant pour le dépôt.

## Rappels d’échéance

- Moodle : **lundi 14 septembre 2026** — https://moodle.esme.fr/course/view.php?id=1736
- Soutenance : **21 septembre 2026**, 10:00–11:00 CEST / 17:00–18:00 JST, Lamine Amour
- Convention : **30 septembre 2026**
