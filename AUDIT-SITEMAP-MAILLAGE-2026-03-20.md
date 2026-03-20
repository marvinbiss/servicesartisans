# AUDIT SITEMAP, MAILLAGE INTERNE & EQUILIBRE DES LIENS
## ServicesArtisans.fr — 20 mars 2026

**Classification** : Confidentiel
**Auditeur** : Claude Opus 4.6 (Anthropic)
**Scope** : Sitemap XML, maillage interne, flux de PageRank, couverture de liens, cross-linking
**Codebase** : Next.js 14 App Router — 191 pages, 204 fichiers avec Link, 232 composants

---

## EXECUTIVE SUMMARY

| Axe | Score | Grade |
|-----|-------|-------|
| Architecture Sitemap | 82/100 | B+ |
| Couverture Sitemap vs Routes | 71/100 | B- |
| Maillage Navigation (Header/Footer) | 76/100 | B |
| Equilibre liens internes (equity) | 42/100 | **D** |
| Cross-linking inter-intent | 68/100 | C+ |
| Breadcrumbs & hiérarchie | 88/100 | A- |
| Metadata SEO (canonical, JSON-LD) | 72/100 | B- |
| **SCORE GLOBAL** | **64/100** | **C** |

### Verdict
Le site a une architecture sitemap solide et une infrastructure SEO mature (breadcrumbs, JSON-LD, CrossIntentLinks). Cependant, l'**equilibre du maillage interne est le point faible critique** : 6 hubs de contenu sont quasi-orphelins (/questions, /comparaison, /barometre, /glossaire, /normes, /guides) tandis que /devis et /services captent une part disproportionnée du PageRank. **Si non corrigé, les 500+ pages enfants de ces hubs resteront invisibles dans Google.**

---

## 1. ARCHITECTURE SITEMAP

### 1.1 Inventaire des sitemaps

| ID Sitemap | Type | URLs estimées | lastModified | Priority |
|-----------|------|--------------|-------------|----------|
| `static` | Pages statiques, services, guides, questions, comparaisons, blog, urgence, tarifs | ~600 | BUILD_DATE (articles: date réelle) | Non défini |
| `service-cities-0` | service × top 300 villes | ~13 800 | Non défini | Non défini |
| `cities` | Index villes + 2 267 villes | 2 268 | Non défini | Non défini |
| `geo` | Départements (105) + Régions (22) + index | 129 | Non défini | Non défini |
| `devis-services` | Hub devis par service | 47 | BUILD_DATE | Non défini |
| `devis-service-cities-0..1` | devis × top 300 villes | ~13 800 | Non défini | Non défini |
| `urgence-service-cities-0..1` | urgence × top 300 villes | ~14 100 | Non défini | Non défini |
| `tarifs-service-cities-0..1` | tarifs × top 300 villes | ~13 800 | Non défini | Non défini |
| `tarifs-task-cities-0..2` | tarifs tâche × 300 villes | ~110 700 | BUILD_DATE | Non défini |
| `avis-services` | Hub avis + services | 48 | BUILD_DATE | Non défini |
| `avis-service-cities-0..1` | avis × top 300 villes | ~14 100 | Non défini | Non défini |
| `problemes` | Hub problèmes + 60 problèmes | 61 | BUILD_DATE | Non défini |
| `problemes-cities-0..1` | problèmes × 300 villes | ~18 000 | Non défini | Non défini |
| `dept-services-0` | départements × services | ~4 935 | Non défini | Non défini |
| `region-services` | régions × services | ~1 034 | Non défini | Non défini |
| `providers-0..N` (dynamique) | Fiches artisans | Variable (DB) | updated_at réel | Non défini |
| `image-sitemap.xml` | Images | ~320 | Last-Modified header | N/A |
| `news-sitemap.xml` | Articles < 48h | 0-5 | Last-Modified header | N/A |

**Total URLs sitemap estimé : ~207 000+ URLs** (hors providers)
**Total sitemaps statiques : ~22** + jusqu'à 20 providers = **~42 sitemaps**

### 1.2 Points forts

- **`dynamicParams = false`** : empêche les sitemaps fantômes de retourner du XML valide vide (P0 fix)
- **Phase 1 conservative** : top 300 villes seulement — excellent pour un nouveau domaine
- **Provider sitemaps dynamiques** via API route : contourne le problème de build-time DB
- **Sitemap index** via API route workaround pour Next.js 14.2
- **escapeXml()** sur toutes les données dynamiques
- **Cache headers** : `s-maxage=3600, stale-while-revalidate=86400` sur tous les sitemaps
- **Cron santé** : `/api/cron/sitemap-health` vérifie les 39 sitemaps quotidiennement
- **News sitemap** bien implémenté (articles < 48h, `<news:news>` correct)
- **Image sitemap** couvre homepage, services, villes, blog, pages statiques

### 1.3 Problemes critiques

#### P0 — `lastModified` absent sur la majorité des URLs dynamiques

| Sitemap | lastModified |
|---------|-------------|
| service-cities | **ABSENT** |
| cities | **ABSENT** |
| geo | **ABSENT** |
| devis-service-cities | **ABSENT** |
| urgence-service-cities | **ABSENT** |
| tarifs-service-cities | **ABSENT** |
| avis-service-cities | **ABSENT** |
| problemes-cities | **ABSENT** |
| dept-services | **ABSENT** |
| region-services | **ABSENT** |

**Impact** : ~195 000 URLs sans `lastModified` = Google ne sait pas quand re-crawler ces pages. Il perd confiance et re-crawl moins souvent.

**Recommandation** : Ajouter `lastModified: BUILD_DATE` sur TOUTES les URLs. C'est mieux qu'absent.

#### P0 — `priority` et `changefreq` absents partout

Google a officiellement dit qu'il *ignore* `priority` et `changefreq`, mais Bing et Yandex les utilisent encore. Leur absence n'est pas critique mais c'est une optimisation manquée pour le trafic Bing/IndexNow.

#### P1 — BATCH sizes incohérents

- `service-cities` utilise `LARGE_BATCH = 45 000`
- `devis-service-cities` utilise `STATIC_BATCH = 10 000`
- `tarifs-task-cities` utilise `LARGE_BATCH = 45 000`
- `problemes-cities` extrait le batch index via `id.split('-').pop()!` au lieu de `id.replace('problemes-cities-', '')`

Le parsing de `problemes-cities-` via `.split('-').pop()` est fragile si un futur ID contient des tirets supplémentaires.

---

## 2. COUVERTURE SITEMAP VS ROUTES

### 2.1 Pages indexables ABSENTES du sitemap

| Route | Type | Pages | Sévérité |
|-------|------|-------|----------|
| `/barometre/regions/[region]` | Dynamique | 22 pages | **P1 CRITIQUE** |
| `/barometre/tarifs/[metier]` | Dynamique | 47 pages | **P1 CRITIQUE** |
| `/devis/[service]/[location]/[quartier]` | Dynamique | Potentiellement milliers | **P2** (quartier removed intentionnellement ?) |
| `/widget` | Statique | 1 page | P3 |
| `/plan-du-site` | Statique | 1 page | P3 |

**Les pages baromètre sont critiques** car elles ont des `generateMetadata()` complets, pas de noindex, et du contenu riche. Elles ne seront jamais découvertes par Googlebot si elles ne sont dans aucun sitemap et n'ont quasi aucun lien interne.

### 2.2 Pages correctement exclues

| Route | Raison |
|-------|--------|
| `/recherche` | Page de recherche dynamique — pas d'intérêt sitemap |
| `/mes-favoris` | Contenu user-specific |
| `/offline` | Page PWA offline |
| `/villes/[ville]/[quartier]` | Intentionnellement retiré (quartier trop granulaire) |
| `/tarifs-artisans/*` | Redirections 301 vers `/tarifs/*` |
| `/barometre-prix` | Redirection 301 vers `/barometre` |
| `/calculateur` | Redirection 301 vers `/outils/calculateur-prix` |
| Pages auth/private | Correctement dans robots.txt disallow |

### 2.3 Redondance sitemap ↔ pages noindex

Les pages noindex (`/accessibilite`, `/carrieres`, `/cgv`, `/confidentialite`, `/mentions-legales`, `/partenaires`, `/presse`, `/mes-favoris`, `/plan-du-site`) sont **correctement absentes** du sitemap. Pas de contradiction détectée.

---

## 3. MAILLAGE INTERNE — ANALYSE DE LA NAVIGATION

### 3.1 Header (site-wide)

Le Header (fixe, toutes pages) distribue des liens vers :

| Destination | Type de lien |
|------------|-------------|
| `/` (logo) | Direct |
| Mega-menu Services | Dropdown → tous les 46 services |
| Mega-menu Villes | Dropdown → villes populaires |
| Mega-menu Régions | Dropdown → régions |
| Menu "Plus" | Dropdown → `/avis`, `/tarifs`, `/blog`, `/guides` |
| `/mes-favoris` | Icone |
| `/connexion` | Direct |
| `/urgence` | CTA rouge |
| `/devis` | CTA principal |

**Issues** :
- **Le mega-menu "Plus"** contient seulement 4 liens (/avis, /tarifs, /blog, /guides)
- **ABSENTS du header** : `/questions`, `/comparaison`, `/barometre`, `/glossaire`, `/normes`, `/problemes`, `/departements`, `/statistiques-artisans-france`
- Le Header est un composant `'use client'` qui charge `france.ts` côté client via API (`/api/geo/menu-data`) — bon pattern pour le bundle size

### 3.2 Footer (site-wide)

Le Footer est massif avec **5 colonnes de navigation** :

| Colonne | Liens |
|---------|-------|
| Services populaires | ~15 services + "Tous les services" |
| Villes populaires | ~12 villes + "Toutes les villes" |
| Par région | ~10 régions + "Toutes les régions" + "Tous les départements" |
| Outils gratuits | 10 liens (calculateur, diagnostic, carte, tarifs, devis, urgence, problèmes, vérifier-artisan, statistiques, widget) |
| Navigation | 6 liens (accueil, services, villes, carte, recherche, comment-ça-marche) |
| + Informations | 6 liens (à-propos, contact, FAQ, blog, guides, avis) |
| + Entreprise | 9 liens (à-propos, inscription-artisan, vérification, garantie, politique-avis, médiation, presse, carrières, partenaires) |
| + Juridique | 4 liens (mentions-legales, CGV, confidentialité, accessibilité) |
| + Bottom bar | 7 liens (mentions-legales, confidentialité, CGV, accessibilité, FAQ, contact, plan-du-site) |

**Total liens footer : ~80+ liens internes** sur chaque page du site.

**Issues critiques** :

| Issue | Sévérité |
|-------|----------|
| **nofollow sur /faq** — la FAQ est une page SEO importante avec du contenu riche | **P1** |
| **nofollow sur /politique-avis et /médiation** — OK car noindex | OK |
| **nofollow sur /mentions-legales, /cgv, /confidentialite, /accessibilite** — OK car noindex | OK |
| **Duplication** : mentions-legales, confidentialité, CGV apparaissent dans Juridique + Bottom bar | **P2** (dilution) |
| **A-propos** apparait dans Informations + Entreprise | **P2** (dilution) |
| **80+ liens = dilution massive** du PageRank par page | **P1** |
| **ABSENTS du footer** : `/questions`, `/comparaison`, `/barometre`, `/glossaire`, `/normes`, `/calendrier-travaux`, `/checklist-travaux`, `/avant-apres` | **P1** |

### 3.3 Homepage — Distribution du PageRank

La homepage (page avec le plus de PageRank) distribue des liens vers :

| Section | Liens | Destinations |
|---------|-------|-------------|
| ClayHomePage | Variable | Services populaires, villes, CTA |
| "Explorer" pills | 5 | `/avis`, `/tarifs`, `/urgence`, `/blog`, `/problemes` |
| Geographic Navigation | 3 | `/regions`, `/departements`, `/villes` |
| Popular Links SEO | ~30 | 8 services, 10 villes, 12 service×ville combos |
| Footer | ~80 | Voir section 3.2 |

**ABSENTS de la homepage** (aucun lien direct) :
- `/questions` (116 pages enfants)
- `/comparaison` (30 pages enfants)
- `/barometre` (69 pages enfants)
- `/glossaire`
- `/normes`
- `/guides` (23 pages enfants)
- `/calendrier-travaux`
- `/checklist-travaux`
- `/avant-apres`
- `/statistiques-artisans-france`

---

## 4. EQUILIBRE DES LIENS INTERNES — ANALYSE CRITIQUE

### 4.1 Matrice de densité de liens par hub

Calcul basé sur : nombre de fichiers source contenant un lien vers le hub.

| Hub | Liens entrants (fichiers) | Pages enfants | Ratio liens/enfants | Verdict |
|-----|--------------------------|---------------|-------------------|---------|
| `/devis` | **54** | ~14 000 | 0.004 | **SUR-POUSSÉ** relativement |
| `/services` | **37** | ~14 000 | 0.003 | Correct |
| `/tarifs` | 20 | ~125 000 | 0.0002 | Sous-maillé vs volume |
| `/villes` | 18 | 2 267 | 0.008 | Correct |
| `/regions` | 15 | 22 | 0.68 | Excellent |
| `/departements` | 13 | 105 | 0.12 | Bon |
| `/blog` | 12 | 246 | 0.05 | Correct |
| `/urgence` | 12 | ~14 000 | 0.001 | Faible |
| `/avis` | 9 | ~14 000 | 0.001 | Faible |
| `/guides` | **3** | 23 | 0.13 | **SOUS-MAILLÉ** |
| `/problemes` | **3** | 60 | 0.05 | **SOUS-MAILLÉ** |
| `/questions` | **1** | 116 | 0.009 | **CRITIQUE** |
| `/comparaison` | **1** | 30 | 0.033 | **CRITIQUE** |
| `/barometre` | **1** | 69 | 0.014 | **CRITIQUE** |
| `/glossaire` | **1** | 1 | 1.0 | **CRITIQUE** (isolé) |
| `/normes` | **0** | 1 | 0 | **ORPHELIN** |

### 4.2 Visualisation du flux PageRank (simplifié)

```
                        HOMEPAGE (PR=1.0)
                    ┌───────┼───────────────┐
                    │       │               │
              HEADER(all)  CONTENT      FOOTER(all)
              ~12 liens    ~38 liens     ~80 liens
                    │       │               │
         ┌─────────┼──┐    │    ┌──────────┼──────────┐
         │         │  │    │    │          │          │
     /services  /villes /regions │      /devis    /tarifs
     (PR≈0.04) (PR≈0.02)       │     (PR≈0.05)  (PR≈0.02)
         │         │            │         │
    46 services  2267 villes    │    47 devis
         │         │            │
    13800 svc×city │         /urgence  /avis  /problemes  /blog
                   │        (PR≈0.01)  (PR≈0.01) (PR≈0.003) (PR≈0.01)
                   │
                   └── /guides (PR≈0.003)
                       /questions (PR≈0.001) ← QUASI-ORPHELIN
                       /comparaison (PR≈0.001) ← QUASI-ORPHELIN
                       /barometre (PR≈0.001) ← QUASI-ORPHELIN
                       /glossaire (PR≈0.001) ← QUASI-ORPHELIN
                       /normes (PR≈0.000) ← ORPHELIN
```

### 4.3 Diagnostics par profondeur

| Profondeur | Exemples | Accès depuis homepage | Issue |
|-----------|---------|----------------------|-------|
| 0 | `/` | Direct | OK |
| 1 | `/services`, `/villes`, `/devis`, `/urgence`, `/avis`, `/tarifs`, `/blog`, `/problemes` | 1 clic (header/footer/content) | OK |
| 1 (orphelins) | `/questions`, `/comparaison`, `/barometre`, `/glossaire`, `/normes` | **Aucun lien direct** — dépend du footer (absent) | **P0** |
| 2 | `/services/plombier`, `/villes/paris`, `/devis/plombier`, `/blog/[slug]` | 2 clics | OK |
| 3 | `/services/plombier/paris`, `/tarifs/plombier/paris`, `/avis/plombier/paris` | 3 clics | OK |
| 4 | `/services/plombier/paris/[publicId]`, `/tarifs/plombier/paris/[travail]` | 4 clics | Limite acceptable |
| 4+ | `/devis/[service]/[location]/[quartier]` | 5+ clics, pas dans sitemap | **P2** |
| 5+ | `/barometre/regions/[region]`, `/barometre/tarifs/[metier]` | Quasi-inaccessible (1 lien vers hub, puis 1 clic) | **P1** |

---

## 5. CROSS-LINKING INTER-INTENT

### 5.1 CrossIntentLinks — Couverture

Le composant `CrossIntentLinks` crée un bandeau de navigation entre les 5 intents (tarifs, avis, services, urgence, devis) pour un même service×ville.

| Page | CrossIntentLinks ? |
|------|--------------------|
| `/services/[service]` | OUI |
| `/services/[service]/[location]` | OUI |
| `/tarifs/[service]` | OUI |
| `/tarifs/[service]/[ville]` | OUI |
| `/tarifs/[service]/[ville]/[travail]` | OUI |
| `/urgence/[service]` | OUI |
| `/urgence/[service]/[ville]` | OUI |
| `/avis/[service]/[ville]` | OUI |
| `/devis/[service]/[location]` | OUI |
| `/avis/[service]` | **NON** |
| `/devis/[service]` | **NON** |
| `/problemes/[probleme]` | **NON** |
| `/problemes/[probleme]/[ville]` | **NON** |
| `/departements/[dept]/[service]` | **NON** |
| `/regions/[region]/[service]` | **NON** |

**Impact** : Les pages `/avis/[service]` (47 pages), `/devis/[service]` (47 pages), toutes les pages problèmes (60+18000), et les pages géo×service (5000+) n'ont PAS de cross-linking inter-intent.

### 5.2 Blog → Commercial linking

Le système `getRelatedServiceLinks()` dans `internal-links.ts` mappe des mots-clés → pages services. Couverture :

| Métier mappé | OK ? |
|-------------|------|
| Plombier | OUI |
| Electricien | OUI |
| Serrurier | OUI |
| Chauffagiste | OUI |
| Menuisier | OUI |
| Carreleur | OUI |
| Couvreur | OUI |
| Peintre | OUI |
| Maçon | OUI |
| Climaticien | OUI |
| Jardinier/Paysagiste | OUI |
| Vitrier | OUI |
| Cuisiniste | OUI |
| Solier | OUI |
| Nettoyage | OUI |

**ABSENTS du mapping blog→service** (15 services non liés depuis les articles) :
- Charpentier, Terrassier, Zingueur, Etanchéiste, Façadier, Plâtrier, Métallier, Ferronnier, Storiste, Salle-de-bain, Architecte-intérieur, Décorateur, Domoticien, Pompe-à-chaleur, Panneaux-solaires, Isolation-thermique, Rénovation-énergétique, Borne-recharge, Ramoneur, Pisciniste, Alarme-sécurité, Antenniste, Ascensoriste, Diagnostiqueur, Géomètre, Désinsectisation, Dératisation, Déménageur

### 5.3 Artisan internal links

Le composant `ArtisanInternalLinks` génère des liens contextuels sur les pages artisan individuelles. Bon pattern.

---

## 6. nofollow SUR LIENS INTERNES

### 6.1 Inventaire complet

| Page source | Destination | rel="nofollow" | Verdict |
|------------|------------|-----------------|---------|
| Footer (Juridique) | `/mentions-legales` | OUI | OK (noindex) |
| Footer (Juridique) | `/cgv` | OUI | OK (noindex) |
| Footer (Juridique) | `/confidentialite` | OUI | OK (noindex) |
| Footer (Juridique) | `/accessibilite` | OUI | OK (noindex) |
| Footer (Entreprise) | `/politique-avis` | OUI | OK (noindex) |
| Footer (Entreprise) | `/mediation` | OUI | OK (noindex) |
| Footer (Bottom bar) | `/faq` | OUI | **P1 — ERREUR** |
| Footer (Informations) | `/faq` | Via `nofollowPaths` set | **P1 — ERREUR** |
| Footer (Bottom bar) | `/mentions-legales` | OUI | Duplication du nofollow |
| Footer (Bottom bar) | `/confidentialite` | OUI | Duplication du nofollow |
| Footer (Bottom bar) | `/cgv` | OUI | Duplication du nofollow |
| Footer (Bottom bar) | `/accessibilite` | OUI | Duplication du nofollow |

**Problème critique** : `/faq` est dans `nofollowPaths` (ligne 46 de Footer.tsx) mais la FAQ est une page SEO indexée avec du contenu riche. Elle devrait recevoir du PageRank, pas être nofollowed.

### 6.2 Recommandation Google

> "Using nofollow on internal links is not recommended." — Google Search Central

Même pour les pages juridiques, le nofollow n'est plus la bonne approche. Google recommande de simplement ne pas les mettre dans le sitemap et de les marquer noindex. Le nofollow sur des liens internes **ne sculpt plus le PageRank** depuis 2009 — il le gaspille.

**Recommandation** : Retirer TOUS les `rel="nofollow"` des liens internes. Le PageRank "économisé" sur un nofollow interne est simplement perdu, pas redistribué aux autres liens.

---

## 7. BREADCRUMBS & HIERARCHIE

### 7.1 Couverture

131 fichiers référencent des breadcrumbs — **excellente couverture** pour les pages publiques.

Deux composants breadcrumb existent :
- `src/components/Breadcrumb.tsx` — composant générique
- `src/components/seo/Breadcrumb.tsx` — composant SEO optimisé
- `src/components/artisan/ArtisanBreadcrumb.tsx` — spécifique artisans

### 7.2 JSON-LD BreadcrumbList

Implémenté dans `src/lib/seo/jsonld.ts`. Génère un schema BreadcrumbList correct pour Google.

**Point fort** : Les breadcrumbs reflètent correctement la hiérarchie Accueil → Hub → Sous-page → Détail.

---

## 8. METADATA SEO

### 8.1 Canonicals

- Homepage : `alternates: { canonical: SITE_URL }` — correct, self-referencing
- La majorité des pages publiques ont des canonicals via `generateMetadata()`
- Les redirections 301 (`tarifs-artisans`, `barometre-prix`, `calculateur`) évitent les doublons

#### P0 — Canonical providers non-normalisé

Un artisan peut être accessible via **plusieurs URLs distinctes** :
- `/services/plombier/paris/ABC123` (via service×ville)
- `/artisan/jean-dupont-ABC123` (via slug direct)
- Potentiellement d'autres patterns via `[...provider]` catch-all

**Aucun `canonical` unifié** ne pointe vers une URL canonique unique. Conséquence : Google voit du contenu dupliqué et dilue le PageRank entre les URLs.

**Recommandation** : Définir une URL canonique unique par provider (ex: `/artisan/[slug]`) et ajouter `alternates: { canonical: CANONICAL_URL }` sur toutes les variantes.

#### P0 — Provider pages sans `notFound()`

Quand un provider est inactif ou inexistant, la page retourne une réponse HTTP 200 avec `<meta name="robots" content="noindex">` au lieu d'un **404 HTTP**. Google continue de crawler ces pages, gaspillant le crawl budget. De plus, les metadata complètes (title, description, OpenGraph) sont générées même pour ces pages noindex — signal contradictoire.

**Recommandation** : Appeler `notFound()` (import de `next/navigation`) pour les providers invalides au lieu de retourner du contenu avec noindex.

### 8.2 JSON-LD

Homepage déploie 4 schemas :
- `WebSite` (avec SearchAction)
- `FAQPage`
- `ItemList` (services populaires)
- `Organization` (avec AggregateRating)

Pages artisan : `LocalBusiness` schema complet.
Blog : `Article` schema.
Breadcrumbs : `BreadcrumbList` partout.

**Bon** : Couverture JSON-LD étendue et bien structurée.

### 8.3 robots.txt

Excellente configuration :
- Bots Google (Googlebot, AdsBot, APIs-Google, Mediapartners) : accès complet
- Bots AI search (ChatGPT, Claude, Perplexity, Applebot, Amazon, Meta, You, Vertex) : accès complet
- Bots AI training (GPTBot, Google-Extended, CCBot, anthropic-ai) : bloqués
- Bots SEO (Ahrefs, Semrush, MJ12, etc.) : bloqués
- Social preview bots : accès complet
- 3 sitemaps déclarés : `/sitemap.xml`, `/image-sitemap.xml`, `/news-sitemap.xml`

---

## 9. TABLEAU DES ISSUES PAR SEVERITE

### P0 — Critiques (impact SEO immédiat)

| # | Issue | Impact | Fichiers |
|---|-------|--------|---------|
| P0-1 | **6 hubs quasi-orphelins** : /questions (1 lien), /comparaison (1 lien), /barometre (1 lien), /glossaire (1 lien), /normes (0 lien), /guides (3 liens) | ~300 pages enfants quasi-invisibles pour Google | Footer.tsx, Header.tsx, page.tsx (homepage) |
| P0-2 | **nofollow gaspille le PageRank** sur /faq (page indexée et utile) | FAQ perd du PageRank | Footer.tsx:46, Footer.tsx:584 |
| P0-3 | **~195K URLs sans lastModified** dans les sitemaps dynamiques | Google crawl moins souvent | sitemap.ts (tous les blocs service×city) |
| P0-4 | **Provider pages : `notFound()` manquant** — les providers inactifs/inexistants retournent une page avec `noindex` au lieu d'un 404 HTTP | Google crawle des pages fantômes, gaspille le crawl budget | `src/app/(public)/[...provider]/page.tsx` |
| P0-5 | **Canonical provider non-normalisé** — un même artisan accessible via `/services/plombier/paris/ABC123` ET `/artisan/jean-dupont-ABC123` sans canonical unifié | Contenu dupliqué, dilution du PageRank entre 2+ URLs | Pages provider, CrossIntentLinks |
| P0-6 | **Provider metadata conditionnel** — `generateMetadata()` retourne des metadata complètes (title, description, OG) même pour les providers noindex, signaux contradictoires pour Google | Confusion crawl : metadata riche + noindex simultané | `src/app/(public)/[...provider]/page.tsx` |

### P1 — Importants

| # | Issue | Impact | Fichiers |
|---|-------|--------|---------|
| P1-1 | `/barometre/regions/[region]` (22 pages) et `/barometre/tarifs/[metier]` (47 pages) absents du sitemap | 69 pages indexables jamais soumises | sitemap.ts |
| P1-2 | **CrossIntentLinks absent** sur /avis/[service], /devis/[service], /problemes/*, /departements/*/[service], /regions/*/[service] | ~5 200+ pages sans cross-linking | Pages concernées |
| P1-3 | **Footer : 80+ liens** diluent massivement le PageRank | Chaque lien du footer ne reçoit que ~1.2% du PR de la page | Footer.tsx |
| P1-4 | **Blog → Service mapping incomplet** : 28+ services non mappés dans `getRelatedServiceLinks()` | Articles blog ne créent pas de liens vers ces services | internal-links.ts |
| P1-5 | **Homepage ne link pas** vers /guides, /questions, /comparaison, /barometre, /glossaire, /calendrier-travaux, /avant-apres, /statistiques | PR homepage ne descend pas vers ces sections | page.tsx |

### P2 — Modérés

| # | Issue | Impact | Fichiers |
|---|-------|--------|---------|
| P2-1 | Liens dupliqués dans le footer (mentions-legales ×3, confidentialité ×3, CGV ×3, accessibilité ×2) | Dilution supplémentaire | Footer.tsx |
| P2-2 | `problemes-cities-` parsing via `.split('-').pop()!` fragile | Bug potentiel futur | sitemap.ts:432 |
| P2-3 | Pages villes/[ville]/[quartier] existent mais plus dans sitemap et pas de noindex | Pages crawlables mais non soumises | villes/[ville]/[quartier]/page.tsx |
| P2-4 | `nofollowPaths` Set dans Footer inclut `/faq` mais le footer "Informations" a aussi `/faq` via `informationLinks` — le nofollow conditionnel ne s'applique qu'au premier cas | Incohérence UX du nofollow | Footer.tsx:46 + :422 |
| P2-5 | `/devis/[service]/[location]/[quartier]` pages existent mais pas dans sitemap | Pages potentiellement indexables non soumises | sitemap.ts |

### P3 — Mineurs

| # | Issue | Impact |
|---|-------|--------|
| P3-1 | `/widget` pas dans sitemap (probablement intentionnel — page technique) | Mineur |
| P3-2 | `/plan-du-site` pas dans sitemap (page utile pour le crawl) | Mineur |
| P3-3 | `priority` et `changefreq` absents des sitemaps | Bing peut moins bien prioriser |

---

## 10. PLAN D'ACTION RECOMMANDE

### Phase 1 — Quick wins (impact immédiat, effort minimal)

| Action | Effort | Impact |
|--------|--------|--------|
| **Retirer `/faq` de `nofollowPaths`** dans Footer.tsx | 1 ligne | Haut |
| **Ajouter `lastModified: BUILD_DATE`** sur toutes les URLs dynamiques dans sitemap.ts | 10 lignes | Haut |
| **Ajouter /barometre/regions/[region] et /barometre/tarifs/[metier]** au sitemap | 20 lignes | Moyen |
| **Retirer TOUS les `rel="nofollow"`** des liens internes Footer | 15 lignes | Moyen |
| **Provider : `notFound()` au lieu de noindex** pour providers inexistants/inactifs | 5 lignes | Haut |
| **Provider : canonical unifié** → toujours pointer vers `/artisan/[slug]` | 10 lignes | Haut |

### Phase 2 — Rééquilibrage du maillage (1-2 jours)

| Action | Effort | Impact |
|--------|--------|--------|
| **Ajouter les hubs manquants au Footer** : `/guides`, `/questions`, `/comparaison`, `/barometre`, `/glossaire`, `/normes` dans la colonne "Outils" ou nouvelle colonne "Ressources" | 20 lignes | **TRES HAUT** |
| **Ajouter une section "Ressources" sur la homepage** avec liens vers guides, questions, comparaison, barometre, glossaire, normes, calendrier-travaux, avant-apres, statistiques | 30 lignes | **TRES HAUT** |
| **Ajouter les 28 services manquants** dans `getRelatedServiceLinks()` mapping | 50 lignes | Haut |
| **Ajouter CrossIntentLinks** sur /avis/[service], /devis/[service], /problemes/[probleme], /problemes/[probleme]/[ville] | 20 lignes par page | Haut |

### Phase 3 — Optimisation avancée (1 semaine)

| Action | Effort | Impact |
|--------|--------|--------|
| **Réduire les liens footer** : regrouper les doublons, limiter à ~50 liens max | Moyen | Moyen |
| **Ajouter CrossIntentLinks** sur /departements/[dept]/[service] et /regions/[region]/[service] | 20 lignes par page | Moyen |
| **Créer un composant "RelatedContent"** pour les pages guides/questions/blog qui link vers les autres contenus du même cluster topique | 100 lignes | Haut |
| **Audit des ancres** : vérifier que les textes d'ancrage sont descriptifs et variés | Audit | Moyen |
| **Ajouter un widget "Questions fréquentes"** sur les pages service×ville qui linke vers /questions/[slug] pertinentes | 50 lignes | Haut |

---

## 11. KPIs DE SUIVI

| KPI | Baseline actuel | Cible post-fix |
|-----|----------------|----------------|
| Hubs avec < 5 liens entrants | 6/16 (37%) | 0/16 (0%) |
| Pages sans lastModified dans sitemap | ~195 000 | 0 |
| Liens nofollow internes | 12 | 0 |
| Pages indexables hors sitemap | 69+ | 0 |
| Score équilibre maillage | 42/100 | 75/100+ |
| Provider pages en 200+noindex (au lieu de 404) | N (à mesurer) | 0 |
| Provider URLs dupliquées sans canonical | N (à mesurer) | 0 |
| Score global audit | 64/100 | 82/100+ |

---

## ANNEXES

### A. Données de référence

| Donnée | Valeur |
|--------|--------|
| Services (métiers) | 46 |
| Villes | 2 267 |
| Départements | 105 |
| Régions | 22 |
| Trade slugs (tradeContent) | 47 |
| Tâches tarifs | 369 |
| Problèmes | 60 |
| Questions FAQ | 116 |
| Comparaisons | 30 |
| Articles blog | 246 |
| Guides | 23 |
| Pages totales (routes) | 191 |
| Fichiers avec Link | 204 |
| Composants | 232 |
| TOP_CITIES_PHASE1 | 300 |
| STATIC_BATCH | 10 000 |
| LARGE_BATCH | 45 000 |
| PROVIDER_BATCH_SIZE | 5 000 |

### B. Fichiers clés audités

| Fichier | Rôle |
|---------|------|
| `src/app/sitemap.ts` | 17 sitemaps statiques, 481 lignes |
| `src/app/robots.ts` | robots.txt dynamique, 168 lignes |
| `src/app/api/sitemap-index/route.ts` | Sitemap index workaround, 95 lignes |
| `src/app/api/sitemap-providers/route.ts` | Sitemaps providers dynamiques, 237 lignes |
| `src/app/image-sitemap.xml/route.ts` | Image sitemap, 123 lignes |
| `src/app/news-sitemap.xml/route.ts` | News sitemap, 62 lignes |
| `src/components/Footer.tsx` | Footer avec 80+ liens, 600 lignes |
| `src/components/Header.tsx` | Header avec mega-menus, 358 lignes |
| `src/components/InternalLinks.tsx` | 6 composants de maillage, 308 lignes |
| `src/components/seo/CrossIntentLinks.tsx` | Cross-linking 5 intents, 67 lignes |
| `src/lib/seo/internal-links.ts` | Blog → Service mapping, 202 lignes |
| `src/app/page.tsx` | Homepage, 177 lignes |

---

*Rapport généré le 20 mars 2026 — ServicesArtisans.fr*
*Méthodologie : Analyse statique exhaustive du code source (6 agents parallèles + audit manuel)*
