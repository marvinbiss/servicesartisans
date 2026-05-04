/**
 * Static contract — toute route publique qui émet un Article schema
 * doit aussi émettre `reviewedBy` (directement) OU passer par un helper
 * qui le fait pour elle (`getFlagshipArticleSchema`, `getBlogArticleSchema`,
 * `getDeepSectionsTechArticleSchema`).
 *
 * Pourquoi un test grep-based plutôt qu'un test runtime : ces helpers sont
 * appelés depuis ~150 routes Next.js dynamiques. Un runtime test devrait
 * mocker la DB pour chaque route — coûteux et fragile. Le grep statique
 * détecte les régressions au moment du commit, pas après deploy.
 *
 * Liste d'exceptions :
 *   - Aggregator/list pages (blog category, blog tag, regions list, devis hub)
 *     qui émettent un schema Article minimal pour la liste plutôt qu'un
 *     contenu éditorial individuel. Pas de Person reviewer pertinent.
 *   - Pages spéciales (devis, etudes/page, comparaison/page) qui ne sont
 *     pas YMYL editorial mais bien des outils ou hubs de tri.
 *
 * Cf. Tier 1-8 (commits 1f1e6ed2b → 12c8fb875) pour le rollout initial.
 */
import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'

const PUBLIC_ROOT = path.join(process.cwd(), 'src', 'app', '(public)')

/**
 * Routes autorisées à émettre Article sans reviewedBy. Toute nouvelle
 * exception doit être documentée avec une raison défendable.
 */
const EXEMPT_ROUTES = new Set<string>([
  // Blog aggregators — listent des billets, le reviewedBy est par billet.
  'blog/page.tsx',
  'blog/categorie/[category]/page.tsx',
  'blog/tag/[tag]/page.tsx',
  // Hubs de listings — pas de contenu YMYL éditorial.
  'avis/[service]/page.tsx',
  'cee/guides/page.tsx',
  'communes/page.tsx',
  'comparaison/page.tsx',
  'departements/page.tsx',
  'regions/page.tsx',
  // Funnel/outils — pas YMYL editorial.
  'devis/page.tsx',
  'devis/[service]/page.tsx',
  'etudes/page.tsx',
  // Hubs RGE qualifications/labels racines (les fiches label sous-jacentes
  // utilisent getFlagshipArticleSchema qui auto-injecte reviewedBy).
  'rge/comment-devenir-rge/page.tsx',
  'rge/fraude-rge-comment-verifier/page.tsx',
  'rge/glossaire/page.tsx',
  'rge/qualifications/page.tsx',
  'rge/qualifications/[slug]/page.tsx',
  'rge/sources/page.tsx',
  'rge/tarifs-audit-energetique/page.tsx',
  // Guides hub-level dynamiques (les /guides/[slug]/* utilisent getFlagshipArticleSchema).
  'guides/long-tail/[slug]/page.tsx',
])

const REVIEWED_BY_TOKENS = [
  'reviewedBy',
  'getFlagshipArticleSchema',
  'getBlogArticleSchema',
  'getDeepSectionsTechArticleSchema',
]

const ARTICLE_TOKEN = "@type': 'Article'"

function walkPageFiles(dir: string): string[] {
  const out: string[] = []
  if (!fs.existsSync(dir)) return out
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walkPageFiles(full))
    } else if (entry.isFile() && entry.name === 'page.tsx') {
      out.push(full)
    }
  }
  return out
}

function relativeFromPublic(p: string): string {
  return path.relative(PUBLIC_ROOT, p).split(path.sep).join('/')
}

describe('Article schema contract — toutes routes émettrices doivent émettre reviewedBy', () => {
  it('chaque route Article non exemptée émet reviewedBy ou un helper qui le fait', () => {
    const offenders: string[] = []
    const files = walkPageFiles(PUBLIC_ROOT)
    for (const file of files) {
      const rel = relativeFromPublic(file)
      if (EXEMPT_ROUTES.has(rel)) continue
      const src = fs.readFileSync(file, 'utf8')
      if (!src.includes(ARTICLE_TOKEN)) continue
      const hasReviewer = REVIEWED_BY_TOKENS.some((t) => src.includes(t))
      if (!hasReviewer) offenders.push(rel)
    }
    if (offenders.length > 0) {
      throw new Error(
        `Routes Article sans reviewedBy ni helper :\n  - ${offenders.join('\n  - ')}\n\n` +
          `Soit câbler reviewedBy (cf. patterns Tier 1-8), soit ajouter à EXEMPT_ROUTES avec justification.`
      )
    }
    expect(offenders).toEqual([])
  })

  it('les routes exemptées existent réellement (pas de drift de stale exemption)', () => {
    const stale: string[] = []
    const exemptList = Array.from(EXEMPT_ROUTES)
    for (const exempt of exemptList) {
      const full = path.join(PUBLIC_ROOT, ...exempt.split('/'))
      if (!fs.existsSync(full)) stale.push(exempt)
    }
    expect(stale, `Exemptions périmées à retirer : ${stale.join(', ')}`).toEqual([])
  })
})
