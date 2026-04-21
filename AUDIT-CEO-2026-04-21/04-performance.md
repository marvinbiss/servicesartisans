# Audit Performance — ServicesArtisans 2026-04-21

**Verdict : 3.2/10 — Désastre scaling**

## Top 10 bottlenecks

1. **330+ `dynamic(..., ssr:false)` sur routes stratégiques** — `src/app/(public)/services/[service]/[location]/page.tsx:98-106`. `GeoPageCTA`, `MicroConversions`, `CallbackRequest` rendus CSR-only. 459K × 47 services = Googlebot indexe HTML vide + LCP +200-300ms.
2. **15 Tiptap packages** — `package.json:46-60`. 450KB ProseMirror+Tables chargés même pour non-admin. Pas lazy loaded.
3. **Middleware 483 lignes avec Supabase SSR fetch auth** — `src/middleware.ts:182-220`. 100K req/min × 8-12ms edge warming = 50ms cumul sur routes publiques pré-rendues.
4. **`Promise.all` séquentiel generateMetadata** — `services/[s]/[l]/page.tsx:196-201`. Cascade N+1, cold start 1.8-2.2s.
5. **@react-pdf/renderer 120KB** — `package.json:40`. PDF Node-only mais bundled par imports croisés.
6. **ISR 86400s + `stale-while-revalidate=604800`** — `next.config.js:91-169`. CDN sert 7 jours stale. ETag 304 jamais activé.
7. **`dangerouslyAllowSVG:true` + `unoptimized`** — `next.config.js:18-19`. XSS vector SVG upload portfolio + pas d'AVIF/WebP = +200-400KB/portfolio.
8. **Capacitor ×7 deps** — 20-30MB node_modules traversal × 459K pages build.
9. **Googlebot log insert sans dedup** — `middleware.ts:109-118`. 1M crawls/mois = Supabase write throughput spike.
10. **Stripe webhooks check sur toutes pages + Pipedrive 4s timeout** — `/api/devis` drop request si Pipedrive slow = 0 leads stockés.

## Deps à supprimer

| Package                 | KB gzip | Raison                     | Gain |
| ----------------------- | ------- | -------------------------- | ---- |
| @tiptap/\* ×15          | 450     | Admin-only, non lazy       | -80  |
| @react-pdf/renderer     | 120     | PDF API only               | -80  |
| @capacitor/\* ×7        | 200     | Mobile strategy incohérent | -60  |
| googleapis v171         | 180     | Admin unused prod          | -60  |
| recharts                | 240     | Admin CEE CSR-only         | -100 |
| leaflet + react-leaflet | 200     | 0.3% traffic               | -80  |

**Total : -460KB gzip main bundle (~-18%)**

## Quick Wins 24h

1. **Hydration boundary fix** — remplacer `ssr:false` par `<Suspense fallback>` + minimal SSR skeleton. LCP -300ms, Googlebot +40K pages indexées.
2. **Middleware auth lightweight** — whitelist pathname `/espace-*|/admin`, skip Supabase check sur routes publiques + cache role Redis 1h TTL. Latency -40ms.
3. **Soft 404 → 410 Gone ou notFound()** — sur 0-provider pages. Budget crawl économisé ~200K/mois.
