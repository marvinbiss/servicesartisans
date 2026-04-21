# Canonicals Coverage — ServicesArtisans

**Status** : ✅ Validé (2026-04-22) — 0 page indexable sans canonical
**Owner** : Marvin
**Audit tool** : `scripts/audit-canonicals.mjs`

---

## Contexte

L'audit CEO du 2026-04-21 avait annoncé « 18 routes dynamiques sans `getAlternates()` » (P0 #8). Après scan statique des 254 pages avec metadata :

- **254 pages avec metadata** scannées
- **9 pages sans canonical ni alternates** (pas 18)
- **0 dont indexables** — les 9 sont TOUTES `robots: { index: false }`
- **0 dont indexables ET dynamiques** (le cas critique SEO)

**Verdict** : le rapport initial était un faux positif. Toutes les pages publiques indexables ont déjà `getAlternates()` correctement déclaré via `src/lib/seo/config.ts`.

## Pages noindex exclues du strict check (9)

| Page                                                       | Pourquoi noindex                                    |
| ---------------------------------------------------------- | --------------------------------------------------- |
| `(private)/espace-artisan/cee/*` (5 pages statiques)       | Espace privé artisan, pas d'intérêt search          |
| `(private)/espace-artisan/cee/[dossierId]`                 | Dossier privé par dossierId                         |
| `(public)/artisan/[slug]`                                  | Route redirect `force-dynamic` (vers publicId page) |
| `(public)/invitation-avis/[token]`                         | Token HMAC unique, jamais à indexer                 |
| `(public)/simulateur-aides-renovation/resultat/[publicId]` | Résultat simulateur perso par user                  |

Chaque page a `robots: { index: false, follow: ... }` explicite dans sa `metadata` export.

## Patterns de détection noindex

Le script `scripts/audit-canonicals.mjs` reconnaît automatiquement comme "noindex légitime" toute page qui a au moins un de ces signaux :

1. **`robots: { index: false, ... }`** — pattern Next.js 14 Metadata API standard
2. **`robots: { ...noindex }`** — étalement d'objet factorisé (utilisé pour DRY)
3. **`NOT_FOUND_METADATA` / `NOINDEX_METADATA`** — constantes dédiées
4. **Dossier `(private)/`** — convention Next.js route group privée
5. **`/espace-artisan/`, `/espace-client/`, `/admin/`** — espaces utilisateur
6. **Page qui `redirect()` sans rendu JSX** — route redirect pure

Un signal parmi ces 6 → la page est exclue du check strict.

## Guardrails (anti-régression)

### 1. Pre-commit hook

Dans `.husky/pre-commit` :

```sh
node scripts/audit-canonicals.mjs --strict || exit 1
```

Bloque tout commit qui introduit une nouvelle page dynamique indexable sans canonical.

### 2. CI GitHub Actions

Dans `.github/workflows/guardrails.yml`, job `guardrails` :

```yaml
- name: Canonicals coverage (zero indexable dynamic page without canonical)
  run: node scripts/audit-canonicals.mjs --strict
```

### 3. Tests unit sur l'audit tool

`__tests__/scripts/audit-canonicals.test.ts` — 8 cas :

- Format JSON valide et champs attendus
- Scanne >= 200 pages (baseline)
- Zero gap indexable dynamique (état prod)
- Patterns noindex reconnus correctement
- Mode strict exit code

## Utilisation

```bash
# Humain, affichage tty
node scripts/audit-canonicals.mjs

# JSON pour CI/scripts
node scripts/audit-canonicals.mjs --json

# Strict : exit 1 si au moins une page dynamique indexable sans canonical
node scripts/audit-canonicals.mjs --strict
```

## Ajout d'une nouvelle page

Checklist obligatoire pour toute nouvelle `page.tsx` avec metadata :

1. **Si page publique indexable** → dans `generateMetadata` ou `metadata` :

   ```tsx
   import { getAlternates } from '@/lib/seo/config'

   export async function generateMetadata({ params }): Promise<Metadata> {
     const { slug } = await params
     return {
       title: '...',
       alternates: getAlternates(`/ma-route/${slug}`),
       // ...
     }
   }
   ```

2. **Si page privée / token / redirect** → ajouter explicitement `robots: { index: false }`
   pour que le guardrail l'exclue.

3. Le pre-commit hook validera avant le commit.

## Métriques

| Metric                                     | 2026-04-22 |
| ------------------------------------------ | ---------- |
| Pages avec metadata scannées               | 254        |
| Pages indexables avec canonical            | 245 (100%) |
| Pages indexables SANS canonical            | **0**      |
| Pages noindex (exclues légitimement)       | 9          |
| Pages dynamiques indexables sans canonical | **0**      |

## Changelog

- **2026-04-22** (Marvin) : audit exhaustif + tool `audit-canonicals.mjs` + guardrails pre-commit/CI + 8 tests. Conclusion : le P0 #8 "18 routes sans canonical" était un faux positif — couverture réelle déjà à 100%. Guardrail installé pour maintenir l'état.
