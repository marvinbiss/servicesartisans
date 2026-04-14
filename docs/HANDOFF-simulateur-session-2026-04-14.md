# Handoff Simulateur — 2026-04-14

## État à la reprise

**4 commits locaux (pas push)** :
1. `a196b63e` — docs Phase 0 (9 fichiers)
2. `58c2db59` — P1 migration 438 + seed BAREMES_2026_01
3. `10bd8e70` — P2 moteur calcul + 67 tests
4. `d94e54be` — Foundations types/zones/Zod/RGPD + 71 tests

**138 tests verts cumulés.**

## Docs source de vérité

- `docs/baremes-sources/07-valeurs-officielles-confirmees-2026-04-14.md` — chiffres opposables
- `docs/simulateur-architecture.md` — spec complète
- `docs/rgpd-simulateur-aides.md` — V1 conformité

## Code déjà livré

```
src/lib/simulateur/
├── types.ts                    ✅
├── zones.ts                    ✅ (101 dépts + DOM)
├── schemas.ts                  ✅ (Zod v4)
├── baremes/
│   ├── 2026-01.ts              ✅ (BAREMES_2026_01 + exports granulaires)
│   └── index.ts                ✅ (REGISTRY versionnable)
├── engine/
│   ├── classifier.ts           ✅
│   ├── eligibilite.ts          ✅
│   ├── calc-mpr.ts             ✅
│   ├── calc-cee.ts             ✅ (computeBarTh171 placeholder)
│   ├── calc-cdp.ts             ✅
│   ├── non-cumul.ts            ✅
│   ├── ecretement.ts           ✅
│   ├── reste-a-charge.ts       ✅
│   ├── pipeline.ts             ✅ (runSimulation orchestrateur)
│   └── index.ts                ✅
├── rgpd/
│   ├── hash-ip.ts              ✅ (RGPD_IP_SALT)
│   └── consent.ts              ✅
└── utils/
    └── public-id.ts            ✅ (EST-YYYY-MM-DD-xxxxxx)

supabase/migrations/
└── 438_simulateur_tables.sql   ✅

__tests__/simulateur/
├── zones.test.ts               ✅ 16 tests
├── schemas.test.ts             ✅ 23 tests
├── hash-ip.test.ts             ✅ 7 tests
├── public-id.test.ts           ✅ 5 tests
└── engine/                     ✅ 67 tests (7 fichiers)
```

## TODOs visibles dans le code

- `engine/calc-cee.ts` `computeBarTh171` — placeholder formule `base × facteur_surface × facteur_etas`. Invariants ordinaux OK. **Remplacer par table PDF DGEC vA78.4 exacte.**
- `engine/calc-mpr.ts` `calcMPRGeste` — seul `PAC_AIREAU` a forfait défini. Autres gestes retournent 0 avec baremeId `.STUB.2026-01`. **Compléter CET, SSC, biomasse, VMC, isolation.**
- `supabase/migrations/438` — la ligne `baremes_versions.'2026-01-14'` **n'est pas insérée**. Upsert à faire au 1er appel `/api/simulateur/estimate` (pattern cee_referentiels).

## RESTE À FAIRE (P3–P7)

### P3 UI — **agent en background au moment de l'handoff** (id `a72169c2247e2c2d1`)

Si non livré à la reprise, créer :
- `src/app/(public)/simulateur-aides-renovation/page.tsx`
- `src/components/simulateur/Stepper.tsx` + 5 `steps/StepN*.tsx`
- `src/app/api/simulateur/{estimate,submit,result/[publicId]}/route.ts`
- Redirect 301 `/simulateur-prime-cee` → route cible dans `next.config.js`

### P4 Pipedrive (NON LIVRÉ — handoff)

**Existant à étudier avant** : `src/lib/integrations/pipedrive.ts` + cron `pipedrive-retry` existant (pattern template).

- `src/lib/simulateur/pipedrive.ts` — `createSimulateurDeal(estimation)`. Pipeline id via `PIPEDRIVE_PIPELINE_SIMULATEUR`. Person + Deal stage 1 + Note avec public_id + baremeIds.
- `supabase/migrations/439_simulateur_pipedrive_dlq.sql` — table `simulateur_pipedrive_failures` (estimation_id FK, payload jsonb, error, retry_count, next_retry_at). RLS service_role.
- `src/app/api/cron/simulateur-pipedrive-retry/route.ts` — cron 6h, retry 5 fois max, backoff exponentiel, header CRON_SECRET.

### P5 Admin traçabilité (NON LIVRÉ)

- `src/app/admin/(dashboard)/simulateur/page.tsx` — liste paginée + filtres catégorie/parcours/zone + bouton export CSV. `requirePermission('simulateur', 'read')`.
- `src/app/admin/(dashboard)/simulateur/[publicId]/page.tsx` — détail : situation, gestes, baremeIds, formuleDebug, lien Pipedrive. Reconstruit depuis `bareme_version`.
- `src/app/api/admin/simulateur/export/route.ts` — GET CSV filtré.

### P7 RGPD cron (NON LIVRÉ)

- `src/app/api/cron/rgpd-anonymize/route.ts` — quotidien 03h, CRON_SECRET. Règles §4 doc RGPD :
  - >90j : RFR → tranche 10k
  - >3 ans coords (pas de pipedrive_deal_id) → null
  - >6 mois ip_hash → null
- `src/app/api/rgpd/export/[publicId]/route.ts` — GET signé, JSON complet.
- `src/app/api/rgpd/delete/[publicId]/route.ts` — POST avec confirmation email (TODO email, pour l'instant `deleted_at`).
- `vercel.json` — ajouter 2 crons : `rgpd-anonymize` (`0 3 * * *`) + `simulateur-pipedrive-retry` (`0 */6 * * *`).

## Règles projet critiques

- **PAS de commit/push auto** — user demande commits locaux fréquents, remote jamais sans demande explicite
- TS strict, pas d'any, pas de @ts-ignore
- `logger` depuis `@/lib/logger`, jamais `console.log`
- Zod **v4** (pas v3 malgré CLAUDE.md)
- `createAdminClient` pour bypass RLS côté serveur
- CLAUDE.md racine : colonnes Supabase interdites, tables inexistantes
- `npm run build` avant push — OOM type-check projet connu (fix `NODE_OPTIONS=--max-old-space-size=8192`)
- Mémoire mobile Termius : commits atomiques fréquents car connexion instable

## Prochaine session — commande idéale

```
Reprends le simulateur depuis docs/HANDOFF-simulateur-session-2026-04-14.md.
Vérifie git log pour voir les 4 commits. Check l'état de l'agent P3 UI
(si pas livré, relance-le). Puis lance P4+P5+P7 en 3 agents parallèles
background, commit local après chaque.
```
