# Internal Linking Audit — CEO Grade

Generated 2026-04-20T19:47:54.769Z

Scope: 252 route templates + 393 components
Total internal link emissions: 217
Usable <a href>/<Link>: 216

---

## Axis 1 — Link discoverability (Google: <a href> only)

Non-conformant emissions: **1**

Google ignores these entirely (no PageRank transfer):

| Kind              | Count |
| ----------------- | ----- |
| `window_location` | 1     |

Top 10 offenders:

- `src/components/conversion/DevisConfirmation.tsx:665` (window_location) → ``https://wa.me/?text=${encodeURIComponent(`J'ai trouvé des artisans de confiance`

## Axis 3 — Orphan route templates (0 inbound)

Count: **221** / 252

These route templates are NEVER linked from other templates/components:

- `/widget-prix` (file: `src/app/(public)/widget-prix/page.tsx`)
- `/widget` (file: `src/app/(public)/widget/page.tsx`)
- `/urgence` (file: `src/app/(public)/urgence/page.tsx`)
- `/tarifs-artisans` (file: `src/app/(public)/tarifs-artisans/page.tsx`)
- `/tarifs` (file: `src/app/(public)/tarifs/page.tsx`)
- `/statistiques-artisans-france` (file: `src/app/(public)/statistiques-artisans-france/page.tsx`)
- `/sources` (file: `src/app/(public)/sources/page.tsx`)
- `/simulateur-prime-cee` (file: `src/app/(public)/simulateur-prime-cee/page.tsx`)
- `/simulateur-aides-renovation` (file: `src/app/(public)/simulateur-aides-renovation/page.tsx`)
- `/renovation-energetique` (file: `src/app/(public)/renovation-energetique/page.tsx`)
- `/questions` (file: `src/app/(public)/questions/page.tsx`)
- `/problemes` (file: `src/app/(public)/problemes/page.tsx`)
- `/presse` (file: `src/app/(public)/presse/page.tsx`)
- `/plan-du-site` (file: `src/app/(public)/plan-du-site/page.tsx`)
- `/partenaires` (file: `src/app/(public)/partenaires/page.tsx`)
- `/outils` (file: `src/app/(public)/outils/page.tsx`)
- `/offline` (file: `src/app/(public)/offline/page.tsx`)
- `/notre-processus-de-verification` (file: `src/app/(public)/notre-processus-de-verification/page.tsx`)
- `/methodologie` (file: `src/app/(public)/methodologie/page.tsx`)
- `/mes-favoris` (file: `src/app/(public)/mes-favoris/page.tsx`)
- `/maprimerenov-cumulaison-cee` (file: `src/app/(public)/maprimerenov-cumulaison-cee/page.tsx`)
- `/leads-exclusifs-vs-partages` (file: `src/app/(public)/leads-exclusifs-vs-partages/page.tsx`)
- `/etudes` (file: `src/app/(public)/etudes/page.tsx`)
- `/devenir-partenaire-cee` (file: `src/app/(public)/devenir-partenaire-cee/page.tsx`)
- `/comparatif-primes-cee-2026` (file: `src/app/(public)/comparatif-primes-cee-2026/page.tsx`)
- `/checklist-travaux` (file: `src/app/(public)/checklist-travaux/page.tsx`)
- `/carte-artisans` (file: `src/app/(public)/carte-artisans/page.tsx`)
- `/carrieres` (file: `src/app/(public)/carrieres/page.tsx`)
- `/calendrier-travaux` (file: `src/app/(public)/calendrier-travaux/page.tsx`)
- `/calculateur` (file: `src/app/(public)/calculateur/page.tsx`)

_... +191 more._

## Axis 4 — Dangling internal links (no matching route)

Count: **2** distinct targets

These targets have no matching route template (may be valid if dynamic slugs):

- `/mot-de-passe-oublie (1 occurrences)`
- `/admin (1 occurrences)`

## Axis 5 — Link density per template

Target: 8-12 outbound contextual per indexable page.

- Templates with < 5 outbound: **250**
- Templates with > 20 outbound: **0**

Top 10 lightest templates (risk of PageRank dead-end):

- `/widget-prix` — 0 links
- `/widget` — 0 links
- `/villes` — 0 links
- `/verifier-artisan` — 0 links
- `/urgence` — 0 links
- `/tarifs-artisans` — 0 links
- `/tarifs` — 0 links
- `/statistiques-artisans-france` — 0 links
- `/sources` — 0 links
- `/simulateur-prime-cee` — 0 links

Top 10 heaviest (potential dilution):

- `/confidentialite` — 7 links
- `/services/[service]` — 5 links
- `/guides/refuser-devis-artisan-signe` — 3 links
- `/tarifs/[service]` — 3 links
- `/mentions-legales` — 3 links
- `/rge/[service]/departement/[departement]` — 2 links
- `/services/[service]/[location]/[publicId]` — 2 links
- `/avis/[service]` — 2 links
- `/blog/[slug]` — 2 links
- `/devis/[service]` — 2 links

## Axis 6 — Anchor diversity (top inbound targets with <3 variants)

Target: ≥5 variants per frequently-linked target.

| Target             | Inbound | Variants |
| ------------------ | ------- | -------- |
| `/confidentialite` | 18      | 1        |
| `/mediation`       | 8       | 1        |

## Axis 7 — rel attribute usage

- Links with any rel attr: **0** / 216
- `rel="nofollow"`: **0**
- `rel="sponsored"`: **0**
- `rel="ugc"`: **0**

Reminder (Google): `nofollow` on untrusted, `sponsored` MANDATORY on paid placements, `ugc` on user-generated content (reviews).

## Axis 10 — BreadcrumbList schema coverage

Templates WITHOUT BreadcrumbList schema: **11** / 252

Top 30 missing breadcrumb:

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

| Axis                | Status                        |
| ------------------- | ----------------------------- |
| 1. Discoverability  | ⚠️ 1 non-conformant           |
| 3. Orphans          | ⚠️ 221 orphan templates       |
| 4. Dangling         | ⚠️ 2 dangling targets         |
| 5. Density < 5      | ⚠️ 250 templates under-linked |
| 6. Anchor diversity | ⚠️ 2 targets with <3 variants |
| 7. rel=nofollow     | ⚠️ only 0 nofollow links      |
| 10. Breadcrumb      | ⚠️ 11 missing                 |
