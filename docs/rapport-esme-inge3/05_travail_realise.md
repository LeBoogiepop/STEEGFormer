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

L’accès Slurm n’était pas immédiat (`sbatch` absent tant que le module n’est pas chargé ; ancienne IP `10.229.63.172` hors service). À partir du 13 juillet : `mnode` + `module load slurm/23.02.7`. Test de fumée validé, travail LOSO soumis (`77622` sur `kng11`, puis suivi sous d’autres IDs dont `109704`). Aucun mean n’est alors calculé sur un sous-ensemble de plis (règle tenue jusqu’au 2 septembre, § 5.10).

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

## 5.10 Fin août – 2 septembre — LOSO terminé, comparaison Liz, VPN A100

Le LOSO a été relancé après des interruptions (job mort, reprise par `COMPLETED`). Au **2 septembre 2026**, `find … -name COMPLETED | wc -l` donne **41**, y compris `leave_out_sub-059`. Le script `summarize_g2_json_logs.py` agrège **41** journaux avec métriques : mean **53,55 % ± 3,20 %** (`acc1_whole`, stade *finetune*). Le dossier `leave_out_sub-060` existe sans JSON. L’arborescence n’a pas 43 leave-out (IDs absents, ex. 010).

Le même jour, comparaison per-sujet avec Liz (LaBraM). Sujets durs communs aux deux pipelines : **004, 019, 020, 031, 046** (015 à regarder). Pistes proposées par Liz, **pas encore mesurées sur le ViT** : Euclidean Alignment, filtrage laplacien (CSD), rejet d’artefacts plus strict. Un script CSP+LDA a été préparé (`benchmark/spatial_attention/test_liz_preprocessing.py`).

Accès **ATR A100** : certificats VPN reçus le 1er septembre (Sawada / TSG) ; connexion OK le 2 septembre depuis hors LAN ATR (`abi-dgx-a100.cns.atr.jp`, 8 × A100 40 Go, env conda `steeegformer`, PyTorch 2.6 + CUDA). Les `.pkl` restent sur **mnode** ; le VPN ATR n’ouvre pas `10.232.11.170`. Cuong a signalé une sous-utilisation probable des CPU alloués aux jobs Slurm (travail borné GPU, `num_workers` bas) — à régler avec Kubo-san avant le prochain `sbatch`.
