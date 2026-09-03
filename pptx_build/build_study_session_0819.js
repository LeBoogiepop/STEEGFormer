/**
 * Transformer 勉強会 — 19 Aug 2026, 13:00 Zoom
 * ST-EEGFormer from Yang et al., ICLR 2026 (paper + code).
 * Target: ~20 min. Full speaker notes in every slide.
 *
 * Paper: Are EEG Foundation Models Worth It?
 *   https://openreview.net/forum?id=5Xwm8e6vbh
 *
 * Run: node pptx_build/build_study_session_0819.js
 */

const pptxgen = require("pptxgenjs");
const path = require("path");

const ASSETS = path.join(__dirname, "..", "assets");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Maxime Lacombe";
pres.title = "ST-EEGFormer — Yang et al. ICLR 2026";

const CHAR = "2C3338";
const INK = "1A1A1A";
const MUTED = "5C6570";
const LINE = "D0D5DB";
const BG = "F7F7F5";
const WHITE = "FFFFFF";
const ACCENT = "1F3A5F";
const LIGHT = "EEF2F6";
const GOLD = "FBF7EC";
const HFONT = "Georgia";
const BFONT = "Calibri";

function footer(slide, num, dark) {
  slide.addShape(pres.shapes.LINE, {
    x: 0.7, y: 7.0, w: 11.9, h: 0,
    line: { color: dark ? "4B5563" : LINE, width: 0.75 },
  });
  slide.addText("Yang et al., ICLR 2026  ·  ST-EEGFormer  ·  19 Aug 2026  ·  13:00", {
    x: 0.7, y: 7.1, w: 10.5, h: 0.28, fontFace: BFONT, fontSize: 11,
    color: dark ? "9CA3AF" : MUTED, margin: 0,
  });
  slide.addText(String(num), {
    x: 12.2, y: 7.1, w: 0.5, h: 0.28, fontFace: BFONT, fontSize: 11,
    color: dark ? "9CA3AF" : MUTED, align: "right", margin: 0,
  });
}

function header(slide, title, kicker) {
  slide.addText(kicker.toUpperCase(), {
    x: 0.7, y: 0.28, w: 12, h: 0.24, fontFace: BFONT, fontSize: 11,
    color: ACCENT, bold: true, charSpacing: 1.2, margin: 0,
  });
  slide.addText(title, {
    x: 0.7, y: 0.52, w: 12, h: 0.46, fontFace: HFONT, fontSize: 22,
    color: INK, bold: true, margin: 0,
  });
  slide.addShape(pres.shapes.LINE, {
    x: 0.7, y: 1.05, w: 11.9, h: 0, line: { color: LINE, width: 1 },
  });
}

function panel(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: fill || WHITE }, line: { color: LINE, width: 1 },
  });
}

/** Spoken English + French cheat-sheet. Only the first block is for the room. */
function notes(spoken, cheat) {
  return (
    spoken.trim() +
    "\n\n————————————————————————\n" +
    "PENSE-BÊTE (FR — NE PAS LIRE À VOIX HAUTE)\n" +
    "————————————————————————\n" +
    cheat.trim()
  );
}

let s;

// =====================================================================
// 1 TITLE
// =====================================================================
s = pres.addSlide();
s.background = { color: CHAR };
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: ACCENT } });
s.addText("TRANSFORMER STUDY SESSION  ·  EEG  ·  19 AUGUST 2026  ·  13:00", {
  x: 0.85, y: 1.25, w: 11.5, h: 0.3, fontFace: BFONT, fontSize: 13,
  color: "B0B8C1", bold: true, charSpacing: 1.2, margin: 0,
});
s.addText("ST-EEGFormer", {
  x: 0.85, y: 1.7, w: 11.5, h: 0.65, fontFace: HFONT, fontSize: 38,
  color: WHITE, bold: true, margin: 0,
});
s.addText("Are EEG Foundation Models Worth It?\nComparative Evaluation with Traditional Decoders in Diverse BCI Tasks", {
  x: 0.85, y: 2.45, w: 11.5, h: 0.85, fontFace: BFONT, fontSize: 18,
  color: "C5CCD3", margin: 0,
});
s.addText("Yang, Sun, Li, Van Hulle  ·  KU Leuven  ·  ICLR 2026\nSpatiotemporal EEGFormer: a ViT + MAE baseline on raw EEG", {
  x: 0.85, y: 3.5, w: 11.5, h: 0.7, fontFace: BFONT, fontSize: 15,
  color: "A8B0B8", margin: 0,
});
s.addText("Maxime Lacombe  ·  ~20 minutes  ·  then LaBraM (Ishii-sensei)", {
  x: 0.85, y: 5.85, w: 11.5, h: 0.35, fontFace: BFONT, fontSize: 14,
  color: "8A939C", margin: 0,
});
s.addNotes(notes(
  "Good afternoon. Thank you Ishii-sensei, and thank you everyone. This is the EEG half of the transformer study session. Yesterday was calcium imaging: CalM presented by Miyamoto-san, and POCO presented by Hatsuta-kun. Today I present ST-EEGFormer, and Ishii-sensei will present LaBraM after me.\n\n" +
  "The paper is titled Are EEG Foundation Models Worth It: Comparative Evaluation with Traditional Decoders in Diverse BCI Tasks. Authors: Liuyin Yang, Qiang Sun, Ang Li, and Marc Van Hulle, Computational Neuroscience Group at KU Leuven. It is accepted at ICLR 2026. The official code is the repository we use. The model name is spatiotemporal EEGFormer, ST-EEGFormer.\n\n" +
  "I will speak for about twenty minutes. The structure follows the paper: first the question, then the architecture, then the masked autoencoder, then the six evaluation protocols, then the ranking results, then the comparison with LaBraM. One short slide at the end is how we use the large checkpoint on the lab spatial-attention task. I will not present unfinished leave-one-subject-out cluster numbers today — I do not have the lab logs with me.\n\n" +
  "If something is unclear, please interrupt.",
  "Tu présentes le papier, pas tes résultats labo. Ishii présente LaBraM après toi.\n\n" +
  "ICLR = grande conf. deep learning. « accepted » = vrai (poster ICLR 2026).\n\n" +
  "ST-EEGFormer = SpatioTemporal EEG Transformer. Spatio = électrodes (espace), Temporal = le temps du signal.\n\n" +
  "Si on te demande le LOSO labo : « I do not have the cluster logs with me today. I will update later. » Ne jamais inventer de moyenne.\n\n" +
  "« Yesterday » = 18 août (CalM / POCO). Aujourd’hui = 19 août. Ne pas inverser."
));
footer(s, 1, true);

// =====================================================================
// 2 PAPER QUESTION
// =====================================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "The paper’s question", "Motivation");
panel(s, 0.7, 1.25, 12.05, 1.55, GOLD);
s.addText("Do EEG foundation models actually beat classic BCI decoders — or only look strong under selective protocols?", {
  x: 0.95, y: 1.5, w: 11.55, h: 1.1, fontFace: HFONT, fontSize: 20, color: INK, margin: 0,
});
const mot = [
  ["Problem", "Prior EEG-FM papers often report 1–2 protocols, few statistical tests, and almost never compare to CSP, Riemannian, FBCCA, TRCA."],
  ["Setup", "5 foundation models × linear probe and fine-tune, plus classic CNNs and non-neural decoders, on 7 classification + 2 regression tasks."],
  ["Control", "They introduce a deliberately simple model — ST-EEGFormer — MAE on raw EEG, to test if complex tokenizers are necessary."],
];
mot.forEach((c, i) => {
  const y = 3.0 + i * 1.25;
  panel(s, 0.7, y, 12.05, 1.12, WHITE);
  s.addText(c[0].toUpperCase(), {
    x: 0.95, y: y + 0.18, w: 2.2, h: 0.75, fontFace: BFONT, fontSize: 13,
    bold: true, color: ACCENT, margin: 0,
  });
  s.addText(c[1], {
    x: 3.3, y: y + 0.18, w: 9.15, h: 0.8, fontFace: BFONT, fontSize: 15, color: INK, margin: 0,
  });
});
s.addNotes(notes(
  "The paper is not only an architecture paper. The title is a question: are EEG foundation models worth it, compared with traditional BCI decoders?\n\n" +
  "Foundation models for EEG claim that self-supervised pretraining on large unlabeled recordings gives generalizable representations, so you do not have to train from scratch for every task — motor imagery, P300, SSVEP, and so on. The authors argue that published advantages are often shown under limited conditions: one or two protocols only, for example only population decoding or only leave-one-subject-out zero-shot, rarely with statistical tests, and almost never against classical non-neural decoders such as CSP, filter-bank CSP, Riemannian geometry classifiers, FBCCA or TRCA. Those classical methods remain very competitive when you have little data per subject, which is the usual BCI setting.\n\n" +
  "So they build a grid. Five foundation models: BIOT, BENDR, CBraMod, EEGPT, LaBraM, plus their own ST-EEGFormer. Each foundation model is run in linear probing and in full fine-tuning. They also run classic CNNs: EEGNet, DeepConvNet, Conformer, CTNet. Plus non-neural baselines. Downstream: seven classification tasks of very different difficulty, from almost-binary error-related negativity up to 40-target SSVEP, four-class motor imagery, inner speech, Alzheimer’s diagnosis, and two regression tasks, DTU auditory attention and SEED-VIG vigilance.\n\n" +
  "The control model is deliberately simple: ST-EEGFormer. The paper says that some recent work, including LaBraM-style models, has argued that MAE on raw EEG is ineffective and that you need a discrete neural tokenizer. If a ViT with only MAE on raw patches is competitive after fine-tuning, then those complex pretraining objectives are not strictly necessary. That is the logic of the paper.",
  "Foundation model = gros modèle pré-entraîné sur beaucoup de données, puis réutilisé. Comme GPT pour le texte, mais ici pour l’EEG.\n\n" +
  "Self-supervised = on n’a pas besoin des labels (gauche/droite, etc.) pendant le pré-entraînement. On invente une tâche (cacher des morceaux, reconstruire).\n\n" +
  "BCI = brain–computer interface. Décoder l’intention / l’attention depuis l’EEG.\n\n" +
  "Décodateurs classiques (à citer, pas à expliquer en détail) :\n" +
  "• CSP / FBCSP = filtres spatiaux pour l’imagerie motrice\n" +
  "• Riemannian = géométrie des matrices de covariance EEG\n" +
  "• FBCCA / TRCA = méthodes SSVEP (fréquences de flicker)\n\n" +
  "Linear probing = on gèle le gros réseau, on entraîne seulement une petite couche linéaire. Fine-tuning = on ré-entraîne (presque) tout.\n\n" +
  "ST-EEGFormer n’est pas « le modèle magique ». C’est le contrôle SIMPLE du papier, pour tester si un tokenizer discret est vraiment nécessaire.\n\n" +
  "Si Ishii te reprend sur « LaBraM dit que MAE est inefficace » : attribue ça au papier Yang (« the authors write that… »), ne parle pas à la place de LaBraM."
));
footer(s, 2);

// =====================================================================
// 3 WHAT IS ST-EEGFORMER
// =====================================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "ST-EEGFormer = ViT + MAE on raw EEG", "Model");
const cards = [
  ["Name", "Spatiotemporal EEGFormer\nViT tokens = time patch × channel"],
  ["Pretraining", "Masked Autoencoder only\nreconstruct raw patches (MSE)"],
  ["Scale", "> 8 million EEG segments\nsmall / base / large (~303 M)"],
  ["Claim vs LaBraM", "Raw MAE is enough\nno discrete VQ tokenizer"],
];
cards.forEach((c, i) => {
  const x = 0.7 + (i % 2) * 6.15;
  const y = 1.25 + Math.floor(i / 2) * 2.7;
  panel(s, x, y, 5.9, 2.5, WHITE);
  s.addText(c[0].toUpperCase(), {
    x: x + 0.3, y: y + 0.25, w: 5.3, h: 0.35, fontFace: BFONT, fontSize: 12,
    bold: true, color: ACCENT, charSpacing: 1, margin: 0,
  });
  s.addText(c[1], {
    x: x + 0.3, y: y + 0.75, w: 5.3, h: 1.45, fontFace: BFONT, fontSize: 18, color: INK, margin: 0,
  });
});
s.addNotes(notes(
  "ST-EEGFormer means spatiotemporal EEG Transformer. Spatiotemporal because each token is a short temporal patch of one EEG channel. Space is the electrode; time is the patch along the signal.\n\n" +
  "Pretraining is only masked autoencoding. There is no vector-quantized codebook, no next-token language-model loss, no spectral tokenizer. You hide most patches and reconstruct the raw waveform with mean squared error. The authors chose this on purpose: they wanted a transparent control, not a new fancy objective.\n\n" +
  "They pretrain on more than eight million EEG segments. Three sizes: small, base, and large. Large has more than 300 million parameters. That is the checkpoint we use in the lab. Downstream data in the paper is minimally preprocessed: 0.1 to 128 hertz bandpass and resampling to 256 hertz.\n\n" +
  "The scientific claim against LaBraM is important for today, because Ishii-sensei presents LaBraM next. The paper says a simple MAE on raw patches already reaches the best average rank among the models they compared, after fine-tuning. So, in their benchmark, a discrete tokenizer is not required for strong downstream decoding.",
  "Token = un petit morceau du signal, transformé en vecteur. Ici : 16 échantillons d’UNE électrode.\n\n" +
  "MAE = Masked Autoencoder. On cache 75% des tokens, le modèle doit reconstruire le signal brut. Comme cacher des pixels d’une image et les redessiner.\n\n" +
  "MSE = erreur quadratique moyenne : (prédiction − vrai signal)². On prédit des VOLTAGES, pas des mots d’un dictionnaire.\n\n" +
  "VQ / codebook / tokenizer discret = on remplace le signal par un numéro dans un dictionnaire (comme LaBraM, comme CalM). ST-EEGFormer ne fait PAS ça.\n\n" +
  "ViT = Vision Transformer. Recette d’images (patches) appliquée à l’EEG.\n\n" +
  "Large ≈ >300 M paramètres (README). Small / base existent aussi. On utilise large au labo.\n\n" +
  "Ne pas confondre pré-entraînement papier (8 M segments, ~128 Hz) et notre finetune labo (43 sujets, 256 Hz)."
));
footer(s, 3);

// =====================================================================
// 4 ARCHITECTURE FIGURE
// =====================================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Architecture from the paper (MAE + downstream)", "Figure");
s.addImage({
  path: path.join(ASSETS, "graphic_overview.png"),
  x: 0.55, y: 1.15, w: 12.25, h: 5.7,
});
s.addNotes(notes(
  "This is the paper figure. Panel a is the six evaluation protocols — I will come back to that. Panel b is the model.\n\n" +
  "Start from raw multi-channel EEG. Segment into a grid of spatiotemporal patches: each small rectangle is a few time samples of one channel. A linear layer projects each patch to a token. Then two positional encodings: temporal positional encoding, sinusoidal in time, and spatial positional encoding, a learned embedding for the electrode. A class token is prepended, as in Vision Transformers.\n\n" +
  "For pretraining, most tokens are masked, 75 percent. The encoder sees only the visible tokens. Mask tokens are put back, a Transformer decoder plus a linear layer reconstructs the EEG patches in sample space.\n\n" +
  "For downstream tasks, there is no masking. The full sequence goes through the encoder. The class token, sometimes with averaging of patch tokens, goes to a linear head. Classification examples: motor imagery, SSVEP, error-related negativity. Regression: auditory attention and vigilance.\n\n" +
  "Two paths, one encoder. Pretrain reconstructs. Finetune classifies or regresses. The decoder is thrown away at finetune time.",
  "Montre la figure en parlant. Panel a = les 6 protocoles (slide 9). Panel b = le modèle.\n\n" +
  "Chemin 1 (haut, pré-entraînement) : EEG → patches → on cache 75% → encoder → decoder → reconstruire le signal.\n\n" +
  "Chemin 2 (bas, finetune) : EEG → patches → encoder COMPLET (rien de caché) → CLS / moyenne → tête linéaire → classe ou régression.\n\n" +
  "CLS token = un vecteur spécial collé au début, qui « résume » la séquence. Recette ViT.\n\n" +
  "TPE = où on est dans le TEMPS (sinus/cosinus, comme Transformer original).\n" +
  "SPE = QUELLE électrode (vecteur appris par index de canal).\n\n" +
  "Encoder = le gros ViT qu’on garde. Decoder = seulement pour le MAE, jeté ensuite.\n\n" +
  "Si on te demande de pointer : « patches on the left, encoder in the middle, reconstruction on top, classification head at the bottom. »"
));
footer(s, 4);

// =====================================================================
// 5 INPUT + SPECS
// =====================================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Input: continuous patches, not a codebook", "Input");
const specs = [
  ["Patch", "16 samples, non-overlapping Unfold"],
  ["Project", "nn.Linear(16 → embed_dim)"],
  ["TPE", "Sinusoidal temporal encoding"],
  ["SPE", "Learned channel embedding (145 slots)"],
  ["Rate", "Designed for 128 Hz, ~6 s segments"],
  ["Channels", "Up to 142 pretrained electrodes"],
];
specs.forEach((c, i) => {
  const x = 0.7 + (i % 3) * 4.1;
  const y = 1.25 + Math.floor(i / 3) * 1.85;
  panel(s, x, y, 3.9, 1.7, WHITE);
  s.addText(c[0].toUpperCase(), {
    x: x + 0.2, y: y + 0.2, w: 3.5, h: 0.35, fontFace: BFONT, fontSize: 12,
    bold: true, color: ACCENT, margin: 0,
  });
  s.addText(c[1], {
    x: x + 0.2, y: y + 0.65, w: 3.5, h: 0.8, fontFace: BFONT, fontSize: 16, color: INK, margin: 0,
  });
});
s.addText("Code: PatchEmbedEEG. No VQ, no codebook. Same idea as CAPT on calcium: keep the raw time series.", {
  x: 0.7, y: 5.15, w: 12.05, h: 0.45, fontFace: BFONT, fontSize: 14, italic: true, color: MUTED, margin: 0,
});
panel(s, 0.7, 5.65, 12.05, 1.1, GOLD);
s.addText("Large: patch 16 · dim 1024 · depth 24 · 16 heads · MLP 4 · ~303 M parameters", {
  x: 0.95, y: 5.9, w: 11.55, h: 0.65, fontFace: BFONT, fontSize: 16, color: INK, margin: 0,
});
s.addNotes(notes(
  "This slide is from the code, which implements the paper. The class is PatchEmbedEEG. It unfolds each channel with kernel size 16 and stride 16, so patches do not overlap. Then a linear layer maps those 16 samples to the embedding dimension. There is no vector-quantized codebook, no nearest-neighbor lookup in a vocabulary. Each token is a continuous vector.\n\n" +
  "Then two positional encodings, called TPE and SPE in the paper figure. Temporal positional encoding is sinusoidal, like the original Transformer. Spatial positional encoding is a learned embedding over channel indices, 145 slots in the code, covering the pretrained electrode set. The official README says the model is designed for 128 hertz, pretrained to reconstruct about 6-second segments, up to 142 EEG channels.\n\n" +
  "Large, which we use: embedding 1024, depth 24, 16 heads, MLP ratio 4, more than 300 million parameters. Small and base also exist.\n\n" +
  "For yesterday’s calcium session: this is continuous patch embedding, like CAPT, not discrete like CalM. CalM’s neural quantizer is a codebook. ST-EEGFormer never discretizes.",
  "Unfold + Linear = découper le signal en fenêtres de 16 samples, puis une couche linéaire 16 → 1024 (large). PAS un dictionnaire.\n\n" +
  "128 Hz / ~6 s = spec du PRÉ-ENTRAÎNEMENT papier. Notre labo = 256 Hz, 8 s. Ce n’est pas une contradiction : on adapte / resample en finetune. Si on te demande : « the pretrained model was designed for 128 Hz; we fine-tune it on our 256 Hz recordings. »\n\n" +
  "142 canaux (README) vs 145 slots (nn.Embedding dans le code). Dis : « the embedding table has 145 slots; the README says up to 142 electrodes. » Ne pas inventer pourquoi 145.\n\n" +
  "CAPT (hier) = signal continu, comme ST-EEGFormer. CalM = VQ discret, comme LaBraM. C’est LE mapping à retenir. Tu t’étais trompé le 6 août (« tokenization ») ; Ishii t’a envoyé vers CalM. Ne plus dire que ST-EEGFormer tokenize.\n\n" +
  "Ne raconte le bug senloc QUE si on te demande pourquoi les indices de canaux comptent."
));
footer(s, 5);

// =====================================================================
// 6 ATTENTION
// =====================================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Attention mixes channels and time in one sequence", "Attention");
panel(s, 0.7, 1.25, 7.5, 5.45, WHITE);
s.addText(
  [
    { text: "Tokens = every (time-patch, channel) pair, flattened into one sequence.", options: { bullet: true, breakLine: true } },
    { text: "Standard ViT self-attention is full: electrode C1 at time t can attend to C2 at time t′.", options: { bullet: true, breakLine: true } },
    { text: "So inter-channel mixing is yes — but not a separate neural-axis block.", options: { bullet: true, breakLine: true } },
    { text: "Channel identity comes from the spatial embedding, not from dual-axis attention.", options: { bullet: true, breakLine: true } },
    { text: "Attention is bidirectional (MAE / ViT), not causal next-step prediction.", options: { bullet: true } },
  ],
  { x: 0.95, y: 1.5, w: 7.0, h: 5.0, fontFace: BFONT, fontSize: 16, color: INK, margin: 0 }
);
panel(s, 8.4, 1.25, 4.35, 2.55, LIGHT);
s.addText("CalM / POCO (yesterday)", {
  x: 8.6, y: 1.4, w: 4.0, h: 0.4, fontFace: BFONT, fontSize: 12, bold: true, color: ACCENT, margin: 0,
});
s.addText("Often dual-axis or population forecasting: neural axis + temporal axis, sometimes causal next-neuron prediction.", {
  x: 8.6, y: 1.9, w: 4.0, h: 1.65, fontFace: BFONT, fontSize: 14, color: INK, margin: 0,
});
panel(s, 8.4, 4.0, 4.35, 2.7, GOLD);
s.addText("ST-EEGFormer", {
  x: 8.6, y: 4.15, w: 4.0, h: 0.4, fontFace: BFONT, fontSize: 12, bold: true, color: ACCENT, margin: 0,
});
s.addText("Single-axis ViT. One attention pool over all channel–time tokens. Reconstruct, do not forecast the next neuron.", {
  x: 8.6, y: 4.65, w: 4.0, h: 1.8, fontFace: BFONT, fontSize: 14, color: INK, margin: 0,
});
s.addNotes(notes(
  "This is the question Ishii-sensei asked: what does the attention do? Between channels? In time?\n\n" +
  "After patching, the model concatenates all channel-time patches into one sequence. Self-attention is the standard Vision Transformer attention, so it is full. A token from channel C1 at time t can attend to channel C2 at another time. So yes, there is inter-channel attention, and there is temporal attention, in the same softmax.\n\n" +
  "It is not CalM’s Dual-Axis Transformer. CalM splits a neural axis, bidirectional across neurons, and a temporal axis, causal in time, and it predicts the next token. ST-EEGFormer has one attention pool. Channel identity is only the learned spatial embedding added to the token. There is no separate neural-axis block.\n\n" +
  "And it is bidirectional, because MAE reconstruction looks at context on both sides of a masked patch. It does not predict the next neuron’s future activity. If we later import next-neuron prediction from calcium models, that would be a new objective. It is not in this paper.\n\n" +
  "The paper also visualizes attention after fine-tuning. Maps change a lot. That is their evidence that fine-tuning overwrites much of the pretraining specialization, which is why a simple MAE backbone can catch up with more complex tokenizers after adaptation.",
  "Question d’Ishii : l’attention mélange-t-elle les CANAUX et le TEMPS ? Réponse : OUI les deux, dans UN seul softmax.\n\n" +
  "Self-attention = chaque token calcule des poids vers tous les autres. « Full » = pas de masque causal : on voit le passé ET le futur (normal pour du MAE).\n\n" +
  "Exemple : C3 à t=1s peut regarder Oz à t=3s. Mélange spatial + temporel.\n\n" +
  "PAS dual-axis (CalM) : CalM a deux attentions séparées (neurones / temps). Ici une seule liste plate (canal × temps).\n\n" +
  "Bidirectionnel ≠ prédiction du futur. MAE = reconstruire un trou au milieu, donc on a besoin des deux côtés.\n\n" +
  "Si on te demande « causal ? » : Non. Si « next-neuron prediction ? » : Non, ce n’est pas dans ce papier."
));
footer(s, 6);

// =====================================================================
// 7 MAE
// =====================================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Self-supervised objective: MAE, mask 75%", "SSL");
const mae = [
  ["Mask", "75% of tokens dropped at random (standard MAE)"],
  ["Encoder", "Sees only kept patches + CLS · 24 ViT blocks (large)"],
  ["Decoder", "Lighter Transformer; mask tokens inserted back"],
  ["Loss", "MSE on raw patch values, only on masked patches"],
];
mae.forEach((c, i) => {
  const x = 0.7 + (i % 2) * 6.15;
  const y = 1.25 + Math.floor(i / 2) * 2.7;
  panel(s, x, y, 5.9, 2.5, WHITE);
  s.addText(c[0].toUpperCase(), {
    x: x + 0.3, y: y + 0.25, w: 5.3, h: 0.35, fontFace: BFONT, fontSize: 12,
    bold: true, color: ACCENT, margin: 0,
  });
  s.addText(c[1], {
    x: x + 0.3, y: y + 0.8, w: 5.3, h: 1.35, fontFace: BFONT, fontSize: 18, color: INK, margin: 0,
  });
});
s.addNotes(notes(
  "The self-supervised task is Masked Autoencoder, the same recipe as MAE in computer vision, applied to EEG patches.\n\n" +
  "Default mask ratio is 75 percent. Random tokens are removed. The encoder, 24 blocks for the large model, sees only the remaining patches plus the class token. After encoding, mask tokens are inserted back in the original positions. A lighter decoder Transformer processes the full sequence. A linear layer maps each token to patch_size sample values — sixteen numbers, the raw waveform of that patch.\n\n" +
  "The loss is mean squared error between prediction and the true samples, averaged only over the masked patches. Not cross-entropy on discrete token indices. That is the difference with LaBraM and with CalM: those models predict codebook indices. ST-EEGFormer predicts voltages, essentially.\n\n" +
  "The paper’s point: this simple reconstruction is enough for a strong fine-tuned decoder. You do not need a more exotic pretraining task to get the best average rank in their table. That is their answer to the claim that MAE on raw EEG is ineffective.",
  "Recette MAE (He et al., vision) : cacher beaucoup, encoder seulement ce qui reste, decoder reconstruit les trous.\n\n" +
  "75% = défaut du code (mask_ratio=0.75). Encoder large = 24 blocs. Decoder = plus léger (8 blocs, dim 512 dans le code).\n\n" +
  "Loss seulement sur les patches CACHÉS, pas sur ceux que l’encoder a vus. Sinon c’est trop facile.\n\n" +
  "LaBraM / CalM : prédisent un INDEX de codebook (classification). ST-EEGFormer : prédit 16 nombres (régression du signal).\n\n" +
  "« Voltages, essentially » = le signal EEG brut. Tu n’as pas besoin de l’unité exacte (µV).\n\n" +
  "Si on te dit « MAE on raw EEG doesn’t work » : « that is the claim this paper tests; after fine-tuning, ST-EEGFormer-large gets the best average rank in their table. »"
));
footer(s, 7);

// =====================================================================
// 8 DOWNSTREAM HEAD
// =====================================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Downstream: drop the MAE decoder, add a linear head", "Finetune");
panel(s, 0.7, 1.25, 5.9, 5.45, WHITE);
s.addText("What is kept", {
  x: 0.95, y: 1.45, w: 5.4, h: 0.4, fontFace: HFONT, fontSize: 18, bold: true, color: INK, margin: 0,
});
s.addText(
  "The Transformer encoder with TPE and SPE.\n\nNo masking at finetune time.\n\nReadout: class token and/or average pooling of patch tokens, then a linear classification or regression head.",
  { x: 0.95, y: 2.05, w: 5.4, h: 4.3, fontFace: BFONT, fontSize: 16, color: INK, margin: 0 }
);
panel(s, 6.85, 1.25, 5.9, 5.45, WHITE);
s.addText("Paper finding on heads", {
  x: 7.1, y: 1.45, w: 5.4, h: 0.4, fontFace: HFONT, fontSize: 18, bold: true, color: INK, margin: 0,
});
s.addText(
  "Linear probing is weak almost everywhere. Fine-tuning is required.\n\nSome other FMs hide extra capacity in “linear” heads (multi-layer). Token fusion (CLS vs average) also changes results.\n\nFair comparison must freeze the same head style.",
  { x: 7.1, y: 2.05, w: 5.4, h: 4.3, fontFace: BFONT, fontSize: 16, color: INK, margin: 0 }
);
s.addNotes(notes(
  "At finetune time the MAE decoder is discarded. Only the encoder is kept. There is no masking. The sequence of all patches goes through the encoder. The paper uses the class token, with averaging, then a linear head for classification or regression.\n\n" +
  "A main empirical result: linear probing, meaning freeze the backbone and train only a linear head, is weak on almost every protocol. Fine-tuning the backbone is necessary to get the advertised foundation-model gains. The only exception they highlight is error-related negativity, a relatively easy detection task, where linear probes already work well, near ceiling.\n\n" +
  "They also warn about hidden confounders. Some models, EEGPT and CBraMod, use multi-layer heads even when they say linear probing, so the head is not really linear — extra capacity is hidden in the “linear” setup. How you fuse tokens — class token versus average pooling — also changes the receptive field. So when you compare backbones, you must standardize the head. That is one of the paper’s fairness contributions.\n\n" +
  "In our lab finetune we use SoftTarget cross-entropy, layer decay 1.0 so the whole backbone adapts, and no mixup. That is our setting, not a number from the paper.",
  "Finetune = on jette le decoder MAE. On garde l’encoder. On ajoute une petite tête (classe gauche/droite, etc.).\n\n" +
  "Linear probing (LP) = backbone GELÉ. Fine-tuning (FT) = backbone qui bouge. Message du papier : LP est faible → les features pré-entraînées ne sont pas « prêtes à l’emploi ».\n\n" +
  "Exception ERN : tâche facile de détection d’erreur, LP déjà au plafond. Ne pas généraliser.\n\n" +
  "Piège « linear » : EEGPT / CBraMod mettent parfois plusieurs couches dans la tête « linéaire ». Ce n’est plus linéaire. D’où leur point sur la fairness.\n\n" +
  "Notre labo (pas le papier) : SoftTarget CE, layer_decay=1.0 (toutes les couches même LR), mixup=0. Cité seulement comme contexte, pas comme résultat Yang."
));
footer(s, 8);

// =====================================================================
// 9 SIX PROTOCOLS
// =====================================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Six protocols: what “generalization” actually means", "Evaluation");
const proto = [
  ["1 Population", "One model on all subjects, test on the pool. Data-rich."],
  ["2 Per-subject self", "Train and test on the same person. Classic BCI."],
  ["3 Per-subject transfer", "Train on A, test on B. Cross-subject of a personal model."],
  ["4 LOO zero-shot", "Train on all but one; test the held-out subject with no adaptation."],
  ["5 LOO fine-tune", "Then adapt on a little data from the held-out subject."],
  ["6 LOO drop", "How much population knowledge is lost after that adaptation."],
];
proto.forEach((c, i) => {
  const x = 0.7 + (i % 2) * 6.15;
  const y = 1.22 + Math.floor(i / 2) * 1.8;
  panel(s, x, y, 5.9, 1.65, WHITE);
  s.addText(c[0], {
    x: x + 0.25, y: y + 0.2, w: 5.4, h: 0.4, fontFace: HFONT, fontSize: 16, bold: true, color: ACCENT, margin: 0,
  });
  s.addText(c[1], {
    x: x + 0.25, y: y + 0.7, w: 5.4, h: 0.7, fontFace: BFONT, fontSize: 14, color: INK, margin: 0,
  });
});
s.addNotes(notes(
  "The paper’s main methodological contribution is this six-dimensional protocol, not only the model. They argue that published EEG foundation-model papers often report one or two protocols only, which inflates the story.\n\n" +
  "Population: train one model on pooled data from all subjects, test on that pool. This is data-rich, and this is where foundation models look best.\n\n" +
  "Per-subject self: train and test on the same person. Little data. Classic clinical BCI. Here compact CNNs and even non-neural methods often match foundation models — no significant difference in the paper’s tests.\n\n" +
  "Per-subject transfer: a model trained on subject A is tested on subject B.\n\n" +
  "Then three leave-one-subject-out variants. Zero-shot: train on everyone except one, test that person with no extra training. Fine-tune: allow a little adaptation on the held-out person. Drop: after that adaptation, how much did you forget the original population performance — catastrophic forgetting. Classic CNNs suffer the most on LOO drop.\n\n" +
  "They use Wilcoxon signed-rank, permutation, and Mann–Whitney U tests with Bonferroni correction. Metrics: accuracy, AUC, kappa for classification; MSE and Pearson R for regression.\n\n" +
  "I am describing the paper’s protocols. I am not reporting our lab leave-one-subject-out run today.",
  "C’est le cœur MÉTHODO du papier. « Generalization » n’est pas un mot unique : 6 mesures.\n\n" +
  "1 Population = tout le monde mélangé. Beaucoup de data. FM gagnent ici. C’est AUSSI notre proto labo (61.7%).\n\n" +
  "2 Per-subject self = un modèle par personne. Peu de data. CNNs / CSP tiennent le coup.\n\n" +
  "3 Transfer A→B = un modèle perso testé sur quelqu’un d’autre. Souvent mauvais.\n\n" +
  "4 LOO zero-shot = entraîner sur 42, tester le 43e SANS adapter.\n" +
  "5 LOO fine-tune = puis adapter un peu sur le 43e.\n" +
  "6 LOO drop = après cette adaptation, est-ce qu’on a oublié les 42 autres ? (catastrophic forgetting)\n\n" +
  "CES LOO sont ceux du PAPIER Yang. PAS notre job Slurm. Phrase de sécurité : « these are the paper’s protocols, not our lab LOSO. »\n\n" +
  "Stats : tests non-paramétriques + Bonferroni (correction pour comparaisons multiples). Tu n’as pas besoin de dériver les tests. Dire « they report statistical tests with Bonferroni correction » suffit."
));
footer(s, 9);

// =====================================================================
// 10 TASK MATRIX (paper)
// =====================================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Downstream matrix: 7 classification + 2 regression", "Paper tasks");
const tasks = [
  ["Error-ERN", "Nearly binary detection. Easy. Linear probes already ~ceiling."],
  ["Alzheimer’s", "3-class diagnosis. Clinical, not a classic BCI paradigm."],
  ["Inner speech", "4-class. Hard. Little gain from model size."],
  ["BCI-IV-2a", "4-class motor imagery. Standard public MI benchmark."],
  ["Upper limb", "7-class execution / imagery."],
  ["SSVEP", "40 targets. High-speed spelling; classic non-neural (FBCCA) is strong."],
  ["DTU (reg.)", "Auditory attention, 1 s. Transfer from classification is fragile (R ≈ 0.05)."],
  ["SEED-VIG", "Vigilance regression, 5 s. Classic CNNs lead (R > 0.45)."],
];
tasks.forEach((c, i) => {
  const x = 0.7 + (i % 4) * 3.05;
  const y = 1.22 + Math.floor(i / 4) * 2.7;
  panel(s, x, y, 2.9, 2.5, WHITE);
  s.addText(c[0], {
    x: x + 0.15, y: y + 0.2, w: 2.6, h: 0.55, fontFace: HFONT, fontSize: 16, bold: true, color: ACCENT, margin: 0,
  });
  s.addText(c[1], {
    x: x + 0.15, y: y + 0.85, w: 2.6, h: 1.4, fontFace: BFONT, fontSize: 13, color: INK, margin: 0,
  });
});
s.addNotes(notes(
  "This is the paper’s downstream matrix. Seven classification tasks of very different difficulty, plus two regression tasks. Most of these were not in the pretraining data, so it is a transfer test, not memorization of the same paradigm.\n\n" +
  "Error-related negativity is almost binary detection. Linear probes already hit a ceiling near 99.9 percent. That is the one case where frozen pretrained features look useful.\n\n" +
  "Then clinical and BCI tasks: three-class Alzheimer’s diagnosis, four-class inner speech, four-class motor imagery on BCI Competition IV 2a, seven-class upper-limb execution or imagery, and forty-target SSVEP. Inner speech stays hard no matter the model size. On SSVEP, classical non-neural methods such as FBCCA remain very competitive.\n\n" +
  "Regression is a separate story. The paper reports that classification-to-regression transfer is fragile. On DTU auditory attention with one-second windows, Pearson R is about 0.05 even for the best models. On SEED-VIG vigilance, five-second windows, classic CNNs lead with R above 0.45, and differences with foundation models are not significant.\n\n" +
  "So the paper’s ranking is not one number on one dataset. It is this heterogeneous mix. Easy tasks saturate. Hard tasks do not move. Regression does not inherit classification pretraining for free.",
  "Ne pas réciter les 9 tâches. 3 phrases : facile (ERN), difficile (inner speech), régression fragile (DTU).\n\n" +
  "ERN = potentiel d’erreur (le cerveau « oops »). Quasi binaire, très facile → 99.9% n’est PAS impressionnant.\n\n" +
  "BCI-IV-2a = le benchmark public d’imagerie motrice (4 classes). On l’a aussi dans le repo, mais CE n’est pas le talk d’aujourd’hui.\n\n" +
  "SSVEP = flicker à des fréquences ; 40 cibles. FBCCA est une méthode classique très forte ici.\n\n" +
  "Pearson R = corrélation prédiction / vérité. 0.05 ≈ presque rien. 0.45 = déjà utile.\n\n" +
  "Si on te pousse sur « LaBraM collapse on DTU » : reste vague. « several fine-tuned foundation models degrade on DTU, according to the paper. » Ne pas humilier LaBraM."
));
footer(s, 10);

// =====================================================================
// 11 RESULTS FIGURE
// =====================================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Result: ST-EEGFormer-large fine-tuned ranks first (5.61)", "Paper results");
s.addImage({
  path: path.join(ASSETS, "rank_figure3.png"),
  x: 0.7, y: 1.12, w: 8.3, h: 5.7,
});
panel(s, 9.15, 1.12, 3.5, 5.7, WHITE);
s.addText("Read the figure", {
  x: 9.35, y: 1.3, w: 3.15, h: 0.4, fontFace: HFONT, fontSize: 14, bold: true, color: ACCENT, margin: 0,
});
s.addText(
  "Lower average rank = better.\n\nGreen = classic CNNs.\nPurple (l) = linear probe.\nRed (f) = fine-tune.\n-s / -b / -l = small / base / large.\n\nCTNet: 6.42.\nST-EEGFormer-l (f): 5.61 — best.\nLaBraM (f): 8.99.\n\nHeatmap: strongest on Population.",
  { x: 9.35, y: 1.8, w: 3.15, h: 4.7, fontFace: BFONT, fontSize: 12, color: INK, margin: 0 }
);
s.addNotes(notes(
  "This is Figure 3 from the paper, the ranking plot. Lower average rank is better. Ranks are aggregated across datasets, metrics, subjects, and the six protocols.\n\n" +
  "Important naming: minus s, b, l after the model name means small, base, large. The letter in parentheses is the protocol: l means linear probe, f means fine-tune. So ST-EEGFormer-l in parentheses f is the large model, fully fine-tuned.\n\n" +
  "Green bars are classic CNNs trained from scratch: DeepConvNet, EEGNet, Conformer, and CTNet. CTNet is the strongest classic decoder, average rank 6.42. A compact CNN without any foundation-model pretraining is already very good.\n\n" +
  "Purple bars are linear probes. They are clearly worse. ST-EEGFormer-large linear probe is 11.50. LaBraM linear probe is 13.36. Frozen pretrained features do not transfer well to these BCI tasks.\n\n" +
  "Red bars are full fine-tuning. ST-EEGFormer-large fine-tuned reaches 5.61, the best average rank in the comparison. Fine-tuned small and base are 7.25 and 6.55, around CTNet. LaBraM fine-tuned is 8.99 in this table.\n\n" +
  "The heatmap is protocol by protocol. Dark red is rank 1. Fine-tuned ST-EEGFormer is especially strong on population. Linear probes are blue, poor rank. Fine-tuning is what turns the foundation model into a competitive decoder.\n\n" +
  "Take-home: after fine-tuning, this simple MAE model is at least as good as more complex foundation models, including LaBraM, on Yang et al.’s benchmark. That is the paper’s evidence that raw MAE is enough — in this ranking, not as a universal claim.",
  "PIÈGE N°1 : -l = LARGE. (l) = LINEAR PROBE. (f) = FINE-TUNE.\n" +
  "ST-EEGFormer-l (f) = large + finetune = 5.61 = le gagnant.\n" +
  "ST-EEGFormer-l (l) = large + probe = 11.50 = mauvais.\n\n" +
  "Rank MOYEN plus petit = mieux (1 = premier). Ce n’est PAS une accuracy.\n\n" +
  "Chiffres à retenir (figure) :\n" +
  "• ST-EEGFormer-l (f) = 5.61 meilleur\n" +
  "• CTNet = 6.42 meilleur CNN classique\n" +
  "• ST-EEGFormer-b (f) = 6.55, -s (f) = 7.25\n" +
  "• LaBraM (f) = 8.99\n" +
  "• ST-EEGFormer-l (l) = 11.50 ; LaBraM (l) = 13.36\n\n" +
  "Ton pour Ishii : « in this table », pas « LaBraM is worse in general ».\n\n" +
  "Heatmap : rouge foncé = bon rang. Population = là où les FM aident le plus."
));
footer(s, 11);

// =====================================================================
// 12 FOUR FINDINGS
// =====================================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Four findings (the paper’s answer to “worth it?”)", "Results");
const findings = [
  ["1", "Fine-tune, do not probe", "Linear probing is weak. FT consistently beats LP except EEGPT. Pretrained features are not plug-and-play."],
  ["2", "Helpful when data is rich", "FT foundation models win in population settings. In per-subject / data-scarce, CNNs and even CSP-style methods are not significantly worse."],
  ["3", "No clear scaling law", "Accuracy vs size fits poorly. Training time grows fast with size. Small BCI sets (<50 subjects) are the bottleneck."],
  ["4", "Simple MAE is enough", "ST-EEGFormer-l FT gets best average rank 5.61. Complex tokenizers / pretraining tasks do not clearly win after fine-tuning."],
];
findings.forEach((c, i) => {
  const y = 1.2 + i * 1.38;
  panel(s, 0.7, y, 12.05, 1.26, WHITE);
  s.addText(c[0], {
    x: 0.95, y: y + 0.35, w: 0.55, h: 0.55, fontFace: HFONT, fontSize: 22, bold: true, color: ACCENT, margin: 0,
  });
  s.addText(c[1], {
    x: 1.65, y: y + 0.18, w: 3.4, h: 0.9, fontFace: HFONT, fontSize: 15, bold: true, color: INK, margin: 0,
  });
  s.addText(c[2], {
    x: 5.2, y: y + 0.18, w: 7.25, h: 0.95, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0,
  });
});
s.addNotes(notes(
  "Four messages from the paper — this is their answer to the title question.\n\n" +
  "One: linear probing is weak. Fine-tuning consistently beats linear probing except for EEGPT, which already uses a stronger head. So “foundation model” does not mean you can freeze the backbone and get a good BCI decoder. Frozen features are not plug-and-play, except on easy detection such as ERN.\n\n" +
  "Two: they are worth it mainly in data-rich population settings. In data-scarce per-subject settings, compact CNNs such as CTNet, and classical non-neural decoders such as CSP, Riemannian geometry, FBCCA, TRCA, are statistically competitive. That matters for us: our lab task has 43 subjects, which is in the small-data regime the paper warns about.\n\n" +
  "Three: no clear scaling law among neural decoders. Bigger is not reliably better on these BCI sets. The fit of accuracy versus size is very weak, while training time grows fast with size. The bottleneck is dataset size, not model size. There is no EEG ImageNet yet.\n\n" +
  "Four: a simple MAE on raw EEG is enough to get the best average rank, 5.61 for the large model after fine-tuning. After fine-tuning, differences from more complex pretraining, including tokenization, largely disappear. Attention maps also change a lot, which they read as fine-tuning overwriting pretraining specialization.",
  "Les 4 phrases à retenir si tu perds le fil :\n" +
  "1. Il faut finetuner, pas seulement prober.\n" +
  "2. Les FM aident surtout quand il y a BEAUCOUP de data (population).\n" +
  "3. Plus gros ≠ mieux ici (petits datasets BCI).\n" +
  "4. MAE brut suffit ; le tokenizer n’est pas obligatoire DANS CE BENCHMARK.\n\n" +
  "Exception EEGPT en LP : tête plus grosse, donc LP « gonflé ». C’est le point fairness du papier.\n\n" +
  "43 sujets labo = <50, le régime « small » du papier. Notre 61.7% ≈ LaBraM 62% colle au finding 4 (après FT, les FM se ressemblent).\n\n" +
  "Ne cite pas un R² inventé. Dis « poor fit ». Le papier dit aussi que le temps d’entraînement monte vite avec la taille.\n\n" +
  "« EEG ImageNet » = un énorme dataset unifié qui n’existe pas encore. Limitation honnête des auteurs."
));
footer(s, 12);

// =====================================================================
// 13 VS LABRAM
// =====================================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "ST-EEGFormer vs LaBraM (today’s pair)", "Comparison");
const hdr = [
  { text: "", options: { fill: { color: ACCENT }, color: WHITE, bold: true } },
  { text: "ST-EEGFormer", options: { fill: { color: ACCENT }, color: WHITE, bold: true } },
  { text: "LaBraM", options: { fill: { color: ACCENT }, color: WHITE, bold: true } },
];
const rows = [
  ["Tokens", "Continuous patches\nUnfold + Linear", "Discrete VQ neural tokenizer"],
  ["SSL", "MAE, MSE on raw samples\nmask 75%", "Masked token prediction\n(spectrum / codebook)"],
  ["Attention", "Single-axis ViT\nchannel × time sequence", "Transformer on discrete tokens"],
  ["Paper rank (FT)", "Best average rank 5.61\n(large, fine-tuned)", "8.99 in this ranking table\n(fine-tuned)"],
].map((r) =>
  r.map((cell, ci) => ({
    text: cell,
    options: {
      fill: { color: ci === 0 ? LIGHT : WHITE },
      color: ci === 0 ? ACCENT : INK,
      bold: ci === 0, align: "left", valign: "middle", fontSize: 13,
    },
  }))
);
s.addTable([hdr, ...rows], {
  x: 0.7, y: 1.2, w: 12.05, colW: [2.4, 4.8, 4.85],
  rowH: [0.4, 1.15, 1.15, 1.15, 1.15],
  border: { type: "solid", color: LINE, pt: 1 },
  fontFace: BFONT, valign: "middle", margin: 6,
});
s.addNotes(notes(
  "This table is the hand-off to Ishii-sensei, who presents LaBraM next. I keep the comparison factual and short.\n\n" +
  "ST-EEGFormer represents EEG as continuous patches: unfold plus a linear layer. Self-supervised learning is MAE, mean squared error on the raw samples of the 75 percent masked patches. Attention is a single-axis Vision Transformer on the flattened channel-time sequence, bidirectional.\n\n" +
  "LaBraM represents EEG as discrete tokens from a neural tokenizer, vector quantization, a codebook. Self-supervised learning is masked token prediction. Ishii-sensei mentioned a spectrum-based reconstruction loss; I leave the details to him.\n\n" +
  "In Yang et al., after fine-tuning, ST-EEGFormer-large has the best average rank, 5.61. LaBraM fine-tuned is 8.99 in that ranking table. Linear probing is weak for both.\n\n" +
  "The paper does not say LaBraM is useless. It says that after fine-tuning, the extra complexity of a discrete tokenizer does not clearly beat raw MAE on these BCI tasks. Fine-tuning also changes attention maps a lot, which they interpret as overwriting much of the pretraining specialization. That is Yang et al.’s claim. The LaBraM talk can confirm, qualify, or contradict it.",
  "NE PAS dire qu’Ishii n’a pas fini de lire LaBraM. NE PAS dire que LaBraM est nul.\n\n" +
  "Phrase de passation : « I leave the LaBraM details to Ishii-sensei. »\n\n" +
  "Tableau en 4 lignes :\n" +
  "• Tokens : continu (nous) vs discret VQ (eux)\n" +
  "• SSL : MSE sur le signal vs prédire des tokens / spectre\n" +
  "• Attention : un ViT plat vs Transformer sur tokens discrets\n" +
  "• Rang FT dans CE papier : 5.61 vs 8.99\n\n" +
  "Spectrum loss : Ishii l’a mentionné. Tu n’es pas expert LaBraM. « I leave the details to him » est la phrase intelligente.\n\n" +
  "Mapping calcium : ST-EEGFormer ≈ CAPT (continu). LaBraM ≈ CalM (VQ)."
));
footer(s, 13);

// =====================================================================
// 14 LAB USE (no LOSO numbers)
// =====================================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "How we use it in the lab (context only)", "Ishii Lab");
const lab = [
  ["Task", "Covert left vs right spatial attention (Morioka 2014)"],
  ["Data", "43 subjects · 8 s windows · 256 Hz · 64 EEG channels"],
  ["Protocol", "Population fine-tune of ST-EEGFormer-large"],
  ["Number", "61.7%  ≈  LaBraM ~62%  ·  LDA 55.7%  ·  chance 50%"],
];
lab.forEach((c, i) => {
  const y = 1.25 + i * 1.05;
  panel(s, 0.7, y, 12.05, 0.92, WHITE);
  s.addText(c[0].toUpperCase(), {
    x: 0.95, y: y + 0.25, w: 2.2, h: 0.45, fontFace: BFONT, fontSize: 13, bold: true, color: ACCENT, margin: 0,
  });
  s.addText(c[1], {
    x: 3.3, y: y + 0.22, w: 9.15, h: 0.5, fontFace: BFONT, fontSize: 16, color: INK, margin: 0,
  });
});
s.addText("This is the July seminar result. No new leave-one-subject-out numbers today.", {
  x: 0.7, y: 5.55, w: 12.05, h: 0.4, fontFace: BFONT, fontSize: 14, italic: true, color: MUTED, margin: 0,
});
s.addNotes(notes(
  "Last slide of lab context, not a new experiment, and not a result from Yang et al. I keep it short so we stay on the paper.\n\n" +
  "In the lab we fine-tune the official large checkpoint on ATR spatial attention: covert left versus right, 43 subjects, eight-second attention windows at 256 hertz, 64 channels after dropping EOG. That is the Morioka 2014 paradigm, preprocessing aligned with Liz.\n\n" +
  "On 23 July I reported population accuracy 61.7 percent, essentially matching Liz’s LaBraM at about 62 percent, above LDA at 55.7 percent, chance 50 percent.\n\n" +
  "I am not presenting leave-one-subject-out results today. I do not have the cluster logs with me. When I have them I will update separately.\n\n" +
  "One link to the paper: 43 subjects is exactly the small-N regime where Yang et al. say foundation models may not beat compact models. Matching LaBraM at 61.7 percent is consistent with their finding that after fine-tuning, different foundation models become similar, and the gain over a strong classical baseline is a few points, not a revolution.",
  "CE n’est pas le papier. C’est NOTRE expérience (séminaire 23 juillet).\n\n" +
  "Tâche : attention spatiale COUVERTE gauche vs droite (pas bouger les yeux). Morioka 2014. 43 sujets, 8 s, 256 Hz, 64 EEG.\n\n" +
  "Chiffres autorisés : 61.7% ST-EEGFormer pop ≈ LaBraM ~62% · LDA 55.7% · chance 50%.\n" +
  "Config gagnante (si on te demande) : layer_decay 1.0, mixup 0, lr 3e-4, warmup 5, 50 ep, batch 4.\n\n" +
  "INTERDIT : moyenne LOSO, « on a gagné », « on est bloqués ».\n\n" +
  "Lien papier : 43 sujets = petit N. Parité avec LaBraM après FT = exactement le finding Yang.\n\n" +
  "LDA = classifieur linéaire classique. 55.7% montre que la tâche n’est pas triviale, et que le FM ajoute ~6 points, pas 20."
));
footer(s, 14);

// =====================================================================
// 14 CLOSE
// =====================================================================
s = pres.addSlide();
s.background = { color: CHAR };
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: ACCENT } });
s.addText("Summary", {
  x: 0.85, y: 1.35, w: 11.5, h: 0.5, fontFace: HFONT, fontSize: 28, color: WHITE, bold: true, margin: 0,
});
s.addText(
  "ST-EEGFormer: raw EEG patches + MAE + ViT.\nAttention = one sequence over channel × time.\nPaper: fine-tune is required; simple MAE is enough;\nbest average rank 5.61 after FT; FMs help most when data is rich.\n\nLaBraM = discrete tokenizer — Ishii-sensei next.",
  { x: 0.85, y: 2.05, w: 11.5, h: 2.6, fontFace: BFONT, fontSize: 20, color: "C5CCD3", margin: 0 }
);
s.addText("Thank you  ·  questions welcome", {
  x: 0.85, y: 5.0, w: 11.5, h: 0.45, fontFace: HFONT, fontSize: 22, color: WHITE, margin: 0,
});
s.addNotes(notes(
  "To close, the paper in four sentences, then the lab in one, then the hand-off.\n\n" +
  "ST-EEGFormer is a Vision Transformer on raw EEG patches, pretrained with masked autoencoding, no discrete tokenizer. Attention mixes electrodes and time in one sequence. The ICLR 2026 paper asks whether EEG foundation models are worth it, and answers: they help when you fine-tune and when data is rich; linear probing is weak; there is no clear scaling law on small BCI sets; and a simple MAE baseline can match more complex models, including tokenizers, after fine-tuning — best average rank 5.61 for the large model.\n\n" +
  "The authors also call for a large unified EEG dataset, an ImageNet of EEG, because without it we cannot really test scaling. That is a limitation they state honestly.\n\n" +
  "In the lab we fine-tuned that large checkpoint on spatial attention and got 61.7 percent, matching LaBraM. That is consistent with the paper: after fine-tuning, foundation models look similar, and the gain over LDA is real but not huge.\n\n" +
  "Ishii-sensei will now present LaBraM, the discrete-tokenizer counterpart. Thank you. I am happy to take questions.",
  "Lis lentement. Puis : « Ishii-sensei, please. »\n\n" +
  "Q&A express :\n" +
  "• Tokenizer ? « No. Continuous patches, linear projection. »\n" +
  "• Attention canaux ? « Yes, in the same ViT softmax as time. »\n" +
  "• Causal / next neuron ? « No. Bidirectional MAE. »\n" +
  "• LOSO labo ? « No numbers today. »\n" +
  "• Pourquoi 61.7 ≈ 62 ? « Matches the paper: after fine-tuning, FMs become similar. »\n" +
  "• MAE inutile selon LaBraM ? « That is the claim Yang et al. test; in their ranking, raw MAE is enough after FT. »\n\n" +
  "Si tu ne sais pas : « I don’t want to overclaim; that is in the LaBraM paper / I can check. » Mieux que d’inventer."
));
footer(s, 15, true);

// =====================================================================
// 16 ARCHIVE — after the 19 Aug talk (not presented live)
// =====================================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "After the talk (19 Aug) — archive, do not present", "Lab notes");
const after = [
  ["LaBraM", "Postponed to next week. Cuong data-aug also next week."],
  ["Hz / channels", "Homework: not the same system. Resample offline to 128 Hz; senloc maps electrodes (145 slots, ≤142)."],
  ["Fine-tune", "Red bars = encoder is updated. MAE decoder is dropped. Purple = frozen encoder. Correct next time."],
  ["Loss", "Ishii prefers correlation on the raw series. MSE is too strong (amplitude/offset)."],
  ["Speed", "“2 weeks is too long” = Maxime’s test cycle, not waiting for the new machine."],
  ["Compute / paper", "Stronger machine 1 Sept. Start now: calibration, FT, CSP. Aim a new paper."],
];
after.forEach((c, i) => {
  const y = 1.18 + i * 0.9;
  panel(s, 0.7, y, 12.05, 0.82, WHITE);
  s.addText(c[0].toUpperCase(), {
    x: 0.9, y: y + 0.2, w: 2.3, h: 0.42, fontFace: BFONT, fontSize: 13, bold: true, color: ACCENT, margin: 0,
  });
  s.addText(c[1], {
    x: 3.3, y: y + 0.18, w: 9.2, h: 0.5, fontFace: BFONT, fontSize: 15, color: INK, margin: 0,
  });
});
s.addNotes(notes(
  "Archive slide. Do not present. Notes from the 19 August study session after Q&A.",
  "LaBraM reporté. Homework 128 Hz + senloc. FT = encoder, pas le decoder MAE. Corrélation > MSE. Tests trop lents (pas la machine). Machine 1er sept. Commencer calibration / CSP / FT maintenant."
));
footer(s, 16);

const out = path.join(__dirname, "..", "presentations", "ST-EEGFormer_study_session_2026-08-19.pptx");
const outNew = path.join(__dirname, "..", "presentations", "ST-EEGFormer_study_session_2026-08-19_NEW.pptx");
pres.writeFile({ fileName: outNew }).then((f) => {
  console.log("Wrote:", f);
  try {
    require("fs").copyFileSync(outNew, out);
    console.log("Copied to:", out);
  } catch (e) {
    console.warn("Could not overwrite original (locked):", e.code || e.message);
  }
});
