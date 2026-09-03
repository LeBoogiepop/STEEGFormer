#!/usr/bin/env python3
import json
import os
import re
import statistics
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
OUT = REPO / "presentations"
EXTRACT = OUT / "extract_population_per_subject.py"
REMOTE_EXTRACT = "/tmp/extract_population_per_subject.py"
SUB_RE = re.compile(r"/(\d{3})_test_acc1$")


def ssh(cmd: str) -> str:
    r = subprocess.run(
        [
            "ssh",
            "-o",
            "BatchMode=yes",
            "-o",
            "ConnectTimeout=25",
            "lacombe-m@10.232.11.170",
            cmd,
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip() or r.stdout.strip())
    return r.stdout


def scp_up(local: Path, remote: str) -> None:
    subprocess.run(
        [
            "scp",
            "-o",
            "BatchMode=yes",
            "-o",
            "ConnectTimeout=25",
            str(local),
            f"lacombe-m@10.232.11.170:{remote}",
        ],
        check=True,
    )


def last_json_text(text: str):
    last = None
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            last = json.loads(line)
        except json.JSONDecodeError:
            continue
    return last


def parse_rows(flat: dict):
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
    rows.sort(key=lambda x: x[0])
    return whole, rows


def write_outputs(rows, whole, source: str):
    csv_path = OUT / "liz_table_population_all_subjects.csv"
    html_path = OUT / "liz_table_population_all_subjects.html"

    with csv_path.open("w", encoding="utf-8") as f:
        f.write("subject,population_acc_pct\n")
        for sid, acc in rows:
            f.write(f"{sid},{acc:.4f}\n")

    body = []
    for sid, acc in rows:
        cls = "good" if acc >= 70 else ("bad" if acc < 50 else "")
        body.append(
            f"<tr class='{cls}'><td>{sid}</td><td class='num'>{acc:.2f}%</td></tr>"
        )
    vals = [v for _, v in rows]
    mean_v = statistics.mean(vals) if vals else float("nan")
    html = f"""<!DOCTYPE html>
<html><head><meta charset='utf-8'><title>Population per subject</title>
<style>
body{{font-family:Segoe UI,sans-serif;margin:24px}}
table{{border-collapse:collapse;width:100%}}
th,td{{border:1px solid #d8dde3;padding:8px 10px}}
.num{{text-align:right}}
.good td{{color:#1f8a4c;font-weight:600}}
.bad td{{color:#c0392b;font-weight:600}}
.note{{background:#eef6ff;border-left:4px solid #2f6fed;padding:10px 12px;margin:12px 0}}
</style></head><body>
<h1>Population — accuracy per subject</h1>
<p>Train + test on all subjects. Source: {source}</p>
<div class='note'>Whole test acc from log: <strong>{whole:.2f}%</strong> · mean of per-subject keys: <strong>{mean_v:.2f}%</strong> · N={len(rows)}</div>
<table><thead><tr><th>Subject</th><th>Population acc</th></tr></thead>
<tbody>{''.join(body)}</tbody></table>
</body></html>"""
    html_path.write_text(html, encoding="utf-8")
    return csv_path, html_path, mean_v


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    scp_up(EXTRACT, REMOTE_EXTRACT)

    discover = ssh(
        "bash -lc 'find ~/data/g2_outputs -type d -name population_sub-all_* 2>/dev/null | sort'"
    ).strip()
    dirs = [d for d in discover.splitlines() if d.strip()]
    print("population dirs:")
    for d in dirs:
        print(" ", d)

    if not dirs:
        print("No population_sub-all_* directory found under ~/data/g2_outputs")
        sys.exit(1)

    # prefer spatial-related, else largest sub-all_N
    pick = None
    for d in dirs:
        if "spatial" in d.lower():
            pick = d
            break
    if pick is None:
        def n_train(path):
            m = re.search(r"population_sub-all_(\d+)", path)
            return int(m.group(1)) if m else 0

        pick = max(dirs, key=n_train)

    print("using:", pick)
    raw = ssh(
        f"python3 {REMOTE_EXTRACT} {pick}"
    )
    print(raw)

    # re-fetch last log path and parse locally from ssh cat
    log_path = ssh(
        f"bash -lc 'python3 - <<\"PY\"\n"
        f"import os, pathlib\n"
        f"root=pathlib.Path(\"{pick}\")\n"
        f"c=[]\n"
        f"for dp,_,fs in os.walk(root):\n"
        f"  for n in fs:\n"
        f"    if n.startswith(\"log_\") and n.endswith(\"_training\"):\n"
        f"      c.append(os.path.join(dp,n))\n"
        f"print(sorted(c)[-1] if c else \"\")\n"
        f"PY'"
    ).strip()
    if not log_path:
        raise RuntimeError("Could not locate population training log")

    text = ssh(f"cat {log_path}")
    flat = last_json_text(text)
    whole, rows = parse_rows(flat)
    if not rows:
        raise RuntimeError("No per-subject keys in population log")

    csv_path, html_path, mean_v = write_outputs(rows, whole, log_path)
    print("Wrote:", csv_path)
    print("Wrote:", html_path)
    print(f"subjects={len(rows)} whole={whole:.2f}% mean_keys={mean_v:.2f}%")


if __name__ == "__main__":
    main()
