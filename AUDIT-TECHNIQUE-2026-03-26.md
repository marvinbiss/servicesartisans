# Audit Technique Approfondi — 2026-03-26

## Résumé exécutif

**20 agents parallèles** ont audité l'infrastructure technique de ServicesArtisans sur 10 axes :
Stripe, Middleware, Console.log, Crons, Responsive, Env, Emails, Next.js Config, Images/Assets, SEO JSON-LD, RLS Supabase, Performance N+1, Error Handling, Race Conditions, Phantom DB Columns, Loading/Error States, Accents français, TypeScript Types, Data Integrity, Sécurité OWASP.

### Bilan global

| Sévérité | Nombre |
|----------|--------|
| **BLOQUANT** | 72 |
| **MAJEUR** | 156 |
| **MINEUR** | 141 |
| **TOTAL** | **369** |

---

## 🔴 TOP 15 ISSUES CRITIQUES

### 1. Stripe — Montant contrôlé par le client
**Fichier** : routes Stripe checkout
**Impact** : Un utilisateur peut payer 1 centime pour n'importe quel service. Le montant vient du frontend sans vérification côté serveur.
**Fix** : Calculer le montant côté serveur à partir du service/plan demandé.

### 2. Mot de passe Postgres hardcodé dans le git
**Impact** : `BEB6LnGlT6U9bkTe` visible dans 20+ scripts de migration/seed. Même si c'est un MDP local, c'est dans l'historique git.
**Fix** : Rotation immédiate du MDP Supabase, audit des accès, `.env` pour tous les scripts.

### 3. XSS dans TOUS les templates email
**Fichier** : `src/lib/email/resend.ts`, `src/lib/services/email-service.ts`
**Impact** : Les données utilisateur (nom, description, message) sont interpolées en HTML sans échappement. Un attaquant peut injecter du JS dans les emails reçus par les artisans/admins.
**Fix** : `htmlEscape()` sur toute donnée utilisateur dans les templates.

### 4. Route `/api/notifications/send-lead-alert` sans auth
**Impact** : Endpoint public qui envoie des SMS/emails. Vecteur de spam massif, coûts Twilio/Resend incontrôlés.
**Fix** : Ajouter `requirePermission()` ou un token CRON_SECRET.

### 5. `providers.average_rating` vs `rating_average` — Notes jamais mises à jour
**Fichier** : `src/app/api/reviews/route.ts:509`
**Impact** : Le code écrit `.update({ average_rating: ... })` mais la colonne s'appelle `rating_average`. Les notes artisans ne se mettent JAMAIS à jour après un avis.
**Fix** : Renommer en `rating_average`.

### 6. `reviews.artisan_id` FK vers `profiles(id)` au lieu de `providers(id)`
**Fichier** : `supabase/migrations/021_reviews_system.sql`
**Impact** : La FK pointe vers la mauvaise table. Chaque INSERT d'avis avec un `provider_id` échoue si la contrainte est active.
**Fix** : `ALTER TABLE reviews DROP CONSTRAINT ... ADD CONSTRAINT ... REFERENCES providers(id)`.

### 7. `devis_requests` — ZÉRO index sur la table la plus sollicitée
**Fichier** : `supabase/migrations/100_v2_schema_cleanup.sql`
**Impact** : Full table scan sur chaque soumission de devis (check doublon), chaque render ISR de 1.4M pages, chaque cron.
**Fix** : Index sur `(client_email, created_at)`, `(status)`, `(service_name)`.

### 8. Open redirect via Host header dans le middleware
**Fichier** : `src/middleware.ts`
**Impact** : Un attaquant peut manipuler le header Host pour rediriger les utilisateurs vers un site malveillant.
**Fix** : Whitelist des domaines autorisés.

### 9. Faux avis encore dans le JSON-LD
**Fichier** : pages `/avis` et `/tarifs`
**Impact** : Google peut détecter les avis fake dans les données structurées → pénalité manuelle, perte de rich snippets.
**Fix** : Ne servir que les vrais avis vérifiés dans le JSON-LD.

### 10. Factures `ON DELETE CASCADE` sur provider
**Fichier** : `supabase/migrations/006_analytics_and_invoices.sql`
**Impact** : Supprimer un provider détruit toutes ses factures. Violation des obligations comptables (conservation 6 ans).
**Fix** : `ON DELETE RESTRICT`.

### 11. `review_votes` — Conflit de schema entre migrations 021 et 340
**Impact** : La colonne `voter_fingerprint` (utilisée par le code) peut ne pas exister si 021 a été exécutée avant 100.
**Fix** : Migration explicite qui garantit le schema final.

### 12. ErrorBoundary composant mort — jamais importé
**Fichier** : `src/components/ErrorBoundary.tsx`
**Impact** : Aucun composant client n'est protégé par un Error Boundary. Toute erreur React crashe la page entière.
**Fix** : Wrapper les layouts clients avec `<ErrorBoundary>`.

### 13. 6 routes API cron sans try/catch global
**Fichiers** : `cache-warmup`, `crawl-stats`, `voice-lead-expiry`, `voice-stats`, `badge/search`, + 1
**Impact** : Toute exception non-Supabase crashe en 500 silencieux.
**Fix** : Ajouter try/catch global avec `logger.error`.

### 14. `LegacyProviderFields` utilisé par 18+ composants
**Fichier** : `src/types/legacy/index.ts`
**Impact** : `is_premium`, `trust_badge`, `trust_score` sont `undefined` au runtime → badges jamais affichés, logique de tri cassée.
**Fix** : Supprimer le type legacy et adapter les composants.

### 15. 4 tables schema `app` sans RLS
**Fichier** : `supabase/migrations/110_v3_full_schema.sql`
**Tables** : `app.artisan_monthly_usage`, `app.artisan_merges`, `app.outreach_messages`, `app.events`
**Impact** : Données de prospection et usage lisibles par n'importe qui avec l'anon key.
**Fix** : `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.

---

## DÉTAIL PAR AXE D'AUDIT

---

### A. STRIPE & PAIEMENTS (10B, 6M, 4m)

| # | Sévérité | Fichier | Problème |
|---|----------|---------|----------|
| 1 | BLOQUANT | Routes Stripe checkout | Montant contrôlé par le client |
| 2 | BLOQUANT | Webhook Stripe | Colonnes fantômes `first_name`, `last_name`, `business_name` sur profiles |
| 3 | BLOQUANT | Webhook handler | Pas de vérification de signature Stripe sur certains endpoints |
| 4 | BLOQUANT | Checkout session | `success_url` et `cancel_url` non validées (open redirect potentiel) |
| 5-10 | BLOQUANT | Divers | Logique d'abonnement avec `subscriptions` table inexistante, prix hardcodés |
| 11-16 | MAJEUR | Divers | Deux clients Stripe avec configs différentes, pas de retry, pas d'idempotency key |
| 17-20 | MINEUR | Divers | Console.log dans les handlers, montants en EUR hardcodés |

---

### B. MIDDLEWARE (2B, 5M, 5m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1 | BLOQUANT | Open redirect via Host header manipulation |
| 2 | BLOQUANT | CSP bypass possible via `unsafe-inline` dans style-src |
| 3-7 | MAJEUR | Redirections auth fragiles, headers de sécurité manquants sur certaines routes |
| 8-12 | MINEUR | Regex de matching trop permissives, logs verbeux |

---

### C. CONSOLE.LOG (101 occurrences)

| Catégorie | Nombre | Sévérité |
|-----------|--------|----------|
| Routes API production | 23 | MAJEUR |
| Composants client | 34 | MINEUR |
| Libs/services | 18 | MAJEUR |
| Tests/dev-only | 26 | MINEUR |

---

### D. CRON JOBS (4B, 10M, 11m)

| # | Sévérité | Fichier | Problème |
|---|----------|---------|----------|
| 1 | BLOQUANT | `abandon-emails` | Boucle séquentielle 50 emails × 200ms = timeout |
| 2 | BLOQUANT | `cache-warmup` | 7500 fetch sans try/catch global |
| 3 | BLOQUANT | `voice-lead-expiry` | N+1 query dans boucle for |
| 4 | BLOQUANT | `indexnow-submit` | URLs hardcodées qui n'existent plus |
| 5-14 | MAJEUR | Divers | Pas de dead letter queue, pas de monitoring d'échec, pas de retry |
| 15-25 | MINEUR | Divers | Logs insuffisants, timestamps UTC vs Paris |

---

### E. RESPONSIVE / MOBILE (2B, 12M, 18m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1 | BLOQUANT | CTA "Demander un devis" invisible sur desktop (`md:hidden`) |
| 2 | BLOQUANT | PWA manifest référence screenshots/icons inexistants |
| 3-14 | MAJEUR | Overflow horizontal sur 12 pages, touch targets < 44px, modals non scrollables |
| 15-32 | MINEUR | Espacement inconsistant, font-size < 16px sur inputs iOS (zoom auto) |

---

### F. VARIABLES D'ENVIRONNEMENT (3B, 11M, 8m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1 | BLOQUANT | MDP Postgres hardcodé dans 20+ fichiers |
| 2 | BLOQUANT | `SUPABASE_SERVICE_ROLE_KEY` utilisé côté client dans 1 fichier |
| 3 | BLOQUANT | Fallback API keys hardcodées (IndexNow) |
| 4-14 | MAJEUR | Variables manquantes sans fallback gracieux, `.env.example` incomplet |
| 15-22 | MINEUR | Variables inutilisées, nommage inconsistant |

---

### G. EMAILS RESEND (8B, 17M, 15m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1-3 | BLOQUANT | XSS dans templates (données user non échappées) |
| 4-5 | BLOQUANT | Aucun timeout sur les appels Resend |
| 6-8 | BLOQUANT | Envois séquentiels dans boucles (timeout) |
| 9-25 | MAJEUR | Pas de retry, pas de bounce handling, from/reply-to inconsistants |
| 26-40 | MINEUR | Templates HTML sans responsive, alt text manquant |

---

### H. NEXT.JS CONFIG (1B, 5M, 10m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1 | BLOQUANT | `experimental.serverActions` activé sans CSRF protection |
| 2-6 | MAJEUR | `images.domains` trop permissif, rewrites qui masquent des 404 |
| 7-16 | MINEUR | Headers cache suboptimaux, redirects manquants |

---

### I. IMAGES / ASSETS (7B, 11M, 6m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1-3 | BLOQUANT | Composants référencent des images qui n'existent pas dans `/public` |
| 4-5 | BLOQUANT | PWA icons manquants (192x192, 512x512) |
| 6-7 | BLOQUANT | Favicon.ico corrompu ou manquant |
| 8-18 | MAJEUR | Images > 500KB non optimisées, pas de `next/image` sur 30+ `<img>` |
| 19-24 | MINEUR | Alt text manquant, srcset non utilisé |

---

### J. SEO / JSON-LD (5B, 7M, 7m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1 | BLOQUANT | Faux avis dans JSON-LD `/avis` et `/tarifs` |
| 2 | BLOQUANT | `aggregateRating` avec des valeurs calculées sur fake data |
| 3 | BLOQUANT | JSON-LD `LocalBusiness` sans adresse réelle (placeholder) |
| 4-5 | BLOQUANT | Schema.org invalide (champs requis manquants) |
| 6-12 | MAJEUR | Canonical URLs inconsistantes, hreflang manquant |
| 13-19 | MINEUR | Breadcrumbs JSON-LD incomplets, description dupliquées |

---

### K. SÉCURITÉ RLS SUPABASE (2B, 7M, 5m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1-2 | BLOQUANT | `profiles` SELECT policy trop permissive (tous les users voient tous les profils) |
| 3-6 | MAJEUR | 4 tables schema `app` sans RLS activé |
| 7-8 | MAJEUR | Policies UPDATE sur `providers` trop larges |
| 9-11 | MAJEUR | `audit_logs` FK vers `auth.users` (pas `profiles`) - RLS policy référence `admin_users` inexistante |
| 12-14 | MINEUR | Policies redondantes, nommage inconsistant |

---

### L. PERFORMANCE N+1 & QUERIES (3B, 8M, 6m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1 | BLOQUANT | Money page (1.4M pages) : 5 requêtes séquentielles → `Promise.all()` = -300ms TTFB |
| 2 | BLOQUANT | `abandon-emails` cron : boucle N+1 sendEmail + update |
| 3 | BLOQUANT | `barometre/queries.ts` : `_getTopVilles` charge 5000 lignes puis agrège en JS |
| 4-11 | MAJEUR | `select('*')` sans limit, `ilike` sans index (full scan), requêtes à-propos fallback charge 743K lignes |
| 12-17 | MINEUR | Requêtes parallélisables non parallélisées |

---

### M. ERROR HANDLING (6B, 8M, 6m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1 | BLOQUANT | `ErrorBoundary.tsx` existe mais n'est importé NULLE PART |
| 2-6 | BLOQUANT | 5 routes API cron sans try/catch global |
| 7-8 | MAJEUR | Aucun timeout sur Resend fetch (hang jusqu'au timeout Vercel) |
| 9-10 | MAJEUR | Deux clients Stripe avec configs différentes (un avec retry, l'autre sans) |
| 11-14 | MAJEUR | Erreurs Supabase non vérifiées (`.data` utilisé sans check `.error`) |
| 15-20 | MINEUR | `console.error` au lieu de `logger.error`, catch vides |

---

### N. RACE CONDITIONS & STATE (2B, 6M, 18m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1-2 | BLOQUANT | Double-submit possible sur formulaires devis et inscription (pas de debounce/disable) |
| 3-8 | MAJEUR | 6 composants avec `useEffect` + fetch sans `AbortController` — stale data si props changent vite (`SimilarArtisans`, `ReviewsSection`, `CityMap`, messages artisan/client) |
| 9-26 | MINEUR | 18 composants avec fetch sans cleanup (state update après unmount) |

---

### O. PHANTOM DB COLUMNS (4B, 8M, 5m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1 | BLOQUANT | `bookings.total_price` référencé mais colonne s'appelle `total_amount` |
| 2 | BLOQUANT | `bookings.service_type` n'existe pas |
| 3 | BLOQUANT | `access_logs` table JAMAIS créée (aucun CREATE TABLE) mais référencée |
| 4 | BLOQUANT | `leads` table n'existe pas dans schema `public` — `lead_events` FK cassée (corrigée par migration 322) |
| 5-12 | MAJEUR | `is_premium` encore référencé dans 8 fichiers, `company_name` sur providers, `business_name` sur profiles |
| 13-17 | MINEUR | Colonnes optionnelles supposées obligatoires |

---

### P. LOADING / ERROR STATES (1B, 5M, 12m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1 | BLOQUANT | Page `/services/[service]/[location]` (money page) sans `error.tsx` local |
| 2-6 | MAJEUR | 5 pages dynamiques ISR sans `loading.tsx` propre |
| 7-8 | MAJEUR | Pages admin `use client` avec fetch lent sans skeleton |
| 9-18 | MINEUR | Loading spinners inconsistants (Loader2 vs skeleton vs texte) |

---

### Q. ACCENTS FRANÇAIS (2B, 12M, 42m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1 | BLOQUANT | `VerifierClient.tsx` — page publique entière SANS AUCUN accent (H1, badges, labels, messages d'erreur) |
| 2 | BLOQUANT | Formulaire inscription artisan — accents manquants sur labels et placeholders visibles |
| 3-14 | MAJEUR | 12 pages avec accents manquants sur des éléments visibles (titres, boutons, badges) |
| 15-56 | MINEUR | 42 occurrences d'accents manquants dans du texte secondaire |

---

### R. TYPESCRIPT TYPES vs DB (5B, 6M, 4m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1 | BLOQUANT | `Review.provider_id` mais colonne DB s'appelle `artisan_id` |
| 2 | BLOQUANT | `AdminUserView` a `is_verified`, `is_banned`, `ban_reason`, `last_login` — aucun n'existe en DB |
| 3 | BLOQUANT | `AdminService.category_id` mais DB a `category` (texte) |
| 4 | BLOQUANT | `Booking` type a 7 champs qui n'existent pas dans les migrations |
| 5 | BLOQUANT | `LegacyProviderFields` utilisé par 18+ composants, toujours `undefined` au runtime |
| 6-11 | MAJEUR | `SubscriptionRecord` (table inexistante), `intervention_zone` (droppée), `ProviderVerification.trustBadge` |
| 12-15 | MINEUR | Champs optionnels vs obligatoires inversés |

---

### S. DATA INTEGRITY & FK (5B, 14M, 10m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1 | BLOQUANT | `reviews.artisan_id` FK vers `profiles` au lieu de `providers` |
| 2 | BLOQUANT | `devis_requests` ZÉRO index |
| 3 | BLOQUANT | `invoices.provider_id ON DELETE CASCADE` — détruit les factures |
| 4 | BLOQUANT | `review_votes` conflit schema migrations 021 vs 340 |
| 5 | BLOQUANT | `providers.average_rating` vs `rating_average` — notes jamais mises à jour |
| 6-19 | MAJEUR | CASCADE manquant sur `provider_claims`, conflits entre 5 paires de migrations, CHECK constraints absentes |
| 20-29 | MINEUR | Index manquants secondaires, NOT NULL sans default |

---

### T. SÉCURITÉ OWASP (5B, 11M, 8m)

| # | Sévérité | Problème |
|---|----------|----------|
| 1 | BLOQUANT | `/api/notifications/send-lead-alert` sans auth (email/SMS bombing) |
| 2 | BLOQUANT | XSS dans templates email |
| 3 | BLOQUANT | MDP Postgres hardcodé dans git |
| 4-5 | BLOQUANT | Pas de rate limiting sur 5 endpoints publics sensibles (`inscription-artisan`, `reviews/vote`, `abandon-tracking`) |
| 6-16 | MAJEUR | CSRF, information disclosure, PII sans TTL (RGPD), `createAdminClient()` sur endpoints publics |
| 17-24 | MINEUR | Logs trop verbeux, error messages trop détaillés |

---

## PLAN DE CORRECTION PAR PRIORITÉ

### Sprint 1 — Sécurité critique (2-3h)
1. Sécuriser `/api/notifications/send-lead-alert` (ajouter auth)
2. `htmlEscape()` dans tous les templates email
3. Rotation MDP Postgres + `.env` pour tous les scripts
4. Rate limiting sur les 5 endpoints manquants
5. Fix open redirect middleware (whitelist domaines)

### Sprint 2 — Intégrité données (3-4h)
6. Fix `rating_average` vs `average_rating` dans reviews/route.ts
7. Fix FK `reviews.artisan_id` → `providers(id)`
8. Ajouter indexes sur `devis_requests`
9. Fix `invoices ON DELETE RESTRICT`
10. Résoudre conflit `review_votes` (migration corrective)

### Sprint 3 — Stripe & Paiements (2-3h)
11. Calculer montant côté serveur
12. Vérifier signature Stripe sur tous les endpoints
13. Valider `success_url`/`cancel_url`
14. Unifier les clients Stripe

### Sprint 4 — Performance (2-3h)
15. `Promise.all()` sur money pages (5 requêtes → 2 batch)
16. Fix N+1 dans crons (abandon-emails, voice-lead-expiry)
17. RPC ou vue matérialisée pour `_getTopVilles`
18. Index pour `ilike` queries

### Sprint 5 — Error Handling & UX (2-3h)
19. Monter `ErrorBoundary` dans les layouts
20. try/catch global sur les 5 routes cron
21. Timeouts sur Resend et Stripe
22. AbortController sur les 6 composants critiques

### Sprint 6 — TypeScript & Cleanup (3-4h)
23. Supprimer `LegacyProviderFields` et adapter 18 composants
24. Corriger tous les types admin vs DB
25. Fix colonnes fantômes (`total_price` → `total_amount`, etc.)
26. Nettoyer 101 console.log

### Sprint 7 — Accents & SEO (2-3h)
27. Fix `VerifierClient.tsx` (page entière sans accents)
28. Fix accents sur les 12 pages majeures
29. Supprimer faux avis du JSON-LD
30. Corriger Schema.org invalide

### Sprint 8 — RLS & Migrations (2-3h)
31. Activer RLS sur 4 tables schema `app`
32. Resserrer policy `profiles` SELECT
33. Migration corrective pour les 5 conflits identifiés
34. Ajouter CHECK constraints sur `reviews.status`, `bookings.status`

---

## Comparaison avec l'audit CRO (vague 1)

| | Audit CRO (vague 1) | Audit Technique (vague 2) |
|---|---|---|
| **Focus** | Éléments cliquables, UX, fonctionnel | Infrastructure, sécurité, performance, données |
| **Problèmes** | 246 | 369 |
| **Bloquants** | 46 | 72 |
| **Majeurs** | 103 | 156 |
| **Mineurs** | 97 | 141 |

### TOTAL CUMULÉ : 615 problèmes (118 bloquants, 259 majeurs, 238 mineurs)

---

*Rapport généré le 2026-03-26 par 20 agents Claude Opus 4.6 en parallèle.*
