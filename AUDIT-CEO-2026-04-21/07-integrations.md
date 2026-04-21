# Audit Intégrations Tierces — ServicesArtisans 2026-04-21

**Verdict : 4/10 — garde-fous existent mais fragilités critiques**

## Top 10 fragilités

| #   | Fichier:Ligne                               | Risque                                                                                   | Prob | Blast                      | Sev |
| --- | ------------------------------------------- | ---------------------------------------------------------------------------------------- | ---- | -------------------------- | --- |
| 1   | `sentry.client.config.ts:27`                | Session Replay 1% + traces 10% prod sans budget cap = **facturation explosion** si viral | H    | €10K+ spike                | P0  |
| 2   | `src/lib/integrations/pipedrive.ts:282-287` | Idempotency faible (`pipedrive_deal_id` guard insuffisant), doublons CRM si retry        | M    | CRM intégrité              | P1  |
| 3   | `src/lib/seo/indexnow.ts:50-54`             | `catch { continue }` muet, pas de retry, 10-20% URLs perdues                             | M    | Indexation                 | P1  |
| 4   | `src/app/api/stripe/webhook/route.ts:84-87` | Idempotency via table sans transaction garantie, race double-charge                      | B-M  | 0.01% ordres               | P2  |
| 5   | `src/lib/rge/sync.ts:21-33`                 | ADEME 165K lignes, atomicité confiée RPC DB, pas de vérif TS-side                        | B    | RGE corruption silencieuse | P2  |
| 6   | `src/app/api/estimation/route.ts`           | Anthropic SDK sans gestion 429, timeout 15s dur, Tier 1 50 RPM non validé                | M    | Estimations cassées        | P1  |
| 7   | `capacitor.config.ts:11-15`                 | `webDir: 'public'` collision avec Next.js build                                          | M    | Mobile build cassé         | P1  |
| 8   | `.env.example` historique git               | STRIPE_WEBHOOK_SECRET + CEE_IBAN_KEY leakables via git log                               | M    | Secret compromise          | P1  |
| 9   | `src/lib/simulateur/pipedrive.ts:43-46`     | Backoff exp 2^N capped 24h, DLQ après 120h                                               | B    | Leads perdus 5j            | P2  |
| 10  | `src/lib/supabase/admin.ts:27-31`           | Admin client ISR 3600s cache, RLS boundary violation                                     | B    | Data cross RLS             | P2  |

## DLQ coverage

- ✅ Devis Pipedrive (dead_letter_at, sync_attempts, next_retry_at)
- ✅ Simulateur Pipedrive (`simulateur_pipedrive_failures`)
- ❌ IndexNow — silence sur rejets Bing/Yandex
- ❌ Stripe webhooks — idempotency ad-hoc, pas de table DLQ dédiée
- ❌ Anthropic Batches — pas de `batch_results` DLQ
- ❌ ADEME RGE sync — atomicité confiée RPC, pas de preuve TS

## Quick Wins 24h

1. **Sentry budget cap** : `replaysSessionSampleRate` à 0.005 avec toggle env `SENTRY_SESSION_BUDGET=unlimited` pour override
2. **IndexNow retry + DLQ table** : 3 retries backoff, `indexnow_failures` log
3. **Anthropic rate-limit** : `bottleneck` wrapper 1.2s/req, 429 → 503 Retry-After 30s
