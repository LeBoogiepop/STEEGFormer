const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "Maxime Lacombe";
pres.title = "ST-EEGFormer — Spatial Attention";

// ---- palette (EEG / neuro : navy + teal + mint) ----
const NAVY = "0B1F3A";
const NAVY2 = "0E2A4D";
const BLUE = "0E5A8A";
const TEAL = "1C7293";
const MINT = "2EC4B6";
const CYAN = "22D3EE";
const BG = "F4F7FA";
const WHITE = "FFFFFF";
const INK = "1E293B";
const MUTED = "64748B";
const GRAY = "94A3B8";

const HFONT = "Trebuchet MS";
const BFONT = "Calibri";

const W = 13.33;
const H = 7.5;

const makeShadow = () => ({ type: "outer", color: "0B1F3A", blur: 8, offset: 3, angle: 135, opacity: 0.18 });

function footer(slide, num) {
  slide.addText("ST-EEGFormer · Spatial attention · Ishii Lab", {
    x: 0.6, y: 7.02, w: 8, h: 0.3, fontFace: BFONT, fontSize: 9, color: MUTED, align: "left", margin: 0,
  });
  slide.addText(String(num), {
    x: 12.4, y: 7.02, w: 0.4, h: 0.3, fontFace: BFONT, fontSize: 9, color: MUTED, align: "right", margin: 0,
  });
}

function header(slide, title, kicker) {
  // mint dot motif
  slide.addShape(pres.shapes.OVAL, { x: 0.62, y: 0.62, w: 0.22, h: 0.22, fill: { color: MINT } });
  if (kicker) {
    slide.addText(kicker.toUpperCase(), {
      x: 0.95, y: 0.5, w: 11, h: 0.3, fontFace: BFONT, fontSize: 12, color: TEAL, bold: true, charSpacing: 2, margin: 0,
    });
    slide.addText(title, {
      x: 0.92, y: 0.78, w: 11.7, h: 0.7, fontFace: HFONT, fontSize: 30, color: INK, bold: true, margin: 0,
    });
  } else {
    slide.addText(title, {
      x: 0.92, y: 0.55, w: 11.7, h: 0.8, fontFace: HFONT, fontSize: 32, color: INK, bold: true, margin: 0,
    });
  }
}

function card(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.08, fill: { color: fill || WHITE }, line: { color: "E2E8F0", width: 1 }, shadow: makeShadow(),
  });
}

// =========================================================
// SLIDE 1 — TITLE
// =========================================================
let s = pres.addSlide();
s.background = { color: NAVY };
// decorative electrode dots (top right)
const dotY = 0.7;
for (let i = 0; i < 6; i++) {
  s.addShape(pres.shapes.OVAL, { x: 9.9 + i * 0.55, y: dotY, w: 0.28, h: 0.28, fill: { color: i === 3 ? MINT : NAVY2 }, line: { color: TEAL, width: 1 } });
}
// EEG wave motif (bottom)
s.addShape(pres.shapes.LINE, { x: 0, y: 6.35, w: 13.33, h: 0, line: { color: NAVY2, width: 1 } });
s.addText("ISHII LAB · KYOTO / ATR", {
  x: 0.9, y: 1.7, w: 10, h: 0.4, fontFace: BFONT, fontSize: 14, color: MINT, bold: true, charSpacing: 3, margin: 0,
});
s.addText("ST-EEGFormer on the\nSpatial Attention Task", {
  x: 0.85, y: 2.15, w: 11.6, h: 1.9, fontFace: HFONT, fontSize: 46, color: WHITE, bold: true, lineSpacingMultiple: 1.0, margin: 0,
});
s.addText("Fixing the pipeline to reproduce the G.2 benchmark on the ATR lab dataset — and comparing with LaBraM", {
  x: 0.9, y: 4.15, w: 11.2, h: 0.8, fontFace: BFONT, fontSize: 18, color: "CBD5E1", margin: 0,
});
s.addText([
  { text: "Maxime Lacombe", options: { bold: true, color: WHITE } },
  { text: "   ·   EEG foundation models   ·   July 2026", options: { color: GRAY } },
], { x: 0.9, y: 5.5, w: 11, h: 0.4, fontFace: BFONT, fontSize: 14, margin: 0 });
s.addNotes("Hi everyone. Today I'll present my work applying ST-EEGFormer, an EEG foundation model, to the spatial attention task on our lab dataset. The short version: my first runs were stuck at chance level. I traced the problem to the data and training pipeline, fixed it, and ST-EEGFormer now matches LaBraM. Let me walk you through how I got there.");

// =========================================================
// SLIDE 2 — MODEL & CONTEXT
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "The model: ST-EEGFormer", "Context");

// left text
s.addText([
  { text: "An EEG foundation model", options: { bold: true, color: INK, breakLine: true, fontSize: 17 } },
  { text: "Vision-Transformer backbone, pre-trained on large amounts of EEG, then fine-tuned for a specific decoding task.", options: { color: MUTED, breakLine: true, fontSize: 14 } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "The question (Yang et al., 2026):", options: { bold: true, color: INK, breakLine: true, fontSize: 15 } },
  { text: "\u201CAre EEG foundation models worth it?\u201D — do they beat simple decoders on real BCI tasks?", options: { color: MUTED, fontSize: 14 } },
], { x: 0.95, y: 1.9, w: 6.4, h: 3.5, valign: "top", margin: 0, paraSpaceAfter: 8 });

// right: stat cards
card(s, 7.8, 1.95, 4.9, 1.55);
s.addText("302M", { x: 7.8, y: 2.1, w: 4.9, h: 0.75, fontFace: HFONT, fontSize: 40, color: BLUE, bold: true, align: "center", margin: 0 });
s.addText("trainable parameters (ViT-large)", { x: 7.8, y: 2.85, w: 4.9, h: 0.5, fontFace: BFONT, fontSize: 13, color: MUTED, align: "center", margin: 0 });

card(s, 7.8, 3.7, 2.35, 1.6);
s.addText("Compared to", { x: 7.8, y: 3.85, w: 2.35, h: 0.35, fontFace: BFONT, fontSize: 12, color: MUTED, align: "center", margin: 0 });
s.addText("LaBraM", { x: 7.8, y: 4.2, w: 2.35, h: 0.6, fontFace: HFONT, fontSize: 24, color: TEAL, bold: true, align: "center", margin: 0 });
s.addText("(Liz — parallel track)", { x: 7.8, y: 4.8, w: 2.35, h: 0.35, fontFace: BFONT, fontSize: 11, color: MUTED, align: "center", margin: 0 });

card(s, 10.35, 3.7, 2.35, 1.6);
s.addText("Baseline", { x: 10.35, y: 3.85, w: 2.35, h: 0.35, fontFace: BFONT, fontSize: 12, color: MUTED, align: "center", margin: 0 });
s.addText("LDA", { x: 10.35, y: 4.2, w: 2.35, h: 0.6, fontFace: HFONT, fontSize: 24, color: MINT, bold: true, align: "center", margin: 0 });
s.addText("simple linear decoder", { x: 10.35, y: 4.8, w: 2.35, h: 0.35, fontFace: BFONT, fontSize: 11, color: MUTED, align: "center", margin: 0 });
s.addNotes("ST-EEGFormer is an EEG foundation model with a Vision-Transformer backbone, about 300 million parameters. It's pre-trained on large amounts of EEG, then fine-tuned for a specific task. This fits the benchmark from the paper 'Are EEG foundation models worth it?' by Yang et al. My job was the ST-EEGFormer side; Liz worked on LaBraM in parallel, so we can compare the two. I also use a simple LDA as a sanity-check baseline.");
footer(s, 2);

// =========================================================
// SLIDE 3 — THE TASK
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "The spatial attention task", "Dataset");

s.addText([
  { text: "Covert attention: left vs right", options: { bold: true, color: INK, breakLine: true, fontSize: 17 } },
  { text: "Subjects attend to the left or right side while EEG is recorded. The model must decode which side from the brain signal.", options: { color: MUTED, breakLine: true, fontSize: 14 } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "ATR NBP dataset (Morioka et al., 2014).", options: { italic: true, color: MUTED, fontSize: 13 } },
], { x: 0.95, y: 1.95, w: 6.2, h: 2.6, valign: "top", margin: 0, paraSpaceAfter: 8 });

// three stat callouts on the right
const stat = (x, big, small, col) => {
  card(s, x, 2.0, 1.85, 1.5);
  s.addText(big, { x: x, y: 2.12, w: 1.85, h: 0.7, fontFace: HFONT, fontSize: 30, color: col, bold: true, align: "center", margin: 0 });
  s.addText(small, { x: x + 0.1, y: 2.82, w: 1.65, h: 0.55, fontFace: BFONT, fontSize: 11, color: MUTED, align: "center", margin: 0 });
};
stat(7.35, "43", "subjects", BLUE);
stat(9.35, "2", "classes (chance 50%)", TEAL);
stat(11.35, "8 s", "attention window", MINT);

// structure strip
card(s, 0.95, 4.85, 11.75, 1.55, NAVY);
s.addText("EXPERIMENT STRUCTURE", { x: 1.2, y: 5.0, w: 11, h: 0.3, fontFace: BFONT, fontSize: 11, color: MINT, bold: true, charSpacing: 2, margin: 0 });
s.addText([
  { text: "8 sessions", options: { bold: true, color: WHITE } },
  { text: "  per subject   →   ", options: { color: GRAY } },
  { text: "24 blocks", options: { bold: true, color: WHITE } },
  { text: "  per session   →   each block:  ", options: { color: GRAY } },
  { text: "8 s attention", options: { bold: true, color: CYAN } },
  { text: "  +  ", options: { color: GRAY } },
  { text: "4 s control (baseline)", options: { bold: true, color: WHITE } },
], { x: 1.2, y: 5.4, w: 11.3, h: 0.6, fontFace: BFONT, fontSize: 16, valign: "middle", margin: 0 });
s.addNotes("The task is covert spatial attention: subjects attend either to the left or to the right while we record EEG, and the model must decode which side. It's a 2-class problem, so chance is 50 percent. The dataset has 43 subjects, each with 8 sessions of 24 blocks, and every block has an 8-second attention period plus a control period we use as baseline. This is the ATR NBP dataset from Morioka and colleagues, 2014.");
footer(s, 3);

// =========================================================
// SLIDE 4 — THE PROBLEM
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Starting point: everything at chance", "The problem");

s.addText("First runs stayed at chance level everywhere — even a simple LDA. The signal seemed absent, but the cause was in the pipeline, not the data.", {
  x: 0.95, y: 1.75, w: 11.6, h: 0.7, fontFace: BFONT, fontSize: 15, color: MUTED, margin: 0,
});

const probRows = [
  ["Setup", "Result", "Chance", ""],
  ["BCI-IV-2a (population / LOO)", "~25–26%", "25%", "chance"],
  ["Spatial attention — LOO", "49.5%", "50%", "chance"],
  ["Spatial attention — per-subject", "50.4%", "50%", "chance"],
  ["Simple LDA baseline", "51.0%", "50%", "chance"],
];
const tRows = probRows.map((r, i) => {
  if (i === 0) {
    return r.slice(0,3).map(t => ({ text: t, options: { bold: true, color: WHITE, fill: { color: TEAL }, fontSize: 14, align: "left" } }));
  }
  return [
    { text: r[0], options: { color: INK, fontSize: 14 } },
    { text: r[1], options: { color: "B91C1C", bold: true, fontSize: 14, align: "center" } },
    { text: r[2], options: { color: MUTED, fontSize: 14, align: "center" } },
  ];
});
s.addTable(tRows, {
  x: 0.95, y: 2.65, w: 8.2, colW: [4.6, 1.8, 1.8], rowH: 0.55,
  border: { pt: 1, color: "E2E8F0" }, fill: { color: WHITE }, valign: "middle", margin: [2, 6, 2, 6],
});

// right callout
card(s, 9.55, 2.65, 3.15, 2.75, NAVY);
s.addText("Not learning", { x: 9.65, y: 3.05, w: 2.95, h: 0.5, fontFace: HFONT, fontSize: 22, color: MINT, bold: true, align: "center", margin: 0 });
s.addText("Same story across datasets and protocols. A big model failing everywhere pointed to a systematic pipeline issue.", {
  x: 9.8, y: 3.6, w: 2.65, h: 1.7, fontFace: BFONT, fontSize: 13, color: "CBD5E1", align: "center", valign: "top", margin: 0,
});
s.addNotes("Here's where I started, and it wasn't pretty. Everything was at chance: BCI at 25 percent, spatial attention around 50 percent for every protocol, and crucially even a simple LDA was at chance. When a huge model AND a simple baseline both fail, it's a strong signal the problem is in the pipeline, not in the model or the data itself. So I stopped tuning the model and started auditing the pipeline.");
footer(s, 4);

// =========================================================
// SLIDE 5 — FIX 1: PREPROCESSING
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Fix 1 — Preprocessing the EEG", "Diagnosis");

s.addText("Comparing with Liz's working LaBraM pipeline revealed the conversion was skipping every cleaning step and using only 2 s of the 8 s window.", {
  x: 0.95, y: 1.75, w: 11.6, h: 0.65, fontFace: BFONT, fontSize: 15, color: MUTED, margin: 0,
});

const fixRows = [
  [{ text: "Step", options: { bold: true, color: WHITE, fill: { color: TEAL } } }, { text: "Before (chance)", options: { bold: true, color: WHITE, fill: { color: TEAL } } }, { text: "Corrected", options: { bold: true, color: WHITE, fill: { color: TEAL } } }],
  ["Epoch window", { text: "2 s", options: { color: "B91C1C", bold: true } }, { text: "8 s (full attention)", options: { color: "15803D", bold: true } }],
  ["Band-pass filter", { text: "none", options: { color: "B91C1C", bold: true } }, "0.1–75 Hz + 60 Hz notch"],
  ["Reference", { text: "none", options: { color: "B91C1C", bold: true } }, "average reference"],
  ["Baseline", { text: "none", options: { color: "B91C1C", bold: true } }, "control-period mean"],
  ["Sampling rate", { text: "mixed 256/512", options: { color: "B91C1C", bold: true } }, "resampled to 256 Hz"],
];
s.addTable(fixRows, {
  x: 0.95, y: 2.55, w: 7.7, colW: [2.5, 2.4, 2.8], rowH: 0.5,
  border: { pt: 1, color: "E2E8F0" }, fill: { color: WHITE }, fontFace: BFONT, fontSize: 13, valign: "middle", margin: [2, 6, 2, 6], color: INK,
});

// result callout on right
card(s, 9.05, 2.55, 3.65, 3.05, WHITE);
s.addShape(pres.shapes.RECTANGLE, { x: 9.05, y: 2.55, w: 0.12, h: 3.05, fill: { color: MINT } });
s.addText("LDA sanity check", { x: 9.35, y: 2.75, w: 3.2, h: 0.4, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
s.addText([
  { text: "51%", options: { color: GRAY, fontSize: 30, bold: true } },
  { text: "  →  ", options: { color: MUTED, fontSize: 22 } },
  { text: "55.7%", options: { color: MINT, fontSize: 40, bold: true } },
], { x: 9.35, y: 3.2, w: 3.2, h: 0.9, fontFace: HFONT, valign: "middle", margin: 0 });
s.addText("Up to 71% on the best subjects — the left/right signal is back.", {
  x: 9.35, y: 4.25, w: 3.15, h: 1.1, fontFace: BFONT, fontSize: 14, color: INK, valign: "top", margin: 0,
});
s.addNotes("The first fix was preprocessing. Comparing with Liz's working LaBraM pipeline, I found my conversion was skipping every cleaning step: no filtering, no reference, no baseline. And it was using only 2 seconds of the 8-second window, with inconsistent sampling rates across files. After fixing all of that, the LDA jumped from 51 to 55.7 percent, and up to 71 percent on the best subjects. So the left-versus-right signal was there all along, we just weren't extracting it.");
footer(s, 5);

// =========================================================
// SLIDE 6 — FIX 2: TRAINING CONFIG
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Fix 2 — Fine-tuning configuration", "Diagnosis");

s.addText("With clean data the LDA worked, but ST-EEGFormer still could not even fit its training set. The default fine-tuning settings were throttling the model.", {
  x: 0.95, y: 1.75, w: 11.6, h: 0.7, fontFace: BFONT, fontSize: 15, color: MUTED, margin: 0,
});

const cfg = [
  ["Layer-wise LR decay", "0.75 — backbone barely moves", "1.0 — whole model adapts"],
  ["Mixup", "0.9 — blends L/R, kills 2-class signal", "0.0 — clean targets"],
  ["Warmup", "10 / 30 epochs", "5 / 50 epochs"],
];
let cy = 2.65;
cfg.forEach((r) => {
  card(s, 0.95, cy, 11.75, 1.05, WHITE);
  s.addText(r[0], { x: 1.2, y: cy, w: 3.3, h: 1.05, fontFace: HFONT, fontSize: 16, color: INK, bold: true, valign: "middle", margin: 0 });
  s.addText([{ text: "Before   ", options: { color: MUTED, fontSize: 11, bold: true } }, { text: r[1], options: { color: "B91C1C", fontSize: 13 } }], { x: 4.5, y: cy + 0.12, w: 4.0, h: 0.8, valign: "middle", fontFace: BFONT, margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 8.6, y: cy + 0.2, w: 0, h: 0.65, line: { color: "E2E8F0", width: 1 } });
  s.addText([{ text: "Fixed   ", options: { color: TEAL, fontSize: 11, bold: true } }, { text: r[2], options: { color: "15803D", fontSize: 13, bold: true } }], { x: 8.9, y: cy + 0.12, w: 3.6, h: 0.8, valign: "middle", fontFace: BFONT, margin: 0 });
  cy += 1.2;
});
s.addText("Result: the model finally learns (see next slide).", { x: 0.95, y: 6.35, w: 11, h: 0.4, fontFace: BFONT, fontSize: 14, italic: true, color: TEAL, margin: 0 });
s.addNotes("But even with clean data, ST-EEGFormer still couldn't learn. It couldn't even fit its own training set. The default fine-tuning settings were the culprit. Layer-wise learning-rate decay of 0.75 basically froze the backbone, and mixup at 0.9 was blending left and right trials together, which destroys the signal on a 2-class task. I set layer decay to 1.0 so the whole model adapts, turned mixup off for clean targets, and shortened the warmup.");
footer(s, 6);

// =========================================================
// SLIDE 7 — RESULTS (manual bars)
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "Result — Population (43 subjects)", "Payoff");

// plot area manual bars
const baseY = 6.15;      // baseline (bottom of bars)
const topY = 2.35;       // top of plot
const vMin = 45, vMax = 64;
const plotH = baseY - topY;
const val2h = (v) => (v - vMin) / (vMax - vMin) * plotH;

const bars = [
  { name: "Chance", val: 50.0, col: GRAY },
  { name: "LDA", val: 55.7, col: TEAL },
  { name: "ST-EEGFormer", val: 61.66, col: MINT, hl: true },
  { name: "LaBraM (Liz)", val: 62.0, col: BLUE },
];
const bx0 = 1.6, bw = 1.7, gap = 1.15;
// chance dashed reference line
const chY = baseY - val2h(50);
s.addShape(pres.shapes.LINE, { x: 1.2, y: chY, w: 11.2, h: 0, line: { color: GRAY, width: 1, dashType: "dash" } });
s.addText("chance 50%", { x: 1.25, y: chY - 0.34, w: 1.6, h: 0.25, fontFace: BFONT, fontSize: 10, color: MUTED, align: "left", margin: 0 });

bars.forEach((b, i) => {
  const x = bx0 + i * (bw + gap);
  const h = val2h(b.val);
  const y = baseY - h;
  if (b.hl) {
    s.addShape(pres.shapes.RECTANGLE, { x: x - 0.12, y: y - 0.12, w: bw + 0.24, h: h + 0.12, fill: { color: "D1FAE5" } });
  }
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: bw, h, fill: { color: b.col }, shadow: makeShadow() });
  s.addText(b.val.toFixed(b.val % 1 === 0 ? 0 : 1) + "%", { x: x - 0.3, y: y - 0.5, w: bw + 0.6, h: 0.45, fontFace: HFONT, fontSize: 18, bold: true, color: b.hl ? "0F766E" : INK, align: "center", margin: 0 });
  s.addText(b.name, { x: x - 0.35, y: baseY + 0.1, w: bw + 0.7, h: 0.6, fontFace: BFONT, fontSize: 13, bold: b.hl, color: b.hl ? "0F766E" : MUTED, align: "center", margin: 0 });
});
// baseline
s.addShape(pres.shapes.LINE, { x: 1.2, y: baseY, w: 11.2, h: 0, line: { color: "CBD5E1", width: 1.5 } });

s.addText([
  { text: "ST-EEGFormer reaches ", options: { color: INK } },
  { text: "61.7%", options: { color: "0F766E", bold: true } },
  { text: " — on par with LaBraM, well above chance and the LDA baseline.", options: { color: INK } },
], { x: 0.95, y: 6.85, w: 11.7, h: 0.4, fontFace: BFONT, fontSize: 14, align: "center", margin: 0 });
s.addNotes("And this is the payoff. On the population protocol with all 43 subjects, ST-EEGFormer reaches 61.7 percent. That's essentially tied with LaBraM at 62 percent, and clearly above both chance at 50 and the LDA baseline at 55.7. So once the pipeline is correct, the foundation model does deliver on this task, on par with LaBraM.");
footer(s, 7);

// =========================================================
// SLIDE 8 — TRAINING CURVE
// =========================================================
s = pres.addSlide();
s.background = { color: BG };
header(s, "The model learns once unblocked", "Training dynamics");

s.addChart(pres.charts.LINE, [{
  name: "Test accuracy",
  labels: ["0", "5", "10", "15", "20", "25", "30", "35", "40", "45", "49"],
  values: [48.5, 50.0, 50.0, 49.5, 50.0, 50.0, 58.4, 56.9, 61.5, 60.8, 61.7],
}], {
  x: 0.95, y: 1.95, w: 8.5, h: 4.6,
  chartColors: [MINT], lineSize: 3.5, lineSmooth: true,
  chartArea: { fill: { color: WHITE } },
  catAxisLabelColor: MUTED, valAxisLabelColor: MUTED,
  catAxisTitle: "epoch", showCatAxisTitle: true, catAxisTitleColor: MUTED,
  valAxisMinVal: 45, valAxisMaxVal: 65, valAxisMajorUnit: 5,
  valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" },
  showLegend: false, showTitle: false,
  lineDataSymbol: "circle", lineDataSymbolSize: 7,
});

// side annotations
card(s, 9.75, 1.95, 2.95, 2.15, WHITE);
s.addShape(pres.shapes.RECTANGLE, { x: 9.75, y: 1.95, w: 0.12, h: 2.15, fill: { color: GRAY } });
s.addText("Epochs 0–25", { x: 10.0, y: 2.15, w: 2.6, h: 0.4, fontFace: HFONT, fontSize: 16, bold: true, color: INK, margin: 0 });
s.addText("Flat at ~50% during warmup — looks stuck, but it is ramping up.", { x: 10.0, y: 2.6, w: 2.55, h: 1.4, fontFace: BFONT, fontSize: 13, color: MUTED, valign: "top", margin: 0 });

card(s, 9.75, 4.4, 2.95, 2.15, NAVY);
s.addShape(pres.shapes.RECTANGLE, { x: 9.75, y: 4.4, w: 0.12, h: 2.15, fill: { color: MINT } });
s.addText("Epochs 30–49", { x: 10.0, y: 4.6, w: 2.6, h: 0.4, fontFace: HFONT, fontSize: 16, bold: true, color: WHITE, margin: 0 });
s.addText("Test accuracy climbs to 61.7% and plateaus. Train reaches 70%.", { x: 10.0, y: 5.05, w: 2.55, h: 1.4, fontFace: BFONT, fontSize: 13, color: "CBD5E1", valign: "top", margin: 0 });
s.addNotes("This training curve tells the story. For the first 25 epochs it sits at 50 percent. During warmup it looks completely stuck, which is exactly what fooled me in the earlier runs. Then it takes off, climbing to about 62 percent and plateauing, with training accuracy reaching 70 percent. So the model was learnable all along, it just needed the right configuration to start moving.");
footer(s, 8);

// =========================================================
// SLIDE 9 — CONCLUSION
// =========================================================
s = pres.addSlide();
s.background = { color: NAVY };
s.addShape(pres.shapes.OVAL, { x: 0.62, y: 0.62, w: 0.22, h: 0.22, fill: { color: MINT } });
s.addText("TAKEAWAYS", { x: 0.95, y: 0.5, w: 11, h: 0.3, fontFace: BFONT, fontSize: 12, color: MINT, bold: true, charSpacing: 2, margin: 0 });
s.addText("What we learned & what's next", { x: 0.92, y: 0.78, w: 11.7, h: 0.7, fontFace: HFONT, fontSize: 30, color: WHITE, bold: true, margin: 0 });

const takeaways = [
  ["01", "Preprocessing was the hidden bug", "Filtering, reference, baseline and an 8 s window — a simple LDA proves the signal is there (55.7%)."],
  ["02", "Fine-tuning config unblocked the model", "Removing layer-decay + mixup let ST-EEGFormer actually fit and learn the task."],
  ["03", "ST-EEGFormer ≈ LaBraM on lab data", "61.7% population accuracy, on par with LaBraM (62%) and far above chance (50%)."],
];
let ty = 1.85;
takeaways.forEach((t) => {
  s.addShape(pres.shapes.OVAL, { x: 0.95, y: ty, w: 0.85, h: 0.85, fill: { color: NAVY2 }, line: { color: MINT, width: 1.5 } });
  s.addText(t[0], { x: 0.95, y: ty, w: 0.85, h: 0.85, fontFace: HFONT, fontSize: 20, bold: true, color: MINT, align: "center", valign: "middle", margin: 0 });
  s.addText(t[1], { x: 2.05, y: ty + 0.02, w: 7.2, h: 0.5, fontFace: HFONT, fontSize: 18, bold: true, color: WHITE, valign: "middle", margin: 0 });
  s.addText(t[2], { x: 2.05, y: ty + 0.48, w: 7.3, h: 0.55, fontFace: BFONT, fontSize: 13, color: "CBD5E1", valign: "top", margin: 0 });
  ty += 1.18;
});

// next steps card
card(s, 9.65, 1.85, 3.05, 3.55, NAVY2);
s.addText("NEXT STEPS", { x: 9.9, y: 2.05, w: 2.7, h: 0.3, fontFace: BFONT, fontSize: 12, color: MINT, bold: true, charSpacing: 2, margin: 0 });
s.addText([
  { text: "LOSO protocol (leave-one-subject-out)", options: { color: WHITE, bullet: true, breakLine: true } },
  { text: "Per-subject fine-tuning", options: { color: WHITE, bullet: true, breakLine: true } },
  { text: "Commit reproducible pipeline", options: { color: WHITE, bullet: true, breakLine: true } },
  { text: "Full ST-EEGFormer vs LaBraM table", options: { color: WHITE, bullet: true } },
], { x: 9.9, y: 2.5, w: 2.65, h: 2.8, fontFace: BFONT, fontSize: 13.5, valign: "top", paraSpaceAfter: 10, margin: 0 });

s.addText("Maxime Lacombe · Ishii Lab · July 2026", { x: 0.95, y: 6.9, w: 11, h: 0.35, fontFace: BFONT, fontSize: 11, color: GRAY, margin: 0 });
s.addNotes("To wrap up: the preprocessing was the hidden bug, the fine-tuning configuration is what unblocked learning, and the result is that ST-EEGFormer is on par with LaBraM on our data. For next steps, the natural one is the leave-one-subject-out protocol for cross-subject generalization. I want to flag that this is a heavy compute job for this model, so I'd like to plan it with you, possibly a reduced version. Plus per-subject fine-tuning and committing the reproducible pipeline. Happy to take questions.");

pres.writeFile({ fileName: "ST-EEGFormer_spatial_attention.pptx" }).then((f) => console.log("WROTE " + f));
