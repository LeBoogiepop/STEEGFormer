# Progress report — ST-EEGFormer on the lab spatial-attention dataset

**Maxime Lacombe** · Ishii Laboratory · 3 September 2026  
For: Tien Cuong PHI (copy: Shin Ishii)  
2–3 pages. Facts only. No invented LOSO numbers.

---

## 1. What I set out to do

The target is the lab **covert spatial-attention** dataset (Morioka et al., 2014): left vs right, 43 subjects, 8 s windows at 256 Hz. Chance is 50%. I evaluate **ST-EEGFormer** (Yang et al., ICLR 2026; continuous patches + MAE) against **LaBraM** (Liz) and a cheap **LDA** baseline.

The original G.2 / BCI-IV-2a line was dropped after population and leave-one-out stayed at chance (~25–26% on a 4-class task). All numbers below are on lab data unless stated otherwise.

Training config used for the main runs: `layer_decay=1.0`, `mix_up=0.0`, `lr=3e-4`, warmup 5, 50 epochs, batch 4.

---

## 2. Approaches tried

**Preprocessing.** First conversion (2 s, no filter/ref/baseline) gave chance for both ST-EEGFormer and LDA. I rewrote the conversion to match Liz’s pipeline (`spatial_attention_v2`): average reference (EEG only), bandpass 0.1–75 Hz, 60 Hz notch, control-period baseline, 8 s @ 256 Hz, 64 EEG channels.

**Training.** After the data were sane, the ViT still did not fit (train accuracy stuck at ~50%). The default `layer_decay=0.75` plus mixup effectively froze the backbone. Switching to `layer_decay=1.0` and `mix_up=0.0` is what made population training move.

**Evaluation.** Population fine-tune on all 43 subjects (main number). Leave-one-subject-out (LOSO) on the cluster: 41 leave-out folders exist in the current subject list (some IDs such as 010 are absent). Per-subject comparison with Liz on 2 September.

**Compute.** Runs on mnode / Slurm (`kng11` and related nodes). ATR A100 VPN (`abi-dgx-a100`) set up on 2 September: conda env `steeegformer`, PyTorch 2.6 + CUDA, 8× A100 40GB visible. Lab `.pkl` files live on mnode and are not reachable from the apartment over the ATR VPN.

**Liz’s next-step ideas (not yet measured on the ViT).** Euclidean Alignment, Laplacian/CSD, stronger artifact rejection. A CSP+LDA script is ready (`benchmark/spatial_attention/test_liz_preprocessing.py`); it has not been run on the real `.pkl`s yet.

---

## 3. Results

| Setting | ST-EEGFormer | LaBraM (Liz) | LDA | Chance |
|---|---:|---:|---:|---:|
| Population (43 subjects) | **61.66% ≈ 61.7%** | ~62% | 55.7% | 50% |
| LOSO, 41/41 completed folds | **53.55% ± 3.20%** | ~62% LOSO (Liz, earlier) | — | 50% |

Population is the number to cite for parity with LaBraM. It is **not** a held-out-subject score: train and test sessions still come from the same people.

LOSO mean comes from `summarize_g2_json_logs.py` on `~/data/g2_outputs/spatial_loo` (2 Sep): 41 runs with JSON metrics, `acc1_whole` at the finetune stage. Folder `leave_out_sub-060` exists but has no JSON yet. I do **not** treat 53.5% as a population-style headline.

Per-subject spread is large. Subjects that stay hard in **both** ST-EEGFormer and LaBraM include **004, 019, 020, 031, 046** (015 is also worth a closer look). Easy examples on our side include 007, 029, 048, 051.

---

## 4. Problems

**Data vs model vs optimisation.** Three separate failures looked like “the model does not work”: missing preprocessing (LDA also at chance), then a frozen backbone (`layer_decay`), then long LOSO jobs that died and had to be resumed from `COMPLETED` markers.

**LOSO vs population.** Population 61.7% and LOSO ~53.5% answer different questions. Comparing LOSO 53.5% to Liz’s ~62% LOSO is not fair until protocols are aligned (same folds, same metric, same finetune vs zero-shot).

**Cluster CPU use.** Recent sbatch jobs were GPU-bound with low `num_workers`, so allocated CPU cores were probably idle. I will ask Kubo-san before the next submission (MNODE docs: https://ishiilab.jp/dynamixwiki/?NODE).

**Two machines.** mnode holds the data and LOSO logs. A100 is ready but cannot pull mnode files from outside the Ishii network. I will copy data from the lab before any A100 rerun.

**Not done yet.** EA / Laplacian / artifact rejection on the ViT. Left vs right class-wise accuracy (offline JSON has scalars only). LDA/CSP on all 43 subjects (current 55.7% is the 8-subject `part0` table). From-scratch backbone ablation.

---

## 5. Next

1. Run the Liz preprocessing tests (EA, Laplacian, amplitude rejection) on hard subjects with CSP+LDA, on mnode.
2. If any variant moves the hard subjects, rebuild `spatial_attention_v3` and rerun **one** population ST-EEGFormer job (A100 or mnode) — not 41 LOSO folds first.
3. Ask Kubo-san about `cpus-per-task` / `num_workers`.
4. Keep writing the ESME final report (40–50 pages, Moodle 14 September; defense 21 September). I will ask for a lab check before I submit it.

I am not launching a full LOSO rerun until a preprocessing change shows a gain on the cheap baseline.
