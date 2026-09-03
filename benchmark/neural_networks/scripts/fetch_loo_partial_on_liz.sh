#!/usr/bin/env bash
# One-shot: pull LOSO outputs from mnode + summarize the 7 COMPLETED folds.
# Usage on Liz PC:
#   bash fetch_loo_partial_on_liz.sh
# Or:
#   curl -fsSL <raw-url> | bash

set -euo pipefail

MNODE_HOST="${MNODE_HOST:-lacombe-m@10.232.11.170}"
OUT_ROOT="${OUT_ROOT:-$HOME/maxime_g2}"
LOO_DIR="$OUT_ROOT/spatial_loo"
REPO_DIR="$OUT_ROOT/torch-brain-eeg"
BRANCH="${BRANCH:-shared-context}"

mkdir -p "$OUT_ROOT"
cd "$OUT_ROOT"

echo "==> [1/4] scp LOSO outputs from mnode -> $LOO_DIR"
if [[ -d "$LOO_DIR" ]]; then
  echo "    (folder exists, refreshing)"
fi
scp -r "$MNODE_HOST:~/data/g2_outputs/spatial_loo" "$OUT_ROOT/"

echo "==> [2/4] count COMPLETED markers"
n="$(find "$LOO_DIR" -name COMPLETED | wc -l | tr -d ' ')"
echo "    COMPLETED folds: $n"

echo "==> [3/4] clone/update repo (for summarize script)"
if [[ ! -d "$REPO_DIR/.git" ]]; then
  git clone --depth 1 -b "$BRANCH" https://github.com/LeBoogiepop/torch-brain-eeg.git "$REPO_DIR"
else
  git -C "$REPO_DIR" fetch --depth 1 origin "$BRANCH"
  git -C "$REPO_DIR" checkout "$BRANCH"
  git -C "$REPO_DIR" pull --ff-only origin "$BRANCH" || true
fi

SUM="$REPO_DIR/code/STEEGFormer/benchmark/neural_networks/scripts/summarize_g2_json_logs.py"
if [[ ! -f "$SUM" ]]; then
  # fallback: standalone STEEGFormer layout if clone path differs
  SUM="$REPO_DIR/benchmark/neural_networks/scripts/summarize_g2_json_logs.py"
fi

echo "==> [4/4] summarize mean +/- std"
python3 "$SUM" --log-root "$LOO_DIR"

echo
echo "Done. Copy mean+/-std into your seminar slide (N=$n / 43)."
echo "Population slide stays ~61.7%. LOSO line = partial result."
