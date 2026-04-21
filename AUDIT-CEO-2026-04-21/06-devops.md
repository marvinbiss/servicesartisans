# Audit DevOps CI/CD & Infra — ServicesArtisans 2026-04-21

**Verdict : 2.5/10 — Secrets exposés = showstopper**

## Top 10 risques

### P0 (24h)

1. **`.env.local` commité git** — Supabase service_role, Anthropic, Google Places, IndexNow, SUPABASE_DB_PASSWORD en clair, versionnés. N'importe qui clone = accès prod.
2. **31 crons sans idempotence garantie** — `prospection-process` + `send-reminders-1h` tournent à 2-10min, race possible. Pas de lock distribué.
3. **Soft 404 via timeout cron** — `maxDuration` mal calibré `vercel.json`, `/services/[service]/[location]/page.tsx` retourne 200 vide sur timeout DB.
4. **Migrations Supabase non automatisées** — `scripts/apply-migration-*.ts` jamais callé par GitHub Actions. Drift dev↔prod silencieux.

### P1 (72h)

5. **Zéro backup offsite** — Supabase snapshot 7j + PITR sur infra Supabase seulement. Pas de `pg_dump` vers S3/GCS.
6. **CI sans E2E crons** — smoke `/api/health` uniquement. Pas de test cron après déploiement.
7. **`CRON_SECRET` loggé en plain** — `src/app/api/cron/prospection-process/route.ts:19` log "Unauthorized access" avec détails secret. Logs Vercel publics.
8. **Sentry sampling 1% crons** — 31 crons P0, `send-review-invitations`/`pipedrive-retry` fail = 1/100 remonté.
9. **Scripts ops sans dry-run** — `scripts/aggregate-barometre.ts:33` `.delete().neq('id', 0)` = wipe table, aucun prompt.
10. **Preview ≠ staging** — Vercel preview = code branche sans migration appliquée. Mêmes env vars que prod parfois.

### P2 (7j)

11. **Husky pre-commit faible** — lint OK, pas de `tsc --noEmit` gate.
12. **Risk router trop permissif** — `claude-review.yml` `fail-fast=false`, certains agents skip.

## SPOFs

| SPOF                   | Impact                   | Likelihood        |
| ---------------------- | ------------------------ | ----------------- |
| Anthropic API Key      | Toutes features LLM down | H (rotation rare) |
| Supabase DB            | Site 100% down           | M (99.9% SLA)     |
| Vercel deploy rollback | <2min impossible         | M                 |
| **Bus factor 1 dev**   | Prod down si absent 3j   | CRITIQUE          |

## Runbook gaps

| Scénario        | Gap                               |
| --------------- | --------------------------------- |
| Supabase outage | Pas de read replica / cache layer |
| Cron stuck      | Pas de retry UI / history         |
| Soft 404        | Pas de detection auto             |
| Backup restore  | Jamais testé                      |
| Secret rotation | Manuel, pas d'audit trail         |

## Quick Wins 24h

1. **Git hygiene** : `git rm --cached .env.local` + rotation tous secrets Vercel + `.gitignore` check.
2. **Cron advisory locks** : `src/lib/cron-lock.ts` via `pg_advisory_lock` sur hashCronName, apply aux 31 crons.
3. **Soft 404 fix** : `notFound()` explicite quand data absente, pas `return null`.
