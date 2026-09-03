#!/usr/bin/env python3
"""Re-sort population CSV/HTML by accuracy (desc)."""
import csv
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CSV = ROOT / "liz_table_population_all_subjects.csv"
HTML = ROOT / "liz_table_population_all_subjects.html"

rows = []
with CSV.open(encoding="utf-8") as f:
    for r in csv.DictReader(f):
        rows.append((r["subject"], float(r["population_acc_pct"])))
rows.sort(key=lambda x: (-x[1], x[0]))

with CSV.open("w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["subject", "population_acc_pct"])
    for sid, acc in rows:
        w.writerow([sid, f"{acc:.4f}"])

mean_v = statistics.mean(v for _, v in rows)
body = []
for sid, acc in rows:
    cls = "good" if acc >= 70 else ("bad" if acc < 50 else "")
    body.append(f"<tr class='{cls}'><td>{sid}</td><td class='num'>{acc:.2f}%</td></tr>")

HTML.write_text(
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
<p>Sorted by accuracy (high → low). Whole: <strong>61.66%</strong> · mean: <strong>{mean_v:.2f}%</strong></p>
<table><thead><tr><th>Subject</th><th>Population acc</th></tr></thead><tbody>
{''.join(body)}
</tbody></table></body></html>""",
    encoding="utf-8",
)
print(f"Sorted {len(rows)} rows → {CSV.name}, {HTML.name}")
