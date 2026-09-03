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
| **LOSO (LOO fine-tune)** | 41 plis dans l’arborescence actuelle (IDs absents, ex. 010) : entraînement sur les autres sujets, puis adaptation et test sur le sujet exclu | **terminé** (2 sept. 2026) ; mean finetune **53,55 % ± 3,20 %** |

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
