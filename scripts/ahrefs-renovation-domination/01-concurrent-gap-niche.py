#!/usr/bin/env python3
"""
Bloc 1 — Concurrent gap niche RGE/CEE/MaPrimeRénov'

Pull Ahrefs API v3 pour 5 leaders niche absents du dataset existant :
  - effy.fr        (DR 72)
  - heero.fr       (DR 58)
  - sonergia.fr    (DR 49)
  - quelleenergie.fr
  - france-renov.gouv.fr

Endpoints (3) :
  1. /v3/site-explorer/top-pages       — top 200 pages traffic
  2. /v3/site-explorer/organic-keywords — top 500 KW position 1-20
  3. /v3/site-explorer/all-pages-meta   (content-gap proxy via intersection)

Output :
  - tmp/ahrefs/bloc1-{leader}-top-pages.json     (raw cache)
  - tmp/ahrefs/bloc1-{leader}-keywords.json      (raw cache)
  - docs/ahrefs-bloc1-pages-mines-{date}.md      (actionnable)
  - docs/ahrefs-bloc1-keywords-gap-{date}.md     (actionnable)

Cache disque idempotent : re-run = lit le cache, ne re-pull pas.

Usage :
  python scripts/ahrefs-renovation-domination/01-concurrent-gap-niche.py
  python scripts/ahrefs-renovation-domination/01-concurrent-gap-niche.py --refresh   # force re-pull
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import date, datetime
from pathlib import Path
from urllib import parse as urlparse
from urllib import request as urlrequest

# ============================================================================
# CONFIG
# ============================================================================

LEADERS = [
    "effy.fr",
    "sonergia.fr",
    "quelleenergie.fr",
    "france-renov.gouv.fr",
]

SA_TARGET = "servicesartisans.fr"
COUNTRY = "fr"
TODAY = date.today().isoformat()

CACHE_DIR = Path("tmp/ahrefs")
DOCS_DIR = Path("docs")
TOKEN_PATH = Path.home() / ".secrets" / "ahrefs.env"
# Fallback Windows /c/Users/USER/.secrets/ahrefs.env
if not TOKEN_PATH.exists():
    TOKEN_PATH = Path("/c/Users/USER/.secrets/ahrefs.env")
    if not TOKEN_PATH.exists():
        TOKEN_PATH = Path("C:/Users/USER/.secrets/ahrefs.env")

API_BASE = "https://api.ahrefs.com/v3"

# Filtres RGE/CEE/MPR pour scoring relevance
RENO_PATTERNS = [
    re.compile(r"maprimer[eé]nov|ma\s+prime\s+r[eé]nov|prime\s+r[eé]nov", re.I),
    re.compile(r"\bcee\b|certificat.{0,15}d.{0,3}[eé]conomie|coup.{0,5}pouce|prime.{0,5}[eé]nergie", re.I),
    re.compile(r"\brge\b|qualibat|qualipac|qualifelec|qualisol|qualibois|qualit.?enr", re.I),
    re.compile(
        r"r[eé]novation\s*[eé]nerg|isolation|pompe.{0,5}chaleur|chaudi[eè]re|menuiserie|vmc|"
        r"ballon.{0,5}thermo|panneau.{0,5}solaire|photovolta[iï]que|po[eê]le.{0,5}granul",
        re.I,
    ),
    re.compile(r"\bdpe\b|audit\s+[eé]nerg|passoire\s+thermique", re.I),
    re.compile(r"\beco.?pr[eê]t|eco.?ptz|aide.{0,15}r[eé]nov|anah|tva.{0,5}5", re.I),
]


def is_reno_relevant(text: str) -> bool:
    if not text:
        return False
    return any(p.search(text) for p in RENO_PATTERNS)


# Cluster thématique → groupement keywords pour Sprint 3 prioritization
CLUSTER_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("pac", re.compile(r"pompe.{0,5}chaleur|\bpac\b|geotherm|aerotherm", re.I)),
    ("isolation_ext", re.compile(r"isolation\s+(par\s+l.?)?ext[eé]rieur|\bite\b", re.I)),
    ("isolation_combles", re.compile(r"isolation.{0,5}comble|isolation\s+toiture", re.I)),
    ("isolation_murs", re.compile(r"isolation.{0,5}mur(s|\b)|isolation\s+(par\s+l.?)?int[eé]rieur|\biti\b", re.I)),
    ("isolation_sol", re.compile(r"isolation.{0,5}(sol|plancher|vide.?sanitaire|cave)", re.I)),
    ("isolation_other", re.compile(r"isolation|isolant|laine\s+(roche|verre|bois|coton)", re.I)),
    ("vmc", re.compile(r"\bvmc\b", re.I)),
    ("chaudiere", re.compile(r"chaudi[eè]re|condensation|gaz\s+condensation", re.I)),
    ("dpe", re.compile(r"\bdpe\b|diagnostic.{0,5}performance.{0,5}[eé]nerg", re.I)),
    ("audit_energetique", re.compile(r"audit\s+[eé]nerg|audit\s+thermique", re.I)),
    ("passoire", re.compile(r"passoire\s+thermique|logement\s+[eé]nergivore", re.I)),
    ("solaire_pv", re.compile(r"photovolta|panneau\s+solaire", re.I)),
    ("solaire_thermique", re.compile(r"solaire\s+thermique|chauffe.?eau\s+solaire", re.I)),
    ("ballon_thermo", re.compile(r"ballon.{0,5}thermo|chauffe.?eau\s+thermo", re.I)),
    ("poele_granules", re.compile(r"po[eê]le.{0,5}(granul|bois|p[eé]llet)|inserts?", re.I)),
    ("menuiseries", re.compile(r"fen[eê]tre|porte\s+entr[eé]e|baie\s+vitr|menuiserie|double\s+vitrage", re.I)),
    ("toiture", re.compile(r"toiture|couverture|charpente|tuile|ardoise|zinc", re.I)),
    ("aides_mpr", re.compile(r"maprimer[eé]nov|prime\s+r[eé]nov", re.I)),
    ("aides_cee", re.compile(r"\bcee\b|certificat.{0,15}d.{0,3}[eé]conomie|coup.{0,5}pouce|prime.{0,5}[eé]nergie", re.I)),
    ("aides_ecoptz", re.compile(r"eco.?pr[eê]t|eco.?ptz", re.I)),
    ("aides_anah", re.compile(r"\banah\b", re.I)),
    ("aides_tva", re.compile(r"tva.{0,5}5|tva\s+r[eé]duit", re.I)),
    ("rge_label", re.compile(r"\brge\b|qualibat|qualipac|qualifelec|qualisol|qualibois|qualit.?enr", re.I)),
    ("renovation_globale", re.compile(r"r[eé]novation\s+globale|r[eé]novation\s+(compl[eè]te|maison|appart)|mar\b|mon\s+accompagnateur", re.I)),
]


def detect_clusters(kw: str) -> list[str]:
    return [name for name, rx in CLUSTER_PATTERNS if rx.search(kw)] or ["other"]


def find_existing_sa_page(kw: str, app_dir: Path = Path("src/app")) -> str | None:
    """Heuristic match : look for SA pages whose folder name matches keyword tokens.

    Returns relative path under src/app/ if a likely match exists.
    """
    if not app_dir.exists():
        return None
    # Simplified slug from keyword
    slug = re.sub(r"[^\w\s]", "", kw.lower()).strip()
    slug = re.sub(r"\s+", "-", slug)
    # Try direct slug match
    candidates: list[Path] = []
    for sub in app_dir.rglob("page.tsx"):
        rel = str(sub.relative_to(app_dir.parent.parent)).replace("\\", "/")
        # Look for slug or main token in path
        main_token = slug.split("-")[0]
        if main_token and len(main_token) >= 4 and main_token in rel.lower():
            candidates.append(sub)
            if len(candidates) >= 3:
                break
    if not candidates:
        return None
    # Return shortest path (most generic) as primary match
    best = min(candidates, key=lambda p: len(str(p)))
    return str(best).replace("\\", "/")


# ============================================================================
# AHREFS CLIENT
# ============================================================================


def load_token() -> str:
    if not TOKEN_PATH.exists():
        print(f"FATAL: token not found at {TOKEN_PATH}", file=sys.stderr)
        sys.exit(1)
    return TOKEN_PATH.read_text(encoding="utf-8").strip()


def fetch(token: str, endpoint: str, params: dict, retries: int = 3) -> dict:
    qs = urlparse.urlencode(params, safe=",")
    url = f"{API_BASE}{endpoint}?{qs}"
    req = urlrequest.Request(
        url,
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
    )
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            with urlrequest.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            last_err = e
            sleep_s = (2 ** attempt) + 1
            print(f"  WARN attempt {attempt + 1}/{retries} failed: {e}, sleep {sleep_s}s", file=sys.stderr)
            time.sleep(sleep_s)
    raise RuntimeError(f"All retries failed for {url}: {last_err}")


def quota_check(token: str) -> tuple[int, int]:
    data = fetch(token, "/subscription-info/limits-and-usage", {})
    info = data.get("limits_and_usage", {})
    used = info.get("units_usage_workspace", 0)
    limit = info.get("units_limit_workspace", 0)
    return used, limit


# ============================================================================
# BLOC 1.1 — TOP PAGES
# ============================================================================


def pull_top_pages(token: str, leader: str, refresh: bool, limit: int = 200) -> list[dict]:
    cache = CACHE_DIR / f"bloc1-{leader}-top-pages.json"
    if cache.exists() and not refresh:
        print(f"  [CACHE] {leader} top-pages")
        return json.loads(cache.read_text(encoding="utf-8")).get("pages", [])

    print(f"  [PULL] {leader} top-pages limit={limit}")
    data = fetch(
        token,
        "/site-explorer/top-pages",
        {
            "target": leader,
            "country": COUNTRY,
            "limit": limit,
            "select": "url,sum_traffic,keywords,top_keyword,top_keyword_volume,top_keyword_best_position,value,referring_domains",
            "date": TODAY,
        },
    )
    cache.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    time.sleep(1.5)
    return data.get("pages", [])


# ============================================================================
# BLOC 1.2 — ORGANIC KEYWORDS top 20
# ============================================================================


def pull_organic_keywords(
    token: str, leader: str, refresh: bool, batches: int = 4, batch_size: int = 500
) -> list[dict]:
    """Paginate via where sum_traffic < min(prev_batch). API caps at 500/call.

    batches=4 × 500 = up to 2000 KW per leader.
    """
    cache = CACHE_DIR / f"bloc1-{leader}-keywords-v3.json"
    if cache.exists() and not refresh:
        print(f"  [CACHE] {leader} organic-keywords v3")
        return json.loads(cache.read_text(encoding="utf-8")).get("keywords", [])

    select_cols = (
        "keyword,volume,keyword_difficulty,cpc,best_position,best_position_url,"
        "sum_traffic,serp_features,is_commercial,is_informational,is_transactional,is_branded"
    )
    accumulated: list[dict] = []
    seen_kw: set[str] = set()
    max_traffic_cursor: int | None = None

    for b in range(batches):
        and_clauses: list[dict] = [{"field": "best_position", "is": ["lte", 20]}]
        if max_traffic_cursor is not None:
            and_clauses.append({"field": "sum_traffic", "is": ["lt", max_traffic_cursor]})
        where = and_clauses[0] if len(and_clauses) == 1 else {"and": and_clauses}

        print(f"  [PULL] {leader} organic-keywords batch {b + 1}/{batches} (cursor sum_traffic<{max_traffic_cursor})")
        data = fetch(
            token,
            "/site-explorer/organic-keywords",
            {
                "target": leader,
                "country": COUNTRY,
                "limit": batch_size,
                "select": select_cols,
                "where": json.dumps(where),
                "date": TODAY,
                "order_by": "sum_traffic:desc",
            },
        )
        kws = data.get("keywords", [])
        if not kws:
            print(f"    -> empty batch, stopping pagination")
            break

        new_rows = [k for k in kws if k.get("keyword") not in seen_kw]
        for k in new_rows:
            seen_kw.add(k.get("keyword"))
        accumulated.extend(new_rows)

        # Cursor = min sum_traffic in this batch (so next batch is strictly smaller)
        new_cursor = min(k.get("sum_traffic", 0) for k in kws)
        if max_traffic_cursor is not None and new_cursor >= max_traffic_cursor:
            print(f"    -> cursor stuck at {new_cursor}, stopping pagination")
            break
        max_traffic_cursor = new_cursor

        time.sleep(1.5)
        if len(kws) < batch_size:
            print(f"    -> last batch (only {len(kws)} rows), stopping")
            break

    cache.write_text(
        json.dumps({"keywords": accumulated}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"    => {leader} accumulated {len(accumulated)} KW across batches")
    return accumulated


# ============================================================================
# BLOC 1.3 — SA POSITION CHECK (per keyword via overview batch)
# ============================================================================


def pull_sa_keywords(token: str, refresh: bool, limit: int = 1000) -> dict[str, dict]:
    """Get SA's keywords pos<=50 (cannibalisation check + striking distance 21-50)."""
    cache = CACHE_DIR / f"bloc1-sa-keywords-v2.json"
    if cache.exists() and not refresh:
        print("  [CACHE] SA organic-keywords v2")
        kws = json.loads(cache.read_text(encoding="utf-8")).get("keywords", [])
    else:
        print(f"  [PULL] SA organic-keywords limit={limit} pos<=50")
        data = fetch(
            token,
            "/site-explorer/organic-keywords",
            {
                "target": SA_TARGET,
                "country": COUNTRY,
                "limit": limit,
                "select": "keyword,volume,keyword_difficulty,best_position,best_position_url,sum_traffic",
                "where": json.dumps({"field": "best_position", "is": ["lte", 50]}),
                "date": TODAY,
                "order_by": "sum_traffic:desc",
            },
        )
        cache.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        time.sleep(1.5)
        kws = data.get("keywords", [])
    return {row["keyword"].lower(): row for row in kws}


# ============================================================================
# ANALYSIS
# ============================================================================


def analyze_pages_mines(per_leader_pages: dict[str, list[dict]]) -> list[dict]:
    """Aggregate top pages from all leaders, score by traffic × reno-relevance."""
    aggregated: list[dict] = []
    for leader, pages in per_leader_pages.items():
        for p in pages:
            top_kw = p.get("top_keyword") or ""
            url = p.get("url") or ""
            if not is_reno_relevant(top_kw) and not is_reno_relevant(url):
                continue
            traffic = p.get("sum_traffic", 0) or 0
            value = p.get("value", 0) or 0
            kw_count = p.get("keywords", 0) or 0
            top_vol = p.get("top_keyword_volume", 0) or 0
            top_pos = p.get("top_keyword_best_position") or 99
            rd = p.get("referring_domains", 0) or 0
            score = traffic * (1 / max(top_pos, 1)) * (1 + min(kw_count, 100) / 100)
            aggregated.append(
                {
                    "leader": leader,
                    "url": url,
                    "top_keyword": top_kw,
                    "top_keyword_volume": top_vol,
                    "top_keyword_position": top_pos,
                    "monthly_traffic": traffic,
                    "monthly_value_eur": value,
                    "keyword_count": kw_count,
                    "referring_domains": rd,
                    "page_mine_score": round(score, 2),
                }
            )
    aggregated.sort(key=lambda r: r["page_mine_score"], reverse=True)
    return aggregated


def analyze_keyword_gap(
    per_leader_kws: dict[str, list[dict]], sa_kws: dict[str, dict]
) -> list[dict]:
    """Keywords où >=1 leader rank top 10 et SA absent ou >50."""
    by_kw: dict[str, dict] = {}
    for leader, kws in per_leader_kws.items():
        for k in kws:
            kw = (k.get("keyword") or "").strip()
            if not kw:
                continue
            if not is_reno_relevant(kw):
                continue
            intents = []
            if k.get("is_commercial"):
                intents.append("commercial")
            if k.get("is_informational"):
                intents.append("informational")
            if k.get("is_transactional"):
                intents.append("transactional")
            if k.get("is_branded"):
                intents.append("branded")
            entry = by_kw.setdefault(
                kw,
                {
                    "keyword": kw,
                    "volume": k.get("volume") or 0,
                    "kd": k.get("keyword_difficulty") or 0,
                    "cpc": k.get("cpc") or 0,
                    "intents": intents,
                    "serp_features": k.get("serp_features") or [],
                    "leaders": [],
                },
            )
            entry["leaders"].append(
                {
                    "leader": leader,
                    "position": k.get("best_position"),
                    "url": k.get("best_position_url"),
                    "traffic": k.get("sum_traffic", 0),
                }
            )

    out: list[dict] = []
    for kw, entry in by_kw.items():
        sa_row = sa_kws.get(kw.lower())
        sa_pos = (sa_row or {}).get("best_position")
        sa_url = (sa_row or {}).get("best_position_url")

        # Skip true cannibalisation : SA already top 20 (we'd just be optimising existing)
        if sa_pos and sa_pos <= 20:
            continue

        leaders_top10 = [l for l in entry["leaders"] if (l["position"] or 99) <= 10]
        if not leaders_top10:
            continue

        best = min(leaders_top10, key=lambda l: l["position"])
        vol = entry["volume"]
        kd = entry["kd"]
        n_leaders_top10 = len(leaders_top10)

        # Status flag : "absent", "striking_distance" (SA pos 21-50), "deep" (SA > 50)
        if sa_pos is None:
            sa_status = "absent"
            distance_boost = 1.0
        elif sa_pos <= 50:
            sa_status = "striking_distance"
            distance_boost = 1.5  # easier to push from 25→10 than from absent→top
        else:
            sa_status = "deep"
            distance_boost = 0.8

        score = vol * (1 / (kd + 5)) * (1 / (best["position"] + 1)) * (1 + n_leaders_top10 * 0.3) * distance_boost

        clusters = detect_clusters(kw)
        existing_page = find_existing_sa_page(kw) if sa_status == "absent" else None

        out.append(
            {
                "keyword": kw,
                "clusters": clusters,
                "volume": vol,
                "kd": kd,
                "cpc": entry["cpc"],
                "best_leader": best["leader"],
                "best_leader_position": best["position"],
                "best_leader_url": best["url"],
                "leaders_in_top10": n_leaders_top10,
                "all_leaders": [{"leader": l["leader"], "pos": l["position"]} for l in entry["leaders"]],
                "sa_position": sa_pos,
                "sa_url": sa_url,
                "sa_status": sa_status,
                "sa_existing_page_match": existing_page,
                "intents": entry["intents"],
                "serp_features": entry["serp_features"],
                "opportunity_score": round(score, 2),
            }
        )
    out.sort(key=lambda r: r["opportunity_score"], reverse=True)
    return out


# ============================================================================
# OUTPUT
# ============================================================================


def write_pages_mines_md(rows: list[dict]) -> Path:
    path = DOCS_DIR / f"ahrefs-bloc1-pages-mines-{TODAY}.md"
    by_leader: dict[str, int] = {}
    for r in rows:
        by_leader[r["leader"]] = by_leader.get(r["leader"], 0) + 1
    top = rows[:100]
    lines = [
        "# Pages-mines RGE/CEE/MPR — top pages traffic des leaders niche",
        "",
        f"**Date** : {TODAY}",
        f"**Leaders pullés** : {', '.join(LEADERS)}",
        f"**Filtre** : top_keyword OU url matche RGE/CEE/MaPrimeRénov'/rénovation",
        f"**Total pages-mines identifiées** : {len(rows)}",
        "",
        "## Répartition par leader",
        "",
        *[f"- **{leader}** : {n} pages" for leader, n in sorted(by_leader.items(), key=lambda x: -x[1])],
        "",
        "## Top 100 pages-mines (à cloner ou inspirer)",
        "",
        "| # | Leader | URL | Top KW | Vol | Pos | Trafic/mo | Valeur €/mo | Nb KW | RD | Score |",
        "|---|--------|-----|--------|-----|-----|-----------|-------------|-------|-----|-------|",
        *[
            f"| {i + 1} | {r['leader']} | [link]({r['url']}) | {r['top_keyword']} "
            f"| {r['top_keyword_volume']} | {r['top_keyword_position']} "
            f"| {r['monthly_traffic']} | {r['monthly_value_eur']} | {r['keyword_count']} "
            f"| {r['referring_domains']} | {r['page_mine_score']} |"
            for i, r in enumerate(top)
        ],
        "",
        "## Action recommandée",
        "",
        "- Pour chaque page-mine top 50 : créer une page SA équivalente OU améliorée (Sprint 3 fuel)",
        "- Cibles prioritaires : KW vol >= 1000, leader pos 1-3, kw_count >= 50 (= cluster fertile)",
        "- Vérifier si SA a déjà une page sur ce sujet → si oui : audit & rewrite, sinon : créer",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def write_keyword_gap_md(rows: list[dict]) -> Path:
    path = DOCS_DIR / f"ahrefs-bloc1-keywords-gap-{TODAY}.md"

    # Split by SA status for actionable buckets
    striking = [r for r in rows if r["sa_status"] == "striking_distance"]
    absent = [r for r in rows if r["sa_status"] == "absent"]
    deep = [r for r in rows if r["sa_status"] == "deep"]

    by_intent: dict[str, int] = {}
    for r in rows:
        for it in r.get("intents") or []:
            by_intent[it] = by_intent.get(it, 0) + 1

    by_cluster: dict[str, list[dict]] = {}
    for r in rows:
        for c in r.get("clusters") or ["other"]:
            by_cluster.setdefault(c, []).append(r)

    def render_row(i: int, r: dict) -> str:
        sa_pos_suffix = f" (#{r['sa_position']})" if r.get("sa_position") else ""
        kw_safe = r["keyword"].replace("|", "\\|")
        clusters_str = ",".join(r.get("clusters") or [])
        existing = (r.get("sa_existing_page_match") or "—")[:60]
        return (
            f"| {i + 1} | {kw_safe} | {clusters_str} | {r['volume']} | {r['kd']} "
            f"| {r['best_leader']} (#{r['best_leader_position']}) "
            f"| {r['leaders_in_top10']} | {r['sa_status']}{sa_pos_suffix} "
            f"| {existing} | {r['opportunity_score']} |"
        )

    def render_table(items: list[dict], n: int) -> list[str]:
        return [
            "| # | Keyword | Clusters | Vol | KD | Best leader (pos) | #lead top10 | SA status | Existing page | Score |",
            "|---|---------|----------|-----|-----|-------------------|-------------|-----------|---------------|-------|",
            *[render_row(i, r) for i, r in enumerate(items[:n])],
        ]

    # Cluster summary with vol cumulé
    cluster_summary = []
    for c, items in by_cluster.items():
        total_vol = sum(r["volume"] for r in items)
        avg_kd = sum(r["kd"] for r in items) / max(len(items), 1)
        cluster_summary.append((c, len(items), total_vol, round(avg_kd, 1)))
    cluster_summary.sort(key=lambda x: -x[2])  # by total vol

    # Existing page hit rate
    existing_count = sum(1 for r in rows if r.get("sa_existing_page_match"))

    lines = [
        "# Keyword gap niche RGE/CEE/MPR v3 — leaders rank top 10, SA pos > 20",
        "",
        f"**Date** : {TODAY}",
        f"**Leaders pullés** : {', '.join(LEADERS)} (Heero exclu : 6% reno-relevant)",
        f"**Filtre** : KW matche RGE/CEE/MPR, ≥1 leader top 10, SA absente ou pos > 20",
        f"**Pagination** : 4 batches × 500 = jusqu'à 2000 KW/leader (cap API 500/call)",
        f"**Cross-ref SA** : pos≤50 limit 1000",
        f"**Total keywords actionnables** : {len(rows)}",
        f"  - **{len(striking)} striking distance** (SA pos 21-50, × 1.5 boost)",
        f"  - **{len(absent)} absent** (SA totalement hors top 50)",
        f"  - **{len(deep)} deep** (SA pos > 50, × 0.8 boost)",
        f"**Pages SA existantes détectées** : {existing_count}/{len(rows)} ({100 * existing_count // max(len(rows), 1)}%)",
        "",
        "## Répartition par intent",
        "",
        *[f"- **{i}** : {n}" for i, n in sorted(by_intent.items(), key=lambda x: -x[1])],
        "",
        "## Répartition par cluster thématique (trié par volume cumulé)",
        "",
        "| Cluster | Nb KW | Vol cumulé/mo | KD moyen |",
        "|---------|-------|---------------|----------|",
        *[f"| {c} | {n} | {vol} | {kd} |" for c, n, vol, kd in cluster_summary],
        "",
        "---",
        "",
        f"## 🎯 BUCKET 1 — STRIKING DISTANCE (top 100, {len(striking)} total)",
        "",
        "**Push prioritaire** : SA déjà sur la page, juste optimisation/maillage à faire pour passer top 10.",
        "",
        *render_table(striking, 100),
        "",
        "---",
        "",
        f"## 🚀 BUCKET 2 — ABSENT (top 200, {len(absent)} total)",
        "",
        "**Pages-mines à créer** : SA totalement absente. Effort flagship complet.",
        "**Existing page** : si non `—`, page candidate dans `src/app/` à enrichir au lieu de créer.",
        "",
        *render_table(absent, 200),
        "",
        "---",
        "",
        f"## ⚠️ BUCKET 3 — DEEP (top 50, {len(deep)} total)",
        "",
        "**Effort lourd** : SA déjà rank > 50, page existe mais sous-performe. Audit avant rewrite.",
        "",
        *render_table(deep, 50),
        "",
        "## Action recommandée",
        "",
        "- **Bucket 1 (striking)** : 1-2 sem effort = audit page existante + rewrite + maillage interne. ROI immédiat.",
        "- **Bucket 2 (absent)** : flagship Sprint 3, 1 KW = 1 page. Cible top 50 vol >= 500.",
        "- **Bucket 3 (deep)** : audit avant rewrite, possiblement page mal ciblée.",
        "- KW avec ≥3 leaders top 10 = très fertiles (consensus = vraie demande).",
        "- Si SERP features = `featured_snippet|paa` → câbler TldrBlock + EnBrefBox + FAQ Schema.",
        "- **Cluster top 3 par volume cumulé** = candidats hub pages prioritaires.",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


# ============================================================================
# MAIN
# ============================================================================


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh", action="store_true", help="Force re-pull (ignore cache)")
    args = parser.parse_args()

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    token = load_token()

    used_before, limit = quota_check(token)
    print(f"\n[QUOTA] used={used_before}/{limit} ({limit - used_before} dispo)")
    if limit - used_before < 50000:
        print(f"WARNING: only {limit - used_before} units left, may be insufficient", file=sys.stderr)

    print("\n=== BLOC 1.1 — TOP PAGES ===")
    per_leader_pages: dict[str, list[dict]] = {}
    for leader in LEADERS:
        per_leader_pages[leader] = pull_top_pages(token, leader, args.refresh)

    print("\n=== BLOC 1.2 — ORGANIC KEYWORDS top 20 ===")
    per_leader_kws: dict[str, list[dict]] = {}
    for leader in LEADERS:
        per_leader_kws[leader] = pull_organic_keywords(token, leader, args.refresh)

    print("\n=== BLOC 1.3 — SA KEYWORDS (cross-ref) ===")
    sa_kws = pull_sa_keywords(token, args.refresh)

    print("\n=== ANALYSIS ===")
    pages_mines = analyze_pages_mines(per_leader_pages)
    keyword_gap = analyze_keyword_gap(per_leader_kws, sa_kws)

    pm_path = write_pages_mines_md(pages_mines)
    kg_path = write_keyword_gap_md(keyword_gap)

    used_after, _ = quota_check(token)
    consumed = used_after - used_before

    striking = sum(1 for r in keyword_gap if r["sa_status"] == "striking_distance")
    absent = sum(1 for r in keyword_gap if r["sa_status"] == "absent")
    deep = sum(1 for r in keyword_gap if r["sa_status"] == "deep")

    print(f"\n[OK] Pages-mines: {len(pages_mines)} -> {pm_path}")
    print(f"[OK] Keyword gap: {len(keyword_gap)} (striking={striking}, absent={absent}, deep={deep}) -> {kg_path}")
    print(f"[QUOTA] consumed={consumed} units, remaining={limit - used_after}")

    print("\n--- TOP 5 PAGES-MINES ---")
    for r in pages_mines[:5]:
        try:
            print(f"  [{r['page_mine_score']}] {r['leader']} - {r['top_keyword']} (vol {r['top_keyword_volume']}, traf {r['monthly_traffic']}/mo)")
        except UnicodeEncodeError:
            sys.stdout.buffer.write(
                f"  [{r['page_mine_score']}] {r['leader']} - {r['top_keyword']} (vol {r['top_keyword_volume']}, traf {r['monthly_traffic']}/mo)\n".encode(
                    "utf-8", errors="replace"
                )
            )

    print("\n--- TOP 5 KEYWORD GAP ---")
    for r in keyword_gap[:5]:
        try:
            print(f"  [{r['opportunity_score']}] {r['keyword']} (vol {r['volume']}, KD {r['kd']}, {r['best_leader']} #{r['best_leader_position']})")
        except UnicodeEncodeError:
            sys.stdout.buffer.write(
                f"  [{r['opportunity_score']}] {r['keyword']} (vol {r['volume']}, KD {r['kd']}, {r['best_leader']} #{r['best_leader_position']})\n".encode(
                    "utf-8", errors="replace"
                )
            )


if __name__ == "__main__":
    main()
