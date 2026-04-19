# Audit SEO complet — ServicesArtisans.fr

**Date** : 2026-04-18 (v2 — mise à jour historique 5 ans)
**Période analysée** : 5 ans Ahrefs + 28 jours GSC/GA4 + curl live prod
**Âge du site** : ~71 jours (relaunch 07/02/2026)

> **CORRECTIF v2** : l'historique 5 ans Ahrefs (cf. `TRAJECTOIRE-5-ANS.md`) démontre que le site est en **croissance x7 sur 2 mois** (26 → 185 KW, 1 → 164 trafic/j) et non en chute. Un précédent site v1 a tourné de 2025-01 à 2025-10 (pic 27 KW), puis blackout de 4 mois avant le relaunch du 07/02/2026. Le "maillage 1M → 200K" n'est PAS prouvé par les exports Ahrefs fournis (export manquant : Internal Backlinks History).

## Sources de données

| Source                    | Fichiers                                                                     | Volume                   |
| ------------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| Ahrefs Site Audit Premium | 24 CSV (issues, indexation, slow pages, etc.)                                | 10 000+ pages crawlées   |
| Ahrefs Site Explorer      | 6 CSV (top pages, keywords, competitors, content gap, top target, backlinks) | 75 000 keywords analysés |
| Google Search Console     | Pages, Requêtes, Graphique, Couverture, Crawl Stats, HTTPS                   | 459 003 pages indexées   |
| Google Analytics 4        | Snapshot, Events, Engagement                                                 | 2 113 users / 28j        |
| Code source projet        | `src/app/`, `src/components/`, `src/lib/seo/`                                | –                        |
| Curl SSR en prod          | 18 templates testés                                                          | HTML brut analysé        |

---

# 1. TL;DR — état réel du site

## Le bon (croissance exponentielle pour 71 jours)

| Métrique                |                                      Valeur |
| ----------------------- | ------------------------------------------: |
| Pages indexées Google   |       **459 003** (50 % de 917 000 connues) |
| Crawls Googlebot / jour |   **30 000 – 50 000** (pic 57 329 le 12/04) |
| Impressions GSC / jour  |                33 280 (×2 500 vs lancement) |
| Clics GSC / 28 jours    |                                       7 800 |
| Users GA4 / 28 jours    |                                       2 113 |
| Devis soumis / 28 jours |                             15 (0,5 / jour) |
| **Citations ChatGPT**   |                   **395 (+174 récents)** ⭐ |
| Users via ChatGPT / 28j |                        47 (2,2 % du trafic) |
| Sitemap                 |                    50+ sub-sitemaps propres |
| Robots.txt              | propre (block params, \_next/static, admin) |
| HTTPS                   |                                       100 % |
| Réponses 200 OK         |                                     97,75 % |

## Le mauvais

| Problème                      |                   Volume | Cause                                          |
| ----------------------------- | -----------------------: | ---------------------------------------------- |
| **Bailout SSR global**        |      **100 % des pages** | Composant client dans layout root              |
| Pages "explorée non indexée"  |               **13 662** | Qualité refusée par Google (cause = bailout)   |
| **Backlinks SPAM**            |       **50 / 64 (78 %)** | PBN ciblant le site                            |
| **DR Ahrefs**                 |            **0,6 / 100** | Manque de backlinks légitimes + spam           |
| Position moyenne GSC          |        **29,4** (page 3) | Conséquence du bailout + faible autorité       |
| Erreurs serveur 5xx           |     4 290 / 90j (0,72 %) | À investiguer Vercel                           |
| **Keywords perdus récemment** | **83 (94 800 vol/mois)** | Coïncide avec changements algo Google fin mars |
| Conversion devis              |                    0,7 % | Faible (moyenne secteur 2-3 %)                 |

## Le neutre

| Métrique                     |                         Valeur | Note                                                          |
| ---------------------------- | -----------------------------: | ------------------------------------------------------------- |
| Pages avec balise `noindex`  |                         33 307 | **VOLONTAIRE** — règle `shouldNoindex` (playbook Kevin Indig) |
| Pages "détectée non indexée" |                        408 517 | Queue Google — résorbera en ~10 jours au rythme actuel        |
| Maillage interne             | ~200 000 liens (1 M récemment) | À investiguer : volontaire ?                                  |

---

# 2. Cause root #1 — Bailout SSR global

## Diagnostic

Test `curl --compressed` sur 18 templates en prod (homepage, services, tarifs, blog, urgence, villes, profils, avis, devis, guides, comparaison, etc.) :

| URL                            |  Body utile |  H1 | Bailouts |
| ------------------------------ | ----------: | --: | -------: |
| `/`                            |   665 chars |   0 |        6 |
| `/services/plombier/paris`     |   665 chars |   0 |        6 |
| `/blog/prix-electricien-2026`  |   665 chars |   0 |        6 |
| `/services/.../{artisan-slug}` |   665 chars |   0 |        6 |
| Toutes les autres testées      | ≤ 665 chars |   0 |        6 |

→ Le `<body>` brut contient uniquement :

- 1 `<noscript>` GTM
- 1 `<iframe>` GTM noscript
- **6 marqueurs `<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">`**
- Le reste = scripts + RSC payload

## Cause

Un composant client (probablement dans `src/app/layout.tsx` — `MobileMenuProvider`, `CompareProviderWrapper`, ou un autre Provider) déclenche un bailout `useSearchParams()` ou throw un Promise non-handled. Next.js 14 force alors le **CSR de tout l'arbre** jusqu'au layout root.

Ce que Google et Ahrefs voient :

- ✅ `<head>` (title, meta, OG, JSON-LD) — tout est correct
- ❌ `<body>` — vide, pas de contenu textuel

**Comment le site rank quand même** : Google fait du JS rendering différé sur **2,45 % des crawls** (Crawl Stats). Sur les niches sans concurrence (noms propres, micro-communes), le `<title>` seul suffit à ranker.

## Fix

```diff
// src/app/(public)/services/[service]/[location]/page.tsx ligne 992
+ import { Suspense } from 'react'

+ <Suspense fallback={null}>
    <ServiceLocationPageClient ... />
+ </Suspense>
```

Mais comme le bailout est **global**, il faut sans doute identifier le composant racine. Méthode :

1. Cloner le layout root en local
2. Commenter Providers 1 par 1 (`MobileMenuProvider`, `CompareProviderWrapper`, etc.)
3. `pnpm build` + `pnpm start` puis `curl localhost:3000 | grep -c "<h1"` jusqu'à voir > 0
4. Wrapper le composant identifié dans `<Suspense>`

## Validation post-fix

```bash
curl -s https://servicesartisans.fr/ | grep -c "<h1"  # doit être >= 1
curl -s https://servicesartisans.fr/services/plombier/paris | grep -c "BAILOUT"  # doit être 0
```

## Impact attendu

- 13 662 pages "explorée non indexée" → indexées
- 459 003 pages indexées → ranking amélioré (passage page 3 → page 1-2 sur niches)
- Reconquête des 83 keywords perdus (94 800 vol/mois)
- Trafic GSC ×3-5× sur 4 semaines

---

# 3. Cause root #2 — Backlinks SPAM (78 %)

## Diagnostic

Sur 64 backlinks total, 54 domaines uniques :

| Statut                 | # Backlinks |        % |
| ---------------------- | ----------: | -------: |
| **SPAM (Ahrefs flag)** |      **50** | **78 %** |
| Nofollow               |          35 |     55 % |
| Lost récemment         |           6 |        – |
| **Légitimes estimés**  |     **~10** |     15 % |

## Top 20 backlinks par DR — TOUS sont du SPAM PBN

|  DR | Domaine                                               | Pattern                       |
| --: | ----------------------------------------------------- | ----------------------------- |
|  76 | itxoft-reliable-seo-services.site                     | PBN SEO                       |
|  76 | rank-your.website                                     | PBN SEO                       |
|  72 | primeseo.xyz                                          | PBN SEO                       |
|  72 | grow-your.website                                     | PBN SEO                       |
|  72 | fiverr-seo-for-business-growth.site                   | PBN SEO                       |
|  71 | zoldexlinks.shop                                      | PBN SEO                       |
|  60 | seodaro.com                                           | PBN SEO                       |
|  53 | bye.fyi, quero.party                                  | PBN                           |
|  50 | seoagency.sale, creativeposts.top, analyticshaven.top | PBN                           |
|  49 | atomizelink.icu                                       | PBN                           |
|  48 | optimizeflow.top, dailymusings.top                    | PBN                           |
|  37 | qhtycw.com, hzdlpq.com, kgzxkf.com                    | PBN chinois (DOFOLLOW + LOST) |

→ Patterns `.shop`, `.icu`, `.top`, `.party`, `.fyi`, `.xyz` = PBN (Private Blog Networks) classiques.

## Backlinks LÉGITIMES (rares)

- `keskeces.fr` (DR 24) — annuaire architectes
- `climacontrol.fr` (DR 28)
- `artisanduvert.fr` (DR 18, 5 liens)
- Quelques autres < DR 30

## Anomalie

7 backlinks pointent vers `serviceartisans.fr` (faute de frappe — sans S à "services") → suggère que ces PBN ont été **attaqués automatiquement** sans relecture, ou qu'un fournisseur SEO (probablement bidon) a livré du brouillon.

## Risque

Manual penalty Google (Penguin) ou pénalité algorithmique → drop de visibilité. Probabilité d'autant plus haute que le **DR 0,6 contraste** avec ces backlinks à DR 70+ (signal anormal).

## Fix immédiat — fichier disavow généré

Voir `disavow.txt` dans ce dossier. **44 domaines à désavouer**. Upload :

1. https://search.google.com/search-console/disavow-links
2. Sélectionner la propriété servicesartisans.fr
3. Upload du fichier
4. Attendre 2-4 semaines pour effet

---

# 4. Indexation Google — vraie analyse

## Évolution 90 jours (GSC Index Coverage)

| Date                      | Non indexées | Dans l'index | Impressions/jour |
| ------------------------- | -----------: | -----------: | ---------------: |
| 2026-01-27 (avant)        |            9 |            0 |                7 |
| 2026-02-08 (lancement +1) |        2 378 |           40 |               17 |
| 2026-02-22                |        2 086 |        9 312 |            7 827 |
| 2026-03-08                |       60 034 |       54 586 |            9 459 |
| 2026-03-25                |      497 165 |      202 271 |           24 660 |
| 2026-04-01                |      572 564 |      290 288 |           35 272 |
| **2026-04-13**            |  **457 960** |  **459 003** |       **33 280** |

→ Croissance exponentielle. 50/50 split atteint le 11 avril.

## Composition du non-indexé (~458 000)

| Cause                                          |   Pages |      % |
| ---------------------------------------------- | ------: | -----: |
| **Détectée, actuellement non indexée**         | 408 517 | 89,1 % |
| Exclue par balise `noindex`                    |  33 307 |  7,3 % |
| **Explorée, actuellement non indexée**         |  13 662 |  3,0 % |
| Page en double Google a choisi autre canonique |   1 369 |  0,3 % |
| Page avec redirection                          |     456 |  0,1 % |
| Autre page avec canonique correcte             |     209 |      – |
| Erreur serveur 5xx                             |     196 |      – |
| Bloquée robots.txt                             |     128 |      – |
| 404                                            |      78 |      – |
| Page double sans canonique                     |      32 |      – |
| Soft 404                                       |       6 |      – |

## Crawl Stats GSC (90 jours)

| Métrique                                        |                  Valeur |
| ----------------------------------------------- | ----------------------: |
| Total demandes Googlebot                        |                 595 749 |
| Pic récent                                      |   57 329 / jour (12/04) |
| Réponses 200 OK                                 |                 97,75 % |
| Réponses 5xx                                    | 0,72 % (~4 290 erreurs) |
| Réponses 301                                    |                  0,11 % |
| Réponses 404                                    |                  0,06 % |
| Type fichier HTML                               |                  95,3 % |
| **Type "chargement ressources" (JS rendering)** |              **2,45 %** |
| Type Smartphone                                 |                  97,1 % |
| Découverte / Actualisation                      |        91,88 % / 8,12 % |

→ **Crawl budget non saturé.** Au rythme actuel, Google passerait la queue de 408 517 URLs en ~10 jours.

---

# 5. Performance utilisateur (GA4)

## Métriques 28 jours

| Métrique                |         Valeur |
| ----------------------- | -------------: |
| Utilisateurs actifs     |          2 113 |
| Nouveaux utilisateurs   | 2 083 (98,6 %) |
| Sessions                |          2 395 |
| Engagement moyen / user |  47,7 secondes |
| Total events            |         32 125 |

## Funnel de conversion

| Étape                       |            Volume | Taux conversion |
| --------------------------- | ----------------: | --------------: |
| Sessions                    |             2 395 |               – |
| `page_view`                 |             5 144 |               – |
| `artisan_profile_view`      | 1 325 (987 users) |          62,8 % |
| `form_start`                |     97 (69 users) |           5,9 % |
| `phone_click`               |     54 (41 users) |           3,9 % |
| **`devis_submitted`**       | **15 (15 users)** |       **0,7 %** |
| `claim_started` (artisan)   |                 8 |               – |
| `claim_submitted` (artisan) |                 2 |               – |

→ **15 leads / 28 jours = 0,5 lead / jour**.

## Sources d'acquisition

| Source                 |  Users |         Part |
| ---------------------- | -----: | -----------: |
| google / organic       |  1 419 |       67,2 % |
| profile_page / organic |    381 |       18,0 % |
| (direct)               |    165 |        7,8 % |
| **chatgpt.com**        | **47** | **2,2 %** ⭐ |
| (data not available)   |     81 |        3,8 % |
| bing/perplexity/ecosia |      3 |       <0,1 % |

## Top villes utilisateurs

Paris 406 / Lyon 79 / Bordeaux 53 / Marseille 53 / Nice 49 / Toulouse 47 / Grenoble 46 / Montpellier 28 / Strasbourg 25 / Noumea 24

## Web Vitals (events trackés)

TTFB 3 170 / LCP 3 064 / FCP 2 986 / FID 2 842 / INP 2 230 / CLS 1 274 → mesure en place, valeurs à pull via GA4 Explorations.

---

# 6. Maillage interne (Top Target Pages Ahrefs)

## État actuel

| Bucket                 |   # Pages | Total liens cumulés |
| ---------------------- | --------: | ------------------: |
| 0-9 liens              |         0 |                   0 |
| 10-49                  |       845 |              20 562 |
| 50-99                  |       113 |               7 218 |
| 100-499                |        35 |               5 972 |
| 500-999                |         3 |               2 068 |
| **40 000+ (plafonné)** |     **4** |         **160 000** |
| **Total**              | **1 000** |         **195 820** |

## Anomalies

1. **160 000 liens (82 %) concentrés sur 4 pages** :
   - Homepage (`/`)
   - `/regions/occitanie`
   - `/services/jardinier` (pourquoi celle-ci ?)
   - `/villes/toulouse`
2. **690 / 1 000 pages dans le top maillage = DOM-TOM** (Mayotte, Martinique, Guyane, Nouvelle-Calédonie)
3. Médiane = 24 liens / page (faible)

## Question utilisateur

L'utilisateur a indiqué une **réduction récente : 1 000 000 → 200 000 liens internes**. À investiguer :

- Date exacte de la réduction
- Volontaire (perf RSC payload) ou bug de déploiement ?
- Quels types de liens supprimés (footer ? sidebar ? in-content ?)

→ Cohérent avec la perte des 83 keywords si la coupe a touché les liens vers ces pages.

---

# 7. Performance keywords (Ahrefs Site Explorer)

## Vue d'ensemble

| Métrique                  |             Valeur |
| ------------------------- | -----------------: |
| Keywords trackés Ahrefs   | 261 (vs GSC 1 000) |
| Volume cumulé             |            118 120 |
| Position moyenne pondérée |                  – |
| Branded                   |                 26 |
| Local                     |                197 |
| Informational             |                260 |
| Commercial                |                155 |
| Transactional             |                 52 |

## Évolution récente

| Statut | # Keywords | Volume cumulé |
| ------ | ---------: | ------------: |
| Lost   |         83 |        94 800 |
| New    |        165 |             – |
| Stable |         11 |             – |

## Keywords PERDUS (top par volume)

|    Volume | Pos perdue | Keyword                   | URL                                          |
| --------: | ---------: | ------------------------- | -------------------------------------------- |
|    59 000 |         99 | serrurier                 | `/services/serrurier/lyon`                   |
|     5 600 |         58 | carreleur                 | `/services/carreleur/brest`                  |
|     3 100 |         34 | serrurier lyon            | idem                                         |
|     2 300 |         80 | couvreur lille            | `/services/couvreur/lille`                   |
|     2 200 |         64 | plombier marseille        | `/services/plombier/marseille`               |
|     1 400 |         75 | couvreur clermont ferrand | `/avis/couvreur/clermont-ferrand`            |
|     1 300 |         52 | electricien lyon          | `/services/electricien/lyon`                 |
|     1 200 |         76 | couvreur lorient          | `/services/couvreur/lorient`                 |
| **1 000** |      **4** | **plombier rouen**        | `/devis/plombier/le-grand-quevilly/rouen` ⚠️ |
|     1 000 |         59 | urgence serrurier         | `/urgence/serrurier/nimes`                   |
|     1 000 |         68 | couvreur amiens           | `/services/couvreur/amiens`                  |
|       700 |         50 | plombier poitiers         | `/services/plombier/poitiers`                |

→ La perte de "plombier rouen" position 4 est dramatique.

## Keywords actuels — top 15 par volume

| Volume |  KD | Pos | Trafic | Keyword                     |
| -----: | --: | --: | -----: | --------------------------- |
|  6 200 |  68 |  26 |      4 | ma prime renov 2026         |
|  3 700 |   0 |  20 |      0 | brico man                   |
|  2 200 |   3 |  17 |      1 | prix carrelage m2           |
|  2 000 |   2 |  29 |      0 | fenetre double vitrage      |
|    800 |   0 |  34 |      0 | serrurier tourcoing         |
|    700 |   0 |  28 |      1 | prix pose cuisine           |
|    600 |   2 |  19 |      2 | serrurier aix les bains     |
|    600 |   0 |  23 |      1 | fenetres double vitrage     |
|    500 |   2 |  26 |      0 | serrurier caen              |
|    100 |   0 |   2 |     18 | plombier caen 24h24 ⭐      |
|     80 |   1 |   8 |      3 | cuisiniste pays de la loire |
|     80 |   0 |   9 |      3 | vitrier muret               |

## Pages organiques top trafic Ahrefs (vs vue GSC)

| Pattern                                 | Pages | Trafic Ahrefs |
| --------------------------------------- | ----: | ------------: |
| `/devis/{spec}/{commune}/{quartier}`    |     8 |            51 |
| `/urgence/{spec}/{commune}`             |    17 |            38 |
| `/departements/{slug}/{spec}`           |    16 |            34 |
| `/avis/{spec}/{commune}`                |    30 |            20 |
| `/services/{spec}/{commune}`            |    53 |            20 |
| `/tarifs/{spec}/{commune}/{prestation}` |    59 |            17 |
| `/services/{spec}/{commune}/{artisan}`  |    37 |            14 |

## Quick wins GSC (pos 11-20, impr ≥ 50, 0 clic)

**119 keywords, 9 571 impressions/mois cumulées, 2 clics actuels.**

Top intents :

- 35 `other` (noms propres + mixtes) — 2 273 impr
- 26 `métier seul` — 2 069 impr (consultation géomètre, alarme [ville])
- 16 `ville_only` — 1 842 impr (isolation thermique villejuif)
- 12 `métier × ville` — 1 192 impr (cuisiniste charvieu, déménageur arradon)

---

# 8. Concurrence

## Vrais concurrents (Ahrefs Competitive Analysis)

|  DR | Domaine             | Common KW |  Pages | Trafic Ahrefs |
| --: | ------------------- | --------: | -----: | ------------: |
|  62 | depanneo.com        |        35 |  4 685 |        60 810 |
|  60 | mesdepanneurs.fr    |         7 |  2 325 |       183 693 |
|  72 | allovoisins.com     |        23 | 14 126 |       387 454 |
|  56 | rdvartisans.fr      |        15 |  3 287 |        11 764 |
|  52 | lesbonsartisans.fr  |        14 |  1 773 |        24 861 |
|  45 | ou-serrurier.fr     |        17 |  1 749 |        15 019 |
|  42 | etienne-services.fr |        20 |  2 656 |        26 455 |
|  61 | yoojo.fr            |         5 |    865 |        80 865 |
|  39 | cleanolia.fr        |         8 |    608 |         3 632 |

**Notre position** : DR 0,6 vs DR moyen concurrents directs ~52. Gap massif d'autorité.

## Matrice keywords communs

| Concurrent                    | KW partagés avec nous | KW partagés avec travaux.com |
| ----------------------------- | --------------------: | ---------------------------: |
| **travaux.com** (hub central) |                **71** |                            – |
| depanneo.com                  |                    35 |                        4 273 |
| allovoisins.com               |                    23 |                        6 602 |
| etienne-services.fr           |                    20 |                        2 326 |
| ou-serrurier.fr               |                    17 |                          817 |
| rdvartisans.fr                |                    15 |                        2 259 |
| lesbonsartisans.fr            |                    14 |                        1 455 |
| mesdepanneurs.fr              |                     7 |                        2 842 |
| yoojo.fr                      |                     5 |                        1 471 |

→ travaux.com est le **leader hub** du marché. Notre couverture = ~2 % de leur scope.

## Content Gap (75 000 keywords)

737 opportunités atteignables (KD ≤ 30, vol ≥ 50, ≥ 2 concurrents) = **929 300 vol/mois cumulé**.

| Cluster       |  KW | Volume cumulé |
| ------------- | --: | ------------: |
| metier_only   | 236 |       383 400 |
| other / brand | 301 |       376 000 |
| metier_ville  | 111 |       121 450 |
| prix_other    |  29 |        15 100 |
| install_renov |  19 |        10 000 |
| ville_only    |  13 |         9 750 |
| urgence       |  13 |         7 100 |

Top 10 quick wins absolus :

- engie home service (61 000 vol, KD 0) — éviter (brand IZI)
- couvreur (22 000, KD 0)
- couvreur autour de moi (12 000, KD 0)
- serrurier autour de moi (11 000, KD 2)
- plombier autour de moi (10 000, KD 0)
- charpente (8 700, KD 0)
- pisciniste autour de moi (8 400, KD 0)
- chauffagiste (6 000, KD 0)
- jardinier autour de moi (5 800, KD 0)
- electricien autour de moi (5 500, KD 1)

→ Les pages existent déjà. Le bailout fix débloquera 30-60 % de ces opportunités.

---

# 9. Site Audit Ahrefs — issues techniques

## Erreurs critiques

| #   | Issue                                        |  Volume | Pattern dominant                                      |
| --- | -------------------------------------------- | ------: | ----------------------------------------------------- |
| E1  | Pages orphelines (zéro lien interne entrant) | 10 000+ | `/services/{slug}/{slug}` (87 %)                      |
| E2  | Pages sans liens sortants                    | 10 001+ | `/services/{slug}/{slug}` (87 %)                      |
| E3  | 3XX redirect dans sitemap                    |       2 | `/simulateur-prime-cee`, `/blog/maprimerénov-2026...` |

→ E1+E2 sont une conséquence du bailout SSR (Ahrefs ne voit pas les liens dans le RSC payload). Pas un vrai problème de maillage.

## Warnings

| #   | Issue                        |  Volume | Vrai problème ?                          |
| --- | ---------------------------- | ------: | ---------------------------------------- |
| W1  | H1 manquant ou vide          | 10 001+ | ✅ Oui (bailout SSR)                     |
| W2  | Low word count               | 10 001+ | ✅ Oui (bailout SSR)                     |
| W3  | Meta description trop courte |   5 367 | ❌ Non (présentes dans `<head>`)         |
| W4  | Title trop long              |   1 255 | ✅ Oui (à raccourcir)                    |
| W5  | Open Graph incomplets        |     770 | 🟡 Sur blog (`/blog/{slug}/{slug}` 75 %) |
| W6  | Pages lentes (TTFB > 2s)     |      49 | ✅ Oui (cold-start ISR)                  |
| W7  | Meta description trop longue |     184 | 🟡 Sur `/questions/`                     |
| W8  | 3XX redirect general         |       5 | À nettoyer                               |
| W9  | Sitemap au mauvais format    |       3 | feeds RSS dans sitemap                   |

## Notices

| #   | Issue                        |  Volume | Action               |
| --- | ---------------------------- | ------: | -------------------- |
| N1  | Pages à soumettre IndexNow   | 10 001+ | Implémenter IndexNow |
| N2  | Page dans plusieurs sitemaps |     455 | Vérifier doublons    |
| N3  | Title page ≠ SERP title      |      19 | OK                   |

---

# 10. Top pages lentes (cold-start ISR)

|         TTFB |      Loading | URL                                        |
| -----------: | -----------: | ------------------------------------------ |
|       267 ms | **7 273 ms** | `/services/serrurier/cazouls-les-beziers`  |
| **3 424 ms** |     3 633 ms | `/services/plombier/angouleme`             |
|       254 ms |     6 363 ms | `/services/plombier/mezidon-vallee-d-auge` |
|     2 584 ms |     2 842 ms | `/services/plombier/saint-cyr-sur-mer`     |
|     2 555 ms |     2 830 ms | `/services/plombier/neuilly-sur-marne`     |
|     2 498 ms |     2 739 ms | `/services/plombier/marcq-en-bar-ul`       |
|     2 448 ms |     2 733 ms | `/services/serrurier/ostwald`              |

→ Cold-start ISR sur communes pas pré-rendues. Solution : `TOP_CITIES_COUNT = 100` au lieu de 10 dans `generateStaticParams`.

---

# 11. Pages à fort potentiel ORPHELINES (croisement GSC × Ahrefs)

70 pages indexées GSC qui sont orphelines selon Ahrefs (pas de liens internes entrants). Top 10 par impressions :

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

→ **Quick win** : ajouter du maillage interne entrant vers ces pages (ex : bloc "Articles populaires" home/footer).

---

# 12. Plan d'action FINAL

## Phase 0 — STOP THE BLEEDING (24-48 h)

| #   | Action                                                                                               | Effort | Impact                                 |
| --- | ---------------------------------------------------------------------------------------------------- | ------ | -------------------------------------- |
| 0.1 | **Upload `disavow.txt`** (44 domaines spammy) dans GSC                                               | 5 min  | Prévention pénalité Penguin            |
| 0.2 | **Identifier le composant qui cause le bailout SSR** (test commenter Providers root layout en local) | 2-4 h  | Prép étape 0.3                         |
| 0.3 | **Wrapper le composant dans `<Suspense fallback={null}>`** + déploiement Vercel                      | 30 min | Débloque 13 662 pages + ranking massif |
| 0.4 | **Investiguer 4 290 erreurs 5xx** (Vercel logs)                                                      | 2 h    | -0,72 % crawl waste                    |
| 0.5 | **Re-soumettre les 30 top URLs perdues** dans GSC                                                    | 30 min | Reconquête keywords                    |

## Phase 1 — RECONQUÊTE (1 semaine)

| #   | Action                                                                                    | Effort | Impact                   |
| --- | ----------------------------------------------------------------------------------------- | ------ | ------------------------ |
| 1.1 | Audit page par page des 83 keywords perdus                                                | 1 j    | Identifier root cause    |
| 1.2 | Pré-rendre 100 villes top dans `generateStaticParams` (vs 10)                             | 2 h    | Élimine 90 % cold-starts |
| 1.3 | Étendre pré-rendu à `/urgence/`, `/tarifs/`, `/avis/`, `/devis/`                          | 2 h    | Idem                     |
| 1.4 | Maillage : bloc "Articles populaires" home/footer pointant vers 70 pages orphelines GSC   | 4 h    | Quick win trafic blog    |
| 1.5 | Rétablir / re-distribuer maillage 200K → 500K-800K (équitable, pas concentré sur 4 pages) | 1 j    | PageRank interne ×3-4    |
| 1.6 | Nettoyer sitemap : retirer `/feed/blog.xml`, `/feed/nouveaux-artisans.xml`, redirects     | 30 min | Clean signal             |

## Phase 2 — EXPANSION CIBLÉE (2-3 semaines)

| #   | Action                                                                                         | Effort | Impact                   |
| --- | ---------------------------------------------------------------------------------------------- | ------ | ------------------------ |
| 2.1 | Créer 200 pages métier_only (couvreur, paysagiste, élagueur, ramoneur, etc.) — top content gap | 1 sem  | +50K vol/mois capté      |
| 2.2 | Rewriting titles/meta descriptions pages CTR <2 % (blog, tarifs)                               | 2 j    | CTR ×3                   |
| 2.3 | Implémenter IndexNow API dans revalidate ISR                                                   | 4 h    | Notification Bing/Yandex |
| 2.4 | Open Graph complets sur 577 articles blog                                                      | 1 j    | Partage social           |
| 2.5 | Réduire titles > 60 chars (821 pages services + 179 blog)                                      | 2 j    | CTR amélioré             |
| 2.6 | Augmenter min meta desc à 120 chars (5 344 pages)                                              | 2 j    | CTR amélioré             |

## Phase 3 — STRATÉGIE LLM (parallèle, 2 semaines)

| #   | Action                                                              | Effort | Impact                  |
| --- | ------------------------------------------------------------------- | ------ | ----------------------- |
| 3.1 | Pull Brand Radar Ahrefs : quelles pages ChatGPT cite                | 30 min | Cible ses optimisations |
| 3.2 | Optimiser 50 pages les plus citées pour favoriser citation continue | 1 sem  | +200 citations en 4 sem |
| 3.3 | Tracker referrer ChatGPT/Perplexity dans GA4 (UTM ou regex)         | 2 h    | Mesure canal            |

## Phase 4 — LINK BUILDING (continu, 4-12 sem)

| #   | Action                                                             | Effort  | Impact            |
| --- | ------------------------------------------------------------------ | ------- | ----------------- |
| 4.1 | Inscription annuaires métiers premium (Kompass, Societe.com claim) | 2 sem   | +30 RD légitimes  |
| 4.2 | Guest posts sur sites bricolage/rénovation/immobilier              | 3 mois  | +50 RD légitimes  |
| 4.3 | PR locale : article "annuaire artisans" presse régionale           | 2 mois  | +20 RD locales    |
| 4.4 | Partenariats fédérations métiers (CAPEB, FFB)                      | 3 mois  | RD haute autorité |
| 4.5 | Surveiller tentatives spam négatif via Ahrefs alerts               | continu | Disavow rapide    |

## Phase 5 — CONVERSION (parallèle, 2 sprints)

| #   | Action                                                                          | Effort | Impact                                 |
| --- | ------------------------------------------------------------------------------- | ------ | -------------------------------------- |
| 5.1 | Simplifier formulaire devis (réduire de N champs à N/2)                         | 2 j    | `form_start → submit` 19 % → 40 %      |
| 5.2 | A/B test CTA : "Demander un devis" vs "Comparer 3 devis" vs "Voir les artisans" | 1 sem  | +20 % CTR CTA                          |
| 5.3 | Améliorer affichage badges trust sur profil artisan                             | 2 j    | `profile_view → form_start` 7 % → 15 % |
| 5.4 | Live chat / callback request bien visible                                       | 1 sem  | Capture leads tièdes                   |

---

# 13. KPI 12 semaines

| KPI                          | Baseline (sem 0) |      Cible sem 4 | Cible sem 12 |
| ---------------------------- | ---------------: | ---------------: | -----------: |
| Pages avec H1 SSR            |                0 |        **100 %** |        100 % |
| Bailouts par page            |                6 |              0-1 |            0 |
| Pages indexées GSC           |          459 003 |          600 000 |      800 000 |
| Pages "explorée non indexée" |           13 662 |            5 000 |            0 |
| Keywords top 10 GSC          |              ~10 |               50 |          200 |
| Position moyenne GSC         |             29,4 |               22 |           15 |
| Trafic GSC mensuel           |            7 800 |           15 000 |       50 000 |
| Devis soumis / mois          |               16 |               40 |          150 |
| Taux conversion devis        |            0,7 % |            1,5 % |          3 % |
| DR Ahrefs                    |              0,6 |                5 |        15-20 |
| Backlinks SPAM               |               50 | 0 (post-disavow) |            0 |
| Backlinks LÉGITIMES          |              ~10 |               30 |          100 |
| Citations ChatGPT            |              395 |              600 |        1 500 |
| Erreurs 5xx / 90j            |            4 290 |            1 000 |        < 500 |

---

# 14. Questions ouvertes pour l'utilisateur

1. **Réduction maillage 1 M → 200 K** : volontaire ? Quand exactement ? Quels types de liens supprimés ?
2. **Cible business** : leads/mois cible ? prix/lead actuel ?
3. **Stack actuelle** : Vercel plan ? Supabase plan ? Build duration current ?
4. **Concurrents prioritaires à battre** : top 3 ?
5. **Investissement link building** : budget mensuel possible ?

---

# 15. Fichiers du diagnostic

Tous dans `docs/ahrefs-audit-2026-04/` :

## CSV normalisés (UTF-8) — `normalized/`

- 24 exports Ahrefs Site Audit
- 6 exports Ahrefs Site Explorer
- 6 exports GSC (Pages, Requêtes, Couverture, Crawl Stats, HTTPS, Métadonnées)
- 3 exports GA4 (Snapshot, Events, Engagement)
- 1 export backlinks détaillés

## Scripts Python d'analyse

- `_convert_utf16_to_utf8.py` + `_convert_v2.py` + `_convert_v3.py` — conversion encodage
- `_analyze.py` — patterns par issue Site Audit
- `_gsc_cross.py` — croisement GSC Pages × Ahrefs issues
- `_analyze_queries.py` — analyse Requêtes GSC (clusters, quick wins)
- `_quick_wins_landing.py` — catégorisation 119 quick wins page 2
- `_ahrefs_se.py` — Ahrefs Site Explorer (top pages, keywords, competitors)
- `_content_gap.py` — Content Gap (75k keywords vs concurrents)
- `_target_pages.py` — analyse maillage interne (top target pages)
- `_backlinks.py` — analyse backlinks (spam detection)
- `_generate_disavow.py` — génération disavow.txt

## Captures HTML SSR (preuves bailout)

- `home-page.html` — 256 KB, 0 H1, 6 bailouts
- `paris-page.html` — 389 KB, 0 H1, 6 bailouts
- `profil-artisan.html` — 184 KB, 0 H1, 6 bailouts

## Livrables actionnables

- **`disavow.txt`** — 44 domaines spammy à uploader dans GSC
- **`RAPPORT-FINAL.md`** — ce document

## Re-jouer toute l'analyse

```bash
cd docs/ahrefs-audit-2026-04
python _convert_utf16_to_utf8.py
python _convert_v2.py
python _convert_v3.py
python _analyze.py
python _gsc_cross.py
python _analyze_queries.py
python _quick_wins_landing.py
python _ahrefs_se.py
python _content_gap.py
python _target_pages.py
python _backlinks.py
python _generate_disavow.py
```

---

**Fin du rapport.**
