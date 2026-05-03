import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import { evaluateGonePath } from '../gone-paths'

/**
 * Sprint W Ahrefs 2026-05-03 — verrou sitewide anti-lien-cassé.
 *
 * Cause Sprint U + W : 2 liens Footer cassés (`/qualifications-rge`,
 * `/comparatifs`) sont restés invisibles pendant des semaines, générant
 * 459K liens 404 sortants par lien (footer rendu sur toutes les pages).
 * Soft-404 budget crawl massivement gaspillé.
 *
 * Stratégie : extraire tous les `href="/..."` statiques (sans `[`) des
 * composants de navigation principaux et vérifier qu'au moins UN des
 * 3 critères suivants est rempli :
 *
 *   1. Une route page.tsx existe à `src/app/(public)<href>/page.tsx`
 *   2. Une route page.tsx existe à `src/app/(auth)<href>/page.tsx`
 *   3. `evaluateGonePath(href)` retourne un redirect (301 connu)
 *
 * Sinon, le test échoue avec la liste des hrefs orphelins. Si quelqu'un
 * ajoute un lien vers une route inexistante au footer/header, le CI le
 * bloque immédiatement.
 *
 * Limitations connues :
 *   - Les routes dynamiques type `/services/[s]` ne sont pas testées
 *     (jamais hardcodées dans la nav)
 *   - Les liens externes (https://) sont ignorés
 *   - Les ancres `#foo` et query-only `?q=…` sont ignorées
 */

const REPO_ROOT = join(__dirname, '..', '..', '..', '..')
const NAV_COMPONENTS = [
  join(REPO_ROOT, 'src', 'components', 'Footer.tsx'),
  join(REPO_ROOT, 'src', 'components', 'HeaderClient.tsx'),
]

function extractStaticHrefs(filePath: string): string[] {
  const src = readFileSync(filePath, 'utf8')
  // Match href="/..." ou href='/...' avec valeurs littérales seulement
  // (exclut les template literals et expressions JSX dynamiques).
  const regex = /href=["'](\/[^"'`${}]+)["']/g
  const hrefs = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = regex.exec(src)) !== null) {
    let href = m[1]
    // Strip trailing slash sauf si c'est juste "/"
    if (href.length > 1 && href.endsWith('/')) href = href.slice(0, -1)
    // Skip routes dynamiques (ne devraient jamais être hardcodées)
    if (href.includes('[')) continue
    // Skip ancres pures
    if (href.startsWith('/#')) continue
    hrefs.add(href)
  }
  return Array.from(hrefs).sort()
}

function routeExists(href: string): boolean {
  if (href === '/') {
    return existsSync(join(REPO_ROOT, 'src', 'app', '(public)', 'page.tsx'))
  }
  // Strip query string et fragment
  const cleanHref = href.split('?')[0].split('#')[0]
  const candidates = [
    join(REPO_ROOT, 'src', 'app', '(public)', cleanHref, 'page.tsx'),
    join(REPO_ROOT, 'src', 'app', '(auth)', cleanHref, 'page.tsx'),
    join(REPO_ROOT, 'src', 'app', cleanHref, 'page.tsx'),
  ]
  return candidates.some((p) => existsSync(p))
}

function hasRedirect(href: string): boolean {
  const decision = evaluateGonePath(href)
  return decision.redirect !== undefined
}

describe('Sprint W — verrou sitewide anti-lien-cassé sur nav components', () => {
  for (const filePath of NAV_COMPONENTS) {
    const fileName = filePath.split(/[\\/]/).pop() ?? filePath
    describe(fileName, () => {
      const hrefs = extractStaticHrefs(filePath)

      it(`extrait au moins 5 hrefs statiques (sanity check)`, () => {
        expect(hrefs.length).toBeGreaterThanOrEqual(5)
      })

      it(`tous les hrefs résolvent vers une route existante OU un redirect 301 connu`, () => {
        const broken: string[] = []
        for (const href of hrefs) {
          if (!routeExists(href) && !hasRedirect(href)) {
            broken.push(href)
          }
        }
        expect(broken, `Liens cassés détectés dans ${fileName}: ${broken.join(', ')}`).toEqual([])
      })
    })
  }
})
