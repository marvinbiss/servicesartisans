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

**Colonnes SUPPRIMEES de providers** — ne jamais référencer:
`is_premium`, `trust_badge`, `trust_score`, `company_name`, `hourly_rate_min`, `hourly_rate_max`, `emergency_available`, `certifications`, `insurance`, `payment_methods`, `languages`, `avatar_url`

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

## SEO

Utiliser `/sa-seo` pour la référence complète (sitemap, IndexNow, lastmod, noindex).
