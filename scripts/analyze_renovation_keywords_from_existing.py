#!/usr/bin/env python3
"""
Extrait du content-gap Ahrefs existant les keywords RGE/CEE/MaPrimeRénov'/
rénovation énergétique où :
  - Au moins UN concurrent (pagesjaunes / travaux.com / izi-by-edf) rank top 30
  - SA n'est pas dans le top 50 (ou absent)
  - Volume mensuel >= 50

Output : docs/ahrefs-renovation-keywords-extracted-{date}.{json,md}

Usage :
  python scripts/analyze_renovation_keywords_from_existing.py

Limite : ces 3 concurrents NE sont PAS les leaders RGE/CEE
(Effy, Heero, Sonergia, France-Renov absents) → résultat = FLOOR.
Pour vraie domination niche : pull séparé requis.
"""

import csv
import json
import re
import sys
from datetime import date
from pathlib import Path

SRC = Path("docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv")

PATTERNS = {
    "maprimerenov": re.compile(r"maprimer[eé]nov|ma\s+prime\s+r[eé]nov|prime\s+r[eé]nov", re.I),
    "cee": re.compile(r"\bcee\b|certificat.{0,15}d.{0,3}[eé]conomie|coup.{0,5}pouce|prime.{0,5}[eé]nergie", re.I),
    "rge": re.compile(r"\brge\b|qualibat|qualipac|qualifelec|qualisol|qualibois|qualit.?enr", re.I),
    "renovation": re.compile(
        r"r[eé]novation\s*[eé]nerg|isolation|pompe.{0,5}chaleur|chaudi[eè]re|menuiserie|vmc|"
        r"ballon.{0,5}thermo|panneau.{0,5}solaire|photovolta[iï]que",
        re.I,
    ),
    "diagnostic": re.compile(r"\bdpe\b|audit\s+[eé]nerg|passoire\s+thermique", re.I),
    "aides": re.compile(r"\beco.?pr[eê]t|eco.?ptz|aide.{0,15}r[eé]nov|anah|tva.{0,5}5", re.I),
}

COMPETITORS = ["pagesjaunes.fr", "travaux.com", "izi-by-edf.fr"]


def classify(kw: str) -> list[str]:
    return [c for c, rx in PATTERNS.items() if rx.search(kw)]


def safe_num(v) -> float:
    if v is None or v == "":
        return 0.0
    try:
        return float(re.sub(r"[^\d.\-]", "", str(v)) or 0)
    except ValueError:
        return 0.0


def main() -> None:
    if not SRC.exists():
        print(f"ERR: {SRC} not found", file=sys.stderr)
        sys.exit(1)

    rows_in = 0
    out: list[dict] = []
    with SRC.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        # Header is wrapped in extra quotes: '﻿"Keyword"'
        keyword_col = next((c for c in (reader.fieldnames or []) if "Keyword" in c), None)
        if not keyword_col:
            print(f"ERR: no Keyword column found in {reader.fieldnames}", file=sys.stderr)
            sys.exit(1)
        for r in reader:
            rows_in += 1
            kw = r.get(keyword_col) or ""
            if not kw:
                continue
            cats = classify(kw)
            if not cats:
                continue

            volume = safe_num(r.get("Volume"))
            if volume < 50:
                continue

            kd = safe_num(r.get("KD"))
            cpc = safe_num(r.get("CPC"))
            sa_pos = safe_num(r.get("servicesartisans.fr/: Organic Position"))
            if sa_pos > 0 and sa_pos <= 50:
                continue

            best_pos = 999
            best_comp = ""
            for c in COMPETITORS:
                pos = safe_num(r.get(f"{c}/: Organic Position"))
                if pos > 0 and pos < best_pos:
                    best_pos = pos
                    best_comp = c
            if best_pos > 30:
                continue

            score = volume * (1 / (kd + 5)) * (1 / (best_pos + 1))

            out.append(
                {
                    "keyword": kw,
                    "categories": cats,
                    "volume": int(volume),
                    "kd": int(kd),
                    "cpc": cpc,
                    "sa_position": int(sa_pos) if sa_pos else None,
                    "best_competitor": best_comp,
                    "best_competitor_position": int(best_pos),
                    "opportunity_score": round(score, 2),
                }
            )

    out.sort(key=lambda r: r["opportunity_score"], reverse=True)

    today = date.today().isoformat()
    json_path = Path(f"docs/ahrefs-renovation-keywords-extracted-{today}.json")
    md_path = Path(f"docs/ahrefs-renovation-keywords-extracted-{today}.md")

    json_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")

    by_cat: dict[str, int] = {}
    for r in out:
        for c in r["categories"]:
            by_cat[c] = by_cat.get(c, 0) + 1

    top = out[:200]

    md_lines = [
        "# Keywords Rénovation Énergétique extraits du content-gap Ahrefs",
        "",
        f"**Date extraction** : {today}",
        f"**Source** : `{SRC}` (snapshot 2026-04-18, {rows_in} rows scannées)",
        "**Concurrents inclus** : Pages Jaunes, Travaux.com, IZI by EDF",
        "**⚠️ Limite** : Effy / Heero / Sonergia / France-Renov / QuelleEnergie **absents** "
        "→ résultats = FLOOR. Pull supplémentaire requis pour vraie domination niche.",
        "",
        "## Filtres appliqués",
        "",
        "- Keyword matche RGE / CEE / MaPrimeRénov' / rénovation / diagnostic / aides",
        "- Volume mensuel ≥ 50",
        "- Au moins 1 concurrent rank top 30",
        "- SA absent ou rank > 50",
        "- Score = volume × (1 / (KD + 5)) × (1 / (pos_concurrent + 1))",
        "",
        "## Résumé",
        "",
        f"**{len(out)} keywords actionnables identifiés.**",
        "",
        "### Par catégorie",
        "",
        *[f"- **{c}** : {n}" for c, n in sorted(by_cat.items(), key=lambda x: -x[1])],
        "",
        "## Top 200 opportunités",
        "",
        "| # | Keyword | Cat | Vol/mo | KD | Concurrent (pos) | SA | Score |",
        "|---|---------|-----|--------|-----|------------------|-----|-------|",
        *[
            f"| {i + 1} | {r['keyword'].replace('|', '\\|')} | {','.join(r['categories'])} "
            f"| {r['volume']} | {r['kd']} | {r['best_competitor'].replace('.fr', '')} "
            f"(#{r['best_competitor_position']}) | {r['sa_position'] or '—'} "
            f"| {r['opportunity_score']} |"
            for i, r in enumerate(top)
        ],
        "",
        "## Données complètes",
        "",
        f"JSON : `{json_path}`",
        "",
    ]
    md_path.write_text("\n".join(md_lines), encoding="utf-8")

    print(f"\n[OK] {rows_in} rows scanned, {len(out)} keywords actionnables -> {json_path} + {md_path}")
    print("  Top 5:")
    for r in out[:5]:
        try:
            print(
                f"    [{r['opportunity_score']}] {r['keyword']} "
                f"(vol {r['volume']}, KD {r['kd']}, "
                f"{r['best_competitor']} #{r['best_competitor_position']})"
            )
        except UnicodeEncodeError:
            sys.stdout.buffer.write(
                f"    [{r['opportunity_score']}] {r['keyword']} (vol {r['volume']}, KD {r['kd']}, {r['best_competitor']} #{r['best_competitor_position']})\n".encode(
                    "utf-8", errors="replace"
                )
            )


if __name__ == "__main__":
    main()
