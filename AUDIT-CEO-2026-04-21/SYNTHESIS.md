# AUDIT TECHNIQUE CEO — ServicesArtisans 2026-04-21

**Mode : brutal, strict, standard top 0.001% Anthropic.**

## Verdict global

| Dimension            | Score      | Statut                                |
| -------------------- | ---------- | ------------------------------------- |
| Architecture Next.js | **6.2/10** | Lourde, ISR déséquilibré              |
| Sécurité             | **3.5/10** | 🔴 État de crise                      |
| Base de données      | **4.5/10** | 🔴 Critique                           |
| Performance          | **3.2/10** | 🔴 Désastre scaling                   |
| Qualité code         | **7.2/10** | Viable, fragile à l'échelle           |
| DevOps CI/CD         | **2.5/10** | 🔴 Secrets exposés                    |
| Intégrations tierces | **4.0/10** | Garde-fous partiels                   |
| SEO technique        | **3.2/10** | 🔴 Crise indexation                   |
| Frontend UX/A11Y     | **5.5/10** | Design system OK, exécution chaotique |
| Data & LLM           | **4.2/10** | Pipeline robuste, 4 risques majeurs   |
| **MOYENNE**          | **4.4/10** | 🔴 **Production at risk**             |

## Conclusion exécutive

ServicesArtisans est un **produit fonctionnel qui fuit de toutes parts**. Architecture Next.js 14 correcte sur le papier (App Router, ISR, RSC) mais ruinée par 328 bailouts SSR (`ssr:false`), 408K pages "détectées non indexées", secrets commités dans `.env.local`, 145 tables sans RLS, collisions de migrations, et crons non-idempotents.

Le code reflète une croissance rapide sans refactoring ni standards collectifs : 1501 fichiers TS, 279 `createClient()` dupliqués, 154 `eslint-disable`, 30+ `catch` silencieux, 36K LOC dans `france.ts`. 31 crons, 2 vérifient `CRON_SECRET`.

**La dette critique n'est pas dans le code fonctionnel — elle est dans la posture de sécurité, l'indexation SEO et l'observabilité.**

## Top 20 P0 (transverse, 72h max)

| #   | Dimension | Action                                                                                                                       | Fichier clé                                                            | Effort | Impact                   |
| --- | --------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------ | ------------------------ |
| 1   | Sec       | `git rm --cached .env.local` + rotation TOUS secrets (Supabase service_role, Anthropic, Google, INDEXNOW, DB password)       | `.env.local`                                                           | 1h     | Blocage RCE              |
| 2   | Sec       | Enforcer `CRON_SECRET` sur les 29 crons manquants                                                                            | `src/app/api/cron/**`                                                  | 2h     | Blocage injection        |
| 3   | Sec       | Drop `profiles` RLS `FOR SELECT USING (TRUE)` → VIEW `artisans_public(id, full_name)`                                        | `supabase/migrations/101_v2_rls_policies.sql:44-46`                    | 1h     | GDPR 50K emails          |
| 4   | DB        | Renommer collisions `330_*` + `365_*`, audit drift prod vs code                                                              | `supabase/migrations/`                                                 | 4h     | Schema divergent         |
| 5   | DB        | Enable RLS sur 145 tables sans policy                                                                                        | migrations                                                             | 6h     | Fuite leads/emails       |
| 6   | DB        | UNIQUE constraints `providers.email`, `providers.siret`                                                                      | migration 465                                                          | 2h     | Spam doublons            |
| 7   | SEO       | `sitemap.ts` `dynamicParams=true` + scan DB complet villes actives                                                           | `src/app/sitemap.ts`                                                   | 3h     | +40K pages indexées      |
| 8   | SEO       | Canonical via `getAlternates()` sur 18 routes dynamiques manquantes                                                          | `services/`, `devis/`, `tarifs/`, `problemes/`                         | 3h     | -90% duplication interne |
| 9   | SEO       | Réduire batch sitemap `STATIC_BATCH=8000`, `LARGE_BATCH=20000` (<50K Google)                                                 | `src/lib/seo/sitemap-config.ts:14-20`                                  | 1h     | GSC ingestion verte      |
| 10  | SEO       | Retirer 3 sitemaps inexistants de robots.txt                                                                                 | `src/app/robots.ts:205-215`                                            | 15min  | -100% GSC errors         |
| 11  | Perf/SEO  | Remplacer `ssr:false` par `<Suspense fallback>` sur `GeoPageCTA`, `MicroConversions`, `CallbackRequest`, `InlineTestimonial` | `services/[s]/[l]/page.tsx:98-106`                                     | 2h     | LCP -300ms, +40K pages   |
| 12  | Archi     | `export const revalidate = 3600` sur 100 pages publiques trafic (guides/outils/barometre/avis/tarifs)                        | `src/app/(public)/**`                                                  | 2h     | Freshness +25%           |
| 13  | Archi     | Fix soft 404 : `notFound()` explicite sur 0-provider pages (pas `return null`)                                               | `services/[s]/[l]/page.tsx:564`                                        | 1h     | Budget crawl -60%        |
| 14  | DevOps    | Cron distributed locks via `pg_advisory_lock`                                                                                | `src/lib/cron-lock.ts` + 31 routes                                     | 4h     | Pas de race condition    |
| 15  | DevOps    | Migrations Supabase automatisées CI (post-deploy hook `supabase migration deploy`)                                           | `.github/workflows/`                                                   | 3h     | Drift prod impossible    |
| 16  | Code      | `src/lib/supabase/singleton.ts` + replace 279 `createClient()`                                                               | `src/**`                                                               | 3h     | -40% perf réseau         |
| 17  | Code      | Wrap `.catch(() => {})` → `.catch(logger.error)` sur 30+ occurrences                                                         | `src/lib/cache.ts`, `pipedrive.ts`, etc.                               | 2h     | Debug 10× rapide         |
| 18  | Int       | Sentry replay budget cap `replaysSessionSampleRate=0.005` + toggle env                                                       | `sentry.client.config.ts:27`                                           | 15min  | Prévention bill spike    |
| 19  | Int       | Anthropic rate-limit wrapper `bottleneck` 1.2s/req + 429→503 Retry-After                                                     | `src/app/api/estimation/route.ts`                                      | 4h     | Pas de crash             |
| 20  | Front     | Skip link WCAG + fix 5 contrastes AA fail                                                                                    | `src/components/SkipLink.tsx`, `Modal.tsx:245`, `EmptyState.tsx:91,98` | 3h     | Lighthouse a11y +15      |

**Total effort P0 : ~48h = 6 jours dev x1 ou 2 jours x3**

## Roadmap 30 jours

### Semaine 1 — Crise (P0)

- J1-2 : Secrets + rotation + CRON_SECRET + RLS profiles
- J3-4 : Collisions migrations + RLS 145 tables + UNIQUE providers
- J5 : Sitemaps + canonicals + robots.txt
- J6 : `ssr:false` → Suspense + soft 404 fix
- J7 : Cron locks + Supabase singleton

### Semaine 2 — Stabilisation (P1)

- Revalidate 86400 → 3600 sur pages volatiles
- Anthropic rate-limit + IndexNow retry+DLQ
- Middleware auth whitelist public routes
- `notFound()` 91 vs 18 cohérence
- Lead exclusivity backfill 9 orphelins restants
- ADEME sync validation gate atomique
- YMYL regex hotfix rubric v1.3

### Semaine 3 — Qualité code & tests

- Suppression deps : Tiptap lazy, react-pdf, recharts, leaflet → -460KB bundle
- Tests critiques devis/booking/payments (<10% coverage actuel)
- Extraction `france.ts` → JSON lazy
- Dispatch RGE-aware scoring réel (proximity + load + rating)
- Frontend : skip link, focus trap, contraste, phone formatting

### Semaine 4 — Observabilité & gouvernance

- Sentry instrumentation Edge runtime (middleware)
- Backup offsite Supabase pg_dump → S3/GCS
- Prompt versioning + `prompt_version`/`rubric_version` colonnes
- GDPR TTL crons (`analytics_events`, `audit_logs`, `devis > 365j`)
- Monitoring métriques LLM (% retry, coût Sonnet rescue)

## Risques business chiffrés

| Risque                      | Impact annualisé                             |
| --------------------------- | -------------------------------------------- |
| Secrets leak + exploit      | ~€50-500K (RGPD amende 4% CA + reputational) |
| SEO soft 404 / canonical    | ~€50K/mois = €600K/an (revenue perdu)        |
| Dispatch non-optimal        | ~€600K/an (fallback non_cee 25-30%)          |
| Cron race + data corruption | ~€50K/an support + churn                     |
| Bus factor 1 dev            | Hors chiffrage — risk existentiel            |

**Coût non-adressé estimé : > €1M/an.**

## Bus factor & gouvernance

**CRITIQUE.** Un dev seul = prod down si absent 3 jours. Runbook incidents existe mais jamais testé (backup restore, cron stuck, soft 404 detection). Pas de documentation hyperbolique (Terraform IaC, runbooks JSON automatisables).

**Pré-requis avant scaling** :

- Recrutement senior dev / SRE
- Standard dev collectif (CI lint strict, coverage critique, quality gates)
- Documentation runbook exécutable
- Secret scanning CI + rotation automation

## Fichiers de détail

- `01-architecture.md` — Next.js App Router, RSC/ISR, middleware, bailouts SSR
- `02-securite.md` — OWASP, RLS, secrets, webhooks, path traversal
- `03-database.md` — Migrations, RLS, indexes, UNIQUE, CASCADE, format()
- `04-performance.md` — Bundle, CWV, ISR, middleware, waterfalls, deps
- `05-qualite-code.md` — TS strict, any, eslint-disable, god files, tests
- `06-devops.md` — CI/CD, secrets, crons, backups, Sentry, runbook
- `07-integrations.md` — Pipedrive, Stripe, Anthropic, ADEME, IndexNow, DLQ
- `08-seo-technique.md` — Sitemaps, canonical, robots, soft 404, schema
- `09-frontend-ux.md` — WCAG 2.1 AA, skip link, contraste, focus, phone
- `10-data-llm.md` — ADEME sync, RGE descriptions, dispatch, rubric, TTL

## Signal final

Le produit génère du trafic et quelques leads, mais **l'infrastructure n'est pas prête pour scaler à 500 MQL/mois** (North Star CEO strategy 2026-04-20). Les 20 P0 ci-dessus sont **pré-requis non-négociables** avant d'investir sur :

- Supply-side (claim artisans)
- Reviews flywheel
- Sprint 3 keyword-first 100 flagship pages
- Mandataire CEE viabilité (1000 dossiers/mois)
- AssurPro Master Plan

**Ne pas additionner de features avant d'avoir fermé les 20 P0.** Chaque nouveau 1000 visiteurs amplifie les fuites.
