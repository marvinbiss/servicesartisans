# AUDIT SEO & SEARCH CONSOLE — ServicesArtisans.fr

**Date :** 25 février 2026
**Périmètre :** Audit croisé architecture technique SEO × données Google Search Console
**Méthodologie :** Analyse exhaustive du code source (25+ fichiers SEO, 3 749+ pages pré-rendues) croisée avec ~800 requêtes GSC (0 clics, ~1 500 impressions)

---

## TABLE DES MATIÈRES

1. [Synthèse exécutive](#1-synthèse-exécutive)
2. [Données GSC — Analyse quantitative](#2-données-gsc--analyse-quantitative)
3. [Architecture technique SEO — État des lieux](#3-architecture-technique-seo--état-des-lieux)
4. [Analyse croisée : GSC × Architecture](#4-analyse-croisée-gsc--architecture)
5. [Audit des balises Title & Meta Description](#5-audit-des-balises-title--meta-description)
6. [Audit du maillage interne](#6-audit-du-maillage-interne)
7. [Audit du sitemap](#7-audit-du-sitemap)
8. [Audit du contenu par métier](#8-audit-du-contenu-par-métier)
9. [Matrice de risques](#9-matrice-de-risques)
10. [Recommandations priorisées](#10-recommandations-priorisées)
11. [Annexes](#11-annexes)

---

## 1. SYNTHÈSE EXÉCUTIVE

### Verdict global

| Dimension | Note | Commentaire |
|-----------|------|-------------|
| Infrastructure technique | **A** | Sitemap v2, JSON-LD (14 schemas), robots.txt rigoureux, CSP, HSTS |
| Qualité du contenu | **C+** | Contenu généré programmatiquement, unique mais sans profondeur rédactionnelle |
| Performance GSC | **D** | 0 clics sur ~800 requêtes, position moyenne ~30 |
| Adéquation offre/demande | **D** | Déséquilibre massif entre les requêtes captées et le positionnement visé |
| Potentiel non exploité | **A** | Infrastructure prête pour 1,5M pages, seulement ~3 750 pré-rendues |

### Constat principal

**Le site dispose d'une infrastructure SEO de niveau enterprise mais génère zéro trafic organique.** L'écart entre la sophistication technique et les résultats GSC révèle un problème fondamental : **l'infrastructure est optimisée pour l'échelle, pas pour l'autorité.**

Google indexe et classe le site sur ~800 requêtes, preuve que le domaine n'est pas pénalisé. Mais 80% des positions sont en page 2+ (position >10), et les 5 requêtes en page 1 n'ont que 2-18 impressions chacune — insuffisant statistiquement pour générer des clics.

### Chiffres clés

| Métrique | Valeur |
|----------|--------|
| Requêtes captées (GSC) | ~800 |
| Impressions totales | ~1 500 |
| Clics totaux | **1** (couvreur drome, pos 93) |
| CTR global | **0,07%** |
| Position moyenne | ~30 (page 3) |
| Requêtes en page 1 (pos <10) | 5 (0,6%) |
| Requêtes en page 2 (pos 10-20) | ~80 (10%) |
| Requêtes en page 3+ (pos >20) | ~715 (89%) |
| Services routés | 46 |
| Pages pré-rendues au build | 3 749+ |
| Schemas JSON-LD implémentés | 14 types |

---

## 2. DONNÉES GSC — ANALYSE QUANTITATIVE

### 2.1 Distribution des requêtes par métier

| Métier | Nb requêtes | % du total | Impressions totales | Position moy. |
|--------|-------------|-----------|---------------------|---------------|
| **Dératisation/désinsectisation** | ~200 | **25%** | ~600 | 35 |
| **Déménagement** | ~60 | 7,5% | ~120 | 22 |
| **Plombier** | ~55 | 7% | ~110 | 42 |
| **Vitrier** | ~30 | 4% | ~55 | 20 |
| **Géomètre** | ~25 | 3% | ~50 | 12 |
| **Couvreur** | ~25 | 3% | ~45 | 38 |
| **Alarme/sécurité** | ~20 | 2,5% | ~50 | 22 |
| **Cuisiniste** | ~20 | 2,5% | ~50 | 38 |
| **Peintre** | ~20 | 2,5% | ~40 | 35 |
| **Serrurier** | ~15 | 2% | ~30 | 20 |
| **Isolation thermique** | ~12 | 1,5% | ~70 | 42 |
| **Pisciniste** | ~12 | 1,5% | ~40 | 45 |
| **Architecte d'intérieur** | ~12 | 1,5% | ~35 | 40 |
| Autres métiers | ~300 | 37,5% | ~200 | 30 |

**Constat critique :** La dératisation représente 25% des requêtes et 40% des impressions. Ce n'est pas un signal de force — c'est un signal de **déséquilibre**. Les métiers à fort volume (plombier, électricien, peintre) sont sous-représentés.

### 2.2 Distribution géographique

| Zone | Nb requêtes | % | Commentaire |
|------|-------------|---|-------------|
| Île-de-France (75, 91-95, 77, 78) | ~250 | 31% | Dominante — marché le plus concurrentiel |
| PACA | ~50 | 6% | Cassis, Marseille, Toulon, Haguenau |
| Hauts-de-France | ~40 | 5% | Halluin, Gravelines, Tourcoing |
| Auvergne-Rhône-Alpes | ~35 | 4% | Lyon, Grenoble, Villeurbanne |
| Normandie | ~20 | 2,5% | Vernon, Caen, Rouen |
| Bretagne | ~15 | 2% | Quimper, Brest, Douarnenez |
| Grand Est | ~30 | 4% | Haguenau, Strasbourg, Mulhouse |
| Villes non identifiées / Requêtes nationales | ~360 | 45% | |

### 2.3 Typologie des requêtes

| Type d'intention | Nb requêtes | % | Meilleures positions |
|-----------------|-------------|---|---------------------|
| **[métier] + [ville]** (local transactionnel) | ~550 | 69% | pos 5-40 |
| **[métier] + [département/région]** | ~40 | 5% | pos 12-30 |
| **prix / tarif + [métier]** (informationnel) | ~30 | 4% | pos 10-35 |
| **devis + [métier]** (transactionnel fort) | ~25 | 3% | pos 14-22 |
| **[nom d'entreprise]** (navigational) | ~20 | 2,5% | pos 5-15 |
| **[métier] générique** (head term) | ~15 | 2% | pos 10-55 |
| **[problème] + [ville]** | ~30 | 4% | pos 13-50 |
| Autres | ~90 | 11% | variable |

### 2.4 Top 30 requêtes par impressions

| # | Requête | Imp. | Pos. | Page Google | Urgence |
|---|---------|------|------|-------------|---------|
| 1 | `traitement cafards lingolsheim` | 31 | 65,9 | Page 7 | Basse |
| 2 | `traitement cafards haguenau` | 29 | 48,6 | Page 5 | Basse |
| 3 | `dératisation savigny-sur-orge` | 27 | 53,8 | Page 6 | Basse |
| 4 | `dératisation les lilas` | 24 | 39,5 | Page 4 | Basse |
| 5 | `isolation thermique viry-chatillon` | 19 | 58,4 | Page 6 | Basse |
| 6 | **`pose de crédence gargenville`** | **18** | **9,5** | **Page 1** | **Haute** |
| 7 | `deratisation avignon` | 17 | 54,2 | Page 6 | Basse |
| 8 | `deratisation villemoisson sur orge` | 16 | 30,2 | Page 3 | Moyenne |
| 9 | `dératisation palaiseau` | 16 | 47,6 | Page 5 | Basse |
| 10 | `plombier morbihan` | 15 | 32,1 | Page 3 | Moyenne |
| 11 | `plombier` (head term) | 15 | 55,5 | Page 6 | Basse |
| 12 | `deratisation colombes` | 15 | 40,1 | Page 4 | Basse |
| 13 | `dératisation montrouge` | 15 | 49,7 | Page 5 | Basse |
| 14 | `deratisation trappes` | 14 | 30,6 | Page 3 | Moyenne |
| 15 | `deratisation hopital` | 14 | 42,0 | Page 4 | Basse |
| 16 | `prix deratisation` | 14 | 34,9 | Page 3-4 | Moyenne |
| 17 | **`devis alarme`** | **14** | **21,7** | **Page 2** | **Haute** |
| 18 | `dératisation bobigny` | 14 | 42,3 | Page 4 | Basse |
| 19 | `dératisation lyon` | 13 | 82,0 | Page 8 | Basse |
| 20 | `jardinage à domicile nantes` | 13 | 29,9 | Page 3 | Moyenne |
| 21 | `dératisation meudon` | 12 | 37,5 | Page 4 | Basse |
| 22 | `dératisation ermont` | 12 | 22,5 | Page 2 | Haute |
| 23 | `dératisation levallois-perret` | 12 | 58,6 | Page 6 | Basse |
| 24 | `isolation thermique le plessis bouchard` | 12 | 38,2 | Page 4 | Basse |
| 25 | `déménageur colomiers` | 11 | 26,3 | Page 3 | Moyenne |
| 26 | `deratisation vincennes` | 11 | 34,9 | Page 3-4 | Moyenne |
| 27 | `dératisation maisons-alfort` | 11 | 34,5 | Page 3-4 | Moyenne |
| 28 | `devis décoration lestylechezsoi` | 11 | 10,8 | Page 1-2 | Haute |
| 29 | **`pose moquette margency`** | **10** | **7,3** | **Page 1** | **Haute** |
| 30 | `dératisation saint-mandé` | 10 | 31,4 | Page 3 | Moyenne |

### 2.5 Les 5 requêtes en page 1 (pos < 10)

| Requête | Imp. | Pos. | Page correspondante probable |
|---------|------|------|------------------------------|
| `services artisans` | 2 | 1,5 | Homepage |
| `géomètre devis guyancourt` | 3 | 4,0 | `/services/geometre/guyancourt` ou `/devis/geometre/guyancourt` |
| `devis géomètre guyancourt` | 2 | 4,0 | `/devis/geometre/guyancourt` |
| `pose moquette margency` | 10 | 7,3 | `/services/solier/margency` ou `/services/poseur-de-parquet/margency` |
| `pose de crédence gargenville` | 18 | 9,5 | `/services/carreleur/gargenville` |

**Ces 5 requêtes sont les seules susceptibles de générer des clics à court terme.**

---

## 3. ARCHITECTURE TECHNIQUE SEO — ÉTAT DES LIEUX

### 3.1 Routing des pages publiques

| Pattern de route | Pages pré-rendues | ISR dynamique | Total potentiel |
|-----------------|-------------------|---------------|-----------------|
| `/` (homepage) | 1 | — | 1 |
| `/services` (hub) | 1 | — | 1 |
| `/services/[service]` | 46 | Non | 46 |
| `/services/[service]/[location]` | 230 (top 5 villes) | Oui (toutes villes) | ~630 000 |
| `/services/[service]/[location]/[publicId]` | ~300 | Oui | ~3 000 000 |
| `/villes` | 1 | — | 1 |
| `/villes/[ville]` | 20 (top 20) | Oui | ~13 680 |
| `/departements/[departement]` | 101 | Non | 101 |
| `/regions/[region]` | 18 | Non | 18 |
| `/devis/[service]` | 46 | Non | 46 |
| `/devis/[service]/[location]` | 230 | Oui | ~630 000 |
| `/tarifs/[service]` | 46 | Non | 46 |
| `/urgence/[service]` | Variable | Non | ~20 |
| `/avis/[service]/[ville]` | Variable | Oui | ~630 000 |
| `/blog/[slug]` | ~125 | Non | ~125 |
| `/guides/[slug]` | ~30 | Non | ~30 |
| `/problemes/[probleme]` | ~40 | Non | ~40 |
| Pages statiques | ~20 | Non | ~20 |
| **Total pré-rendu** | **~3 749** | | **1,5M+ potentiel** |

### 3.2 Services routés (46 services)

#### 15 services historiques
`plombier`, `electricien`, `serrurier`, `chauffagiste`, `peintre-en-batiment`, `menuisier`, `carreleur`, `couvreur`, `macon`, `jardinier`, `vitrier`, `climaticien`, `cuisiniste`, `solier`, `nettoyage`

#### 31 services Sprint 1 SEO
`terrassier`, `charpentier`, `zingueur`, `etancheiste`, `facadier`, `platrier`, `metallier`, `ferronnier`, `poseur-de-parquet`, `miroitier`, `storiste`, `salle-de-bain`, `architecte-interieur`, `decorateur`, `domoticien`, `pompe-a-chaleur`, `panneaux-solaires`, `isolation-thermique`, `renovation-energetique`, `borne-recharge`, `ramoneur`, `paysagiste`, `pisciniste`, `alarme-securite`, `antenniste`, `ascensoriste`, `diagnostiqueur`, `geometre`, `desinsectisation`, `deratisation`, `demenageur`

### 3.3 Contenu riche (trade-content.ts) — 37 métiers documentés

Chaque métier documenté dispose de :
- `priceRange` (min/max/unité)
- `commonTasks` (5-8 prestations courantes)
- `tips` (3-5 conseils)
- `faq` (6-8 Q&A)
- `emergencyInfo` (optionnel)
- `certifications` (2-4 certifications)
- `averageResponseTime`

### 3.4 JSON-LD Structured Data

| Schema | Pages couvertes | Conformité |
|--------|----------------|------------|
| Organization | Toutes (root layout) | Complet (nom, adresse, SIREN, VAT) |
| WebSite + SearchAction | Toutes (root layout) | Complet |
| Service | `/services/[service]`, `/services/[service]/[location]` | Complet |
| LocalBusiness | Fiches artisans | Complet (si données disponibles) |
| BreadcrumbList | Toutes les pages avec hiérarchie | Complet |
| FAQ | Pages service, guide, blog | Complet |
| ItemList | Hub services, listings | Complet |
| Article | Blog | Complet (author, datePublished, image) |
| Place | Pages villes | Complet |
| CollectionPage | Pages départements | Complet |
| AggregateRating | Homepage, fiches artisans | Conditionnel (si reviews > 0) |
| HowTo | Comment ça marche | Complet |
| ProfessionalService | Fiches artisans étendues | Complet |
| Review | Avis individuels | Complet |

### 3.5 Robots.txt — Configuration

**Autorisations :**
- Googlebot : accès complet sauf routes privées
- Bingbot : idem

**Blocages :**
- Routes privées : `/admin/`, `/api/`, `/auth/`, `/espace-*`, `/booking/`, `/connexion`, `/inscription`
- Paramètres de requête dupliqués : `?sort=`, `?page=`, `?filter=`, `?q=`, `?redirect=`
- Scrapers SEO : AhrefsBot, SemrushBot, MJ12bot, DotBot, BLEXBot, PetalBot, DataForSeoBot, Bytespider
- AI training : Google-Extended

**Verdict :** Configuration robots.txt exemplaire.

---

## 4. ANALYSE CROISÉE : GSC × ARCHITECTURE

### 4.1 Requêtes captées vs services routés

C'est l'analyse la plus révélatrice de l'audit.

| Métier GSC | Slug routé | Trade content ? | Position moy. GSC | Verdict |
|------------|-----------|-----------------|-------------------|---------|
| Dératisation | `deratisation` | Oui (minimal) | 35 | Routé, contenu pauvre |
| Désinsectisation | `desinsectisation` | Oui (minimal) | 40 | Routé, contenu pauvre |
| Plombier | `plombier` | **Oui (riche)** | 42 | Routé, contenu riche mais positions faibles |
| Déménageur | `demenageur` | Oui (minimal) | 25 | Routé, contenu pauvre |
| Vitrier | `vitrier` | **Oui (riche)** | 20 | Routé, contenu riche, positions correctes |
| Géomètre | `geometre` | Oui | **12** | **Meilleure perf.** — contenu OK |
| Couvreur | `couvreur` | **Oui (riche)** | 38 | Routé, contenu riche mais positions faibles |
| Alarme/sécurité | `alarme-securite` | Oui | 22 | Routé, positions moyennes |
| Cuisiniste | `cuisiniste` | **Oui (riche)** | 38 | Routé mais positions faibles |
| Peintre | `peintre-en-batiment` | **Oui (riche)** | 35 | Routé mais positions faibles |
| Serrurier | `serrurier` | **Oui (riche)** | 20 | Routé, positions correctes |
| Isolation thermique | `isolation-thermique` | Oui | 42 | Routé mais positions très faibles |
| Pisciniste | `pisciniste` | Oui | 45 | Routé mais positions très faibles |
| Architecte intérieur | `architecte-interieur` | Oui | 40 | Routé mais positions très faibles |
| Électricien | `electricien` | **Oui (riche)** | — | **Quasi absent de GSC** |
| Chauffagiste | `chauffagiste` | **Oui (riche)** | 25 | Très peu de requêtes |
| Maçon | `macon` | **Oui (riche)** | 28 | Très peu de requêtes |

### 4.2 Le paradoxe central

**Les métiers avec le contenu le plus riche (plombier, électricien, chauffagiste, peintre) ne sont PAS ceux qui performent le mieux en GSC.**

Au contraire :
- **Géomètre** (contenu moyen) → position 12 en moyenne
- **Vitrier** (contenu riche) → position 20
- **Serrurier** (contenu riche) → position 20
- **Dératisation** (contenu minimal) → 200 requêtes, position 35

**Explication :** La performance GSC ne dépend pas (uniquement) de la qualité du contenu on-page. Elle dépend de :
1. **La concurrence** — plombier/électricien sont ultra-concurrentiels, géomètre ne l'est pas
2. **Le nombre d'artisans réels en base** — plus il y a d'artisans, plus la page a de la substance
3. **L'âge du domaine** — un domaine jeune ne peut pas rivaliser sur les termes les plus disputés

### 4.3 Requêtes sans page correspondante

| Type de requête GSC | Exemple | Page idéale | Existe ? |
|---------------------|---------|-------------|----------|
| `prix [métier]` | `prix deratisation` (14 imp) | `/tarifs/deratisation` | Oui |
| `tarif [métier]` | `tarif horaire chauffagiste` (6 imp) | `/tarifs/chauffagiste` | Oui |
| `devis [métier]` | `devis alarme` (14 imp) | `/devis/alarme-securite` | Oui |
| `[problème] [ville]` | `punaises de lit rueil-malmaison` | `/problemes/punaises-de-lit/rueil-malmaison` | **Non (route incomplète)** |
| `[métier] [département]` | `domotique ardeche` | `/departements/ardeche/domoticien` | Partiellement |
| `[nom entreprise]` | `bosa demenagement` | Fiche artisan | Dépend de la base |
| `comment [verbe]` | `dans quel ordre refaire sa cuisine` | Article blog | Peut-être |
| `[métier] urgence [ville]` | `dératisation urgence rognac` | `/urgence/deratisation/rognac` | Partiellement |

### 4.4 Villes GSC vs villes pré-rendues

Sur les ~800 requêtes locales, quasiment **aucune** ne correspond aux top 5 villes pré-rendues (Paris, Marseille, Lyon, Toulouse, Nice).

Les villes qui apparaissent dans GSC sont des **petites villes** : Guyancourt, Margency, Gargenville, Vernon, Halluin, Gravelines, Douarnenez, Dompierre-sur-Besbre, Le Rheu, etc.

**Implication :** Les pages pour ces petites villes sont générées à la demande (ISR), pas pré-rendues. Leur première visite par Googlebot déclenche la génération → la page sert un contenu frais mais avec une latence plus élevée.

---

## 5. AUDIT DES BALISES TITLE & META DESCRIPTION

### 5.1 Stratégie de variation

Le site utilise un système de **rotation de templates par hash** :
```typescript
const titleHash = Math.abs(hashCode(`title-${context}`))
const title = titleTemplates[titleHash % titleTemplates.length]
```

5 variantes de title et 4-5 variantes de description par type de page. Le hash est **déterministe** — la même page produit toujours le même title.

**Verdict :** Bonne pratique. Évite les titles identiques sur des milliers de pages tout en restant prédictible pour le cache.

### 5.2 Patterns de titles par type de page

| Type de page | Pattern | Exemple | Longueur |
|-------------|---------|---------|----------|
| Homepage | `ServicesArtisans — ${count} artisans référencés en France` | `ServicesArtisans — 50 000+ artisans référencés en France` | 55 chars |
| Service hub | `${serviceName} en France — Annuaire & Devis Gratuit 2026` | `Plombier en France — Annuaire & Devis Gratuit 2026` | 50 chars |
| Service+ville (avec artisans) | `${serviceName} à ${ville} — ${count} artisans` | `Plombier à Paris — 342 artisans` | 32 chars |
| Service+ville (sans artisans) | `${serviceName} à ${ville} — Devis Gratuit` | `Plombier à Margency — Devis Gratuit` | 36 chars |
| Fiche artisan | `${name} - ${service} à ${city}` | `Jean Dupont - Plombier à Paris` | 31 chars |
| Ville | `Artisans à ${ville} (${dept})` | `Artisans à Guyancourt (78)` | 27 chars |
| Département | `Artisans en ${dept} (${code})` | `Artisans en Yvelines (78)` | 26 chars |
| Devis | `Devis ${métier} gratuit 2026 — Comparez` | `Devis plombier gratuit 2026 — Comparez` | 39 chars |
| Tarifs | `Tarifs ${métier} 2026 : ${prix}` | `Tarifs plombier 2026 : 60–90 €/h` | 34 chars |
| Urgence | `${métier} urgence soir & week-end — Trouvez...` | `Plombier urgence soir & week-end — Trouvez...` | 47 chars |

### 5.3 Points forts

- Titles courts (< 55 chars en général) — pas de troncature dans les SERP
- Inclusion systématique du nom de ville pour les pages locales
- Année 2026 dans les titles tarifs/devis (signal de fraîcheur)
- "Devis Gratuit" comme CTA récurrent
- Mention du nombre d'artisans quand disponible (preuve sociale)

### 5.4 Points faibles identifiés

| Problème | Impact | Gravité |
|----------|--------|---------|
| **Pas de mot "annuaire" dans les titles service+ville** | Google ne catégorise pas le site comme annuaire | Haute |
| **"ServicesArtisans" en suffixe via template `%s \| ServicesArtisans`** | Le nom de marque est inconnu — prend de la place sans bénéfice SEO | Moyenne |
| **Titles identiques pour quartier et ville** | Risque de cannibalisation | Moyenne |
| **Pas de title spécifique pour les requêtes "prix"** | La page `/tarifs/deratisation` a un bon title mais peu de backlinks | Basse |
| **Meta descriptions trop longues (certaines >160 chars)** | Troncature dans les SERP | Basse |
| **Pas de schema `Review` aggregate dans les titles** | Pas d'étoiles dans les SERP (même si le schema existe) | Moyenne |

### 5.5 Analyse des titles vs requêtes GSC page 1

| Requête GSC (page 1) | Title probable de la page | Match ? |
|----------------------|--------------------------|---------|
| `services artisans` | `ServicesArtisans — X artisans référencés en France` | Exact match brand |
| `géomètre devis guyancourt` | `Devis géomètre gratuit 2026 — Comparez` OU `Géomètre à Guyancourt — Devis Gratuit` | Bon match |
| `pose moquette margency` | `Solier-moquettiste à Margency — Devis Gratuit` | **Mismatch partiel** — "pose moquette" ≠ "solier-moquettiste" |
| `pose de crédence gargenville` | `Carreleur à Gargenville — Devis Gratuit` | **Mismatch** — "pose de crédence" ≠ "carreleur" |

**Problème critique sur les 2 meilleures requêtes :** L'utilisateur cherche "pose moquette" ou "pose de crédence", mais le title de la page parle de "solier-moquettiste" ou "carreleur". Ce décalage terminologique **nuit au CTR** même en bonne position.

---

## 6. AUDIT DU MAILLAGE INTERNE

### 6.1 Structure de navigation

| Composant | Liens sortants | Vers |
|-----------|---------------|------|
| Header (mega menu) | ~50 | 8 catégories de services, villes majeures, géolocalisation |
| Footer | ~40 | 8 services populaires, 10 villes populaires, régions, outils, légal |
| Homepage | ~30 | Services populaires, villes populaires, combos service×ville |
| Breadcrumb | 2-4 | Hiérarchie complète (Home > Service > Ville > Artisan) |

### 6.2 Cross-linking entre pages

| Depuis | Vers | Nombre de liens |
|--------|------|-----------------|
| Page service hub | Villes (12 top + par région) | ~50 |
| Page service+ville | Services similaires, villes proches | ~16 |
| Page artisan | Service hub, villes proches, services alternatifs | ~24 |
| Page ville | Tous les services | ~46 |
| Page département | Villes du département, services | ~30 |
| Blog article | Services liés (5 max), articles liés (4 max) | ~9 |

### 6.3 Points forts

- Topologie multi-dimensionnelle (service × géographie × contenu)
- Aucune page véritablement orpheline — toutes accessibles via navigation
- Breadcrumbs systématiques avec schema JSON-LD
- Cross-links bidirectionnels (ville ↔ service)
- Blog ↔ services (mapping automatique par mots-clés)

### 6.4 Points faibles identifiés

| Problème | Impact | Gravité |
|----------|--------|---------|
| **Pages `/tarifs/[service]` et `/urgence/[service]` peu liées** | Accessibles seulement depuis footer/outils — pas de link juice | Haute |
| **Pages `/problemes/[probleme]` sans routes ville** | `/problemes/punaises-de-lit/paris` n'existe pas | Haute |
| **Pas de hub par catégorie de métier** | `/services/plomberie` (regroupant plombier, chauffagiste, salle-de-bain) n'existe pas | Moyenne |
| **Pages outils (`/outils/*`) accessibles seulement depuis footer** | Faible link juice, pages potentiellement intéressantes pour le SEO | Moyenne |
| **Pas de liens depuis pages artisans vers articles blog** | Opportunité de maillage perdue | Basse |

---

## 7. AUDIT DU SITEMAP

### 7.1 Architecture actuelle

```
/sitemap.xml (index)
├── /sitemap/0.xml (static) — Pages statiques, services, blog, guides, problèmes, geo
├── /sitemap/service-cities-0.xml — Top 40 villes × 46 services
├── /sitemap/geo.xml — 101 départements + 18 régions
├── /sitemap/providers-0.xml — Artisans batch 0
├── /sitemap/providers-1.xml — Artisans batch 1
├── ...
├── /news-sitemap.xml — Articles des dernières 48h
└── /image-sitemap.xml — Images des services, villes, blog
```

### 7.2 Métriques

| Métrique | Valeur |
|----------|--------|
| URLs dans sitemap statique | ~500 |
| URLs service×ville (top 40) | ~1 840 |
| URLs géographiques | ~119 |
| URLs providers | Variable (batches de 5 000) |
| Batch max par sitemap | 10 000 (statique) / 45 000 (large) / 5 000 (providers) |
| Limite Google respectée | Oui (< 50 000 par fichier) |

### 7.3 Points forts

- Stratégie "Smart Sitemap v2" — sitemap purgé pour domaine jeune
- Batch sizing conforme aux limites Google
- Provider sitemaps via fast path (table `provider_sitemap_urls` pré-calculée)
- Image sitemap séparé (conforme Google Image Search)
- News sitemap (articles < 48h seulement)
- XML escaping robuste (`escapeXmlLoc()`)
- Assertions compile-time (batch sizes < 50 000)

### 7.4 Points faibles identifiés

| Problème | Impact | Gravité |
|----------|--------|---------|
| **Pas de sitemap pour `/devis/[service]/[location]`** | 1 840 pages de devis non soumises | Haute |
| **Pas de sitemap pour `/tarifs/[service]/[location]`** | Pages tarifs localisées non soumises | Haute |
| **Pas de sitemap pour `/avis/[service]/[ville]`** | Pages avis localisées non soumises | Haute |
| **Top 40 villes seulement** | Les villes qui apparaissent en GSC (Guyancourt, Margency, Gargenville) ne sont PAS dans le sitemap | Critique |
| **Pas de `<changefreq>` ni `<priority>`** | Google les ignore officiellement, mais certains crawlers tiers les utilisent | Basse |
| **Pas de `<lastmod>` sur les pages service×ville** | Google ne peut pas prioriser les pages récemment modifiées | Moyenne |

### 7.5 Constat critique : écart sitemap vs GSC

Les villes qui génèrent des impressions en GSC (Guyancourt pos 4, Gargenville pos 9.5, Margency pos 7.3) ne sont **PAS** dans le sitemap car elles ne font pas partie du top 40 des villes les plus peuplées.

Ces pages existent (via ISR) mais Google les découvre uniquement via le maillage interne, pas via le sitemap. **Elles rankent malgré le sitemap, pas grâce à lui.**

---

## 8. AUDIT DU CONTENU PAR MÉTIER

### 8.1 Couverture trade-content

| Métier | Slug | Price range | CommonTasks | Tips | FAQ | Emergency | Certifs |
|--------|------|------------|-------------|------|-----|-----------|---------|
| Plombier | `plombier` | 60-90 €/h | 8 | 5 | 8 | Oui | 4 |
| Électricien | `electricien` | 50-75 €/h | 8 | 5 | 6 | Oui | 4 |
| Serrurier | `serrurier` | 80-150 €/interv. | 7 | 5 | 6 | Oui | 3 |
| Chauffagiste | `chauffagiste` | 60-85 €/h | 8 | 5 | 6 | Oui | 4 |
| Peintre | `peintre-en-batiment` | 25-45 €/m² | 7 | 5 | 6 | Non | 3 |
| Menuisier | `menuisier` | 45-75 €/h | 7 | 5 | 6 | Non | 3 |
| Carreleur | `carreleur` | 35-65 €/m² | 7 | 5 | 6 | Non | 3 |
| Couvreur | `couvreur` | 50-80 €/m² | 7 | 5 | 6 | Oui | 4 |
| Maçon | `macon` | 45-75 €/h | 7 | 5 | 6 | Non | 3 |
| Jardinier | `jardinier` | 30-50 €/h | 7 | 5 | 6 | Non | 2 |
| Vitrier | `vitrier` | 60-100 €/interv. | 7 | 5 | 6 | Oui | 3 |
| Climaticien | `climaticien` | 55-85 €/h | 7 | 5 | 6 | Oui | 4 |
| Cuisiniste | `cuisiniste` | 3000-15000 €/proj. | 7 | 5 | 6 | Non | 3 |
| ... | ... | ... | ... | ... | ... | ... | ... |
| **Dératisation** | `deratisation` | 80-250 € | 4 | 4 | 5 | Non | 3 |
| **Désinsectisation** | `desinsectisation` | 80-300 € | 4 | 4 | 5 | Non | 3 |
| **Déménageur** | `demenageur` | 500-3000 € | 4 | 4 | 5 | Non | 1 |

### 8.2 10 métiers SANS contenu dans trade-content.ts (découverte critique)

| Métier | Slug | Groupe | Volume recherche | Impact |
|--------|------|--------|-----------------|--------|
| **Peintre en bâtiment** | `peintre-en-batiment` | Historique | **Très élevé** | **Critique** |
| **Salle de bain** | `salle-de-bain` | Sprint 1 | Élevé | Haute |
| **Architecte d'intérieur** | `architecte-interieur` | Sprint 1 | Élevé | Haute |
| **Alarme et sécurité** | `alarme-securite` | Sprint 1 | Élevé | Haute |
| **Poseur de parquet** | `poseur-de-parquet` | Sprint 1 | Moyen | Moyenne |
| **Pompe à chaleur** | `pompe-a-chaleur` | Sprint 1 | **Très élevé** | **Critique** |
| **Panneaux solaires** | `panneaux-solaires` | Sprint 1 | **Très élevé** | **Critique** |
| **Isolation thermique** | `isolation-thermique` | Sprint 1 | **Très élevé** | **Critique** |
| **Rénovation énergétique** | `renovation-energetique` | Sprint 1 | Élevé | Haute |
| **Borne de recharge** | `borne-recharge` | Sprint 1 | Moyen | Moyenne |

**Constat : 5 métiers énergie verte (pompe à chaleur, solaire, isolation, rénovation énergétique, borne recharge) sont routés mais n'ont AUCUN contenu structuré.** Ces métiers sont portés par les subventions MaPrimeRénov' et représentent un potentiel de recherche considérable.

**Encore plus critique : `peintre-en-batiment` est un service HISTORIQUE (groupe 1) et n'a pas de contenu trade-content.** C'est un des métiers les plus recherchés en France.

### 8.4 Blog & Guides — Couverture par métier

| Source | Nb articles/guides | Catégories |
|--------|-------------------|------------|
| Blog | 125 articles | Tarifs (20), Fiches métier (20), Projets (20), Conseils (18), Réglementation (20), Existants (27) |
| Guides | 29 guides | Choisir (8), Entretien (6), Réglementation (5), Économiser (5), Urgence (5) |

**Métiers les mieux couverts :** plombier (3 guides + 5+ articles), électricien (3 guides + 5+ articles), chauffagiste (3 guides + 3+ articles)
**Métiers sous-couverts :** énergie verte (partiellement via guides réglementation), nuisibles (1-2 articles)

### 8.5 Constat sur le contenu dératisation

**Le métier qui génère le plus d'impressions (200+ requêtes, 600+ impressions) a un contenu correct mais pas approfondi.** C'est un facteur limitant pour le ranking :

- Google classe le site sur la dératisation car la **concurrence est faible**
- Mais le contenu est trop mince pour monter en page 1
- Enrichir le contenu dératisation aurait un ROI immédiat (monter de page 3-4 vers page 1-2)

### 8.3 Métiers avec contenu riche mais absent de GSC

| Métier | Contenu | Nb requêtes GSC | Explication probable |
|--------|---------|-----------------|---------------------|
| Électricien | Riche (8 tasks, 6 FAQ) | ~5 | Concurrence extrême (PagesJaunes, 118000, Yelp) |
| Chauffagiste | Riche | ~5 | Concurrence forte |
| Maçon | Riche | ~5 | Concurrence forte |
| Climaticien | Riche | ~2 | Terme technique peu cherché |

---

## 9. MATRICE DE RISQUES

### 9.1 Risques critiques (impact élevé, probabilité élevée)

| # | Risque | Impact | Probabilité | Mitigation |
|---|--------|--------|-------------|------------|
| R1 | **Aucun clic organique après 3+ mois** | Pas de validation du modèle économique | Très élevée | Cibler les 5 requêtes page 1 pour premiers clics |
| R2 | **Dépendance excessive à la dératisation** | Positionnement annuaire non crédible | Élevée | Renforcer les métiers à fort volume |
| R3 | **Décalage terminologique titles vs requêtes** | CTR nul même en bonne position | Élevée | Adapter les titles aux requêtes réelles |
| R4 | **Pages ISR sans sitemap** | Google ne découvre pas les pages long-tail | Élevée | Ajouter les villes performantes au sitemap |

### 9.2 Risques modérés (impact moyen, probabilité moyenne)

| # | Risque | Impact | Probabilité | Mitigation |
|---|--------|--------|-------------|------------|
| R5 | Pages thin content pour les métiers sans trade content enrichi | Pénalité qualité | Moyenne | Enrichir les 9 trades minimaux |
| R6 | Cannibalisation entre pages tarifs, devis, et service+ville | Dilution des positions | Moyenne | Vérifier intent mapping |
| R7 | Budget crawl gaspillé sur des pages providers sans contenu | Slowdown crawl | Moyenne | Renforcer noindex sur fiches vides |
| R8 | Pas de contenu informationnel sur les requêtes "prix/tarif" | Manque de trafic top-funnel | Élevée | Créer des guides tarifaires dédiés |

### 9.3 Risques faibles (impact modéré, probabilité faible)

| # | Risque | Impact | Probabilité | Mitigation |
|---|--------|--------|-------------|------------|
| R9 | Staleness des snapshots sitemap providers | URLs obsolètes dans sitemap | Faible | Automatiser la régénération |
| R10 | CSP trop restrictive bloquant des assets | Impact Core Web Vitals | Faible | Monitoring CWV |

---

## 10. RECOMMANDATIONS PRIORISÉES

### PRIORITÉ 1 — Quick wins (1-3 jours, impact immédiat)

#### 1.1 Adapter les titles aux requêtes réelles (R3)

**Problème :** `pose moquette margency` → le title dit "Solier-moquettiste à Margency"
**Solution :** Ajouter des synonymes/termes naturels dans les templates de title

```
Avant : "Solier-moquettiste à Margency — Devis Gratuit"
Après : "Pose moquette à Margency — Solier qualifié, devis gratuit"
```

```
Avant : "Carreleur à Gargenville — Devis Gratuit"
Après : "Pose crédence et carrelage à Gargenville — Devis gratuit"
```

**Fichier :** `src/app/(public)/services/[service]/[location]/page.tsx` → `generateMetadata`

#### 1.2 Ajouter les villes performantes au sitemap (R4)

**Problème :** Guyancourt, Margency, Gargenville ne sont pas dans le sitemap (top 40 villes par population).
**Solution :** Créer un sitemap additionnel basé sur les villes qui ont des impressions GSC, ou augmenter SITEMAP_TOP_CITIES.

**Fichier :** `src/app/sitemap.ts` — paramètre `SITEMAP_TOP_CITIES`

#### 1.3 Enrichir le contenu dératisation (R5)

Ajouter un trade-content complet pour `deratisation` et `desinsectisation` :
- 8 prestations courantes (dératisation maison, restaurant, cave, copropriété, etc.)
- 6-8 FAQ spécifiques
- Guide de prix détaillé (rats, souris, cafards, punaises, tarifs intervention, contrat annuel)
- Certifications (Certibiocide, agréments)
- Infos urgence

**Fichier :** `src/lib/data/trade-content.ts`

### PRIORITÉ 2 — Corrections structurelles (1-2 semaines)

#### 2.1 Pages `/problemes/[probleme]/[ville]` (R8)

30+ requêtes GSC sont des requêtes "problème" (`punaises de lit rueil-malmaison`, `fuite d'eau`, `nid de guêpes`). Ces requêtes n'ont pas de page dédiée ville+problème.

#### 2.2 Contenu informationnel "prix/tarif" (R8)

Créer des articles de blog ou des pages guide pour :
- "Prix dératisation 2026 : tarifs et devis" (14 impressions sur `prix deratisation`)
- "Tarif horaire électricien 2026" (requête à fort volume national)
- "Combien coûte un vitrier" (multiples variantes dans GSC)

Les pages `/tarifs/[service]` existent mais manquent de profondeur rédactionnelle.

#### 2.3 Maillage tarifs ↔ services (R6)

Les pages `/tarifs/[service]` ne sont pas suffisamment liées depuis les pages service hub et service+ville. Ajouter des liens contextuels :
- "Consultez notre guide des tarifs plombier 2026" depuis `/services/plombier/[ville]`

### PRIORITÉ 3 — Évolutions stratégiques (1-3 mois)

#### 3.1 Contenu éditorial par métier fort

Pour les 5 métiers à plus fort volume (plombier, électricien, serrurier, peintre, couvreur), créer du contenu éditorial approfondi :
- Guide détaillé de 2 000+ mots
- Études de cas / témoignages
- Infographies tarifs par région
- FAQ exhaustives (15-20 questions)

C'est ce contenu qui bâtira l'autorité sur les termes concurrentiels.

#### 3.2 Stratégie de backlinks

L'audit technique ne peut pas compenser un manque de backlinks. Pour un domaine jeune, la priorité est :
- Annuaires d'entreprises (pages jaunes, societe.com)
- Partenariats locaux (CMA, chambres des métiers)
- PR digitale (articles dans presse spécialisée BTP)

#### 3.3 Monitoring GSC automatisé

Mettre en place un suivi hebdomadaire de :
- Impressions totales / semaine
- Nombre de requêtes en page 1
- Ratio pages indexées / pages soumises
- Crawl rate

---

## 11. ANNEXES

### Annexe A — Fichiers audités

| Fichier | Lignes | Rôle |
|---------|--------|------|
| `src/app/sitemap.ts` | 175 | Génération sitemap statique |
| `src/app/robots.ts` | 98 | Configuration robots |
| `src/app/layout.tsx` | 196 | Metadata globale, JSON-LD root |
| `src/app/page.tsx` | ~200 | Homepage metadata + content |
| `src/app/(public)/services/[service]/page.tsx` | ~300 | Service hub |
| `src/app/(public)/services/[service]/[location]/page.tsx` | ~400 | Service+ville |
| `src/app/(public)/services/[service]/[location]/[publicId]/page.tsx` | ~350 | Fiche artisan/quartier |
| `src/app/(public)/villes/[ville]/page.tsx` | ~250 | Page ville |
| `src/app/(public)/departements/[departement]/page.tsx` | ~250 | Page département |
| `src/app/(public)/devis/[service]/page.tsx` | ~200 | Page devis |
| `src/app/(public)/tarifs/[service]/page.tsx` | ~200 | Page tarifs |
| `src/app/(public)/urgence/[service]/page.tsx` | ~200 | Page urgence |
| `src/lib/seo/config.ts` | 133 | Configuration SEO |
| `src/lib/seo/jsonld.ts` | 443 | Schemas JSON-LD |
| `src/lib/seo/blog-schema.ts` | 137 | Schema articles |
| `src/lib/seo/sitemap-manifest.ts` | 110 | Manifest sitemap |
| `src/lib/seo/internal-links.ts` | 201 | Stratégie de liens internes |
| `src/lib/seo/location-content.ts` | 268K+ | Contenu localité |
| `src/lib/seo/indexnow.ts` | 73 | Notification IndexNow |
| `src/lib/seo/provider-url-resolver.ts` | 100+ | Résolution URLs providers |
| `src/lib/data/france.ts` | 25 233 | Données France (villes, départements, services) |
| `src/lib/data/trade-content.ts` | ~2 000 | Contenu par métier |
| `src/components/Header.tsx` | ~300 | Navigation principale |
| `src/components/Footer.tsx` | ~250 | Pied de page |
| `next.config.js` | 112 | Configuration Next.js |

### Annexe B — Métriques de build

| Métrique | Valeur |
|----------|--------|
| Pages pré-rendues | 3 749+ |
| Timeout build | 600s (10 min) |
| ISR revalidation min | 60s (service+ville) |
| ISR revalidation max | 86 400s (blog, géo) |
| Formats image | AVIF + WebP |
| Cache image | 30 jours |

### Annexe C — 46 services routés

```
plombier, electricien, serrurier, chauffagiste, peintre-en-batiment,
menuisier, carreleur, couvreur, macon, jardinier, vitrier, climaticien,
cuisiniste, solier, nettoyage, terrassier, charpentier, zingueur,
etancheiste, facadier, platrier, metallier, ferronnier, poseur-de-parquet,
miroitier, storiste, salle-de-bain, architecte-interieur, decorateur,
domoticien, pompe-a-chaleur, panneaux-solaires, isolation-thermique,
renovation-energetique, borne-recharge, ramoneur, paysagiste, pisciniste,
alarme-securite, antenniste, ascensoriste, diagnostiqueur, geometre,
desinsectisation, deratisation, demenageur
```

---

**Fin du rapport d'audit.**

**Préparé par :** Claude (audit automatisé)
**Date :** 25 février 2026
**Version :** 1.0
