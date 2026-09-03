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

## 7.7 Recul sur la démarche

Quatre situations concrètes, et ce qu’elles m’ont appris comme méthode de travail.

**Situation 1 — Trois protocoles au niveau du hasard sur BCI-IV-2a.** Analyse : la première réaction naturelle (« le modèle ou le point de contrôle est mauvais ») était non vérifiable, donc inutile. J’ai à la place décomposé la chaîne — les données sont-elles lues ? le mapping de canaux est-il correct ? le modèle apprend-il son propre ensemble d’apprentissage ? — et j’ai constaté que l’exactitude d’apprentissage restait elle aussi au hasard. Conclusion : quand l’apprentissage lui-même ne progresse pas, la question n’est pas la généralisation mais l’optimisation ou l’entrée. Ce raisonnement a été réutilisé deux fois par la suite.

**Situation 2 — Le prétraitement absent.** Analyse : ST-EEGFormer et une LDA restaient tous deux au hasard sur les données du laboratoire. Deux méthodes sans rapport qui échouent de la même façon désignent leur point commun : les données. La comparaison ligne à ligne avec le pipeline de ma collègue a révélé l’absence de filtrage, de référence, de correction de ligne de base, et une fenêtre quatre fois trop courte. Conclusion, appliquée depuis : **maintenir un témoin bon marché** (ici la LDA) qui permet de distinguer un problème de données d’un problème de modèle en quelques minutes plutôt qu’en quelques jours. Corollaire : quand un collègue a un pipeline qui marche sur les mêmes données, la comparaison ligne à ligne coûte moins cher que le débogage isolé.

**Situation 3 — Un modèle de 302 millions de paramètres qui ne mémorise pas 144 exemples.** Analyse : ce comportement est impossible pour une raison de capacité ; il fallait donc chercher dans ce qui empêche les poids de bouger. La lecture de la configuration et du code de décroissance de taux d’apprentissage a fourni le calcul du § 4.6 : avec `layer_decay = 0,75` et 24 blocs, les premières couches apprennent à environ 2 × 10⁻⁷ par pas. Le modèle était, de fait, gelé. Conclusion : les valeurs par défaut d’un dépôt encodent le contexte de ses auteurs (grand jeu, long entraînement) et doivent être relues comme des hypothèses, pas comme des réglages neutres. Et le bon diagnostic est plus utile que le bon jugement : « le modèle n’apprend pas » est une observation, « le modèle est mauvais » n’en est pas une.

**Situation 4 — Une documentation d’infrastructure obsolète.** Analyse : l’adresse de connexion Slurm indiquée par le wiki du laboratoire ne répondait pas. Le diagnostic naturel — « je suis hors du bon réseau » — était faux : le nœud n’existait plus. J’ai fourni à mon encadrant un état factuel (ce qui répond, ce qui ne répond pas, depuis quelles machines), ce qui a permis une réponse utile en un échange : le point d’entrée est `mnode`, avec un module à charger. Conclusion : formuler une question technique avec ses éléments de preuve fait gagner des jours, et signaler un blocage sans le dramatiser — état des lieux, hypothèse, prochaine action exécutable — est une compétence de communication autant que de technique.
