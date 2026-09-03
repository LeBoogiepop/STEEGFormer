#!/usr/bin/env bash
# Run ON mnode after: module load slurm/23.02.7 (optional)
# Produces CSV + HTML with per-subject population accuracy.
set -euo pipefail

ROOT="${1:-$HOME/data/g2_outputs}"
OUT="${2:-$HOME/data/g2_outputs/population_per_subject}"

mkdir -p "$OUT"

POP_DIR="$(find "$ROOT" -type d -name 'population_sub-all_*' 2>/dev/null | sort | tail -1)"
if [[ -z "$POP_DIR" ]]; then
  echo "No population_sub-all_* under $ROOT"
  echo "Try: find ~/data/g2_outputs -type d -name 'population_sub-all_*'"
  exit 1
fi

LOG="$(find "$POP_DIR" -type f -name 'log_*_training' 2>/dev/null | sort | tail -1)"
if [[ -z "$LOG" ]]; then
  echo "No training log under $POP_DIR"
  exit 1
fi

python3 - <<PY
import json, re, statistics, os
from pathlib import Path

log = Path(r"""$LOG""")
out = Path(r"""$OUT""")
last = None
with log.open(encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            last = json.loads(line)
        except Exception:
            pass
if not last:
    raise SystemExit(f"empty log: {log}")

rows = []
whole = None
for k, v in last.items():
    ks = k.replace("\\\\", "/")
    if ks.endswith("/test_whole_acc1"):
        whole = float(v)
        continue
    m = re.search(r"/(\d{3})_test_acc1$", ks)
    if m:
        rows.append((m.group(1), float(v)))
rows.sort(key=lambda x: x[0])
if not rows:
    raise SystemExit("No per-subject keys (NNN_test_acc1) in last JSON line")

csv = out / "population_per_subject.csv"
html = out / "population_per_subject.html"
with csv.open("w", encoding="utf-8") as f:
    f.write("subject,population_acc_pct\n")
    for sid, acc in rows:
        f.write(f"{sid},{acc:.4f}\n")

vals = [v for _, v in rows]
mean_v = statistics.mean(vals)
body = []
for sid, acc in rows:
    cls = "good" if acc >= 70 else ("bad" if acc < 50 else "")
    body.append(f"<tr class='{cls}'><td>{sid}</td><td class='num'>{acc:.2f}%</td></tr>")

html.write_text(f"""<!DOCTYPE html>
<html><head><meta charset='utf-8'><title>Population per subject</title>
<style>
body{{font-family:Segoe UI,sans-serif;margin:24px}}
table{{border-collapse:collapse;width:100%}}
th,td{{border:1px solid #d8dde3;padding:8px}}
.num{{text-align:right}}
.good td{{color:#1f8a4c;font-weight:600}}
.bad td{{color:#c0392b;font-weight:600}}
</style></head><body>
<h1>Population — per subject</h1>
<p>Log: {log}</p>
<p>Whole test acc: <strong>{whole:.2f}%</strong> · mean per-subject keys: <strong>{mean_v:.2f}%</strong> · N={len(rows)}</p>
<table><thead><tr><th>Subject</th><th>Acc</th></tr></thead><tbody>
{''.join(body)}
</tbody></table></body></html>""", encoding="utf-8")

print(f"log: {log}")
print(f"population dir: {POP_DIR}")
print(f"subjects: {len(rows)}")
print(f"test_whole_acc1: {whole:.4f}")
print(f"mean per-subject: {mean_v:.4f}")
print(f"Wrote: {csv}")
print(f"Wrote: {html}")
PY

echo
echo "Copy to your PC (from your laptop, not mnode):"
echo "  scp -r lacombe-m@10.232.11.170:$OUT ./presentations/"
