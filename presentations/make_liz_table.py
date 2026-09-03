#!/usr/bin/env python3
"""Full per-subject table for Liz debrief."""
import csv
from pathlib import Path

OUT = Path(__file__).resolve().parent

ROWS = [
    # sid, done, tr, tr_bal, tr_k, ft, ft_bal, ft_k
    ("002", True, 46.88, 50.00, 0.00, 51.56, 52.08, 0.04),
    ("003", True, 70.31, 68.75, 0.38, 46.88, 45.83, -0.08),
    ("004", True, 42.19, 39.58, -0.21, 51.56, 52.08, 0.04),
    ("005", True, 57.81, 56.25, 0.13, 50.00, 47.92, -0.04),
    ("006", True, 57.81, 56.25, 0.13, 60.94, 60.42, 0.21),
    ("007", True, 81.25, 79.17, 0.58, 82.81, 81.25, 0.63),
    ("008", True, 54.69, 54.17, 0.08, 53.13, 52.08, 0.04),
    ("009", True, 46.88, 47.92, -0.04, 42.19, 41.67, -0.17),
    ("011", True, 54.69, 54.17, 0.08, 51.56, 47.92, -0.04),
    ("012", True, 53.13, 52.08, 0.04, 43.75, 41.67, -0.17),
    ("013", True, 60.94, 58.33, 0.17, 48.44, 50.00, 0.00),
    ("014", True, 50.00, 43.75, -0.13, 40.63, 43.75, -0.13),
    ("015", True, 43.75, 41.67, -0.17, 42.19, 43.75, -0.13),
    ("019", True, 35.94, 37.50, -0.25, 59.38, 60.42, 0.21),
    ("020", True, 43.75, 45.83, -0.08, 53.13, 52.08, 0.04),
    ("021", True, 62.50, 60.42, 0.21, 64.06, 64.58, 0.29),
    ("022", True, 51.56, 52.08, 0.04, 53.13, 52.08, 0.04),
    ("023", True, 59.38, 56.25, 0.13, 57.81, 52.08, 0.04),
    ("024", True, 67.19, 66.67, 0.33, 59.38, 56.25, 0.13),
    ("025", True, 53.13, 50.00, 0.00, 45.31, 45.83, -0.08),
    ("026", True, 68.75, 66.67, 0.33, 87.50, 87.50, 0.75),
    ("028", True, 62.50, 60.42, 0.21, 56.25, 54.17, 0.08),
    ("029", True, 79.69, 77.08, 0.54, 93.75, 91.67, 0.83),
    ("031", True, 59.38, 64.58, 0.29, 64.06, 68.75, 0.38),
    ("032", True, 57.81, 56.25, 0.13, 56.25, 56.25, 0.13),
    ("033", True, 42.19, 43.75, -0.13, 51.56, 52.08, 0.04),
    ("036", True, 50.00, 52.08, 0.04, 48.44, 47.92, -0.04),
    ("041", True, 57.81, 56.25, 0.13, 59.38, 58.33, 0.17),
    ("042", True, 56.25, 56.25, 0.13, 29.69, 31.25, -0.38),
    ("043", True, 43.75, 45.83, -0.08, 48.44, 50.00, 0.00),
    ("045", True, 45.31, 45.83, -0.08, 50.00, 45.83, -0.08),
    ("046", True, 50.00, 50.00, 0.00, 60.94, 62.50, 0.25),
    ("047", True, 70.31, 68.75, 0.38, 78.13, 81.25, 0.63),
    ("048", True, 73.44, 72.92, 0.46, 85.94, 87.50, 0.75),
    ("050", True, 64.06, 62.50, 0.25, 45.31, 45.83, -0.08),
    ("051", True, 81.25, 81.25, 0.63, 79.69, 81.25, 0.63),
    ("052", True, 56.25, 54.17, 0.08, 46.88, 50.00, 0.00),
    ("053", True, 62.50, 62.50, 0.25, 62.50, 64.58, 0.29),
    ("055", True, 48.44, 45.83, -0.08, 50.00, 50.00, 0.00),
    ("056", True, 43.75, 43.75, -0.13, 46.88, 47.92, -0.04),
    ("059", False, 48.44, 50.00, 0.00, None, None, None),
]


def bucket(tr: float) -> str:
    if tr >= 70:
        return "easy (>=70%)"
    if tr < 50:
        return "hard (<50%)"
    if tr < 60:
        return "mid (50-60%)"
    return "ok (60-70%)"


def fmt_pct(v):
    return "" if v is None else f"{v:.2f}"


def fmt_delta(tr, ft):
    if ft is None:
        return ""
    d = ft - tr
    return f"{d:+.2f}"


HEADERS = [
    "subject",
    "status",
    "zero_shot_acc_pct",
    "zero_shot_balanced_pct",
    "zero_shot_kappa",
    "after_calib_acc_pct",
    "after_calib_balanced_pct",
    "after_calib_kappa",
    "delta_calib_minus_zero_pct",
    "bucket_zero_shot",
]


def write_csv():
    path = OUT / "liz_table_all_subjects.csv"
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(HEADERS)
        for sid, done, tr, trb, trk, ft, ftb, ftk in ROWS:
            w.writerow([
                sid,
                "done" if done else "running",
                fmt_pct(tr),
                fmt_pct(trb),
                f"{trk:.3f}" if trk is not None else "",
                fmt_pct(ft),
                fmt_pct(ftb),
                f"{ftk:.3f}" if ftk is not None else "",
                fmt_delta(tr, ft),
                bucket(tr),
            ])
    return path


def cell_class(tr, done):
    if not done:
        return "running"
    if tr >= 70:
        return "good"
    if tr < 50:
        return "bad"
    return ""


def write_html():
    path = OUT / "liz_table_all_subjects.html"
    rows_html = []
    for sid, done, tr, trb, trk, ft, ftb, ftk in sorted(ROWS, key=lambda r: -r[2]):
        cls = cell_class(tr, done)
        rows_html.append(
            f"<tr class='{cls}'>"
            f"<td>{sid}</td>"
            f"<td>{'done' if done else 'running'}</td>"
            f"<td class='num'>{tr:.2f}%</td>"
            f"<td class='num'>{trb:.2f}%</td>"
            f"<td class='num'>{trk:.3f}</td>"
            f"<td class='num'>{fmt_pct(ft) + ('%' if ft is not None else '')}</td>"
            f"<td class='num'>{fmt_pct(ftb) + ('%' if ftb is not None else '')}</td>"
            f"<td class='num'>{f'{ftk:.3f}' if ftk is not None else '—'}</td>"
            f"<td class='num'>{fmt_delta(tr, ft) + ('%' if ft is not None else '—')}</td>"
            f"<td>{bucket(tr)}</td>"
            f"</tr>"
        )

    html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<title>Tableau complet — tous les sujets LOSO</title>
<style>
body {{ font-family: Segoe UI, system-ui, sans-serif; margin: 24px; color: #1a1d21; }}
h1 {{ font-size: 1.4rem; }}
p {{ color: #5c6570; max-width: 900px; }}
table {{ border-collapse: collapse; width: 100%; font-size: 0.88rem; margin-top: 16px; }}
th, td {{ border: 1px solid #d8dde3; padding: 7px 10px; }}
th {{ background: #eef1f4; position: sticky; top: 0; }}
.num {{ text-align: right; font-variant-numeric: tabular-nums; }}
.good td:nth-child(3) {{ color: #1f8a4c; font-weight: 600; }}
.bad td:nth-child(3) {{ color: #c0392b; font-weight: 600; }}
.running td {{ color: #b8860b; }}
tr:nth-child(even) {{ background: #f9fafb; }}
.note {{ background: #fff9e8; border-left: 4px solid #b8860b; padding: 10px 12px; margin: 16px 0; }}
</style>
</head>
<body>
<h1>LOSO — tous les sujets (40 done + 059 running)</h1>
<p>ST-EEGFormer spatial attention · source mnode ~/data/g2_outputs/spatial_loo · 1 Sep 2026</p>
<div class="note">Population 61.7% = autre protocole (tous sujets ensemble). Ce tableau = leave-one-subject-out.</div>
<table>
<thead><tr>
<th>Subject</th><th>Status</th>
<th>Zero-shot acc</th><th>Zero-shot bal.</th><th>Zero-shot kappa</th>
<th>After calib. acc</th><th>After calib. bal.</th><th>After calib. kappa</th>
<th>Delta (calib − zero)</th><th>Bucket</th>
</tr></thead>
<tbody>
{''.join(rows_html)}
</tbody>
</table>
</body>
</html>"""
    path.write_text(html, encoding="utf-8")
    return path


def write_md_table():
    path = OUT / "LIZ_DEBRIEF_2026-09-02.md"
    text = path.read_text(encoding="utf-8")
    marker = "## Table complète"
    if marker not in text:
        return

    lines = [
        "",
        "| Subject | Status | Zero-shot | Bal. | Kappa | Calib. | Bal. | Kappa | Delta | Bucket |",
        "|---|---|---:|---:|---:|---:|---:|---:|---:|---|",
    ]
    for sid, done, tr, trb, trk, ft, ftb, ftk in sorted(ROWS, key=lambda r: int(r[0])):
        st = "done" if done else "running"
        ft_s = f"{ft:.1f}%" if ft is not None else "—"
        ftb_s = f"{ftb:.1f}%" if ftb is not None else "—"
        ftk_s = f"{ftk:.2f}" if ftk is not None else "—"
        d_s = fmt_delta(tr, ft) + "%" if ft is not None else "—"
        lines.append(
            f"| {sid} | {st} | {tr:.1f}% | {trb:.1f}% | {trk:.2f} | {ft_s} | {ftb_s} | {ftk_s} | {d_s} | {bucket(tr)} |"
        )

    new_table = "\n".join(lines)
    # replace old table section until next ##
    import re
    pattern = r"## Table complète\n.*?(?=\n## |\Z)"
    text = re.sub(pattern, "## Table complète" + new_table + "\n", text, flags=re.DOTALL)
    path.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    print("Wrote:", write_csv())
    print("Wrote:", write_html())
    write_md_table()
    print("Updated: LIZ_DEBRIEF_2026-09-02.md")
