# RAPPORT D'AUDIT CLEAN-ROOM — servicesartisans v1 → v2

> Date : 2026-02-06
> Objectif : Décider quoi garder/supprimer/réécrire pour une architecture clean v2 (Supabase conservée)

---

## 1. EXPOSITION DE LOGIQUE INTERNE (ALERTES CRITIQUES)

### ALERTE HAUTE : `trust_score` et `trust_badge` exposés dans l'API search publique
- **Fichier** : `src/app/api/search/route.ts:63-64,122-123`
- L'API `/api/search` retourne `trust_score` (numérique) et `trust_badge` (bronze/silver/gold/platinum) directement au client
- Le tri par défaut (`relevance`) trie par `is_premium DESC, trust_score DESC, rating_average DESC` (ligne 311-313)
- **Impact** : tout le monde peut reverse-engineer l'algo de ranking

### ALERTE HAUTE : `is_premium` pilote le sitemap et le tri
- **Fichier** : `src/app/sitemap.ts:250-264`
- Le sitemap trie `is_premium DESC` puis `is_verified DESC` et attribue `priority: 0.8` aux premium vs `0.6` aux autres
- **Impact** : Google voit la logique de monétisation dans le sitemap

### ALERTE MOYENNE : API `/api/pricing` expose les règles de dynamic pricing
- **Fichier** : `src/app/api/pricing/route.ts:37-63`
- Les règles de surcharge (weekend +5%, last-minute +10%, holiday +20%) sont exposées en clair dans la réponse JSON (`appliedRules`)

### ALERTE MOYENNE : Benchmarking & ranking accessibles côté client
- **Fichiers** : `src/hooks/useBenchmarking.ts`, `src/lib/analytics/benchmarking-service.ts`
- Exposent `rank_in_city`, `rank_in_region`, `rank_national` — logique de classement interne

### ALERTE BASSE : `/api/stats/public` avec `cityCount: 500` en dur
- **Fichier** : `src/app/api/stats/public/route.ts:53`
- Faux compteur hardcodé

---

## 2. DELETE (supprimer)

| Fichier/Dossier | Raison | Risque si conservé | Action |
|---|---|---|---|
| `src/app/services/artisan/[id]/` | Ancienne URL `/services/artisan/{uuid}` — redirige déjà vers les nouvelles URLs | Pollution SEO, double indexation, fuite d'UUID dans les canonical | **Supprimer** entièrement |
| `src/app/test-gps/` | Page de debug, expose `is_premium` en frontend | Indexable par erreur, fuite de logique | **Supprimer** |
| `src/app/debug-plombiers/` | Page de debug | Exposition de données internes | **Supprimer** |
| `src/app/debug-simple/` | Page de debug | Idem | **Supprimer** |
| `src/app/test-calendrier/` | Page de test | Idem | **Supprimer** |
| `src/app/pro/` (toutes les pages) | Redirigé vers `/espace-artisan` par middleware. 12 pages fantômes | Duplication de code, confusion, bande passante perdue | **Supprimer** — la redirection dans middleware suffit |
| `src/app/france/` | Page legacy d'annuaire France | URL non conforme v2 | **Supprimer** |
| `src/app/carte/` et `src/app/carte-liste/` | Pages carte legacy | Non conformes v2, pas de SEO value | **Supprimer** |
| `src/app/llms.txt/route.ts` | Route LLMs.txt — non pertinente | Exposition inutile | **Supprimer** |
| `src/app/api/debug-query/` | API de debug | Exposition de données brutes | **Supprimer** |
| `src/app/api/test-reviews/` | API de test | Données factices potentielles | **Supprimer** |
| `src/app/api/loyalty/` | Système de fidélité non utilisé | Feature creep, surface d'attaque | **Supprimer** |
| `src/app/api/gift-cards/` | Gift cards non utilisé | Idem | **Supprimer** |
| `src/app/api/escrow/` | Escrow non utilisé | Surface d'attaque | **Supprimer** |
| `src/app/api/disputes/` | Disputes non utilisé | Idem | **Supprimer** |
| `src/app/api/waitlist/` | Waitlist non utilisé | Idem | **Supprimer** |
| `src/app/api/twilio/` | Intégration Twilio (voice) non déployée | Surface d'attaque, coûts imprévus | **Supprimer** |
| `src/app/api/import/google-maps/` | Import Google Maps — script one-shot | Ne devrait pas être une API route | **Supprimer** |
| `src/lib/analytics/anomaly-detection.ts` | Feature ML non déployée | Complexité inutile | **Supprimer** |
| `src/lib/analytics/predictions.ts` | Predictions non déployées | Idem | **Supprimer** |
| `src/lib/booking/no-show-prediction.ts` | ML prediction non déployée | Idem | **Supprimer** |
| `src/lib/booking/smart-suggestions.ts` | Suggestions non déployées | Idem | **Supprimer** |
| `src/lib/services/sentiment-analysis.ts` | NLP non déployé | Idem | **Supprimer** |
| `src/lib/services/fraud-detection.ts` | Fraud detection non déployé | Fausse sécurité | **Supprimer** |
| `src/lib/video/daily-client.ts` | Visio Daily non déployée | Surface d'attaque | **Supprimer** |
| `src/components/search/VoiceSearch.tsx` | Voice search non fonctionnel | UX broken | **Supprimer** |
| `src/components/LanguageSwitcher.tsx` | i18n non implémenté | Bouton mort | **Supprimer** |
| Fichiers racine : `*.sql`, `*.json` (datasets), `*.bat`, `test-*.html`, `test-*.txt`, `trigger-vercel-deploy.txt` | Fichiers one-shot, debug, credentials potentiels | Pollution du repo, exposition | **Supprimer** du repo (ou `.gitignore`) |
| `AUDIT.md`, `AUDIT_REPORT.md`, `SECURITY_FIXES.md`, `IMPORT_GUIDE.md`, `CARTE_WORLD_CLASS.md` | Docs legacy v1 | Confusion | **Supprimer** |

---

## 3. REWRITE (garder le concept, réécrire)

| Fichier/Dossier | Raison | Risque si gardé tel quel | Action |
|---|---|---|---|
| `src/app/sitemap.ts` | Expose `is_premium` dans le tri/priorité. Pas de wave indexation. Hardcode villes/services. | Google voit la logique de monétisation | **Réécrire** : wave-based sitemap, pas de tri premium, données depuis DB, `stable_id` au lieu de slug |
| `src/app/robots.ts` | OK mais manque les nouvelles URLs v2 | Indexation incomplète | **Réécrire** pour v2 URL patterns |
| `src/middleware.ts` | Mélange rate-limiting, CSP, canonical, auth, redirect legacy — trop gros (322 lignes) | Maintenance cauchemar, rate limit en-mémoire (perdu au redéploiement) | **Réécrire** : séparer en modules, retirer rate-limit in-memory |
| `src/app/api/search/route.ts` | Expose `trust_score`, `trust_badge`, `is_premium` dans la réponse. Tri par `is_premium`. Injection SQL potentielle via `ilike` | Fuite de logique de ranking, injection | **Réécrire** : retirer champs internes de la réponse publique, paramétrer les requêtes, tri neutre côté public |
| `src/app/api/pricing/route.ts` | Expose toutes les règles de tarification dynamique | Reverse-engineering pricing | **Réécrire** : ne retourner que le prix final, pas les règles |
| `src/app/services/[service]/[location]/page.tsx` | `aggregateRating: '4.5'` en dur dans le JSON-LD | Faux structured data | **Réécrire** : calculer depuis les vraies données |
| `src/app/services/[service]/[location]/[provider]/page.tsx` | URL v2 OK mais identifiant basé sur `slug` (mutable) et non `stable_id` (HMAC) | Si le nom change, l'URL change, perte SEO | **Réécrire** : `stable_id` déterministe HMAC comme identifiant URL |
| `src/app/page.tsx` (homepage) | `is_verified: true` hardcodé dans les données factices | Fausses données | **Réécrire** : données réelles uniquement |
| `src/lib/services/trust-badges.ts` | Logique OK mais les seuils sont exposés côté client via les hooks | Reverse-engineering des seuils | **Réécrire** : server-only, ne jamais exposer les seuils |
| `src/lib/analytics/benchmarking-service.ts` | Ranking exposé au client | Fuite classement interne | **Réécrire** : server-only, dashboard artisan uniquement |
| `src/app/api/stats/public/route.ts` | `cityCount: 500` hardcodé | Faux chiffre | **Réécrire** : comptage réel |
| `src/app/villes/`, `src/app/regions/`, `src/app/departements/` | URLs non conformes v2 (`/services/{trade}/{city}`) | Confusion SEO, double indexation | **Réécrire** : rediriger vers le nouveau pattern ou conserver comme pages hub avec liens internes |
| `src/lib/supabase.ts` (racine) | Fonctions `getProviderBySlug`, `getServiceBySlug`, `getLocationBySlug` utilisent des slugs mutables | Si slug change, 404 | **Réécrire** : lookup par `stable_id` |

---

## 4. MOVE (déplacer/renommer)

| Fichier/Dossier | Raison | Action |
|---|---|---|
| `src/app/espace-artisan/` | OK conceptuellement mais v2 devrait être `/dashboard/artisan/` | **Déplacer** vers `src/app/(private)/dashboard/artisan/` avec route group |
| `src/app/espace-client/` | Idem | **Déplacer** vers `src/app/(private)/dashboard/client/` |
| `src/app/admin/` | OK, protégé par auth | **Déplacer** vers `src/app/(private)/admin/` |
| `src/app/booking/` | Flux privé, ne devrait pas être indexable | **Déplacer** vers `src/app/(private)/booking/` |
| `src/app/avis/[bookingId]/` | Flux privé (laisser un avis) | **Déplacer** vers `src/app/(private)/avis/` |
| `scripts/` | Scripts d'import éparpillés, certains dupliqués | **Consolider** dans `scripts/import/` et `scripts/seed/` |
| `src/lib/api/` et `src/lib/services/` | Logique métier mélangée avec clients API | **Séparer** : `src/lib/api-clients/` (Stripe, Twilio, etc.) vs `src/lib/domain/` (trust, reviews, etc.) |
| `src/components/artisan/` (fichier index implicite) | Types `Artisan` et `Review` définis dans un composant | **Déplacer** types vers `src/types/artisan.ts` |

---

## 5. KEEP (conserver tel quel)

| Fichier/Dossier | Raison |
|---|---|
| `src/components/ui/` (Button, Card, Input, Modal, Badge, Loading, Skeleton, Toast, Avatar, Pagination, Select, Textarea, EmptyState) | Composants UI génériques, propres, réutilisables |
| `src/components/forms/` (FormField, FormSection) | Génériques |
| `src/components/ErrorBoundary.tsx` | Essentiel |
| `src/components/CookieConsent.tsx` | RGPD requis |
| `src/components/Breadcrumb.tsx` | SEO essentiel |
| `src/components/Footer.tsx`, `Header.tsx` | Layout core |
| `src/lib/supabase/client.ts`, `server.ts`, `admin.ts`, `middleware.ts` | Clients DB propres |
| `src/lib/utils.ts` | Utilitaires génériques (slugify, etc.) |
| `src/lib/sanitize.ts` | Sécurité |
| `src/lib/errors.ts`, `src/lib/errors/types.ts` | Gestion d'erreurs |
| `src/lib/validations/schemas.ts` | Validation Zod |
| `src/lib/logger.ts`, `src/lib/utils/logger.ts` | Logging |
| `src/lib/geography.ts` | Utilitaire géo réutilisable |
| `src/lib/seo/jsonld.ts`, `config.ts` | SEO helpers |
| `src/lib/monitoring/sentry.ts` + `sentry.*.config.ts` | Monitoring |
| `src/lib/auth/middleware.ts`, `two-factor.ts` | Auth core |
| `src/lib/admin-auth.ts` | Auth admin |
| `src/lib/cache.ts` | Cache util |
| `src/lib/design-system/tokens.ts` | Design tokens |
| `src/lib/constants/navigation.ts`, `animations.ts` | Constants |
| `src/lib/data/france.ts` | Données statiques France |
| `src/hooks/useAuth.ts`, `useDebounce.ts`, `useToast.ts`, `useGeolocation.ts`, `useIntersectionObserver.ts`, `use-media-query.ts`, `use-local-storage.ts` | Hooks génériques |
| `src/types/database.ts`, `index.ts`, `branded.ts` | Types core |
| `src/app/api/auth/` (toutes) | Auth routes |
| `src/app/api/health/` | Health check |
| `src/app/api/gdpr/` | RGPD obligatoire |
| `src/app/api/contact/` | Contact form |
| `src/app/api/revalidate/` | ISR revalidation |
| `supabase/` (migrations, config) | Infrastructure DB |
| `next.config.js` | Config (à ajuster redirects) |
| `docker-compose.yml`, `Dockerfile` | Infra |
| `vitest.config.ts`, `playwright.config.ts` | Config tests |
| Pages légales : `mentions-legales`, `confidentialite`, `cgv`, `accessibilite` | Obligations légales |
| Pages info : `a-propos`, `faq`, `contact`, `comment-ca-marche`, `presse`, `carrieres`, `partenaires` | Pages de contenu |

---

## 6. ARBRE DE REPO V2 RECOMMANDE

```
src/
├── app/
│   ├── (public)/                        # SEO indexable
│   │   ├── page.tsx                     # Homepage
│   │   ├── services/
│   │   │   ├── page.tsx                 # /services (hub)
│   │   │   ├── [trade]/
│   │   │   │   ├── page.tsx             # /services/plombier (hub ville)
│   │   │   │   ├── [city]/
│   │   │   │   │   ├── page.tsx         # /services/plombier/paris (listing)
│   │   │   │   │   ├── [stableId]/
│   │   │   │   │   │   └── page.tsx     # /services/plombier/paris/x7k2m (fiche)
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── a-propos/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── comment-ca-marche/page.tsx
│   │   ├── tarifs-artisans/page.tsx
│   │   ├── mentions-legales/page.tsx
│   │   ├── confidentialite/page.tsx
│   │   ├── cgv/page.tsx
│   │   ├── accessibilite/page.tsx
│   │   ├── presse/page.tsx
│   │   ├── carrieres/page.tsx
│   │   └── partenaires/page.tsx
│   │
│   ├── (auth)/                          # Auth flow, noindex
│   │   ├── connexion/page.tsx
│   │   ├── inscription/page.tsx
│   │   ├── inscription-artisan/page.tsx
│   │   ├── mot-de-passe-oublie/page.tsx
│   │   └── auth/callback/route.ts
│   │
│   ├── (private)/                       # Authentifié, noindex
│   │   ├── layout.tsx                   # Auth guard
│   │   ├── dashboard/
│   │   │   ├── artisan/                 # ex espace-artisan
│   │   │   │   ├── page.tsx
│   │   │   │   ├── profil/
│   │   │   │   ├── messages/
│   │   │   │   ├── statistiques/
│   │   │   │   ├── calendrier/
│   │   │   │   ├── avis/
│   │   │   │   ├── demandes/
│   │   │   │   ├── portfolio/
│   │   │   │   └── abonnement/
│   │   │   └── client/                  # ex espace-client
│   │   │       ├── page.tsx
│   │   │       ├── mes-demandes/
│   │   │       ├── messages/
│   │   │       ├── avis/
│   │   │       └── parametres/
│   │   ├── booking/
│   │   │   ├── [id]/page.tsx
│   │   │   └── confirmation/[id]/page.tsx
│   │   ├── avis/[bookingId]/page.tsx
│   │   └── devis/page.tsx
│   │
│   ├── (admin)/                         # Admin, noindex
│   │   └── admin/...
│   │
│   ├── api/
│   │   ├── public/                      # APIs publiques (pas d'auth)
│   │   │   ├── search/route.ts          # REWRITTEN: sans trust_score/is_premium
│   │   │   ├── stats/route.ts
│   │   │   ├── reviews/featured/route.ts
│   │   │   └── geocode/route.ts
│   │   ├── auth/...
│   │   ├── artisan/...                  # Auth artisan required
│   │   ├── client/...                   # Auth client required
│   │   ├── bookings/...
│   │   ├── stripe/...
│   │   ├── gdpr/...
│   │   └── admin/...                    # Auth admin required
│   │
│   ├── sitemap.ts                       # REWRITTEN: wave-based, no premium bias
│   ├── robots.ts                        # REWRITTEN: v2 patterns
│   └── layout.tsx
│
├── components/
│   ├── ui/                              # KEEP as-is
│   ├── forms/                           # KEEP
│   ├── seo/                             # KEEP
│   ├── search/                          # REWRITE: remove VoiceSearch
│   ├── providers/                       # REWRITE: remove internal fields from display
│   ├── chat/                            # KEEP
│   ├── booking/                         # KEEP
│   ├── portfolio/                       # KEEP
│   └── layout/                          # Header, Footer, Breadcrumb, MobileBottomNav
│
├── lib/
│   ├── supabase/                        # KEEP
│   ├── auth/                            # KEEP
│   ├── seo/                             # KEEP
│   ├── validations/                     # KEEP
│   ├── monitoring/                      # KEEP
│   ├── utils/                           # KEEP + consolidate
│   ├── constants/                       # KEEP
│   ├── design-system/                   # KEEP
│   ├── domain/                          # NEW: trust-badges, verification, reviews (server-only)
│   ├── api-clients/                     # Stripe, Resend, SIRENE, etc.
│   └── notifications/                   # KEEP (email, push, sms)
│
├── hooks/                               # KEEP generic hooks only
├── types/                               # KEEP + add artisan.ts
│
scripts/
├── import/                              # Consolidated imports
├── seed/                                # Seed data
└── utils/                               # One-off scripts

supabase/                                # KEEP
android/                                 # KEEP (Capacitor)
ios/                                     # KEEP (Capacitor)
```

---

## 7. PRs ORDONNEES POUR LE NETTOYAGE

| # | PR | Contenu | Pré-requis |
|---|---|---|---|
| **1** | `chore: remove debug and test pages` | Supprimer `test-gps/`, `debug-plombiers/`, `debug-simple/`, `test-calendrier/`, `api/debug-query/`, `api/test-reviews/` | Aucun |
| **2** | `chore: remove unused features` | Supprimer `api/loyalty/`, `api/gift-cards/`, `api/escrow/`, `api/disputes/`, `api/waitlist/`, `api/twilio/`, `api/import/google-maps/`, `lib/video/`, `lib/analytics/anomaly-detection.ts`, `lib/analytics/predictions.ts`, `lib/booking/no-show-prediction.ts`, `lib/booking/smart-suggestions.ts`, `lib/services/sentiment-analysis.ts`, `lib/services/fraud-detection.ts`, `components/search/VoiceSearch.tsx`, `components/LanguageSwitcher.tsx` | Aucun |
| **3** | `chore: remove legacy /pro routes` | Supprimer `src/app/pro/` entièrement (le middleware redirige déjà) | Aucun |
| **4** | `chore: clean root files` | Supprimer/gitignore les `.sql`, `.json` datasets, `.bat`, `test-*.html`, `test-*.txt`, `trigger-vercel-deploy.txt`, docs legacy | Aucun |
| **5** | `refactor: introduce route groups` | Créer `(public)`, `(auth)`, `(private)`, `(admin)` route groups. Déplacer les pages existantes. | PR 1-3 |
| **6** | `feat: implement stable_id (HMAC)` | Ajouter `stable_id` HMAC dans la table `providers`, migration Supabase, fonction de génération | PR 5 |
| **7** | `refactor: rewrite provider URLs with stable_id` | Changer `[provider]` de slug vers `[stableId]`. Redirections 301 des anciens slugs. Supprimer `services/artisan/[id]/` | PR 6 |
| **8** | `security: strip internal fields from public APIs` | Dans `/api/search` et toutes les réponses publiques : retirer `trust_score`, `trust_badge`, `is_premium` des réponses JSON. Tri public neutre. | PR 5 |
| **9** | `refactor: rewrite sitemap with wave indexation` | Sitemap wave-based, `noindex` par défaut, pas de tri `is_premium`, données depuis DB uniquement | PR 6-7 |
| **10** | `refactor: split middleware` | Séparer `middleware.ts` en modules : auth, rate-limit (externe), CSP, canonical | PR 5 |
| **11** | `fix: remove hardcoded/fake data` | Corriger `aggregateRating: '4.5'` (location page), `cityCount: 500` (stats), `is_verified: true` (homepage) | PR 8 |
| **12** | `refactor: restructure lib/` | Séparer `lib/api-clients/` vs `lib/domain/`. Déplacer `trust-badges`, `benchmarking-service` en server-only | PR 8 |
| **13** | `refactor: consolidate legacy routes` | Décider du sort de `/villes/`, `/regions/`, `/departements/`, `/france/`, `/carte/`, `/carte-liste/` : soit rediriger vers `/services/{trade}/{city}`, soit transformer en hubs avec liens internes | PR 7-9 |
| **14** | `security: harden pricing API` | Ne retourner que `finalPrice`, pas `appliedRules` ni les seuils de tarification | PR 8 |
| **15** | `test: update e2e and unit tests` | Mettre à jour tous les tests pour les nouvelles URLs et structures | PR 5-14 |

---

## 8. RESUME DES CHIFFRES

| Catégorie | Count |
|---|---|
| **DELETE** | ~30 fichiers/dossiers |
| **REWRITE** | ~15 fichiers |
| **MOVE** | ~8 dossiers |
| **KEEP** | ~60+ fichiers |
| **PRs proposées** | 15 (ordre séquentiel) |

---

## 9. TOP 3 PRIORITES ABSOLUES

1. **Retirer les champs internes des APIs publiques** (`trust_score`, `trust_badge`, `is_premium` dans les réponses JSON)
2. **Supprimer toutes les pages debug/test** (exposition de données, indexation accidentelle)
3. **Implémenter `stable_id` HMAC** pour des URLs immuables et SEO-safe
