---
lang: fr
---

> **Copie concaténée du 20/08/2026 — périmée pour le LOSO.**  
> Éditer les chapitres `01_*.md` … `08_*.md`. Mean LOSO à jour : **53,55 % ± 3,20 %** (41 plis, 2 sept.).

**ESME Sudria** — Diplôme d’ingénieur, 5e année, majeure 3TD  
**Kyoto University** — Graduate School of Informatics, Ishii Laboratory

**Évaluation de ST-EEGFormer sur une tâche d'attention spatiale EEG**
*Rapport de stage de fin d’études*

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

*Brouillon à viser par le laboratoire avant dépôt Moodle (14 septembre 2026).*

---

## Résumé

Ce stage de six mois au laboratoire Ishii (Kyoto) a consisté à évaluer un *foundation model* EEG, **ST-EEGFormer** (Yang et al., ICLR 2026), sur des enregistrements d’attention spatiale du laboratoire (jeu ATR / NBP, paradigme de type Morioka, 43 sujets, 2 classes gauche/droite). Le travail a d’abord porté sur la mise en place d’un environnement de recherche (revue de littérature, pipeline POYO/torch_brain sur la ligne de ma collègue Liz Costato), puis sur le choix et l’adaptation du benchmark ST-EEGFormer. Un premier essai de reproduction de la figure G.2 du papier sur BCI Competition IV-2a s’est révélé non informatif (performances au niveau du hasard). Le pivot vers les données de laboratoire a mis au jour un défaut de conversion (prétraitement absent, fenêtre trop courte). Après alignement sur le pipeline LaBraM de Liz, une LDA simple atteint 55,7 % ; ST-EEGFormer, une fois les hyperparamètres d’adaptation débridés, atteint **61,66 %** en protocole population, au niveau de LaBraM (~62 %). Un protocole *leave-one-subject-out* a été lancé sur le cluster du laboratoire ; **aucun mean agrégé n’est reporté** tant que l’ensemble des plis n’est pas terminé. Le rapport documente le diagnostic d’ingénierie autant que ce résultat chiffré.

**Mots-clés :** EEG, foundation models, ST-EEGFormer, attention spatiale, BCI, MAE, transfer inter-sujets.

## Abstract

This six-month internship at the Ishii Laboratory (Kyoto University) evaluated the EEG foundation model **ST-EEGFormer** (Yang et al., ICLR 2026) on a laboratory spatial-attention dataset (ATR/NBP, 43 subjects, left/right, 8 s epochs). After an initial literature review and a POYO/torch_brain setup, an attempt to reproduce the paper’s Figure G.2 on BCI-IV-2a remained at chance. Switching to in-house data revealed a conversion bug (missing preprocessing, 2 s instead of 8 s windows). Once aligned with the LaBraM pipeline, LDA reached 55.7 % and ST-EEGFormer reached **61.66 %** under a population protocol, matching LaBraM (~62 %). A leave-one-subject-out evaluation is running on the lab cluster; **no aggregated LOSO mean is reported** until all folds complete.

**Keywords:** EEG, foundation models, ST-EEGFormer, spatial attention, BCI, MAE, cross-subject transfer.

---

## Remerciements

Je remercie le professeur Shin Ishii de m’avoir accueilli au laboratoire, Cuong (Phi) pour le cadrage scientifique et le suivi au quotidien, et Liz Costato pour le partage du pipeline de prétraitement et des résultats LaBraM sur le même jeu de données. Merci également à Yamakawa Azusa pour l’appui administratif, et à l’ESME (service des stages, Damien Romanet) pour la convention en statut *International Visiting Researcher*.


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```


**Table des matières**

```{=openxml}
<w:p>
  <w:r><w:fldChar w:fldCharType="begin"/></w:r>
  <w:r><w:instrText xml:space="preserve"> TOC \o "1-1" \h \z \u </w:instrText></w:r>
  <w:r><w:fldChar w:fldCharType="separate"/></w:r>
  <w:r><w:t>Clic droit ici, Mettre a jour le champ, puis Mettre a jour toute la table.</w:t></w:r>
  <w:r><w:fldChar w:fldCharType="end"/></w:r>
</w:p>
```


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

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
| 5 | Lancer un protocole **leave-one-subject-out** (LOSO) | travail Slurm 43 plis, avec la règle : **aucune moyenne tant que tous les plis ne sont pas terminés** |

Ce rapport d’ingénieur documente autant les **échecs méthodologiques** — BCI-IV-2a au niveau du hasard, conversion initiale sans prétraitement, hyperparamètres qui empêchaient l’apprentissage — que le résultat population du 6 juillet 2026. Un rapport de stage n’est pas un article ICLR : l’apport principal est la **chaîne** données → modèle → diagnostic → chiffre comparable, et la capacité à dire ce que ce chiffre ne prouve pas.

## 1.5 Organisation du rapport

Le chapitre 2 situe le laboratoire, son organisation, la tâche BCI et le paradigme d’attention spatiale, et traite la dimension de responsabilité sociétale et environnementale du travail mené. Le chapitre 3 présente l’état de l’art, du décodage classique aux modèles de fondation, et positionne précisément le sujet. Le chapitre 4 détaille les méthodes : données, prétraitement, adaptation du modèle, protocoles et infrastructure. Le chapitre 5 retrace le travail réalisé mois par mois, échecs compris. Le chapitre 6 donne les résultats, **en protocole population uniquement**. Le chapitre 7 discute les limites, les retours du laboratoire et les perspectives, et prend du recul sur la démarche. Le chapitre 8 conclut et énonce les compétences acquises.

Deux conventions de lecture, utiles pour éviter les contresens les plus fréquents sur ce travail :

- la tâche du laboratoire est **binaire** (gauche/droite), donc le hasard est à **50 %** ; le jeu public BCI-IV-2a a **quatre classes**, donc son hasard est à **25 %**. Un résultat de 26 % sur le second est un échec ; 62 % sur la première est un signal net ;
- ST-EEGFormer représente le signal par des **patches continus** et le reconstruit par MAE ; c’est **LaBraM** qui emploie un dictionnaire de tokens discrets. Les deux ne sont pas interchangeables, et cette distinction revient à plusieurs endroits du rapport.


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# 2. Contexte : laboratoire, BCI et attention spatiale

## 2.1 Le Ishii Laboratory

Le stage se déroule au **Ishii Laboratory** (論理生命学), Graduate School of Informatics, Kyoto University, campus Yoshida (Comprehensive Research Building No. 10). Le groupe travaille à l’interface de l’apprentissage automatique, du traitement de signaux biologiques et des neurosciences computationnelles. Dans la convention de stage, le mentorship est décrit ainsi : Ishii (apprentissage automatique), Phi (signaux biologiques), Katayama (neurosciences computationnelles). Dans la pratique quotidienne, Cuong (Phi) a cadré les objectifs de reproduction et Liz Costato a porté la ligne LaBraM sur le même dataset.

Le laboratoire s’appuie sur un **cluster GPU** (nœuds `kng*` / `gnode*`, ordonnanceur Slurm sur `mnode`). Les runs lourds de fine-tuning (fenêtre 8 s, modèle > 300 M de paramètres) n’étaient pas tenables sur CPU Mac ; ils ont été déportés sur ce cluster. Je n’ai pas d’organigramme officiel ATR/Kyoto à joindre : le journal de bord parle d’un ancrage **Kyoto / ATR** et d’un jeu **ATR NBP** (Neural Basis of Perception) pour l’attention spatiale. En l’absence d’un document institutionnel sur ce PC, je limite les affirmations à ce qui est attesté par le journal et la convention (Kyoto University, Ishii Lab).

La vie du groupe comprend un séminaire hebdomadaire et, à partir d’août 2026, un *paper reading club* croisant **foundation models EEG** et **imagerie calcique** (travaux Miyamoto / Hatsuta, papiers CalM et CAPT). Mon exposé du 19 août s’inscrit dans ce club, distinct de la soutenance ESME.

## 2.2 Interfaces cerveau–ordinateur et décodage EEG

Une interface cerveau–ordinateur (BCI) vise à inférer une intention ou un état à partir de l’activité cérébrale, ici l’**électroencéphalogramme**. Le décodage supervisé classique (CSP + LDA, réseaux convolutifs dédiés EEG, etc.) reste compétitif, surtout quand les données cibles sont peu nombreuses. Les FM EEG ajoutent une étape de pré-entraînement auto-supervisé sur de grands corpus, puis une adaptation (sonde linéaire ou fine-tuning) sur la tâche aval.

Deux difficultés structurent le stage :

- **Transfert inter-sujets.** Un décodeur entraîné sur l’ensemble de la population peut profiter d’un mélange de sujets ; un protocole *leave-one-subject-out* (LOSO) teste la généralisation à un sujet jamais vu, beaucoup plus proche d’un usage BCI réel.
- **Calibrage et prétraitement.** Avant toute architecture, le signal doit être filtré, référencé, découpé sur la bonne fenêtre d’intérêt. Une partie substantielle du stage a consisté à découvrir que le modèle n’était pas en cause lorsque les performances collaient au hasard.

## 2.3 La tâche d’attention spatiale

Le jeu utilisé in fine est un protocole d’**attention visuo-spatiale** gauche/droite, enregistré au laboratoire (données ATR NBP sur clé, ~43 sujets, archives `part0`…`part6`). D’après l’exploration de mai (MNE, sujet 003) : 68 canaux, 256 Hz, marqueurs 1 / 2 / 8 / 16, et un décompte typique de **12 essais Left + 12 Right + 24 Control** par session de tâche. La période d’attention utile retenue après alignement sur le pipeline de Liz est de **8 secondes** (2048 échantillons à 256 Hz), et non 2 s. Quatre canaux EOG sont typés à part : la référence moyenne et la sélection ViT portent sur **64 électrodes EEG**.

La tâche de classification est **binaire** (gauche vs droite). Le niveau de hasard est donc **50 %**, contrairement à BCI-IV-2a (4 classes, hasard 25 %). C’est un point de confusion fréquent : un 26 % sur BCI-IV-2a est un échec ; un 62 % sur l’attention spatiale est un signal clair au-dessus de 50 %.

Le paradigme est associé dans le journal et les présentations à **Morioka et al., 2014**. Le PDF complet n’est pas nécessairement sur ce PC ; je n’invente pas les détails du papier original au-delà de ce que le labo utilise opérationnellement (fenêtre d’attention 8 s, deux classes, 43 sujets).

## 2.4 Une mise en garde de lecture

Le papier ST-EEGFormer définit six protocoles d’évaluation, détaillés au § 3.4.5 et instanciés sur nos données au § 4.4. Retenir ici deux distinctions suffit pour la suite. D’une part, un résultat en protocole **population** — un modèle unique entraîné sur l’ensemble des sujets — ne mesure pas la même chose qu’un résultat **leave-one-subject-out**, qui seul évalue la performance sur un utilisateur jamais vu. D’autre part, les rangs du benchmark publié par Yang et al. concernent des **jeux publics**, pas les données ATR : ils illustrent l’état de l’art au chapitre 3 et ne sont en aucun cas mes chiffres de stage.

![Vue d’ensemble ST-EEGFormer (papier Yang et al.)](figures/fig_steegformer_overview.png)

**Figure 2.1.** Architecture MAE et protocoles d’évaluation de ST-EEGFormer, extraite du papier ICLR 2026 (Yang et al.). Source : `STEEGFormer/assets/graphic_overview.png`.

## 2.5 Organisation du travail : rôles, rituels et outils

Le stage s’est déroulé dans une organisation à trois niveaux, qu’il est utile d’expliciter parce qu’elle a structuré la répartition des tâches.

| Interlocuteur | Rôle effectif | Exemples de décisions |
|---|---|---|
| **Prof. Shin Ishii** (tuteur) | orientations stratégiques, arbitrage des sujets | répartition du 28 avril 2026 : Liz adapte POYO/CaPOYO vers l’EEG, j’évalue un modèle de fondation EEG, Cuong explore le jeu du laboratoire ; réorientation d’août vers le rapprochement EEG / imagerie calcique |
| **Cuong (Phi)** (encadrement quotidien) | objectifs opérationnels, revue des résultats, accès aux ressources | choix de commencer par ST-EEGFormer (mai) ; plan à deux semaines visant la figure G.2 ; feu vert au LOSO complet et orientation vers Slurm (juillet) |
| **Liz Costato** (collègue de stage) | ligne LaBraM sur le même jeu | prétraitement de référence, chiffres LaBraM, coordination du partage des données |

À cela s’ajoutent l’appui administratif de Yamakawa Azusa pour l’accueil en statut *International Visiting Researcher*, et des rituels collectifs : un **séminaire hebdomadaire** du laboratoire, des réunions **Group 3** en visioconférence, et à partir d’août un ***paper reading club*** croisant modèles de fondation EEG et imagerie calcique. J’y suis intervenu quatre fois : revue de littérature en avril, présentation d’article en mai, *progress talk* de stage le 23 juillet, exposé technique le 19 août.

Sur le plan des outils personnels, deux choix ont eu un effet direct sur la qualité du travail. D’une part, la tenue d’un **journal de bord daté** consignant chaque run, chaque configuration et chaque échec : c’est ce document qui permet, plusieurs mois après, de distinguer ce qui a été mesuré de ce qui a été supposé — et qui sert de source de vérité à ce rapport. D’autre part, la rédaction d’un **résumé de contexte technique** dans le dépôt, qui évite de reconstruire mentalement l’état du projet à chaque reprise, notamment après un changement de machine.

## 2.6 Responsabilité sociétale et environnementale du travail mené

### 2.6.1 Périmètre : ce que je peux affirmer

Aucun document de politique RSE propre au laboratoire ne m’a été communiqué, et je n’en invente pas. Cette section s’en tient donc à ce qui est mesurable et attesté dans mon propre travail : l’**empreinte de calcul** des expériences que j’ai lancées, les **leviers de sobriété** effectivement appliqués, ceux qui restent à appliquer, et le traitement des **données humaines** manipulées.

### 2.6.2 L’empreinte de calcul, chiffrée

Le domaine dans lequel s’inscrit ce stage est intrinsèquement coûteux en énergie, et le papier support en donne une mesure rare : le pré-entraînement de ST-EEGFormer a consommé **32 614 heures·GPU** sur une configuration de 16 GPU A100-80 Go, pour 400 epochs sur plus de 8 millions de segments. Les auteurs publient ce chiffre en soulignant eux-mêmes le coût du développement des modèles de fondation EEG et l’importance d’un reporting transparent de leur empreinte. Le simple fait de partir d’un point de contrôle publié plutôt que de pré-entraîner soi-même évite donc, à l’échelle du laboratoire, un coût de cet ordre de grandeur.

À mon échelle, les ordres de grandeur relevés dans le journal de bord sont les suivants.

| Expérience | Coût observé (ordre de grandeur) | Valeur scientifique produite |
|---|---|---|
| Runs BCI-IV-2a : population 100 epochs à ~3 h/epoch, puis LOO 9 plis × 150 epochs | plusieurs centaines d’heures·GPU | validation de l’infrastructure ; **aucun résultat exploitable** (niveau du hasard) |
| Run population 43 sujets, 50 epochs à ~55 min/epoch | de l’ordre de 45 h·GPU | le résultat principal du stage |
| LOSO 43 plis (50 + 30 epochs par pli) | environ **un pli par jour** sur GPU dédiée, soit plusieurs semaines de calcul continu | en cours |
| Sonde linéaire, encodeur gelé (2 050 paramètres entraînables) | ~21 s/epoch, ~1,8 Go de mémoire GPU | diagnostic rapide |

Le contraste de la dernière ligne est instructif : entre une sonde linéaire et un fine-tuning complet, le coût varie de plus de deux ordres de grandeur pour une même question posée aux données. Une part importante de la sobriété consiste simplement à **choisir le protocole le moins cher qui réponde à la question**.

### 2.6.3 Leviers effectivement appliqués

- **Reprise par pli.** Un marqueur `COMPLETED` est écrit à la fin de chaque pli LOSO ; une relance après expiration de la limite de temps Slurm ne recalcule pas les plis déjà terminés. Sur un travail de 43 plis, ce mécanisme évite de reproduire des semaines de calcul.
- **Tests de fumée avant runs longs.** Le travail de validation Slurm a été lancé sur une seule epoch puis annulé dès la chaîne validée, précisément pour ne pas consommer une quinzaine d’heures de GPU sans nouvelle information.
- **Ne pas relancer BCI-IV-2a.** Après trois protocoles au niveau du hasard, ce jeu a été explicitement écarté comme cible du séjour plutôt que relancé « pour voir » avec d’autres réglages. C’est probablement la décision la plus économe du stage.
- **Réglage mémoire plutôt que cycle plantage-relance.** L’ajustement de la taille de lot et l’activation de segments mémoire extensibles ont supprimé les dépassements mémoire qui, sinon, faisaient perdre l’intégralité d’un run avancé.
- **Suivi d’expériences hors ligne.** L’outil de suivi est utilisé en mode déconnecté et l’agrégation se fait a posteriori sur les journaux JSON locaux. Bénéfice double : aucune invite bloquante n’interrompt un run, et aucune donnée n’est transmise à un service externe.

### 2.6.4 Leviers identifiés, à appliquer

- **Runs courts et informatifs.** C’est la recommandation explicite du professeur Ishii le 19 août 2026 : un cycle de test de deux semaines est trop long. Réduire le nombre d’epochs, restreindre le nombre de sujets ou utiliser la variante *base* plutôt que *large* pour trancher une hypothèse permet à la fois d’aller plus vite et de consommer moins.
- **Sonde linéaire comme filtre amont.** Avant tout fine-tuning complet, une sonde linéaire indique, pour un coût marginal, si les représentations gelées contiennent déjà l’information cherchée.
- **Réduction de la taille de modèle.** Les travaux d’imagerie calcique discutés au laboratoire indiquent qu’un modèle réduit atteint des performances comparables ; c’est une piste directement transposable, d’autant que le papier support constate lui-même l’absence de loi d’échelle claire sur les jeux BCI.
- **Partager plutôt que recalculer.** Mettre à disposition les points de contrôle fine-tunés et les jeux prétraités issus de la conversion v2 évite à la personne suivante de refaire conversion et entraînement. C’est le même raisonnement qui justifie de réutiliser un point de contrôle public au lieu de pré-entraîner.

### 2.6.5 Données humaines et sobriété informationnelle

Les enregistrements utilisés sont des mesures EEG sur participants humains, fournies par le laboratoire. Ils sont manipulés sous **identifiants numériques** (`002`, `003`, …), sans information nominative dans les fichiers ni dans les journaux d’exécution, et sont restés sur les machines fournies par le laboratoire et sur son cluster. Le suivi d’expériences étant en mode déconnecté, aucun signal ni métadonnée de sujet n’a été déposé sur un service tiers, et les échanges de données se sont limités au périmètre du laboratoire.

### 2.6.6 Dimension sociétale du sujet

L’objet final de ces travaux — décoder une intention ou une attention à partir de l’EEG — relève des technologies d’assistance : communication et contrôle pour des personnes en situation de handicap moteur, rééducation, suivi de vigilance. Cette finalité justifie l’effort de calcul, mais elle impose aussi une exigence de mesure honnête : dans un domaine où les performances annoncées conditionnent des attentes cliniques, un benchmark qui évite de surestimer un modèle a une utilité propre. C’est précisément la démarche du papier support — comparer aux méthodes classiques, tester statistiquement, publier son empreinte de calcul — et c’est la raison pour laquelle ce rapport préfère annoncer un statut plutôt qu’une moyenne LOSO incomplète.


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# 3. État de l’art : du décodage EEG classique aux modèles de fondation

Ce chapitre fixe le vocabulaire et les repères nécessaires pour lire les chapitres suivants. Il est écrit pour un lecteur ingénieur qui ne travaille pas sur l’EEG : chaque notion est introduite avant d’être utilisée. Les affirmations chiffrées attribuées à des publications sont issues du texte de ces publications ; celles qui viennent du code du dépôt ST-EEGFormer sont signalées comme telles.

## 3.1 L’EEG en trois propriétés utiles

L’**électroencéphalographie** (EEG) mesure, à la surface du crâne, les variations de potentiel électrique produites par l’activité synchrone de larges populations de neurones. C’est une mesure non invasive, peu coûteuse, à très bonne résolution temporelle (quelques millisecondes) mais à faible résolution spatiale : chaque électrode intègre l’activité de plusieurs centimètres carrés de cortex, filtrée par le crâne et le scalp.

Trois propriétés du signal expliquent l’essentiel des difficultés rencontrées pendant ce stage.

1. **Rapport signal/bruit très défavorable.** L’activité liée à la tâche ne représente qu’une fraction de l’amplitude totale, noyée dans l’activité de fond, les artefacts oculaires et musculaires et le bruit secteur (50 ou 60 Hz). D’où le poids déterminant du prétraitement — filtrage, référencement, correction de ligne de base. Sans lui, aucun décodeur, aussi gros soit-il, ne fonctionne : le chapitre 5 montre que c’est exactement ce qui s’est produit sur notre première conversion de données.
2. **Non-stationnarité et variabilité inter-individuelle.** L’anatomie, l’impédance des électrodes, la stratégie mentale du sujet et sa fatigue modifient la relation entre signal et étiquette. Un décodeur appris sur un sujet ne se transpose pas mécaniquement à un autre : c’est le problème du **transfert inter-sujets**, au cœur du protocole *leave-one-subject-out* utilisé aux chapitres 4 et 6.
3. **Hétérogénéité des montages.** Le nombre d’électrodes, leur position (nomenclatures 10-20 / 10-10) et la fréquence d’échantillonnage varient d’un laboratoire à l’autre. Un modèle pré-entraîné doit donc savoir quoi faire d’un montage qu’il n’a jamais vu — question qui revient au chapitre 7 sous la forme du mapping de canaux et du rééchantillonnage.

Une **interface cerveau–ordinateur** (BCI, *brain–computer interface*) exploite ce signal pour inférer une intention ou un état : imagerie motrice (imaginer un mouvement), potentiels évoqués (P300, ERN), potentiels visuels stationnaires (SSVEP), ou — comme ici — **attention spatiale couverte** (porter son attention à gauche ou à droite sans bouger les yeux).

## 3.2 Les décodeurs « classiques » : une base de comparaison qui tient

Avant l’apprentissage profond, la BCI s’est construite sur une chaîne explicite : filtrer, extraire des descripteurs interprétables, classer avec un modèle linéaire.

- **CSP** (*Common Spatial Patterns*, Ramoser et al., 2000) et son extension par bancs de filtres **FBCSP** (Ang et al., 2008) apprennent des filtres spatiaux qui maximisent le contraste de variance entre deux classes. C’est la référence historique de l’imagerie motrice, et c’est aussi la piste suggérée par le professeur Ishii le 19 août 2026 pour l’attention spatiale.
- Les **classifieurs riemanniens** (Congedo et al., 2017) traitent les matrices de covariance des essais comme des points d’une variété courbe, ce qui apporte une robustesse notable en petit régime de données.
- Pour les SSVEP, **FBCCA** (Chen et al., 2015) et **TRCA** (Nakanishi et al., 2018) exploitent la structure fréquentielle du stimulus et restent difficiles à battre.
- L’**analyse discriminante linéaire** (LDA) est le classifieur linéaire minimal. C’est celui que nous utilisons comme témoin au chapitre 6, sur des descripteurs élémentaires (moyenne et variance par canal).

Sont ensuite arrivés des **réseaux convolutifs compacts** conçus pour l’EEG : **DeepConvNet** (Schirrmeister et al., 2017), **EEGNet** (Lawhern et al., 2018), puis des architectures hybrides convolution + attention comme **EEG Conformer** (Song et al., 2023) et **CTNet** (Zhao et al., 2024). Leur particularité : quelques dizaines de milliers à quelques millions de paramètres — trois à quatre ordres de grandeur sous les modèles de fondation — pour des performances qui restent, sur beaucoup de jeux BCI, très compétitives.

Ce point est essentiel pour la suite : dans le domaine BCI, **la baseline classique n’est pas un homme de paille**. Toute affirmation de progrès doit lui être opposée.

## 3.3 Ce qu’un « modèle de fondation » signifie pour l’EEG

Un **modèle de fondation** (*foundation model*, FM) est un grand modèle pré-entraîné de façon **auto-supervisée** sur de grandes quantités de données non annotées, puis adapté à des tâches aval. « Auto-supervisé » signifie que la cible d’apprentissage est fabriquée à partir du signal lui-même — par exemple masquer une partie du signal et demander au modèle de la reconstruire — et non fournie par un annotateur humain. C’est la recette qui a fait le succès des modèles de langue, puis de la vision.

Deux modes d’adaptation aval doivent être distingués, car ils structurent toute la littérature.

| Mode | Ce qu’on entraîne | Ce que cela mesure |
|---|---|---|
| **Sonde linéaire** (*linear probing*) | une seule couche linéaire, encodeur **gelé** | la qualité intrinsèque des représentations pré-entraînées |
| **Fine-tuning** | l’encodeur **entier** et la tête | ce que le modèle peut atteindre après adaptation |

Le pari du domaine EEG est qu’un pré-entraînement massif produise des représentations réutilisables d’un montage, d’un sujet et d’un paradigme à l’autre, ce qui éviterait de repartir de zéro à chaque expérience. Les principaux modèles publiés avant ce stage :

| Modèle | Année | Représentation du signal | Objectif auto-supervisé |
|---|---|---|---|
| **BENDR** (Kostas et al.) | 2021 | convolutions puis transformeur | masquage + contrastif |
| **BIOT** (Yang et al.) | 2023 | tokenisation par canal, montage bipolaire | pré-entraînement masqué |
| **LaBraM** (Jiang et al.) | 2024 | **tokens discrets** (quantification vectorielle) | prédiction de tokens masqués |
| **EEGPT** (Wang et al.) | 2024 | patches, alignement de représentations | auto-supervision sur représentations |
| **CBraMod** (Wang et al.) | 2025 | patches, attention *criss-cross* | reconstruction masquée locale et globale |

C’est ce panorama que j’ai présenté au séminaire du laboratoire vers le 10 avril 2026, à partir de la revue *EEG Foundation Models: A Critical Review of Current Progress and Future Directions* remise par le professeur Ishii. **Remarque de traçabilité :** seul le support de présentation que j’ai construit est présent sur la machine de rédaction ; le PDF de la revue lui-même ne s’y trouve pas. Je ne cite donc de cette revue que ce que mon propre support atteste, sans lui attribuer de chiffres.

Un point de vocabulaire mérite d’être isolé, car il a occupé deux réunions du laboratoire (6 et 13 août 2026) : **« tokenisation » ne désigne pas la même opération selon les modèles.** Dans LaBraM, chaque morceau de signal est remplacé par l’indice d’un mot dans un dictionnaire appris (*codebook*, quantification vectorielle) : la représentation est **discrète** et l’objectif d’apprentissage est une classification sur ces indices. Dans un ViT appliqué au signal brut, chaque morceau est projeté linéairement en un vecteur : la représentation reste **continue** et l’objectif est une régression du signal. Les deux familles se disent « masquées » ; elles ne prédisent pas la même chose.

## 3.4 ST-EEGFormer (Yang, Sun, Li & Van Hulle, ICLR 2026)

Le papier retenu comme support du stage est *Are EEG Foundation Models Worth It? Comparative Evaluation with Traditional Decoders in Diverse BCI Tasks*, accepté à ICLR 2026, produit par le laboratoire de neuro- et psychophysiologie de la KU Leuven, avec un code publié sous licence MIT. *Note d’accès : la page OpenReview du papier n’a pas pu être consultée depuis la machine de rédaction (page de vérification anti-robot). Les éléments cités ci-dessous proviennent du PDF de l’article et de son matériel supplémentaire, ainsi que du dépôt de code.*

### 3.4.1 La question posée

Le titre est une question, et c’est la contribution principale : **les modèles de fondation EEG valent-ils leur coût** face aux décodeurs traditionnels ? Les auteurs reprochent à la littérature trois faiblesses : évaluation sur un ou deux protocoles seulement, absence de tests statistiques, absence de comparaison aux méthodes classiques non neuronales. Ils construisent donc une grille : cinq modèles de fondation publiés plus le leur, chacun en sonde linéaire **et** en fine-tuning, face à quatre réseaux convolutifs compacts et à un ensemble de décodeurs classiques, sur sept tâches de classification et deux tâches de régression, selon six protocoles, avec tests non paramétriques (Wilcoxon apparié, permutation, Mann–Whitney U) et correction de Bonferroni.

**ST-EEGFormer** (*spatiotemporal EEGFormer*) est introduit dans ce cadre non comme l’architecture ultime, mais comme un **témoin volontairement simple**. L’enjeu est explicite : LaBraM avait avancé que l’auto-encodage masqué sur EEG brut ne converge pas correctement, ce qui justifiait des objectifs de pré-entraînement plus élaborés. Si un ViT pré-entraîné uniquement par MAE sur le signal brut se révèle compétitif après fine-tuning, cette justification tombe.

### 3.4.2 Architecture

L’architecture suit la recette **ViT** (Dosovitskiy et al., 2021), transposée au signal.

- **Découpage en patches spatio-temporels.** Chaque *token* est un court segment temporel d’**un seul canal**. Dans le code (`PatchEmbedEEG`, `benchmark/neural_networks/models/models_vit_eeg.py`), c’est un `torch.nn.Unfold` de noyau et de pas 16 échantillons — donc des patches **non recouvrants** — suivi d’un `nn.Linear(16, embed_dim)`. À 128 Hz, un patch représente 125 ms d’un canal. **Il n’y a ni dictionnaire, ni recherche du plus proche voisin, ni indice discret** : c’est un plongement continu.
- **Deux encodages positionnels.** Un encodage **temporel** sinusoïdal (`TemporalPositionalEncoding`, comme dans le Transformer original) indique *quand* ; un plongement **spatial appris** (`ChannelPositionalEmbed`, table `nn.Embedding(145, embed_dim)`) indique *quelle électrode*. Un *token* de classe est ajouté en tête, comme dans un ViT.
- **Attention plate canal × temps.** Tous les patches, toutes électrodes et tous instants confondus, forment **une seule séquence**. L’auto-attention est celle d’un ViT standard, non causale : un patch du canal C3 à t = 1 s peut attendre un patch de Oz à t = 3 s. Attention inter-canaux et attention temporelle vivent donc dans **le même softmax** ; il n’y a pas de bloc « axe des canaux » séparé.
- **Trois tailles**, définies dans le code : *small* (dimension 512, 8 blocs, 8 têtes), *base* (768, 12, 12) et *large* (1024, 24, 16), toutes avec des patches de 16 échantillons. La variante *large*, celle que nous utilisons, dépasse 300 millions de paramètres (environ 302 M mesurés dans nos journaux d’exécution).

### 3.4.3 Le pré-entraînement : MAE, et rien d’autre

Le pré-entraînement est un **auto-encodeur masqué** (MAE, He et al., 2022) :

1. 75 % des *tokens* sont masqués aléatoirement ;
2. l’encodeur ne voit **que** les *tokens* visibles ;
3. les *tokens* masqués sont réinsérés à leur position, avec leurs encodages positionnels ;
4. un décodeur plus léger (512 dimensions, 8 blocs dans le code) traite la séquence complète ;
5. une couche `nn.Linear(decoder_dim, patch_size)` prédit les **16 valeurs d’échantillons** de chaque patch ;
6. la perte est l’**erreur quadratique moyenne** entre patches prédits et patches vrais, **moyennée uniquement sur les patches masqués** (`forward_loss`, `pretrain/models_mae_eeg.py`).

Autrement dit, la cible d’apprentissage est le signal lui-même — des amplitudes — et non un indice de dictionnaire. C’est la différence de fond avec LaBraM, et la raison pour laquelle l’analogie avec les modèles d’imagerie calcique du laboratoire (§ 3.6) fonctionne.

Le coût de ce pré-entraînement est documenté par les auteurs, ce qui est rare et directement exploitable pour la section RSE du chapitre 2 : plus de **8 millions de segments EEG** issus d’une douzaine de jeux publics et d’un jeu interne, fenêtres de **6 s** avec pas de 0,5 s, prétraitement minimal (notch, passe-bande 0,1–64 Hz, rééchantillonnage à **128 Hz**, standardisation par canal), couverture de **142 électrodes distinctes**, 400 epochs sur une configuration de **16 GPU A100-80 Go**, pour un total déclaré de **32 614 heures·GPU**.

### 3.4.4 L’adaptation aval

Au fine-tuning, le décodeur MAE est **jeté** ; seul l’encodeur est conservé. Il n’y a plus de masquage : la séquence complète est encodée, les *tokens* sont fusionnés (par moyenne, choix par défaut de ST-EEGFormer, les auteurs montrant en annexe que le *token* de classe seul fait moins bien) et une tête linéaire produit la classe ou la valeur régressée.

Deux mises en garde du papier ont directement servi ce stage. D’abord, **la sonde linéaire est faible presque partout** : les représentations pré-entraînées ne sont pas prêtes à l’emploi, sauf sur une tâche facile de détection (ERN) où elles saturent. Ensuite, les auteurs pointent des **facteurs cachés d’implémentation** : certains modèles utilisent des têtes multi-couches tout en annonçant du *linear probing* — la capacité est alors dissimulée dans la tête — et la stratégie de fusion des *tokens* change le champ réceptif effectif. Comparer deux dorsales exige donc de standardiser la tête ; c’est l’une des contributions de loyauté du benchmark.

### 3.4.5 Les six protocoles d’évaluation

La contribution méthodologique du papier est cette grille, reprise telle quelle dans notre vocabulaire de travail.

| # | Protocole | Définition | Ce qu’il interroge |
|---|---|---|---|
| 1 | **Population** | un modèle entraîné sur les données regroupées de tous les sujets, testé sur chacun | motifs partagés ; régime riche en données |
| 2 | **Per-subject (self)** | un modèle par sujet, testé sur lui-même | BCI classique calibrée par utilisateur ; régime pauvre |
| 3 | **Per-subject (transfer)** | modèle du sujet A testé sur le sujet B | transférabilité d’un modèle individuel |
| 4 | **LOO zero-shot** | entraînement sur tous sauf un, test sur l’exclu **sans adaptation** | déploiement direct sur un nouvel utilisateur |
| 5 | **LOO fine-tune** | idem, puis adaptation limitée sur l’exclu | coût de calibration d’un nouvel utilisateur |
| 6 | **LOO drop** | perte de performance sur les autres sujets après cette adaptation | oubli catastrophique |

Le protocole que nous appelons **LOSO** au chapitre 6 correspond au protocole 5 appliqué à nos 43 sujets. Le protocole 1 est celui de notre résultat principal.

### 3.4.6 Les résultats du benchmark

Le résultat de synthèse est un **rang moyen** agrégé sur les jeux, les métriques, les sujets et les six protocoles : plus le rang est petit, meilleur est le modèle. Attention à la notation, source classique de confusion : le suffixe `-s`/`-b`/`-l` désigne la **taille** (small, base, large) et la lettre entre parenthèses le **mode d’adaptation** — `(f)` fine-tuning, `(l)` sonde linéaire.

| Modèle | Rang moyen |
|---|---|
| **ST-EEGFormer-l (f)** | **5,61** |
| CTNet (réseau convolutif compact, sans pré-entraînement) | 6,42 |
| ST-EEGFormer-b (f) | 6,55 |
| ST-EEGFormer-s (f) | 7,25 |
| LaBraM (f) | 8,99 |
| ST-EEGFormer-l (l) | 11,50 |
| LaBraM (l) | 13,36 |

Quatre conclusions en découlent, et elles ont servi de fil rouge à tout le stage.

1. **La sonde linéaire est faible et dépend fortement de la tâche.** Le fine-tuning est en pratique nécessaire.
2. **Les FM ne sont pas universellement meilleurs.** Ils dominent en régime riche (population) mais ne surpassent pas significativement les réseaux compacts, ni parfois les méthodes classiques, en régime pauvre ou par sujet. Nos 43 sujets se situent précisément dans ce régime.
3. **Pas de loi d’échelle claire.** Plus gros n’est pas fiablement meilleur sur ces jeux BCI, alors que le temps de calcul croît vite : le goulot d’étranglement est la taille des jeux de données, non celle du modèle. Les auteurs appellent d’ailleurs à construire un « ImageNet de l’EEG », qui n’existe pas.
4. **Un pré-entraînement simple suffit.** Le MAE brut atteint le meilleur rang moyen après fine-tuning ; les écarts avec des pré-entraînements plus complexes s’estompent largement après adaptation, ce que les auteurs corroborent par des cartes d’attention nettement modifiées par le fine-tuning.

![Rangs moyens du benchmark ST-EEGFormer](figures/fig_steegformer_ranks.png)

**Figure 3.1.** Rangs moyens du benchmark (figure 3 du papier Yang et al., ICLR 2026). Vert : réseaux convolutifs classiques ; violet : sondes linéaires ; rouge : fine-tuning complet. Rappel de notation : `-l` = *large*, `(l)` = sonde linéaire, `(f)` = fine-tuning.

## 3.5 LaBraM, le contrepoint discret

**LaBraM** (Jiang et al., 2024) est la ligne suivie en parallèle par Liz Costato, ce qui en fait le point de comparaison naturel de ce stage. Sa mécanique est en deux étapes : un **tokeniseur neuronal** quantifie chaque patch, canal par canal, en un code discret issu d’un dictionnaire appris ; un transformeur est ensuite pré-entraîné à prédire les codes masqués à partir de leur contexte — schéma directement inspiré de la modélisation de langue masquée. Les modèles publiés ont été pré-entraînés sur environ 2 500 heures d’EEG issues d’une vingtaine de jeux ; c’est le point de contrôle `labram-base` qui est utilisé au laboratoire.

Le contraste avec ST-EEGFormer se résume en quatre lignes.

| | ST-EEGFormer | LaBraM |
|---|---|---|
| Représentation | patches **continus** (Unfold + Linear) | **tokens discrets** (quantification vectorielle) |
| Objectif auto-supervisé | MSE sur les échantillons masqués | prédiction des codes masqués |
| Attention | un ViT plat sur la séquence canal × temps | transformeur sur tokens discrets |
| Rang moyen après fine-tuning (Yang et al.) | 5,61 | 8,99 |

Il faut lire ce tableau pour ce qu’il est : un classement **dans ce benchmark**. Le papier ne conclut pas que LaBraM est inutile, mais que la complexité supplémentaire d’un tokeniseur discret ne se traduit pas clairement par un gain aval **après fine-tuning**. Le fait que nos deux lignes de travail arrivent autour de 62 % sur la même tâche de laboratoire (chapitre 6) est cohérent avec cette lecture.

## 3.6 Un détour utile : les modèles de fondation en imagerie calcique

À partir d’août 2026, le laboratoire a lancé un *paper reading club* croisant EEG et **imagerie calcique bi-photonique**, à la demande du professeur Ishii. Ce détour n’est pas décoratif : il a clarifié la position exacte du modèle que j’évaluais.

- **CalM** (arXiv 2604.04958) construit un **tokeniseur à quantification vectorielle** sur l’activité neuronale, puis un transformeur *dual-axis* autorégressif (un axe « neurones », un axe « temps »).
- **CAPT** (arXiv 2607.23258) supprime ce dictionnaire : patches **continus**, objectif autorégressif en MSE de bout en bout, transfert inter-espèces à dorsale gelée. Il surpasse CalM.

L’analogie qui en résulte, et que j’ai présentée au laboratoire les 13 et 19 août 2026, est directement utile :

> **ST-EEGFormer ≈ CAPT** (représentation continue, reconstruction du signal) · **LaBraM ≈ CalM** (représentation discrète, prédiction de codes).

L’intérêt pratique de cette mise en correspondance est double. D’une part, elle a corrigé une erreur que j’avais commise le 6 août en décrivant ST-EEGFormer comme « tokenisé » : la lecture du code montre l’inverse. D’autre part, elle déplace la question de recherche. L’idée « se passer de tokenisation » est **déjà réalisée** du côté EEG ; ce qui reste à importer du côté calcique, c’est la stratégie d’auto-supervision et d’**invariance d’identité** — retirer l’identité du neurone, et par analogie celle de l’électrode — qui, dans les travaux du laboratoire, améliore la transférabilité tout en réduisant le nombre de paramètres.

Le laboratoire dispose enfin d’une troisième ligne, celle de **POYO** (Azabou et al., NeurIPS 2023) et de son implémentation `torch_brain`, modèle de fondation pour l’activité de populations neuronales enregistrées en électrophysiologie, ainsi que de **POCO** côté prévision d’activité calcique. Mon travail d’avril a consisté à faire tourner cette ligne (chapitre 5) : c’est le contexte technique dans lequel s’insère la comparaison EEG.

## 3.7 Positionnement du stage

L’état de l’art laisse ouverte une question que le laboratoire pouvait trancher avec ses propres données :

> Sur une tâche d’attention spatiale de laboratoire — 2 classes, 43 sujets, montage 64 canaux absent du pré-entraînement — que vaut un modèle de fondation EEG fine-tuné face à un second modèle de fondation de conception opposée (discrète) et face à une baseline linéaire, à prétraitement et protocole strictement identiques ?

Trois éléments donnent son intérêt à cette question. Le régime est celui, **petit N**, où Yang et al. annoncent que les FM perdent leur avantage. La comparaison est **appariée** : même jeu, même prétraitement, deux dorsales de familles opposées, une baseline linéaire commune. Enfin, le résultat reste informatif même s’il est « négatif » : si les deux FM se rejoignent, cela conforte la quatrième conclusion du papier plutôt que d’élire un vainqueur. Le chapitre 4 décrit les moyens mis en œuvre pour y répondre.


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# 4. Matériel et méthodes

Ce chapitre décrit **ce qui a été mis en place** : les données, la chaîne de prétraitement, l’adaptation du modèle, les protocoles d’évaluation, l’infrastructure de calcul et les moyens de reproductibilité. Le chapitre 5 raconte ensuite l’ordre dans lequel tout cela s’est construit, y compris les impasses.

## 4.1 Les données : attention spatiale ATR NBP

### 4.1.1 Le paradigme

Le jeu utilisé est un protocole d’**attention visuo-spatiale couverte** enregistré au laboratoire (données ATR NBP, *Neural Basis of Perception*). À chaque essai, le sujet fixe un point central et porte son attention **à gauche ou à droite** sans mouvement oculaire ; la tâche de décodage est donc **binaire**, et le niveau du hasard est **50 %**. Ce paradigme est associé, dans le journal de bord et les présentations du laboratoire, aux travaux de **Morioka et al. (2014)**. Le PDF de cet article n’étant pas disponible sur la machine de rédaction, je m’en tiens à ce que le laboratoire utilise opérationnellement — fenêtre d’attention de 8 s, deux classes, 43 sujets — sans extrapoler sur le protocole original.

### 4.1.2 Contenu brut

Les données sont fournies au format **EEGLAB** (`.set` / `.fdt`), réparties en sept archives `part0.tar.gz` … `part6.tar.gz` (environ 14 Go compressés) contenant au total **43 sujets**, identifiés par un numéro à trois chiffres (`002`, `003`, …). Chaque sujet dispose de plusieurs sessions de tâche (`<sujet>_task_<n>_.set`).

| Caractéristique | Valeur |
|---|---|
| Sujets | 43 |
| Canaux | 68 enregistrés, dont **4 EOG** (`SO2`, `IO2`, `LO1`, `LO2`) → **64 EEG utiles** |
| Fréquence d’échantillonnage brute | 256 Hz, **certains fichiers à 512 Hz** |
| Essais par session de tâche | typiquement 12 *Left* + 12 *Right* + 24 *Control* |
| Fenêtre d’attention retenue | **8 s** (2048 échantillons à 256 Hz) |

Les événements sont codés dans les annotations EEGLAB : `255` début d’expérience, `64` début de bloc, `128` fin de bloc, `16` début de repos, `8` début de la période **contrôle**, `1` attention **gauche**, `2` attention **droite**.

Un piège d’outillage mérite d’être signalé, car il a un effet silencieux et destructeur : `mne.events_from_annotations` renumérote les annotations **par ordre alphabétique** si on ne lui fournit pas de dictionnaire explicite. Sans le mapping `{"1": 1, "2": 2, "8": 8, "16": 16, …}`, les étiquettes gauche/droite peuvent être permutées ou fusionnées sans qu’aucune erreur ne soit levée. Le script de conversion impose donc ce mapping.

## 4.2 Chaîne de prétraitement (conversion « v2 »)

La conversion produit, pour chaque sujet, un fichier `.pkl` au format attendu par le *dataloader* du benchmark : `trainX`, `trainY`, `testX`, `testY`, avec `X` de forme `(n_essais, 68, 2048)` en microvolts et `Y` dans `{"left", "right"}`. Le script est `util/prepare_atr_nbp_spatial_attention.py`, réécrit pour reproduire le pipeline LaBraM de Liz Costato (`set_to_pkl.py` / `set_to_h5.py`) — c’est-à-dire pour que les deux modèles comparés voient **exactement le même signal**.

Étapes, dans l’ordre :

1. **Typage des voies EOG.** Les quatre électrodes oculaires sont déclarées de type `eog`, ce qui les exclut du calcul de la référence.
2. **Référence moyenne** sur les seules voies EEG (`set_eeg_reference("average")`).
3. **Filtrage passe-bande 0,1–75 Hz**, FIR à phase nulle (fenêtre de Hamming), puis **notch à 60 Hz** (fréquence du secteur à Kyoto).
4. **Rééchantillonnage à 256 Hz** pour homogénéiser les sessions enregistrées à 512 Hz.
5. **Découpage par essai** : pour chaque événement `8` (contrôle), on cherche le prochain événement `1` ou `2` ; l’essai est rejeté si un autre événement contrôle/attention s’intercale.
6. **Correction de ligne de base** : soustraction, canal par canal, de la moyenne de la période contrôle qui précède immédiatement l’essai.
7. **Extraction de la fenêtre d’attention de 8 s** à partir de l’onset (2048 échantillons).
8. **Découpage train/test par session** : sessions 1–6 en apprentissage, 7–8 en test lorsque huit sessions sont disponibles, avec repli automatique proportionnel pour les sujets incomplets (par exemple 1–4 / 5–6). Le découpage se fait donc **par session, jamais par essai**, afin d’éviter toute fuite entre sessions voisines.

Les essais `Control` ne sont pas utilisés comme classe : ils servent de référence de ligne de base. La sortie typique d’un sujet complet est `(144, 68, 2048)` en apprentissage, avec des classes équilibrées (96/96 en tenant compte du test).

Trois paramètres de configuration accompagnent ces données, dans `dataset_specs_lab_spatial_attention.yaml` : `fs: 256`, `n_channels: 68`, `task_time: 8`, ainsi que la liste ordonnée des noms d’électrodes — indispensable pour la mise en correspondance des canaux décrite ci-dessous. La valeur `task_time` est critique : laissée à `2`, elle fait lire au modèle 2 s sur les 8 s disponibles, ce qui a été l’une des causes de l’échec initial (chapitre 5).

## 4.3 Adaptation du modèle aux données du laboratoire

Le point de contrôle utilisé est `STEEGFormer_large_weights_only_196.pth` (environ 1,2 Go), variante *large* publiée par les auteurs. Trois adaptations sont nécessaires entre nos données et ce que le modèle attend.

**Mise en correspondance des électrodes.** Le plongement spatial du modèle est une table de 145 emplacements indexée par un identifiant d’électrode, construit au pré-entraînement sur 142 électrodes distinctes. Le fichier `pretrain/senloc_file/sen_chan_idx.pkl` associe un nom d’électrode (`Fz`, `C3`, …) à son index. Nos 68 voies sont donc traduites en indices ; les 4 voies EOG n’ont pas de correspondance et sont écartées, ce qui laisse le message `keep 64 channels for ViT model` dans les journaux. Ce détail n’est pas cosmétique : lorsque ce fichier est absent, le code d’origine se replie sur un **mapping identité** (`Fz → 0` au lieu de `Fz → 25`), et le modèle reçoit des positions spatiales fausses. Nous avons observé l’effet de ce repli, puis l’avons corrigé (chapitre 5).

**Rééchantillonnage à la fréquence native du modèle.** Le modèle a été pré-entraîné à **128 Hz** ; nos données sont à 256 Hz. La transformation appliquée aux données aval (`ViTDataTransformerWithChannelSelection`, `util/data_transform.py`, instanciée dans `util/utils.py` pour tout modèle dont le nom contient `vit`) rééchantillonne de `downstream_task_fs` vers **128 Hz**, normalise chaque canal de chaque essai, puis sélectionne les canaux. Concrètement, une fenêtre de 8 s devient donc **1024 échantillons**, soit 64 patches de 16 échantillons par canal, soit **64 × 64 = 4096 *tokens*** en entrée de l’encodeur — quatre fois plus long qu’avec la fenêtre de 2 s initiale, ce qui explique directement les contraintes mémoire décrites au § 4.5.

**Tête de classification.** Le décodeur MAE est abandonné ; l’encodeur est suivi d’une fusion des *tokens* par moyenne (`global_pool=avg`) et d’une tête linéaire à 2 sorties. La fonction de coût est une entropie croisée à cibles souples (`SoftTargetCrossEntropy`), compatible avec le lissage d’étiquettes utilisé.

## 4.4 Protocoles, baseline et métriques

Trois protocoles du chapitre 3 ont été exercés sur les données du laboratoire.

| Protocole | Mise en œuvre concrète | Usage dans ce rapport |
|---|---|---|
| **Population** | un seul modèle entraîné sur la réunion des ensembles d’apprentissage des 43 sujets, évalué sur la réunion des ensembles de test | résultat principal (chapitre 6) |
| **Per-subject** | un modèle par sujet, évalué sur le test du même sujet | diagnostic d’optimisation |
| **LOSO (LOO fine-tune)** | 43 plis : entraînement sur 42 sujets, puis adaptation et test sur le sujet exclu | lancé sur le cluster, **aucune moyenne reportée** |

**Métrique.** La grandeur suivie est `test_whole_acc1`, l’exactitude top-1 sur l’ensemble du test agrégé. Elle est extraite des journaux JSON par le script `scripts/summarize_g2_json_logs.py`, qui parcourt l’arborescence de sortie, lit la dernière ligne JSON non vide de chaque journal, privilégie la phase de *finetune* lorsqu’elle existe, et calcule moyenne et écart-type **sur les plis effectivement terminés**. C’est cet outil qui rend la règle « pas de moyenne partielle » vérifiable plutôt que déclarative.

**Baseline LDA.** Pour disposer d’un témoin indépendant du réseau, une analyse discriminante linéaire est appliquée aux mêmes fichiers `.pkl` : les descripteurs sont la **moyenne et la variance par canal** sur la fenêtre d’attention (soit 2 × 64 valeurs par essai), et le classifieur est entraîné et testé selon le même découpage de sessions. Cette baseline est volontairement grossière : elle ne cherche pas à concurrencer un CSP bien réglé, mais à répondre à une question binaire — **le signal contient-il, oui ou non, de l’information gauche/droite ?** C’est ce rôle de sonde qui en a fait l’instrument de diagnostic décisif du chapitre 5.

## 4.5 Infrastructure de calcul

Le stage a utilisé cinq environnements successifs, ce qui a demandé un travail de portabilité non négligeable.

| Machine | Matériel | Rôle |
|---|---|---|
| PC Windows (Python 3.10) | GPU grand public | installation initiale POYO, premiers essais du benchmark |
| MacBook Pro du laboratoire (Python 3.11) | CPU uniquement | développement, préparation des données, journal |
| `kng07` / `kng08` | 2 × Tesla V100 32 Go, partagées (MPS) | runs population et per-subject |
| `gnode01` | 3 × RTX 4500 Ada | run *leave-one-out* de secours |
| `kng11` / `kng12` via Slurm | 4 × A6000 / 8 × A4000 | LOSO complet |

Quelques contraintes d’exploitation apprises en pratique, et intégrées aux scripts :

- **Slurm passe par `mnode`** (`10.232.11.170`) après `module load slurm/23.02.7`. L’ancien nœud de connexion documenté sur le wiki (`10.229.63.172`) n’existe plus, ce qui explique un blocage réseau initial : deux réseaux distincts, et une page de documentation obsolète.
- **`num_workers = 0`** sur les systèmes de fichiers en NFS : avec des workers, un blocage se produit à la fin d’epoch, entre l’évaluation et les processus de chargement.
- **Nœuds partagés** : sur `kng08`, les GPU peuvent être saturées par les travaux d’un autre utilisateur ; on vérifie `nvidia-smi` et le propriétaire des processus avant de lancer, et on ne tue jamais un travail qui n’est pas le sien.
- **Mémoire.** Avec la fenêtre de 8 s (4096 *tokens*) et le modèle *large*, un lot de 4 tient sur 32 Go mais provoque un dépassement mémoire sur 16 Go, où il faut descendre à 2 avec `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`. Il ne faut pas descendre à 1 : le code ignore les lots de taille unitaire.
- **Sessions détachées** (`screen`, `nohup`) ou soumission `sbatch` pour tout run long, la mise en veille d’une machine locale interrompant le calcul.

## 4.6 Reproductibilité et adaptations du code

Le dépôt publié suppose un environnement HPC particulier (chemins `/lustre1/...`, greffons non versionnés, Weights & Biases interactif). Les modifications suivantes ont été nécessaires pour l’exécuter ailleurs, et sont documentées comme telles pour ne pas les confondre avec la contribution scientifique du papier :

- fichiers de spécification de jeux de données locaux, remplaçant les chemins HPC (`dataset_specs_local_bci_iv2a.yaml`, `dataset_specs_lab_spatial_attention.yaml`) ;
- import optionnel d’une dépendance SSVEP absente, qui faisait échouer l’ensemble du module ;
- chargement tolérant du point de contrôle ViT (avec ou sans clé `model`) ;
- repli explicite et **journalisé** lorsque `sen_chan_idx.pkl` est absent, au lieu d’un mapping identité silencieux ;
- fonction de coût de classification corrigée (`SoftTargetCrossEntropy`) ;
- mode **hors ligne** forcé pour Weights & Biases (`--disable_wandb`), afin d’éviter les invites bloquantes et toute transmission de données vers un service externe ;
- corrections de robustesse de journalisation (métrique vide, appels de journalisation lorsque le suivi est désactivé) ;
- **marqueur `COMPLETED` par pli** dans la boucle d’évaluation : un travail relancé reprend là où il s’est arrêté au lieu de tout recalculer. C’est le mécanisme qui rend un LOSO de 43 plis exploitable sous une limite de temps de travail Slurm, et qui évite de dépenser deux fois le même calcul (voir § 2.5) ;
- scripts d’orchestration : PowerShell pour Windows, `run_loo.sh` puis `run_loo.slurm` pour le cluster, et `summarize_g2_json_logs.py` pour l’agrégation hors ligne.

**Hyperparamètres retenus** pour le run population et pour le LOSO (les valeurs et leur justification sont discutées au chapitre 5) :

```text
--optimizer_spec finetune --layer_decay 1.0 --lr 0.0003
--mix_up 0.0 --smoothing 0.1 --clip_grad 1.0
--train_epochs 50 --train_warmup_epochs 5
--finetune_epochs 30 --finetune_warmup_epochs 3
--train_batch_size 4 --finetune_batch_size 4 --num_workers 0
```

Le seul paramètre dont l’effet mérite d’être explicité ici est `layer_decay`. Ce mécanisme, hérité de BEiT et de MAE, applique un taux d’apprentissage décroissant vers les couches d’entrée : la couche d’indice *i* reçoit un facteur `layer_decay^(N−i)`. Avec 24 blocs et la valeur par défaut de 0,75, le facteur appliqué aux premières couches vaut `0,75^25 ≈ 7,5 × 10⁻⁴` ; avec un taux de base de 3 × 10⁻⁴, le plongement de patches apprend à environ 2 × 10⁻⁷ par pas, c’est-à-dire **pas du tout**. Fixer `layer_decay = 1.0` rend le même taux à toutes les couches. Ce calcul, fait à partir de `util/lr_decay.py`, est la raison pour laquelle le modèle est passé du hasard à 61,66 % (chapitres 5 et 6).


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# 5. Travail réalisé

Ce chapitre suit l’ordre chronologique du journal de bord. Les chiffres détaillés de juillet sont repris au chapitre 6 ; ici l’objet est la **chaîne d’ingénierie** : ce qui a été mis en place, ce qui a échoué, ce qui a été corrigé.

## 5.1 Avril — Intégration et ligne POYO

Dès l’arrivée (début avril), un MacBook Pro du laboratoire m’a été attribué. Ishii-sensei a présenté Liz Costato et la répartition des sujets. Les premiers documents de lecture (`EEG_STATE`, revue *EEG Foundation Models: A Critical Review…*) ont abouti, vers le 10 avril, à un **séminaire interne** sur l’état de l’art des FM EEG (LaBraM, BIOT, etc.).

En parallèle, j’ai cloné **torch_brain** (Azabou et al., POYO, NeurIPS 2023) pour comprendre la ligne de Liz. Sous Windows (Python 3.10, venv), j’ai installé `torch_brain[dev]`, Lightning, Weights & Biases, et **brainsets** depuis GitHub (la version PyPI minimale ne convenait pas au dataset Perich–Miller). Plusieurs correctifs locaux ont été nécessaires : fichier Hydra `train.yaml` manquant, `recording_ids` optionnel, callback `MemInfo` qui appelait `cat /proc/meminfo` (Linux) et faisait échouer Windows, workers Ray. Un premier forward POYO (~11,9 M de paramètres) a produit une *train_loss* ; les *epochs* CPU étaient trop lentes pour un entraînement complet, ce qui était acceptable en phase d’installation.

Le 21–22 avril, bascule Mac (Python 3.11) : arborescence `STAGE ISHI/`, CaPOYO sur données Allen déjà présentes, 94 tests pytest verts. Le 28 avril, Ishii a tranché : **Liz** adapte POYO/CaPOYO vers l’EEG ; **je** choisis et évalue un FM EEG ; Cuong explore le dataset labo.

## 5.2 Mai — Choix de ST-EEGFormer et plan Cuong

Le 7 mai, après la revue et l’avis d’Ishii/Cuong, le choix est : **ST-EEGFormer** (principal, code MIT, challenge NeurIPS 2025, papier ICLR 2026) et **LaBraM** (comparaison). BIOT, BrainWave, NeuroLM sont écartés pour l’instant. Le dataset **ATR NBP** est identifié sur la clé (~14 Go compressés, ~43 sujets). Cuong confirme par mail : commencer par ST-EEGFormer, comprendre les modèles, **reproduire les résultats du papier**.

Le 14 mai, présentation Group 3 (Zoom) : Liz sur l’architecture, moi sur le papier et le benchmark. Le 18 mai, extraction `part0` (sujets 002–009), exploration MNE (68 ch, 256 Hz). Le 21 mai, plan à deux semaines de Cuong : supplementary, figure **G.2**, *leave-one-out fine-tune*, Appendix E & F, checkpoints ST-EEGFormer-large et LaBraM. Quatre messages du papier sont déjà le fil rouge : linear probing faible, FM pas toujours meilleurs en petit N, pas de scaling clair, MAE suffisant (rang ~5,61 pour la variante large).

Fin mai : téléchargement du supplementary, venv benchmark, premiers scripts d’orchestration Windows (`run_g2_*.ps1`) et patches pour sortir des chemins `/lustre1/...` du code upstream.

## 5.3 Juin — BCI-IV-2a, puis pivot labo

Début juin, reprise « propre » vers la figure G.2 sur **BCI Competition IV-2a** (9 sujets, 22 canaux, 4 classes, 1024 samples). Le pipeline devient exécutable (préparation MOABB → `.pkl`, détection de 9 runs). Les runs population / LOO aboutissent à des exactitudes de l’ordre de **26 %**, soit le **hasard à 4 classes**. Ce n’est pas un résultat à publier ; c’est un test de bout en bout qui valide l’infrastructure et disqualifie BCI-IV-2a comme cible principale pour *ce* séjour.

Le 10 juin, arrêt des runs Mac trop lents et préparation des **données labo** left/right (script `prepare_atr_nbp_spatial_attention.py`, YAML dédié). Huit sujets `002.pkl`…`009.pkl`, 68 canaux, 2 classes — mais encore une fenêtre de **2 s**. Le 16 juin, un run population « papier » (100 epochs) sur BCI se termine sans signal utile. Le 19 juin, un LOO BCI échoue sur `kng08` puis relance sur `gnode01`.

## 5.4 23 juin – 3 juillet — Le bug de conversion, puis le bug d’entraînement

Sur la conversion initiale (2 s, pas de filtre), ST-EEGFormer et une **LDA** (moyenne et variance par canal) restent au hasard (~50 % et LDA 51,0 %). Même en per-subject (train et test sur le même sujet), ST-EEGFormer donne ~50,4 %. Donc ce n’est **pas** uniquement un problème de transfert inter-sujets.

La comparaison avec `set_to_pkl.py` / `set_to_h5.py` de Liz montre que ma conversion **sautait le prétraitement** :

| Étape | Conversion v1 (hasard) | Alignée Liz (v2) |
|---|---|---|
| Filtrage | aucun | bandpass 0,1–75 Hz + notch 60 Hz |
| Référence | aucune | moyenne (EEG only) |
| Baseline | aucune | moyenne de la période contrôle |
| Fenêtre | 2 s (512 éch.) | **8 s** (2048 éch. @ 256 Hz) |
| Fréquence | 256 Hz supposé | resample → 256 Hz |
| Sujets | 8 (`part0`) | **43** (`part0`–`part6`) |

Autre piège MNE : sans mapping explicite des annotations (`"1":1`, `"2":2`, …), les codes d’événements sont renumérotés par ordre alphabétique. EOG exclus de la référence et de la sélection ViT (64 canaux gardés). YAML : `task_time: 2 → 8`.

LDA sur v2, 8 premiers sujets : **55,7 %** (de 39,6 % à 70,8 %). Le signal est dans les données ; le profil (quelques sujets décodables, d’autres au hasard) correspond à ce que Liz observait.

ST-EEGFormer sur v2, en revanche, **ne fit pas son train** (per-subject ~50,6 % alors que la LDA est à 55,7 % ; population 43 sujets, *train* et *test* plats à ~50 % jusqu’à l’epoch 20). Un modèle de ~302 M de paramètres qui ne mémorise pas 144 essais n’est pas un problème de données : c’est un **problème d’optimisation**. Les brides lues dans la config (`layer_decay=0.75`, warmup long, mixup, tête initialisée très petit) empêchaient le backbone de bouger. Un *linear probe* (encodeur gelé) a d’abord divergé (lr trop fort).

Le 3 juillet, les 43 sujets sont extraits (7 archives ; `part4_2` / `part5_2` doublement tarés) et reconvertis en `spatial_attention_v2`.

## 5.5 6–7 juillet — Population 61,66 %

Le correctif d’entraînement : **`layer_decay 1.0`**, **`mix_up 0.0`**, *smoothing* 0,1, warmup 5, `lr 3e-4`, 50 epochs, batch 4, `kng08`. La courbe reste au hasard jusqu’à ~25 epochs (warmup), puis le test monte : 58,4 % (ep. 30), 61,5 % (ep. 40), **61,66 %** (ep. 49). Agrégation confirmée par `summarize_g2_json_logs.py`. Cuong qualifie le résultat de prometteur et donne le feu vert pour un **LOSO complet** (43 plis) via Slurm.

## 5.6 Mi-juillet – 23 juillet — Cluster, LOSO, séminaire

L’accès Slurm n’était pas immédiat (`sbatch` absent tant que le module n’est pas chargé ; ancienne IP `10.229.63.172` hors service). À partir du 13 juillet : `mnode` + `module load slurm/23.02.7`. Test de fumée validé, travail LOSO soumis (`77622` sur `kng11`, puis suivi sous d’autres IDs dont `109704`). **Aucun mean n’est calculé** sur un sous-ensemble de plis.

Le **23 juillet**, séminaire / *progress talk* du laboratoire (~12–15 min) : population 61,7 % vs LaBraM ~62 % vs LDA 55,7 % ; LOSO présenté comme **en cours**. Retours : retrainer le backbone *from scratch*, plus de données, mieux rapporter la confiance ; Cuong : un **delta de quelques points** ouvrirait une trajectoire papier.

## 5.7 Août — Club EEG ↔ calcium et exposé technique

Le 6 août, LOSO toujours *running* sur `kng11` (**13/43** `COMPLETED`, limite 30 jours). Meeting Group 3 : Ishii oriente vers les FM d’imagerie calcique (CalM, et en réalité CAPT pour l’idée « patches continus »). Correction importante, après lecture du code `PatchEmbedEEG` : ST-EEGFormer n’a **pas** de codebook VQ ; c’est LaBraM qui tokenise de façon discrète. Analogie : **ST-EEGFormer ≈ CAPT**, **LaBraM ≈ CalM**.

Le 13 août, *paper reading club*. Dates du 勉強会 inversées par mail Ishii le 17 : **18 août** = CalM/POCO (j’écoute), **19 août** = exposé ST-EEGFormer (~20 min, **sans LOSO**). Consignes d’Ishii après le talk : cycle de tests trop lent (« 2 weeks too long ») ; préférer une **corrélation** à la MSE (trop forte sur l’amplitude) ; machine plus puissante au 1er septembre ; pistes calibration, fine-tune, CSP ; homework sur le **resample 128 Hz** du pré-entraînement et le mapping `senloc` (ce n’est pas « le même système » que le 256 Hz labo).

## 5.8 Ce qui est du code amont, ce qui est mien

Le modèle, le MAE et le benchmark viennent du dépôt Yang et al. (MIT pour le code). J’ai ajouté : configs locales (plus de `/lustre1`), préparation ATR, YAML spatial attention v2, scripts Windows/Slurm, correctifs W&B/CPU, agrégation des logs, et les decks de séminaire. Liz fournit le prétraitement de référence et les chiffres LaBraM. Je n’attribue pas ses exactitudes à mon implémentation.

## 5.9 Difficultés rencontrées, outils employés, maîtrise acquise

Le tableau ci-dessous récapitule les obstacles réellement rencontrés, leur nature — car les confondre est la principale source de perte de temps —, la façon dont ils ont été levés, et ce que j’en maîtrise aujourd’hui.

| Difficulté | Nature réelle | Résolution | Maîtrise acquise |
|---|---|---|---|
| Dépôt supposant un environnement HPC (`/lustre1/...`, greffons absents, suivi d’expériences interactif) | portabilité, non scientifique | fichiers de spécification locaux, imports optionnels, mode déconnecté forcé | savoir rendre exécutable un code de recherche hors de son contexte d’origine, sans en modifier la logique |
| Mapping de canaux en repli identité (`Fz → 0` au lieu de `Fz → 25`) | entrée du modèle silencieusement fausse | chargement du fichier `sen_chan_idx.pkl` fourni dans le dépôt, et repli désormais journalisé | méfiance systématique envers les valeurs de repli silencieuses ; vérification de la présence du message `keep 64 channels` dans les journaux |
| Conversion des données sans filtrage, sans référence, sans ligne de base, avec une fenêtre de 2 s au lieu de 8 s | prétraitement du signal | réécriture du script sur le modèle du pipeline LaBraM de référence | chaîne de prétraitement EEG sous MNE, et compréhension chiffrée de l’effet de chaque étape |
| Renumérotation alphabétique des annotations par MNE | convention d’outil non documentée | mapping d’événements explicite | lire les conventions par défaut d’une bibliothèque comme des hypothèses à vérifier |
| Modèle de 302 M de paramètres n’apprenant pas 144 exemples | optimisation, pas données | `layer_decay` de 0,75 à 1,0, `mix_up` à 0, échauffement raccourci | lecture d’une politique de taux d’apprentissage par couche et calcul de son effet réel |
| Sonde linéaire divergente (perte de 13 à 72) | taux d’apprentissage inadapté à la tête seule | réduction du taux pour le régime encodeur gelé | distinguer les régimes d’optimisation « tête seule » et « modèle entier » |
| Dépassement mémoire GPU avec la fenêtre de 8 s | séquence quatre fois plus longue (4096 *tokens*) | taille de lot 4 sur 32 Go, 2 sur 16 Go, segments extensibles ; jamais 1 (ignoré par le code) | dimensionnement mémoire d’un transformeur en fonction de la longueur de séquence |
| Blocage en fin d’epoch sur système de fichiers réseau | interaction *workers* / NFS | `num_workers = 0` sur le cluster | diagnostic de blocages d’entrées-sorties distinctes d’un plantage de calcul |
| GPU saturées par les travaux d’un autre utilisateur | ressource partagée | vérification préalable de l’occupation et du propriétaire des processus, bascule de nœud | usage d’un cluster partagé, y compris ses règles non écrites |
| Point d’entrée Slurm documenté inexistant | documentation obsolète | question factuelle à l’encadrant, puis `mnode` + `module load slurm/23.02.7` | soumission et suivi de travaux Slurm, et art de poser une question technique avec ses preuves |
| Travail de 43 plis sous limite de temps | ordonnancement | marqueur `COMPLETED` par pli, relance idempotente | conception de calculs longs reprenables |

Outils employés au quotidien : Python 3.10/3.11, PyTorch, `timm`, MNE, scikit-learn, NumPy ; Git et GitHub pour un dépôt partagé avec ma collègue ; PowerShell et Bash pour l’orchestration ; `screen`, `nohup` et Slurm pour les runs longs ; `nvidia-smi` pour le suivi GPU ; Hydra et Lightning côté POYO ; `pptxgenjs` pour la génération scriptée des supports de présentation.


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# 6. Résultats

Sauf mention contraire, tous les chiffres de ce chapitre viennent du journal de bord (entrées 23 juin–7 juillet 2026) et de l’agrégation `summarize_g2_json_logs.py`. **Aucun mean LOSO n’est reporté.**

## 6.1 Contrôle négatif : BCI Competition IV-2a

Sur BCI-IV-2a (4 classes, hasard = 25 %), les runs population et leave-one-out du pipeline ST-EEGFormer se sont établis autour de **25–26 %**. Ce niveau ne permet pas de discuter le modèle : il indique que, dans *cette* configuration et sur *ce* séjour, la reproduction de la figure G.2 n’a pas produit de signal. La suite du chapitre porte exclusivement sur l’**attention spatiale** laboratoire (2 classes, hasard = **50 %**).

## 6.2 Diagnostic sur la conversion (8 sujets, puis v2)

**Conversion v1** (2 s, pas de filtre, 8 sujets `002–009`) :

| Protocole | Exactitude | Lecture |
|---|---|---|
| LOO-finetuning ST-EEGFormer | 49,49 ± 1,77 % | hasard |
| Per-subject ST-EEGFormer (sujet entraîné) | 50,39 ± 1,62 % | hasard |
| LDA (moyenne + variance / canal) | 51,0 % | quasi hasard |

Même en entraînant et testant sur le **même** sujet, ST-EEGFormer reste à 50 %. Le défaut n’est donc pas réductible au cross-sujet.

**Conversion v2** (prétraitement Liz, 8 s, 256 Hz). LDA sur les 8 premiers sujets :

| Sujet | LDA v2 |
|---|---|
| 002 | 64,6 % |
| 003 | 52,1 % |
| 004 | 66,7 % |
| 005 | 52,1 % |
| 006 | 43,8 % |
| 007 | 70,8 % |
| 008 | 56,2 % |
| 009 | 39,6 % |
| **Moyenne** | **55,7 %** |

![Prétraitement v1 versus v2](figures/fig_pipeline_v1_v2.png)

**Figure 5.1.** Chaîne de conversion des données d’attention spatiale : version initiale (juin) et version alignée sur le pipeline de Liz (v2). Le signal redevient décodable à partir de la v2 (LDA 55,7 %).

Le signal est présent, avec une grande variabilité inter-sujets (002, 004, 007 clairement au-dessus du hasard ; 006 et 009 en dessous). C’est le profil déjà observé par Liz sur LaBraM.

ST-EEGFormer en *full fine-tune* per-subject sur cette v2 restait à **50,59 ± 1,43 %** sur le sujet entraîné, avec une *train_acc* elle-même autour du hasard. Les données n’étaient plus en cause (la LDA le prouve) ; l’optimisation du ViT l’était (voir § 5.4).

## 6.3 Résultat principal : population, 43 sujets

Jeu : `spatial_attention_v2`, 43 sujets, fenêtre 8 s, 64 canaux EEG utiles.  
Modèle : ST-EEGFormer (checkpoint *large* pré-entraîné).  
Config : `--optimizer_spec finetune --layer_decay 1.0 --lr 0.0003 --mix_up 0.0 --smoothing 0.1 --train_warmup_epochs 5 --train_epochs 50`, batch 4, nœud `kng08`.

Trajectoire de `test_whole_acc1` (run **terminé**, 50 epochs) :

| Epoch | Train (ordre de grandeur) | Test whole |
|---|---|---|
| 0–25 | ~50 % | ~50 % |
| 30 | 54 % | 58,4 % |
| 35 | 62 % | 56,9 % |
| 40 | 65,7 % | 61,5 % |
| 45 | 68,9 % | 60,8 % |
| **49** | 70,2 % | **61,66 %** |

![Courbe d’apprentissage population](figures/fig_courbe_epochs.png)

**Figure 6.1.** Exactitude d’apprentissage et de test (`test_whole_acc1`) au cours des 50 epochs du run population (43 sujets). Les 25 premières epochs restent au hasard (warmup) ; on retient **61,66 %** à l’epoch 49.

Le plateau initial correspond au warmup. Le test se stabilise autour de 61 % sur les dernières epochs ; on retient **61,66 %** (epoch 49), arrondi **61,7 %** dans les slides du laboratoire.

### Tableau comparatif (population, 43 sujets)

| Méthode | Exactitude test | Écart au hasard (50 %) | Source |
|---|---|---|---|
| Hasard | 50 % | 0 | 2 classes |
| LDA (variance + moyenne) | 55,7 % | +5,7 | run Maxime, v2, 8 sujets pour la LDA tabulée ci-dessus ; ordre de grandeur repris comme baseline globale dans les slides |
| **ST-EEGFormer** | **61,66 %** | **+11,7** | run population 43 sujets, 6 juillet 2026 |
| LaBraM | ~62 % | +12 | Liz Costato, même type de données / prep |

ST-EEGFormer et LaBraM sont **à parité** en population sur ce jeu. La LDA reste clairement en dessous, ce qui indique un gain du fine-tuning du FM par rapport à une baseline linéaire simple sur descripteurs statistiques, sans en faire une conclusion sur le LOSO.

**Limite de lecture.** La LDA 55,7 % du journal est d’abord la moyenne des **8** sujets de `part0` après correction. Le run ST-EEGFormer 61,66 % porte sur **43** sujets. La comparaison LaBraM ~62 % est celle communiquée par Liz pour le même paradigme. On ne prétend pas ici à un test statistique apparié 43 vs 43 sur la LDA.

## 6.4 LOSO : statut, pas de chiffre agrégé

Un job Slurm de fine-tuning leave-one-subject-out (43 plis) a été soumis (ex. `77622`, puis suivi `109704` sur `kng11`, limite 30 jours). Au **6 août 2026** : **13/43** répertoires `COMPLETED` (sujets 002–009, 011–015 ; pas de 010 dans la liste). Le 13 août, le statut oral était « more than halfway » **sans nouveau comptage vérifié**. Le 19 août, l’exposé technique a été fait **sans LOSO** (pas d’accès clés ce jour-là).

Tant que 43/43 plis ne sont pas `COMPLETED`, **aucune moyenne ni écart-type LOSO n’est publié dans ce rapport**. Un mean partiel biaiserait la comparaison avec LaBraM.

## 6.5 Ce que ces chiffres ne disent pas

- Ils ne reproduisent pas la figure G.2 du papier (autre dataset, autre conclusion).
- Ils ne disent pas que ST-EEGFormer « bat » LaBraM (écart ~0,3 point, protocoles et seeds non appariés dans ce document).
- Ils ne disent pas que le pré-entraînement MAE est causalement nécessaire : l’ablation *from-scratch* discutée après le 23 juillet n’est pas encore un résultat.
- Le pré-entraînement officiel est à **128 Hz** avec un mapping de canaux `senloc` (jusqu’à 145 slots). Le downstream labo est à **256 Hz** / 64 EEG. L’adaptation se fait dans le code de fine-tuning ; ce n’est pas « le même système d’acquisition », point soulevé par Ishii le 19 août et à traiter en discussion.


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# 7. Discussion, limites et perspectives

## 7.1 Ce que le résultat établit — et ce qu’il n’établit pas

Sur la tâche d’attention spatiale du laboratoire, en protocole population sur 43 sujets, ST-EEGFormer fine-tuné atteint **61,66 %** d’exactitude là où le hasard est à 50 % et où une LDA sur descripteurs statistiques atteint 55,7 %. La ligne LaBraM conduite par Liz Costato, sur les mêmes données et le même prétraitement, se situe autour de **62 %**.

Trois lectures se dégagent, par ordre de solidité décroissante.

**La tâche est décodable, et un modèle de fondation fine-tuné y apporte un gain réel mais modéré.** Onze à douze points au-dessus du hasard, six points au-dessus d’une baseline linéaire naïve : c’est un signal net, pas une révolution. La formule prudente — celle employée devant le laboratoire — est que le FM ajoute « quelques points » à une baseline classique, sur une tâche qui reste difficile.

**Deux modèles de fondation de conception opposée arrivent au même endroit.** ST-EEGFormer représente le signal par des patches continus et reconstruit des amplitudes ; LaBraM le représente par des codes discrets et prédit des indices de dictionnaire. Après fine-tuning, l’écart est de l’ordre de 0,3 point sur cette tâche. C’est exactement la quatrième conclusion de Yang et al. : *le fine-tuning efface une grande partie de la spécialisation acquise au pré-entraînement*, et la complexité de l’objectif auto-supervisé cesse d’être discriminante. Notre expérience ne prouve pas cette conclusion — un point de mesure ne prouve rien — mais elle en constitue une instance indépendante, sur un jeu absent du benchmark d’origine.

**Ce que le chiffre ne dit pas.** Il ne dit pas que ST-EEGFormer « bat » LaBraM : l’écart est inférieur à la variabilité attendue entre graines aléatoires, les protocoles ne sont pas appariés dans ce document et aucun test statistique n’a été conduit. Il ne dit pas non plus que le pré-entraînement est *causalement* nécessaire : l’ablation « dorsale entraînée de zéro contre dorsale pré-entraînée », discutée après le séminaire du 23 juillet, n’a pas encore été réalisée. Enfin, il ne reproduit pas la figure G.2 du papier, qui porte sur un autre jeu et une autre conclusion.

## 7.2 Une limite structurelle : le protocole population ne mesure pas le transfert inter-sujets

C’est la limite la plus importante du chapitre 6, et elle mérite d’être énoncée sans détour. Dans le protocole population, le découpage apprentissage/test se fait **par session à l’intérieur de chaque sujet** : les sessions 1 à 6 d’un sujet servent à l’apprentissage, les sessions 7 et 8 au test. Chaque sujet de test a donc été vu à l’entraînement, avec d’autres sessions.

Ce protocole répond à la question : *existe-t-il des motifs d’attention spatiale exploitables par un modèle unique entraîné sur une population, pour des utilisateurs déjà enrôlés ?* Il ne répond pas à la question qui compte pour une BCI déployable : *que se passe-t-il face à un utilisateur jamais vu ?* Les 61,66 % ne sont donc pas une mesure de généralisation inter-sujets, et il serait fautif de les présenter comme telle. C’est précisément pour cela que le protocole *leave-one-subject-out* a été lancé — et pourquoi son absence de conclusion chiffrée est une limite réelle du rapport, non une formalité.

## 7.3 Le LOSO : coût, statut, et pourquoi aucune moyenne n’est publiée

Un LOSO à 43 plis n’est pas un run, c’est 43 runs. Chaque pli exige un entraînement complet sur 42 sujets (50 epochs) puis une adaptation sur le sujet exclu (30 epochs). À l’échelle mesurée sur le run population — de l’ordre de 55 minutes par epoch sur une V100 partagée — un pli représente plusieurs dizaines d’heures de calcul, et la série complète plusieurs mois de GPU si elle est exécutée séquentiellement. D’où la migration vers Slurm, décidée avec Cuong, et le mécanisme de reprise par marqueur `COMPLETED` décrit au § 4.6.

Au 6 août 2026, le travail était en cours d’exécution sur `kng11` avec **13 plis sur 43** terminés, à un rythme observé d’environ un pli par jour. Le 13 août, le statut communiqué à l’oral était « plus de la moitié », sans nouveau décompte vérifié. L’exposé technique du 19 août a été fait sans chiffres LOSO, faute d’accès au cluster ce jour-là.

La règle appliquée dans tout ce rapport est qu’**aucune moyenne ni écart-type LOSO n’est publié tant que les 43 plis ne sont pas terminés**. Cette règle n’est pas une précaution rhétorique : les plis se terminent dans l’ordre des identifiants de sujets (`002` à `015` pour les treize premiers), ce qui n’est pas un tirage aléatoire. Or le chapitre 6 montre que la variabilité inter-sujets est considérable — de 39,6 % à 70,8 % en LDA. Une moyenne calculée sur un préfixe ordonné de sujets serait donc une estimation à biais inconnu, qu’il serait ensuite impossible de comparer honnêtement à la ligne LaBraM. Mieux vaut un statut qu’un chiffre non interprétable.

## 7.4 Autres limites, énoncées

- **La baseline LDA n’est pas appariée au run principal.** La moyenne de 55,7 % est celle des huit sujets de `part0` après correction du prétraitement ; le run ST-EEGFormer porte sur 43 sujets. La comparaison est indicative, pas statistique. Recalculer la LDA sur les 43 sujets est peu coûteux — quelques minutes de CPU — et devrait être fait avant toute publication.
- **La comparaison LaBraM repose sur un chiffre communiqué.** Les ~62 % proviennent de la ligne de travail de Liz Costato, sur le même paradigme et le même prétraitement. Ce n’est pas mon exécution ; je ne m’en attribue ni la mise en œuvre ni le mérite, et je ne peux pas garantir l’identité des graines, des découpages ni du nombre d’epochs.
- **Une seule graine aléatoire, un seul point de mesure.** Aucun intervalle de confiance n’est associé aux 61,66 %. Le retour du séminaire du 23 juillet demandant de « mieux rapporter la confiance » est justifié : trois graines suffiraient à donner un ordre de grandeur de la dispersion, pour un coût de calcul connu à l’avance.
- **La baseline classique reste à renforcer.** Une LDA sur moyenne et variance par canal est un témoin de présence de signal, pas l’état de l’art classique. La piste **CSP** suggérée par le professeur Ishii le 19 août est le bon comparateur pour une tâche latéralisée : sans elle, l’affirmation « le FM apporte quelque chose par rapport aux méthodes classiques » reste fragile.
- **BCI Competition IV-2a n’a pas produit de résultat exploitable** pendant ce séjour : population à 26,4 % et LOO à 25,6 ± 0,6 % pour un hasard à 25 %. L’infrastructure, le mapping de canaux et le protocole ont été validés sur ce jeu, mais la cause de l’absence d’apprentissage n’a pas été isolée avant le pivot vers les données du laboratoire. C’est une question ouverte, pas une question résolue.

## 7.5 Les retours du 19 août 2026 et ce qu’ils impliquent

L’exposé technique du 19 août (session d’étude EEG ↔ imagerie calcique) a produit quatre retours qui orientent la suite du séjour.

**La fréquence d’échantillonnage et le montage.** Le professeur Ishii a soulevé que le pré-entraînement n’est pas fait « sur le même système » que nos enregistrements. La vérification est nette et mérite d’être formulée précisément : le modèle a été pré-entraîné à **128 Hz** sur jusqu’à 142 électrodes, et le code d’adaptation **rééchantillonne effectivement nos données de 256 Hz vers 128 Hz** avant de les donner au modèle, tout en traduisant les noms d’électrodes en indices du plongement spatial via `sen_chan_idx.pkl`. L’adaptation n’est donc pas absente ; elle est implicite et non documentée dans le papier. La question de fond reste entière : un modèle de fondation devrait tolérer un montage et une fréquence inconnus, et rien ne garantit que ce rééchantillonnage plus cette traduction d’indices préservent l’information latéralisée qui nous intéresse. C’est une expérience à faire, pas une objection à écarter.

**Corrélation plutôt que MSE.** Le professeur Ishii juge la MSE « trop forte » comme objectif de reconstruction : elle est dominée par l’amplitude et les décalages de ligne de base, alors que la structure temporelle du signal importe davantage. Remplacer ou compléter la MSE par une corrélation de Pearson sur les patches masqués est une modification locale du code (`forward_loss`), donc testable à coût faible sur un pré-entraînement réduit. C’est la piste méthodologique la plus concrète issue de cette réunion.

**Le cycle de test est trop lent.** La remarque « deux semaines, c’est trop long » ne visait pas l’attente d’une machine, mais **ma cadence expérimentale** : des runs de 50 epochs sur des fenêtres de 8 s produisent une information par semaine ou deux. La conséquence pratique est un changement de méthode : privilégier des runs courts et informatifs — sous-ensemble de sujets décodables, moins d’epochs, modèle *base* plutôt que *large*, fenêtres réduites — pour trancher une hypothèse en quelques heures, et réserver les runs longs à la confirmation. Cette recommandation rejoint la section RSE du chapitre 2 : les runs courts sont à la fois plus rapides et moins coûteux en énergie.

**Une correction que je dois porter par écrit.** Sur la figure des rangs, j’ai laissé passer une inversion pendant la discussion : les barres rouges correspondent au **fine-tuning de l’encodeur** (le décodeur MAE étant jeté), et les barres violettes à l’encodeur **gelé**. Le professeur Ishii avait compris l’inverse, et je n’ai pas corrigé assez clairement sur le moment. Ce point figure dans mes notes de suivi pour être confirmé par écrit — savoir reconnaître et rectifier une ambiguïté d’exposé fait partie du travail.

## 7.6 Perspectives

Par ordre de rapport information/coût décroissant :

1. **Terminer le LOSO** et publier la moyenne, l’écart-type et la distribution par sujet — cette dernière étant probablement plus informative que la moyenne, vu la variabilité observée.
2. **Recalculer la LDA sur les 43 sujets** et ajouter un **CSP + LDA**, pour une comparaison classique/FM défendable. Coût : négligeable.
3. **Reporter la confiance** : trois graines sur le run population, et intervalles de confiance sur les plis LOSO.
4. **Ablation pré-entraîné contre entraîné de zéro** : c’est la seule expérience qui teste la valeur du pré-entraînement sur *notre* tâche. Coût élevé, à cadrer avec Cuong, mais c’est la condition d’une contribution publiable.
5. **Objectif auto-supervisé alternatif** : corrélation à la place de la MSE, sur un pré-entraînement réduit.
6. **Invariance d’identité de canal**, transposée des travaux d’imagerie calcique du laboratoire : réduire la dépendance au plongement d’électrode pour améliorer la transférabilité entre montages. C’est la piste « modèle chimère » EEG ↔ calcium évoquée le 13 août.
7. **Calibration par sujet** : quelques essais du sujet cible pour ajuster la tête, ce qui correspond au coût réel d’une BCI déployée et se situe entre les protocoles 4 et 5 du chapitre 3.

Une machine plus puissante étant annoncée pour le 1er septembre 2026, l’arbitrage n’est plus seulement le nombre de GPU disponibles, mais **le choix des expériences à lancer**. La leçon des cinq premiers mois est que la contrainte dominante n’a jamais été le calcul : elle a été la vitesse à laquelle une hypothèse pouvait être testée puis éliminée.

## 7.7 Recul sur la démarche

Quatre situations concrètes, et ce qu’elles m’ont appris comme méthode de travail.

**Situation 1 — Trois protocoles au niveau du hasard sur BCI-IV-2a.** Analyse : la première réaction naturelle (« le modèle ou le point de contrôle est mauvais ») était non vérifiable, donc inutile. J’ai à la place décomposé la chaîne — les données sont-elles lues ? le mapping de canaux est-il correct ? le modèle apprend-il son propre ensemble d’apprentissage ? — et j’ai constaté que l’exactitude d’apprentissage restait elle aussi au hasard. Conclusion : quand l’apprentissage lui-même ne progresse pas, la question n’est pas la généralisation mais l’optimisation ou l’entrée. Ce raisonnement a été réutilisé deux fois par la suite.

**Situation 2 — Le prétraitement absent.** Analyse : ST-EEGFormer et une LDA restaient tous deux au hasard sur les données du laboratoire. Deux méthodes sans rapport qui échouent de la même façon désignent leur point commun : les données. La comparaison ligne à ligne avec le pipeline de ma collègue a révélé l’absence de filtrage, de référence, de correction de ligne de base, et une fenêtre quatre fois trop courte. Conclusion, appliquée depuis : **maintenir un témoin bon marché** (ici la LDA) qui permet de distinguer un problème de données d’un problème de modèle en quelques minutes plutôt qu’en quelques jours. Corollaire : quand un collègue a un pipeline qui marche sur les mêmes données, la comparaison ligne à ligne coûte moins cher que le débogage isolé.

**Situation 3 — Un modèle de 302 millions de paramètres qui ne mémorise pas 144 exemples.** Analyse : ce comportement est impossible pour une raison de capacité ; il fallait donc chercher dans ce qui empêche les poids de bouger. La lecture de la configuration et du code de décroissance de taux d’apprentissage a fourni le calcul du § 4.6 : avec `layer_decay = 0,75` et 24 blocs, les premières couches apprennent à environ 2 × 10⁻⁷ par pas. Le modèle était, de fait, gelé. Conclusion : les valeurs par défaut d’un dépôt encodent le contexte de ses auteurs (grand jeu, long entraînement) et doivent être relues comme des hypothèses, pas comme des réglages neutres. Et le bon diagnostic est plus utile que le bon jugement : « le modèle n’apprend pas » est une observation, « le modèle est mauvais » n’en est pas une.

**Situation 4 — Une documentation d’infrastructure obsolète.** Analyse : l’adresse de connexion Slurm indiquée par le wiki du laboratoire ne répondait pas. Le diagnostic naturel — « je suis hors du bon réseau » — était faux : le nœud n’existait plus. J’ai fourni à mon encadrant un état factuel (ce qui répond, ce qui ne répond pas, depuis quelles machines), ce qui a permis une réponse utile en un échange : le point d’entrée est `mnode`, avec un module à charger. Conclusion : formuler une question technique avec ses éléments de preuve fait gagner des jours, et signaler un blocage sans le dramatiser — état des lieux, hypothèse, prochaine action exécutable — est une compétence de communication autant que de technique.


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# 8. Conclusion

## 8.1 Ce qui a été fait

Ce stage de fin d’études, effectué du 2 avril au 30 septembre 2026 au Ishii Laboratory de l’université de Kyoto, portait sur l’évaluation d’un modèle de fondation EEG, **ST-EEGFormer** (Yang et al., ICLR 2026), sur une tâche d’attention spatiale du laboratoire, en comparaison avec **LaBraM** et avec une baseline linéaire.

Les cinq objectifs fixés au chapitre 1 ont été atteints, à un près qui reste ouvert.

| Objectif | État |
|---|---|
| Comprendre l’état de l’art des modèles de fondation EEG et l’écosystème du laboratoire | **Atteint** — séminaire d’avril, ligne POYO / `torch_brain` installée et exécutée |
| Choisir un modèle implémentable et son comparateur | **Atteint** — ST-EEGFormer (code MIT, points de contrôle publiés) et LaBraM |
| Rendre le benchmark exécutable hors de son environnement HPC d’origine | **Atteint** — Windows, macOS, puis cluster du laboratoire sous Slurm |
| Obtenir un chiffre population honnête sur les données du laboratoire | **Atteint** — 61,66 %, avec LDA à 55,7 % et hasard à 50 % |
| Lancer un protocole *leave-one-subject-out* complet | **Lancé, non terminé** — 13 plis sur 43 au 6 août 2026 ; aucune moyenne publiée |

Le résultat scientifique tient en une phrase : sur cette tâche binaire et ce régime de 43 sujets, un modèle de fondation à patches continus fine-tuné atteint 61,66 %, soit la parité avec un modèle de fondation à tokens discrets (environ 62 %) et six points au-dessus d’une baseline linéaire — ce qui constitue une instance indépendante de la conclusion de Yang et al. selon laquelle le fine-tuning uniformise les modèles de fondation.

Le résultat d’ingénierie, moins spectaculaire mais plus transférable, est la chaîne complète : extraction et conversion de 43 sujets EEGLAB avec un prétraitement aligné sur une ligne de référence, adaptation d’un dépôt de recherche à trois environnements matériels, orchestration sur cluster avec reprise par pli, et agrégation vérifiable des journaux. C’est cette chaîne qui a permis de transformer « le modèle ne marche pas » en trois diagnostics distincts et corrigés : un mapping de canaux erroné, un prétraitement absent, une décroissance de taux d’apprentissage qui gelait la dorsale.

## 8.2 Compétences acquises

**Techniques — apprentissage automatique.** Lecture et mise en œuvre d’une architecture de type Vision Transformer appliquée à des séries temporelles ; compréhension opérationnelle de l’auto-encodage masqué (masquage, reconstruction, perte restreinte aux patches masqués) et de la différence entre représentation continue et quantifiée ; distinction pratique entre sonde linéaire et fine-tuning, et effet réel des mécanismes de régularisation d’adaptation (décroissance de taux par couche, *mixup*, lissage d’étiquettes, échauffement).

**Techniques — traitement du signal biomédical.** Construction d’une chaîne de prétraitement EEG sous MNE : typage des voies, référence moyenne, passe-bande et notch, rééchantillonnage, correction de ligne de base, extraction d’époques dirigée par les événements, et gestion explicite du mapping d’annotations. Compréhension des conséquences chiffrées de chacune de ces étapes sur la décodabilité.

**Techniques — calcul haute performance et outillage.** Soumission et suivi de travaux Slurm (`sbatch`, `squeue`, `--gres`, limites de temps), travail sur nœuds partagés, sessions détachées, diagnostic de blocages liés au NFS et aux processus de chargement, gestion mémoire GPU (taille de lot, segments extensibles), reprise de calcul idempotente par marqueur. Portabilité d’un code de recherche entre Windows, macOS et Linux.

**Méthodologiques.** Conception d’un plan d’expériences comparable — même prétraitement, même protocole, même métrique — et distinction rigoureuse entre les trois causes possibles d’un échec : données, optimisation, généralisation. Usage systématique d’un témoin bon marché pour trancher entre ces causes. Application d’une règle de reporting stricte : ne pas agréger un protocole incomplet.

**Communication scientifique.** Quatre prises de parole devant le laboratoire en anglais : revue de littérature (avril), présentation d’article (mai), *progress talk* de stage (23 juillet), exposé technique en session d’étude (19 août). Rédaction de comptes rendus factuels à destination d’un encadrant, avec la formulation « ce qui fonctionne, ce qui manque, prochaine action exécutable » — et l’apprentissage de corriger publiquement une de mes propres approximations techniques, sur la tokenisation, plutôt que de la laisser passer.

**Interculturelles et organisationnelles.** Travail quotidien en anglais dans un laboratoire japonais, avec un encadrement à trois niveaux (professeur, encadrant quotidien, collègue de stage), coordination avec une collègue sur une ligne parallèle, et respect des usages locaux du cluster partagé.

## 8.3 Apport pour le laboratoire, apport pour moi

Pour le laboratoire, le stage fournit la moitié ST-EEGFormer d’une comparaison à prétraitement identique, une infrastructure d’évaluation réutilisable sur le cluster, et une clarification conceptuelle — l’alignement ST-EEGFormer ≈ CAPT et LaBraM ≈ CalM — qui a reformulé la question de recherche du groupe : le levier n’est pas de retirer la tokenisation, déjà absente, mais de repenser l’objectif auto-supervisé et l’invariance aux identités de canaux. Selon l’objectif énoncé par mon encadrant, un gain de quelques points au-delà de la parité actuelle ouvrirait une trajectoire de publication ; les expériences qui permettraient de l’obtenir sont listées et chiffrées au chapitre 7.

Pour moi, l’apport principal n’est pas le chiffre de 61,66 % mais la démarche qui y a mené. Les quatre premiers mois ont surtout produit des résultats au niveau du hasard, et la valeur du travail a résidé dans la capacité à ne pas conclure trop vite : ni « le modèle est mauvais », ni « les données sont mauvaises », mais une décomposition de la chaîne jusqu’à identifier la cause réelle, à chaque fois différente de l’hypothèse initiale. C’est, à mon sens, le cœur du métier d’ingénieur en apprentissage automatique appliqué : la difficulté n’est presque jamais l’architecture, elle est dans les conventions implicites — un fichier de mapping absent, un paramètre de fenêtre resté à sa valeur par défaut, une décroissance de taux d’apprentissage héritée d’un autre contexte.

Le stage se poursuit jusqu’au 30 septembre 2026. Les priorités restantes sont la fin du LOSO, une baseline classique renforcée, un reporting de confiance, et l’ablation « pré-entraîné contre entraîné de zéro » qui déciderait si, sur cette tâche, le pré-entraînement mérite son coût.


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# Bibliographie

Les références sont classées par thème. Les métadonnées des travaux cités par le papier support ont été relevées dans sa propre bibliographie (PDF disponible localement) ; celles qui n’ont pas pu être vérifiées sur ce poste sont signalées.

## Papier support du stage

1. **Yang, L., Sun, Q., Li, A., & Van Hulle, M. M.** (2026). *Are EEG Foundation Models Worth It? Comparative Evaluation with Traditional Decoders in Diverse BCI Tasks.* The Fourteenth International Conference on Learning Representations (ICLR 2026). OpenReview : `https://openreview.net/forum?id=5Xwm8e6vbh`. Code et poids : `https://github.com/LiuyinYang1101/STEEGFormer` (licence MIT pour le code). — *Article et matériel supplémentaire consultés en PDF ; la page OpenReview n’a pas pu être ouverte depuis la machine de rédaction (vérification anti-robot).*

## Modèles de fondation EEG

2. **Kostas, D., Aroca-Ouellette, S., & Rudzicz, F.** (2021). *BENDR: Using Transformers and a Contrastive Self-Supervised Learning Task to Learn from Massive Amounts of EEG Data.* arXiv:2101.12037.
3. **Yang, C., Westover, M. B., & Sun, J.** (2023). *BIOT: Cross-data Biosignal Learning in the Wild.* arXiv:2305.10351.
4. **Jiang, W.-B., Zhao, L.-M., & Lu, B.-L.** (2024). *Large Brain Model for Learning Generic Representations with Tremendous EEG Data in BCI* (LaBraM). arXiv:2405.18765.
5. **Wang, G., Liu, W., He, Y., Xu, C., Ma, L., & Li, H.** (2024). *EEGPT: Pretrained Transformer for Universal and Reliable Representation of EEG Signals.* Advances in Neural Information Processing Systems 37, 39249–39280.
6. **Wang, J., Zhao, S., Luo, Z., Zhou, Y., Jiang, H., Li, S., Li, T., & Pan, G.** (2025). *CBraMod: A Criss-Cross Brain Foundation Model for EEG Decoding.* arXiv:2412.07236.
7. *EEG Foundation Models: A Critical Review of Current Progress and Future Directions.* — Revue remise par le professeur Ishii en avril 2026 et présentée au séminaire du laboratoire. **Le PDF n’est pas présent sur la machine de rédaction** ; seule ma présentation dérivée l’est. Références bibliographiques complètes à compléter avant dépôt.

## Architectures et auto-supervision (hors EEG)

8. **Dosovitskiy, A., Beyer, L., Kolesnikov, A., et al.** (2021). *An Image is Worth 16×16 Words: Transformers for Image Recognition at Scale.* arXiv:2010.11929. (Vision Transformer.)
9. **He, K., Chen, X., Xie, S., Li, Y., Dollár, P., & Girshick, R.** (2022). *Masked Autoencoders Are Scalable Vision Learners.* IEEE/CVF CVPR 2022. (MAE.)

## Décodeurs EEG classiques et compacts

10. **Ramoser, H., Müller-Gerking, J., & Pfurtscheller, G.** (2000). *Optimal Spatial Filtering of Single Trial EEG During Imagined Hand Movement.* IEEE Transactions on Rehabilitation Engineering, 8(4), 441–446. (CSP.)
11. **Ang, K. K., Chin, Z. Y., Zhang, H., & Guan, C.** (2008). *Filter Bank Common Spatial Pattern (FBCSP) in Brain–Computer Interface.* IEEE IJCNN 2008.
12. **Congedo, M., Barachant, A., & Bhatia, R.** (2017). *Riemannian Geometry for EEG-based Brain-Computer Interfaces: A Primer and a Review.* Brain-Computer Interfaces, 4(3), 155–174.
13. **Schirrmeister, R. T., Springenberg, J. T., Fiederer, L. D. J., et al.** (2017). *Deep Learning with Convolutional Neural Networks for EEG Decoding and Visualization.* Human Brain Mapping, 38(11), 5391–5420. (DeepConvNet.)
14. **Lawhern, V. J., Solon, A. J., Waytowich, N. R., Gordon, S. M., Hung, C. P., & Lance, B. J.** (2018). *EEGNet: A Compact Convolutional Neural Network for EEG-based Brain–Computer Interfaces.* Journal of Neural Engineering, 15(5), 056013.
15. **Song, Y., Zheng, Q., Liu, B., & Gao, X.** (2023). *EEG Conformer: Convolutional Transformer for EEG Decoding and Visualization.* IEEE TNSRE, 31, 710–719.
16. **Zhao, W., Jiang, X., Zhang, B., Xiao, S., & Weng, S.** (2024). *CTNet: A Convolutional Transformer Network for EEG-based Motor Imagery Classification.* Scientific Reports, 14(1), 20237.
17. **Chen, X., Wang, Y., Gao, S., Jung, T.-P., & Gao, X.** (2015). *Filter Bank Canonical Correlation Analysis for Implementing a High-Speed SSVEP-based Brain–Computer Interface.* (FBCCA ; référence citée par le papier support.)
18. **Nakanishi, M., Wang, Y., Chen, X., Wang, Y.-T., Gao, X., & Jung, T.-P.** (2018). *Enhancing Detection of SSVEPs for a High-Speed Brain Speller Using Task-Related Component Analysis.* (TRCA ; référence citée par le papier support.)

## Jeux de données

19. **Tangermann, M., Müller, K.-R., Aertsen, A., et al.** (2012). *Review of the BCI Competition IV.* Frontiers in Neuroscience, 6, 55. (BCI-IV-2a, 4 classes, hasard 25 %.)
20. **Morioka, H., et al.** (2014). — Paradigme d’attention visuo-spatiale associé au jeu ATR NBP utilisé dans ce stage. **Référence complète non vérifiable sur la machine de rédaction (PDF absent).** À compléter auprès du laboratoire avant dépôt ; les caractéristiques utilisées ici (2 classes, fenêtre d’attention de 8 s, 43 sujets) proviennent de l’usage opérationnel du laboratoire et de l’exploration directe des fichiers.
21. **Obeid, I., & Picone, J.** (2016). *The Temple University Hospital EEG Data Corpus.* (TUEG/TUEV, corpus de pré-entraînement fréquemment utilisé par les modèles de fondation EEG.)

## Modèles de fondation en électrophysiologie et imagerie calcique

22. **Azabou, M., et al.** (2023). *A Unified, Scalable Framework for Neural Population Decoding* (POYO). Advances in Neural Information Processing Systems 36 (NeurIPS 2023). Implémentation : `torch_brain` / `brainsets` (`https://github.com/neuro-galaxy/torch_brain`).
23. **Azabou, M., et al.** *Neural Decoding from Distinct Cell-Types.* — PDF fourni par le laboratoire ; métadonnées de publication à compléter.
24. **CalM.** arXiv:2604.04958. Modèle de fondation pour l’imagerie calcique fondé sur un tokeniseur à quantification vectorielle et un transformeur *dual-axis* autorégressif. — *Lu en PDF local ; identifiant arXiv relevé dans les notes du laboratoire.*
25. **CAPT.** arXiv:2607.23258. *Continuous patch tokenization* pour l’imagerie calcique, objectif autorégressif en MSE, transfert inter-espèces à dorsale gelée. — *Lu en PDF local.*
26. **POCO.** — Modèle de prévision d’activité calcique présenté au *paper reading club* du 18 août 2026 ; référence à compléter.

## Documents internes et sources primaires du stage

27. **Journal de bord du stage**, `torch-brain-eeg/notes/JOURNAL.md` (avril–août 2026). Source de vérité pour toutes les dates, configurations et valeurs numériques citées dans les chapitres 5 et 6.
28. **Fiche de lecture EEG ↔ imagerie calcique**, `notes/papers/README_meeting_2026-08-13.md`.
29. **Supports de présentation** : séminaire de revue (avril), présentation d’article (mai), *progress talk* du 23 juillet, exposé technique du 19 août — répertoire `STEEGFormer/presentations/`.
30. **Code du stage** : `util/prepare_atr_nbp_spatial_attention.py`, `util/dataset_specs_lab_spatial_attention.yaml`, `scripts/summarize_g2_json_logs.py`, scripts d’orchestration PowerShell et Slurm.


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# Annexes

Ces annexes ne comptent pas dans le volume principal du rapport. Elles rassemblent ce qui doit être vérifiable sans alourdir la lecture.

## Annexe A — Glossaire

| Terme | Définition |
|---|---|
| **BCI** | *Brain–Computer Interface* : système inférant une intention ou un état à partir de l’activité cérébrale. |
| **EEG** | Électroencéphalographie : mesure non invasive des potentiels électriques du scalp. |
| **EOG** | Électro-oculogramme : voies dédiées aux mouvements oculaires, ici exclues de la référence et du modèle. |
| **Modèle de fondation (FM)** | Grand modèle pré-entraîné de façon auto-supervisée sur de grandes données non annotées, puis adapté à des tâches aval. |
| **Auto-supervision** | Apprentissage dont la cible est construite à partir du signal lui-même (ex. reconstruire une partie masquée). |
| **MAE** | *Masked Autoencoder* : on masque une fraction des *tokens*, l’encodeur ne voit que le reste, un décodeur reconstruit les parties masquées. |
| **ViT** | *Vision Transformer* : transformeur opérant sur une séquence de *patches* projetés linéairement. |
| **Token / patch** | Ici, un segment de 16 échantillons d’**un seul** canal, projeté en un vecteur. |
| **VQ / codebook** | Quantification vectorielle : remplacer un morceau de signal par l’indice d’un mot d’un dictionnaire appris (approche de LaBraM, pas de ST-EEGFormer). |
| **TPE / SPE** | Encodages positionnels temporel (sinusoïdal) et spatial (plongement appris par électrode). |
| **Linear probing** | Encodeur gelé, apprentissage d’une seule couche linéaire. |
| **Fine-tuning** | Réapprentissage de l’encodeur entier avec la tête. |
| **layer_decay** | Décroissance du taux d’apprentissage vers les couches d’entrée : facteur `layer_decay^(N−i)` pour la couche *i*. |
| **mixup** | Augmentation mélangeant deux exemples et leurs étiquettes. |
| **Population / per-subject / LOSO** | Protocoles d’évaluation : tous les sujets regroupés ; un modèle par sujet ; un sujet tenu à l’écart puis adapté. |
| **Slurm** | Ordonnanceur de travaux du cluster (`sbatch`, `squeue`, `--gres=gpu:...`). |
| **Chance / hasard** | Niveau de performance d’un tirage aléatoire : 50 % à 2 classes, 25 % à 4 classes. |

## Annexe B — Configuration retenue (run population et LOSO)

```text
--optimizer_spec finetune
--layer_decay 1.0
--lr 0.0003
--mix_up 0.0
--smoothing 0.1
--clip_grad 1.0
--train_epochs 50            --train_warmup_epochs 5
--finetune_epochs 30         --finetune_warmup_epochs 3
--train_batch_size 4         --finetune_batch_size 4
--num_workers 0
--vit_pretrained_model_dir  STEEGFormer_large_weights_only_196.pth
--dataset_yaml              spatial_attention_v2/dataset_specs_lab.yaml
export CUDA_VISIBLE_DEVICES=0 CUDA_MODULE_LOADING=LAZY
export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True
```

Modèle : `vit_large_patch16` — dimension 1024, 24 blocs, 16 têtes, *patch* de 16 échantillons, fusion des *tokens* par moyenne, tête linéaire à 2 sorties, coût `SoftTargetCrossEntropy`.

## Annexe C — Spécification du jeu de données du laboratoire

```yaml
spatial_attention:
  data_dir: <chemin local>/spatial_attention_v2
  task_time: 8          # secondes (était 2 dans la version défectueuse)
  fold: 1
  fs: 256               # rééchantillonné à 128 Hz par la transformation ViT
  n_channels: 68        # dont 4 EOG écartés -> 64 canaux pour le ViT
  labram_divisor: 100
  eegpt_divisor: 1000
  chan_names: [Fp1, AF7, AF3, F1, ... , SO2, IO2, LO1, LO2]
```

## Annexe D — Chaîne de prétraitement (conversion v2)

| Étape | Paramètre |
|---|---|
| Typage EOG | `SO2`, `IO2`, `LO1`, `LO2` → type `eog` |
| Référence | moyenne, voies EEG uniquement |
| Passe-bande | 0,1–75 Hz, FIR à phase nulle, fenêtre de Hamming |
| Notch | 60 Hz |
| Rééchantillonnage | 256 Hz (certaines sessions sont à 512 Hz) |
| Ligne de base | moyenne par canal de la période contrôle précédente, soustraite |
| Fenêtre | 8 s à partir de l’onset d’attention → 2048 échantillons |
| Étiquettes | événement `1` → *left*, événement `2` → *right* ; essais `Control` (`8`) non utilisés comme classe |
| Mapping d’événements | explicite : `{"1":1, "2":2, "8":8, "16":16, "64":64, "128":128, "255":255}` |
| Découpage | par **session** : 1–6 apprentissage / 7–8 test, repli proportionnel si moins de 8 sessions |
| Sortie | `<sujet>.pkl` : `trainX (n, 68, 2048)`, `trainY`, `testX`, `testY` |

## Annexe E — Comparaison des deux conversions

| Étape | Conversion v1 (au hasard) | Conversion v2 (alignée référence) |
|---|---|---|
| Filtrage | aucun | passe-bande 0,1–75 Hz + notch 60 Hz |
| Référence | aucune | moyenne (EEG seul) |
| Ligne de base | aucune | moyenne de la période contrôle |
| Fenêtre | 2 s (512 échantillons) | **8 s** (2048 échantillons) |
| Fréquence | 256 Hz supposé, pas de rééchantillonnage | rééchantillonnage explicite vers 256 Hz |
| Sujets | 8 (`part0`) | **43** (`part0`–`part6`) |
| LDA de contrôle | 51,0 % (quasi hasard) | **55,7 %** |

## Annexe F — Résultats bruts cités dans le rapport

**BCI Competition IV-2a** (4 classes, hasard 25 %) :

| Protocole | Machine | Résultat |
|---|---|---|
| population (100 epochs, hyperparamètres auteurs) | `kng08` | 26,39 % |
| leave-one-out fine-tune (9 plis, 100 + 50 epochs) | `gnode01` | 25,56 ± 0,58 % |

Détail des plis LOO : A01 26,12 % · A02 25,39 % · A03 24,88 % · A04 25,08 % · A05 25,42 % · A06 26,50 % · A07 24,96 % · A08 26,20 % · A09 25,50 %.

**Attention spatiale, conversion v1** (2 classes, hasard 50 %, 8 sujets) : LOO fine-tune 49,49 ± 1,77 % · per-subject 50,39 ± 1,62 % · LDA 51,0 %.

**Attention spatiale, conversion v2, LDA par sujet** (8 premiers sujets) : 002 64,6 % · 003 52,1 % · 004 66,7 % · 005 52,1 % · 006 43,8 % · 007 70,8 % · 008 56,2 % · 009 39,6 % → moyenne **55,7 %**.

**Attention spatiale, conversion v2, ST-EEGFormer population 43 sujets**, trajectoire de `test_whole_acc1` : ~50 % jusqu’à l’epoch 25 · 58,4 % (ep. 30) · 56,9 % (ep. 35) · 61,5 % (ep. 40) · 60,8 % (ep. 45) · **61,66 % (ep. 49)**, avec une exactitude d’apprentissage de 70,2 % à l’epoch 49.

**LOSO** : travail Slurm sur `kng11`, limite de 30 jours, reprise par marqueur `COMPLETED`. Au 6 août 2026 : **13 plis terminés sur 43** (sujets 002–009 et 011–015). **Aucune moyenne agrégée n’est publiée.**

## Annexe G — Environnements de calcul utilisés

| Machine | Matériel | Système / remarques |
|---|---|---|
| PC Windows | GPU grand public | Python 3.10 ; `num_workers = 0` (multiprocessing) |
| MacBook Pro du laboratoire | CPU uniquement | Python 3.11 ; runs longs non tenables |
| `kng07` / `kng08` | 2 × Tesla V100 32 Go | nœuds partagés, MPS ; ~55 min/epoch en population 43 sujets |
| `gnode01` | 3 × RTX 4500 Ada | utilisé pour le LOO BCI |
| `kng11` | 4 × A6000 | LOSO via Slurm (`--gres=gpu:a6000:1`) |
| `kng12` | 8 × A4000 | `--gres=gpu:a4000:1` ; indisponible à la date de soumission |
| `mnode` | nœud de connexion Slurm | `module load slurm/23.02.7` avant `sbatch` |

## Annexe H — Inventaire des contributions logicielles

**Code amont** (dépôt Yang et al., licence MIT) : modèle ViT EEG, pré-entraînement MAE, boucle d’évaluation aval, jeux de spécifications d’origine.

**Ajouts et correctifs réalisés pendant le stage** :

- `util/prepare_atr_nbp_spatial_attention.py` — conversion EEGLAB → format benchmark, avec la chaîne de prétraitement de l’annexe D ;
- `util/prepare_bci_iv2a_moabb.py` — préparation du jeu public via MOABB, avec reprise et tolérance réseau ;
- `util/dataset_specs_local_bci_iv2a.yaml`, `util/dataset_specs_lab_spatial_attention.yaml` — chemins et paramètres locaux à la place des chemins HPC ;
- `util/utils.py` — import optionnel d’une dépendance SSVEP, chargement du mapping de canaux, chargement tolérant du point de contrôle, fonction de coût de classification ;
- `wandb_downstream_evaluation.py` — option de désactivation du suivi d’expériences, compatibilité CPU/GPU, **marqueur `COMPLETED` par pli** ;
- `wandb_engine_finetune_eeg.py`, `util/misc.py` — robustesse de journalisation ;
- `scripts/summarize_g2_json_logs.py` — agrégation hors ligne des journaux JSON ;
- scripts d’orchestration : `run_g2_*.ps1` (Windows), `run_loo.sh`, `run_loo.slurm` (cluster) ;
- `pptx_build/*.js` — génération scriptée des supports de présentation.

**Contribution de ma collègue Liz Costato**, citée mais non réalisée par moi : pipeline de prétraitement de référence (`set_to_pkl.py` / `set_to_h5.py`) et résultats LaBraM.

## Annexe I — Éléments à compléter avant dépôt

- Référence complète de Morioka et al. (2014) et de la revue *Critical Review* (PDF absents de la machine de rédaction).
- Canevas de page de garde et logos officiels de l’école, non disponibles sur ce poste.
- Résultat LOSO agrégé, **uniquement si les 43 plis sont terminés** à la date de dépôt.
- LDA recalculée sur les 43 sujets, si le temps le permet (coût négligeable).
- Figures à produire : schéma comparatif des conversions v1/v2 et courbe d’apprentissage du run population.


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

