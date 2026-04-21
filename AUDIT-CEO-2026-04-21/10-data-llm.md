# Audit Data & LLM Pipelines — ServicesArtisans 2026-04-21

**Verdict : 4.2/10 — pipeline LLM robuste mais 4 risques critiques non-mitigés**

## Top 10 risques

### P0

1. **Zéro validation schema Zod pre-INSERT** — `src/lib/descriptions/validator.ts` dim1/dim2 stochastiques (`TODO: integrate corpus-level TF-IDF`). `scripts/generate-rge-descriptions.ts:395-410` upsert dans `provider_descriptions_draft` sans `.safeParse()`. 10-15% descriptions judged_pass = boilerplate = pénalité E-E-A-T.
2. **Atomicité ADEME sync cassée** — `src/lib/rge/sync.ts:33` `ADEME_MIN_ROWS_FOR_CLEAR=50000` garde contre partial, mais pas de 2PC avec migration 413 `rge_categories_decret`. `scripts/backfill-dispatch.ts:65` hardcoded `LIMIT=5`. 9/40 devis orphelins non traités.

### P1

3. **Enrich INSEE/DVF/Géorisques silent fail** — `src/lib/seo/lastmod-queries.ts:34-36,56-61,97-99` 3 "Fail silently" comments. Pas de retry, 429 handling absent, timeout 5s = undefined. Communes top40 enrichissement jamais validé INSEE/DVF = risque soft 404 commune fusionnée.
4. **Rubric v1.3 YMYL regex naïves** — `validator.ts:57-61` ne matche pas "jusqu'à 5 000 €", "CEE classe-4", "prime 2500€". 5-8% descriptions = 2.5K-4K pages YMYL breach non détecté.
5. **Dispatch RGE-aware scoring vide** — `src/lib/cee/dispatcher.ts:26-29` `ordering intelligent` commenté mais aucun score proximité/load/rating/concurrence. Top-rated chargé reçoit 100% → churn. +25-30% fallback non_cee = ~€150K/trim loss.

### P2

6. **Batches Anthropic résidus uncheck** — `.batches/index.json` 21 batches. `processing_status=ended` mais pas de `error_count` check post-ingestion. Risque 10K descriptions `text=""` silencieuses.
7. **Prompts non versionnés runtime** — `src/lib/descriptions/prompts/rge-description-v1.ts` `PROMPT_VERSION` constant hard-codée. Pas de `prompt_version`/`rubric_version` colonnes dans table. A/B invalide.
8. **Rate-limit 429 retry incohérent** — `generate-rge-descriptions.ts:241` `MAX_RETRIES=5` mais pas de circuit breaker / metrics. Rescue Sonnet 3-5× coût Haiku = budget mismatch €180→€500.
9. **Dispatch idempotence faible** — `dispatcher.ts:24-25` check `{devisId, operationCode}` mais pas `{devisId, providerId}`. Duplicate dossiers en reorder candidats. ~1-2% devis = 500 duplicates/trim.
10. **Zero TTL/retention** — `docs/rgpd/registre-traitements.md` promet "suppression immédiate" mais pas de `deleted_at`, pas de cron purge sur `analytics_events`, `devis_requests`, `lead_assignments > 365j`, `audit_logs`. GDPR DSR 45j+ à localiser.

## Coûts LLM mensuels

| Modèle                   | Reqs  | Coût             |
| ------------------------ | ----- | ---------------- |
| Haiku 4.5 (batch)        | 46K   | $161             |
| Sonnet 4.5 (rescue)      | 3K    | $84              |
| Opus 4.7 (L2 judge rare) | 730   | $104             |
| **Total**                | 49.7K | **~$350-400/mo** |

## Quick Wins 24h

1. **YMYL regex hotfix** (2h) — étendre `YMYL_AMOUNT_REGEX`/`YMYL_KEYWORDS_REGEX` variantes accentuées/tirets + 10 tests borderline + rerun `sync-generate-haiku.ts --limit 100`.
2. **Dispatch ordering baseline** (6h) — score `proximity + load + rating` DESC, stocker `ordering_reason` dans `lead_assignments.metadata`. -20-25% fallback non_cee.
3. **ADEME sync validation gate** (4h) — post-upsert `SELECT COUNT(*) WHERE rge_valid_until IS NULL` < 100 sinon rollback. Checkpoint `/tmp/ademe-sync-checkpoint.json`.
