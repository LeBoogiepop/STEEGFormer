# Script oral + pense-bête — 19 août 2026

Haut de chaque note = **à lire** (anglais). Bas = **pense-bête FR**, ne pas lire à voix haute.

Fichier : `presentations/ST-EEGFormer_study_session_2026-08-19_NEW.pptx` (l’ancien `.pptx` est verrouillé s’il est ouvert).

## Slide 1 — Title

Good afternoon. Thank you Ishii-sensei, and thank you everyone. This is the EEG half of the transformer study session. Yesterday was calcium imaging: CalM presented by Miyamoto-san, and POCO presented by Hatsuta-kun. Today I present ST-EEGFormer, and Ishii-sensei will present LaBraM after me.

The paper is titled Are EEG Foundation Models Worth It: Comparative Evaluation with Traditional Decoders in Diverse BCI Tasks. Authors: Liuyin Yang, Qiang Sun, Ang Li, and Marc Van Hulle, Computational Neuroscience Group at KU Leuven. It is accepted at ICLR 2026. The official code is the repository we use. The model name is spatiotemporal EEGFormer, ST-EEGFormer.

I will speak for about twenty minutes. The structure follows the paper: first the question, then the architecture, then the masked autoencoder, then the six evaluation protocols, then the ranking results, then the comparison with LaBraM. One short slide at the end is how we use the large checkpoint on the lab spatial-attention task. I will not present unfinished leave-one-subject-out cluster numbers today — I do not have the lab logs with me.

If something is unclear, please interrupt.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
Tu présentes le papier, pas tes résultats labo. Ishii présente LaBraM après toi.

ICLR = grande conf. deep learning. « accepted » = vrai (poster ICLR 2026).

ST-EEGFormer = SpatioTemporal EEG Transformer. Spatio = électrodes (espace), Temporal = le temps du signal.

Si on te demande le LOSO labo : « I do not have the cluster logs with me today. I will update later. » Ne jamais inventer de moyenne.

« Yesterday » = 18 août (CalM / POCO). Aujourd’hui = 19 août. Ne pas inverser.

---

## Slide 2 — The paper’s question

The paper is not only an architecture paper. The title is a question: are EEG foundation models worth it, compared with traditional BCI decoders?

Foundation models for EEG claim that self-supervised pretraining on large unlabeled recordings gives generalizable representations, so you do not have to train from scratch for every task — motor imagery, P300, SSVEP, and so on. The authors argue that published advantages are often shown under limited conditions: one or two protocols only, for example only population decoding or only leave-one-subject-out zero-shot, rarely with statistical tests, and almost never against classical non-neural decoders such as CSP, filter-bank CSP, Riemannian geometry classifiers, FBCCA or TRCA. Those classical methods remain very competitive when you have little data per subject, which is the usual BCI setting.

So they build a grid. Five foundation models: BIOT, BENDR, CBraMod, EEGPT, LaBraM, plus their own ST-EEGFormer. Each foundation model is run in linear probing and in full fine-tuning. They also run classic CNNs: EEGNet, DeepConvNet, Conformer, CTNet. Plus non-neural baselines. Downstream: seven classification tasks of very different difficulty, from almost-binary error-related negativity up to 40-target SSVEP, four-class motor imagery, inner speech, Alzheimer’s diagnosis, and two regression tasks, DTU auditory attention and SEED-VIG vigilance.

The control model is deliberately simple: ST-EEGFormer. The paper says that some recent work, including LaBraM-style models, has argued that MAE on raw EEG is ineffective and that you need a discrete neural tokenizer. If a ViT with only MAE on raw patches is competitive after fine-tuning, then those complex pretraining objectives are not strictly necessary. That is the logic of the paper.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
Foundation model = gros modèle pré-entraîné sur beaucoup de données, puis réutilisé. Comme GPT pour le texte, mais ici pour l’EEG.

Self-supervised = on n’a pas besoin des labels (gauche/droite, etc.) pendant le pré-entraînement. On invente une tâche (cacher des morceaux, reconstruire).

BCI = brain–computer interface. Décoder l’intention / l’attention depuis l’EEG.

Décodateurs classiques (à citer, pas à expliquer en détail) :
• CSP / FBCSP = filtres spatiaux pour l’imagerie motrice
• Riemannian = géométrie des matrices de covariance EEG
• FBCCA / TRCA = méthodes SSVEP (fréquences de flicker)

Linear probing = on gèle le gros réseau, on entraîne seulement une petite couche linéaire. Fine-tuning = on ré-entraîne (presque) tout.

ST-EEGFormer n’est pas « le modèle magique ». C’est le contrôle SIMPLE du papier, pour tester si un tokenizer discret est vraiment nécessaire.

Si Ishii te reprend sur « LaBraM dit que MAE est inefficace » : attribue ça au papier Yang (« the authors write that… »), ne parle pas à la place de LaBraM.

---

## Slide 3 — ST-EEGFormer = ViT + MAE on raw EEG

ST-EEGFormer means spatiotemporal EEG Transformer. Spatiotemporal because each token is a short temporal patch of one EEG channel. Space is the electrode; time is the patch along the signal.

Pretraining is only masked autoencoding. There is no vector-quantized codebook, no next-token language-model loss, no spectral tokenizer. You hide most patches and reconstruct the raw waveform with mean squared error. The authors chose this on purpose: they wanted a transparent control, not a new fancy objective.

They pretrain on more than eight million EEG segments. Three sizes: small, base, and large. Large has more than 300 million parameters. That is the checkpoint we use in the lab. Downstream data in the paper is minimally preprocessed: 0.1 to 128 hertz bandpass and resampling to 256 hertz.

The scientific claim against LaBraM is important for today, because Ishii-sensei presents LaBraM next. The paper says a simple MAE on raw patches already reaches the best average rank among the models they compared, after fine-tuning. So, in their benchmark, a discrete tokenizer is not required for strong downstream decoding.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
Token = un petit morceau du signal, transformé en vecteur. Ici : 16 échantillons d’UNE électrode.

MAE = Masked Autoencoder. On cache 75% des tokens, le modèle doit reconstruire le signal brut. Comme cacher des pixels d’une image et les redessiner.

MSE = erreur quadratique moyenne : (prédiction − vrai signal)². On prédit des VOLTAGES, pas des mots d’un dictionnaire.

VQ / codebook / tokenizer discret = on remplace le signal par un numéro dans un dictionnaire (comme LaBraM, comme CalM). ST-EEGFormer ne fait PAS ça.

ViT = Vision Transformer. Recette d’images (patches) appliquée à l’EEG.

Large ≈ >300 M paramètres (README). Small / base existent aussi. On utilise large au labo.

Ne pas confondre pré-entraînement papier (8 M segments, ~128 Hz) et notre finetune labo (43 sujets, 256 Hz).

---

## Slide 4 — Architecture from the paper (MAE + downstream)

This is the paper figure. Panel a is the six evaluation protocols — I will come back to that. Panel b is the model.

Start from raw multi-channel EEG. Segment into a grid of spatiotemporal patches: each small rectangle is a few time samples of one channel. A linear layer projects each patch to a token. Then two positional encodings: temporal positional encoding, sinusoidal in time, and spatial positional encoding, a learned embedding for the electrode. A class token is prepended, as in Vision Transformers.

For pretraining, most tokens are masked, 75 percent. The encoder sees only the visible tokens. Mask tokens are put back, a Transformer decoder plus a linear layer reconstructs the EEG patches in sample space.

For downstream tasks, there is no masking. The full sequence goes through the encoder. The class token, sometimes with averaging of patch tokens, goes to a linear head. Classification examples: motor imagery, SSVEP, error-related negativity. Regression: auditory attention and vigilance.

Two paths, one encoder. Pretrain reconstructs. Finetune classifies or regresses. The decoder is thrown away at finetune time.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
Montre la figure en parlant. Panel a = les 6 protocoles (slide 9). Panel b = le modèle.

Chemin 1 (haut, pré-entraînement) : EEG → patches → on cache 75% → encoder → decoder → reconstruire le signal.

Chemin 2 (bas, finetune) : EEG → patches → encoder COMPLET (rien de caché) → CLS / moyenne → tête linéaire → classe ou régression.

CLS token = un vecteur spécial collé au début, qui « résume » la séquence. Recette ViT.

TPE = où on est dans le TEMPS (sinus/cosinus, comme Transformer original).
SPE = QUELLE électrode (vecteur appris par index de canal).

Encoder = le gros ViT qu’on garde. Decoder = seulement pour le MAE, jeté ensuite.

Si on te demande de pointer : « patches on the left, encoder in the middle, reconstruction on top, classification head at the bottom. »

---

## Slide 5 — Input: continuous patches, not a codebook

This slide is from the code, which implements the paper. The class is PatchEmbedEEG. It unfolds each channel with kernel size 16 and stride 16, so patches do not overlap. Then a linear layer maps those 16 samples to the embedding dimension. There is no vector-quantized codebook, no nearest-neighbor lookup in a vocabulary. Each token is a continuous vector.

Then two positional encodings, called TPE and SPE in the paper figure. Temporal positional encoding is sinusoidal, like the original Transformer. Spatial positional encoding is a learned embedding over channel indices, 145 slots in the code, covering the pretrained electrode set. The official README says the model is designed for 128 hertz, pretrained to reconstruct about 6-second segments, up to 142 EEG channels.

Large, which we use: embedding 1024, depth 24, 16 heads, MLP ratio 4, more than 300 million parameters. Small and base also exist.

For yesterday’s calcium session: this is continuous patch embedding, like CAPT, not discrete like CalM. CalM’s neural quantizer is a codebook. ST-EEGFormer never discretizes.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
Unfold + Linear = découper le signal en fenêtres de 16 samples, puis une couche linéaire 16 → 1024 (large). PAS un dictionnaire.

128 Hz / ~6 s = spec du PRÉ-ENTRAÎNEMENT papier. Notre labo = 256 Hz, 8 s. Ce n’est pas une contradiction : on adapte / resample en finetune. Si on te demande : « the pretrained model was designed for 128 Hz; we fine-tune it on our 256 Hz recordings. »

142 canaux (README) vs 145 slots (nn.Embedding dans le code). Dis : « the embedding table has 145 slots; the README says up to 142 electrodes. » Ne pas inventer pourquoi 145.

CAPT (hier) = signal continu, comme ST-EEGFormer. CalM = VQ discret, comme LaBraM. C’est LE mapping à retenir. Tu t’étais trompé le 6 août (« tokenization ») ; Ishii t’a envoyé vers CalM. Ne plus dire que ST-EEGFormer tokenize.

Ne raconte le bug senloc QUE si on te demande pourquoi les indices de canaux comptent.

---

## Slide 6 — Attention mixes channels and time in one sequence

This is the question Ishii-sensei asked: what does the attention do? Between channels? In time?

After patching, the model concatenates all channel-time patches into one sequence. Self-attention is the standard Vision Transformer attention, so it is full. A token from channel C1 at time t can attend to channel C2 at another time. So yes, there is inter-channel attention, and there is temporal attention, in the same softmax.

It is not CalM’s Dual-Axis Transformer. CalM splits a neural axis, bidirectional across neurons, and a temporal axis, causal in time, and it predicts the next token. ST-EEGFormer has one attention pool. Channel identity is only the learned spatial embedding added to the token. There is no separate neural-axis block.

And it is bidirectional, because MAE reconstruction looks at context on both sides of a masked patch. It does not predict the next neuron’s future activity. If we later import next-neuron prediction from calcium models, that would be a new objective. It is not in this paper.

The paper also visualizes attention after fine-tuning. Maps change a lot. That is their evidence that fine-tuning overwrites much of the pretraining specialization, which is why a simple MAE backbone can catch up with more complex tokenizers after adaptation.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
Question d’Ishii : l’attention mélange-t-elle les CANAUX et le TEMPS ? Réponse : OUI les deux, dans UN seul softmax.

Self-attention = chaque token calcule des poids vers tous les autres. « Full » = pas de masque causal : on voit le passé ET le futur (normal pour du MAE).

Exemple : C3 à t=1s peut regarder Oz à t=3s. Mélange spatial + temporel.

PAS dual-axis (CalM) : CalM a deux attentions séparées (neurones / temps). Ici une seule liste plate (canal × temps).

Bidirectionnel ≠ prédiction du futur. MAE = reconstruire un trou au milieu, donc on a besoin des deux côtés.

Si on te demande « causal ? » : Non. Si « next-neuron prediction ? » : Non, ce n’est pas dans ce papier.

---

## Slide 7 — Self-supervised objective: MAE, mask 75%

The self-supervised task is Masked Autoencoder, the same recipe as MAE in computer vision, applied to EEG patches.

Default mask ratio is 75 percent. Random tokens are removed. The encoder, 24 blocks for the large model, sees only the remaining patches plus the class token. After encoding, mask tokens are inserted back in the original positions. A lighter decoder Transformer processes the full sequence. A linear layer maps each token to patch_size sample values — sixteen numbers, the raw waveform of that patch.

The loss is mean squared error between prediction and the true samples, averaged only over the masked patches. Not cross-entropy on discrete token indices. That is the difference with LaBraM and with CalM: those models predict codebook indices. ST-EEGFormer predicts voltages, essentially.

The paper’s point: this simple reconstruction is enough for a strong fine-tuned decoder. You do not need a more exotic pretraining task to get the best average rank in their table. That is their answer to the claim that MAE on raw EEG is ineffective.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
Recette MAE (He et al., vision) : cacher beaucoup, encoder seulement ce qui reste, decoder reconstruit les trous.

75% = défaut du code (mask_ratio=0.75). Encoder large = 24 blocs. Decoder = plus léger (8 blocs, dim 512 dans le code).

Loss seulement sur les patches CACHÉS, pas sur ceux que l’encoder a vus. Sinon c’est trop facile.

LaBraM / CalM : prédisent un INDEX de codebook (classification). ST-EEGFormer : prédit 16 nombres (régression du signal).

« Voltages, essentially » = le signal EEG brut. Tu n’as pas besoin de l’unité exacte (µV).

Si on te dit « MAE on raw EEG doesn’t work » : « that is the claim this paper tests; after fine-tuning, ST-EEGFormer-large gets the best average rank in their table. »

---

## Slide 8 — Downstream: drop the MAE decoder, add a linear head

At finetune time the MAE decoder is discarded. Only the encoder is kept. There is no masking. The sequence of all patches goes through the encoder. The paper uses the class token, with averaging, then a linear head for classification or regression.

A main empirical result: linear probing, meaning freeze the backbone and train only a linear head, is weak on almost every protocol. Fine-tuning the backbone is necessary to get the advertised foundation-model gains. The only exception they highlight is error-related negativity, a relatively easy detection task, where linear probes already work well, near ceiling.

They also warn about hidden confounders. Some models, EEGPT and CBraMod, use multi-layer heads even when they say linear probing, so the head is not really linear — extra capacity is hidden in the “linear” setup. How you fuse tokens — class token versus average pooling — also changes the receptive field. So when you compare backbones, you must standardize the head. That is one of the paper’s fairness contributions.

In our lab finetune we use SoftTarget cross-entropy, layer decay 1.0 so the whole backbone adapts, and no mixup. That is our setting, not a number from the paper.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
Finetune = on jette le decoder MAE. On garde l’encoder. On ajoute une petite tête (classe gauche/droite, etc.).

Linear probing (LP) = backbone GELÉ. Fine-tuning (FT) = backbone qui bouge. Message du papier : LP est faible → les features pré-entraînées ne sont pas « prêtes à l’emploi ».

Exception ERN : tâche facile de détection d’erreur, LP déjà au plafond. Ne pas généraliser.

Piège « linear » : EEGPT / CBraMod mettent parfois plusieurs couches dans la tête « linéaire ». Ce n’est plus linéaire. D’où leur point sur la fairness.

Notre labo (pas le papier) : SoftTarget CE, layer_decay=1.0 (toutes les couches même LR), mixup=0. Cité seulement comme contexte, pas comme résultat Yang.

---

## Slide 9 — Six protocols: what “generalization” actually means

The paper’s main methodological contribution is this six-dimensional protocol, not only the model. They argue that published EEG foundation-model papers often report one or two protocols only, which inflates the story.

Population: train one model on pooled data from all subjects, test on that pool. This is data-rich, and this is where foundation models look best.

Per-subject self: train and test on the same person. Little data. Classic clinical BCI. Here compact CNNs and even non-neural methods often match foundation models — no significant difference in the paper’s tests.

Per-subject transfer: a model trained on subject A is tested on subject B.

Then three leave-one-subject-out variants. Zero-shot: train on everyone except one, test that person with no extra training. Fine-tune: allow a little adaptation on the held-out person. Drop: after that adaptation, how much did you forget the original population performance — catastrophic forgetting. Classic CNNs suffer the most on LOO drop.

They use Wilcoxon signed-rank, permutation, and Mann–Whitney U tests with Bonferroni correction. Metrics: accuracy, AUC, kappa for classification; MSE and Pearson R for regression.

I am describing the paper’s protocols. I am not reporting our lab leave-one-subject-out run today.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
C’est le cœur MÉTHODO du papier. « Generalization » n’est pas un mot unique : 6 mesures.

1 Population = tout le monde mélangé. Beaucoup de data. FM gagnent ici. C’est AUSSI notre proto labo (61.7%).

2 Per-subject self = un modèle par personne. Peu de data. CNNs / CSP tiennent le coup.

3 Transfer A→B = un modèle perso testé sur quelqu’un d’autre. Souvent mauvais.

4 LOO zero-shot = entraîner sur 42, tester le 43e SANS adapter.
5 LOO fine-tune = puis adapter un peu sur le 43e.
6 LOO drop = après cette adaptation, est-ce qu’on a oublié les 42 autres ? (catastrophic forgetting)

CES LOO sont ceux du PAPIER Yang. PAS notre job Slurm. Phrase de sécurité : « these are the paper’s protocols, not our lab LOSO. »

Stats : tests non-paramétriques + Bonferroni (correction pour comparaisons multiples). Tu n’as pas besoin de dériver les tests. Dire « they report statistical tests with Bonferroni correction » suffit.

---

## Slide 10 — Downstream matrix: 7 classification + 2 regression

This is the paper’s downstream matrix. Seven classification tasks of very different difficulty, plus two regression tasks. Most of these were not in the pretraining data, so it is a transfer test, not memorization of the same paradigm.

Error-related negativity is almost binary detection. Linear probes already hit a ceiling near 99.9 percent. That is the one case where frozen pretrained features look useful.

Then clinical and BCI tasks: three-class Alzheimer’s diagnosis, four-class inner speech, four-class motor imagery on BCI Competition IV 2a, seven-class upper-limb execution or imagery, and forty-target SSVEP. Inner speech stays hard no matter the model size. On SSVEP, classical non-neural methods such as FBCCA remain very competitive.

Regression is a separate story. The paper reports that classification-to-regression transfer is fragile. On DTU auditory attention with one-second windows, Pearson R is about 0.05 even for the best models. On SEED-VIG vigilance, five-second windows, classic CNNs lead with R above 0.45, and differences with foundation models are not significant.

So the paper’s ranking is not one number on one dataset. It is this heterogeneous mix. Easy tasks saturate. Hard tasks do not move. Regression does not inherit classification pretraining for free.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
Ne pas réciter les 9 tâches. 3 phrases : facile (ERN), difficile (inner speech), régression fragile (DTU).

ERN = potentiel d’erreur (le cerveau « oops »). Quasi binaire, très facile → 99.9% n’est PAS impressionnant.

BCI-IV-2a = le benchmark public d’imagerie motrice (4 classes). On l’a aussi dans le repo, mais CE n’est pas le talk d’aujourd’hui.

SSVEP = flicker à des fréquences ; 40 cibles. FBCCA est une méthode classique très forte ici.

Pearson R = corrélation prédiction / vérité. 0.05 ≈ presque rien. 0.45 = déjà utile.

Si on te pousse sur « LaBraM collapse on DTU » : reste vague. « several fine-tuned foundation models degrade on DTU, according to the paper. » Ne pas humilier LaBraM.

---

## Slide 11 — Result: ST-EEGFormer-large fine-tuned ranks first (5.61)

This is Figure 3 from the paper, the ranking plot. Lower average rank is better. Ranks are aggregated across datasets, metrics, subjects, and the six protocols.

Important naming: minus s, b, l after the model name means small, base, large. The letter in parentheses is the protocol: l means linear probe, f means fine-tune. So ST-EEGFormer-l in parentheses f is the large model, fully fine-tuned.

Green bars are classic CNNs trained from scratch: DeepConvNet, EEGNet, Conformer, and CTNet. CTNet is the strongest classic decoder, average rank 6.42. A compact CNN without any foundation-model pretraining is already very good.

Purple bars are linear probes. They are clearly worse. ST-EEGFormer-large linear probe is 11.50. LaBraM linear probe is 13.36. Frozen pretrained features do not transfer well to these BCI tasks.

Red bars are full fine-tuning. ST-EEGFormer-large fine-tuned reaches 5.61, the best average rank in the comparison. Fine-tuned small and base are 7.25 and 6.55, around CTNet. LaBraM fine-tuned is 8.99 in this table.

The heatmap is protocol by protocol. Dark red is rank 1. Fine-tuned ST-EEGFormer is especially strong on population. Linear probes are blue, poor rank. Fine-tuning is what turns the foundation model into a competitive decoder.

Take-home: after fine-tuning, this simple MAE model is at least as good as more complex foundation models, including LaBraM, on Yang et al.’s benchmark. That is the paper’s evidence that raw MAE is enough — in this ranking, not as a universal claim.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
PIÈGE N°1 : -l = LARGE. (l) = LINEAR PROBE. (f) = FINE-TUNE.
ST-EEGFormer-l (f) = large + finetune = 5.61 = le gagnant.
ST-EEGFormer-l (l) = large + probe = 11.50 = mauvais.

Rank MOYEN plus petit = mieux (1 = premier). Ce n’est PAS une accuracy.

Chiffres à retenir (figure) :
• ST-EEGFormer-l (f) = 5.61 meilleur
• CTNet = 6.42 meilleur CNN classique
• ST-EEGFormer-b (f) = 6.55, -s (f) = 7.25
• LaBraM (f) = 8.99
• ST-EEGFormer-l (l) = 11.50 ; LaBraM (l) = 13.36

Ton pour Ishii : « in this table », pas « LaBraM is worse in general ».

Heatmap : rouge foncé = bon rang. Population = là où les FM aident le plus.

---

## Slide 12 — Four findings (the paper’s answer to “worth it?”)

Four messages from the paper — this is their answer to the title question.

One: linear probing is weak. Fine-tuning consistently beats linear probing except for EEGPT, which already uses a stronger head. So “foundation model” does not mean you can freeze the backbone and get a good BCI decoder. Frozen features are not plug-and-play, except on easy detection such as ERN.

Two: they are worth it mainly in data-rich population settings. In data-scarce per-subject settings, compact CNNs such as CTNet, and classical non-neural decoders such as CSP, Riemannian geometry, FBCCA, TRCA, are statistically competitive. That matters for us: our lab task has 43 subjects, which is in the small-data regime the paper warns about.

Three: no clear scaling law among neural decoders. Bigger is not reliably better on these BCI sets. The fit of accuracy versus size is very weak, while training time grows fast with size. The bottleneck is dataset size, not model size. There is no EEG ImageNet yet.

Four: a simple MAE on raw EEG is enough to get the best average rank, 5.61 for the large model after fine-tuning. After fine-tuning, differences from more complex pretraining, including tokenization, largely disappear. Attention maps also change a lot, which they read as fine-tuning overwriting pretraining specialization.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
Les 4 phrases à retenir si tu perds le fil :
1. Il faut finetuner, pas seulement prober.
2. Les FM aident surtout quand il y a BEAUCOUP de data (population).
3. Plus gros ≠ mieux ici (petits datasets BCI).
4. MAE brut suffit ; le tokenizer n’est pas obligatoire DANS CE BENCHMARK.

Exception EEGPT en LP : tête plus grosse, donc LP « gonflé ». C’est le point fairness du papier.

43 sujets labo = <50, le régime « small » du papier. Notre 61.7% ≈ LaBraM 62% colle au finding 4 (après FT, les FM se ressemblent).

Ne cite pas un R² inventé. Dis « poor fit ». Le papier dit aussi que le temps d’entraînement monte vite avec la taille.

« EEG ImageNet » = un énorme dataset unifié qui n’existe pas encore. Limitation honnête des auteurs.

---

## Slide 13 — ST-EEGFormer vs LaBraM (today’s pair)

This table is the hand-off to Ishii-sensei, who presents LaBraM next. I keep the comparison factual and short.

ST-EEGFormer represents EEG as continuous patches: unfold plus a linear layer. Self-supervised learning is MAE, mean squared error on the raw samples of the 75 percent masked patches. Attention is a single-axis Vision Transformer on the flattened channel-time sequence, bidirectional.

LaBraM represents EEG as discrete tokens from a neural tokenizer, vector quantization, a codebook. Self-supervised learning is masked token prediction. Ishii-sensei mentioned a spectrum-based reconstruction loss; I leave the details to him.

In Yang et al., after fine-tuning, ST-EEGFormer-large has the best average rank, 5.61. LaBraM fine-tuned is 8.99 in that ranking table. Linear probing is weak for both.

The paper does not say LaBraM is useless. It says that after fine-tuning, the extra complexity of a discrete tokenizer does not clearly beat raw MAE on these BCI tasks. Fine-tuning also changes attention maps a lot, which they interpret as overwriting much of the pretraining specialization. That is Yang et al.’s claim. The LaBraM talk can confirm, qualify, or contradict it.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
NE PAS dire qu’Ishii n’a pas fini de lire LaBraM. NE PAS dire que LaBraM est nul.

Phrase de passation : « I leave the LaBraM details to Ishii-sensei. »

Tableau en 4 lignes :
• Tokens : continu (nous) vs discret VQ (eux)
• SSL : MSE sur le signal vs prédire des tokens / spectre
• Attention : un ViT plat vs Transformer sur tokens discrets
• Rang FT dans CE papier : 5.61 vs 8.99

Spectrum loss : Ishii l’a mentionné. Tu n’es pas expert LaBraM. « I leave the details to him » est la phrase intelligente.

Mapping calcium : ST-EEGFormer ≈ CAPT (continu). LaBraM ≈ CalM (VQ).

---

## Slide 14 — How we use it in the lab (context only)

Last slide of lab context, not a new experiment, and not a result from Yang et al. I keep it short so we stay on the paper.

In the lab we fine-tune the official large checkpoint on ATR spatial attention: covert left versus right, 43 subjects, eight-second attention windows at 256 hertz, 64 channels after dropping EOG. That is the Morioka 2014 paradigm, preprocessing aligned with Liz.

On 23 July I reported population accuracy 61.7 percent, essentially matching Liz’s LaBraM at about 62 percent, above LDA at 55.7 percent, chance 50 percent.

I am not presenting leave-one-subject-out results today. I do not have the cluster logs with me. When I have them I will update separately.

One link to the paper: 43 subjects is exactly the small-N regime where Yang et al. say foundation models may not beat compact models. Matching LaBraM at 61.7 percent is consistent with their finding that after fine-tuning, different foundation models become similar, and the gain over a strong classical baseline is a few points, not a revolution.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
CE n’est pas le papier. C’est NOTRE expérience (séminaire 23 juillet).

Tâche : attention spatiale COUVERTE gauche vs droite (pas bouger les yeux). Morioka 2014. 43 sujets, 8 s, 256 Hz, 64 EEG.

Chiffres autorisés : 61.7% ST-EEGFormer pop ≈ LaBraM ~62% · LDA 55.7% · chance 50%.
Config gagnante (si on te demande) : layer_decay 1.0, mixup 0, lr 3e-4, warmup 5, 50 ep, batch 4.

INTERDIT : moyenne LOSO, « on a gagné », « on est bloqués ».

Lien papier : 43 sujets = petit N. Parité avec LaBraM après FT = exactement le finding Yang.

LDA = classifieur linéaire classique. 55.7% montre que la tâche n’est pas triviale, et que le FM ajoute ~6 points, pas 20.

---

## Slide 15 — Summary

To close, the paper in four sentences, then the lab in one, then the hand-off.

ST-EEGFormer is a Vision Transformer on raw EEG patches, pretrained with masked autoencoding, no discrete tokenizer. Attention mixes electrodes and time in one sequence. The ICLR 2026 paper asks whether EEG foundation models are worth it, and answers: they help when you fine-tune and when data is rich; linear probing is weak; there is no clear scaling law on small BCI sets; and a simple MAE baseline can match more complex models, including tokenizers, after fine-tuning — best average rank 5.61 for the large model.

The authors also call for a large unified EEG dataset, an ImageNet of EEG, because without it we cannot really test scaling. That is a limitation they state honestly.

In the lab we fine-tuned that large checkpoint on spatial attention and got 61.7 percent, matching LaBraM. That is consistent with the paper: after fine-tuning, foundation models look similar, and the gain over LDA is real but not huge.

Ishii-sensei will now present LaBraM, the discrete-tokenizer counterpart. Thank you. I am happy to take questions.

————————————————————————
PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)
————————————————————————
Lis lentement. Puis : « Ishii-sensei, please. »

Q&A express :
• Tokenizer ? « No. Continuous patches, linear projection. »
• Attention canaux ? « Yes, in the same ViT softmax as time. »
• Causal / next neuron ? « No. Bidirectional MAE. »
• LOSO labo ? « No numbers today. »
• Pourquoi 61.7 ≈ 62 ? « Matches the paper: after fine-tuning, FMs become similar. »
• MAE inutile selon LaBraM ? « That is the claim Yang et al. test; in their ranking, raw MAE is enough after FT. »

Si tu ne sais pas : « I don’t want to overclaim; that is in the LaBraM paper / I can check. » Mieux que d’inventer.

---
