# Revalidate Coverage — ServicesArtisans

**Status** : ✅ Shipped (2026-04-22) — 229/229 pages indexables couvertes
**Owner** : Marvin
**Audit tool** : `scripts/audit-revalidate.mjs`

---

## Contexte

L'audit CEO 2026-04-21 annonçait "100 pages volatiles sans `revalidate`" (P0 #12). Après scan exhaustif des 254 pages avec metadata :

- **229 pages indexables** (les autres sont légitimement noindex)
- **228 déjà déclarées** avec `revalidate` explicite (99.6%)
- **1 seule page oubliée** : `/widget-prix` (page éditoriale statique sans TTL déclaré)
- **0 pages dynamiques sans comportement déclaré**

Encore un faux positif de l'audit initial (après `.env.local`, `CRON_SECRET`, canonicals). L'architecture SEO du site est en réalité bien plus saine que l'audit ne le laissait entendre.

## Pourquoi c'est critique

Next.js App Router a un comportement par défaut piégeux :

| Déclaration                              | Comportement réel                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `export const revalidate = N`            | **ISR** — regénération toutes les N secondes                                                 |
| `export const dynamic = 'force-dynamic'` | **SSR** à chaque requête                                                                     |
| `export const dynamic = 'force-static'`  | **Static pur** au build (choix volontaire)                                                   |
| Aucune déclaration                       | **Static par défaut** — données figées au build, jamais rafraîchies jusqu'au prochain deploy |

Une page "data-driven" (avis, artisans, tarifs, barèmes) sans `revalidate` affiche les données du build et reste stale pour toujours. Conséquences :

- Données obsolètes visibles aux utilisateurs
- Freshness SEO dégradée (Google baisse le ranking)
- Artisans nouveaux qui ne remontent jamais dans les listings

## Fix livré

**`src/app/(public)/widget-prix/page.tsx`** : ajout de

```tsx
import { REVALIDATE } from '@/lib/cache'

export const revalidate = REVALIDATE.staticPages // 86400s = 24h
```

Page éditoriale (widget embed + docs artisans) qui dépend de `getTradeContent()` — le contenu change rarement, 24h est approprié.

## Répartition post-fix

| Mode                | Pages indexables |
| ------------------- | ---------------- |
| `revalidate`        | **229 (100%)**   |
| `force-dynamic`     | 0                |
| `force-static`      | 0                |
| `auto`              | 0                |
| `error`             | 0                |
| **Static implicit** | **0**            |

## Guardrails

### Pre-commit hook

```sh
node scripts/audit-revalidate.mjs --strict || exit 1
```

### CI GitHub Actions

```yaml
- name: Revalidate coverage (zero indexable page with static-by-default behavior)
  run: node scripts/audit-revalidate.mjs --strict
```

### Tests unit

`__tests__/scripts/audit-revalidate.test.ts` — 9 cas :

- Format JSON + structure
- Détection patterns revalidate (numérique + identifiant)
- Détection patterns dynamic (force-dynamic/static/auto/error)
- Exclusion des pages noindex
- Mode strict exit code
- Répartition par mode

## Patterns reconnus

Le script détecte automatiquement comme "comportement déclaré" :

1. **`export const revalidate = <valeur>`** — valeur numérique OU identifiant (ex: `REVALIDATE.services`)
2. **`export const dynamic = 'force-dynamic'`**
3. **`export const dynamic = 'force-static'`**
4. **`export const dynamic = 'auto'`**
5. **`export const dynamic = 'error'`**

## Ajout d'une nouvelle page

Checklist pour toute nouvelle `page.tsx` publique indexable :

```tsx
import { REVALIDATE } from '@/lib/cache'

// Choisir selon la nature du contenu :
export const revalidate = REVALIDATE.services // 24h — contenu éditorial stable
export const revalidate = REVALIDATE.artisanProfile // 24h — profils artisans
export const revalidate = REVALIDATE.cms // 1h  — contenu CMS éditable
// OU explicitement :
export const dynamic = 'force-dynamic' // SSR à chaque requête (data live)
export const dynamic = 'force-static' // Static volontaire (contenu figé par design)
```

Le pre-commit hook bloque tout commit qui introduit une page indexable sans déclaration explicite.

## Métriques

| Metric                                        | Avant 2026-04-22 | Après          |
| --------------------------------------------- | ---------------- | -------------- |
| Pages indexables avec comportement déclaré    | 228 (99.6%)      | **229 (100%)** |
| Pages indexables "static implicit" (bug risk) | 1                | **0**          |
| Pages indexables dynamiques sans déclaration  | 0                | **0**          |

## Changelog

- **2026-04-22** (Marvin) : audit `audit-revalidate.mjs` + fix `/widget-prix` + guardrails pre-commit/CI + 9 tests + doc. Couverture 100%. P0 #12 "100 pages sans revalidate" identifié comme faux positif majeur — seule 1 page concernée, fixée.
