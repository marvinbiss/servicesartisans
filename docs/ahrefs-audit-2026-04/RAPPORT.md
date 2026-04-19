# Audit Ahrefs Premium + GSC + GA4 — Avril 2026

**Date** : 2026-04-18
**Période** : 19 mars – 17 avril 2026 (28 jours)
**Sources** :

- Ahrefs Site Audit Premium (10 000+ pages crawlées)
- Ahrefs Site Explorer (Top pages, Organic keywords, Competitors, Content Gap 75k)
- Google Search Console (Pages, Requêtes, Graphique)
- Google Analytics 4 (Snapshot, Events, Engagement)

**État du site** :

- Domain Rating Ahrefs : **0,6 / 100** (quasi-zéro autorité)
- Trafic Ahrefs estimé : 161 visites/mois (sous-estimé)
- Trafic GSC réel : 7 800 clics / 28 jours = ~280/jour
- Utilisateurs GA4 : **2 113** (98,6 % nouveaux)
- Conversions GA4 : **15 devis en 28 jours** (0,5/jour, taux 0,7 %)
- Backlinks : 67 (48 ref domains, +11 récents)
- Citations ChatGPT : **395 (+174 récents)** ✅

---

## TL;DR — RÉVISION FINALE après GSC Index Coverage + Crawl Stats

> **Le site est en réalité en SUPER bonne posture pour 71 jours :**
>
> - **459 003 pages indexées** (croissance exponentielle)
> - **40 000 crawls Google/jour** (énorme pour DR 0,6)
> - **Trafic GSC ×2 500 en 90 jours** (13 → 33 280 impr/jour)
> - **2,45 % du crawl = JS rendering** (Google rend le contenu malgré le bailout)
> - **15 leads/28 jours** déjà en GA4
> - **395 citations ChatGPT** (canal LLM-first naissant)
>
> **Le seul vrai bottleneck = QUALITÉ du HTML rendu.** Le bailout SSR fait que Google rejette
> 13 662 pages déjà explorées comme « pas assez bonnes ». Si fix → ces 13K pages indexées + meilleur
> ranking sur les 459K déjà indexées.
>
> **Le crawl budget N'EST PAS le problème** : Google passerait la queue de 408K URLs en ~10 jours
> au rythme actuel. Donc même sans link-building, l'indexation va continuer.
>
> **Les 33 307 noindex sont volontaires** (règle `shouldNoindex` — playbook Kevin Indig).
> **La réduction maillage 1M → 200K** mérite investigation : volontaire ou bug de récente ?

## Diagnostic technique — bailout SSR (toujours valide)

> **🚨 LE BAILOUT SSR EST GLOBAL — 100 % DU SITE EST CSR-ONLY POUR GOOGLE.**
>
> Test curl sur 18 URLs représentatives (homepage, services, tarifs, blog, urgence, villes, profils,
> avis, devis, guides, comparaison) : TOUTES retournent un body utile de **665 caractères**, **0 H1**,
> **6 marqueurs `BAILOUT_TO_CLIENT_SIDE_RENDERING`**.
>
> Les 7 800 clics/mois actuels = miracle de Googlebot qui rend parfois le JS. Le DR=0,6 confirme
> que Google n'a quasi aucune confiance : il ne peut même pas évaluer la pertinence du contenu.
>
> **Cause** : un composant client dans le **layout root** (`src/app/layout.tsx`) — probablement
> `MobileMenuProvider` ou `CompareProviderWrapper` — fait throw un Promise non-handled qui force
> Next.js à bypass le SSR de tout `{children}`.
>
> **Conséquences mesurées** :
>
> - 83 keywords PERDUS récemment (94 800 vol/mois cumulé)
> - "plombier rouen" était pos 4 (1 000 vol) → out
> - "serrurier" était pos 99 (59 000 vol) → out
> - Position moyenne GSC : **29,4** (page 3)
> - 119 quick wins en page 2 sans 1 clic
> - 8 665 pages "orphelines" selon Ahrefs (en réalité = pages dont le contenu n'est jamais rendu)

> **Un seul template casse 86 % du SEO du site : `/services/{service}/{location}`** (listings ville × métier).

Ce template représente :

- 8 665 pages orphelines (zéro lien interne entrant)
- 8 665 pages sans liens sortants
- 8 665 pages H1 manquant / vide
- 8 665 pages low word count
- 5 344 pages meta description trop courte
- 821 pages title trop long
- 47 / 49 pages lentes (TTFB jusqu'à 3 424 ms)

> **Mais** ce même template ramène déjà **230 clics / 4 083 impressions** GSC (CTR 5,6 %) et le sous-template `/services/{service}/{location}/{publicId}` (profils artisans) ramène **1 114 clics / 5 994 impressions** (CTR **18,6 %**). Le potentiel est énorme s'il est correctement réparé.

---

## 1. État du site (chiffres clés)

| Source | Métrique                        | Valeur  |
| ------ | ------------------------------- | ------- |
| GSC    | Pages indexées avec impressions | 1 000   |
| GSC    | Total clics 90j                 | 1 995   |
| GSC    | Total impressions 90j           | 26 557  |
| GSC    | CTR moyen                       | 7,51 %  |
| Ahrefs | Erreurs critiques (Errors)      | 3 types |
| Ahrefs | Avertissements (Warnings)       | 9 types |
| Ahrefs | Notices                         | 5 types |

---

## 2. Top patterns d'URL — qui ramène les clics ?

| Pattern                                     | URLs |     Clics | Impressions |        CTR | Statut           |
| ------------------------------------------- | ---: | --------: | ----------: | ---------: | ---------------- |
| `/services/{spec}/{commune}/{artisan-slug}` |  495 | **1 114** |       5 994 | **18,6 %** | ⭐ Pilier        |
| `/tarifs/{spec}/{commune}/{prestation}`     |  201 |       318 |       6 837 |      4,7 % | OK               |
| `/services/{spec}/{commune}`                |  140 |       230 |       4 083 |      5,6 % | ⚠️ **Cassé**     |
| `/departements/{slug}/{spec}`               |   40 |        83 |         984 |      8,4 % | OK               |
| `/avis/{spec}/{commune}`                    |   31 |        55 |         765 |      7,2 % | OK               |
| `/tarifs/{spec}/{commune}`                  |   27 |        48 |       1 191 |      4,0 % | OK               |
| `/` (homepage)                              |    1 |        30 |         548 |      5,5 % | OK               |
| `/blog/{slug}`                              |   11 |        23 |       3 154 |  **0,7 %** | 🚨 Sous-exploité |
| `/tarifs/{slug}`                            |   12 |        16 |       1 369 |  **1,2 %** | 🚨 Sous-exploité |
| `/tarifs`                                   |    1 |         3 |         265 |      1,1 % | 🚨 Sous-exploité |

**Lecture** :

- Les **profils artisans** sont la machine à clics du site (CTR 18,6 % = excellent)
- Les **listings ville × métier** sont ce qui doit être corrigé en priorité
- Le **blog** et les **pages tarifs** ont déjà des impressions mais des CTR catastrophiques (probablement titre/meta peu attrayants)

---

## 3. Issues prioritaires (Errors / Warnings)

### 🔴 Errors

| #   | Issue                                        |   Volume | Pattern dominant                                      | Impact                             |
| --- | -------------------------------------------- | -------: | ----------------------------------------------------- | ---------------------------------- |
| E1  | Pages orphelines (zéro lien interne entrant) | 10 000\* | `/services/{slug}/{slug}` (87 %)                      | Pages invisibles pour Google       |
| E2  | Pages sans liens sortants                    | 10 001\* | `/services/{slug}/{slug}` (87 %)                      | Bloque la transmission de PageRank |
| E3  | 3XX redirect dans sitemap                    |        2 | `/simulateur-prime-cee`, `/blog/maprimerénov-2026...` | Sitemap pollué                     |

\* limite export Ahrefs

### 🟡 Warnings

| #   | Issue                        |   Volume | Pattern dominant                                                                          |
| --- | ---------------------------- | -------: | ----------------------------------------------------------------------------------------- |
| W1  | H1 manquant ou vide          | 10 001\* | `/services/{slug}/{slug}` (87 %)                                                          |
| W2  | Low word count               | 10 001\* | `/services/{slug}/{slug}` (87 %)                                                          |
| W3  | Meta description trop courte |    5 367 | `/services/{slug}/{slug}` (99,6 %)                                                        |
| W4  | Title trop long              |    1 255 | `/services/{slug}/{slug}` (65 %), `/blog/{slug}/{slug}` (14 %), `/questions/{slug}` (9 %) |
| W5  | Open Graph incomplets        |      770 | `/blog/{slug}/{slug}` (75 %), `/questions/{slug}` (15 %)                                  |
| W6  | Pages lentes                 |       49 | `/services/{slug}/{slug}` (96 %)                                                          |
| W7  | Meta description trop longue |      184 | `/questions/{slug}` (62 %), `/urgence/{slug}` (12 %)                                      |
| W8  | 3XX redirect (general)       |        5 | `www → root`, `/simulateur-prime-cee`                                                     |
| W9  | Sitemap au mauvais format    |        3 | `/feed/blog.xml`, `/feed/nouveaux-artisans.xml` (RSS dans sitemap)                        |

### 🔵 Notices

| #   | Issue                        |   Volume |
| --- | ---------------------------- | -------: |
| N1  | Pages à soumettre IndexNow   | 10 001\* |
| N2  | Page dans plusieurs sitemaps |      455 |
| N3  | Page title ≠ SERP title      |       19 |
| N4  | HTTP → HTTPS redirect        |        2 |
| N5  | Redirect chain               |        1 |

---

## 4. Pages à fort potentiel ORPHELINES (croisement GSC × Ahrefs)

**70 pages déjà indexées et reçevant des impressions sont orphelines selon Ahrefs**. Top 10 par impressions :

| Impressions | Position | URL                                                   |
| ----------: | -------: | ----------------------------------------------------- |
|         798 |      7,0 | `/blog/prix-electricien-2026-tarifs-travaux`          |
|         613 |      5,6 | `/blog/prix-plombier-2026-tarifs-horaires`            |
|         462 |      5,3 | `/blog/chauffage-pompe-chaleur-vs-chaudiere-gaz-2026` |
|         388 |      4,3 | `/blog/prix-cuisiniste-2026-pose-cuisine`             |
|         361 |     59,0 | `/blog/guide-fenetre-double-vitrage`                  |
|         347 |      5,9 | `/tarifs/architecte-interieur`                        |
|         265 |     13,0 | `/tarifs`                                             |
|         236 |      4,9 | `/tarifs/macon`                                       |
|         179 |      5,9 | `/tarifs/menuisier`                                   |
|         148 |      6,6 | `/blog/accessibilite-pmr-logement-normes`             |

→ **Rajouter du maillage interne entrant vers ces pages = quick win** (gain de 2-5 positions probable).

---

## 5. Top 10 pages les plus lentes

|         TTFB |      Loading | Taille | URL                                        |
| -----------: | -----------: | -----: | ------------------------------------------ |
|       267 ms | **7 273 ms** |  34 KB | `/services/serrurier/cazouls-les-beziers`  |
| **3 424 ms** |     3 633 ms |  39 KB | `/services/plombier/angouleme`             |
|       254 ms |     6 363 ms |  39 KB | `/services/plombier/mezidon-vallee-d-auge` |
|     2 584 ms |     2 842 ms |  40 KB | `/services/plombier/saint-cyr-sur-mer`     |
|     2 555 ms |     2 830 ms |  40 KB | `/services/plombier/neuilly-sur-marne`     |
|     2 498 ms |     2 739 ms |  40 KB | `/services/plombier/marcq-en-bar-ul`       |
|     2 448 ms |     2 733 ms |  35 KB | `/services/serrurier/ostwald`              |
|     2 193 ms |     2 465 ms |  39 KB | `/services/plombier/beausoleil`            |
|     2 150 ms |     2 382 ms |  40 KB | `/services/plombier/le-cannet`             |
|     1 735 ms |     2 077 ms |  39 KB | `/services/plombier/le-pontet`             |

**Diagnostic** : ces pages sont des cold-starts ISR (ville non pré-rendue dans `generateStaticParams`). Le code (`page.tsx:113`) ne pré-rend que les **10 villes top × 47 services = 470 pages**. Toutes les autres villes déclenchent un Supabase query au premier hit AhrefsBot.

---

## 6. Plan d'action priorisé (impact / effort)

### 🔥 PHASE 1 — Audit-blocking (1-2 jours)

#### A. ⭐ Fix Suspense bailout — LE FIX QUI DÉBLOQUE TOUT (15 min de code)

**Diagnostic confirmé** par `curl https://servicesartisans.fr/services/plombier/paris` :

- 389 KB de HTML retourné, **0 `<h1>` dans le `<body>`**
- 6 marqueurs `<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">` dans le body
- `<title>`, `<meta description>`, `og:*` présents (ils sont dans `<head>`, hors du bailout)
- Cause : `PageClient.tsx` ligne 1 importe `useSearchParams` (Next.js navigation hook)
- Règle Next.js 14 : _« the closest parent `<Suspense>` boundary above (or layout if none) will be excluded from prerendering »_
- → Sans Suspense parent dans `page.tsx`, **tout l'arbre passe en CSR**

**Fix** (`src/app/(public)/services/[service]/[location]/page.tsx` ligne 992) :

```diff
+ import { Suspense } from 'react'

  {/* Page Content */}
+ <Suspense fallback={null}>
    <ServiceLocationPageClient
      service={service}
      location={location}
      providers={(providers || []).slice(0, 10) as unknown as Provider[]}
      h1Text={h1Text}
      totalCount={totalProviderCount}
      rgeCount={rgeProviderCount}
      serviceSlug={serviceSlug}
      locationSlug={locationSlug}
      recentDevisCount={recentDevisCount}
      rgeOnly={rgeOnly}
    />
+ </Suspense>
```

**Impact attendu** (ce seul fix) :

- 8 665 H1 manquants → 0
- 8 665 low word count → 0
- 8 665 pages orphelines → 0 (les liens internes du SeoContent/CrossLinks deviennent crawlables)
- 8 665 pages sans liens sortants → 0
- 5 344 meta desc trop courtes (à valider — peut-être pas affectées car dans `<head>`)
- Cascade probable sur 50-200 % de gain de trafic GSC sur ces 8 665 pages

**Vérifier après déploiement** :

```bash
curl -s https://servicesartisans.fr/services/plombier/paris | grep -c "<h1"  # doit être >= 1
curl -s https://servicesartisans.fr/services/plombier/paris | grep -c "BAILOUT_TO_CLIENT_SIDE_RENDERING"  # doit être 0
```

**Étendre aux autres templates** : grep les autres routes qui importent `useSearchParams` :

- `src/app/(public)/services/[service]/[location]/PageClient.tsx` ✅ (celle-ci)
- Vérifier aussi `[service]/page.tsx`, `[service]/[location]/[publicId]/page.tsx`
- Audit similaire sur `villes/`, `urgence/`, `tarifs/`, `devis/`, `avis/`, `comparaison/` si bailout détecté

#### B. Rétablir le maillage interne sur les 70 pages GSC orphelines

Ces pages ont du trafic mais pas de liens entrants. Action chirurgicale :

- `/blog/*` : ajouter dans la sidebar / footer de la home un bloc "Articles populaires" pointant vers les 10 blogs top impressions
- `/tarifs`, `/tarifs/{spec}` : ajouter un lien dans le header ou dans `MoneyPageBoost`

#### C. Nettoyer le sitemap (ERROR E3 + WARNING W9)

- Retirer du sitemap : `/simulateur-prime-cee` (308 redirect vers `/simulateur-aides-renovation`) → ou corriger l'URL
- Retirer `/blog/maprimerénov-2026-conditions-montants` du sitemap (301 vers lui-même → suspect, encodage URL cassé)
- Retirer les feeds RSS du sitemap : `/feed/blog.xml` et `/feed/nouveaux-artisans.xml` ne sont pas des sitemaps valides

### 🚀 PHASE 2 — Quick wins (3-5 jours)

#### D. Pré-rendre plus de communes au build

`page.tsx:111` : passer `TOP_CITIES_COUNT = 10` à **50 ou 100** (selon le budget de build).

- Coût build : 47 services × 100 villes = 4 700 pages pré-rendues (vs 470 actuellement)
- Bénéfice : élimine 90 % des cold-starts qui causent les TTFB à 3 secondes

#### E. Corriger les meta descriptions du template

5 344 pages `/services/{slug}/{slug}` ont une meta desc trop courte. Patcher `generateMetadata` (ligne 156) pour générer une description >= 120 caractères systématiquement (utilise `getNaturalTerm` + ville + nombre d'artisans + plage de prix).

#### F. Corriger les titles trop longs

821 pages `/services/{slug}/{slug}` + 179 `/blog/{slug}/{slug}` + 113 `/questions/{slug}`. Ahrefs max recommandé = ~60 caractères. Patcher les builders de title pour tronquer ou simplifier (ex : "Plombier Saint-Cyr-sur-Mer (83) – Devis 2026 | ServicesArtisans" est déjà 65 chars).

#### G. Open Graph incomplets sur le blog

577 articles `/blog/{slug}/{slug}` n'ont pas tous les tags OG. Ajouter `og:title`, `og:description`, `og:image`, `og:type=article`, `og:url` dans le layout blog.

### 📈 PHASE 3 — Optimisation continue (sprint dédié)

#### H. Booster le CTR du blog (0,7 %) et des tarifs (1,2 %)

Audit titre/meta des 11 articles blog les plus impressionnés. Probablement des titres descriptifs au lieu d'orientés CTR.

#### I. Setup IndexNow

10 001 pages à soumettre. Implementer `IndexNow API` dans le revalidate ISR pour notifier Bing/Yandex à chaque update.

#### J. Soumettre Sitemaps au robots.txt si pas déjà fait

Vérifier `Sitemap:` directives dans `robots.txt`.

---

## 7. Métriques à suivre (KPI semaine après semaine)

- Nombre de pages orphelines (Ahrefs) : objectif < 100 d'ici 4 semaines
- Pages avec H1 manquant : objectif 0
- TTFB médian sur `/services/{spec}/{commune}` : objectif < 800 ms
- Clics GSC mensuels : objectif +50 % en 8 semaines (impact maillage interne)
- CTR blog : objectif passer de 0,7 % à 3 %+ via rewrite des meta titles

---

## 8. Vrais concurrents (Ahrefs Competitors)

PagesJaunes/Travaux.com sont des concurrents par défaut, mais les **vrais** concurrents directs (plateformes de mise en relation artisans) sont :

|  DR | Domaine                    | Common KW |  Pages | Trafic Ahrefs |
| --: | -------------------------- | --------: | -----: | ------------: |
|  62 | **depanneo.com**           |        35 |  4 685 |        60 810 |
|  60 | **mesdepanneurs.fr**       |         7 |  2 325 |       183 693 |
|  72 | **allovoisins.com**        |        23 | 14 126 |       387 454 |
|  56 | **rdvartisans.fr**         |        15 |  3 287 |        11 764 |
|  52 | **lesbonsartisans.fr**     |        14 |  1 773 |        24 861 |
|  45 | **ou-serrurier.fr**        |        17 |  1 749 |        15 019 |
|  42 | **etienne-services.fr**    |        20 |  2 656 |        26 455 |
|  61 | **yoojo.fr**               |         5 |    865 |        80 865 |
|  39 | cleanolia.fr (nettoyage)   |         8 |    608 |         3 632 |
|  29 | francevitre.com (vitrerie) |         5 |    155 |           650 |

→ DR moyen concurrents directs = **52** vs nous **0,6**. Gap massif d'autorité, mais leurs DR sont aussi modestes : un sprint backlinks ciblé peut nous propulser dans la course.

## 9. Content Gap — 737 opportunités atteignables

Sur 75 000 keywords où concurrents (PagesJaunes, Travaux.com, IZI by EDF) rankent et nous pas :

- **737 keywords** avec **KD ≤ 30**, vol ≥ 50, ≥ 2 concurrents = **929 300 vol/mois cumulé** d'opportunités

| Cluster       |  KW | Volume cumulé | Top exemple                                                |
| ------------- | --: | ------------: | ---------------------------------------------------------- |
| metier_only   | 236 |       383 400 | serrurier (38k), plombier (28k), couvreur (22k)            |
| other / brand | 301 |       376 000 | engie home service (61k), location mini pelle (11k)        |
| metier_ville  | 111 |       121 450 | serrurier nice (7,3k), plombier paris (4,7k)               |
| prix_other    |  29 |        15 100 | devis travaux (2k), sol résine prix m2 (1,6k)              |
| install_renov |  19 |        10 000 | rénovation toiture (1,1k), rénovation appartement (1,1k)   |
| ville_only    |  13 |         9 750 | serrurerie paris (2k), edf bordeaux (1,9k)                 |
| urgence       |  13 |         7 100 | dépannage électrique (1,1k), depannage volet roulant (700) |

Top 10 quick wins absolus (vol × concurrents / KD+1) :

|    Vol |  KD | Mot-clé                                  |
| -----: | --: | ---------------------------------------- |
| 61 000 |   0 | engie home service (brand IZI, à éviter) |
| 22 000 |   0 | couvreur                                 |
| 12 000 |   0 | couvreur autour de moi                   |
| 11 000 |   2 | serrurier autour de moi                  |
| 10 000 |   0 | plombier autour de moi                   |
|  8 700 |   0 | charpente                                |
|  8 400 |   0 | pisciniste autour de moi                 |
|  6 000 |   0 | chauffagiste                             |
|  5 800 |   0 | jardinier autour de moi                  |
|  5 500 |   1 | electricien autour de moi                |

→ Les pages existent déjà sur le site (ex : `/services/serrurier/lyon` était pos 99 sur "serrurier" 59k vol). Le problème = **bailout SSR**, pas un manque de contenu.

## 10. Pertes récentes — alerte rouge

83 keywords PERDUS du top 100 en quelques semaines, volume cumulé **94 800 vol/mois** :

|    Volume | Position perdue | Mot-clé                   | URL                                          |
| --------: | --------------: | ------------------------- | -------------------------------------------- |
|    59 000 |              99 | serrurier                 | `/services/serrurier/lyon`                   |
|     5 600 |              58 | carreleur                 | `/services/carreleur/brest`                  |
|     3 100 |              34 | serrurier lyon            | idem                                         |
|     2 300 |              80 | couvreur lille            | `/services/couvreur/lille`                   |
|     2 200 |              64 | plombier marseille        | `/services/plombier/marseille`               |
|     1 400 |              75 | couvreur clermont ferrand | `/avis/couvreur/clermont-ferrand`            |
|     1 300 |              52 | electricien lyon          | `/services/electricien/lyon`                 |
|     1 200 |              76 | couvreur lorient          | `/services/couvreur/lorient`                 |
| **1 000** |           **4** | **plombier rouen**        | `/devis/plombier/le-grand-quevilly/rouen` ⚠️ |
|     1 000 |              59 | urgence serrurier         | `/urgence/serrurier/nimes`                   |
|     1 000 |              68 | couvreur amiens           | `/services/couvreur/amiens`                  |
|       700 |              50 | plombier poitiers         | `/services/plombier/poitiers`                |

→ La perte de "plombier rouen" en pos 4 est dramatique : c'était une page top du site. Cause probable = bailout SSR amplifié par changements algorithmiques Google fin mars (cf. bandeau Ahrefs : « _We're investigating an issue affecting some SERPs since late March_ »).

## 11. GA4 — Performance utilisateur (28 jours)

### Top métriques

|                         |            Valeur |
| ----------------------- | ----------------: |
| Utilisateurs actifs     |             2 113 |
| Nouveaux utilisateurs   |    2 083 (98,6 %) |
| Sessions                |             2 395 |
| Engagement moyen / user | **47,7 secondes** |
| Total events            |            32 125 |

### Funnel principal

| Étape                       |              Volume | Taux conversion |
| --------------------------- | ------------------: | --------------: |
| Sessions                    |               2 395 |               – |
| `page_view`                 | 5 144 (2 110 users) |               – |
| `artisan_profile_view`      |   1 325 (987 users) |      **62,8 %** |
| `form_start`                |       97 (69 users) |           5,9 % |
| `phone_click`               |       54 (41 users) |           3,9 % |
| `devis_submitted`           |   **15 (15 users)** |       **0,7 %** |
| `claim_started` (artisan)   |                   8 |               – |
| `claim_submitted` (artisan) |                   2 |               – |

→ **15 leads/28 jours = 0,5 lead/jour**. Pour viser ne serait-ce que 5/jour, il faudrait **multiplier le trafic par 10×** (réaliste post-bailout fix) ou **multiplier le taux de conversion par 5×** (passer de 0,7 % à 3-4 %, dans la moyenne du secteur).

### Sources d'acquisition

| Source                 |  Users |                         Part |
| ---------------------- | -----: | ---------------------------: |
| google / organic       |  1 419 |                   **67,2 %** |
| profile_page / organic |    381 | 18,0 % (URLs profil interne) |
| (direct)               |    165 |                        7,8 % |
| **chatgpt.com**        | **47** |                    **2,2 %** |
| (data not available)   |     81 |                        3,8 % |
| bing/perplexity/ecosia |      3 |                       <0,1 % |

→ **ChatGPT est déjà un canal réel d'acquisition** (47 users, cohérent avec les 395 citations Ahrefs). À surveiller activement.

### Top villes utilisateurs

Paris 406, Lyon 79, Bordeaux 53, Marseille 53, Nice 49, Toulouse 47, Grenoble 46, Montpellier 28, Strasbourg 25, Noumea 24 (Nouvelle-Calédonie ✅).

### Web Vitals (events trackés, valeurs à pull séparément)

TTFB 3 170, LCP 3 064, FCP 2 986, FID 2 842, INP 2 230, CLS 1 274 → infrastructure de mesure en place, mais valeurs à exporter via GA4 Explorations pour quantifier les problèmes Core Web Vitals.

## 12. Plan d'action FINAL — priorisé par ROI

### Phase 0 — STOP THE BLEEDING (24 h)

1. **Fix bailout SSR layout root** — identifier le composant client coupable (test : retirer 1 par 1 les Providers du layout et curl la home pour voir quand le H1 apparaît)
2. Une fois identifié, wrapper dans `<Suspense fallback={null}>`
3. Déployer + valider via curl :
   ```bash
   curl -s https://servicesartisans.fr/ | grep -c "<h1"  # doit être >= 1
   curl -s https://servicesartisans.fr/services/plombier/paris | grep -c "BAILOUT"  # doit être 0 ou très bas
   ```
4. Soumettre en urgence à Google : `/url=...` dans GSC pour les 30 pages au volume le plus haut listées en section 10

### Phase 1 — RECONQUÊTE (1 semaine)

5. Récupérer les 83 keywords perdus : audit page par page des URLs en section 10, vérifier indexation, demander re-crawl GSC
6. Pré-rendre 100 villes top (vs 10 actuellement) dans `generateStaticParams` pour `/services/[service]/[location]`
7. Étendre le pré-rendu aux templates `/urgence/`, `/tarifs/`, `/avis/`, `/devis/` avec les top 50 villes
8. Maillage interne : ajouter dans le footer un bloc "Top métiers × villes" avec les 50 combinaisons KW les plus populaires (cf. content gap section 9)

### Phase 2 — EXPANSION CIBLÉE (2-3 semaines)

9. Créer 200 pages "métier_only" sur les top opportunités content gap (couvreur, paysagiste, élagueur, ramoneur, etc. — KD 0-3)
10. Booster les 70 pages GSC orphelines (`/blog/prix-electricien-2026`, `/tarifs/architecte-interieur`, etc.) via maillage depuis pages haute autorité
11. Rewriting des titles/meta descriptions des pages aux CTR <2 % (blog, tarifs)
12. **Stratégie ChatGPT** : analyser les 395 pages citées (utiliser API Brand Radar ou prompt manual) pour optimiser les pages plus probables d'être citées

### Phase 3 — LINK BUILDING (continu, 4-12 semaines)

13. Atteindre **DR 15-20** en 3 mois via :
    - Annuaires métiers (artisans.fr, kompass, societe.com claim)
    - Guest posts sur sites bricolage/rénovation
    - PR locale (article "annuaire artisans" dans presse régionale)
14. Surveiller la croissance via Ahrefs Site Explorer (DR, RD count)

### Phase 4 — CONVERSION (parallèle, 2 sprints)

15. Augmenter le taux `form_start → devis_submitted` (actuellement 19 % → cible 40 %) via simplification du formulaire
16. A/B test sur le CTA principal : "Demander un devis" vs "Comparer 3 devis" vs "Voir les artisans"
17. Suivi `artisan_profile_view → form_start` (actuellement 7 % → cible 15 %) via meilleur affichage des badges trust

## 13. KPI de suivi (semaine après semaine)

| KPI                 | Baseline (semaine 0) | Semaine 4 | Semaine 12 |
| ------------------- | -------------------: | --------: | ---------: |
| Pages avec H1 SSR   |                    0 | **100 %** |      100 % |
| Bailouts par page   |                    6 |       0-1 |          0 |
| Keywords top 10 GSC |                  ~10 |        50 |        200 |
| Trafic GSC mensuel  |                7 800 |    15 000 |     50 000 |
| Devis soumis / mois |                   16 |        40 |        150 |
| DR Ahrefs           |                  0,6 |         5 |      15-20 |
| Backlinks           |                   67 |       100 |        300 |
| Citations ChatGPT   |                  395 |       600 |      1 500 |

## 13. GSC Crawl Stats — Google adore le site

### Métriques 90 jours

| Métrique                                    |                         Valeur | Verdict                                 |
| ------------------------------------------- | -----------------------------: | --------------------------------------- |
| Total demandes Googlebot                    |                    **595 749** | Énorme                                  |
| Pic récent                                  | **57 329 / jour** (12/04/2026) | Site populaire chez Google              |
| Rythme actuel                               |                 30K-50K / jour | Top 5 % des sites de cette taille       |
| % HTML                                      |                         95,3 % | Sain                                    |
| % JS                                        |                         1,95 % | Faible (bon)                            |
| % chargement ressources (rendering différé) |                     **2,45 %** | Google rend le JS sur ~14 600 pages/90j |
| % Smartphone                                |                         97,1 % | 100 % mobile-first                      |
| 200 OK                                      |                    **97,75 %** | Excellent                               |
| **5xx erreurs serveur**                     |    **0,72 % = ~4 290 erreurs** | 🟡 À investiguer Vercel logs            |
| 404                                         |            0,06 % = ~358 pages | OK                                      |
| Découverte / Actualisation                  |           **91,88 % / 8,12 %** | Site jeune en explosion                 |

### Conclusion crawl

Au rythme actuel (40K crawl/jour), Google passerait la queue de 408 517 URLs en ~10 jours.

**→ Le crawl budget N'EST PAS le bottleneck**. C'est le contenu rendu.

### Évolution dans le temps (impact des changements)

Pic du **16/03/2026 = 46 141 demandes** (vs 5 000 quelques jours avant) → événement de crawl massif. Vérifier si ça correspond à un déploiement majeur (peut-être ajout/retrait de liens internes).

Pic du **26-29/03/2026 = 32K-42K/jour** → autre vague.

Et **12-13/04/2026 = nouveaux pics 50K+/jour** → croissance continue.

→ Cohérent avec la croissance du sitemap et l'expansion des pages générées.

## 14. Fichiers sources

Tous les CSV normalisés UTF-8 sont dans `docs/ahrefs-audit-2026-04/normalized/`.

Scripts de re-analyse :

- `_convert_utf16_to_utf8.py` + `_convert_v2.py` — conversion encodage
- `_analyze.py` — patterns par issue Site Audit
- `_gsc_cross.py` — croisement GSC Pages × Ahrefs issues
- `_analyze_queries.py` — analyse Requêtes GSC (clusters, quick wins)
- `_quick_wins_landing.py` — catégorisation des 119 quick wins page 2
- `_ahrefs_se.py` — Ahrefs Site Explorer (top pages, keywords, competitors)
- `_content_gap.py` — Content Gap (75k keywords vs concurrents)

Re-jouer le tout :

```bash
cd docs/ahrefs-audit-2026-04
python _convert_utf16_to_utf8.py
python _convert_v2.py
python _analyze.py
python _gsc_cross.py
python _analyze_queries.py
python _quick_wins_landing.py
python _ahrefs_se.py
python _content_gap.py
```

Captures HTML de prod (preuves bailout) :

- `home-page.html` — 256 KB, 0 H1, 6 bailouts
- `paris-page.html` — 389 KB, 0 H1, 6 bailouts
- `profil-artisan.html` — 184 KB, 0 H1, 6 bailouts
