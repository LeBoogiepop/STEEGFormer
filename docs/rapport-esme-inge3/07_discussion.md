# 7. Discussion, limites et perspectives

## 7.1 Ce que le résultat établit — et ce qu’il n’établit pas

Sur la tâche d’attention spatiale du laboratoire, en protocole population sur 43 sujets, ST-EEGFormer fine-tuné atteint **61,66 %** d’exactitude là où le hasard est à 50 % et où une LDA sur descripteurs statistiques atteint 55,7 %. La ligne LaBraM conduite par Liz Costato, sur les mêmes données et le même prétraitement, se situe autour de **62 %**.

Trois lectures se dégagent, par ordre de solidité décroissante.

**La tâche est décodable, et un modèle de fondation fine-tuné y apporte un gain réel mais modéré.** Onze à douze points au-dessus du hasard, six points au-dessus d’une baseline linéaire naïve : c’est un signal net, pas une révolution. La formule prudente — celle employée devant le laboratoire — est que le FM ajoute « quelques points » à une baseline classique, sur une tâche qui reste difficile.

**Deux modèles de fondation de conception opposée arrivent au même endroit.** ST-EEGFormer représente le signal par des patches continus et reconstruit des amplitudes ; LaBraM le représente par des codes discrets et prédit des indices de dictionnaire. Après fine-tuning, l’écart est de l’ordre de 0,3 point sur cette tâche. C’est exactement la quatrième conclusion de Yang et al. : *le fine-tuning efface une grande partie de la spécialisation acquise au pré-entraînement*, et la complexité de l’objectif auto-supervisé cesse d’être discriminante. Notre expérience ne prouve pas cette conclusion — un point de mesure ne prouve rien — mais elle en constitue une instance indépendante, sur un jeu absent du benchmark d’origine.

**Ce que le chiffre ne dit pas.** Il ne dit pas que ST-EEGFormer « bat » LaBraM : l’écart est inférieur à la variabilité attendue entre graines aléatoires, les protocoles ne sont pas appariés dans ce document et aucun test statistique n’a été conduit. Il ne dit pas non plus que le pré-entraînement est *causalement* nécessaire : l’ablation « dorsale entraînée de zéro contre dorsale pré-entraînée », discutée après le séminaire du 23 juillet, n’a pas encore été réalisée. Enfin, il ne reproduit pas la figure G.2 du papier, qui porte sur un autre jeu et une autre conclusion.

## 7.2 Une limite structurelle : le protocole population ne mesure pas le transfert inter-sujets

C’est la limite la plus importante du chapitre 6, et elle mérite d’être énoncée sans détour. Dans le protocole population, le découpage apprentissage/test se fait **par session à l’intérieur de chaque sujet** : les sessions 1 à 6 d’un sujet servent à l’apprentissage, les sessions 7 et 8 au test. Chaque sujet de test a donc été vu à l’entraînement, avec d’autres sessions.

Ce protocole répond à la question : *existe-t-il des motifs d’attention spatiale exploitables par un modèle unique entraîné sur une population, pour des utilisateurs déjà enrôlés ?* Il ne répond pas à la question qui compte pour une BCI déployable : *que se passe-t-il face à un utilisateur jamais vu ?* Les 61,66 % ne sont donc pas une mesure de généralisation inter-sujets, et il serait fautif de les présenter comme telle. C’est précisément pour cela que le protocole *leave-one-subject-out* a été lancé. Il est maintenant chiffré (§ 6.4) : **53,55 % ± 3,20 %** sur 41 plis (stade *finetune*). L’écart avec les 61,66 % population n’est pas un « échec du modèle » : ce sont deux questions différentes.

## 7.3 Le LOSO : coût, résultat, et ce qu’il ne faut pas en faire

Un LOSO n’est pas un run, c’est un run par sujet exclu. Chaque pli exige un entraînement complet sur les autres sujets (50 epochs) puis une adaptation sur le sujet exclu. À l’échelle mesurée sur le run population — de l’ordre de 55 minutes par epoch sur une V100 partagée — un pli représente plusieurs dizaines d’heures, d’où Slurm et le marqueur `COMPLETED`.

Au 6 août 2026 : **13** plis terminés, dans l’ordre des identifiants — un préfixe, pas un tirage aléatoire. Publier une moyenne partielle aurait biaisé la comparaison avec LaBraM. Cette règle a été tenue jusqu’au **2 septembre**, date à laquelle **41** plis ont un JSON : mean **53,55 % ± 3,20 %**.

Trois précautions de lecture restent. (1) L’arborescence n’a pas 43 leave-out. (2) Le script officiel agrège `acc1_whole` *finetune*, pas le zero-shot held-out. (3) Un LOSO LaBraM ~62 % n’est comparable que si le protocole est le même. La distribution par sujet — sujets durs communs 004, 019, 020, 031, 046 — est plus informative que le mean pour la suite (preprocessing Liz).

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

1. **Tester les pistes Liz** (Euclidean Alignment, laplacien, rejet d’artefacts) d’abord en CSP+LDA sur les sujets durs, puis un seul run population si un gain apparaît — pas un second LOSO 41 plis d’emblée.
2. **Recalculer la LDA sur les 43 sujets** et ajouter un **CSP + LDA**, pour une comparaison classique/FM défendable. Coût : négligeable.
3. **Reporter la confiance** : trois graines sur le run population, et intervalles de confiance sur les plis LOSO.
4. **Ablation pré-entraîné contre entraîné de zéro** : c’est la seule expérience qui teste la valeur du pré-entraînement sur *notre* tâche. Coût élevé, à cadrer avec Cuong, mais c’est la condition d’une contribution publiable.
5. **Objectif auto-supervisé alternatif** : corrélation à la place de la MSE, sur un pré-entraînement réduit.
6. **Invariance d’identité de canal**, transposée des travaux d’imagerie calcique du laboratoire : réduire la dépendance au plongement d’électrode pour améliorer la transférabilité entre montages. C’est la piste « modèle chimère » EEG ↔ calcium évoquée le 13 août.
7. **Calibration par sujet** : quelques essais du sujet cible pour ajuster la tête, ce qui correspond au coût réel d’une BCI déployée et se situe entre les protocoles 4 et 5 du chapitre 3.

La machine ATR A100 est accessible depuis le 2 septembre 2026 (VPN). L’arbitrage n’est plus le nombre de GPU, mais **quelles expériences lancer**. Les `.pkl` restent sur mnode ; un transfert depuis le laboratoire est nécessaire avant un rerun A100. La leçon des mois précédents : la contrainte dominante n’a jamais été le calcul, mais la vitesse à laquelle une hypothèse peut être testée puis éliminée.

## 7.7 Comment améliorer ces algorithmes ? Une analyse par levier

La liste précédente dit *quoi* faire ensuite. Cette section tente de dire *pourquoi* chaque piste pourrait aider, en repartant de la mécanique des deux modèles décrite au chapitre 3, et en séparant honnêtement trois statuts : **réalisé**, **prêt à tester** (code écrit, non exécuté) et **prospectif** (idée argumentée, pas de code). Aucun gain chiffré n’est promis ici : l’expérience du stage montre que la plupart des hypothèses raisonnables tombent au premier test, et c’est précisément pour cela qu’il faut les tester vite.

Le point de départ est un diagnostic. Sur notre tâche, les deux modèles de fondation plafonnent autour de 62 % en population et le LOSO tombe à 53,55 %, alors que 144 essais par sujet suffisent à une LDA pour dépasser le hasard. L’écart population/LOSO dit que **ce qui manque n’est pas de la capacité de modèle, mais de l’invariance inter-sujets**. Un modèle de 302 M de paramètres sait mémoriser ce qui distingue un sujet ; il ne sait pas encore ignorer ce qui le distingue. Les leviers ci-dessous sont classés selon l’endroit de la chaîne où ils agissent.

### 7.7.1 Levier 1 — L’entrée : rendre les sujets plus semblables avant le modèle

C’est le levier le moins coûteux et le premier à tester, car il agit sans toucher aux poids pré-entraînés et s’applique de la même façon aux deux modèles. Trois techniques ont été proposées par Liz Costato le 2 septembre ; leur code est écrit (`benchmark/spatial_attention/`) et **n’a pas encore été exécuté** sur mnode.

- **Alignement euclidien** (EA, He & Wu, 2020). Pour chaque sujet, on calcule la matrice de covariance moyenne de ses essais et l’on blanchit tous ses essais par sa racine carrée inverse. Après transformation, chaque sujet a une covariance moyenne identité : les différences d’impédance, de gain et de géométrie de casque, qui déplacent la distribution des signaux d’un sujet à l’autre, sont en grande partie retirées. Pourquoi cela devrait aider *ici* : le plongement de ST-EEGFormer est linéaire par patch et la normalisation par canal n’aligne que les variances, pas les corrélations inter-canaux ; l’EA aligne aussi ces dernières. Précaution : la matrice doit être estimée sur les essais d’apprentissage du sujet seulement, sinon le test fuit dans l’apprentissage. Statut : **prêt à tester**, d’abord en CSP + LDA sur les sujets durs (004, 019, 020, 031, 046), puis un run population unique si un signe positif apparaît.
- **Laplacien de surface / densité de courant (CSD).** C’est un filtre spatial passe-haut : on soustrait à chaque électrode une combinaison de ses voisines, ce qui atténue les composantes diffuses (référence, artefacts lents) et accentue les sources locales. Pourquoi cela devrait aider : l’attention spatiale se manifeste par une **latéralisation** de l’activité pariéto-occipitale ; un filtre qui accentue les contrastes locaux devrait rendre ce contraste gauche/droite plus lisible dès l’entrée. Prérequis : positions des 64 électrodes (montage MNE). Statut : **prêt à tester**.
- **Rejet d’essais par amplitude.** Écarter les essais dont l’amplitude crête dépasse un seuil (150 µV par défaut dans le script). Pourquoi : quelques essais artefactés suffisent à dominer une moyenne de tokens sur 4 096 positions. Précaution : vérifier les unités réelles des `.pkl` avant de fixer le seuil, sinon on rejette tout ou rien. Statut : **prêt à tester**.

À ces trois pistes s’ajoute un **témoin classique renforcé** — CSP + LDA sur les 43 sujets — qui n’améliore pas le modèle mais rend toute amélioration mesurable. Sans lui, un gain de deux points reste indistinguable du bruit.

### 7.7.2 Levier 2 — La représentation : ce que le modèle voit du signal

Ces pistes touchent à l’architecture ou à la donnée d’entrée du transformeur ; elles sont plus coûteuses et **prospectives**.

- **La perte d’information au rééchantillonnage.** ST-EEGFormer ramène nos 256 Hz à 128 Hz, LaBraM à 200 Hz. Pour l’attention spatiale, l’information utile est surtout dans la bande alpha (8–12 Hz) et ses voisines, bien en dessous de la limite de 64 Hz imposée par le rééchantillonnage : la perte est probablement faible. Mais ce n’est qu’un raisonnement ; l’expérience directe consiste à fine-tuner ST-EEGFormer en gardant 256 Hz (le codage temporel accepte jusqu’à 512 positions, donc 8 s × 256 Hz / 16 = 128 patches par canal tiennent). Le modèle verrait alors des patches de 62,5 ms au lieu de 125 ms, hors de sa distribution de pré-entraînement ; le résultat dirait si les poids pré-entraînés sont liés à une échelle temporelle. Coût : un run population.
- **Le grain temporel.** Le tableau du § 3.5.4 montre deux régimes extrêmes : 125 ms pour ST-EEGFormer, 1 s pour LaBraM. Un rythme alpha fait ~100 ms par cycle ; un patch de 125 ms en contient à peine un, un patch de 1 s en contient dix. Aucun des deux n’est *a priori* le bon grain pour une modulation d’attention qui dure plusieurs secondes. Une piste architecturale est un plongement **multi-échelle** (patches courts et longs concaténés, ou patches recouvrants), qui n’existe dans aucun des deux modèles. Coût : re-pré-entraînement, hors de portée du stage.
- **L’identité de l’électrode.** Les deux modèles ajoutent à chaque patch un vecteur appris propre à l’électrode. C’est utile pour dire *où*, mais c’est aussi une porte ouverte à la mémorisation du montage et, indirectement, du sujet. Les travaux d’imagerie calcique du laboratoire (CAPT, § 3.6) montrent qu’**apprendre à se passer de l’identité** de l’unité enregistrée améliore le transfert. Transposé à l’EEG : *dropout* de canaux à l’entraînement, ou remplacement de la table d’électrodes par un codage à partir des **coordonnées 3D** du montage, qui généralise à un casque jamais vu. C’est la piste la plus directement liée à la question du LOSO, et la plus coûteuse. Statut : prospectif ; un premier pas peu cher est le *dropout* de canaux au fine-tuning, testable sans re-pré-entraîner.
- **La fusion des tokens.** Une moyenne uniforme sur 4 096 tokens donne le même poids à Fp1 et à PO7, à la première et à la dernière seconde. Pour une tâche latéralisée pariéto-occipitale, un **pooling par attention** (une requête apprise qui pondère les tokens) permettrait au modèle de se concentrer sur les électrodes et instants informatifs, sans toucher à l’encodeur. Coût : quelques milliers de paramètres, un run population. Statut : prospectif, mais peu cher.

### 7.7.3 Levier 3 — L’objectif de pré-entraînement

C’est l’endroit où les deux modèles diffèrent (figure 3.2), et c’est le levier le plus coûteux : toute modification exige un re-pré-entraînement, même réduit.

- **Une corrélation à la place de la MSE** (retour du professeur Ishii, 19 août). La MSE sur amplitudes récompense d’abord la bonne ligne de base et la bonne énergie ; une corrélation de Pearson entre patch prédit et patch vrai récompense la bonne *forme*, indépendamment de l’échelle. La modification est locale (`forward_loss`, § 3.4.3) et testable sur un pré-entraînement réduit (variante *base*, sous-ensemble de données). Statut : prospectif, code trivial, coût de calcul élevé.
- **Une cible spectrale, sans dictionnaire.** LaBraM apprend son dictionnaire sur le spectre de Fourier ; ST-EEGFormer régresse le signal temporel. Une voie intermédiaire consiste à demander à ST-EEGFormer de prédire, pour chaque patch masqué, **l’amplitude spectrale** (ou de combiner MSE temporelle et spectrale), ce qui importe l’intuition de LaBraM sans sa quantification. Statut : prospectif.
- **L’ablation qui manque encore.** Avant d’optimiser l’objectif, il faut savoir combien il vaut : fine-tuner un ST-EEGFormer **initialisé au hasard** sur nos données et le comparer au pré-entraîné. Si l’écart est nul, aucune amélioration du pré-entraînement ne se verra sur cette tâche, et il faut porter l’effort sur les leviers 1 et 4. Si l’écart est grand, le levier 3 est justifié. C’est l’expérience la plus informative du lot, et elle n’a pas encore été faite.

### 7.7.4 Levier 4 — L’adaptation et la mesure

- **Un fine-tuning moins gourmand.** Mettre à jour 302 M de paramètres avec 144 essais par sujet est un régime où le surapprentissage est la règle ; le `layer_decay` a montré à quel point le réglage de *qui* apprend change tout (§ 4.6). Les alternatives sont connues : geler les premiers blocs, adapter seulement les normalisations et la tête, ou insérer des matrices de bas rang (LoRA). Elles réduisent aussi le coût mémoire, donc le temps de cycle. Statut : prospectif, coût faible.
- **La calibration par sujet.** Le protocole LOO fine-tune du chapitre 3 (n° 5) correspond au coût réel d’une BCI : quelques essais du nouvel utilisateur pour adapter la tête. Notre LOSO l’implémente déjà (stade *finetune*) ; ce qu’il reste à mesurer est la **courbe** exactitude en fonction du nombre d’essais de calibration, qui dit combien de minutes d’enregistrement il faut à un nouvel utilisateur. Coût : réutilise les plis existants.
- **Mesurer avant de conclure.** Trois graines sur le run population ; intervalles de confiance sur les plis LOSO ; alignement strict des plis et de la métrique avec la ligne LaBraM avant toute comparaison inter-modèles ; et un regard par sujet plutôt qu’une moyenne, puisque les sujets durs communs (004, 019, 020, 031, 046) sont le vrai objet du travail avec Liz. Ce levier n’améliore aucun algorithme, mais il conditionne la capacité à savoir si les autres ont marché.

### 7.7.5 Synthèse et ordre d’attaque

| Piste | Levier | Statut | Coût | Ce que l’on apprend |
|---|---|---|---|---|
| EA / CSD / rejet d’artefacts (CSP + LDA sur sujets durs) | entrée | prêt à tester | minutes CPU | si le problème est en amont du modèle |
| CSP + LDA sur 43 sujets | mesure | à faire | minutes CPU | une baseline défendable |
| *Dropout* de canaux, pooling par attention | représentation | prospectif | 1 run population | si la fusion / l’identité d’électrode limitent |
| Fine-tuning partiel (blocs gelés, LoRA) | adaptation | prospectif | 1 run population | si le surapprentissage domine |
| 3 graines + IC LOSO | mesure | à faire | 3 runs | la barre d’erreur |
| Pré-entraîné vs de zéro | objectif | à faire | 1 run long | la valeur du pré-entraînement *ici* |
| Fine-tuning à 256 Hz natif | représentation | prospectif | 1 run population | si l’échelle temporelle est apprise |
| Corrélation / cible spectrale | objectif | prospectif | re-pré-entraînement réduit | si l’objectif MAE est le bon |
| Codage d’électrode par coordonnées | représentation | prospectif | re-pré-entraînement | transfert inter-montages |

La règle d’ordre est celle apprise pendant le stage : commencer par ce qui répond en minutes, réserver les runs longs à ce que les runs courts n’ont pas pu trancher, et ne lancer aucun re-pré-entraînement avant que l’ablation « de zéro » ait montré qu’il en vaut la peine.

## 7.8 Recul sur la démarche

Quatre situations concrètes, et ce qu’elles m’ont appris comme méthode de travail.

**Situation 1 — Trois protocoles au niveau du hasard sur BCI-IV-2a.** Analyse : la première réaction naturelle (« le modèle ou le point de contrôle est mauvais ») était non vérifiable, donc inutile. J’ai à la place décomposé la chaîne — les données sont-elles lues ? le mapping de canaux est-il correct ? le modèle apprend-il son propre ensemble d’apprentissage ? — et j’ai constaté que l’exactitude d’apprentissage restait elle aussi au hasard. Conclusion : quand l’apprentissage lui-même ne progresse pas, la question n’est pas la généralisation mais l’optimisation ou l’entrée. Ce raisonnement a été réutilisé deux fois par la suite.

**Situation 2 — Le prétraitement absent.** Analyse : ST-EEGFormer et une LDA restaient tous deux au hasard sur les données du laboratoire. Deux méthodes sans rapport qui échouent de la même façon désignent leur point commun : les données. La comparaison ligne à ligne avec le pipeline de ma collègue a révélé l’absence de filtrage, de référence, de correction de ligne de base, et une fenêtre quatre fois trop courte. Conclusion, appliquée depuis : **maintenir un témoin bon marché** (ici la LDA) qui permet de distinguer un problème de données d’un problème de modèle en quelques minutes plutôt qu’en quelques jours. Corollaire : quand un collègue a un pipeline qui marche sur les mêmes données, la comparaison ligne à ligne coûte moins cher que le débogage isolé.

**Situation 3 — Un modèle de 302 millions de paramètres qui ne mémorise pas 144 exemples.** Analyse : ce comportement est impossible pour une raison de capacité ; il fallait donc chercher dans ce qui empêche les poids de bouger. La lecture de la configuration et du code de décroissance de taux d’apprentissage a fourni le calcul du § 4.6 : avec `layer_decay = 0,75` et 24 blocs, les premières couches apprennent à environ 2 × 10⁻⁷ par pas. Le modèle était, de fait, gelé. Conclusion : les valeurs par défaut d’un dépôt encodent le contexte de ses auteurs (grand jeu, long entraînement) et doivent être relues comme des hypothèses, pas comme des réglages neutres. Et le bon diagnostic est plus utile que le bon jugement : « le modèle n’apprend pas » est une observation, « le modèle est mauvais » n’en est pas une.

**Situation 4 — Une documentation d’infrastructure obsolète.** Analyse : l’adresse de connexion Slurm indiquée par le wiki du laboratoire ne répondait pas. Le diagnostic naturel — « je suis hors du bon réseau » — était faux : le nœud n’existait plus. J’ai fourni à mon encadrant un état factuel (ce qui répond, ce qui ne répond pas, depuis quelles machines), ce qui a permis une réponse utile en un échange : le point d’entrée est `mnode`, avec un module à charger. Conclusion : formuler une question technique avec ses éléments de preuve fait gagner des jours, et signaler un blocage sans le dramatiser — état des lieux, hypothèse, prochaine action exécutable — est une compétence de communication autant que de technique.
