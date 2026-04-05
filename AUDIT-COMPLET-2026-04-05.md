# ServicesArtisans - Audit Complet du Projet
**Date : 5 avril 2026** | **Auteur : Claude Opus 4.6 (5 agents paralleles)**

---

## TL;DR - Resume Executif

ServicesArtisans est un **annuaire d'artisans francais** (type PagesJaunes vertical) avec systeme de devis, messagerie temps reel, qualification vocale IA, et SEO programmatique massif. Plateforme de mise en relation clients-artisans sur le marche francais.

### Chiffres Cles
| Metrique | Valeur |
|----------|--------|
| **Pages potentielles** | ~842K URLs indexables |
| **Routes API** | 224 endpoints |
| **Composants React** | 308 fichiers (~54,649 LOC) |
| **Migrations SQL** | 376 fichiers |
| **Sitemaps** | 39 (17 static + 20 provider + 2 special) |
| **Cron jobs** | 22 taches planifiees |
| **Variables env** | 56+ |
| **Integrations tierces** | 25+ services |
| **Test coverage** | < 5% (6 test suites pour 224 routes) |

---

## 1. ARCHITECTURE & TECH STACK

### Stack Principal
- **Framework** : Next.js 14.2.35 (App Router) + React 18 + TypeScript 5.3 (strict)
- **Base de donnees** : Supabase PostgreSQL avec RLS (Row Level Security)
- **Hosting** : Vercel (auto-deploy depuis GitHub)
- **Styling** : Tailwind CSS 3.4.19 (custom design system, pas de shadcn/ui)
- **Auth** : Supabase Auth (JWT + OAuth Google)

### Integrations Majeures
| Service | Usage |
|---------|-------|
| **Stripe** | Paiements, subscriptions, webhooks |
| **Resend** | Emails transactionnels + newsletters |
| **Twilio** | SMS (notifications, verifications) |
| **Vapi** | Qualification vocale IA (WebRTC) |
| **Claude API** | Generation IA pour prospection email |
| **Google Calendar** | Integration calendrier artisans |
| **Sentry** | Error tracking + performance monitoring |
| **Upstash Redis** | Rate limiting (prod) |
| **IndexNow** | Indexation instantanee (Bing, Yandex) |
| **Leaflet** | Cartes interactives |
| **Microsoft Clarity** | Heatmaps, session replay |
| **ContentSquare** | Analytics UX |
| **Pappers/INSEE** | Verification SIRET/SIREN |

### Structure du Projet
```
servicesartisans/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login, inscription, OAuth
│   │   ├── (public)/           # Pages publiques (183+ pages)
│   │   ├── (private)/          # Espaces client/artisan proteges
│   │   ├── admin/              # Back-office admin (45+ pages)
│   │   └── api/                # 224 routes API
│   ├── components/             # 308 composants (25 repertoires)
│   │   ├── ui/ (53)            # Design system (Button, Input, Modal...)
│   │   ├── seo/ (34)           # Composants SEO (JSON-LD, liens internes)
│   │   ├── artisan/ (37)       # Pages profil artisan
│   │   ├── admin/ (21)         # Dashboard admin
│   │   ├── conversion/ (20)    # CTAs, exit-intent, sticky bars
│   │   └── ...
│   ├── lib/                    # 34 modules utilitaires
│   │   ├── supabase/           # Clients DB (server, admin, browser)
│   │   ├── seo/                # Sitemaps, JSON-LD, IndexNow, pruning
│   │   ├── email/              # Templates Resend
│   │   ├── sms/                # Twilio
│   │   ├── stripe/             # Paiements
│   │   ├── realtime/           # Chat Supabase real-time
│   │   ├── prospection/        # Campagnes email/SMS + IA
│   │   └── ...
│   ├── hooks/                  # 15 hooks custom (useAuth, useProvider...)
│   └── types/                  # Interfaces TypeScript
├── supabase/migrations/        # 376 fichiers SQL
├── __tests__/                  # Tests (couverture faible)
├── public/                     # Assets statiques
└── next.config.js              # 545 lignes (rewrites, redirects, headers)
```

---

## 2. BASE DE DONNEES

### Tables Principales
| Table | Role |
|-------|------|
| `profiles` | Comptes utilisateurs (client/artisan/admin) |
| `providers` | Fiches artisans (SIRET, adresse, services, avis) |
| `services` | 47 metiers (plombier, electricien, etc.) |
| `locations` | 2,267 communes francaises (>5K habitants) |
| `provider_services` | N:N providers <-> services |
| `provider_locations` | N:N providers <-> zones d'intervention |
| `devis_requests` | Demandes de devis clients |
| `lead_assignments` | Dispatch leads vers artisans (algorithme) |
| `quotes` | Devis envoyes par artisans |
| `bookings` | Reservations de rendez-vous |
| `availability_slots` | Creneaux dispo artisans |
| `reviews` | Avis clients (1-5 etoiles, moderation) |
| `conversations` / `messages` | Chat temps reel |
| `provider_claims` | Revendication de fiches (SIRET) |
| `audit_logs` | Journal d'audit admin |
| `prospection_*` | Campagnes prospection (contacts, templates, conversations) |
| `voice_calls` | Appels vocaux qualifies (Vapi/Twilio) |
| `cms_content` | Contenu editorial versionne |
| `gdpr_*` | Conformite RGPD (acces, suppression, desabonnement) |
| `algorithm_config` | Config algo dispatch leads |
| `seo_*` | Metriques SEO, scores pages, crawl stats |

### Relations Cles
```
auth.users (Supabase)
  └── profiles (1:1)
       ├── bookings (client_id ou artisan_id)
       └── providers (user_id, nullable = non revendique)
            ├── provider_services → services
            ├── provider_locations → locations
            ├── reviews (via bookings)
            └── provider_claims (revendication)
```

### RLS (Row Level Security)
- **Toutes les tables** ont RLS active
- Utilisateurs voient uniquement leurs propres donnees
- Admin utilise `createAdminClient()` (service role, bypass RLS)
- Providers publics filtres par `is_active` + `noindex`

---

## 3. FONCTIONNALITES METIER

### 3.1 Types d'Utilisateurs
| Type | Role | Dashboard |
|------|------|-----------|
| **Client** | Cherche artisan, demande devis, donne avis | `/espace-client` |
| **Artisan** | Gere profil, repond aux leads, envoie devis | `/espace-artisan` |
| **Admin** | Moderation, prospection, analytics, CMS | `/admin` |

### 3.2 Systeme de Devis (End-to-End)
1. **Client** soumet demande (service, ville, description, urgence)
2. **Algorithme** dispatch aux artisans via `lead_assignments` (proximite, note, qualite, urgence)
3. **Artisan** recoit notification (email/SMS) + voit dans dashboard
4. **Artisan** envoie devis (`quotes` table)
5. **Client** compare et accepte/refuse
6. **Post-prestation** : demande d'avis automatique

### 3.3 Profils Artisans
- Informations : nom, SIRET, bio, services, tarifs, horaires, zone d'intervention
- Media : photos portfolio, avant/apres
- Avis : note moyenne, nombre, reponses artisan
- Verification : badge SIRET verifie, revendication admin
- Completude : indicateur visuel dans le dashboard

### 3.4 Messagerie Temps Reel
- Supabase Realtime (subscriptions)
- Indicateurs de frappe, presence en ligne, accuses de lecture
- Types : texte, image, fichier, systeme

### 3.5 Systeme d'Avis
- Notes 1-5 etoiles + commentaire + "recommanderiez-vous ?"
- Validation HMAC-SHA256 pour liens de review non-connectes
- Workflow : pending → published/rejected (moderation admin)
- Reponse artisan possible sur avis publies

### 3.6 Reservations / Calendrier
- Artisan definit creneaux via calendrier interactif
- Client reserve creneaux disponibles
- Rappels automatiques : 24h et 1h avant (email + SMS)

### 3.7 IA & Voice
- **Prospection IA** : Claude/OpenAI genere reponses email (editable)
- **Qualification vocale** : Vapi + Twilio + ElevenLabs
  - Scoring A/B/C/disqualifie
  - Criteres : type projet, urgence, budget, code postal
- **Escalation** : mots-cles declenchent review humain

### 3.8 Paiements (Partiel)
- Stripe integre (webhook, checkout, portal)
- **Table `subscriptions` n'existe PAS** (aspirational)
- Admin peut voir stats revenus, gerer remboursements

---

## 4. SEO & PAGES PROGRAMMATIQUES

### Architecture pSEO (3 dimensions)
- **47 metiers** x **2,267 villes** x **5 intents** = ~530K pages Tier 1
- Intents : `/services/`, `/devis/`, `/tarifs/`, `/urgence/`, `/avis/`
- Tier 2 (top 500 villes) : tarifs x taches, problemes x villes

### Sitemaps (39 total)
| Type | URLs |
|------|------|
| Static (hubs, blog, guides) | ~250 |
| Service x City (Tier 1) | ~106,749 |
| Devis x City | ~106,749 |
| Urgence x City | ~104,282 |
| Tarifs x City | ~106,749 |
| Tarifs x Task x City (Tier 2) | ~75,000 |
| Avis x City (Tier 2) | ~23,000 |
| Problemes x City | ~15,000 |
| Providers (dynamique DB) | jusqu'a 100K |
| **TOTAL** | **~842K+ URLs** |

### Metadata & Structured Data
- **28 pages dynamiques** avec `generateMetadata()`
- **11 schemas JSON-LD** : Organization, WebSite, LocalBusiness, Service, BreadcrumbList, FAQPage, Article, ItemList, Speakable, LocalService, CityServicesList
- Canonical self-referencing + hreflang fr-FR + x-default
- OpenGraph + Twitter Cards sur toutes les pages

### Indexation
- **IndexNow** : 500 URLs/jour, rotation 3 jours
- **Feeds XML** : blog, nouveaux artisans, nouvelles pages
- **GSC sync** : cron quotidien
- **Sitemap health** : verification quotidienne (HTTP 200 + XML valide)

### Robots.txt
- **16 bots autorises** (Googlebot, Bingbot, ChatGPT-User, Claude-SearchBot, Applebot...)
- **8 scrapers SEO bloques** (Ahrefs, Semrush, MJ12bot...)
- **10 scrapers IA bloques** (GPTBot, Google-Extended, CCBot...)
- Disallow : admin, API, auth, espaces prives, params UTM/tracking

### Strategie Noindex
- Pages auth, CGV, mentions legales, accessibilite
- Pages quartiers (contenu fin)
- Pages 0 providers + pas de donnees uniques
- Middleware ajoute `X-Robots-Tag: noindex` sur routes privees

---

## 5. FRONTEND & DESIGN SYSTEM

### Design System Custom
- **Couleur primaire** : Terracotta (#D4553A)
- **Secondaire** : Honey Gold (#e8960a)
- **Accent** : Forest Green (#3D8B68)
- **Neutres** : Sand (beige chaud) + Charcoal (gris chaud)
- **Typographie** : Sora (titres) + DM Sans (corps)
- **20 animations** custom, 12 shadows, 10 gradients

### Composants (308 fichiers)
| Categorie | Fichiers | Role |
|-----------|----------|------|
| ui/ | 53 | Primitives (Button, Input, Modal, Skeleton...) |
| seo/ | 34 | Liens internes, snippets, clusters topiques |
| artisan/ | 37 | Page profil artisan complete |
| admin/ | 21 | Dashboard admin + CMS |
| conversion/ | 20 | CTAs, exit-intent, sticky bars, urgence |
| artisan-dashboard/ | 14 | Gestion profil artisan |
| estimation/ | 11 | Widget flottant + chat IA |
| maps/ | 10 | Cartes Leaflet interactives |
| search/ | 8 | Recherche + filtres avances |
| reviews/ | 7 | Badges authenticite, galerie photos |

### Accessibilite
- **852 attributs ARIA** dans 138 fichiers
- Focus trap dans modales, navigation clavier
- Touch targets 44px+ (standard mobile)
- `lang="fr"` sur root, textes sr-only

### Responsive
- Mobile-first (Tailwind breakpoints)
- Sticky CTA mobile, bottom sheets, bottom nav
- Modales full-screen sur mobile

### Ratio Client/Server
- **245 client components (79.5%)** — interactifs, hooks, events
- **63 server components (20.5%)** — data fetching SSR

---

## 6. PERFORMANCE & CACHE

### Strategie Cache Multi-Couche
| Couche | TTL | Scope |
|--------|-----|-------|
| ISR (Next.js) | 24h | Pages pSEO |
| CDN (Vercel) | `s-maxage=86400, stale-while-revalidate=604800` | Toutes pages publiques |
| API cache in-memory | 1min-24h | SIRENE, geocoding, autocomplete |
| SWR client | 30s refresh | Dashboard artisan |
| Static assets | 1 an immutable | `/_next/static/`, fonts |
| Routes privees | `no-store, no-cache` | Espaces client/artisan/admin |

### Rate Limiting
- Upstash Redis (sliding window)
- Fail-close par defaut (deny si Redis down)
- Configure par endpoint + par IP

### Build
- Pre-render ~626 pages au build
- ISR on-demand pour le reste (~842K pages)
- Build timeout : 600s
- `NEXT_BUILD_SKIP_DB=1` (skip DB au build)

---

## 7. SECURITE

### Protection en Place
| Mesure | Implementation |
|--------|----------------|
| **CSP** | Middleware + next.config.js |
| **HSTS** | 2 ans avec preload |
| **X-Frame-Options** | DENY |
| **X-Content-Type-Options** | nosniff |
| **Rate Limiting** | Upstash Redis par IP |
| **Input Validation** | Zod sur TOUTES les routes API |
| **Sanitization** | DOMPurify (CMS content) |
| **RLS** | Toutes tables Supabase |
| **CSRF** | Validation Origin + Sec-Fetch-Site |
| **Auth** | JWT Supabase + session SSR |
| **Admin RBAC** | `requirePermission()` par ressource |
| **2FA** | TOTP via otplib (optionnel) |

### Faiblesses Identifiees
- Pas de WAF (Web Application Firewall)
- Pas d'IP allowlisting pour admin
- Rate limiter fail-close = risque d'outage si Redis down
- Pas de circuit breaker pour APIs externes

---

## 8. MONITORING & LOGS

### En Place
- **Sentry** : errors + performance (10% traces, 100% on error)
- **Logger structure** : apiLogger, dbLogger, authLogger, paymentLogger
- **22 cron jobs** avec logging
- **Googlebot logging** : fire-and-forget dans middleware

### Manquant
- Pas d'APM au-dela de Sentry
- Pas de metriques cache hit/miss
- Pas d'agregation sante cron jobs
- Pas de monitoring queries DB

---

## 9. TESTS & CI/CD

### Tests (Couverture Faible)
- **Framework** : Vitest + jsdom + Playwright
- **Fichiers de test** : ~6 suites pour 224 routes API
- **Coverage** : < 5% effectif
- **Seuils** : 60% statements, 50% branches (non atteints)
- **E2E** : uniquement @critical flows

### CI/CD (GitHub Actions)
```
1. TypeScript check (tsc --noEmit)
2. Unit tests (vitest run)
3. Production build (NEXT_BUILD_SKIP_DB=1)
4. Smoke tests
5. E2E critical flows (Playwright)
```
- Timeout : 15 minutes
- Concurrency control (cancel stale runs)
- Next.js cache preserved entre runs

### Manquant
- Pas de SAST/DAST
- Pas de npm audit automatise
- Pas de Lighthouse CI
- Pas de migration CI/CD

---

## 10. PROBLEMES CRITIQUES IDENTIFIES

### P0 - Bloquants
1. **Table `devis` manquante** — 6 TODOs referençent une table inexistante. Reviews, stats et workflows de devis sont impactes.
2. **Test coverage < 5%** — 6 suites pour 224 routes = regressions non detectees en prod.
3. **Rate limiter fail-close** — Redis down = TOUS les requetes bloquees, outage potentiel.

### P1 - Important
4. **Barrel exports artisan** — 26 composants exportes depuis un index.ts = bundle bloat potentiel.
5. **Pas de monitoring cron** — 22 jobs sans dashboard de sante centralise.
6. **Code splitting incomplet** — Tiptap (1.2MB+), Recharts (150KB+), Leaflet (200KB+) charges globalement.
7. **Table `subscriptions` inexistante** — Business model paiement partiellement implemente.

### P2 - Amelioration
8. **Pas de Storybook** — 308 composants sans documentation visuelle.
9. **Pas de react-hook-form** — Gestion formulaire manuelle pour des forms complexes.
10. **Images inconsistantes** — Mix de next/image et `<img>` HTML.
11. **Pas de circuit breaker** — APIs externes sans retry ni fallback.
12. **Pas de staging** — Deploy direct en prod depuis GitHub.

---

## 11. PHASE ACTUELLE DU PROJET

- **Phase** : Rodage equipes (avril 2026)
- **Dispatch** : Gratuit pour les artisans (pas de monetisation volontaire)
- **Focus** : Trafic SEO + volume de devis
- **Monetisation** : 0 EUR delibere — priorite acquisition artisans
- **Mobile** : App Capacitor (iOS/Android) en preparation

---

## 12. DECISION RULES CRITIQUES (A RESPECTER)

1. **NE JAMAIS afficher les telephones artisans depuis la DB cote public** (trop d'erreurs)
2. **NE JAMAIS ajouter de CTA devis sur fiches non revendiquees** (plaintes artisans) — utiliser CTAs generiques metier+ville
3. **NE JAMAIS recommander de chatbot** sur le site (tue la conversion)
4. **NE JAMAIS commiter de credentials** — toujours process.env
5. **1 commit = 1 changement** — pas de debug/temp, pas de superlatifs
6. **Tester avant push** — discipline de commit stricte
7. **Zero tolerance donnees incorrectes** — mieux vaut pas de donnees que des fausses
8. **NE JAMAIS push sur servicesartisans sans verifier le remote** (risque cross-project)

---

## 13. VARIABLES D'ENVIRONNEMENT REQUISES

```env
# Supabase (3)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Stripe (5)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID
STRIPE_PREMIUM_PRICE_ID

# Email — Resend (3)
RESEND_API_KEY
FROM_EMAIL
RESEND_WEBHOOK_SECRET

# Securite (3)
CRON_SECRET
UNSUBSCRIBE_SECRET
REVALIDATE_SECRET

# Site (1)
NEXT_PUBLIC_SITE_URL

# Google (2)
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

# Verification SIRET (3)
INSEE_CONSUMER_KEY
INSEE_CONSUMER_SECRET
PAPPERS_API_KEY

# SEO (1)
INDEXNOW_API_KEY

# SMS — Twilio (3, optionnel)
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER

# Voice — Vapi (3, optionnel)
VAPI_API_KEY
VAPI_WEBHOOK_SECRET
VAPI_ASSISTANT_ID

# Monitoring (3, optionnel)
NEXT_PUBLIC_SENTRY_DSN
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# Admin (1)
ADMIN_EMAILS
```

---

*Audit genere automatiquement par 5 agents Claude Opus 4.6 en parallele.*
*Duree totale d'audit : ~5 minutes.*
