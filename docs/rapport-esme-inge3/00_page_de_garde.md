# Page de garde (brouillon Markdown)

**ESME Sudria** — Diplôme d’ingénieur, 5e année, majeure 3TD  
**Kyoto University** — Graduate School of Informatics, Ishii Laboratory

# Évaluation de ST-EEGFormer sur une tâche d’attention spatiale EEG  
### Rapport de stage de fin d’études

| | |
|---|---|
| Stagiaire | Maxime Lacombe |
| Période | 2 avril 2026 – 30 septembre 2026 |
| Statut d’accueil | International Visiting Researcher |
| Organisme | Kyoto University, Graduate School of Informatics — Ishii Laboratory |
| Tuteur de stage | Prof. Shin Ishii |
| Encadrement quotidien | Cuong (Phi) |
| École | ESME Sudria |
| Examinateur (soutenance) | Lamine Amour |

*Logos ESME / Kyoto University : à insérer quand les fichiers seront fournis. Canevas officiel école : non disponible sur ce PC au 10 septembre 2026.*

---

## Résumé

Ce stage de six mois au laboratoire Ishii (Kyoto) a consisté à évaluer un *foundation model* EEG, **ST-EEGFormer** (Yang et al., ICLR 2026), sur des enregistrements d’attention spatiale du laboratoire (jeu ATR / NBP, paradigme de type Morioka, 43 sujets, 2 classes gauche/droite). Le travail a d’abord porté sur la mise en place d’un environnement de recherche (revue de littérature, pipeline POYO/torch_brain sur la ligne de ma collègue Liz Costato), puis sur le choix et l’adaptation du benchmark ST-EEGFormer. Un premier essai de reproduction de la figure G.2 du papier sur BCI Competition IV-2a s’est révélé non informatif (performances au niveau du hasard). Le pivot vers les données de laboratoire a mis au jour un défaut de conversion (prétraitement absent, fenêtre trop courte). Après alignement sur le pipeline LaBraM de Liz, une LDA simple atteint 55,7 % ; ST-EEGFormer, une fois les hyperparamètres d’adaptation débridés, atteint **61,66 %** en protocole population, au niveau de LaBraM (~62 %). Un protocole *leave-one-subject-out* mené sur le cluster du laboratoire (41 plis terminés au 2 septembre 2026) donne **53,55 % ± 3,20 %** après calibration sur le sujet exclu : le transfert vers un sujet jamais vu reste la difficulté centrale. Le rapport décrit en détail l’architecture et l’algorithme des deux modèles de fondation comparés, analyse les leviers d’amélioration possibles, et documente le diagnostic d’ingénierie autant que ces résultats chiffrés.

**Mots-clés :** EEG, foundation models, ST-EEGFormer, attention spatiale, BCI, MAE, transfer inter-sujets.

## Abstract

This six-month internship at the Ishii Laboratory (Kyoto University) evaluated the EEG foundation model **ST-EEGFormer** (Yang et al., ICLR 2026) on a laboratory spatial-attention dataset (ATR/NBP, 43 subjects, left/right, 8 s epochs). After an initial literature review and a POYO/torch_brain setup, an attempt to reproduce the paper’s Figure G.2 on BCI-IV-2a remained at chance. Switching to in-house data revealed a conversion bug (missing preprocessing, 2 s instead of 8 s windows). Once aligned with the LaBraM pipeline, LDA reached 55.7 % and ST-EEGFormer reached **61.66 %** under a population protocol, matching LaBraM (~62 %). A leave-one-subject-out evaluation on the lab cluster (41 folds completed on 2 September 2026) yields **53.55 % ± 3.20 %** after calibration on the held-out subject, showing that cross-subject transfer remains the central difficulty. The report details the architecture and training algorithm of both foundation models, analyses possible improvement levers, and documents the engineering diagnosis alongside these figures.

**Keywords:** EEG, foundation models, ST-EEGFormer, spatial attention, BCI, MAE, cross-subject transfer.

---

## Remerciements

Je remercie le professeur Shin Ishii de m’avoir accueilli au laboratoire, Cuong (Phi) pour le cadrage scientifique et le suivi au quotidien, et Liz Costato pour le partage du pipeline de prétraitement et des résultats LaBraM sur le même jeu de données. Merci également à Yamakawa Azusa pour l’appui administratif, et à l’ESME (service des stages, Damien Romanet) pour la convention en statut *International Visiting Researcher*.

---

## Table des matières (prévisionnelle)

1. Introduction et problématique  
2. Contexte : laboratoire, BCI et attention spatiale  
3. État de l’art des EEG *foundation models*  
4. Matériel et méthodes  
5. Travail réalisé  
6. Résultats  
7. Discussion, limites et perspectives  
8. Conclusion  
Annexes · Bibliographie
