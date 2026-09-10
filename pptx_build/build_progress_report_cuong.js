/**
 * 2–3 page progress report for Cuong (Sept 2026).
 * Run: node pptx_build/build_progress_report_cuong.js
 */
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, PageNumber, VerticalAlign } = require("docx");
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "presentations");
const outPath = path.join(outDir, "progress_report_cuong_2026-09.docx");

const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = 1134;
const CONTENT_W = PAGE_W - 2 * MARGIN; // 9638

const ink = "1F2933";
const muted = "52606D";
const line = "CBD2D9";
const headBg = "E4E7EB";

const border = { style: BorderStyle.SINGLE, size: 4, color: line };
const borders = { top: border, bottom: border, left: border, right: border };

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 160, line: 276 },
    alignment: opts.align,
    children: [new TextRun({ text, font: "Calibri", size: opts.size ?? 22, color: opts.color ?? ink, italics: opts.italics, bold: opts.bold })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "9FB3C8", space: 4 } },
    children: [new TextRun({ text, font: "Calibri", size: 26, bold: true, color: ink })],
  });
}

function cell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new Paragraph({
      alignment: opts.align,
      children: [new TextRun({ text, font: "Calibri", size: 18, bold: !!opts.bold, color: ink })],
    })],
  });
}

function table(headers, rows, colWidths) {
  const head = new TableRow({
    children: headers.map((h, i) => cell(h, colWidths[i], { fill: headBg, bold: true, align: i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT })),
  });
  const body = rows.map((r) => new TableRow({
    children: r.map((c, i) => cell(c, colWidths[i], { align: i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT, bold: optsBold(c) })),
  }));
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [head, ...body],
  });
}

function optsBold(c) {
  return typeof c === "string" && c.includes("61.7") || (typeof c === "string" && c.startsWith("53.55"));
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22, color: ink } } },
    paragraphStyles: [
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Calibri", color: ink },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: PAGE_H },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: line, space: 6 } },
          spacing: { after: 120 },
          children: [
            new TextRun({ text: "Ishii Laboratory  ·  intern progress note", font: "Calibri", size: 16, color: muted }),
            new TextRun({ text: "    3 September 2026", font: "Calibri", size: 16, color: muted }),
          ],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: line, space: 8 } },
          children: [
            new TextRun({ text: "Maxime Lacombe  ·  ST-EEGFormer  ·  p. ", font: "Calibri", size: 16, color: muted }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: muted }),
          ],
        })],
      }),
    },
    children: [
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: "Progress report", font: "Calibri", size: 36, bold: true, color: ink })],
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: "ST-EEGFormer on the lab spatial-attention dataset", font: "Calibri", size: 28, color: ink })],
      }),
      p("Maxime Lacombe  ·  for Tien Cuong PHI (copy: Shin Ishii)", { size: 20, color: muted, after: 240 }),

      h2("1. What I set out to do"),
      p("The target is the lab covert spatial-attention dataset (Morioka et al., 2014): left versus right, 43 subjects, 8 s windows at 256 Hz. Chance is 50%. I evaluate ST-EEGFormer (Yang et al., ICLR 2026; continuous patches + MAE) against LaBraM (Liz) and a cheap LDA baseline."),
      p("The original G.2 / BCI-IV-2a line was dropped after population and leave-one-out stayed at chance (~25–26% on a 4-class task). All numbers below are on lab data unless stated otherwise. Training config for the main runs: layer_decay 1.0, mix_up 0.0, lr 3e-4, warmup 5, 50 epochs, batch 4."),

      h2("2. Approaches tried"),
      p("Preprocessing. The first conversion (2 s, no filter, no reference, no baseline) gave chance for both ST-EEGFormer and LDA. I rewrote the conversion to match Liz’s pipeline (spatial_attention_v2): average reference on EEG only, bandpass 0.1–75 Hz, 60 Hz notch, control-period baseline, 8 s at 256 Hz, 64 EEG channels."),
      p("Training. After the data were sane, the ViT still did not fit (train accuracy stuck near 50%). Default layer_decay 0.75 plus mixup effectively froze the backbone. Switching to layer_decay 1.0 and mix_up 0.0 is what made population training move."),
      p("Evaluation. Population fine-tune on all 43 subjects is the main number. Leave-one-subject-out (LOSO) on the cluster used 41 leave-out folders in the current subject list (some IDs such as 010 are absent). On 2 September I compared per-subject scores with Liz."),
      p("Compute. Runs on mnode / Slurm. ATR A100 VPN (abi-dgx-a100) was set up on 2 September: conda env steeegformer, PyTorch 2.6 + CUDA, 8× A100 40GB visible. The lab .pkl files live on mnode and are not reachable from outside the Ishii network over the ATR VPN."),
      p("Liz’s next-step ideas (not yet measured on the ViT): Euclidean Alignment, Laplacian / CSD, stronger artifact rejection. A CSP+LDA script is ready (benchmark/spatial_attention/test_liz_preprocessing.py) but has not been run on the real .pkl files yet."),

      h2("3. Results"),
      table(
        ["Setting", "ST-EEGFormer", "LaBraM", "LDA", "Chance"],
        [
          ["Population (43 subjects)", "61.66% ≈ 61.7%", "~62%", "55.7%*", "50%"],
          ["LOSO, 41 completed folds", "53.55% ± 3.20%", "Not compared\n(protocol not aligned)", "—", "50%"],
        ],
        [2800, 2000, 2000, 1400, 1438]
      ),
      new Paragraph({ spacing: { after: 160, before: 120, line: 276 }, children: [
        new TextRun({ text: "Population is the number to cite for parity with LaBraM. It is not a held-out-subject score: train and test sessions still come from the same people. The LOSO mean comes from summarize_g2_json_logs.py on ~/data/g2_outputs/spatial_loo (2 Sep): 41 runs with JSON metrics, acc1_whole at the finetune stage. Folder leave_out_sub-060 exists but has no JSON yet. I do not treat 53.5% as a population-style headline.", font: "Calibri", size: 22, color: ink }),
      ]}),
      p("* The available LDA figure is from the 8-subject part0 table, not a full 43-subject result."),
      p("Per-subject spread is large. During the 2 September side-by-side discussion with Liz, subjects 004, 019, 020, 031 and 046 were flagged while reviewing the two result sets (015 is also worth monitoring). This is a discussion-based observation, not yet a formal cross-model correlation analysis. Easy examples on our side include 007, 029, 048 and 051."),

      h2("4. Problems encountered"),
      p("Three separate failures looked like “the model does not work”: missing preprocessing (LDA also at chance), then a frozen backbone (layer_decay), then long LOSO jobs that died and had to be resumed from COMPLETED markers."),
      p("Population 61.7% and LOSO ~53.5% answer different questions. Comparing LOSO 53.5% to Liz’s ~62% LOSO is not fair until protocols are aligned (same folds, same metric, same finetune versus zero-shot)."),
      p("Recent sbatch jobs were GPU-bound with low num_workers, so allocated CPU cores were probably idle. I will ask Kubo-san before the next submission and follow the MNODE documentation."),
      p("Two machines: mnode holds the data and LOSO logs; A100 is ready but cannot pull mnode files from the apartment. I will copy data from the lab before any A100 rerun."),
      p("Not done yet: EA / Laplacian / artifact rejection on the ViT; left versus right class-wise accuracy (offline JSON has scalars only); LDA/CSP on all 43 subjects (55.7% is the 8-subject part0 table); from-scratch backbone ablation."),

      h2("5. Next"),
      p("Run Liz’s preprocessing tests (EA, Laplacian, amplitude rejection) on hard subjects with CSP+LDA on mnode. If a variant moves the hard subjects, rebuild spatial_attention_v3 and rerun one population ST-EEGFormer job — not 41 LOSO folds first. Ask Kubo-san about cpus-per-task and num_workers. Keep writing the ESME final report (Moodle 14 September; defense 21 September) and ask for a lab check before I submit it."),
      p("I am not launching a full LOSO rerun until a preprocessing change shows a gain on the cheap baseline.", { after: 0 }),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, buf);
  console.log("wrote", outPath);
});
