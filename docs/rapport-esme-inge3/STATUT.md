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
| `BIBLIO.md` | LaBraM = ICLR 2024 + code ; He & Wu 2020 (EA) |
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

## Points à vérifier avec Cuong / Liz avant dépôt

- § 3.5.2 : taille du dictionnaire LaBraM (8 192) et taux de masquage 50 % sont cités d’après l’article, pas depuis le code (absent du dépôt) — à confirmer avec Liz.
- Référence Morioka et al. (2014) toujours incomplète (BIBLIO n° 20).
- Longueur : 54 pages avec annexes ; cible ESME 40–50 p. Si besoin, couper en priorité l’annexe et le § 5 (chronologie).

## Prochaines actions (ordre)

1. **Envoyer le DOCX/PDF à Cuong** pour relecture (≥ 1 semaine avant la soutenance du 21/09 → au plus tard 14/09).
2. Intégrer ses retours ; canevas école / logos si fournis.
3. Dépôt Moodle **14/09**.
4. Deck soutenance 20 min complet (les 3 slides architecture sont prêtes à insérer).
5. Tests Liz (EA / laplacien / artefacts) sur mnode — non bloquant pour le dépôt.

## Rappels d’échéance

- Moodle : **lundi 14 septembre 2026** — https://moodle.esme.fr/course/view.php?id=1736
- Soutenance : **21 septembre 2026**, 10:00–11:00 CEST / 17:00–18:00 JST, Lamine Amour
- Convention : **30 septembre 2026**
