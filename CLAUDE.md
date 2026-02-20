# CLAUDE.md — ServicesArtisans

## Projet

Annuaire d'artisans français. Next.js 14 App Router, TypeScript strict, Tailwind CSS, Supabase (auth + DB + storage), déployé sur Vercel.

**Site en français** — les accents sont critiques pour la crédibilité du site.

---

## Commandes

```bash
npm run dev          # Serveur de développement
npm run build        # Build Next.js (3 749+ pages pré-rendues) — OBLIGATOIRE avant push
npm run lint         # ESLint
npx vitest run       # Tests unitaires (~600 tests, 16 fichiers)
npm run test         # Tests Playwright (e2e)
```

### Avant chaque deploy

1. **TOUJOURS** lancer `npm run build` en local AVANT de commit/push
2. Si le build casse → corriger AVANT de push — **jamais de build cassé sur Vercel**
3. Lancer `npx vitest run` si des fichiers de logique/API ont été modifiés

---

## Architecture

```
src/
├── app/
│   ├── (auth)/           # /connexion, /inscription, /auth/callback
│   ├── (public)/         # Pages publiques (services, blog, FAQ, contact, carrières)
│   ├── (private)/        # /espace-artisan, /espace-client, /devis
│   ├── admin/            # Dashboard admin (/admin/connexion, /admin/(dashboard)/*)
│   └── api/              # API routes
│       ├── admin/        # Admin endpoints (claims, providers, users, stats, reports)
│       ├── artisan/      # Artisan endpoints (claim, provider)
│       ├── auth/         # Auth endpoints (oauth)
│       ├── client/       # Client endpoints (profile)
│       └── ...
├── components/
│   ├── admin/            # Composants admin (sidebar, tables, modals)
│   ├── artisan/          # ArtisanPageClient, ClaimButton, etc.
│   ├── artisan-dashboard/# Dashboard artisan
│   ├── chat/             # Messagerie
│   ├── ui/               # Composants UI réutilisables
│   ├── home/             # Sections homepage
│   ├── forms/            # Formulaires
│   ├── maps/             # Cartes Leaflet
│   └── ...
├── lib/
│   ├── supabase/         # server.ts, admin.ts, middleware.ts
│   ├── admin-auth.ts     # requirePermission() pour les endpoints admin
│   ├── logger.ts         # Logger structuré
│   └── ...
├── types/                # Types TypeScript (admin.ts, etc.)
└── test/                 # Setup Vitest
__tests__/                # Tests unitaires (api/, components/, hooks/, lib/, services/, validations/)
supabase/migrations/      # 47 fichiers de migration SQL
```

---

## Schema Supabase — Règle CRITIQUE

**JAMAIS écrire de requêtes Supabase sans vérifier que les colonnes/tables existent dans les migrations.**

- Vérifier les colonnes dans `supabase/migrations/` avant tout `.select('col')` ou `.eq('col', val)`
- TypeScript **NE PEUT PAS** détecter les noms de colonnes incorrects dans les chaînes `.select('col')`
- Vérifier les FK avant les joins : utiliser `provider:provider_id(id, name)` (nom de colonne), pas `provider:providers(id, name)` (nom de table supposé)
- Vérifier les `DROP COLUMN` dans les migrations récentes avant de référencer une colonne

### Tables principales

| Table | Colonnes clés | Notes |
|-------|--------------|-------|
| `profiles` | id, email, full_name, is_admin, role, user_type, phone_e164, average_rating, review_count | `user_type` = 'client' ou 'artisan' |
| `providers` | id, name, slug, email, phone, siret, is_verified, is_active, stable_id, noindex, address_city, address_region, user_id, claimed_at, claimed_by | `name` (PAS company_name), colonnes dropped ci-dessous |
| `provider_claims` | id, provider_id, user_id, siret_provided, status, rejection_reason, reviewed_by, reviewed_at, created_at | status IN ('pending', 'approved', 'rejected') |
| `bookings` | provider_id, client_id, status, scheduled_date | `provider_id` (PAS artisan_id) |
| `audit_logs` | user_id → auth.users, action, resource_type, resource_id, old_value, new_value, metadata | FK vers auth.users (PAS profiles) |
| `user_reports` | reviewed_by, reviewed_at, resolution | PAS resolved_by, resolved_at, resolution_notes |
| `prospection_contacts` | company_name, ... | Distinct de providers.name |

### Colonnes SUPPRIMEES de `providers`

Ne jamais référencer : `is_premium`, `trust_badge`, `trust_score`, `company_name`, `hourly_rate_min`, `hourly_rate_max`, `emergency_available`, `certifications`, `insurance`, `payment_methods`, `languages`, `avatar_url`

### Tables INEXISTANTES

- `subscriptions` — n'existe PAS dans le schema public

---

## TypeScript

- **Strict mode** activé : `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Toujours nettoyer les imports inutilisés après chaque refactoring — le build échouera sinon
- Toujours vérifier les types des props/interfaces des composants existants avant de les utiliser (lire le fichier d'abord)
- Path alias : `@/*` → `./src/*`

---

## Conventions de code

- **Pas d'over-engineering** : solution minimale qui fonctionne
- **Polices** : Inter (body) + Plus Jakarta Sans (headings) via `next/font/google`
- **Icônes** : `lucide-react` (v0.294)
- **Validation** : `zod` pour tous les schemas d'API
- **State management** : `swr` pour le data fetching
- **Admin auth** : `requirePermission('resource', 'read'|'write')` de `@/lib/admin-auth`
- **Admin DB** : `createAdminClient()` de `@/lib/supabase/admin` pour bypass RLS (service_role)
- **Client DB** : `createClient()` de `@/lib/supabase/server` (respecte RLS)
- **Logger** : `logger.info/warn/error()` de `@/lib/logger` — ne pas utiliser `console.log` en production

---

## Auth

- **OAuth Google** activé (Supabase provider)
- **Facebook** : désactivé (pas fiable, pas utilisé)
- **Flow OAuth** : `signInWithOAuth()` → callback `/auth/callback` → création profil si premier login → redirect intelligent (`/espace-artisan` ou `/espace-client` selon `user_type`)
- **Middleware** : protège `/espace-client`, `/espace-artisan` — redirige vers `/connexion` si non connecté, redirige entre espaces selon `user_type`

---

## Revendication de fiche artisan

Flow complet :
1. Page artisan publique → bouton "Revendiquez cette fiche" (si non revendiquée)
2. Artisan entre son SIRET (14 chiffres)
3. API vérifie le SIRET vs celui en base → si match, crée un `provider_claims` avec status `pending`
4. Admin valide dans `/admin/revendications` → approuve ou rejette
5. Si approuvé : `providers.user_id` assigné, `profiles.user_type` → 'artisan'

---

## Tests

- **Framework** : Vitest avec jsdom
- **Config** : `vitest.config.ts`
- **Fichiers** : `src/**/*.test.{ts,tsx}` et `__tests__/**/*.test.{ts,tsx}`
- **Setup** : `src/test/setup.ts`
- Tests isolés (pas de dépendances Supabase réelles — schemas répliqués localement)

---

## SEO

Plan de domination SEO complet dans `SEO-DOMINATION-PLAN.md` à la racine du projet.
- Cible : 1.5M+ pages via 47 métiers x 13 680 lieux x 5 intents
- Lire ce fichier avant tout travail SEO

---

## Environnement

Variables requises (voir `.env.example`) :
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS` (liste séparée par virgules)
- Variables Stripe, Resend, Twilio, etc. selon les features
