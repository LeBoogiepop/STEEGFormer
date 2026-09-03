#!/bin/bash
# Quick Liz preprocessing benchmark on ATR spatial attention pkls.
set -euo pipefail

REPO="${REPO:-$HOME/torch-brain-eeg/code/STEEGFormer}"
DATA="${DATA:-$HOME/data/g2_transfer/spatial_attention_v2}"

cd "$REPO"
pip install --user -q -r benchmark/spatial_attention/requirements.txt

echo "=== All subjects ==="
python3 benchmark/spatial_attention/test_liz_preprocessing.py --data-dir "$DATA"

echo ""
echo "=== Hard subjects only (004, 019, 020, 031, 046, 015) ==="
python3 benchmark/spatial_attention/test_liz_preprocessing.py --data-dir "$DATA" --only-hard
