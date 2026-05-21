# SA Wikidata RGE Seed Bot — v0 dry-run scaffold

Pilier 12 RGE-OS. First code commit for seeding ~49 228 RGE provider
entities into Wikidata. **DRY-RUN ONLY** in this revision: no live
Wikidata API call, no Postgres connection, no real provider data.

Goal of v0: ship the typed, tested pipeline so the live upload layer
(v0.2) drops in cleanly the moment Wikidata bot policy approval lands.

## Status

| Layer                                    | v0 (this commit) | v0.2 (post bot approval) |
| ---------------------------------------- | ---------------- | ------------------------ |
| Pydantic schema (ProviderRow / ClaimSet) | ✓                | ✓                        |
| Pure builder (row → claim set)           | ✓                | ✓                        |
| Mock-fixture extractor                   | ✓                | ✓                        |
| JSONL writer                             | ✓                | ✓                        |
| In-memory checkpoint                     | ✓                | ✓ (still used in tests)  |
| Postgres extractor (psycopg)             | —                | ✓                        |
| Postgres checkpoint table                | —                | ✓                        |
| pywikibot live writer + OAuth            | —                | ✓                        |
| Rate-limit ≤60 edits/min                 | —                | ✓                        |
| Sentry observability                     | —                | ✓                        |

## Setup

Requires Python 3.12+ and [uv](https://docs.astral.sh/uv/).

```bash
cd scripts/wikidata-seed
make install      # uv sync --extra dev
make lint         # ruff check + format check
make type         # mypy --strict
make test         # pytest -v
```

## Run a dry-run sample

```bash
make dry-run-sample
# or
uv run sa-wikidata-seed --dry-run --limit 10 --output sample.jsonl
```

Then inspect:

```bash
head -1 sample.jsonl | python -m json.tool
```

Each JSONL line is a `WikidataClaimSet` (Pydantic-serialised) containing:

- `labels` in FR/EN/DE/ES/IT
- `descriptions` in FR + EN
- `statements[]` with property + value + qualifiers + references
- Every statement references the ADEME RGE dataset via `P248` + a
  retrieval date via `P813`, so any reviewer can verify the data
  back to the open source.

## Why `--live` is hard-disabled

```bash
uv run sa-wikidata-seed --live
# Error: --live mode not yet implemented. Bot policy approval pending.
```

This is intentional. Live mode requires:

1. **Bot policy approval** on Wikidata (typically 7-14 days external).
   File a request at `Wikidata:Requests for permissions/Bot` with
   scope, source dataset, and rate-limit policy.
2. **Dedicated bot account** (`User:ServicesArtisansBot`) with OAuth 2.0.
3. **ADEME RGE dataset Q-item**: create a dedicated Q-item (community
   proposal) so the placeholder `Q.ADEME_RGE_DATASET` resolves to a
   real entity for `P248` references.
4. **RGE organism Q-items**: same for Qualibat / Qualifelec / Qualit'EnR /
   QualiPAC / OPQIBI placeholders in `vocab.RGE_ORGANISM_QIDS`.
5. **Custom property proposal** (optional) for an RGE-qualification
   property; until then the bot maps qualifs to `P31` sub-statements
   with organism + date qualifiers.
6. **Postgres connection** via `psycopg` (optional `live` extra).
7. **Postgres checkpoint table** `wikidata_seed_progress (siret PK,
wikidata_qid, last_synced_at, claim_hash)` for idempotent re-runs.
8. **Rate limit** ≤60 edits/min (Wikimedia politeness baseline).
9. **Sentry** `wikidata.seed.success` / `wikidata.seed.error` metrics.

The full live-mode plan lives in [`docs/WIKIDATA-SEED-BOT-PLAN.md`](../../docs/WIKIDATA-SEED-BOT-PLAN.md).

## Wikidata property surface

Bot policy reviewers can audit the full property set in
[`src/sa_wikidata/vocab.py`](src/sa_wikidata/vocab.py). The bot only
ever touches these properties:

| Property | Meaning                          | Source                                |
| -------- | -------------------------------- | ------------------------------------- |
| P31      | instance of                      | computed (business + RGE sub-claims)  |
| P3215    | SIRET                            | `providers.siret`                     |
| P1320    | SIREN                            | `providers.siren`                     |
| P17      | country                          | constant Q142 (France)                |
| P131     | located in administrative entity | `providers.code_insee`                |
| P625     | coordinate location              | `providers.{latitude,longitude}`      |
| P973     | described at URL                 | `providers.sa_public_url`             |
| P580     | start time (qualifier)           | `rge_qualifications[].date_debut`     |
| P582     | end time (qualifier)             | `rge_qualifications[].date_fin`       |
| P248     | stated in (reference)            | constant Q (ADEME RGE dataset Q-item) |
| P854     | reference URL                    | ADEME data.gouv.fr URL                |
| P813     | retrieval date (reference)       | run timestamp                         |
| P2807    | NAICS classification (≈ NAF FR)  | `providers.naf_code`                  |

No labels of existing high-profile Wikidata entities (France, Paris,
etc.) are ever touched. The bot only creates/updates SA seed entities
themselves.

## Idempotence

- `read_mock_fixtures` validates every row through Pydantic strict mode.
- `build_claim_set` is pure (no I/O); same input → same output.
- `InMemoryCheckpoint` skips already-processed SIRETs within a run.
- `WikidataClaimSet.existing_qid` (default `None`) lets the future live
  writer distinguish CREATE vs UPDATE without re-querying Wikidata.

## Tests

```bash
make test
```

Covers:

- `tests/test_builder.py` — 18 tests on the pure builder
  (required statements, optional statements, qualifiers, references,
  retrieval date propagation, Luhn warning path, ValidationError).
- `tests/test_extract.py` — 6 tests on fixture loading
  (limit, invalid SIRET → ValidationError, edge-case coverage).
- `tests/test_output.py` — 5 tests on JSONL writer
  (line count, valid JSON per line, UTF-8 round-trip, parent
  directory creation, empty input).

## Reference

- [`docs/RGE-OS-MANIFESTO.md`](../../docs/RGE-OS-MANIFESTO.md) — pilier 12
- [`docs/WIKIDATA-SEED-BOT-PLAN.md`](../../docs/WIKIDATA-SEED-BOT-PLAN.md)
- Memory note `servicesartisans-glossaire-rge-canonical-2026-05-03`
