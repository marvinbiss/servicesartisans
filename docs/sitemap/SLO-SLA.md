# Sitemap SLO / SLA — ServicesArtisans

> Version: 1.0 | Date: 2026-02-24 | Owner: SRE

---

## 1. Objectifs

Garantir que Google et tous les moteurs de recherche peuvent **toujours** crawler nos sitemaps sans erreur, sans perte de couverture, et dans des délais acceptables.

---

## 2. SLO chiffrés

| ID | Indicateur | Seuil SLO | Warning | Critical | Mesure |
|----|-----------|-----------|---------|----------|--------|
| SLO-01 | **Index Availability** — `/sitemap.xml` retourne HTTP 200 | 99.9% (rolling 30d) | < 99.95% | < 99.9% | audit HTTP status |
| SLO-02 | **Child 200 Rate** — chaque `<loc>` enfant retourne HTTP 200 | 99.5% | < 99.8% | < 99.5% | audit --all |
| SLO-03 | **XML Validity Rate** — XML bien formé (entities, tags) | 100% | 1 sitemap invalide | 1 sitemap invalide | isWellFormedXml() |
| SLO-04 | **Content-Type Correctness** — `application/xml` ou `text/xml` | 100% | 1 mauvais CT | 1 mauvais CT | audit --strict |
| SLO-05 | **p95 Latency** — temps de réponse sitemap (CDN inclus) | < 2 000 ms | > 1 500 ms | > 2 000 ms | audit latencyMs |
| SLO-06 | **p99 Latency** — pire cas | < 5 000 ms | > 3 000 ms | > 5 000 ms | audit latencyMs |
| SLO-07 | **Empty Sitemap Rate** — sitemaps avec 0 URLs | 0% (static) / < 5% (providers) | > 0% (static) | > 5% (providers) | urlCount === 0 |
| SLO-08 | **Provider Dropped Ratio** — providers non mappés/service/ville | < 10% | > 8% | > 10% | droppedProviders / providersQueried |
| SLO-09 | **Google 50k Compliance** — URLs par sitemap | 100% ≤ 50 000 | 1 dépassement | 1 dépassement | urlCount check |
| SLO-10 | **XML Size Limit** — taille non compressée par sitemap | < 50 MB | > 40 MB | > 50 MB | sizeBytes check |
| SLO-11 | **Index ↔ Children Coherence** — chaque `<loc>` de l'index résolvable | 100% | 1 enfant 404 | 1 enfant 404 | cross-check index vs children |
| SLO-12 | **Sitemap Count Stability** — delta sitemaps entre runs | variation < 10% | variation > 10% | variation > 25% | delta comparison |

---

## 3. Fenêtres de mesure

| Fréquence | Mode | Déclencheur | Script |
|-----------|------|-------------|--------|
| **Post-deploy** | `--sample 50 --strict --json` | push master / merge PR | `.github/workflows/sitemap-post-deploy-audit.yml` |
| **Nightly** | `--all --strict --json` | cron 03:00 UTC | `.github/workflows/sitemap-nightly-audit.yml` |
| **Ad-hoc** | CLI local | humain | `node tools/audit-sitemaps.mjs` |

---

## 4. Critères FAIL CI

Le CI **échoue** (exit code 1) si au moins un de ces critères est vrai :

| Critère | Applicable à |
|---------|-------------|
| 1 sitemap retourne HTTP != 200 | post-deploy, nightly |
| 1 sitemap a du XML invalide | post-deploy, nightly |
| 1 sitemap dépasse 50 000 URLs | post-deploy, nightly |
| 1 sitemap dépasse 50 MB non compressé | nightly |
| Content-Type non XML (mode `--strict`) | post-deploy, nightly |
| p95 latency > 2 000 ms | nightly |
| Empty sitemap rate > 5% (providers) | nightly |
| Delta children count > 25% vs run précédent | nightly (si baseline disponible) |

---

## 5. Format de sortie JSON (machine-readable)

```jsonc
{
  "pass": true,
  "version": "3.0.0",
  "timestamp": "2026-02-24T03:00:00.000Z",
  "gitSha": "abc1234",
  "targetUrl": "https://servicesartisans.fr/sitemap.xml",
  "mode": "all",
  "seed": null,
  "concurrency": 10,
  "resultHash": "sha256:...",
  "stats": {
    "tested": 142,
    "totalChildSitemaps": 142,
    "passed": 142,
    "failed": 0,
    "successRate": "100.0%",
    "totalUrls": 37000,
    "emptySitemaps": 0,
    "emptySitemapRate": "0.0%",
    "latency": { "min": 45, "avg": 120, "p95": 350, "max": 800 },
    "responseSize": { "minKB": "1.2", "avgKB": "85.3", "maxKB": "4200.0", "maxBytes": 4300800 },
    "urlsPerSitemap": { "min": 50, "avg": 260, "max": 5000 },
    "failures": [],
    "sloViolations": []
  },
  "delta": {
    "baselineFile": "sitemap-audit-baseline.json",
    "childCountDelta": 0,
    "childCountDeltaPct": "0.0%",
    "newFailures": [],
    "resolvedFailures": [],
    "latencyDeltaAvgMs": -5
  }
}
```

---

## 6. Escalade

| Niveau | Condition | Action |
|--------|-----------|--------|
| **P3 — Info** | Warning SLO, pas de Critical | Log + ticket backlog |
| **P2 — Majeur** | 1 Critical SLO violé, coverage > 95% | Alerte Slack #sre + investigation < 4h |
| **P1 — Critique** | Index 404 ou > 5% enfants KO | Alerte Slack #incidents + hotfix < 1h |
| **P0 — Incident** | sitemap.xml inaccessible > 15 min | Escalade CTO + rollback Vercel immédiat |

---

## 7. Limitations connues & décisions

| Décision | Justification |
|----------|--------------|
| Provider sitemaps retournent XML vide (200) en cas d'erreur DB | Évite les 404/500 que Google pénalise. Un sitemap vide est ré-crawlé sans dommage. |
| Provider sitemaps utilisent une table pré-calculée (`provider_sitemap_urls`) | Élimine la pagination OFFSET et la résolution de slugs runtime. Fast path p95 < 500ms. Legacy fallback si table vide. |
| Pas de monitoring temps-réel (APM) sur les routes sitemap | Les sitemaps sont CDN-cached (1h). Le monitoring nightly --all suffit pour la fréquence de crawl Google (~1/jour). |
| Taille XML max soft-limit à 50 MB | Google accepte jusqu'à 50 MB non compressé. Au-delà, on split. |
| Pas d'alerte sur le nombre total d'URLs | Le nombre varie naturellement avec les providers. Seul le delta anormal est alerté. |
