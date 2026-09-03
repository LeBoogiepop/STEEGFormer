# Prompt agent — Rapport de stage ESME INGE3
# À coller dans un NOUVEL Agent Cursor (voir LANCEMENT.md)

Modèle : **Claude Opus 4.6** ou **Claude Opus 5**, Thinking, **High**.
Pas Composer. Pas Grok pour rédiger. Pas Fast.

Workspace (Open Folder) :
`C:\Users\maxim\OneDrive\Bureau\COURS\2021 2026 - INGÉ\2025 2026 - INGE3\STAGE\POUR LE STAGE`

Tu ÉCRIS seulement dans `rapport-esme-inge3\`.
Tu LIS `torch-brain-eeg\` et `STEEGFormer\`. Tu ne modifies ni le code, ni `JOURNAL.md`, ni `G:\2ndCerveau`.

**Reprise :** `00_PLAN.md`, `00_page_de_garde.md`, `01_introduction.md`, `02_contexte_labo.md`, `05_travail_realise.md`, `06_resultats.md` existent déjà (v1, 20/08). Ne les jette pas : enrichis-les pour coller à la **grille ESME** ci-dessous (surtout RSE, vulgarisation, recul), puis rédige 03, 04, 07, 08.

---

Tu rédiges le rapport INGE3 de Maxime Lacombe (français, académique, factuel, **synthétique**).
**Ne pas inventer de mean LOSO. Ne pas dire « on est bloqués ».**
**Ne pas inventer d’organigramme ATR/Kyoto.** PDF absent → le dire et continuer.

L’école a écrit : **il n’existe pas de consignes de rédaction.** Le barème, c’est la grille Romanet (PDF `modèle_eval_rapport_et_soutenance_ingé3`). Chaque critère 0/1/2. Viser **2 partout**.

## Barème RAPPORT (à couvrir explicitement)

### 1. Forme
- Langue claire, **sans fautes**, structuré.
- Niveau 2 = **compréhensible par quelqu’un qui ne connaît pas le projet** (vulgarisation) + résumé pertinent.
- Synthèse, **sans redondances** (ne pas gonfler pour faire 50 pages).
- Qualité professionnelle (pas « scolaire »).

### 2. Missions
- Objectifs et missions **clairement énoncés** (convention + question FM vs décodeur).
- Tâches **contextualisées** dans l’organisation du labo (Ishii / Cuong / Liz, séminaire, cluster) **et** dans l’environnement scientifique (course aux FM EEG, ICLR 2026, BCI).
- **Développement durable / RSE (CRITÈRE OBLIGATOIRE, sinon 0)** : politique RSE de Kyoto University / labo **si tu la trouves en source** ; sinon : dire honnêtement que tu n’as pas de document RSE labo, analyser l’**impact** du projet (compute GPU/Slurm, 50 epochs, LOSO 43 plis ~1 fold/jour, énergie) et proposer des pistes **réalistes** (runs courts exigés par Ishii le 19/08, linear probe vs full FT, ne pas relancer BCI-IV-2a, partager checkpoints). **Ne pas inventer** une charte RSE japonaise.
- Techniques / outils / **difficultés** (conversion, layer_decay, Slurm) + maîtrise.
- Compétences techniques acquises, **énoncées**.
- Recul : situations → analyse → ce que ça change (diagnostic > « le modèle est nul »).

Dépôt : **Moodle** https://moodle.esme.fr/course/view.php?id=1736  
**5 jours ouvrés avant la soutenance du 21/09/2026 = lundi 14 septembre 2026.**  
Rapport visé labo avant Moodle. Pas confidentiel a priori (recherche acad.) — si Ishii dit confidential, main propre à Lamine Amour.

Volume **indicatif** (infos clés INGE3, mars 2026) : 40–50 p. hors annexes. La grille valorise la synthèse : **mieux 40 pages nettes que 50 redondantes**. ~12–15 000 mots hors annexes.

## Barème SOUTENANCE (pour plus tard, pas ce job)
20 min PPT + questions (créneau 1 h). Clarté, visuel, pertinence, Q&A, un peu d’originalité.  
**Distanciel : seul un mail du TUTEUR (Ishii) est pris en compte.** Hors scope rédaction.

## Qui / science

- Maxime Lacombe, ESME 5e année **3TD**. Convention **02/04–30/09/2026**, International Visiting Researcher, Ishii Lab, Kyoto University GSI.
- Tuteur ESME : **Shin Ishii**. Quotidien : **Cuong (Phi)**. Collègue : **Liz Costato** (LaBraM).
- Sujet : ST-EEGFormer (Yang et al., ICLR 2026) sur ATR spatial attention (Morioka 2014 ; 43 sujets, 8 s @ 256 Hz, 64 EEG), vs LaBraM, vs LDA, vs hasard 50 %.

**Population (seul résultat chiffré agrégé autorisé) :**

| Méthode | Test | vs 50 % |
|---|---|---|
| Hasard | 50 % | 0 |
| LDA | 55,7 % | +5,7 |
| ST-EEGFormer | **61,66 % ≈ 61,7 %** | +11,7 |
| LaBraM (Liz) | ~62 % | +12 |

Config : `layer_decay 1.0`, `mix_up 0.0`, `smoothing 0.1`, `lr 3e-4`, warmup 5, 50 ep, batch 4.  
ST-EEGFormer = patches continus + MAE (**pas VQ**). LaBraM = VQ. Analogie : STEEGF ≈ CAPT, LaBraM ≈ CalM.  
LOSO : **41/41 COMPLETED** au 2/09/2026. Mean autorisé : **53,55 % ± 3,20 %** (`acc1_whole` finetune). Ne pas inventer un autre mean.

## Lire (ordre)

1. Ce prompt + `rapport-esme-inge3\STATUT.md` + chapitres déjà là.
2. `torch-brain-eeg\notes\JOURNAL.md` (ancien en haut). **Ignore** `torch-brain-eeg\AGENTS.md` (périmé, encore G.2 BCI).
3. `STEEGFormer\AGENTS.md` + `README.md`
4. https://openreview.net/forum?id=5Xwm8e6vbh
5. Decks `STEEGFormer\presentations\` (séminaire 23/07, 勉強会 19/08). Slide 16 = archive Ishii → perspectives.
6. `notes\papers\README_meeting_2026-08-13.md`
7. Code : `PatchEmbed` / MAE / `prepare_atr_*` / `summarize_g2_json_logs.py` — citer, pas dumper.

Conflit : **JOURNAL > STEEGFormer/AGENTS.md > README > torch-brain-eeg/AGENTS.md**.

## Structure (ajuster la v1 existante)

| Ch. | Fichier | Grille |
|---|---|---|
| 0 | `00_page_de_garde.md` | vulgarisation = résumés FR/EN |
| 1 | `01_introduction.md` | objectifs clairement énoncés |
| 2 | `02_contexte_labo.md` | org. labo + contexte scientifique |
| 2bis | **section RSE** (dans ch. 2 ou ch. 7) | développement durable |
| 3 | `03_etat_de_lart.md` | **à écrire** |
| 4 | `04_methodes.md` | **à écrire** — outils + difficultés |
| 5 | `05_travail_realise.md` | tâches + recul (déjà v1) |
| 6 | `06_resultats.md` | déjà v1, population only |
| 7 | `07_discussion.md` | **à écrire** — recul + RSE compute + Ishii 19/08 |
| 8 | `08_conclusion.md` | compétences énoncées |
| | `BIBLIO.md` `ANNEXES.md` `STATUT.md` | |

## Interdits

- Mean LOSO inventé. Le chiffre autorisé (2 sept. 2026) est **53,55 % ± 3,20 %** (41 plis, `acc1_whole` finetune). Pas d’extrapolation 13/43.
- Tokenizer VQ pour ST-EEGFormer ; prétrain « à 256 Hz » (c’est 128 Hz + senloc).
- Confondre BCI-IV-2a (4 cl., hasard 25 %) et spatial attention (2 cl., 50 %).
- Attribuer les ~62 % LaBraM à Maxime.
- Inventer une politique RSE.
- Modifier journal, code, `raw/` du wiki.

## Ordre d’exécution

1. Relire v1 + JOURNAL.
2. Ajouter **RSE** (ch. 2 ou 7) et une passe vulgarisation (intro : 1 page lisible par Lamine Amour, pas que par Ishii).
3. Écrire 03, 04, 07, 08, biblio, annexes.
4. `STATUT.md` à jour + compte mots.
5. Ne pas produire le PPTX soutenance dans cette session.

Si tu t’arrêtes : `STATUT.md` dit le prochain fichier.
