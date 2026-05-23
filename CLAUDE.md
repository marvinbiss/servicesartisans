# ServicesArtisans

Annuaire d'artisans français. Next.js 14 App Router, TypeScript strict, Tailwind CSS, Supabase (auth + DB + storage), Vercel.
**Site en français** — les accents sont critiques.

## Commandes

```bash
npm run dev          # Dev server
npm run build        # Build — OBLIGATOIRE avant push
npm run lint         # ESLint
npx vitest run       # Tests unitaires (~600 tests)
npm run test         # Tests Playwright (e2e)
```

Avant chaque deploy: `npm run build` en local. Jamais de build cassé sur Vercel.

## Schema Supabase — CRITIQUE

**JAMAIS écrire de requêtes Supabase sans vérifier les colonnes dans `supabase/migrations/`.**

- TypeScript NE PEUT PAS détecter les noms de colonnes incorrects dans `.select('col')`
- Joins FK: utiliser `provider:provider_id(id, name)` (nom de colonne), pas `provider:providers(id, name)`
- Vérifier les DROP COLUMN dans les migrations récentes

### Tables principales

| Table             | Colonnes clés                                                                                                                                  | Notes                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `profiles`        | id, email, full_name, is_admin, role, user_type, phone_e164, average_rating, review_count                                                      | `user_type` = 'client' ou 'artisan'           |
| `providers`       | id, name, slug, email, phone, siret, is_verified, is_active, stable_id, noindex, address_city, address_region, user_id, claimed_at, claimed_by | `name` (PAS company_name)                     |
| `provider_claims` | id, provider_id, user_id, siret_provided, status, rejection_reason                                                                             | status IN ('pending', 'approved', 'rejected') |
| `bookings`        | artisan_id, provider_id, client_id, status, scheduled_date, slot_id                                                                            | artisan_id = auth.uid() FK profiles           |
| `audit_logs`      | user_id, action, resource_type, resource_id, old_value, new_value, metadata                                                                    | FK vers auth.users (PAS profiles)             |

**Colonnes SUPPRIMEES de providers** (drop mig 100, jamais ré-ajoutées) — ne jamais référencer:
`is_premium`, `trust_badge`, `trust_score`, `company_name`, `avg_response_time_hours`, `response_rate`, `years_on_platform`, `response_time`, `intervention_zone`, `video_enabled`, `video_price`

**Colonnes ré-ajoutées par mig 306** (vivantes en DB, voir memory `servicesartisans-mig306-status-2026-04-28`) :
`bio`, `team_size`, `services_offered`, `service_prices`, `faq`, `opening_hours`, `intervention_radius_km`, `phone_secondary`, `hourly_rate_min`, `hourly_rate_max`, `accepts_new_clients`, `free_quote`, `emergency_available`, `available_24h`, `certifications`, `insurance`, `payment_methods`, `languages`, `avatar_url`

⚠️ Ces colonnes existent en DB MAIS ne sont actuellement PAS lues par `PROVIDER_DETAIL_SELECT`. Avant de les wirer côté SELECT, vérifier impact perf + cohérence types.

### `providers.address_department` = CODE INSEE (pas le nom) — ‼️

`address_department` stocke le **CODE INSEE 2-3 chars** : `'75'`, `'69'`, `'2A'`, `'974'`. **Jamais le nom**. Source seeding sirene `codePostalEtablissement.substring(0,2)`.

```ts
// ❌ BUG : silencieusement 0 row
.eq('address_department', 'Paris')
.eq('address_department', location.department_name)
.eq('address_department', villeData.departement)

// ✅ Correct
.eq('address_department', '75')
.eq('address_department', location.department_code)
.eq('address_department', villeData.departementCode)
```

Hook anti-régression : `scripts/audit-dept-code-not-name.mjs --strict` (pre-commit). Voir post-mortem `servicesartisans-dept-code-bug-2026-05-05.md`.

### Migrations — règle search_path (CVE-2018-1058)

Toute `CREATE [OR REPLACE] FUNCTION` dans `public` ou `app` DOIT pinner son `search_path` :

```sql
CREATE OR REPLACE FUNCTION public.ma_fonction(...)
RETURNS ... AS $$
  ...
$$ LANGUAGE plpgsql
SET search_path = public, pg_catalog;  -- OBLIGATOIRE
```

Hook pre-commit `scripts/audit-migration-search-path.mjs` rejette les migrations stagées qui violent la règle. Exception légitime (accès `extensions`/`vault`) : ajouter `-- pragma: allow-mutable-search-path` dans la définition.

## Conventions

- Path alias: `@/*` → `./src/*`
- Polices: Inter (body) + Plus Jakarta Sans (headings) via `next/font/google`
- Icônes: `lucide-react` (v0.294)
- Validation: `zod` pour tous les schemas d'API
- Data fetching: `swr`
- Admin auth: `requirePermission('resource', 'read'|'write')` de `@/lib/admin-auth`
- Admin DB: `createAdminClient()` de `@/lib/supabase/admin` (bypass RLS)
- Client DB: `createClient()` de `@/lib/supabase/server` (respecte RLS)
- Logger: `logger.info/warn/error()` de `@/lib/logger` — pas de `console.log` en prod
- Dark mode: DESACTIVE. Ne PAS ajouter de classes `dark:*`

## Auth

OAuth Google (Supabase provider). Flow: `signInWithOAuth()` → `/auth/callback` → profil auto → redirect selon `user_type`.
Middleware protège `/espace-client`, `/espace-artisan`.

## Revendication fiche artisan

Page artisan → "Revendiquez cette fiche" → SIRET (14 chiffres) → vérif vs base → `provider_claims` pending → admin approuve/rejette → `providers.user_id` assigné.

## Fiches RGE non revendiquées — exception "tel public" (2026-05-07)

Sur les ~45 480 fiches `providers` avec au moins une qualification RGE active (`rge_qualifications[].date_fin > now`), le numéro `providers.phone` peut être affiché publiquement.

**Conditions strictes** :

- `Array.isArray(rge_qualifications) && au moins 1 qualif active` (helper `hasActiveRgeQualification` dans `src/lib/rge/has-active-qualification.ts`)
- Mention "Source : Registre RGE ADEME" obligatoire à côté du numéro (transparence)
- `ArtisanQuickQuote` / `ArtisanQuoteForm` / `ArtisanServices` (devis spécifique artisan) restent **gated `isClaimed`** — ne JAMAIS impliquer un engagement plateforme
- CTA "C'est ma fiche ? Revendiquez-la" version discrète conservé (funnel claim préservé)
- ArtisanSchema JSON-LD `telephone` étendu via gate `(isClaimed || isRgeActive) && phone`

**Hors RGE (~925K fiches non revendiquées) : règle "no phone from DB" inchangée**, claim CTA principal conservé.

Audit pre-commit `scripts/audit-unclaimed-cta-rules.mjs` valide le respect du nouveau gate.

## Pipedrive CRM — 3 canaux

| Canal                      | Pipeline                        | `source`                | Mode            |
| -------------------------- | ------------------------------- | ----------------------- | --------------- |
| `/api/devis`               | `PIPEDRIVE_PIPELINE_ID`         | `"servicesartisans.fr"` | timeout 4s      |
| `/api/simulateur/submit`   | `PIPEDRIVE_PIPELINE_SIMULATEUR` | `"simulateur-aides"`    | fire-and-forget |
| `/api/simulateur/callback` | `PIPEDRIVE_PIPELINE_SIMULATEUR` | `"callback-simulateur"` | await ~1-2s     |

Recherche Person: email d'abord, fallback phone. Retry DLQ: cron 6h, backoff expo, max 5 tentatives.

## HTTP vers prod

Domaine canonical: `servicesartisans.fr` (apex, sans www). Le www → 301 qui casse les POST.
`/api/revalidate` exige header `Origin: https://servicesartisans.fr`.

## Crons — pattern SLA 99.9

Tout cron sous `src/app/api/cron/**` doit passer `scripts/audit-sla-99-9.mjs` (objectif p0/p1/p2 = 0). Référence canonique : **`src/app/api/cron/cee-relance/route.ts`** (copier son squelette).

**Obligatoire pour TOUS les crons (P0)** :

- **Auth** : `verifyCronSecret(request.headers.get('authorization'))` de `@/lib/auth/verify-cron-secret` (comparaison `timingSafeEqual`, fail-closed si `CRON_SECRET` absent).
- **Check-in** : wrapper `withCronCheckIn('cron-<name>', handler)` de `@/lib/monitoring/sentry-checkin` (monitoring Sentry).
- **try/catch** englobant + `logger.error(...)` (forwardé à Sentry).

**Obligatoire pour crons LOURDS uniquement (P1)** — un cron est « lourd » dès qu'il boucle, pagine, fait `Promise.all` ou des batches :

- **Lease anti-double-run** via RPC `acquire_cron_lease(p_name TEXT, p_ttl_seconds INT) → bool` + `release_cron_lease(p_name TEXT)` (mig `409`+`411`, déjà en prod, `GRANT … service_role`). Acquisition avec `AbortController` 5 s ; not-acquired → `200 {skipped:true}` ; lease error → `500`. **Toujours** `release_cron_lease` dans un `finally` (le TTL sert de filet). `LEASE_NAME` unique par cron (`cron_<name>`), `LEASE_TTL_SECONDS = 15 * 60`.
- **Cap par run** : const `MAX_<THING>_PER_RUN` appliqué en `.limit(...)` ou compteur `budget` — jamais d'ensemble non borné.
- **Wall-clock** : `const startedAt = Date.now()` + `if (Date.now() - startedAt > MAX_RUNTIME_MS) break` dans la boucle, `MAX_RUNTIME_MS` sous le `maxDuration` Vercel (ex. 50 000 pour 60 s, 290 000 pour 300 s).
- **AbortSignal** sur `.rpc()` lourds : `.abortSignal(AbortSignal.timeout(ms))`.

Crons triviaux (action unique, pas de boucle) : auth + checkin + try/catch suffisent ; pas de lease/cap/wallclock (sinon code mort).

Tests : mocker `.rpc('acquire_cron_lease')` → `{data:true}` et `release_cron_lease` → OK, avec `.abortSignal()` chaînable (cf. `__tests__/api/cron/cee-relance.test.ts`).

## Outils externes — Ahrefs API

Token stocké hors repo : `/c/Users/USER/.secrets/ahrefs.env` (40 chars, préfixe `-fUKR_`). **Ne JAMAIS** copier dans `.env*` ni dans le repo.

Usage shell :

```bash
TOKEN=$(cat /c/Users/USER/.secrets/ahrefs.env | tr -d '\r\n ')
curl -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" \
  "https://api.ahrefs.com/v3/<endpoint>"
```

- Plan : **Advanced** (mensuel) — quota workspace **1 000 000 unités/mois**
- Reset cycle : 18 du mois (vérifié 2026-04-29 : 292 549 / 1 000 000 utilisés ⇒ ~707K dispo jusqu'au 2026-05-18)
- Quota par clé : illimité
- Expiration clé : **2027-04-29**
- Endpoint santé : `GET /v3/subscription-info/limits-and-usage`

## SEO

Utiliser `/sa-seo` pour la référence complète (sitemap, IndexNow, lastmod, noindex).

### Pillar #2 — Rénovation Énergétique (2026)

Angle stratégique : capturer le marché rénovation énergétique France (300-500K vol/mois accessibles). Voir `docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md`.

**USP** : RGE certifiés (via API france-renov.gouv.fr) + SIREN officiel + éligibilité MaPrimeRénov' (simulateur déjà en prod).

**Architecture** :

- Hub `/renovation-energetique/` (aides, travaux, diagnostic, passoires)
- Pages services RGE par ville : `/services/chauffagiste-rge/[ville]`, `/services/pompe-a-chaleur/[ville]`
- Pages aides territoire : `/aides/[dept]/maprimerenov`
- Blog `/blog/prix-*-2026` (pattern gagnant : article climaticien attire backlinks)

**DB** : ajouter `providers.rge_qualifications text[]` + `rge_verified_at` + `rge_expires_at`. 11 nouveaux services (pompe-a-chaleur, isolation-combles, audit-energetique, etc).

**E-E-A-T obligatoire** (YMYL aide financière) : montants MaPrimeRénov' à jour, lien france-renov.gouv.fr, auteur identifié, Schema.org `Service` + `GovernmentService` + `FinancialProduct`.

**Prérequis** : fix bailout SSR avant tout.

### Règles Google officielles (synthèse 26 parties — source : Google Search Central 2026-04)

**Pipeline** : découverte → crawl → indexation → diffusion (3 étapes séparées, indexation non garantie). Mobile-first : Google indexe principalement la version mobile.

**E-E-A-T** : Experience, Expertise, Authoritativeness, **Trustworthiness** (primordiale). People-first content, auteurs identifiés. YMYL (santé/finance/sécurité) = E-E-A-T critique.

**Contenu IA** : OK pour recherche + structure. NON-OK : génération massive sans valeur = spam (sections 4.6.5 et 4.6.6 des guidelines évaluateurs). Transparence recommandée.

**Liens Google explore** : uniquement `<a href="URI">` standard. **Ignore** : `routerLink`, `<span href>`, `onclick`, `javascript:`. Achat liens = spam = pénalité Penguin.

**Rel attributs** : `nofollow` (source douteuse), `sponsored` (lien payé, OBLIGATOIRE), `ugc` (contenu utilisateur).

**robots.txt** :

- Racine UTF-8, max 500 Kio, cache 24h
- **Bloquer crawl ≠ bloquer indexation** (URL peut rester dans SERP sans extrait)
- Pour vraie désindexation : `noindex` meta ou mot de passe
- `crawl-delay` NON accepté par Google
- AdsBot ignore `*` (nommer explicitement)
- Codes 5xx sur robots.txt → cache 30j puis "pas de robots.txt"

**Redirects** :

- **301** = permanent (signal fort) | **302** = temp (signal faible) | **410** = gone (oubli rapide) | **404** = not found
- Max **10 sauts** suivis
- Éviter chaînes (gaspille budget crawl)

**Soft 404** = code 200 avec page vide/erreur → **INTERDIT** (gaspille budget, pas indexé). Cause fréquente : JS non chargé, bailout SSR, DB down. **Correctif** : retourner 404/410 pour vraies pages supprimées.

**Sitemaps** :

- Indispensable si >500 pages OU site récent OU rich media
- Max 50 000 URLs ou 50 MB / sitemap (sinon sitemap index, max 500)
- URLs **absolues + canoniques uniquement**
- `<lastmod>` = date modification **importante** (pas copyright)
- News : max 1000 articles, <2 jours

**Budget crawl** (applicable à ServicesArtisans : 408K URLs en queue "détectée non indexée") :

- **Capacité × Besoin** = budget
- `noindex` consomme du budget (Google crawl pour voir balise) → préférer **410** pour pages supprimées
- **404/410** = Google oublie, `noindex` = Google reste en mémoire + re-crawl
- Éliminer soft 404 priorité
- **ETag + If-None-Match** + 304 Not Modified = économie budget

**Robots Google à connaître** :

- `Googlebot` (mobile + desktop, majorité crawls = Smartphone)
- `Googlebot-Image`, `Googlebot-News`
- `Google-InspectionTool` (GSC URL Inspection)
- `Google-Extended` (IA training Gemini) — **AUCUN impact ranking recherche**
- `GoogleOther` (R&D) — aucun impact
- `AdsBot-Google` (ignore `*`)
- Validation anti-spoofing : DNS inverse → `crawl-*.googlebot.com`

**Codes HTTP clés** :

- 200 indexable | 304 cache | 301 signal fort | 302 faible
- 410 > 404 pour oubli rapide
- 500/503/429 → crawl réduit (max 1-2j)

**Navigation à facettes** (crawl traps) :

- Fragments `#filter=x` → Google ignore (préféré)
- robots.txt pour bloquer patterns
- rel="canonical" vers version non-filtrée
- Retourner **404** si combinaison 0 résultat (jamais soft 404)

**URLs** :

- IETF STD 66, pas de fragments pour contenu
- Descriptives, langue audience, tirets `-` (jamais `_`)
- Paramètres standards `?key=value&`

Synthèse complète dans memory `google-seo-essentials-2026.md`.
