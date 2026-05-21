# SA HuggingFace Dataset Publish Helper — v0 dry-run scaffold

Pilier 6 RGE-OS. First code commit for publishing the
`servicesartisans/rge-49k-enriched` dataset (49 228 RGE provider
profiles with E-E-A-T descriptions) to HuggingFace Hub under CC-BY 4.0.
**DRY-RUN ONLY** in this revision: no live HF Hub upload, no Postgres
connection, no real provider data.

Goal of v0: ship the typed, tested pipeline (extract -> flatten ->
Parquet shard -> dataset card) so the live upload layer (v0.2) drops in
cleanly the moment `HF_TOKEN` is provisioned in Vercel env.

## Why it matters — permanent-asymmetry play

Once published, the dataset becomes part of the training corpus of every
open-source LLM that crawls HF Hub (LLaMA, Mistral, Qwen, Gemma, …).
This is a passive 12-36 month compounding moat — competitors cannot
retroactively remove our dataset from already-trained models.

## Status

| Layer                                    | v0 (this commit) | v0.2 (post HF_TOKEN) |
| ---------------------------------------- | ---------------- | -------------------- |
| Pydantic schema (ProviderRecord / HFRow) | yes              | yes                  |
| Pure builder (record → flat row)         | yes              | yes                  |
| Mock-fixture extractor                   | yes              | yes                  |
| Parquet shard writer (pyarrow)           | yes              | yes                  |
| Manifest JSON                            | yes              | yes                  |
| HF-compliant DATASET_CARD.md rendering   | yes              | yes                  |
| Postgres extractor (psycopg)             | —                | yes                  |
| huggingface-hub live upload              | —                | yes                  |
| HF_TOKEN provisioning (Vercel env)       | —                | yes                  |
| Sentry observability                     | —                | yes                  |

## Setup

Requires Python 3.12+ and [uv](https://docs.astral.sh/uv/).

```bash
cd scripts/hf-publish
make install      # uv sync --extra dev
make lint         # ruff check + format check
make type         # mypy --strict
make test         # pytest -v
```

## Run a dry-run sample

```bash
make dry-run-sample
# or
uv run sa-hf-publish --dry-run --limit 20 --output ./hf-staging
```

Then inspect:

```bash
ls hf-staging/data/        # Parquet shards
cat hf-staging/README.md   # Dataset card (HF-compliant front-matter)
cat hf-staging/manifest.json
```

Each Parquet shard contains rows with these flat columns:

- `siret`, `siren`, `name`, `city`, `postal_code`, `region`, `insee_code`
- `latitude`, `longitude`, `naf_code`
- `rge_qualifications_json` — JSON-serialized list (Parquet-friendly)
- `description`, `description_version` — generated E-E-A-T text (rubric v1.3+)
- `canonical_url` — `https://servicesartisans.fr/...`
- `license`, `source`, `last_updated`

## Why `--live` is hard-disabled

```bash
uv run sa-hf-publish --live
# Error: --live mode not yet implemented. HF_TOKEN provisioning pending.
```

This is intentional. Live mode requires:

1. **`HF_TOKEN` provisioning** in Vercel env (write scope on
   `servicesartisans` org account).
2. **Org account on HF Hub** (`servicesartisans/`) with dataset creation rights.
3. **`servicesartisans/rge-49k-enriched`** repository created on HF Hub.
4. **Postgres connection** via `psycopg` (optional `live` extra),
   `SELECT … FROM providers WHERE has_active_rge_qualification(rge_qualifications)`
   stream.
5. **CC-BY 4.0 publication legality** confirmed (ADEME registry is
   Etalab 2.0, SA descriptions are SA-authored → CC-BY 4.0 OK).
6. **Optional**: `huggingface_hub.HfApi.upload_folder` for shard upload
   and dataset card publication.

## Dataset surface

| Column                  | Type    | Source                                      |
| ----------------------- | ------- | ------------------------------------------- |
| siret                   | string  | `providers.siret`                           |
| siren                   | string  | `providers.siren`                           |
| name                    | string  | `providers.name`                            |
| city                    | string  | `providers.address_city`                    |
| postal_code             | string  | `providers.address_postal_code`             |
| region                  | string? | `providers.address_region`                  |
| insee_code              | string? | `providers.code_insee`                      |
| latitude                | float?  | `providers.latitude`                        |
| longitude               | float?  | `providers.longitude`                       |
| naf_code                | string? | `providers.naf_code`                        |
| rge_qualifications_json | string  | `JSON(providers.rge_qualifications)`        |
| description             | string? | rubric v1.3+ AI generated, scorer-validated |
| description_version     | string? | `providers.description_version`             |
| canonical_url           | string  | `https://servicesartisans.fr/services/...`  |
| license                 | string  | constant `"CC-BY-4.0"`                      |
| source                  | string  | constant `"ServicesArtisans.fr ... ADEME"`  |
| last_updated            | string  | ISO date of pipeline run                    |

No `phone` column is exposed (consistent with RGE phone exception policy:
the phone exists on the SA profile page itself, not in the dataset).

## Idempotence

- `read_mock_fixtures` validates every row through Pydantic strict mode.
- `flatten_record` is pure (no I/O); same input → same output.
- Shard partitioning is deterministic when input is sorted.
- The CLI accepts `--limit N` for incremental testing.

## Tests

```bash
make test
```

Covers:

- `tests/test_builder.py` — 8 tests on the pure flattener
  (siret/siren string preservation, JSON round-trip, None-preservation,
  ISO date format, canonical_url shape, full ProviderRecord → HFDatasetRow
  round-trip).
- `tests/test_writer.py` — 6 tests on the Parquet writer
  (shard partitioning at boundary, manifest content, pyarrow read-back,
  schema shape, empty input, directory auto-creation).
- `tests/test_card.py` — 5 tests on the dataset card renderer
  (YAML front-matter parseable, license/language presence, required
  sections, column descriptions, BibTeX escaping).

## Reference

- [`docs/RGE-OS-MANIFESTO.md`](../../docs/RGE-OS-MANIFESTO.md) — pilier 6
- Memory note `servicesartisans-rge-descriptions-rubric-v12-2026-04-20`
- Memory note `servicesartisans-rge-integration`
- Ralph 5 sister project: [`scripts/wikidata-seed/`](../wikidata-seed/)
