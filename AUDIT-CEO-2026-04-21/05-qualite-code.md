# Audit Qualité Code — ServicesArtisans 2026-04-21

**Verdict : 7.2/10 — viable mais fragile à l'échelle**

## Métriques brutes

| Métrique             | Valeur  | Seuil | Verdict        |
| -------------------- | ------- | ----- | -------------- |
| `any`/`as any`       | 26      | <10   | ⚠️             |
| `@ts-ignore`         | 6       | <5    | ⚠️             |
| TODO/FIXME/HACK      | 31      | <20   | ⚠️             |
| `console.*`          | 85      | <50   | ⚠️             |
| Fichiers TS          | 1501    | —     | Énorme         |
| Tests unit           | 33      | —     | Bas            |
| Tests E2E            | 21      | —     | Sparse         |
| `eslint-disable`     | **154** | <30   | 🔥             |
| `createClient()` dup | **279** | <50   | 🔥             |
| `catch` silencieux   | **30+** | <10   | 🔥             |
| Routes API           | 273     | —     | Surface énorme |
| God files >2000 LOC  | 13      | <3    | 🔥             |
| `require()` mixte    | 200     | 0     | ⚠️             |

## Top 10 dettes

1. **Silent catch epidemic** — `src/lib/cache.ts:154`, `pipedrive.ts`, `yousign.ts`, `devis-service.ts`, `review-service.ts` : `.catch(() => {})` partout. Debug impossible.
2. **279 `createClient()` dupliqués** — middleware, hooks, lib. Pas de singleton. -40% perf réseau.
3. **154 `eslint-disable`** — audit trail détruit.
4. **`src/lib/data/france.ts` 36 312 LOC** — JSON brut dans TS. Build +5MB.
5. **26 `any`/`as any`** — tests Supabase mockés = zéro typage.
6. **God services** — `admin-stats-service.ts` 1588 LOC, `admin-crud-service.ts` 1429 LOC.
7. **200 `require()` CJS/ESM mix** — dead code elim broken, tree-shake cassé.
8. **383 `process.env.*` directs** — zéro validation Zod.
9. **Pas de détection soft 404** — Next.js 14 bug non mitigé en code (CLAUDE.md mentionne mitigation metadata uniquement).
10. **273 routes dynamiques sans validation params** — injection URL possible.

## Duplications critiques

- `calculateCeePrime()` / `calculateCeeMinimum()` — 8 copies : leads-service, estimate, dispatch, CeePrimeEstimateCard.
- Pipedrive triplé : `lib/integrations/pipedrive.ts`, `lib/simulateur/pipedrive.ts`, `lib/simulateur/callback-pipedrive.ts`.

## Tests

- Unit : seuil 60%, tests critiques devis/booking/payments = **<10% coverage**.
- Mocks Supabase = `any` dans 100% cas.
- `leads-service.test.ts` 1594 LOC mais tests quasi no-op (mocks retournent `{data: null}`).

## Error handling catastrophique

- 30+ catch vides, 45+ catch sans logging, pas de retry/circuit breaker, Sentry configuré mais routes ne reportent rien.

## Quick Wins 24h

1. `grep -r ".catch(() => {})" src/ | xargs sed -i 's/.../logger.error/'` (2h)
2. `src/lib/supabase/singleton.ts` + remplacer 279 occurrences (3h)
3. `france.ts` → `public/data/france.json` lazy load (2h, -5MB bundle)
