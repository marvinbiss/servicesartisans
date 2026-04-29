# SEO Baseline & Canary — Phase 0 ULTRA DOMINATION SEO

This directory holds **immutable baselines** for the Phase 0 gate
(`+50% clics J+30`) of the ULTRA DOMINATION SEO v2 plan
(see memory `servicesartisans-ultra-domination-seo-v2-2026-04-28`).

## Files

| File                             | Purpose                                                       | Mutable? |
| -------------------------------- | ------------------------------------------------------------- | -------- |
| `baseline-template.csv`          | Empty template Marvin pastes GSC data into                    | yes      |
| `baseline-2026-04-29.csv`        | Frozen snapshot produced by `baseline-snapshot.ts`            | **NO**   |
| `baseline-2026-04-29.summary.md` | Human-readable KPI summary (top 50 URLs, pilot cities)        | **NO**   |
| `baseline-2026-04-29.sha256`     | SHA-256 of the frozen CSV (tamper detection)                  | **NO**   |
| `pilot-cities-2026-04-29.json`   | 5 pilot villes × 3 services = 15 URLs targeted by Sprint 0.1  | **NO**   |
| `fingerprints-2026-04-29.json`   | DOM/JSON-LD fingerprints of pilot URLs (regression detection) | **NO**   |

## Workflow — baseline (J+0)

```bash
# 1. Marvin: GSC → Performance → Pages → Export CSV
# 2. Paste rows into data/seo/baseline-template.csv (matching the schema)
# 3. Run snapshot script:
npx tsx scripts/seo/baseline-snapshot.ts data/seo/baseline-template.csv

# Outputs (immutable):
#   data/seo/baseline-2026-04-29.csv
#   data/seo/baseline-2026-04-29.summary.md
#   data/seo/baseline-2026-04-29.sha256
```

## Workflow — canary fingerprints (J+0 and J+N)

```bash
# Capture J+0 fingerprints (before Sprint 0.1 ships):
npx tsx scripts/seo/canary-fingerprint.ts

# Default base URL: https://servicesartisans.fr
# Override:
BASELINE_BASE_URL=https://staging.example.com npx tsx scripts/seo/canary-fingerprint.ts

# After Sprint 0.1 deploys, diff against baseline:
npx tsx scripts/seo/canary-fingerprint.ts --diff data/seo/fingerprints-2026-04-29.json
```

## Filter scope (baseline)

The snapshot script keeps **only** SEO-significant paths:

- `/` (homepage)
- `/rge`, `/rge/...`
- `/aides`, `/aides/...`
- `/services/...`
- `/villes/...`

Everything else (admin, API, espace-client, espace-artisan, etc.) is dropped.

## Gate verification (J+30)

1. Marvin pastes a fresh GSC export covering 2026-04-29 → 2026-05-27.
2. Save as `data/seo/baseline-template.csv` (or rename the prior baseline-template).
3. Run snapshot with explicit output suffix:
   ```bash
   npx tsx scripts/seo/baseline-snapshot.ts data/seo/baseline-template.csv 2026-05-29
   ```
4. Compare `baseline-2026-05-29.summary.md` total clicks vs `baseline-2026-04-29.summary.md`.
5. Gate **passes** if total clicks (filtered scope) ≥ 1.5 × baseline.

## Anti-tampering

`baseline-2026-04-29.sha256` is the SHA-256 of the immutable CSV.
Any reviewer can verify with:

```bash
sha256sum data/seo/baseline-2026-04-29.csv
# or on Windows
certutil -hashfile data/seo/baseline-2026-04-29.csv SHA256
```

The hash must match the file content of `baseline-2026-04-29.sha256`.
