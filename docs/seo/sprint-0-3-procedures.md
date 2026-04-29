# Sprint 0.3 — Procédures opérationnelles (Phase 0 ULTRA DOMINATION SEO)

Date : 2026-04-29
Owner : Marvin (cofondateur tech)
Scope : 3 actions code livrées + 2 actions humaines GSC + 1 audit live optionnel.

---

## 1. ETag / 304 Not Modified — gain budget crawl

### État

| Sitemap                       | ETag            | 304             | Last-Modified                   |
| ----------------------------- | --------------- | --------------- | ------------------------------- |
| `/api/sitemap-index`          | ✅              | ✅              | ✅                              |
| `/api/sitemap-providers?id=N` | ✅              | ✅              | ✅ (latest provider updated_at) |
| `/api/sitemap-recent`         | ✅              | ✅              | ✅ (max lastmod URLs)           |
| `/news-sitemap.xml`           | ✅ (Sprint 0.3) | ✅ (Sprint 0.3) | ✅                              |
| `/image-sitemap.xml`          | ✅ (Sprint 0.3) | ✅ (Sprint 0.3) | ✅                              |

Tous les sitemaps passent par `src/lib/seo/sitemap-headers.ts` qui :

- Calcule un `ETag` SHA-256 (16 hex chars) sur le body XML.
- Lit `If-None-Match` (préféré) puis `If-Modified-Since` (fallback ±1s).
- Renvoie `304 Not Modified` quand match → Google ne retélécharge pas.

### Mesure

Vercel logs runtime → grep `[metric] sitemap-providers emitted` et
compteur `304` côté CDN. Cible J+30 : ratio 304/200 ≥ 0.5 sur les sitemap
providers (aujourd'hui : 0, attendu après recrawl Google ~8 jours).

---

## 2. Tier-up sitemap (déjà en place)

| Constante                  | Valeur         | Source                            |
| -------------------------- | -------------- | --------------------------------- |
| `STATIC_BATCH`             | 8 000          | sitemap-config.ts                 |
| `LARGE_BATCH`              | 20 000         | sitemap-config.ts                 |
| `PROVIDER_BATCH_SIZE`      | 20 000         | sitemap-config.ts                 |
| `MAX_PROVIDER_SITEMAPS`    | 200            | sitemap-config.ts (cap = 4M URLs) |
| `SITEMAP_CITY_COUNT`       | 2 267 (Tier 1) | full villes                       |
| `SITEMAP_CITY_COUNT_TIER2` | 500            | top villes pour avis / problèmes  |

Aucun sitemap > 30 000 URLs en sortie → headroom Google 50K/file confortable.
RPC `get_provider_sitemap` (migration 457) garantit un snapshot atomique
au-delà de la limite PostgREST `max-rows=50000`.

---

## 3. Audit soft 404 prod live

Script : `scripts/audit-soft-404-prod.mjs`

### Usage

```bash
# Audit standard (≈30s)
BASE_URL=https://servicesartisans.fr node scripts/audit-soft-404-prod.mjs

# JSON pour CI / GSC dashboard
BASE_URL=https://servicesartisans.fr node scripts/audit-soft-404-prod.mjs --json > audit-soft-404-$(date +%F).json

# Strict (fail CI si symptôme bloquant)
BASE_URL=https://servicesartisans.fr node scripts/audit-soft-404-prod.mjs --strict
```

### Symptômes détectés (échantillon stratifié 100 URLs)

| Catégorie                                        | Niveau | Action si détecté                                     |
| ------------------------------------------------ | ------ | ----------------------------------------------------- |
| `soft_404_marker` (texte "Aucun X / 0 résultat") | 🔴 P0  | Ajouter `notFound()` ou `robots:noindex` conditionnel |
| `server_error` (HTTP 5xx)                        | 🔴 P0  | Investigate Vercel logs                               |
| `noindex_in_sample` (sitemap déclare noindex)    | 🟡 P1  | Cross-check sitemap.ts vs metadata page               |
| `redirect_chain` > 3 sauts                       | 🟡 P1  | Aplatir vers redirect direct                          |
| `slow_response` > 3000 ms                        | 🟢 P2  | Vérifier ISR + cache headers                          |
| `thin_body` < 5KB                                | 🟢 P2  | Enrichir contenu (souvent OK pour utilitaires)        |
| `no_h1`                                          | 🟢 P2  | Vérifier que le H1 n'est pas conditionné              |

### Cadence

À lancer manuellement après chaque sprint et 2× par semaine en attente de
GSC URL Inspection batch. À CI-fier seulement quand le baseline est ≤ 5
issues persistantes.

---

## 4. Disavow GSC — upload manuel

Fichier prêt : `docs/seo/disavow-2026-04-20.txt` (45 domaines, 51 backlinks).

### Procédure (Marvin)

1. Ouvrir : <https://search.google.com/search-console/disavow-links>
2. Sélectionner la propriété `https://servicesartisans.fr/` (apex sans www).
3. **Important** : si un fichier disavow existe déjà, télécharger l'actuel
   et merger manuellement avant upload — Google REMPLACE le fichier
   complet à chaque upload, il ne fusionne pas.
4. Cliquer "Disavow links" → "Upload disavow file".
5. Uploader `docs/seo/disavow-2026-04-20.txt`.
6. Confirmer.

### Cadence

Régénérer après chaque audit Ahrefs (mensuel) :

```bash
npx tsx scripts/generate-disavow-2026-04.ts
# → docs/seo/disavow-YYYY-MM-DD.txt
```

Toujours review manuel des `[PRESERVE]` listés dans la sortie : un faux
positif disavow tue un backlink légitime.

---

## 5. Baseline GSC — capture J+0 / J+7 / J+14 / J+30

Script : `scripts/seo/baseline-snapshot.ts`

### Procédure (Marvin)

GSC ne s'extrait pas via MCP (limite quota + bug régulier). Workflow manuel :

1. GSC → Performance → Search results → Filter date = "Last 7 days".
2. Onglet "Pages" → cocher "Include impressions = 0" off → Export CSV.
3. Renommer le fichier en `data/seo/baseline-YYYY-MM-DD.csv`.
4. Lancer la normalization :
   ```bash
   npx tsx scripts/seo/baseline-snapshot.ts data/seo/baseline-YYYY-MM-DD.csv
   ```
5. Le script écrit :
   - `data/seo/baseline-YYYY-MM-DD.csv` (immutable, sorted)
   - `data/seo/baseline-YYYY-MM-DD.summary.md` (top 50 + KPI)
   - `data/seo/baseline-YYYY-MM-DD.sha256` (tamper detection)

### Cadence Phase 0

| Snapshot     | Date cible                            | Cible / Gate                                    |
| ------------ | ------------------------------------- | ----------------------------------------------- |
| J+0 baseline | 2026-04-22 (déjà capturé, à enrichir) | Reference                                       |
| J+7          | 2026-05-06                            | +5-10 % clics Sprint 0.1+0.2                    |
| J+14         | 2026-05-13                            | +20-30 % clics                                  |
| J+30         | 2026-05-29                            | **Gate P0 : +50 % clics** (sinon retour plan B) |

### Comparaison entre snapshots

À coder en Sprint 0.5 (G-OPS-1) :

```bash
npx tsx scripts/seo/compare-baseline.ts \
  data/seo/baseline-2026-04-22.csv \
  data/seo/baseline-2026-05-06.csv
```

---

## 6. État Sprint 0.3 — checklist

- [x] news-sitemap.xml migré vers `sitemapHeaders()` (ETag + 304)
- [x] image-sitemap.xml migré vers `sitemapHeaders()` (ETag + 304)
- [x] Script `scripts/audit-soft-404-prod.mjs` (échantillon 100 URLs prod)
- [x] Doc `docs/seo/sprint-0-3-procedures.md` (ce fichier)
- [ ] **Marvin** : upload `disavow-2026-04-20.txt` → GSC
- [ ] **Marvin** : capture baseline J+0 réelle (CSV GSC) → `data/seo/`
- [ ] **Marvin** : 1er run `audit-soft-404-prod.mjs` post-deploy

---

## 7. Suite

Sprint 0.4 (J+10) : G-CRIT-1 cron Vercel filesystem read-only → migrer
export dataset RGE vers Supabase Storage. Hors scope Sprint 0.3.

Sprint 0.5 (J+14) : G-OPS-1 `compare-baseline.ts` + activate canary
fingerprint cron. Dépend de la baseline J+0 réelle (action 5 ci-dessus).
