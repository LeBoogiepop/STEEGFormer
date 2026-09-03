/**
 * build_meeting_0813.js — One-slide brief for the 2026-08-13 Zoom meeting
 * (EEG-FM x Calcium-imaging-FM, Ishii Lab).
 *
 * Academic charcoal/navy. Output: presentations/ST-EEGFormer_meeting_2026-08-13.pptx
 * Run:  node pptx_build/build_meeting_0813.js
 *
 * EDIT ME before the meeting: set LOSO_DONE to the current COMPLETED count.
 */

const pptxgen = require("pptxgenjs");
const path = require("path");

// ---- EDIT THIS the day of the meeting (squeue + count COMPLETED) ----
const LOSO_DONE = "13"; // number of subjects finished, out of 43
// ---------------------------------------------------------------------

const INK = "1F2733";     // charcoal
const NAVY = "1F3A5F";    // academic navy
const ACCENT = "2E6F9E";  // muted blue
const GREY = "5C6672";
const LIGHT = "EEF2F6";   // panel fill
const LINE = "C9D3DC";
const WHITE = "FFFFFF";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "Maxime Lacombe";
pres.title = "ST-EEGFormer x Calcium-imaging FMs — 2026-08-13";

const s = pres.addSlide();
s.background = { color: WHITE };

// ---- Title band ----
s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 1.15, fill: { color: INK } });
s.addText("ST-EEGFormer & Calcium-imaging Foundation Models", {
  x: 0.5, y: 0.14, w: 12.3, h: 0.5, fontFace: "Georgia", fontSize: 24, bold: true, color: WHITE,
});
s.addText("Tokenization: raw time series vs discrete VQ  ·  EEG ↔ Ca²⁺  ·  13 Aug 2026", {
  x: 0.5, y: 0.66, w: 12.3, h: 0.35, fontFace: "Calibri", fontSize: 13, color: "C7D2DD",
});

// ---- Status chips ----
const chips = [
  ["Population", "61.7%  ≈  LaBraM (~62%)"],
  ["LOSO", LOSO_DONE + " / 43 folds — running"],
  ["LOSO mean", "not reported yet (wait 43/43)"],
];
chips.forEach((c, i) => {
  const x = 0.5 + i * 4.15;
  s.addShape(pres.ShapeType.roundRect, { x, y: 1.35, w: 3.95, h: 0.82, rectRadius: 0.08,
    fill: { color: LIGHT }, line: { color: LINE, width: 1 } });
  s.addText(c[0].toUpperCase(), { x: x + 0.18, y: 1.44, w: 3.6, h: 0.28, fontFace: "Calibri",
    fontSize: 10, bold: true, color: ACCENT, charSpacing: 1 });
  s.addText(c[1], { x: x + 0.18, y: 1.70, w: 3.6, h: 0.4, fontFace: "Calibri", fontSize: 13,
    bold: true, color: INK });
});

// ---- Comparison table ----
const header = [
  { text: "Model", options: { fill: { color: NAVY }, color: WHITE, bold: true } },
  { text: "Tokenization", options: { fill: { color: NAVY }, color: WHITE, bold: true } },
  { text: "Pretraining", options: { fill: { color: NAVY }, color: WHITE, bold: true } },
  { text: "Family", options: { fill: { color: NAVY }, color: WHITE, bold: true } },
];
const rows = [
  ["ST-EEGFormer (EEG)", "Continuous patch\n(Unfold + Linear) — no codebook", "MAE — reconstruct raw patches", "= CAPT (raw)"],
  ["LaBraM (EEG)", "Discrete neural tokenizer\n(VQ codebook)", "Masked token prediction", "= CalM (VQ)"],
  ["CalM (Ca²⁺)", "Discrete VQ tokens", "Autoregressive (cross-entropy)", "discrete"],
  ["CAPT (Ca²⁺)", "Continuous patch tokenization", "Autoregressive (MSE, end-to-end)", "continuous — beats CalM"],
];
const body = rows.map((r, ri) =>
  r.map((cell, ci) => ({
    text: cell,
    options: {
      fill: { color: ri % 2 === 0 ? WHITE : LIGHT },
      color: ci === 0 ? NAVY : INK,
      bold: ci === 0,
      align: "left",
      valign: "middle",
      fontSize: 11.5,
    },
  }))
);
s.addTable([header, ...body], {
  x: 0.5, y: 2.45, w: 12.33, colW: [2.7, 4.0, 3.6, 2.03],
  rowH: [0.4, 0.72, 0.72, 0.55, 0.55],
  border: { type: "solid", color: LINE, pt: 1 },
  fontFace: "Calibri", fontSize: 11.5, valign: "middle", margin: 5,
});

// ---- Takeaway box ----
s.addShape(pres.ShapeType.rect, { x: 0.5, y: 5.95, w: 12.33, h: 1.28, fill: { color: "FBF7EC" },
  line: { color: "E4D9B8", width: 1 } });
s.addText([
  { text: "Key point:  ", options: { bold: true, color: NAVY } },
  { text: "ST-EEGFormer already works on the raw time series (no discrete tokenizer) — it is the CAPT-style model; LaBraM is the CalM-style (VQ) model. ", options: { color: INK } },
  { text: "So the CALM/CAPT lesson for EEG is not \u201Cremove tokenization\u201D (already done) — it\u2019s the self-supervised / identity-invariance idea (Miyamoto: drop neuron ID \u2192 ~1/3 params, more transferable).", options: { color: INK } },
], { x: 0.72, y: 6.05, w: 11.9, h: 0.7, fontFace: "Calibri", fontSize: 12.5, lineSpacingMultiple: 1.02 });
s.addText([
  { text: "Next:  ", options: { bold: true, color: NAVY } },
  { text: "finish LOSO (mean \u00B1 std) · pretrained vs from-scratch backbone · test an EEG channel-identity-invariance / augmentation idea.", options: { color: GREY } },
], { x: 0.72, y: 6.72, w: 11.9, h: 0.4, fontFace: "Calibri", fontSize: 11.5, italic: true });

const out = path.join(__dirname, "..", "presentations", "ST-EEGFormer_meeting_2026-08-13.pptx");
pres.writeFile({ fileName: out }).then((f) => console.log("Wrote:", f));
