# FINDINGS — Audit Sitemap Reliability v2 → v3

> Date: 2026-02-24 | Auditeur: SRE + Big 4 IT Audit | Scope: sitemap infrastructure complète

---

## Résumé

Audit de l'infrastructure sitemap post Reliability Pack v2.
Baseline v2: manifest single source of truth, 55 tests Vitest, audit script v2, CI 3-jobs, observabilité runtime basique.

---

## Écarts classés

### CRITIQUE

| ID | Écart | Impact | Remédiation |
|----|-------|--------|-------------|
| F-01 | **Aucun SLO formalisé** — pas de seuils chiffrés, pas de critères FAIL CI sur latence/taux d'erreur | Impossible de détecter une dégradation progressive. Pas de base contractuelle pour alerting. | Livré: `docs/sitemap/SLO-SLA.md` avec 12 SLOs chiffrés, seuils warning/critical, critères FAIL CI. |
| F-02 | **Pas de vérification taille XML** — le script d'audit ne vérifiait que le count URLs (50k) mais pas la taille en bytes (Google limite à 50 MB non compressé) | Un sitemap avec des URLs très longues pourrait dépasser 50 MB sans dépasser 50k URLs | Livré: audit v3 vérifie `sizeBytes > 50MB`, test failure-mode D5. |
| F-03 | **Pas de forensics sur les rapports JSON** — pas de timestamp, git SHA, hash de résultat, ni de delta entre runs | Impossible de tracer un incident, comparer deux runs, ou prouver la conformité | Livré: audit v3 ajoute `timestamp`, `gitSha`, `resultHash`, `delta`, `version`, `mode`, `seed`. |

### MAJEUR

| ID | Écart | Impact | Remédiation |
|----|-------|--------|-------------|
| F-04 | **Pas de nightly audit --all** — seul un audit post-merge sur master avec `--sample 50` existait | 50 sitemaps sur 140+ = couverture 35%. Des régressions sur les sitemaps non-échantillonnés passent inaperçues. | Livré: `.github/workflows/sitemap-nightly-audit.yml` en mode `--all --strict --slo`. |
| F-05 | **Pas de post-deploy audit** — aucune vérification automatique après deploy | Un deploy cassant les sitemaps n'est détecté que par Google (jours de délai) | Livré: `.github/workflows/sitemap-post-deploy-audit.yml` déclenché sur push master. |
| F-06 | **Pas de runbooks opérationnels** — procédures de résolution non documentées | Temps de résolution allongé, dépendance aux personnes | Livré: `docs/sitemap/RUNBOOKS.md` avec 6 runbooks (symptômes, diagnostic, actions, rollback, validation, escalade). |
| F-07 | **Pas de tests chaos/failure-mode** — seuls des tests happy-path existaient | Pas de confiance sur le comportement en cas d'erreur DB, XML invalide, etc. | Livré: `__tests__/lib/seo/sitemap-failure-modes.test.ts` avec 7 suites de tests failure-mode. |
| F-08 | **p99 latency non mesurée** — le script v2 ne calculait que p95 | p99 est le vrai indicateur de queue latency pour Google | Livré: audit v3 calcule et expose `latency.p99`. |

### MODÉRÉ

| ID | Écart | Impact | Remédiation |
|----|-------|--------|-------------|
| F-09 | **Pas de comparaison delta entre runs** — chaque run est indépendant | Impossible de détecter une régression progressive (drift du count, nouvelles failures) | Livré: audit v3 `--baseline` avec delta: childCountDelta, totalUrlsDelta, newFailures, resolvedFailures. |
| F-10 | **Empty sitemap rate non trackée** — les sitemaps avec 0 URLs passaient comme "OK" | Un provider sitemap vide est légal (fallback DB error) mais un taux élevé indique un problème | Livré: `emptySitemaps` + `emptySitemapRate` dans stats. SLO-07 alerte si > 5%. |
| F-11 | **validate-built-sitemaps.mjs incomplet** — ne vérifiait pas Content-Type source, s-maxage, fallback XML, ni les 3 exports manifest | Faux négatifs possibles sur des régressions subtiles | Livré: validate v2 avec 24 checks (vs 16 avant), vérifie CT, s-maxage, fallback, tous les exports. |
| F-12 | **Cache headers non vérifiés par l'audit** — pas de vérification que `s-maxage` est présent | Un sitemap sans CDN caching génère du load Vercel + latence Google | Livré: audit v3 track `hasSMaxAge` + compteur `missingCacheHeaders`. |

### MINEUR

| ID | Écart | Impact | Remédiation |
|----|-------|--------|-------------|
| F-13 | **Pas de sortie --json pour validate-built-sitemaps.mjs** | Pas intégrable dans un pipeline CI machine-readable | Livré: flag `--json` ajouté. |
| F-14 | **Ligne console.log dupliquée** dans audit v2 (ligne 312-313 : latency affichée deux fois) | Bug cosmétique d'affichage | Corrigé dans audit v3. |
| F-15 | **Pas de flag --out pour écrire le rapport dans un fichier** | Obligé de rediriger stdout, ce qui rend verbose le CI | Livré: `--out report.json` dans audit v3. |

### INFO

| ID | Observation | Décision |
|----|-------------|----------|
| F-16 | Provider sitemaps retournent XML vide (200) en cas d'erreur DB | **Intentionnel**. Documenté dans SLO-SLA.md §7 et RUNBOOKS.md RB-03. Un sitemap vide est mieux qu'un 500 pour Google. |
| F-17 | Pas de monitoring APM temps-réel sur les routes sitemap | **Accepté**. Les sitemaps sont CDN-cached (1h). Le monitoring nightly `--all` couvre la fréquence de crawl Google. |
| F-18 | Le workflow `sitemap-reliability.yml` existant n'est pas modifié | **Intentionnel**. Il couvre les tests Vitest + validation source sur PR. Les nouveaux workflows couvrent post-deploy + nightly. Pas de duplication. |

---

## Résumé quantitatif

| Sévérité | Count | Remédiés |
|----------|-------|----------|
| CRITIQUE | 3 | 3 |
| MAJEUR | 5 | 5 |
| MODÉRÉ | 4 | 4 |
| MINEUR | 3 | 3 |
| INFO | 3 | N/A |
| **Total** | **18** | **15 remédiés** |

Écarts résiduels: **0** (tous remédiés dans ce patchset).
