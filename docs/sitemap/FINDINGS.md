# FINDINGS — Audit Sitemap Reliability v3 → v4

> Date: 2026-02-24 | Auditeur: Big 4 IT Audit + Principal SRE + Google Technical SEO | Scope: sitemap infrastructure complète

---

## Résumé

Audit forensique post Reliability Pack v3.
Baseline v3: 12 SLOs documentés, audit script v3, 2 CI workflows (nightly + post-deploy), 120 tests Vitest, validate v2, runbooks, FINDINGS v3.

Cet audit v4 a identifié **15 écarts** dont 4 CRITIQUE, 5 MAJEUR, 4 MODÉRÉ, 2 MINEUR — résidus non détectés lors des revues v1→v3.

---

## Écarts classés — Audit v3 (F-01 à F-18)

Les 18 écarts identifiés dans l'audit v2→v3 restent remédiés. Voir historique ci-dessous.

<details>
<summary>Historique écarts v3 (F-01 à F-18) — tous remédiés</summary>

| ID | Sévérité | Écart | Statut |
|----|----------|-------|--------|
| F-01 | CRITIQUE | Aucun SLO formalisé | Remédié v3 |
| F-02 | CRITIQUE | Pas de vérification taille XML | Remédié v3 |
| F-03 | CRITIQUE | Pas de forensics JSON | Remédié v3 |
| F-04 | MAJEUR | Pas de nightly audit --all | Remédié v3 |
| F-05 | MAJEUR | Pas de post-deploy audit | Remédié v3 |
| F-06 | MAJEUR | Pas de runbooks opérationnels | Remédié v3 |
| F-07 | MAJEUR | Pas de tests chaos/failure-mode | Remédié v3 |
| F-08 | MAJEUR | p99 latency non mesurée | Remédié v3 |
| F-09 | MODÉRÉ | Pas de delta entre runs | Remédié v3 |
| F-10 | MODÉRÉ | Empty sitemap rate non trackée | Remédié v3 |
| F-11 | MODÉRÉ | validate-built-sitemaps.mjs incomplet | Remédié v3 |
| F-12 | MODÉRÉ | Cache headers non vérifiés | Remédié v3 |
| F-13 | MINEUR | Pas de --json pour validate | Remédié v3 |
| F-14 | MINEUR | console.log dupliqué | Remédié v3 |
| F-15 | MINEUR | Pas de --out pour audit | Remédié v3 |
| F-16 | INFO | XML vide en cas d'erreur DB | Intentionnel |
| F-17 | INFO | Pas d'APM temps-réel | Accepté |
| F-18 | INFO | Workflow reliability non modifié | Intentionnel (v3) |

</details>

---

## Écarts v4 (F-19 à F-33)

### CRITIQUE

| ID | Écart | Preuve | Impact prod | Remédiation |
|----|-------|--------|-------------|-------------|
| F-19 | **5/12 SLOs documentés mais NON appliqués automatiquement** — SLO-01 (index availability), SLO-03 (XML validity), SLO-04 (Content-Type), SLO-08 (provider dropped ratio), SLO-11 (index↔children coherence) absents de `checkSloViolations()` | `tools/audit-sitemaps.mjs:205-294` — seuls SLO-02/05/06/07/09/10/12 sont vérifiés | Fausse confiance : les rapports affichent `sloViolations: []` même si des SLOs non vérifiés sont violés | **Remédié v4**: ajout des 5 SLOs manquants dans `checkSloViolations()` avec seuils du SLO-SLA.md |
| F-20 | **Erreurs Supabase silencieusement avalées** dans sitemap-index — `if (!error && count > 0)` tombe dans le else sans logging quand Supabase retourne `{error: {...}, count: null}` | `src/app/api/sitemap-index/route.ts:28-30` — seules les exceptions thrown sont loggées (catch L31), pas les erreurs de query | En cas de panne Supabase partielle, le sitemap index omet silencieusement les provider sitemaps sans aucune trace dans les logs | **Remédié v4**: logging explicite quand `error` est non-null avec code, message, details |
| F-21 | **CI audit step no-op** — `continue-on-error: true` sans fail gate = le job est toujours vert | `.github/workflows/sitemap-reliability.yml:100` — `continue-on-error: true` | Un audit échouant ne bloque jamais le merge. Zéro gate en CI sur la qualité sitemap runtime. | **Remédié v4**: remplacé par `|| true` + parsing `pass` + step `Fail if audit failed` |
| F-22 | **Tests failure-modes (65 tests) non exécutés en CI** — seul `sitemap-manifest.test.ts` est référencé | `.github/workflows/sitemap-reliability.yml:50` — `npx vitest run __tests__/lib/seo/sitemap-manifest.test.ts` uniquement | 65 tests failure-mode écrits en v3 ne sont jamais exécutés en CI, réduisant la couverture effective de 55% | **Remédié v4**: ajout de `npx vitest run __tests__/lib/seo/sitemap-failure-modes.test.ts` au workflow |

### MAJEUR

| ID | Écart | Preuve | Impact prod | Remédiation |
|----|-------|--------|-------------|-------------|
| F-23 | **isWellFormedXml tolère off-by-one tag imbalance** — `Math.abs(netOpen - closeTags.length) > 1` accepte ±1 tag manquant | `tools/audit-sitemaps.mjs:144` (v3) | Un sitemap avec un tag non fermé passe la validation. Le root element avec attributs n'était pas matché par le regex open tag | **Remédié v4**: regex corrigé pour matcher les tags avec attributs, tolérance réduite à exactement 0 |
| F-24 | **Open tag regex ne matche pas les éléments racine avec attributs** — `<urlset xmlns="...">` ignoré par `/<[a-zA-Z][^/>\s]*[^/]?>/g` | `tools/audit-sitemaps.mjs:145` (v3) — `[^/>\s]*` stoppe au premier espace | Le workaround `> 1` dans F-23 masquait ce bug. Les root elements ne sont jamais comptés dans openTags. | **Remédié v4**: regex remplacé par `/<[a-zA-Z][^>]*>/g` avec filtrage programmatique self-closing vs open |
| F-25 | **Anti-regression regex bypassable par indentation** — `^const PROVIDER_BATCH_SIZE\b` (flag `m`) ne matche que colonne 0 | `__tests__/lib/seo/sitemap-manifest.test.ts:374`, `sitemap-failure-modes.test.ts:329`, `validate-built-sitemaps.mjs:191,210` | Un `const PROVIDER_BATCH_SIZE = 999` à l'intérieur d'une fonction (indenté) passerait les tests anti-régression | **Remédié v4**: regex mis à jour vers `^\s*(const\|let\|var)\s+` dans les 3 fichiers |
| F-26 | **fetchWithTimeout sans retry** — un timeout réseau unique = échec définitif | `tools/audit-sitemaps.mjs:112-120` (v3) | En cas de flap réseau, le sitemap est marqué FAIL. Le nightly audit peut échouer sur un blip transitoire. | **Remédié v4**: retry avec backoff exponentiel (1s, 2s) et 2 retries max |
| F-27 | **Nightly baseline sauvegardée même sur échec** — `if: always()` propage un rapport FAIL comme baseline | `.github/workflows/sitemap-nightly-audit.yml:138` | Un échec nightly contamine la baseline suivante. Le delta calcule alors des "resolvedFailures" faux positifs. | **Remédié v4**: baseline sauvegardée uniquement `if: steps.audit.outputs.pass == 'true'` |

### MODÉRÉ

| ID | Écart | Preuve | Impact prod | Remédiation |
|----|-------|--------|-------------|-------------|
| F-28 | **Erreur pagination provider silencieuse** — `if (error \|\| !data) break` retourne des données partielles sans log | `src/app/api/sitemap-providers/route.ts:197` | En cas d'erreur mid-pagination, un sitemap provider avec données partielles est caché 1h sans aucune trace | **Remédié v4**: logging explicite de l'erreur avec code/message/batchIndex/pageFrom avant break |
| F-29 | **Log level `warn` pour succès** dans sitemap-index | `src/app/api/sitemap-index/route.ts:38` — `sitemapLog.warn('sitemap-index generated', ...)` | Pollution des alertes warn avec des messages de succès, réduit le signal/bruit des vrais warnings | **Remédié v4**: changé en `sitemapLog.info()` |
| F-30 | **Audit script v3 header version** non incrémentée — header docstring dit "v3" mais aucun versioning sémantique visible | `tools/audit-sitemaps.mjs:1-27` | Impossible de distinguer entre versions du script dans les rapports | **Remédié v4**: version bumped à `4.0.0` |
| F-31 | **SLO-07 ne distingue pas static vs provider** — l'empty rate est calculé sur tous les sitemaps testés | `tools/audit-sitemaps.mjs:243-253` | Un sitemap statique (cities, devis, etc.) vide serait un vrai bug mais ne déclencherait l'alerte qu'au-delà de 5%, mélangé avec les providers | **Noté** — amélioration future, pas critique car le 5% threshold couvre le cas nominal |

### MINEUR

| ID | Écart | Preuve | Impact prod | Remédiation |
|----|-------|--------|-------------|-------------|
| F-32 | **parseInt sans radix dans sitemap.ts** — `parseInt(id.split('-').pop()!)` omet le radix 10 | `src/app/sitemap.ts:321` | Risque théorique (IDs commençant par 0 interprétés en octal dans certains engines) — non exploitable en pratique | **Noté** — impact nul avec les IDs actuels |
| F-33 | **Pas de validation de range sur batchIndex** dans provider route | `src/app/api/sitemap-providers/route.ts:177` — accepte tout integer positif | Une requête `/sitemap/providers-999999.xml` retourne un sitemap vide (pas de données pour ce range) — comportement correct mais inutilement permissif | **Noté** — comportement gracieux, pas d'impact |

---

## Résumé quantitatif v4

| Sévérité | Count | Remédiés |
|----------|-------|----------|
| CRITIQUE | 4 | 4 |
| MAJEUR | 5 | 5 |
| MODÉRÉ | 4 | 3 (1 noté) |
| MINEUR | 2 | 0 (2 notés) |
| **Total v4** | **15** | **12 remédiés** |

Écarts résiduels: **3** (F-31 noté, F-32 noté, F-33 noté) — impact négligeable, remédiation optionnelle.

---

## Avant / Après chiffré

| Métrique | v3 (avant) | v4 (après) | Delta |
|----------|-----------|-----------|-------|
| SLOs automatiquement enforced | 7/12 (58%) | 12/12 (100%) | +5 |
| Tests en CI (Vitest) | 55 | 120 | +65 |
| Anti-regression regex coverage | column-0 only | any indentation | +robuste |
| Audit script XML tag detection | off-by-one toléré | exact match | +précis |
| CI audit gate | no-op (continue-on-error) | fail-on-error | +bloquant |
| Fetch resilience | 0 retry | 2 retries + backoff | +résilient |
| Supabase error logging | exceptions only | query errors + exceptions | +observable |
| Nightly baseline integrity | always saved | saved on success only | +fiable |
| Provider pagination observability | silent break | explicit error log | +traçable |
| Audit script version | 3.0.0 | 4.0.0 | +1 major |

---

## Score par pilier (0-10)

| Pilier | v3 | v4 | Justification v4 |
|--------|----|----|-------------------|
| Protocol / XML Compliance | 8 | 9 | isWellFormedXml corrigé, tag matching exact |
| Cache / CDN | 8 | 8 | Inchangé (correct) |
| DB / Data Resilience | 6 | 8 | Supabase error logging, pagination error tracking |
| Test Quality | 7 | 9 | 120 tests en CI vs 55, regex anti-regression renforcé |
| Observability / SRE | 6 | 9 | 12/12 SLOs enforced, log levels corrigés |
| CI / CD | 5 | 8 | Audit gate bloquant, failure-modes en CI, baseline fiable |
| Performance / Scalability | 8 | 8.5 | Retry avec backoff |
| Security | 8 | 8 | Inchangé (correct) |
| Documentation | 9 | 9.5 | FINDINGS v4 complet, preuve par fichier+ligne |
| Operational Readiness | 7 | 9 | Runbooks + SLO enforcement complet |
| **Global** | **7.2** | **8.6** | **+1.4 points** |
