# Internal Linking Audit — AST Grade

Generated 2026-04-20T19:50:49.951Z

**Scope**: 252 route templates + 393 components
**Total link emissions detected**: 1458

- <Link>/<a href>: 1431
- Emitted inside `.map()` (bulk, multiplies by N): 292
- Dynamic pattern (href with `[x]`): 498
- Non-conformant (Google ignores): 27

---

## Axis 1 — Link discoverability (Google: <a href> only)

**27** non-conformant emissions.

| Kind          | Count |
| ------------- | ----- |
| `router.push` | 27    |

Top offenders:

- `src/components/SearchBar.tsx:246` — `router.push` → `/services/[x]/[x]`
- `src/components/LogoutButton.tsx:33` — `router.push` → `/connexion`
- `src/components/LogoutButton.tsx:38` — `router.push` → `/connexion`
- `src/components/HeaderClient.tsx:156` — `router.push` → `/recherche?[x]`
- `src/components/AdvancedSearch.tsx:182` — `router.push` → `/recherche?[x]`
- `src/components/AdvancedSearch.tsx:188` — `router.push` → `/recherche?q=[x]`
- `src/components/ui/SearchBar.tsx:213` — `router.push` → `/recherche?[x]`
- `src/components/ui/SearchBar.tsx:244` — `router.push` → `/recherche?[x]`
- `src/components/ui/SearchBar.tsx:258` — `router.push` → `/recherche?[x]`
- `src/components/ui/SearchBar.tsx:557` — `router.push` → `/recherche?[x]`
- `src/components/simulateur/StepperV2.tsx:387` — `router.push` → `/simulateur-aides-renovation/resultat/[x]`
- `src/components/simulateur/Stepper.tsx:258` — `router.push` → `/simulateur-aides-renovation/resultat/[x]`
- `src/components/search/QuickSearch.tsx:399` — `router.push` → `/services/[x]/[x]`
- `src/components/search/QuickSearch.tsx:401` — `router.push` → `/services/[x]`
- `src/components/search/QuickSearch.tsx:403` — `router.push` → `/villes/[x]`

## Axis 3 — Orphan route templates (0 inbound)

**12** / 252 templates have no inbound contextual link detected.

⚠️ Caveat: dynamic routes like `/guides/[slug]` are matched by pattern, so a Link to `/guides/X` counts for `/guides/[slug]`. Orphans below are genuinely disconnected.

- `/widget` _(noindex)_
- `/tarifs-artisans` _(indexable)_
- `/simulateur-prime-cee` _(indexable)_
- `/renovation-energetique` _(indexable)_
- `/offline` _(indexable)_
- `/etudes` _(indexable)_
- `/carrieres` _(noindex)_
- `/calculateur` _(indexable)_
- `/barometre-prix` _(indexable)_
- `/badge` _(indexable)_
- `/tarifs-artisans/[service]` _(indexable)_
- `/invitation-avis/[token]` _(noindex)_

## Axis 4 — Dangling internal links (target route doesn't exist)

**17** distinct dangling targets.

- `/inscription-artisan` (4 refs)
- `/artisans-rge` (5 refs)
- `/espace-artisan` (2 refs)
- `/connexion` (3 refs)
- `/booking/[x]` (1 refs)
- `/inscription` (1 refs)
- `/comparatif/[x]` (1 refs)
- `/espace-artisan/portfolio` (1 refs)
- `/espace-artisan/cee/formation` (1 refs)
- `/espace-artisan/cee/[x]` (2 refs)
- `/mot-de-passe-oublie` (2 refs)
- `/espace-artisan/profil` (1 refs)
- `/admin` (1 refs)
- `/admin/simulateur/[x]` (1 refs)
- `/admin/simulateur` (1 refs)
- `/admin/journal` (1 refs)
- `/admin/signalements` (1 refs)

## Axis 5 — Density per template

Static emission count (each `.map()` counts as 1 emission, but multiplies at runtime by N).

- Templates with < 3 emissions: **129**
- Templates with > 30 emissions (rich hubs): **1**

Lightest 15 (zero static links = pure dead-ends if no components render links):

- `/verifier-artisan` — static=0, map=0, dyn=0
- `/tarifs-artisans` — static=0, map=0, dyn=0
- `/simulateur-prime-cee` — static=0, map=0, dyn=0
- `/simulateur-aides-renovation` — static=0, map=0, dyn=0
- `/outils` — static=0, map=0, dyn=0
- `/offline` — static=0, map=0, dyn=0
- `/faq` — static=0, map=0, dyn=0
- `/guides` — static=0, map=0, dyn=0
- `/carte-artisans` — static=0, map=0, dyn=0
- `/calculateur` — static=0, map=0, dyn=0
- `/barometre-prix` — static=0, map=0, dyn=0
- `/badge-artisan` — static=0, map=0, dyn=0
- `/badge` — static=0, map=0, dyn=0
- `/accessibilite` — static=0, map=0, dyn=0
- `/tarifs-artisans/[service]` — static=0, map=0, dyn=0

Heaviest 15:

- `/departements/[departement]` — static=33, map=17, dyn=19
- `/devis/[service]/[location]` — static=26, map=7, dyn=19
- `/regions/[region]` — static=26, map=16, dyn=17
- `/services/[service]` — static=24, map=8, dyn=14
- `/urgence/[service]/[ville]` — static=22, map=4, dyn=17
- `/avis/[service]` — static=22, map=5, dyn=13
- `/problemes/[probleme]/[ville]` — static=21, map=4, dyn=16
- `/tarifs/[service]/[ville]` — static=21, map=7, dyn=16
- `/tarifs` — static=21, map=6, dyn=6
- `/villes/[ville]/[quartier]` — static=20, map=6, dyn=11
- `/problemes/[probleme]` — static=20, map=4, dyn=12
- `/urgence` — static=20, map=9, dyn=9
- `/tarifs/[service]` — static=19, map=4, dyn=10
- `/regions/[region]/[service]` — static=17, map=6, dyn=15
- `/urgence/[service]` — static=17, map=4, dyn=7

## Axis 6 — Anchor diversity

Targets with ≥5 inbound and <3 anchor variants (anchor over-optimisation risk):

| Target                          | Inbound | Variants |
| ------------------------------- | ------- | -------- |
| `/confidentialite`              | 26      | 2        |
| `/faq`                          | 17      | 2        |
| `/guides/artisan-rge`           | 15      | 2        |
| `/guides/aides-renovation-2026` | 13      | 1        |
| `/comment-ca-marche`            | 11      | 2        |
| `/guides/devis-travaux`         | 11      | 1        |
| `/avis/[x]`                     | 10      | 2        |
| `/blog/[x]`                     | 10      | 1        |
| `/problemes/[x]/[x]`            | 10      | 2        |
| `/mentions-legales`             | 7       | 1        |
| `/regions/[x]/[x]`              | 7       | 1        |
| `/services/macon`               | 7       | 2        |
| `/guides/permis-construire`     | 6       | 1        |
| `/equipe/[x]`                   | 6       | 2        |
| `/cee/guides`                   | 5       | 2        |
| `/cee/[x]`                      | 5       | 2        |
| `/cgv`                          | 5       | 2        |
| `/problemes/[x]`                | 5       | 1        |
| `/rge/[x]/[x]`                  | 5       | 1        |
| `/rge/[x]`                      | 5       | 2        |
| `/guides/maprimerenov-2026`     | 5       | 1        |

## Axis 7 — rel attribute usage

- Total with `rel="nofollow"`: **0** (dynamic: 0)
- `rel="sponsored"`: **0**
- `rel="ugc"`: **0**

Google requires: `sponsored` MANDATORY on paid; `ugc` on user content (reviews); `nofollow` for untrusted. Dynamic `rel` (e.g. `{noindex ? 'nofollow' : undefined}`) = PageRank sculpting.

## Axis 10 — BreadcrumbList schema coverage

Templates WITHOUT breadcrumb schema: **11** / 252

- `/tarifs-artisans`
- `/offline`
- `/mes-favoris`
- `/calculateur`
- `/barometre-prix`
- `/tarifs-artisans/[service]`
- `/invitation-avis/[token]`
- `/artisan/[slug]`
- `/tarifs-artisans/[service]/[ville]`
- `/simulateur-aides-renovation/resultat/[publicId]`
- `/services/[service]/[location]/[publicId]`

---

## Executive Summary

| Axis                      | Metric            | Status |
| ------------------------- | ----------------- | ------ |
| 1. Discoverability        | 27 non-conformant | ⚠️     |
| 3. Orphans                | 12 / 252          | ⚠️     |
| 4. Dangling               | 17 targets        | ⚠️     |
| 5. Under-dense (<3)       | 129 templates     | ⚠️     |
| 6. Low anchor diversity   | 21 targets        | ⚠️     |
| 7. rel=nofollow sculpting | 0 (0 dynamic)     | ⚠️     |
| 7b. rel=sponsored         | 0                 | N/A    |
| 7c. rel=ugc               | 0                 | N/A    |
| 10. Breadcrumb coverage   | 241 / 252         | ⚠️     |

### Context

- Templates with static noindex: 20
- Templates with conditional noindex: 4
- Indexable templates: 228
