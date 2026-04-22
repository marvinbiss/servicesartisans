# Dashboard Coherence Audit — 2026-04-23

Audit Stripe-grade des 3 tableaux de bord ServicesArtisans : admin root, admin
CEO metrics, artisan espace personnel. L'objectif est de garantir que les
mêmes concepts reçoivent les mêmes noms, calculs, formats, et contrats d'API
entre tous les écrans, afin qu'un utilisateur (admin ou artisan) comparant
deux vues ne tombe pas sur une incohérence.

## Inventaire

| Dashboard         | Path                        | Audience    | Source data                                         |
| ----------------- | --------------------------- | ----------- | --------------------------------------------------- |
| Admin root        | `/admin`                    | Ops équipe  | `/api/admin/stats`                                  |
| Admin CEO metrics | `/admin/metrics`            | CEO + leads | `/api/admin/metrics` + `metrics_snapshots`          |
| Artisan           | `/espace-artisan/dashboard` | Artisan     | `/api/artisan/{stats,rge,reputation,funnel,trends}` |

## Matrice de cohérence (Stripe-grade)

| #   | Axe                      | Admin root                                       | Admin metrics                      | Artisan                                                        | Verdict                  |
| --- | ------------------------ | ------------------------------------------------ | ---------------------------------- | -------------------------------------------------------------- | ------------------------ |
| 1   | Locale dates             | `fr-FR`                                          | `fr-FR`                            | `fr-FR`                                                        | ✅                       |
| 2   | Sémantique couleur       | red=alerte, green=OK                             | red/green/gray vs baseline         | red/amber/green selon sévérité                                 | ✅                       |
| 3   | Auth boundary            | `requirePermission(admin)`                       | `requirePermission(settings,read)` | `auth.getUser()` + `providers.user_id=uid`                     | ✅ sans leak             |
| 4   | Empty states FR friendly | ✅                                               | ✅                                 | ✅                                                             | ✅                       |
| 5   | SWR refresh cadence      | default 30s                                      | default 30s                        | 30s/60s/2min/5min par volatilité                               | ✅                       |
| 6   | Loading UX               | skeleton per-section                             | **spinner plein écran bloquant**   | skeleton per-block aria-busy                                   | ⚠️ P2                    |
| 7   | Error UX                 | banner + retry + dismiss                         | **banner inline, pas de retry**    | banner motion + retry + null fallback                          | ⚠️ P2                    |
| 8   | A11y wrapper             | `aria-label="Tableau de bord admin"`             | **aucun wrapper label**            | per-block aria-label                                           | ⚠️ P3                    |
| 9   | Formatage avgRating      | `Math.round()` → entier (4, 5)                   | N/A                                | `toFixed(1)` → 4.3                                             | ⚠️ P3                    |
| 10  | Delta convention         | % vs période précédente                          | % vs baseline J0 fixe              | % vs previousPeriod + points funnel + split-half trends        | ⚠️ P2 cognitive load     |
| 11  | Terminologie métier      | `bookings` / `signalements` / `leads estimation` | `devis_requests` / `claims`        | `demandes` / `leads` / `assignments`                           | ⚠️ P1 glossaire manquant |
| 12  | Status taxonomy          | N/A (admin n'affiche pas)                        | agrégats count, pas de status      | **page.tsx mixe 2 tables = 8 statuts, API funnel = 5 statuts** | ⚠️ P1 à clarifier        |

## Issues priorisées

### P1 — Structural (hors scope quick fix)

**C1 — Terminologie métier**  
`bookings` / `devis` / `demandes` / `leads` / `lead_assignments` / `claims` / `estimation_leads` désignent 5+ entités avec chevauchement sémantique. Pas un bug : ces tables existent vraiment et distinctement. Mais un admin qui lit "Nouvelles réservations: 3" sur le dashboard root et "Devis 7j: 42" sur metrics ne comprend pas qu'il s'agit de deux tables (`bookings` et `devis_requests`). → **action P1** : créer `docs/glossaire-entites-business.md` qui explique les 5 tables et quand chacune est incrémentée.

**C2 — Status taxonomy artisan**  
`src/app/(private)/espace-artisan/dashboard/page.tsx` ligne 46-55 typifie `Demande.status` avec 8 valeurs (`pending | viewed | quoted | declined | sent | accepted | refused | completed`). Les 4 premiers viennent de `lead_assignments.status` (migration 103), les 4 derniers de `devis_requests.status` (migration 100). L'API `/api/artisan/funnel` ne retourne que les 5 statuts lead_assignments. → **action P1** : documenter dans le header de dashboard/page.tsx que `status` fusionne deux tables, OU filtrer l'affichage sur lead_assignments uniquement pour cohérence avec le FunnelBlock.

### P2 — Quick wins (fixés dans ce commit)

**C5 — Loading UX admin metrics**  
Spinner plein écran vs skeleton per-section ailleurs. → **fixé** : remplacer `<Loader2 animate-spin />` par un skeleton grid qui conserve le layout.

**C6 — Error UX admin metrics**  
Banner inline sans retry. → **fixé** : ajouter bouton "Réessayer" qui appelle `mutate()`.

**C10 — Convention de delta divergente**  
4 fonctions de delta coexistent. Pas un bug, mais chaque consommateur ré-implémente la même chose. → **fixé** : extraire `src/lib/metrics/delta.ts` avec `pctDelta()` + `pointDelta()` + unit test + réutiliser dans admin metrics + artisan blocks.

### P3 — Polish

**C8 — A11y wrapper admin metrics**  
→ **fixé** : `role="main" aria-label="Métriques CEO"` sur le root div.

**C9 — Formatage avgRating admin root**  
`Math.round(avg)` affiche "5" même si 4.6. → **fixé** : `avg.toFixed(1)` comme ailleurs.

## Shared helper extraction

Les 3 dashboards font des calculs de delta légèrement différents. On extrait :

```ts
// src/lib/metrics/delta.ts
export function pctDelta(current: number | null, baseline: number | null): number | null
export function pointDelta(current: number | null, baseline: number | null): number | null
export function splitHalfDelta(series: number[]): number | null
export function formatPctDelta(delta: number | null): string // "+5.3%" | "—"
```

Conventions normalisées :

- `pctDelta` : `(current - baseline) / baseline * 100`, null si baseline=0 ou null
- `pointDelta` : `current - baseline` en valeur absolue (pour rates %)
- `splitHalfDelta` : second moitié vs première moitié d'une série (utilisé par sparklines)
- Arrondi : 1 décimale pour pct, 1 décimale pour points

## Coherence tests ajoutés

`__tests__/coherence/dashboard-consistency.test.ts` vérifie :

1. Tous les statuts `lead_assignments` exposés par l'API funnel sont dans le set `{pending, viewed, quoted, declined}` (migration 103 CHECK).
2. La shape des payloads `/api/artisan/*` ne contient PAS de PII admin (email, phone brut d'un autre user).
3. Les fonctions de delta extraites produisent des résultats cohérents sur cas de référence.
4. Les empty states des 5 blocs artisan sont traduits en français (pas d'`undefined`/`null` visibles).

## Résultat

- **P2 / P3 fixés** : 4 issues (C5, C6, C8, C9, C10) dans ce commit.
- **P1 documenté** : 2 issues (C1 terminologie, C2 taxonomy) restent à traiter structurellement.
- **Coherence tests** ajoutés pour prévenir les régressions.
