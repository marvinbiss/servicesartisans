# TESTPLAN — Sitemap Reliability v4

> Date: 2026-02-24 | Scope: validation de tous les livrables v3 + remédiations v4

---

## 1. Tests Vitest locaux

### 1a. Tests manifest (55 tests)

```bash
npx vitest run __tests__/lib/seo/sitemap-manifest.test.ts
```

**Critère PASS**: 55/55 tests pass, exit code 0.

### 1b. Tests failure-mode (65 tests)

```bash
npx vitest run __tests__/lib/seo/sitemap-failure-modes.test.ts
```

**Critère PASS**: tous les tests pass, exit code 0.

**Suites couvertes:**
- D1: XML special characters (14 tests) — escaping & < > " ', accents, double-encoding, idempotence
- D2: Provider fallback XML (4 tests) — empty XML wellformedness, source code assertion
- D3: Simulated DB errors (4 tests) — 0 providers, graceful degradation
- D4: Index ↔ children coherence (5 tests) — mock index, contiguité IDs, superset check
- D5: Google guardrails size/count (8 tests) — 50k limit, batch sizes, theoretical max
- D6: Anti-regression imports (14 tests) — imports manifest, no local consts, logger, CT, cache
- D7: XML generation edge cases (3 tests) — dangerous URLs, empty urlset, accents

### 1c. Tous les tests ensemble

```bash
npx vitest run __tests__/lib/seo/
```

**Critère PASS**: 120/120 tests pass, exit code 0.

---

## 2. Validation source (validate-built-sitemaps.mjs v2)

### 2a. Sans build (source-only checks)

```bash
node tools/validate-built-sitemaps.mjs
```

**Critère PASS**: section "Source Consistency" 100% green. La section "Infrastructure" peut échouer si `.next` n'existe pas (normal).

### 2b. Avec build

```bash
npm run build && node tools/validate-built-sitemaps.mjs
```

**Critère PASS**: 24/24 checks pass, exit code 0.

### 2c. Sortie JSON

```bash
node tools/validate-built-sitemaps.mjs --json
```

**Critère PASS**: sortie JSON valide avec `"pass": true` (si source checks OK).

---

## 3. Audit script v4

### 3a. Mode sample (rapide)

```bash
node tools/audit-sitemaps.mjs --sample 10 --seed 42
```

**Critère PASS**: exit code 0, affichage lisible, stats latence/taille/URLs.

### 3b. Mode JSON

```bash
node tools/audit-sitemaps.mjs --sample 10 --seed 42 --json
```

**Critère PASS**: sortie JSON valide contenant: `version` (4.0.0), `timestamp`, `gitSha`, `resultHash`, `stats.latency.p99`, `stats.emptySitemaps`, `stats.xmlInvalid`, `stats.contentTypeBad`, `stats.responseSize.maxBytes`.

### 3c. Mode strict

```bash
node tools/audit-sitemaps.mjs --sample 10 --strict --json
```

**Critère PASS**: vérifie Content-Type XML en plus des checks standard.

### 3d. Mode SLO

```bash
node tools/audit-sitemaps.mjs --sample 10 --slo --json
```

**Critère PASS**: `stats.sloViolations` présent (tableau, possiblement vide). 12/12 SLOs vérifiés (SLO-01 à SLO-12). Si violations, `pass: false`.

### 3e. Delta avec baseline

```bash
# Générer une baseline
node tools/audit-sitemaps.mjs --sample 10 --seed 42 --json --out /tmp/baseline.json

# Comparer
node tools/audit-sitemaps.mjs --sample 10 --seed 42 --json --baseline /tmp/baseline.json
```

**Critère PASS**: champ `delta` présent dans la sortie avec `childCountDelta`, `totalUrlsDelta`, `newFailures`, `resolvedFailures`, `latencyDeltaAvgMs`.

### 3f. Flag --out

```bash
node tools/audit-sitemaps.mjs --sample 5 --json --out /tmp/report.json
cat /tmp/report.json
```

**Critère PASS**: fichier `/tmp/report.json` créé et parsable.

### 3g. Mode all (complet — prend plus de temps)

```bash
node tools/audit-sitemaps.mjs --all --strict --slo --json
```

**Critère PASS**: tous les sitemaps testés, exit code 0 si 100% pass + SLO respectés.

---

## 4. CI Workflows (validation manuelle ou simulation)

### 4a. sitemap-reliability.yml (modifié v4)

**Déclencheur**: push sur master ou claude/** touchant les fichiers sitemap.
**Vérifie**: Vitest manifest tests + failure-mode tests + source validation + audit staging (fail-on-error).

### 4b. sitemap-post-deploy-audit.yml (nouveau)

**Déclencheur**: push sur master/main.
**Vérifie**: `--sample 50 --seed 42 --strict --slo`.
**Critère PASS**: artifact `sitemap-post-deploy-report-<sha>` uploadé, job summary lisible, exit code 0 si pass.

### 4c. sitemap-nightly-audit.yml (nouveau)

**Déclencheur**: cron 03:00 UTC ou workflow_dispatch.
**Vérifie**: `--all --strict --slo --baseline <previous>`.
**Critère PASS**: artifact `sitemap-nightly-report` uploadé, baseline sauvegardée **uniquement si pass**, job summary avec tableau métriques + delta, exit code 0 si pass.

---

## 5. Documentation

### 5a. SLO-SLA.md

**Critère PASS**: fichier `docs/sitemap/SLO-SLA.md` existe, contient 12 SLOs numérotés SLO-01 à SLO-12, seuils warning/critical, critères FAIL CI, format JSON documenté, escalade 4 niveaux.

### 5b. RUNBOOKS.md

**Critère PASS**: fichier `docs/sitemap/RUNBOOKS.md` existe, contient 6 runbooks (RB-01 à RB-06), chacun avec: Symptômes, Diagnostic (commandes exactes), Hypothèses, Actions, Rollback/Hotfix, Validation post-fix, Escalade.

### 5c. FINDINGS.md

**Critère PASS**: fichier `docs/sitemap/FINDINGS.md` existe, contient écarts classés CRITIQUE/MAJEUR/MODÉRÉ/MINEUR/INFO avec remédiation.

---

## 6. Checklist PASS/FAIL globale

| # | Test | Commande | Attendu |
|---|------|----------|---------|
| 1 | Vitest manifest | `npx vitest run __tests__/lib/seo/sitemap-manifest.test.ts` | exit 0 |
| 2 | Vitest failure-modes | `npx vitest run __tests__/lib/seo/sitemap-failure-modes.test.ts` | exit 0 |
| 3 | Validate source | `node tools/validate-built-sitemaps.mjs` | Source checks green |
| 4 | Audit sample JSON | `node tools/audit-sitemaps.mjs --sample 5 --json` | JSON valide, version 4.0.0, `pass: true` |
| 5 | Audit SLO mode | `node tools/audit-sitemaps.mjs --sample 5 --slo --json` | `sloViolations` array present, 12/12 SLOs |
| 6 | Audit delta | `--baseline` flag produit champ `delta` | `delta` non null |
| 7 | Audit --out | `--out /tmp/x.json` crée le fichier | fichier parsable |
| 8 | SLO-SLA.md | `test -f docs/sitemap/SLO-SLA.md` | exists |
| 9 | RUNBOOKS.md | `test -f docs/sitemap/RUNBOOKS.md` | exists |
| 10 | FINDINGS.md | `test -f docs/sitemap/FINDINGS.md` | exists |
| 11 | CI nightly YAML | `test -f .github/workflows/sitemap-nightly-audit.yml` | exists, valid YAML |
| 12 | CI post-deploy YAML | `test -f .github/workflows/sitemap-post-deploy-audit.yml` | exists, valid YAML |
