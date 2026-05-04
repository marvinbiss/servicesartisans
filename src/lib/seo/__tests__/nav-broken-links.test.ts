import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { evaluateGonePath } from '../gone-paths'

// Sprint W-fix Ahrefs 2026-05-03 — `process.cwd()` au lieu de 4× `..`.
// Plus stable si le test est déplacé. Vitest run with cwd = project root.
const REPO_ROOT = process.cwd()

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

const NAV_COMPONENTS = [
  join(REPO_ROOT, 'src', 'components', 'Footer.tsx'),
  join(REPO_ROOT, 'src', 'components', 'HeaderClient.tsx'),
  // Sprint W-fix Ahrefs 2026-05-03 — étendu (Reviewer adversarial MEDIUM).
  // FooterClusterLinks rend ~50 hrefs sitewide non protégés par le verrou
  // initial. DynamicFooterLinks idem (~12 hrefs rotatifs).
  join(REPO_ROOT, 'src', 'components', 'seo', 'FooterClusterLinks.tsx'),
  join(REPO_ROOT, 'src', 'components', 'seo', 'DynamicFooterLinks.tsx'),
  // Sprint AI Ahrefs 2026-05-03 — étendu (audit adversarial MEDIUM #12).
  // Composants de navigation transverses qui rendent des hrefs statiques sur
  // de nombreuses pages. Sans ce verrou, un futur lien hardcodé vers une
  // route inexistante (ex: `/qualifications-rge` réintroduit) passerait
  // inaperçu jusqu'au prochain audit GSC.
  join(REPO_ROOT, 'src', 'components', 'Breadcrumb.tsx'),
  join(REPO_ROOT, 'src', 'components', 'seo', 'RelatedHubs.tsx'),
  join(REPO_ROOT, 'src', 'components', 'seo', 'BlogClusterLinks.tsx'),
  join(REPO_ROOT, 'src', 'components', 'seo', 'BlogServiceCityLinks.tsx'),
  join(REPO_ROOT, 'src', 'components', 'seo', 'DeepPageLinks.tsx'),
]

function extractStaticHrefs(filePath: string): string[] {
  const src = readFileSync(filePath, 'utf8')
  // 2 patterns détectés (Sprint W-fix 2026-05-03 — Reviewer adversarial) :
  //   1. JSX literal direct           : href="/path" ou href='/path'
  //   2. Data property dans objet     : { href: '/path', label: '...' }
  // Composants type FooterClusterLinks utilisent (2) avec href={item.href}
  // côté JSX — sans matcher (2) on ratait ~50 hrefs.
  const regexes = [
    /href=["'](\/[^"'`${}]+)["']/g, // pattern (1)
    /href:\s*["'](\/[^"'`${}]+)["']/g, // pattern (2)
  ]
  const hrefs = new Set<string>()
  for (const regex of regexes) {
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
  }
  return Array.from(hrefs).sort()
}

/**
 * Sprint W-fix Ahrefs 2026-05-03 — match routes statiques ET dynamiques.
 *
 * Pour chaque href `/seg1/seg2/...` on tente de trouver `page.tsx` en
 * acceptant qu'à chaque profondeur le segment soit soit le nom littéral
 * soit un dossier `[*]` (route dynamique). Couvre `/regions/bretagne` qui
 * matche `(public)/regions/[region]/page.tsx`.
 *
 * Algorithme : descente récursive depuis chaque route group, à chaque
 * niveau on cherche le segment exact OU n'importe quel segment commençant
 * par `[`. Au dernier segment, vérifie présence de `page.tsx`.
 */
const ROUTE_GROUPS = ['(public)', '(auth)', ''].map((g) =>
  g ? join(REPO_ROOT, 'src', 'app', g) : join(REPO_ROOT, 'src', 'app')
)

function findRouteRecursive(baseDir: string, segments: string[]): boolean {
  if (!existsSync(baseDir)) return false
  if (segments.length === 0) {
    return existsSync(join(baseDir, 'page.tsx'))
  }
  const [head, ...rest] = segments
  // 1. Match exact littéral
  const exactDir = join(baseDir, head)
  if (existsSync(exactDir) && statSync(exactDir).isDirectory()) {
    if (findRouteRecursive(exactDir, rest)) return true
  }
  // 2. Match catch-all dynamique [...]
  try {
    for (const entry of readdirSync(baseDir)) {
      if (entry.startsWith('[') && entry.endsWith(']')) {
        const dynDir = join(baseDir, entry)
        if (statSync(dynDir).isDirectory()) {
          if (findRouteRecursive(dynDir, rest)) return true
        }
      }
    }
  } catch {
    // baseDir n'est pas un dossier ou inaccessible — skip.
  }
  return false
}

function routeExists(href: string): boolean {
  if (href === '/') {
    return existsSync(join(REPO_ROOT, 'src', 'app', '(public)', 'page.tsx'))
  }
  const cleanHref = href.split('?')[0].split('#')[0]
  const segments = cleanHref.split('/').filter((s) => s.length > 0)
  return ROUTE_GROUPS.some((groupDir) => findRouteRecursive(groupDir, segments))
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
