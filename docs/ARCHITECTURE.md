# Architecture ServicesArtisans

## Vue d'Ensemble

ServicesArtisans est une plateforme de mise en relation B2C construite avec Next.js 14 et Supabase.

## Diagramme de Flux

```
                    +-------------------+
                    |     Vercel CDN    |
                    |   (Edge Network)  |
                    +---------+---------+
                              |
                    +---------v---------+
                    |   Next.js 14      |
                    |   App Router      |
                    +---------+---------+
                              |
           +------------------+------------------+
           |                  |                  |
    +------v------+   +-------v-------+  +-------v-------+
    | Server      |   | API Routes    |  | Static Pages  |
    | Components  |   | (/api/*)      |  | (ISR/SSG)     |
    +------+------+   +-------+-------+  +---------------+
           |                  |
           +--------+---------+
                    |
           +--------v--------+
           |    Supabase     |
           |   PostgreSQL    |
           +-----------------+
```

## Couches Applicatives

### 1. Presentation (Frontend)

```
src/app/                 # Routes et pages
src/components/          # Composants React
  ├── ui/               # Composants atomiques (Button, Input, Card)
  ├── artisan/          # Composants page artisan
  ├── admin/            # Composants dashboard admin
  └── common/           # Composants partages
```

### 2. Logique Metier

```
src/lib/                 # Utilitaires et services
  ├── supabase/         # Client et requetes Supabase
  ├── stripe/           # Integration paiements
  ├── email/            # Service d'emails (Resend)
  ├── seo/              # Helpers SEO et JSON-LD
  └── cache/            # Strategie de cache
```

### 3. Donnees (Backend)

```
supabase/
  └── migrations/       # Migrations SQL incrementales
```

## Modele de Donnees

### Tables Principales

```sql
-- Artisans/Prestataires
providers
  ├── id (uuid, PK)
  ├── user_id (uuid, FK -> auth.users)
  ├── business_name
  ├── slug (unique)
  ├── specialty
  ├── city, postal_code
  ├── is_verified, is_premium
  └── average_rating, review_count

-- Services
services
  ├── id (uuid, PK)
  ├── name, slug
  └── category_id

-- Reservations
bookings
  ├── id (uuid, PK)
  ├── provider_id (FK)
  ├── client_id (FK)
  ├── slot_id (FK)
  └── status (pending, confirmed, completed, cancelled)

-- Avis
reviews
  ├── id (uuid, PK)
  ├── provider_id (FK)
  ├── client_id (FK)
  ├── rating (1-5)
  └── comment
```

### Relations (Junction Tables)

```sql
provider_services      # Providers <-> Services (M:N)
provider_locations     # Providers <-> Locations (M:N)
```

## Strategies de Cache

### ISR (Incremental Static Regeneration)

| Type de Page | Revalidation |
|--------------|--------------|
| Homepage | 1 heure |
| Pages service | 15 minutes |
| Fiches artisan | 5 minutes |
| Pages statiques | 24 heures |

### Configuration

```typescript
// src/lib/cache.ts
export const REVALIDATE = {
  homepage: 3600,        // 1h
  serviceList: 900,      // 15min
  artisanProfile: 300,   // 5min
  staticPage: 86400,     // 24h
}
```

## Securite

### Middleware

```typescript
// src/middleware.ts
- Rate limiting sur les API
- Protection CSRF
- Validation des sessions
```

### Row Level Security (RLS)

Toutes les tables Supabase ont des politiques RLS activees.

### Headers de Securite

```javascript
// next.config.js
headers: [
  'X-DNS-Prefetch-Control',
  'X-XSS-Protection',
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
]
```

## SEO

### Schema.org JSON-LD

Chaque page artisan inclut:
- LocalBusiness
- BreadcrumbList
- FAQPage (si FAQ disponible)

### Sitemap Dynamique

```typescript
// src/app/sitemap.ts
- Genere automatiquement depuis Supabase
- Inclut tous les artisans actifs
- Mise a jour a chaque build
```

## Performance

### Optimisations

1. **Images**: next/image avec AVIF/WebP
2. **Fonts**: next/font avec preloading
3. **Code Splitting**: Automatique par route
4. **Bundle**: optimizePackageImports pour lucide-react, framer-motion

### Metriques Cibles

| Metrique | Cible |
|----------|-------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| Lighthouse Performance | > 90 |

## Mobile (Capacitor)

L'application est disponible en version mobile via Capacitor:

```bash
npm run mobile:sync     # Synchroniser
npm run mobile:android  # Android Studio
npm run mobile:ios      # Xcode
```

### Plugins Utilises

- @capacitor/camera
- @capacitor/geolocation
- @capacitor/push-notifications
- @capacitor/splash-screen

## Monitoring

### Sentry

Configuration dans:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

### Logs

```typescript
// src/lib/logger.ts
- Logs structures
- Niveaux: debug, info, warn, error
```

## API Externes

| Service | Usage |
|---------|-------|
| Supabase | Base de donnees, Auth |
| Stripe | Paiements |
| Resend | Emails transactionnels |
| INSEE/SIRENE | Enrichissement donnees entreprise |
| Google Calendar | Synchronisation agenda |
| Twilio | SMS (optionnel) |
