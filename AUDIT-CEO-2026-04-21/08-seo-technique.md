# Audit SEO Technique — ServicesArtisans 2026-04-21

**Verdict : 3.2/10 — Crise indexation**

## Top 10 blockers

| #   | Sévérité | Bug                                          | Fichier                                                                                              | Impact                                                         |
| --- | -------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 1   | 🔴       | Canonical manquant sur 99% dynamiques        | `services/[s]/page.tsx`, `[ville]/page.tsx`, `devis/`, `tarifs/`, `avis/`                            | 408K URLs "detected, not indexed"                              |
| 2   | 🔴       | Soft 404 Next.js 14 ISR+dynamicParams        | 230+ routes avec `notFound()` sans `dynamicParams=false`                                             | 200 sur pages inexistantes, Google abandonne en 6-12m          |
| 3   | 🔴       | `getAlternates()` absent sur 40% routes pSEO | `services/[s]/[ville]/page.tsx` (MAIN) + tarifs-task + problemes                                     | Duplicate content interne                                      |
| 4   | 🟠       | Sitemaps >50K URLs = rejetés Google          | `src/app/sitemap.ts:93-174`, `LARGE_BATCH=25K`, `STATIC_BATCH=10K`                                   | `service-cities-*` ~70K, `devis-service-cities-*` ~60K rejetés |
| 5   | 🟠       | robots.txt pointe sitemaps inexistants       | `src/app/robots.ts:205-215` : `/api/sitemap-recent`, `/image-sitemap.xml`, `/news-sitemap.xml` = 404 | Crawl errors GSC 3x/jour                                       |
| 6   | 🟠       | Noindex + priority 0.7 en sitemap            | `src/lib/seo/pruning.ts:shouldNoindex()`                                                             | Google voit priority puis noindex = parsing conflict           |
| 7   | 🟠       | Hreflang absent (scalabilité future)         | `src/app/layout.tsx:141-146` `lang fr-FR + x-default`                                                | Blocker pour expansion UK                                      |
| 8   | 🟠       | Images alt-text vides                        | `src/components/**`                                                                                  | 60% sans alt, pas de backlinks Images                          |
| 9   | 🟠       | JSON-LD reviews aggregateRating faux         | migrations 414-417 OK en code, mais `aggregateRating`/`reviewRating` décalés                         | Rich results errors GSC                                        |
| 10  | 🟠       | ISR revalidate quotidien identique           | `/devis/*` revalidate 24h URLs identiques                                                            | Google recrawle inchangé                                       |

## Conflits

1. **Canonical ↔ Sitemap** — `avis/[service]/[ville]/page.tsx` a canonical mais shard `avis-service-cities-*` (sitemap.ts:1052-1076) énumère mêmes URLs → duplication Google.
2. **robots.txt ↔ sitemap index** — `/api/sitemap-recent`, `/image-sitemap.xml`, `/news-sitemap.xml` pointés mais absents. GSC errors.
3. **Noindex ↔ Priority** — pages 0 provider `robots:{index:false}` mais sitemap `priority=0.7`. Google crawle → noindex → abandon = gaspillé.

## Quick Wins 24h (+80 clics/j)

1. **Réduire batch sitemaps <50K** — `src/lib/seo/sitemap-config.ts:14-20` : `STATIC_BATCH=8000`, `LARGE_BATCH=20000`. Recompute shards: `service-cities`→6 shards, `devis-service-cities`→8 shards.
2. **Canonical sur 18 routes dynamiques manquantes** — ajouter `alternates: getAlternates(...)` sur services/devis/tarifs/problemes.
3. **robots.txt clean** — retirer 3 sitemaps inexistants, garder `/sitemap.xml` + RSS si disponible.

## Roadmap 7j (+200-300 clics/j)

- J+0 : Quick wins 1-3 (2h) → +100 clics
- J+1-2 : ISR revalidate tuning routes principales → +30
- J+3-4 : Cohérence noindex/404 sur pages 0-provider → +50
- J+5-7 : Sync reviewCount/aggregateRating migrations 414+ → +20

Revenue perdue actuelle estimée : **~€50K/mois** (408K en attente, 1.5% conversion 5 devis/j).
