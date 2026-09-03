/**
 * build_seminar.js — Ishii Lab internship seminar, 23 July 2026
 *
 * Structure (Liz model, short): Organization → Motivation → Objective →
 * Method → Results → Next · 15 min talk + 5 min Q&A
 *
 * Visual: academic charcoal / white (no teal / mint “startup” look).
 * Method slides describe protocol — not a personal failure story.
 *
 * Run:  node pptx_build/build_seminar.js
 * Output: presentations/ST-EEGFormer_internship_seminar.pptx
 */

const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "Maxime Lacombe";
pres.title = "Internship Seminar — ST-EEGFormer at Ishii Lab";
pres.subject = "Ishii Lab seminar · July 23, 2026 · 15 min + 5 min Q&A";

/* —— academic charcoal palette —— */
const CHAR = "2C3338"; // title / dark panels
const CHAR2 = "3D454C";
const INK = "1A1A1A";
const MUTED = "5C6570";
const LINE = "D0D5DB";
const BG = "F7F7F5";
const WHITE = "FFFFFF";
const ACCENT = "1F3A5F"; // deep academic navy (sparse use)
const BAR_LDA = "6B7280";
const BAR_OURS = "1F3A5F";
const BAR_LIZ = "4B5563";
const BAR_CHANCE = "9CA3AF";

const HFONT = "Georgia";
const BFONT = "Calibri";

function footer(slide, num, dark) {
  slide.addShape(pres.shapes.LINE, {
    x: 0.7, y: 7.0, w: 11.9, h: 0,
    line: { color: dark ? "4B5563" : LINE, width: 0.75 },
  });
  slide.addText("Maxime Lacombe  ·  Ishii Lab  ·  23 July 2026", {
    x: 0.7, y: 7.1, w: 10.5, h: 0.28, fontFace: BFONT, fontSize: 11,
    color: dark ? "9CA3AF" : MUTED, align: "left", margin: 0,
  });
  slide.addText(String(num), {
    x: 12.2, y: 7.1, w: 0.5, h: 0.28, fontFace: BFONT, fontSize: 11,
    color: dark ? "9CA3AF" : MUTED, align: "right", margin: 0,
  });
}

function header(slide, title, kicker) {
  if (kicker) {
    slide.addText(kicker.toUpperCase(), {
      x: 0.7, y: 0.4, w: 12, h: 0.28, fontFace: BFONT, fontSize: 11,
      color: ACCENT, bold: true, charSpacing: 1.2, margin: 0,
    });
    slide.addText(title, {
      x: 0.7, y: 0.7, w: 12, h: 0.5, fontFace: HFONT, fontSize: 26,
      color: INK, bold: true, margin: 0,
    });
  } else {
    slide.addText(title, {
      x: 0.7, y: 0.45, w: 12, h: 0.55, fontFace: HFONT, fontSize: 28,
      color: INK, bold: true, margin: 0,
    });
  }
  slide.addShape(pres.shapes.LINE, {
    x: 0.7, y: 1.3, w: 11.9, h: 0, line: { color: LINE, width: 1 },
  });
}

function panel(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: fill || WHITE },
    line: { color: LINE, width: 1 },
  });
}

// =========================================================
// 1 — TITLE
// =========================================================
let s = pres.addSlide();
s.background = { color: CHAR };
s.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: ACCENT },
});
s.addText("ISHII LABORATORY  ·  KYOTO UNIVERSITY / ATR", {
  x: 0.85, y: 1.7, w: 11.5, h: 0.35, fontFace: BFONT, fontSize: 13,
  color: "B0B8C1", bold: true, charSpacing: 1.5, margin: 0,
});
s.addText("Evaluating ST-EEGFormer on the\nLab Spatial-Attention Task", {
  x: 0.85, y: 2.25, w: 11.5, h: 1.4, fontFace: HFONT, fontSize: 34,
  color: WHITE, bold: true, margin: 0,
});
s.addText(
  "Internship progress seminar  ·  comparison with LaBraM  ·  population 61.7%  ·  LOSO next",
  {
    x: 0.85, y: 3.9, w: 11.5, h: 0.45, fontFace: BFONT, fontSize: 16,
    color: "A8B0B8", margin: 0,
  }
);
s.addText("Maxime Lacombe  ·  Research Intern (April – July 2026)", {
  x: 0.85, y: 4.8, w: 11.5, h: 0.35, fontFace: BFONT, fontSize: 15,
  color: "C5CCD3", margin: 0,
});
s.addText("15 minutes  ·  5 minutes questions", {
  x: 0.85, y: 5.3, w: 11.5, h: 0.35, fontFace: BFONT, fontSize: 14,
  color: "8A939C", margin: 0,
});
s.addText("Guidance: Cuong  ·  Collaboration: Liz  ·  Ishii-sensei", {
  x: 0.85, y: 6.2, w: 11.5, h: 0.3, fontFace: BFONT, fontSize: 13,
  color: "7A848E", margin: 0,
});
s.addNotes("Good afternoon. Thank you Ishii-sensei, and thank you all for coming.\n\nMy name is Maxime Lacombe. I am a research intern in the Ishii Laboratory since April 2026.\n\nThe title of this seminar is Evaluating ST-EEGFormer on the Lab Spatial-Attention Task. Today I will present my progress on this work: the comparison with LaBraM, which is Liz's model, and my main completed result — the population accuracy of sixty-one point seven percent. Leave-one-subject-out is the next protocol and is still running, so I will not claim a final LOSO mean today.\n\nThis presentation lasts about fifteen minutes, followed by five minutes for questions. Special thanks to Cuong, to Liz, and to Ishii-sensei for their guidance.");
footer(s, 1, true);

// =========================================================
// 2 — ORGANIZATION
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Organization of the presentation", "Outline");

const org = [
  ["1", "Motivation", "Why EEG foundation models and this task"],
  ["2", "Objective", "What this internship evaluates"],
  ["3", "Related work", "Key papers that guide this project"],
  ["4", "Method", "Dataset, preprocessing, model, training"],
  ["5", "Results & next steps", "Population 61.7% · LOSO next · questions"],
];
org.forEach((o, i) => {
  const y = 1.55 + i * 0.95;
  panel(s, 0.7, y, 11.9, 0.85, WHITE);
  s.addText(o[0], {
    x: 1.0, y: y + 0.2, w: 0.6, h: 0.45, fontFace: HFONT, fontSize: 20,
    bold: true, color: ACCENT, margin: 0,
  });
  s.addText(o[1], {
    x: 1.8, y: y + 0.2, w: 4.5, h: 0.45, fontFace: HFONT, fontSize: 18,
    bold: true, color: INK, margin: 0,
  });
  s.addText(o[2], {
    x: 6.5, y: y + 0.2, w: 5.8, h: 0.45, fontFace: BFONT, fontSize: 15,
    color: MUTED, margin: 0,
  });
});
s.addNotes("Here is the organization of the presentation. I use the same structure as Liz's seminar, but shorter, because this is a fifteen-minute progress talk.\n\nFirst, Motivation: why this problem matters.\nSecond, Objective: what this internship evaluates.\nThird, Related work: only the key papers that guide this project — not a long literature review.\nFourth, Method: the dataset, the preprocessing, the model, and the training protocol.\nFifth, Results and next steps: the population result, then LOSO as the next protocol, and then questions.\n\nI will keep each part short and concrete.");
footer(s, 2);

// =========================================================
// 3 — MOTIVATION
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Why this problem matters", "Motivation");

const mots = [
  ["EEG-based BCI", "Non-invasive and affordable, but low signal-to-noise ratio and strong variability across subjects and sessions."],
  ["User-independent decoding", "Classical BCI often needs long per-user calibration. The laboratory aims at models that transfer across subjects."],
  ["EEG foundation models", "Pretrained models such as ST-EEGFormer and LaBraM may help — they must be evaluated on real laboratory data."],
];
mots.forEach((m, i) => {
  const y = 1.55 + i * 1.55;
  panel(s, 0.7, y, 11.9, 1.4, WHITE);
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y, w: 0.12, h: 1.4, fill: { color: ACCENT },
  });
  s.addText((i + 1).toString().padStart(2, "0"), {
    x: 1.15, y: y + 0.3, w: 0.7, h: 0.4, fontFace: HFONT, fontSize: 18,
    bold: true, color: ACCENT, margin: 0,
  });
  s.addText(m[0], {
    x: 2.0, y: y + 0.25, w: 10, h: 0.4, fontFace: HFONT, fontSize: 18,
    bold: true, color: INK, margin: 0,
  });
  s.addText(m[1], {
    x: 2.0, y: y + 0.75, w: 10.2, h: 0.45, fontFace: BFONT, fontSize: 15,
    color: MUTED, margin: 0,
  });
});
s.addNotes("I start with the motivation. There are three points on this slide.\n\nFirst, EEG-based brain-computer interfaces. EEG is attractive because it is non-invasive and relatively affordable. But it is also difficult: the signal-to-noise ratio is low, and the signal changes a lot from one subject to another, and even from one session to another. That variability is the core practical problem.\n\nSecond, user-independent decoding. In classical BCI, each new user often needs a long calibration before the system works. In this laboratory, the goal is to move toward models that transfer across subjects, with little or no per-user calibration.\n\nThird, EEG foundation models. Large pretrained models such as ST-EEGFormer and LaBraM are proposed as a possible answer. But we cannot assume they work: we must evaluate them carefully on real laboratory data — which is what my internship focuses on.");
footer(s, 3);

// =========================================================
// 4 — OBJECTIVE
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "What this internship evaluates", "Objective");

panel(s, 0.7, 1.5, 11.9, 1.7, CHAR);
s.addText("Main objective", {
  x: 1.0, y: 1.7, w: 11.3, h: 0.3, fontFace: BFONT, fontSize: 12,
  bold: true, color: "A8B0B8", margin: 0,
});
s.addText(
  "Evaluate ST-EEGFormer on the ATR spatial-attention dataset and compare it with LaBraM on the same task.",
  {
    x: 1.0, y: 2.15, w: 11.3, h: 0.75, fontFace: HFONT, fontSize: 20,
    color: WHITE, margin: 0,
  }
);

const specs = [
  ["Model", "ST-EEGFormer-large (ViT, ~303M parameters, pretrained)"],
  ["Task", "Left vs right spatial attention (2 classes, chance = 50%)"],
  ["Protocols", "Population (completed) · LOSO (in progress)"],
  ["References", "LaBraM (Liz) · LDA classical baseline"],
];
specs.forEach((sp, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.7 + col * 6.1;
  const y = 3.5 + row * 1.5;
  panel(s, x, y, 5.9, 1.35, WHITE);
  s.addText(sp[0].toUpperCase(), {
    x: x + 0.3, y: y + 0.25, w: 5.3, h: 0.3, fontFace: BFONT, fontSize: 11,
    bold: true, color: ACCENT, margin: 0,
  });
  s.addText(sp[1], {
    x: x + 0.3, y: y + 0.65, w: 5.3, h: 0.5, fontFace: BFONT, fontSize: 15,
    color: INK, margin: 0,
  });
});
s.addNotes("This slide states the objective of the internship. Please look at the dark box first.\n\nThe main objective is to evaluate ST-EEGFormer on the ATR spatial-attention dataset, and to compare it fairly with LaBraM on the same task.\n\nThe four cards give the concrete setting.\n\nThe model is ST-EEGFormer-large: a Vision Transformer with about three hundred and three million parameters, pretrained.\n\nThe task is left versus right spatial attention. It is a two-class problem, so chance level is fifty percent.\n\nThe protocols are population, which is completed, and leave-one-subject-out, or LOSO, which is in progress.\n\nThe references for comparison are Liz's LaBraM results, and a classical LDA baseline.");
footer(s, 4);

// =========================================================
// 5 — RELATED WORK (key papers only — like Liz, but short)
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Key papers for this project", "Related work");

const papers = [
  [
    "Yang et al., 2026",
    "Are EEG Foundation Models Worth It?",
    "Benchmark + Figure G.2 · why we evaluate ST-EEGFormer with fine-tuning protocols",
  ],
  [
    "Jiang et al., 2024",
    "LaBraM — Large Brain Model",
    "Liz's model · the comparison target on the same lab data",
  ],
  [
    "Morioka et al., 2014",
    "Decoding spatial attention (EEG + NIRS prior)",
    "Lab task paradigm · 8 s attention · left vs right",
  ],
  [
    "Critical review (Apr. 2026)",
    "EEG Foundation Models: progress & directions",
    "Survey I presented to the lab in April · context for choosing ST-EEGFormer",
  ],
];
papers.forEach((p, i) => {
  const y = 1.45 + i * 1.25;
  panel(s, 0.7, y, 11.9, 1.15, WHITE);
  s.addText(p[0], {
    x: 0.95, y: y + 0.15, w: 11.4, h: 0.28, fontFace: BFONT, fontSize: 12,
    bold: true, color: ACCENT, margin: 0,
  });
  s.addText(p[1], {
    x: 0.95, y: y + 0.42, w: 11.4, h: 0.3, fontFace: HFONT, fontSize: 15,
    bold: true, color: INK, margin: 0,
  });
  s.addText(p[2], {
    x: 0.95, y: y + 0.75, w: 11.4, h: 0.28, fontFace: BFONT, fontSize: 13,
    color: MUTED, margin: 0,
  });
});
s.addNotes("This slide lists the key papers for this project. The idea is the same as in Liz's seminar: show what we build on. But I only keep four references, not a full literature review.\n\nFirst, Yang and colleagues, twenty twenty-six: Are EEG Foundation Models Worth It? This is the main benchmark paper. It includes Figure G.2, and it motivates evaluating foundation models such as ST-EEGFormer with fine-tuning protocols.\n\nSecond, Jiang and colleagues, twenty twenty-four: LaBraM, the Large Brain Model. This is Liz's model, and it is my comparison target on the same laboratory data.\n\nThird, Morioka and colleagues, twenty fourteen: the spatial-attention paradigm used in this lab. In that paradigm, each attention epoch lasts eight seconds, and the subject attends left or right. That is the task we decode.\n\nFourth, the critical review of EEG foundation models that I presented to the laboratory in April. That survey gave the broader context before I focused on ST-EEGFormer.\n\nI do not review every paper from the semester. For example, POYO was useful early tooling context, and Liz already covered that line in detail.");
footer(s, 5);

// =========================================================
// 6 — COMPARISON SETUP
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Comparison setup in the laboratory", "Method");

panel(s, 0.7, 1.55, 3.85, 4.85, WHITE);
s.addShape(pres.shapes.RECTANGLE, {
  x: 0.7, y: 1.55, w: 3.85, h: 0.65, fill: { color: CHAR },
});
s.addText("Maxime", {
  x: 0.95, y: 1.68, w: 3.4, h: 0.4, fontFace: HFONT, fontSize: 18,
  bold: true, color: WHITE, margin: 0,
});
s.addText([
  { text: "ST-EEGFormer", options: { bold: true, breakLine: true } },
  { text: "EEG foundation model", options: { breakLine: true } },
  { text: "", options: { breakLine: true } },
  { text: "Evaluation pipeline", options: { breakLine: true } },
  { text: "Population + LOSO", options: { breakLine: true } },
], {
  x: 0.95, y: 2.5, w: 3.4, h: 3.5, fontFace: BFONT, fontSize: 15,
  color: INK, margin: 0, paraSpaceAfter: 8,
});

panel(s, 4.75, 1.55, 3.85, 4.85, WHITE);
s.addShape(pres.shapes.RECTANGLE, {
  x: 4.75, y: 1.55, w: 3.85, h: 0.65, fill: { color: CHAR2 },
});
s.addText("Liz", {
  x: 5.0, y: 1.68, w: 3.4, h: 0.4, fontFace: HFONT, fontSize: 18,
  bold: true, color: WHITE, margin: 0,
});
s.addText([
  { text: "LaBraM", options: { bold: true, breakLine: true } },
  { text: "Parallel FM evaluation", options: { breakLine: true } },
  { text: "", options: { breakLine: true } },
  { text: "Reference preprocessing", options: { breakLine: true } },
  { text: "Population ~62% · LOSO ~62%", options: { breakLine: true } },
], {
  x: 5.0, y: 2.5, w: 3.4, h: 3.5, fontFace: BFONT, fontSize: 15,
  color: INK, margin: 0, paraSpaceAfter: 8,
});

panel(s, 8.8, 1.55, 3.8, 4.85, CHAR);
s.addText("Shared ground", {
  x: 9.1, y: 1.9, w: 3.3, h: 0.45, fontFace: HFONT, fontSize: 17,
  bold: true, color: WHITE, margin: 0,
});
s.addText(
  "Same ATR spatial-attention data\n\nSame 43 subjects\n\nAligned preprocessing\n\nComparable protocols",
  {
    x: 9.1, y: 2.6, w: 3.3, h: 3.2, fontFace: BFONT, fontSize: 15,
    color: "C5CCD3", margin: 0,
  }
);
s.addNotes("This slide explains the comparison setup in the laboratory.\n\nOn the left, Maxime: I evaluate ST-EEGFormer, an EEG foundation model. My contribution is the evaluation pipeline, and the population and LOSO protocols.\n\nIn the middle, Liz: she evaluates LaBraM, on the parallel foundation-model track. She provided the reference preprocessing. Her reported results are about sixty-two percent for a population-style evaluation, and about sixty-two percent for LOSO on all forty-three subjects.\n\nOn the right, the shared ground. We use the same ATR spatial-attention data, the same forty-three subjects, aligned preprocessing, and comparable protocols. Without this shared ground, a numerical comparison would not be meaningful.");
footer(s, 6);

// =========================================================
// 7 — DATASET
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Dataset and task", "Method");

const facts = [
  ["Task", "Covert left vs right spatial attention"],
  ["Chance level", "50% (binary classification)"],
  ["Subjects", "43"],
  ["Attention epoch", "8 s (lab paradigm) @ 256 Hz"],
  ["Channels", "68 EEG → 64 for ViT (EOG excluded)"],
  ["Paradigm", "Morioka et al., 2014"],
];
facts.forEach((f, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 0.7 + col * 4.15;
  const y = 1.55 + row * 2.4;
  panel(s, x, y, 3.95, 2.2, WHITE);
  s.addText(f[0].toUpperCase(), {
    x: x + 0.3, y: y + 0.45, w: 3.35, h: 0.35, fontFace: BFONT, fontSize: 12,
    bold: true, color: ACCENT, margin: 0,
  });
  s.addText(f[1], {
    x: x + 0.3, y: y + 1.0, w: 3.35, h: 0.8, fontFace: HFONT, fontSize: 17,
    bold: true, color: INK, margin: 0,
  });
});
s.addNotes("This slide describes the dataset and the task. I will go through the six cards.\n\nThe task is covert left versus right spatial attention: the subject keeps attention to the left or to the right without moving the eyes.\n\nChance level is fifty percent, because it is binary classification.\n\nThere are forty-three subjects.\n\nThe attention epoch lasts eight seconds, sampled at two hundred and fifty-six hertz. Important point: eight seconds is not \"we only record eight seconds of brain activity in total\". In the Morioka paradigm, each trial has an attention period of eight seconds, and usually a control period of four seconds. A full session contains many such trials. So eight seconds is the analysis window per attention trial, defined by the lab task.\n\nThere are sixty-eight EEG channels; sixty-four are used for the Vision Transformer after excluding EOG.\n\nThe paradigm follows Morioka and colleagues, twenty fourteen.");
footer(s, 7);

// =========================================================
// 8 — METHOD (protocol, not failure story)
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Preprocessing and training protocol", "Method");

panel(s, 0.7, 1.5, 5.9, 5.0, WHITE);
s.addShape(pres.shapes.RECTANGLE, {
  x: 0.7, y: 1.5, w: 5.9, h: 0.6, fill: { color: CHAR },
});
s.addText("Preprocessing (aligned with Liz)", {
  x: 0.95, y: 1.6, w: 5.4, h: 0.4, fontFace: HFONT, fontSize: 16,
  bold: true, color: WHITE, margin: 0,
});
s.addText([
  { text: "8-second attention windows, resampled to 256 Hz", options: { bullet: true, breakLine: true } },
  { text: "Average reference", options: { bullet: true, breakLine: true } },
  { text: "Band-pass filtering and 60 Hz notch", options: { bullet: true, breakLine: true } },
  { text: "Baseline correction", options: { bullet: true, breakLine: true } },
  { text: "Full set: 43 subjects", options: { bullet: true, breakLine: true } },
  { text: "", options: { breakLine: true } },
  { text: "Validation with LDA baseline: 55.7%", options: { bold: true } },
], {
  x: 0.95, y: 2.4, w: 5.4, h: 3.8, fontFace: BFONT, fontSize: 15,
  color: INK, margin: 0, paraSpaceAfter: 8,
});

panel(s, 6.85, 1.5, 5.75, 5.0, WHITE);
s.addShape(pres.shapes.RECTANGLE, {
  x: 6.85, y: 1.5, w: 5.75, h: 0.6, fill: { color: ACCENT },
});
s.addText("Fine-tuning (ST-EEGFormer)", {
  x: 7.1, y: 1.6, w: 5.3, h: 0.4, fontFace: HFONT, fontSize: 16,
  bold: true, color: WHITE, margin: 0,
});
s.addText([
  { text: "Pretrained ViT-large backbone", options: { bullet: true, breakLine: true } },
  { text: "layer_decay = 1.0 (full backbone adapts)", options: { bullet: true, breakLine: true } },
  { text: "mix_up = 0.0", options: { bullet: true, breakLine: true } },
  { text: "Learning rate 3×10⁻⁴ · warmup 5 epochs", options: { bullet: true, breakLine: true } },
  { text: "50 training epochs · batch size 4", options: { bullet: true, breakLine: true } },
  { text: "", options: { breakLine: true } },
  { text: "Same recipe used for population and LOSO", options: { bold: true } },
], {
  x: 7.1, y: 2.4, w: 5.3, h: 3.8, fontFace: BFONT, fontSize: 15,
  color: INK, margin: 0, paraSpaceAfter: 8,
});
s.addNotes("This slide presents the method: preprocessing and training protocol.\n\nOn the left, preprocessing, aligned with Liz. We use eight-second attention windows, resampled to two hundred and fifty-six hertz. We apply average reference, band-pass filtering, a sixty-hertz notch filter, and baseline correction, on all forty-three subjects. As a classical check, a simple LDA baseline reaches fifty-five point seven percent on this processed data. That tells us the signal is decodable before we look at the deep model.\n\nOn the right, fine-tuning for ST-EEGFormer. We start from the pretrained Vision Transformer backbone. Layer decay is set to one, so the full backbone can adapt. Mix-up is set to zero. The learning rate is three times ten to the minus four, with five warmup epochs, fifty training epochs, and batch size four. The same recipe is used for the population protocol and for LOSO.");
footer(s, 8);

// =========================================================
// 9 — RESULTS
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Population result — 43 subjects", "Results");

const baseY = 5.95;
const topY = 1.95;
const vMin = 45;
const vMax = 64;
const plotH = baseY - topY;
const val2h = (v) => ((v - vMin) / (vMax - vMin)) * plotH;
const bars = [
  { name: "Chance", val: 50.0, col: BAR_CHANCE },
  { name: "LDA", val: 55.7, col: BAR_LDA },
  { name: "ST-EEGFormer", val: 61.7, col: BAR_OURS, hl: true },
  { name: "LaBraM (Liz)", val: 62.0, col: BAR_LIZ },
];
const bx0 = 1.6;
const bw = 1.7;
const gap = 1.15;
const chY = baseY - val2h(50);
s.addShape(pres.shapes.LINE, {
  x: 1.2, y: chY, w: 11.0, h: 0,
  line: { color: "B0B8C1", width: 1, dashType: "dash" },
});
s.addText("chance 50%", {
  x: 1.25, y: chY - 0.3, w: 1.5, h: 0.25, fontFace: BFONT, fontSize: 10,
  color: MUTED, margin: 0,
});
bars.forEach((b, i) => {
  const x = bx0 + i * (bw + gap);
  const h = val2h(b.val);
  const y = baseY - h;
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w: bw, h, fill: { color: b.col },
  });
  s.addText(b.val.toFixed(1) + "%", {
    x: x - 0.2, y: y - 0.42, w: bw + 0.4, h: 0.35, fontFace: HFONT, fontSize: 16,
    bold: true, color: INK, align: "center", margin: 0,
  });
  s.addText(b.name, {
    x: x - 0.25, y: baseY + 0.1, w: bw + 0.5, h: 0.4, fontFace: BFONT, fontSize: 12,
    bold: !!b.hl, color: b.hl ? ACCENT : MUTED, align: "center", margin: 0,
  });
});
s.addShape(pres.shapes.LINE, {
  x: 1.2, y: baseY, w: 11.0, h: 0, line: { color: LINE, width: 1.25 },
});
s.addText(
  "ST-EEGFormer = 61.66% ≈ 61.7%   ·   comparable to LaBraM (~62%)   ·   above LDA (55.7%) and chance (50%)",
  {
    x: 0.7, y: 6.55, w: 11.9, h: 0.3, fontFace: BFONT, fontSize: 13,
    color: INK, align: "center", margin: 0,
  }
);
s.addNotes("This is the main result slide: the population protocol on forty-three subjects. I will walk through the bars from left to right.\n\nChance is fifty percent.\n\nLDA reaches fifty-five point seven percent. That is the classical baseline after correct preprocessing.\n\nST-EEGFormer reaches sixty-one point seven percent. In the logs, the exact value is sixty-one point six six percent.\n\nLaBraM, from Liz, is about sixty-two percent.\n\nSo the message is simple: on this lab task, with aligned data and preprocessing, ST-EEGFormer is essentially on par with LaBraM, above LDA, and clearly above chance. This is the completed head-to-head result I present today.");
footer(s, 9);

// =========================================================
// 10 — LOSO (next step — no incomplete accuracy)
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Next protocol: leave-one-subject-out (LOSO)", "In progress");

panel(s, 0.7, 1.5, 7.5, 5.0, WHITE);
s.addText("What LOSO evaluates", {
  x: 1.0, y: 1.75, w: 7.0, h: 0.4, fontFace: HFONT, fontSize: 17,
  bold: true, color: INK, margin: 0,
});
s.addText([
  { text: "For each of 43 subjects:", options: { bold: true, breakLine: true } },
  { text: "Train on the other 42 subjects (50 epochs)", options: { bullet: true, breakLine: true } },
  { text: "Finetune on the held-out subject (30 epochs)", options: { bullet: true, breakLine: true } },
  { text: "Evaluate — stricter test of subject transfer", options: { bullet: true, breakLine: true } },
  { text: "", options: { breakLine: true } },
  { text: "Liz (LaBraM, full 43): 61.8 ± 12.4%", options: { breakLine: true } },
  { text: "ST-EEGFormer LOSO: running — full mean when 43/43 done", options: { breakLine: true } },
], {
  x: 1.0, y: 2.3, w: 6.9, h: 3.9, fontFace: BFONT, fontSize: 15,
  color: MUTED, margin: 0, paraSpaceAfter: 6,
});

panel(s, 8.45, 1.5, 4.15, 5.0, CHAR);
s.addText("STATUS", {
  x: 8.75, y: 1.85, w: 3.6, h: 0.3, fontFace: BFONT, fontSize: 12,
  bold: true, color: "A8B0B8", margin: 0,
});
s.addText("Running", {
  x: 8.75, y: 2.3, w: 3.6, h: 0.5, fontFace: HFONT, fontSize: 26,
  bold: true, color: WHITE, margin: 0,
});
s.addText("No final mean yet", {
  x: 8.75, y: 2.95, w: 3.6, h: 0.35, fontFace: BFONT, fontSize: 15,
  color: "C5CCD3", margin: 0,
});
s.addText([
  { text: "Same config as population", options: { breakLine: true } },
  { text: "43 folds (compute-heavy)", options: { breakLine: true } },
  { text: "Main claim today:", options: { breakLine: true } },
  { text: "population 61.7%", options: { bold: true, breakLine: true } },
], {
  x: 8.75, y: 3.55, w: 3.6, h: 2.5, fontFace: BFONT, fontSize: 14,
  color: "B0B8C1", margin: 0, paraSpaceAfter: 8,
});
s.addNotes("This slide presents leave-one-subject-out, or LOSO — the next protocol after population.\n\nWhat does LOSO evaluate? For each of the forty-three subjects, I train on the other forty-two for fifty epochs, then I finetune on the held-out subject for thirty epochs, and then I evaluate. This is a stricter test of subject transfer than population.\n\nLiz already reported LaBraM LOSO on all forty-three subjects: sixty-one point eight plus or minus twelve point four percent.\n\nMy ST-EEGFormer LOSO is still running. I deliberately do not show a partial mean today. A small early subset of folds is not comparable to a full forty-three-fold result, and it would be misleading next to Liz's complete number.\n\nSo the status is: running, no final mean yet. The solid claim for this seminar remains the population comparison at sixty-one point seven percent.");
footer(s, 10);

// =========================================================
// 11 — NEXT STEPS
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Next steps", "Outlook");

const nexts = [
  ["1", "Finish LOSO", "Complete all 43 folds; report mean ± std versus LaBraM (61.8 ± 12.4%)."],
  ["2", "Optional lighter LOSO", "Liz-style freeze-backbone / fewer epochs — fairer wall-clock comparison."],
  ["3", "Reproducible pipeline", "Commit preprocessing, dataset YAML, and the fine-tuning configuration."],
];
nexts.forEach((n, i) => {
  const y = 1.55 + i * 1.6;
  panel(s, 0.7, y, 11.9, 1.45, WHITE);
  s.addText(n[0], {
    x: 1.05, y: y + 0.4, w: 0.6, h: 0.55, fontFace: HFONT, fontSize: 22,
    bold: true, color: ACCENT, margin: 0,
  });
  s.addText(n[1], {
    x: 1.9, y: y + 0.25, w: 10.3, h: 0.4, fontFace: HFONT, fontSize: 18,
    bold: true, color: INK, margin: 0,
  });
  s.addText(n[2], {
    x: 1.9, y: y + 0.75, w: 10.3, h: 0.45, fontFace: BFONT, fontSize: 15,
    color: MUTED, margin: 0,
  });
});
s.addNotes("These are the next steps. There are three items on the slide.\n\nFirst, finish LOSO: complete all forty-three folds, and report the mean and standard deviation versus LaBraM.\n\nSecond, optionally run a lighter Liz-style LOSO, for example with a frozen backbone and fewer epochs, so the compute cost is more comparable.\n\nThird, commit the reproducible pipeline: the preprocessing script, the dataset YAML, and the fine-tuning configuration.\n\nThat closes the scientific part of the talk.");
footer(s, 11);

// =========================================================
// 12 — THANKS + Q&A NOTES (FR)
// =========================================================
s = pres.addSlide();
s.background = { color: CHAR };
s.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: ACCENT },
});
s.addText("Thank you", {
  x: 0.85, y: 1.9, w: 11.5, h: 0.7, fontFace: HFONT, fontSize: 40,
  bold: true, color: WHITE, margin: 0,
});
s.addText("Questions welcome  ·  5 minutes", {
  x: 0.85, y: 2.75, w: 11.5, h: 0.4, fontFace: BFONT, fontSize: 18,
  color: "B0B8C1", margin: 0,
});
panel(s, 0.85, 3.6, 11.6, 2.15, CHAR2);
s.addText("Summary", {
  x: 1.15, y: 3.85, w: 11, h: 0.3, fontFace: BFONT, fontSize: 12,
  bold: true, color: "A8B0B8", margin: 0,
});
s.addText(
  "Population: ST-EEGFormer 61.7% ≈ LaBraM ~62% (above LDA 55.7%). LOSO is the next protocol — full mean when 43 folds are done.",
  {
    x: 1.15, y: 4.3, w: 11, h: 1.1, fontFace: BFONT, fontSize: 16,
    color: "E5E7EB", margin: 0,
  }
);
s.addText("Maxime Lacombe  ·  Ishii Lab  ·  maxime.lacombe@esme.fr", {
  x: 0.85, y: 6.15, w: 11.5, h: 0.35, fontFace: BFONT, fontSize: 13,
  color: "8A939C", margin: 0,
});
s.addNotes("=== À LIRE À VOIX HAUTE (anglais) ===\n\nThank you. Questions are welcome. We have five minutes.\n\nSummary: on the population protocol, ST-EEGFormer reaches sixty-one point seven percent, comparable to LaBraM at about sixty-two percent, and above LDA at fifty-five point seven percent. Leave-one-subject-out is the next step; I will report the full mean when all forty-three folds are complete. I am happy to take questions.\n\n=== AIDE Q&A (français — pour toi) ===\n\nDÉFINITIONS COURTES\n• Population 61.7% ≈ LaBraM ~62% ← résultat principal du talk.\n• LOSO : en cours, pas de mean affiché (évite un N partiel trompeur).\n• Liz LOSO full 43 : 61.8 ± 12.4%.\n• LDA 55.7% · chance 50% · 43 sujets.\n\n★★ POURQUOI 8 SECONDES ? ★★\nQ: Why 8 seconds?\nA: Eight seconds is the attention epoch in each trial of the Morioka lab paradigm — not the total recording length. Each block has Attention ~8 s and Control ~4 s; a session has many trials. We decode that attention window. This is offline evaluation of the lab task, not a low-latency real-time BCI.\n\n★★ POURQUOI PAS DE LOSO FINAL ? ★★\nQ: Why no full LOSO?\nA: LOSO is running. I do not show a final mean because it needs all 43 folds. Each fold retrains a ~300M-parameter model (full backbone) — much heavier than Liz’s lighter LaBraM LOSO+FT. Today’s completed claim is population 61.7%.\n\n★★ AUTRES ★★\nQ: Is population easier? → Different question; completed fair comparison today. LOSO = stricter next step.\nConfig: layer_decay 1.0, mix_up 0, lr 3e-4, 50 ep.\nSi tu bloques → « Good question — that is on the next-step list. »");
footer(s, 12, true);

const outDir = path.join(__dirname, "..", "presentations");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "ST-EEGFormer_internship_seminar.pptx");
const altPath = path.join(outDir, "ST-EEGFormer_internship_seminar_v2.pptx");

pres.writeFile({ fileName: outPath }).then((f) => {
  console.log("WROTE " + f);
}).catch((err) => {
  console.warn("Primary write failed (" + err.code + "), writing alt...");
  return pres.writeFile({ fileName: altPath }).then((f) => console.log("WROTE " + f));
});
