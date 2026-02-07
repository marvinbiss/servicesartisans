# ServicesArtisans — Project Guide

## Stack
- **Framework**: Next.js 14.2.35 (App Router) + React 18.2
- **Backend**: Supabase (Postgres, Auth, RLS, Realtime)
- **Payments**: Stripe (checkout, webhooks, portal)
- **Mobile**: Capacitor 8 (iOS + Android)
- **Testing**: Vitest (unit), Playwright (e2e)
- **State**: Zustand + TanStack Query
- **Maps**: Leaflet + React-Leaflet
- **Email**: Resend

## Architecture

### Route Groups
| Group | Path | Purpose |
|-------|------|---------|
| `(public)` | `/services/*`, `/blog`, `/faq`, `/contact` | SEO-indexed public pages |
| `(auth)` | `/connexion`, `/inscription`, `/mot-de-passe-oublie` | Auth flows, never indexed |
| `(private)` | `/espace-client/*`, `/espace-artisan/*` | Authenticated dashboards |
| `admin` | `/admin/*` | Admin panel, separate auth via `verifyAdmin()` |

### URL Hierarchy (SEO-critical)

**Hub** (liste artisans par service + ville):
```
/services/{service}/{location}/
```

**Fiche** (page artisan individuelle):
```
/services/{service}/{location}/{publicId}
```

- `service`: slug du metier (plombier, electricien, etc.)
- `location`: slug de la ville (paris, lyon-69000, etc.)
- `publicId`: identifiant public du provider — actuellement `stable_id` seul, evoluera vers `slug-stableIdShort`

**Route Next.js**: `src/app/(public)/services/[service]/[location]/[publicId]/page.tsx`

**Ne jamais casser ces URL.** Les moteurs de recherche les ont indexees. Tout changement de pattern exige un plan de redirections 301.

### API Structure
```
/api/providers/*       Public search + listings
/api/artisan/*         Authenticated artisan endpoints
/api/bookings/*        Booking CRUD (atomic via RPC)
/api/devis/*           Public quote requests
/api/admin/*           Admin-only (verifyAdmin() required)
/api/stripe/*          Payment webhooks + checkout
/api/auth/*            OAuth, 2FA, session
/api/cron/*            Scheduled jobs (CRON_SECRET)
```

## Invariants (NEVER violate)

### 1. stable_id
- HMAC-SHA256, 12-char base64url, immutable once assigned
- Sert de `publicId` dans les URL fiche artisan
- Genere cote serveur uniquement, jamais expose dans le code client
- Un stable_id par provider, pour toujours — jamais regenerer, jamais recycler

### 2. noindex par defaut
- Chaque nouveau provider a `noindex = TRUE`
- Les pages sont liberees pour l'indexation par **vagues** via le sitemap
- Seuls les providers avec `noindex = FALSE` apparaissent dans le sitemap dynamique
- Ne jamais passer noindex a FALSE en masse sans planification de vague

### 3. Neutralite de recherche
- `search_providers_v2()` remplace l'ancienne fonction de recherche
- **Zero biais premium** dans le classement
- Tri par: distance, note, pertinence, prix — jamais par tier d'abonnement
- Les providers gratuits ont la meme visibilite que les providers payants

### 4. Auth admin
- Chaque route `/api/admin/*` DOIT appeler `verifyAdmin()` avant tout acces aux donnees
- `createAdminClient()` (service_role) contourne le RLS — jamais l'utiliser sans guard auth
- Pattern obligatoire:
  ```typescript
  const authResult = await verifyAdmin()
  if (!authResult.success || !authResult.admin) {
    return authResult.error
  }
  ```

### 5. Bookings atomiques
- Toutes les reservations passent par le RPC `create_booking_atomic()`
- Empeche les doubles reservations via verrou base de donnees
- Jamais de INSERT direct dans bookings

### 6. RLS obligatoire
- Toutes les tables user-facing ont des politiques Row Level Security
- Helper `is_admin()` pour les checks RLS admin
- Jamais desactiver le RLS sur les tables de production
- Trois clients Supabase avec regles d'usage strictes:
  | Client | Fichier | Usage |
  |--------|---------|-------|
  | `createAdminClient()` | `lib/supabase/admin.ts` | Server-only, routes admin, contourne RLS |
  | `createClient()` (server) | `lib/supabase/server.ts` | Server Components, respecte RLS |
  | `createClient()` (browser) | `lib/supabase/client.ts` | Client Components, respecte RLS |

## Interdit

Ces elements ont ete deliberement supprimes dans la migration v2. **Ne jamais reintroduire:**

- `trust_badge` — Supprime des providers. Aucun style ou classement base sur les badges.
- `trust_score` — Supprime. Aucun scoring numerique des providers.
- `is_premium` dans search/sort/filter — Le tier d'abonnement ne doit jamais affecter les resultats de recherche.
- Tri premium-first dans les listes de providers
- Hierarchie visuelle basee sur les badges dans les cartes provider
- Attribution de leads biaisee par tier de paiement
- INSERT direct dans bookings (doit utiliser le RPC atomique)
- `createAdminClient()` sans guard `verifyAdmin()`

## Conventions

### Git
- Branche principale: `master` (pas `main`)
- Branches feature: prefixe `claude/` requis pour push
- Style de commit: `type(scope): message` (fix, feat, chore, refactor, docs)

### Code
- TypeScript strict mode
- Zod pour la validation aux frontieres systeme
- `force-dynamic` sur les routes API qui touchent Supabase
- Font stack systeme (fallback Inter, pas de web fonts embarquees)
- Imports dynamiques pour les composants client non-critiques (`ssr: false`)

### Environnement
- `.env.example` documente toutes les variables requises
- Le build echoue sans `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` est server-only, jamais exposer au client

### Testing
- `npm run test:unit` — Vitest (src/**/*.test.ts)
- `npm run test` — Playwright e2e
- Fichiers de test co-localises avec la source (ex: `route.test.ts` a cote de `route.ts`)

## Fichiers cles
```
src/
  app/
    (public)/services/[service]/[location]/             Hub (liste)
    (public)/services/[service]/[location]/[publicId]/  Fiche artisan
    (auth)/                                             Flux auth
    (private)/espace-artisan/                           Dashboard artisan
    (private)/espace-client/                            Dashboard client
    admin/(dashboard)/                                  Panel admin
    api/admin/                                          API admin (verifyAdmin)
    api/devis/                                          Demandes de devis publiques
    api/bookings/                                       CRUD reservations
    api/stripe/webhook/                                 Webhooks Stripe
    sitemap.ts                                          Sitemap dynamique (vagues)
    robots.ts                                           Robots.txt
  lib/
    admin-auth.ts                                       verifyAdmin(), permissions
    supabase/admin.ts                                   Client service_role
    supabase/server.ts                                  Client session
    supabase/client.ts                                  Client navigateur
    stripe/server.ts                                    Config plans Stripe
    seo/jsonld.ts                                       Generateurs Schema.org
    seo/config.ts                                       Helpers SEO
  middleware.ts                                         Auth guard, CSP, canonicalisation
supabase/
  migrations/                                           Fichiers SQL de migration
```
