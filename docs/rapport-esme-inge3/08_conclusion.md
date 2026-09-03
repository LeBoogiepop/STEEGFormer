# 8. Conclusion

## 8.1 Ce qui a été fait

Ce stage de fin d’études, effectué du 2 avril au 30 septembre 2026 au Ishii Laboratory de l’université de Kyoto, portait sur l’évaluation d’un modèle de fondation EEG, **ST-EEGFormer** (Yang et al., ICLR 2026), sur une tâche d’attention spatiale du laboratoire, en comparaison avec **LaBraM** et avec une baseline linéaire.

Les cinq objectifs fixés au chapitre 1 ont été atteints.

| Objectif | État |
|---|---|
| Comprendre l’état de l’art des modèles de fondation EEG et l’écosystème du laboratoire | **Atteint** — séminaire d’avril, ligne POYO / `torch_brain` installée et exécutée |
| Choisir un modèle implémentable et son comparateur | **Atteint** — ST-EEGFormer (code MIT, points de contrôle publiés) et LaBraM |
| Rendre le benchmark exécutable hors de son environnement HPC d’origine | **Atteint** — Windows, macOS, puis cluster du laboratoire sous Slurm |
| Obtenir un chiffre population honnête sur les données du laboratoire | **Atteint** — 61,66 %, avec LDA à 55,7 % et hasard à 50 % |
| Lancer un protocole *leave-one-subject-out* complet | **Atteint** — 41/41 `COMPLETED` au 2 sept. 2026 ; **53,55 % ± 3,20 %** (finetune, script officiel) |

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

Le stage se poursuit jusqu’au 30 septembre 2026. Les priorités restantes sont les tests de preprocessing proposés par Liz (EA, laplacien, artefacts) avant tout rerun GPU long, une baseline classique renforcée (LDA/CSP sur 43 sujets), un reporting de confiance, et l’ablation « pré-entraîné contre entraîné de zéro » qui déciderait si, sur cette tâche, le pré-entraînement mérite son coût. Dépôt ESME visé le **14 septembre** ; soutenance le **21 septembre**.
