# 1. Introduction et problématique

## 1.1 Présentation du sujet

Un casque EEG mesure, à travers le crâne, les minuscules tensions électriques produites par l’activité du cerveau. À partir de ce signal très bruité, on cherche à deviner ce que fait la personne : imaginer un mouvement, réagir à une erreur, ou — dans notre cas — **porter son attention à gauche ou à droite sans bouger les yeux**. Deviner correctement permettrait, à terme, de piloter une interface par la pensée : c’est l’objet des **interfaces cerveau–ordinateur** (BCI), utiles notamment pour des personnes privées de mobilité.

Le problème est que chaque cerveau, chaque casque et chaque journée donnent un signal différent. Historiquement, on construit donc un modèle sur mesure pour chaque personne et chaque expérience. Depuis quelques années, une autre approche est tentée, copiée sur celle qui a fait le succès des modèles de langue : entraîner un **très gros modèle générique** sur d’énormes quantités d’EEG non annoté, en lui faisant faire un exercice qui ne demande pas d’étiquettes — par exemple **masquer une partie du signal et lui demander de la reconstituer** — puis le réutiliser pour n’importe quelle tâche particulière. C’est ce qu’on appelle un **modèle de fondation**.

La question de ce stage est celle du titre de l’article qui lui sert de support : **ce détour vaut-il son coût ?** Concrètement, j’ai pris un modèle de fondation EEG récent, ST-EEGFormer, et je l’ai confronté sur les données du laboratoire à deux points de comparaison : un modèle de fondation concurrent, LaBraM, construit sur un principe opposé, et une méthode statistique classique et très simple. Le tout sur une tâche à deux réponses possibles, où répondre au hasard donne 50 %.

## 1.2 Cadre du stage

Le présent rapport rend compte d’un stage de fin d’études d’ingénieur (majeure 3TD, ESME Sudria), effectué du **2 avril au 30 septembre 2026** au **Ishii Laboratory**, Graduate School of Informatics, Kyoto University. J’ai été accueilli sous le statut **International Visiting Researcher**, compatible avec la convention de stage française. Le tuteur officiel est le professeur **Shin Ishii** ; l’encadrement quotidien a été assuré principalement par **Cuong (Phi)**. Une collègue de stage, **Liz Costato**, travaillait en parallèle sur **LaBraM**, sur le même jeu de données de laboratoire.

La mission inscrite à la convention porte sur l’application de modèles de fondation à des signaux biologiques, en particulier l’EEG, et sur le développement de méthodes de décodage tenant compte de la variabilité inter-individuelle. Le livrable scientifique attendu du laboratoire n’était pas un logiciel isolé, mais une **évaluation comparative reproductible** : un modèle de fondation EEG contre une baseline classique et contre LaBraM, sur une tâche du laboratoire.

## 1.3 Problématique scientifique

Les modèles de fondation ont transformé le traitement du langage et, plus récemment, d’autres modalités. Transposés à l’EEG, ils promettent des représentations pré-entraînées transférables d’un sujet, d’un capteur ou d’une tâche à l’autre. Cette promesse se heurte à des propriétés du signal : haute dimension spatio-temporelle, rapport signal/bruit faible, hétérogénéité des montages, et surtout **variabilité inter-sujets** qui rend le transfert direct difficile.

Le papier de Yang, Sun, Li et Van Hulle, *Are EEG Foundation Models Worth It?* (ICLR 2026), pose la question de façon frontale : une fois comparés à des décodeurs neuronaux « classiques » dans un benchmark commun, les modèles de fondation EEG justifient-ils leur coût de pré-entraînement ? Les auteurs y introduisent **ST-EEGFormer**, un transformeur de vision pré-entraîné par *masked autoencoder* (MAE) sur le signal brut, conçu comme témoin simple plutôt que comme architecture maximale. Quatre constats du papier structurent mon stage :

1. le *linear probing* — geler le modèle et n’apprendre qu’une couche linéaire — est faible : un fine-tuning de l’encodeur est en pratique nécessaire ;
2. les modèles de fondation ne dominent pas toujours, surtout quand les données sont peu nombreuses (l’ordre de grandeur de nos 43 sujets) ;
3. aucune loi d’échelle claire n’émerge : plus gros n’est pas fiablement meilleur ;
4. un MAE simple suffit : ST-EEGFormer-large obtient le meilleur rang moyen du benchmark une fois fine-tuné.

La question opérationnelle du stage, formulée avec Cuong en mai, était d’abord de **reproduire la figure G.2** du matériel supplémentaire (BCI Competition IV-2a, protocoles population / per-subject / leave-one-out). Cette cible a ensuite été **réorientée** vers les données d’**attention spatiale** du laboratoire (gauche/droite), plus alignées avec le travail de Liz et avec l’intérêt du groupe.

## 1.4 Objectifs et livrables

Objectifs que je me suis fixés, dans l’ordre où ils se sont clarifiés, avec le livrable associé :

| # | Objectif | Livrable attendu |
|---|---|---|
| 1 | Comprendre l’état de l’art des modèles de fondation EEG et l’écosystème du laboratoire (POYO / `torch_brain`, ligne de Liz) | séminaire de revue (avril), environnement POYO fonctionnel |
| 2 | Choisir un modèle implémentable — code, poids, licence — et son comparateur | décision documentée : ST-EEGFormer contre LaBraM |
| 3 | Rendre le benchmark **exécutable** hors de son environnement HPC d’origine | pipeline fonctionnel sous Windows, macOS puis Slurm |
| 4 | Obtenir un chiffre **population** honnête sur les données du laboratoire, avec baseline LDA et comparaison LaBraM | tableau comparatif à prétraitement identique |
| 5 | Lancer un protocole **leave-one-subject-out** (LOSO) | **41/41** plis `COMPLETED` (2 sept. 2026) ; mean finetune **53,55 % ± 3,20 %** |

Ce rapport d’ingénieur documente autant les **échecs méthodologiques** — BCI-IV-2a au niveau du hasard, conversion initiale sans prétraitement, hyperparamètres qui empêchaient l’apprentissage — que le résultat population du 6 juillet 2026. Un rapport de stage n’est pas un article ICLR : l’apport principal est la **chaîne** données → modèle → diagnostic → chiffre comparable, et la capacité à dire ce que ce chiffre ne prouve pas.

## 1.5 Organisation du rapport

Le chapitre 2 situe le laboratoire, son organisation, la tâche BCI et le paradigme d’attention spatiale, et traite la dimension de responsabilité sociétale et environnementale du travail mené. Le chapitre 3 présente l’état de l’art, du décodage classique aux modèles de fondation, et positionne précisément le sujet. Le chapitre 4 détaille les méthodes : données, prétraitement, adaptation du modèle, protocoles et infrastructure. Le chapitre 5 retrace le travail réalisé mois par mois, échecs compris. Le chapitre 6 donne les résultats (population **et** LOSO terminé). Le chapitre 7 discute les limites, les retours du laboratoire et les perspectives, et prend du recul sur la démarche. Le chapitre 8 conclut et énonce les compétences acquises.

Deux conventions de lecture, utiles pour éviter les contresens les plus fréquents sur ce travail :

- la tâche du laboratoire est **binaire** (gauche/droite), donc le hasard est à **50 %** ; le jeu public BCI-IV-2a a **quatre classes**, donc son hasard est à **25 %**. Un résultat de 26 % sur le second est un échec ; 62 % sur la première est un signal net ;
- ST-EEGFormer représente le signal par des **patches continus** et le reconstruit par MAE ; c’est **LaBraM** qui emploie un dictionnaire de tokens discrets. Les deux ne sont pas interchangeables, et cette distinction revient à plusieurs endroits du rapport.
