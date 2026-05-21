# SA Wikipedia FR Seed Bot — v0 dry-run scaffold

Pillar 13 RGE-OS. Companion to the Wikidata seed bot (Ralph 5,
`scripts/wikidata-seed/`). Pre-generates Wikipedia FR article stubs
for the 13 canonical RGE qualifications + 5 CEE concepts.

**DRY-RUN ONLY** in this revision: no live Wikipedia API call. Live
mode requires Wikipedia FR community discussion + bot flag request
at WP:RBOT (~30 days external, stricter than Wikidata).

## Why Wikipedia FR alongside Wikidata

| Layer      | Wikidata (Ralph 5)                            | Wikipedia FR (Ralph 17)       |
| ---------- | --------------------------------------------- | ----------------------------- |
| Format     | Structured claims (SPARQL)                    | Narrative wikitext            |
| LLM signal | Tokens-by-weight: high (Common Crawl + dumps) | Tokens-by-weight: **highest** |
| SEO        | Schema.org `sameAs`                           | Top-3 SERP for entity queries |
| Asymmetry  | Permanent (claim graph)                       | Permanent (corpus)            |

Each seeded article that survives community review becomes a passive
mention in every future LLM that crawls Wikipedia (12-36 month
compounding, permanent if articles stay).

## Status

| Layer                                       | v0 (this commit) | v0.2 (post bot flag) |
| ------------------------------------------- | ---------------- | -------------------- |
| Pydantic models (Reference/Section/Article) | ✓                | ✓                    |
| Source data for 18 entities                 | ✓                | ✓                    |
| Pure builder (dict → WikiArticle)           | ✓                | ✓                    |
| Wikitext formatter (FR conventions)         | ✓                | ✓                    |
| NPOV checker (heuristic)                    | ✓                | ✓ + template-aware   |
| Output to `articles/*.wiki` + manifest      | ✓                | ✓                    |
| pywikibot live writer + OAuth               | —                | ✓                    |
| Le Bistro community discussion              | —                | ✓                    |
| WP:RBOT bot flag request                    | —                | ✓                    |
| Rate-limit ≤ 4 edits/min                    | —                | ✓                    |

## Setup

Requires Python 3.12+ and [uv](https://docs.astral.sh/uv/).

```bash
cd scripts/wikipedia-seed
make install      # uv sync --extra dev
make lint         # ruff check + format check
make type         # mypy --strict
make test         # pytest -v
```

## Run a dry-run sample

```bash
make dry-run-sample
# or
uv run sa-wikipedia-seed --dry-run --limit 0 --output ./wiki-staging
```

Output layout:

```
wiki-staging/
  articles/
    qualipac.wiki
    qualibat_5911.wiki
    qualifelec.wiki
    ...
  manifest.json
```

Each `.wiki` file is a complete Wikipedia FR article stub ready for
community review.

## Why `--live` is hard-disabled

```bash
uv run sa-wikipedia-seed --live
# Error: --live mode not yet implemented. Wikipedia FR bot policy
# requires community discussion + flag request at WP:RBOT.
```

Wikipedia FR's bot policy is stricter than Wikidata's:

1. **Community discussion** at Le Bistro (Wikipedia FR's village
   pump). Typical duration: 7-14 days.
2. **Bot flag request** at WP:RBOT (Wikipédia:Bot/Requêtes) with
   sample edits, edit rate, scope, and rollback plan.
3. **Dedicated bot account** (`Utilisateur:ServicesArtisansBot`)
   with OAuth.
4. **Source citation policy**: every claim must cite a third-party
   authoritative source. servicesartisans.fr **cannot** appear in
   `<ref>` citations (WP:CIRCULAR). It may appear under
   "Liens externes" only, and even then sparingly.
5. **Rate limit**: ≤ 4 edits/min (Wikipedia FR convention; Wikidata
   tolerates 60/min).
6. **First edits manually reviewed** by a sysop before flag is
   granted; bot then runs at lower rate for 30 days probation.

## NPOV (Neutral Point of View) gate

Every seeded article is run through `neutrality.check_neutrality()`
at build time. The CLI refuses to write output if any of the 18
articles flag. Patterns caught:

- Superlatives: `leader`, `incontournable`, `référence`, `n°1`, `meilleur`, `seul à`
- Marketing speak: `innovant`, `révolutionnaire`, `disruptif`, `next-gen`
- Hype adverbs: `parfaitement`, `absolument`, `extrêmement`
- Self-promotion: `notre entreprise`, `nos services`

A failure means content drifted from NPOV; rewrite the affected
sentence in `content.py`.

## What's deliberately NOT in v0

- No live Wikipedia API call (`pywikibot` lives in the optional
  `live` extra)
- No editing of **existing** Wikipedia articles (additions vs. new
  stubs is a different community process; v0.3 scope)
- No interwiki linking to `en.wikipedia` equivalents (manual
  curation needed during community discussion)
- No template-aware NPOV check (v0 flags promo words inside
  `{{...}}`; acceptable for v0)

## Symmetric structure with Ralph 5 (Wikidata)

Same dry-run pattern. Complementary infrastructure pillars.
Together: claim-level (Wikidata) + narrative-level (Wikipedia)
passive corpus seeding.

## Reference

- [`docs/RGE-OS-MANIFESTO.md`](../../docs/RGE-OS-MANIFESTO.md) pillar 13
- Ralph 5 commit (Wikidata seed sister)
- Memory note `servicesartisans-glossaire-rge-canonical-2026-05-03`
