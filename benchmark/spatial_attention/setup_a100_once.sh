#!/bin/bash
# One-time A100 setup + Liz hard-subject test (CPU). Run on abi-dgx-a100:
#   bash setup_a100_once.sh
set -euo pipefail

CONDA=/home/cns/anaconda3/bin/conda
PY=/home/cns/anaconda3/bin/python
PIP=/home/cns/anaconda3/bin/pip
ENV_NAME=steeegformer
REPO="$HOME/torch-brain-eeg"
DATA="$HOME/data/g2_transfer/spatial_attention_v2"
MNODE="lacombe-m@10.232.11.170"
HARD="sub-004.pkl sub-015.pkl sub-019.pkl sub-020.pkl sub-031.pkl sub-046.pkl"

echo "==> [1/5] conda env (user-local if needed)"
if ! $CONDA env list | grep -q "^${ENV_NAME} "; then
  $CONDA create -y -n "$ENV_NAME" python=3.10 pip
fi
# shellcheck disable=SC1091
source /home/cns/anaconda3/etc/profile.d/conda.sh
conda activate "$ENV_NAME"

echo "==> [2/5] install deps (torch cpu ok for Liz test; gpu later)"
pip install -q --upgrade pip
pip install -q torch --index-url https://download.pytorch.org/whl/cu124
pip install -q pyriemann mne scikit-learn numpy scipy

$PY -c "import torch; print('torch', torch.__version__, 'cuda', torch.cuda.is_available(), 'n_gpu', torch.cuda.device_count())"

echo "==> [3/5] clone repo"
if [[ ! -d "$REPO/.git" ]]; then
  git clone --depth 1 -b shared-context https://github.com/LeBoogiepop/torch-brain-eeg.git "$REPO"
else
  git -C "$REPO" pull --ff-only || true
fi

echo "==> [4/5] fetch 6 hard-subject pkls from mnode (password: mnode account)"
mkdir -p "$DATA"
for f in $HARD; do
  if [[ ! -f "$DATA/$f" ]]; then
    echo "    scp $f ..."
    scp -o StrictHostKeyChecking=accept-new "$MNODE:~/data/g2_transfer/spatial_attention_v2/$f" "$DATA/" || {
      echo "WARN: scp failed for $f — run Liz test on mnode instead"
    }
  fi
done
ls -la "$DATA"/*.pkl 2>/dev/null || true

echo "==> [5/5] Liz preprocessing test (hard subjects)"
cd "$REPO/code/STEEGFormer"
python benchmark/spatial_attention/test_liz_preprocessing.py \
  --data-dir "$DATA" \
  --only-hard

echo "DONE. conda activate $ENV_NAME for next time."
