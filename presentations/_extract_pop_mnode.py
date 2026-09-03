import json
import os
import re
import statistics
from pathlib import Path

CANDIDATES = [
    Path.home() / "data/g2_outputs/spatial_v2_population2/population_sub-all_43",
    Path.home() / "data/g2_outputs/spatial_v2_population/population_sub-all_43",
]
OUT = Path.home() / "data/g2_outputs/population_per_subject"
SUB_RE = re.compile(r"/(\d{3})_test_acc1$")


def last_json(path: Path):
    last = None
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                last = json.loads(line)
            except json.JSONDecodeError:
                continue
    return last


def find_training_log(root: Path):
    logs = []
    for dp, _, fs in os.walk(root):
        for n in fs:
            if n.startswith("log_") and n.endswith("_training"):
                logs.append(Path(dp) / n)
    return sorted(logs)[-1] if logs else None


def extract(flat: dict):
    rows = []
    whole = None
    for k, v in flat.items():
        ks = k.replace("\\", "/")
        if ks.endswith("/test_whole_acc1"):
            whole = float(v)
            continue
        m = SUB_RE.search(ks)
        if m:
            rows.append((m.group(1), float(v)))
    rows.sort(key=lambda x: (-x[1], x[0]))
    return whole, rows


print("=== check population runs ===")
best = None
for root in CANDIDATES:
    if not root.is_dir():
        print(f"MISSING {root}")
        continue
    log = find_training_log(root)
    if not log:
        print(f"NO LOG {root}")
        continue
    flat = last_json(log)
    if not flat:
        print(f"EMPTY LOG {log}")
        continue
    whole, rows = extract(flat)
    if whole is None and rows:
        whole = statistics.mean([v for _, v in rows])
    mean_v = statistics.mean([v for _, v in rows]) if rows else float("nan")
    print(f"\nDIR: {root}")
    print(f"LOG: {log}")
    print(f"subjects={len(rows)} whole={whole:.4f} mean_keys={mean_v:.4f}")
    if best is None or (whole is not None and whole > best[0]):
        best = (whole, root, log, rows)

if best is None:
    raise SystemExit("No usable population log found")

whole, root, log, rows = best
OUT.mkdir(parents=True, exist_ok=True)
csv = OUT / "population_per_subject.csv"
html = OUT / "population_per_subject.html"

with csv.open("w", encoding="utf-8") as f:
    f.write("subject,population_acc_pct\n")
    for sid, acc in rows:
        f.write(f"{sid},{acc:.4f}\n")

body = []
for sid, acc in rows:
    cls = "good" if acc >= 70 else ("bad" if acc < 50 else "")
    body.append(f"<tr class='{cls}'><td>{sid}</td><td class='num'>{acc:.2f}%</td></tr>")

vals = [v for _, v in rows]
mean_v = statistics.mean(vals)
html.write_text(
    f"""<!DOCTYPE html>
<html><head><meta charset='utf-8'><title>Population per subject</title>
<style>
body{{font-family:Segoe UI,sans-serif;margin:24px}}
table{{border-collapse:collapse;width:100%}}
th,td{{border:1px solid #d8dde3;padding:8px}}
.num{{text-align:right}}
.good td{{color:#1f8a4c;font-weight:600}}
.bad td{{color:#c0392b;font-weight:600}}
</style></head><body>
<h1>Population — per subject (43)</h1>
<p>Source: {log}</p>
<p>Whole: <strong>{whole:.2f}%</strong> · mean keys: <strong>{mean_v:.2f}%</strong></p>
<table><thead><tr><th>Subject</th><th>Acc</th></tr></thead><tbody>
{''.join(body)}
</tbody></table></body></html>""",
    encoding="utf-8",
)

print("\n=== WROTE (best run by whole acc) ===")
print(f"DIR: {root}")
print(f"CSV: {csv}")
print(f"HTML: {html}")
print(f"WHOLE: {whole:.4f}%  N={len(rows)}")
print("\nTop 5:")
for sid, acc in sorted(rows, key=lambda x: -x[1])[:5]:
    print(f"  sub-{sid} {acc:.2f}%")
print("Bottom 5:")
for sid, acc in sorted(rows, key=lambda x: x[1])[:5]:
    print(f"  sub-{sid} {acc:.2f}%")
