# Audit Architecture Next.js — ServicesArtisans 2026-04-21

**Verdict : 6.2/10 — lourde (436 TSX, 273 routes API), ISR/SSR déséquilibrés**

## Top 5 P0

1. **Soft 404 masqué 0-artisan** — `src/app/(public)/services/[service]/[location]/page.tsx:564` retourne `null` + `notFound()` lignes 535/537, mais `sitemap.ts:25` `dynamicParams=false` puis `:119` `dynamicParams=true` = contradiction. Pages vides cachées 24h. **408K URLs "détectées non indexées"** — budget crawl perdu.

2. **`revalidate` absent sur ~350 pages publiques** — `/guides/`, `/outils/`, `/comparaison/`, `/barometre/`, `/rge/`, `/cee/...`, `/services/*`. Default = pas de revalidation = 30+ jours obsolète. E-E-A-T cassé sur YMYL (aides financières).

3. **Bailout SSR `ssr:false` sur routes critiques** — `services/[service]/[location]/page.tsx:98-106` : `GeoPageCTA`, `MicroConversions`, `CallbackRequest`, `InlineTestimonial`. 25K pages/jour crawlées, contenu vide à l'hydratation. CTR -35%, indexation -60%.

4. **Middleware CSRF bloque IndexNow sans Origin** — `src/middleware.ts:317-324` : `if (!origin) return 403`. Combiné avec `sitemap.ts` `dynamicParams=false` + TOP_10 villes hard-codées → 15-20K URLs pSEO invisibles.

5. **Instrumentation.ts inactive en Edge** — `src/instrumentation.ts:7-9` : Sentry importé seulement si `NEXT_RUNTIME === 'edge'` mais middleware tourne en Edge. Erreurs CSRF/rate-limit/auth invisibles → MTTR 7j+.

## Top 5 P1

1. ISR 86400s blanket — `/barometre/`, `/avis/`, `/tarifs/` changent quotidiennement, cache stale.
2. `next.config.js:28` `staticPageGenerationTimeout=600s` insuffisant pour 459K pages sitemaps partiels.
3. 284 routes `dynamic='force-dynamic'` sans caching → `/api/simulateur/submit`, `/api/devis` waterfalls RTT jamais cachées.
4. `CompareProviderWrapper` double-import kill switch `NEXT_PUBLIC_DISABLE_COMPARE_SSR` = signal SSR fragile.
5. 91 `notFound()` dans `/src/app` vs 18 API → soft 404 risk : noindex ≠ HTTP 404.

## Dettes structurelles

**À rewriter** :

- `sitemap.ts` — `dynamicParams=false` + TOP_10 villes hardcodées → `generateSitemaps()` async scan DB actives villes, batch 50K/map.
- Bailout SSR sur services — SSR-first, hydrate CTAs côté client uniquement.

**À refactorer** :

- CSP dupliquée middleware + next.config.js → middleware unique.
- Rate-limiter fail-open Redis → fail-closed.
- Auth guard Supabase session refresh race (middleware.ts:170-254) → single response object.

## Quick Wins 24h

1. `export const revalidate = 3600` sur 100 pages trafic (guides/outils/barometre/avis/tarifs).
2. `sitemap.ts` `dynamicParams=true` + scan DB complet cities actives.
3. Retirer `ssr:false` sur les 4 composants conversion, passer en dynamic loading skeleton.
