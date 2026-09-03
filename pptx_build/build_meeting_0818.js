/**
 * build_meeting_0818.js — Paper-reading club, 18 Aug 2026 (afternoon Zoom)
 *
 * Technical internals of ST-EEGFormer (what Ishii asked on 13 Aug):
 * backbone, attention, SSL/MAE, loss, decoder, dataset, eval, compute.
 *
 * Visual: same academic charcoal as the 23 July seminar.
 * Run:  node pptx_build/build_meeting_0818.js
 * Output: presentations/ST-EEGFormer_reading_club_2026-08-18.pptx
 */

const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Maxime Lacombe";
pres.title = "ST-EEGFormer internals — paper reading club 18 Aug 2026";
pres.subject = "Ishii Lab · EEG foundation model session";

const CHAR = "2C3338";
const INK = "1A1A1A";
const MUTED = "5C6570";
const LINE = "D0D5DB";
const BG = "F7F7F5";
const WHITE = "FFFFFF";
const ACCENT = "1F3A5F";
const LIGHT = "EEF2F6";
const GOLD = "FBF7EC";
const GOLD_LINE = "E4D9B8";

const HFONT = "Georgia";
const BFONT = "Calibri";

function footer(slide, num, dark) {
  slide.addShape(pres.shapes.LINE, {
    x: 0.7, y: 7.0, w: 11.9, h: 0,
    line: { color: dark ? "4B5563" : LINE, width: 0.75 },
  });
  slide.addText("Maxime Lacombe  ·  Ishii Lab  ·  18 August 2026  ·  EEG reading club", {
    x: 0.7, y: 7.1, w: 10.5, h: 0.28, fontFace: BFONT, fontSize: 11,
    color: dark ? "9CA3AF" : MUTED, align: "left", margin: 0,
  });
  slide.addText(String(num), {
    x: 12.2, y: 7.1, w: 0.5, h: 0.28, fontFace: BFONT, fontSize: 11,
    color: dark ? "9CA3AF" : MUTED, align: "right", margin: 0,
  });
}

function header(slide, title, kicker) {
  slide.addText(kicker.toUpperCase(), {
    x: 0.7, y: 0.32, w: 12, h: 0.26, fontFace: BFONT, fontSize: 11,
    color: ACCENT, bold: true, charSpacing: 1.2, margin: 0,
  });
  slide.addText(title, {
    x: 0.7, y: 0.58, w: 12, h: 0.48, fontFace: HFONT, fontSize: 24,
    color: INK, bold: true, margin: 0,
  });
  slide.addShape(pres.shapes.LINE, {
    x: 0.7, y: 1.14, w: 11.9, h: 0, line: { color: LINE, width: 1 },
  });
}

function panel(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: fill || WHITE },
    line: { color: LINE, width: 1 },
  });
}

let s;

// =========================================================
// 1 — TITLE
// =========================================================
s = pres.addSlide();
s.background = { color: CHAR };
s.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: ACCENT },
});
s.addText("PAPER READING CLUB  ·  EEG FOUNDATION MODELS", {
  x: 0.85, y: 1.55, w: 11.5, h: 0.32, fontFace: BFONT, fontSize: 13,
  color: "B0B8C1", bold: true, charSpacing: 1.5, margin: 0,
});
s.addText("ST-EEGFormer internals", {
  x: 0.85, y: 2.05, w: 11.5, h: 0.7, fontFace: HFONT, fontSize: 36,
  color: WHITE, bold: true, margin: 0,
});
s.addText("Architecture, attention, self-supervised objective, decoder, data, compute", {
  x: 0.85, y: 2.85, w: 11.5, h: 0.4, fontFace: BFONT, fontSize: 16,
  color: "A8B0B8", margin: 0,
});
s.addText("Maxime Lacombe  ·  18 August 2026 (afternoon Zoom)\nIshii presents LaBraM  ·  19 August = CalM / POCO", {
  x: 0.85, y: 3.55, w: 11.5, h: 0.7, fontFace: BFONT, fontSize: 15,
  color: "C5CCD3", margin: 0,
});
s.addText("Reuse of 23 July seminar facts  ·  new focus = how the model works", {
  x: 0.85, y: 5.9, w: 11.5, h: 0.35, fontFace: BFONT, fontSize: 13,
  color: "8A939C", margin: 0,
});
s.addNotes(
  "Good afternoon. This session is the EEG half of the paper-reading club.\n\n" +
  "On 23 July I already presented the internship result: population 61.7 percent, matching LaBraM. Today I will not redo that talk. Today I explain how ST-EEGFormer works, because Ishii-sensei asked for the internals: attention, self-supervised learning, loss, decoder, dataset, and training time.\n\n" +
  "Ishii-sensei will present LaBraM. Tomorrow is calcium imaging: CalM and POCO."
);
footer(s, 1, true);

// =========================================================
// 2 — OUTLINE (Ishii's questions)
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "What this talk answers", "Outline");

const qs = [
  ["1", "Input", "Raw time series or discrete tokens?"],
  ["2", "Backbone", "Transformer size, patches, embeddings"],
  ["3", "Attention", "Between channels? Time? Dual-axis?"],
  ["4", "SSL", "MAE reconstruction — mask, decoder, loss"],
  ["5", "Downstream", "Classification head, dataset, eval"],
  ["6", "Compute", "LOSO time · what we can import later"],
];
qs.forEach((o, i) => {
  const col = i < 3 ? 0 : 1;
  const row = i % 3;
  const x = 0.7 + col * 6.15;
  const y = 1.4 + row * 1.7;
  panel(s, x, y, 5.9, 1.5, WHITE);
  s.addText(o[0], {
    x: x + 0.25, y: y + 0.35, w: 0.55, h: 0.7, fontFace: HFONT, fontSize: 22,
    bold: true, color: ACCENT, margin: 0,
  });
  s.addText(o[1], {
    x: x + 0.95, y: y + 0.28, w: 4.6, h: 0.45, fontFace: HFONT, fontSize: 18,
    bold: true, color: INK, margin: 0,
  });
  s.addText(o[2], {
    x: x + 0.95, y: y + 0.78, w: 4.6, h: 0.45, fontFace: BFONT, fontSize: 14,
    color: MUTED, margin: 0,
  });
});
s.addNotes(
  "These six points are exactly what was requested on 13 August.\n\n" +
  "Input: raw or tokens. Backbone: architecture. Attention: channels versus time. Self-supervised learning: MAE. Downstream: decoder and evaluation. Compute: how long training takes.\n\n" +
  "I will go through them in this order."
);
footer(s, 2);

// =========================================================
// 3 — ONE-SLIDE RECAP (reuse seminar)
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Context from 23 July (not today's focus)", "Recap");

const recap = [
  ["Task", "Covert left / right spatial attention\n43 subjects · 8 s @ 256 Hz · 64 EEG channels"],
  ["Population", "ST-EEGFormer 61.7%  ≈  LaBraM ~62%\nLDA 55.7%  ·  chance 50%"],
  ["LOSO", "Still running on the cluster\nNo final mean until 43/43 folds"],
  ["Config", "ViT-large · lr 3e-4 · layer_decay 1.0\nmix_up 0.0 · 50 epochs · batch 4"],
];
recap.forEach((c, i) => {
  const x = 0.7 + (i % 2) * 6.15;
  const y = 1.4 + Math.floor(i / 2) * 2.55;
  panel(s, x, y, 5.9, 2.35, WHITE);
  s.addText(c[0].toUpperCase(), {
    x: x + 0.3, y: y + 0.28, w: 5.3, h: 0.35, fontFace: BFONT, fontSize: 12,
    bold: true, color: ACCENT, charSpacing: 1, margin: 0,
  });
  s.addText(c[1], {
    x: x + 0.3, y: y + 0.75, w: 5.3, h: 1.3, fontFace: BFONT, fontSize: 16,
    color: INK, margin: 0,
  });
});
s.addNotes(
  "Quick recap only. The internship already showed that ST-EEGFormer matches LaBraM on population training at 61.7 percent.\n\n" +
  "LOSO is still running. I will not report a partial mean.\n\n" +
  "Today is about the internals, so I move on."
);
footer(s, 3);

// =========================================================
// 4 — TWO-STAGE PIPELINE
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Two stages: MAE pretrain, then classify", "Pipeline");

const stages = [
  ["Stage 1 — Pretrain", "Masked Autoencoder on raw EEG patches\nReconstruct missing patches (MSE)\nNo labels. Large unlabeled EEG corpora."],
  ["Stage 2 — Finetune", "Same encoder + linear classification head\nLeft vs right attention (2 classes)\nSoftTarget cross-entropy · pretrained weights loaded"],
];
stages.forEach((c, i) => {
  const x = 0.7 + i * 6.15;
  panel(s, x, 1.45, 5.9, 2.55, WHITE);
  s.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.45, w: 0.14, h: 2.55, fill: { color: ACCENT },
  });
  s.addText(c[0], {
    x: x + 0.4, y: 1.65, w: 5.3, h: 0.45, fontFace: HFONT, fontSize: 18,
    bold: true, color: INK, margin: 0,
  });
  s.addText(c[1], {
    x: x + 0.4, y: 2.2, w: 5.3, h: 1.5, fontFace: BFONT, fontSize: 15,
    color: MUTED, margin: 0,
  });
});

panel(s, 0.7, 4.2, 12.05, 2.5, GOLD);
s.addText("Not a next-token / next-neuron predictor", {
  x: 0.95, y: 4.4, w: 11.5, h: 0.4, fontFace: HFONT, fontSize: 18,
  bold: true, color: ACCENT, margin: 0,
});
s.addText(
  "CalM predicts the next discrete neural token (autoregressive). CAPT predicts the next continuous patch (MSE). ST-EEGFormer pretraining is MAE: randomly mask patches and reconstruct them — bidirectional encoder, not causal next-step prediction. That is a concrete difference if we later import calcium ideas.",
  {
    x: 0.95, y: 4.9, w: 11.5, h: 1.5, fontFace: BFONT, fontSize: 15,
    color: INK, margin: 0,
  }
);
s.addNotes(
  "Two stages. Pretrain is a masked autoencoder on raw EEG. Finetune is classification with a linear head.\n\n" +
  "Important for the calcium discussion: this is not next-neuron prediction. CalM and CAPT are autoregressive. ST-EEGFormer is MAE — mask and reconstruct. Bidirectional, not causal."
);
footer(s, 4);

// =========================================================
// 5 — INPUT: RAW PATCHES
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Input: raw time series, not a discrete tokenizer", "1 · Input");

const hdr = [
  { text: "", options: { fill: { color: ACCENT }, color: WHITE, bold: true } },
  { text: "ST-EEGFormer", options: { fill: { color: ACCENT }, color: WHITE, bold: true } },
  { text: "LaBraM", options: { fill: { color: ACCENT }, color: WHITE, bold: true } },
];
const body = [
  ["Representation", "Continuous patches\nUnfold + Linear", "Discrete VQ tokens\nneural tokenizer / codebook"],
  ["SSL", "MAE reconstructs\nraw patch values", "Masked token prediction\n(spectrum-based, per Ishii)"],
  ["Calcium analogue", "CAPT-style\n(continuous)", "CalM-style\n(discrete VQ)"],
].map((r) =>
  r.map((cell, ci) => ({
    text: cell,
    options: {
      fill: { color: ci === 0 ? LIGHT : WHITE },
      color: ci === 0 ? ACCENT : INK,
      bold: ci === 0,
      align: "left",
      valign: "middle",
      fontSize: 14,
    },
  }))
);
s.addTable([hdr, ...body], {
  x: 0.7, y: 1.4, w: 12.05, colW: [2.6, 4.7, 4.75],
  rowH: [0.42, 1.05, 1.05, 1.05],
  border: { type: "solid", color: LINE, pt: 1 },
  fontFace: BFONT, valign: "middle", margin: 6,
});
s.addText("Code: PatchEmbedEEG — Unfold(kernel=patch_size, stride=patch_size) then nn.Linear(patch_size → embed_dim). No codebook.", {
  x: 0.7, y: 6.15, w: 12.05, h: 0.55, fontFace: BFONT, fontSize: 13,
  color: MUTED, italic: true, margin: 0,
});
s.addNotes(
  "Correction from last time. ST-EEGFormer does not use a discrete tokenizer. It cuts the raw signal into non-overlapping temporal patches and projects them with a linear layer. No codebook.\n\n" +
  "LaBraM is the discrete VQ model. Mapping: ST-EEGFormer is CAPT-style, LaBraM is CalM-style."
);
footer(s, 5);

// =========================================================
// 6 — BACKBONE
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Backbone: ViT-large adapted to EEG", "2 · Backbone");

const specs = [
  ["Patch size", "16 samples"],
  ["Embed dim", "1024"],
  ["Depth", "24 blocks"],
  ["Heads", "16"],
  ["MLP ratio", "4"],
  ["Params", "~303 M"],
];
specs.forEach((c, i) => {
  const x = 0.7 + (i % 6) * 2.02;
  panel(s, x, 1.4, 1.9, 1.35, WHITE);
  s.addText(c[0].toUpperCase(), {
    x: x + 0.08, y: 1.52, w: 1.74, h: 0.35, fontFace: BFONT, fontSize: 11,
    bold: true, color: ACCENT, align: "center", margin: 0,
  });
  s.addText(c[1], {
    x: x + 0.08, y: 1.9, w: 1.74, h: 0.6, fontFace: HFONT, fontSize: 16,
    bold: true, color: INK, align: "center", margin: 0,
  });
});

panel(s, 0.7, 3.0, 12.05, 3.65, WHITE);
s.addText("Forward path (finetune)", {
  x: 0.95, y: 3.18, w: 11.5, h: 0.35, fontFace: HFONT, fontSize: 16,
  bold: true, color: INK, margin: 0,
});
s.addText(
  [
    { text: "EEG  B × Ch × T  →  unfold into patches  (Seq × Ch)", options: { bullet: true, breakLine: true } },
    { text: "Linear project each patch → 1024-d token", options: { bullet: true, breakLine: true } },
    { text: "Add channel embedding (learned, 145 slots) + temporal sinusoidal PE", options: { bullet: true, breakLine: true } },
    { text: "Flatten to one sequence: Seq × Channels tokens  (+ CLS)", options: { bullet: true, breakLine: true } },
    { text: "24 Transformer blocks (standard self-attention, not dual-axis)", options: { bullet: true, breakLine: true } },
    { text: "Readout: CLS token, or global average pool of patch tokens → linear head", options: { bullet: true } },
  ],
  { x: 0.95, y: 3.6, w: 11.5, h: 2.85, fontFace: BFONT, fontSize: 15, color: INK, margin: 0 }
);
s.addNotes(
  "We use the large Vision Transformer: patch size 16, embedding 1024, 24 layers, 16 heads, about 303 million parameters.\n\n" +
  "Each channel is cut into temporal patches. Each patch becomes a token. We add a channel embedding so the model knows which electrode it is, and a temporal positional encoding.\n\n" +
  "Then all tokens from all channels and all time patches are concatenated into one sequence. That is important for the next slide on attention."
);
footer(s, 6);

// =========================================================
// 7 — ATTENTION (the key Ishii question)
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Attention is joint over channel × time tokens", "3 · Attention");

panel(s, 0.7, 1.4, 7.5, 5.25, WHITE);
s.addText("What the Transformer sees", {
  x: 0.95, y: 1.58, w: 7.1, h: 0.4, fontFace: HFONT, fontSize: 18,
  bold: true, color: INK, margin: 0,
});
s.addText(
  [
    { text: "One sequence of tokens = every (time-patch, channel) pair", options: { bullet: true, breakLine: true } },
    { text: "Self-attention is full: a token at channel C1, time t can attend to channel C2, time t′", options: { bullet: true, breakLine: true } },
    { text: "So yes — inter-channel mixing happens, but it is not a separate “neural axis” like CalM’s Dual-Axis Transformer", options: { bullet: true, breakLine: true } },
    { text: "Channel identity is injected by a learned embedding, not by a dedicated neuron-axis block", options: { bullet: true, breakLine: true } },
    { text: "Attention is bidirectional (MAE / ViT), not causal next-step", options: { bullet: true } },
  ],
  { x: 0.95, y: 2.15, w: 7.0, h: 4.2, fontFace: BFONT, fontSize: 15, color: INK, margin: 0 }
);

panel(s, 8.4, 1.4, 4.35, 2.45, LIGHT);
s.addText("CalM / CAPT", {
  x: 8.6, y: 1.55, w: 4.0, h: 0.35, fontFace: BFONT, fontSize: 12,
  bold: true, color: ACCENT, margin: 0,
});
s.addText("Dual-axis:\n• neural axis (bidirectional)\n• temporal axis (causal)", {
  x: 8.6, y: 1.95, w: 4.0, h: 1.6, fontFace: BFONT, fontSize: 14,
  color: INK, margin: 0,
});

panel(s, 8.4, 4.05, 4.35, 2.6, GOLD);
s.addText("ST-EEGFormer", {
  x: 8.6, y: 4.2, w: 4.0, h: 0.35, fontFace: BFONT, fontSize: 12,
  bold: true, color: ACCENT, margin: 0,
});
s.addText("Single-axis ViT:\nall channel–time tokens\nin one attention pool", {
  x: 8.6, y: 4.6, w: 4.0, h: 1.7, fontFace: BFONT, fontSize: 14,
  color: INK, margin: 0,
});
s.addNotes(
  "This is the main technical answer.\n\n" +
  "Does ST-EEGFormer do inter-channel attention? Yes. Because all channel-time patches sit in one sequence, self-attention can mix channels and time together.\n\n" +
  "It is not CalM’s dual-axis design. CalM has a neural axis and a temporal axis separately, and the temporal axis is causal. We have one standard ViT attention, bidirectional.\n\n" +
  "If we want to import next-neuron prediction from CalM, that would be a new objective — we do not have it now."
);
footer(s, 7);

// =========================================================
// 8 — MAE SSL
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Self-supervised learning = MAE on raw patches", "4 · SSL");

const mae = [
  ["Mask", "75% of patches dropped at random\n(standard MAE ratio)"],
  ["Encoder", "Sees only the kept patches + CLS\n24 ViT blocks"],
  ["Decoder", "Lightweight Transformer\nmask tokens inserted back"],
  ["Target", "Raw patch waveform\nLinear → patch_size values"],
];
mae.forEach((c, i) => {
  const x = 0.7 + (i % 2) * 6.15;
  const y = 1.4 + Math.floor(i / 2) * 2.15;
  panel(s, x, y, 5.9, 1.95, WHITE);
  s.addText(c[0].toUpperCase(), {
    x: x + 0.3, y: y + 0.22, w: 5.3, h: 0.32, fontFace: BFONT, fontSize: 12,
    bold: true, color: ACCENT, margin: 0,
  });
  s.addText(c[1], {
    x: x + 0.3, y: y + 0.6, w: 5.3, h: 1.1, fontFace: BFONT, fontSize: 16,
    color: INK, margin: 0,
  });
});
s.addNotes(
  "Pretraining is Masked Autoencoder, same idea as MAE in vision.\n\n" +
  "We hide 75 percent of the patches. The encoder sees only the visible ones. The decoder puts mask tokens back and tries to reconstruct the raw waveform of the hidden patches.\n\n" +
  "The decoder predicts the actual sample values in the patch, not a codebook index. That is why I say it is continuous, like CAPT, not discrete like CalM."
);
footer(s, 8);

// =========================================================
// 9 — LOSS + DOWNSTREAM HEAD
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Losses: MSE in pretrain, CE in finetune", "4–5 · Loss & decoder");

panel(s, 0.7, 1.4, 5.9, 5.25, WHITE);
s.addText("Pretrain loss", {
  x: 0.95, y: 1.6, w: 5.4, h: 0.4, fontFace: HFONT, fontSize: 18,
  bold: true, color: INK, margin: 0,
});
s.addText(
  "MSE between predicted and true raw patches.\n\nAveraged only on masked patches (the 75% that were removed).\n\nNot cross-entropy on tokens.\nNot a spectral loss (that is LaBraM’s reconstruction story).",
  {
    x: 0.95, y: 2.15, w: 5.4, h: 4.1, fontFace: BFONT, fontSize: 15,
    color: INK, margin: 0,
  }
);

panel(s, 6.85, 1.4, 5.9, 5.25, WHITE);
s.addText("Finetune “decoder”", {
  x: 7.1, y: 1.6, w: 5.4, h: 0.4, fontFace: HFONT, fontSize: 18,
  bold: true, color: INK, margin: 0,
});
s.addText(
  "Not a generative decoder.\n\nLinear classification head on the encoder readout (CLS or global pool).\n\nLoss: SoftTarget cross-entropy (2 classes).\n\nlayer_decay = 1.0 so the whole backbone adapts. mix_up = 0.",
  {
    x: 7.1, y: 2.15, w: 5.4, h: 4.1, fontFace: BFONT, fontSize: 15,
    color: INK, margin: 0,
  }
);
s.addNotes(
  "Two different losses.\n\n" +
  "Pretrain: mean squared error on the hidden raw patches only.\n\n" +
  "Finetune: we throw away the MAE decoder. We keep the encoder and add a linear head for left versus right. SoftTarget cross-entropy. The whole backbone is allowed to adapt, layer decay 1.0."
);
footer(s, 9);

// =========================================================
// 10 — DATASET + EVAL
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Dataset and evaluation (lab spatial attention)", "5 · Data & eval");

const data = [
  ["Paradigm", "Morioka et al. 2014 · covert L/R attention"],
  ["N", "43 subjects (prep aligned with Liz, v2)"],
  ["Window", "8 s attention epoch @ 256 Hz"],
  ["Channels", "64 EEG (EOG excluded) for the ViT"],
  ["Metric", "Accuracy (2-class; chance 50%)"],
  ["Protocols", "Population (done) · LOSO (running)"],
];
data.forEach((c, i) => {
  const y = 1.4 + i * 0.85;
  panel(s, 0.7, y, 12.05, 0.75, WHITE);
  s.addText(c[0], {
    x: 0.95, y: y + 0.18, w: 2.4, h: 0.4, fontFace: BFONT, fontSize: 15,
    bold: true, color: ACCENT, margin: 0,
  });
  s.addText(c[1], {
    x: 3.5, y: y + 0.18, w: 8.9, h: 0.4, fontFace: BFONT, fontSize: 16,
    color: INK, margin: 0,
  });
});
s.addNotes(
  "Same lab dataset as the July seminar. Forty-three subjects, eight-second attention windows at 256 hertz, 64 channels.\n\n" +
  "Evaluation is classification accuracy. Population is done. LOSO is the generalization protocol still running."
);
footer(s, 10);

// =========================================================
// 11 — COMPUTE
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Compute: LOSO is the bottleneck", "6 · Compute");

panel(s, 0.7, 1.4, 12.05, 2.35, WHITE);
s.addText("What we know from the cluster (kng11, job 109704)", {
  x: 0.95, y: 1.55, w: 11.5, h: 0.4, fontFace: HFONT, fontSize: 16,
  bold: true, color: INK, margin: 0,
});
s.addText(
  "Each LOSO fold ≈ retrain on ~42 subjects (50 epochs) then evaluate the held-out subject.\n" +
  "Log: ~0.77 s / iteration, 1500 it / epoch → ~19 min / epoch → ~16 h / fold.\n" +
  "Observed pace ≈ 1 fold / day. TimeLimit 30 days. I will update the COMPLETED count from the lab before this talk.",
  {
    x: 0.95, y: 2.05, w: 11.5, h: 1.45, fontFace: BFONT, fontSize: 15,
    color: INK, margin: 0,
  }
);

const opts = [
  ["Keep current job", "Let 109704 finish. Resume via COMPLETED markers if it dies."],
  ["A100 (lab)", "Ishii: available; Tatsuki already uses it for CalM. After holidays, more accounts."],
  ["Smaller model", "Tatsuki: reducing CalM params kept similar performance. We can test ViT-base vs large for speed."],
];
opts.forEach((c, i) => {
  const x = 0.7 + i * 4.1;
  panel(s, x, 3.95, 3.9, 2.7, i === 1 ? GOLD : WHITE);
  s.addText(c[0], {
    x: x + 0.2, y: 4.15, w: 3.5, h: 0.55, fontFace: HFONT, fontSize: 15,
    bold: true, color: ACCENT, margin: 0,
  });
  s.addText(c[1], {
    x: x + 0.2, y: 4.75, w: 3.5, h: 1.65, fontFace: BFONT, fontSize: 13,
    color: INK, margin: 0,
  });
});
s.addNotes(
  "Compute. Each leave-one-subject-out fold is a full retrain. From the logs, about 19 minutes per epoch, 50 epochs, so about 16 hours per fold, roughly one fold per day.\n\n" +
  "I will give the latest COMPLETED count from the lab.\n\n" +
  "If we need many more experiments — from-scratch, chimera ideas — then A100 or a smaller backbone is the discussion Ishii opened."
);
footer(s, 11);

// =========================================================
// 12 — WHAT WE CAN IMPORT
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "For the chimera discussion (18–19 Aug)", "Open");

const open = [
  ["Already like CAPT", "Continuous patches + reconstruction in signal space. No VQ to remove."],
  ["Not like CalM", "No dual-axis attention. No next-neuron / next-token prediction."],
  ["Possible imports", "Causal / dual-axis attention · inter-channel forecasting · identity invariance (Miyamoto) · Ca-style simulators / augmentation"],
  ["EEG constraint", "Decodable EEG is hard to simulate (Ishii). We have lots of public EEG, but labeled lab data is small (43 subjects)."],
];
open.forEach((c, i) => {
  const y = 1.35 + i * 1.3;
  panel(s, 0.7, y, 12.05, 1.18, WHITE);
  s.addText(c[0], {
    x: 0.95, y: y + 0.32, w: 3.1, h: 0.55, fontFace: HFONT, fontSize: 15,
    bold: true, color: ACCENT, margin: 0,
  });
  s.addText(c[1], {
    x: 4.2, y: y + 0.22, w: 8.2, h: 0.75, fontFace: BFONT, fontSize: 15,
    color: INK, margin: 0,
  });
});
s.addNotes(
  "This slide is for the joint discussion, not a promise of new experiments this week.\n\n" +
  "We already sit on the continuous / CAPT side. We do not have CalM’s next-neuron prediction or dual-axis attention. Those are possible imports.\n\n" +
  "Miyamoto’s identity-invariance is another import: on EEG that would mean weakening channel identity.\n\n" +
  "Ishii also said EEG simulation of decodable signals is hard. So data augmentation is an open question, not a ready tool like the calcium kernel."
);
footer(s, 12);

// =========================================================
// 13 — THANKS
// =========================================================
s = pres.addSlide();
s.background = { color: CHAR };
s.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: ACCENT },
});
s.addText("Summary", {
  x: 0.85, y: 1.5, w: 11.5, h: 0.5, fontFace: HFONT, fontSize: 28,
  color: WHITE, bold: true, margin: 0,
});
s.addText(
  "ST-EEGFormer = raw EEG patches + MAE + ViT.\nAttention mixes channels and time in one sequence.\nFinetune = linear head, 61.7% population, LOSO running.\nLaBraM = discrete tokenizer (Ishii’s talk next).",
  {
    x: 0.85, y: 2.2, w: 11.5, h: 1.8, fontFace: BFONT, fontSize: 18,
    color: "C5CCD3", margin: 0,
  }
);
s.addText("Thank you  ·  questions welcome", {
  x: 0.85, y: 4.4, w: 11.5, h: 0.5, fontFace: HFONT, fontSize: 22,
  color: WHITE, margin: 0,
});
s.addNotes(
  "To summarize. ST-EEGFormer works on raw time-series patches, pretrained with MAE, then a linear classifier. Attention is joint over channel and time tokens. Population 61.7 percent. LOSO still running.\n\n" +
  "I am happy to take questions, and then Ishii-sensei will present LaBraM."
);
footer(s, 13, true);

const out = path.join(__dirname, "..", "presentations", "ST-EEGFormer_reading_club_2026-08-18.pptx");
pres.writeFile({ fileName: out }).then((f) => console.log("Wrote:", f));
