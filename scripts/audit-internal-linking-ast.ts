/**
 * Internal linking audit — AST grade.
 *
 * Uses @babel/parser + @babel/traverse to understand Link/a emissions,
 * including dynamic hrefs, conditional rel attrs, and .map()/loop wrappers
 * (bulk emitters).
 *
 * Produces a report with honest metrics that reflect the real SSR output.
 */

import * as path from 'path'
import * as fs from 'fs'
import { glob } from 'glob'
import { parse } from '@babel/parser'
import traverseDefault from '@babel/traverse'
import type { NodePath } from '@babel/traverse'
import * as t from '@babel/types'

// Babel's traverse default export is a CJS interop — handle both shapes
const traverse: typeof traverseDefault =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (traverseDefault as any).default ?? traverseDefault

const ROOT = path.join(__dirname, '..')
const APP_DIR = path.join(ROOT, 'src', 'app', '(public)')
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components')
const REPORT_PATH = path.join(
  ROOT,
  'reports',
  `internal-linking-audit-ast-${new Date().toISOString().slice(0, 10)}.md`
)

type LinkEmission = {
  sourceFile: string
  sourceRoute: string | null
  targetStatic: string | null
  targetPattern: string | null
  rel: string | null
  relIsDynamic: boolean
  anchorText: string | null
  insideMap: boolean
  insideConditional: boolean
  tagName: 'Link' | 'a' | 'router.push' | 'router.replace' | 'window.location' | 'span-href'
  line: number
}

type RouteTemplate = {
  filePath: string
  route: string
  hasBreadcrumbSchema: boolean
  hasRobotsNoindexStatic: boolean
  hasRobotsNoindexConditional: boolean
  linksOut: LinkEmission[]
}

const ALL_LINKS: LinkEmission[] = []
const ROUTE_TEMPLATES: RouteTemplate[] = []

// ---------- helpers ----------

function filePathToRoute(filePath: string): string {
  const rel = path.relative(APP_DIR, filePath).replace(/\\/g, '/')
  if (!rel.endsWith('page.tsx')) return ''
  let route = '/' + rel.replace(/\/page\.tsx$/, '')
  route = route.replace(/\/\([^)]+\)/g, '')
  if (route === '' || route === '/') return '/'
  return route
}

// Try to evaluate a JSX attribute expression to a string pattern.
// Returns { static: '/foo' } if fully literal, or { pattern: '/services/[x]/[x]' } if template literal with holes.
function evalHrefExpression(node: t.JSXExpressionContainer['expression'] | t.StringLiteral): {
  static?: string
  pattern?: string
} {
  if (t.isStringLiteral(node)) return { static: node.value }
  if (t.isTemplateLiteral(node)) {
    const parts: string[] = []
    for (let i = 0; i < node.quasis.length; i++) {
      parts.push(node.quasis[i].value.cooked ?? node.quasis[i].value.raw)
      if (i < node.expressions.length) parts.push('[x]')
    }
    return { pattern: parts.join('') }
  }
  if (t.isBinaryExpression(node) && node.operator === '+') {
    // 'str' + something
    const left = t.isStringLiteral(node.left) ? node.left.value : null
    const right = t.isStringLiteral(node.right) ? node.right.value : null
    if (left !== null && right !== null) return { static: left + right }
    return { pattern: (left ?? '[x]') + (right ?? '[x]') }
  }
  if (t.isConditionalExpression(node)) {
    // Pick consequent if literal
    const con = evalHrefExpression(node.consequent as t.Expression)
    if (con.static || con.pattern) return con
  }
  return {}
}

function extractAnchorText(
  opening: t.JSXOpeningElement,
  children: t.JSXElement['children']
): string | null {
  // Look for direct string child or a single expression
  for (const c of children) {
    if (t.isJSXText(c)) {
      const v = c.value.trim()
      if (v) return v.slice(0, 120)
    }
    if (t.isJSXExpressionContainer(c)) {
      if (t.isStringLiteral(c.expression)) return c.expression.value.slice(0, 120)
      if (t.isTemplateLiteral(c.expression)) {
        return c.expression.quasis
          .map((q) => q.value.cooked ?? q.value.raw)
          .join('[x]')
          .slice(0, 120)
      }
      if (t.isIdentifier(c.expression)) return `{${c.expression.name}}`
      if (t.isMemberExpression(c.expression)) return `{...}`
    }
  }
  // Look at aria-label
  for (const attr of opening.attributes) {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'aria-label') {
      if (attr.value && t.isStringLiteral(attr.value))
        return `(aria) ${attr.value.value}`.slice(0, 120)
    }
  }
  return null
}

function isInsideMap(path: NodePath): boolean {
  let p: NodePath | null = path.parentPath
  while (p) {
    if (
      p.node.type === 'CallExpression' &&
      t.isMemberExpression((p.node as t.CallExpression).callee) &&
      t.isIdentifier(((p.node as t.CallExpression).callee as t.MemberExpression).property) &&
      (((p.node as t.CallExpression).callee as t.MemberExpression).property as t.Identifier)
        .name === 'map'
    ) {
      return true
    }
    p = p.parentPath
  }
  return false
}

function isInsideConditional(path: NodePath): boolean {
  let p: NodePath | null = path.parentPath
  while (p) {
    if (p.node.type === 'ConditionalExpression' || p.node.type === 'LogicalExpression') return true
    p = p.parentPath
  }
  return false
}

function extractRel(opening: t.JSXOpeningElement): { value: string | null; isDynamic: boolean } {
  for (const attr of opening.attributes) {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'rel') {
      if (!attr.value) return { value: null, isDynamic: false }
      if (t.isStringLiteral(attr.value)) return { value: attr.value.value, isDynamic: false }
      if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression
        if (t.isStringLiteral(expr)) return { value: expr.value, isDynamic: false }
        if (t.isTemplateLiteral(expr)) {
          // Try to extract
          const val = expr.quasis.map((q) => q.value.cooked ?? '').join('[x]')
          return { value: val, isDynamic: true }
        }
        // Conditional: rel={cond ? 'nofollow' : undefined}
        if (t.isConditionalExpression(expr)) {
          const con = expr.consequent
          const alt = expr.alternate
          const vals: string[] = []
          if (t.isStringLiteral(con)) vals.push(con.value)
          if (t.isStringLiteral(alt)) vals.push(alt.value)
          return { value: vals.join('|'), isDynamic: true }
        }
        if (t.isIdentifier(expr)) return { value: `{${expr.name}}`, isDynamic: true }
        return { value: '{expr}', isDynamic: true }
      }
    }
  }
  return { value: null, isDynamic: false }
}

function extractHref(opening: t.JSXOpeningElement): {
  static: string | null
  pattern: string | null
  raw: string | null
} {
  for (const attr of opening.attributes) {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'href') {
      if (!attr.value) continue
      if (t.isStringLiteral(attr.value)) {
        return { static: attr.value.value, pattern: attr.value.value, raw: attr.value.value }
      }
      if (t.isJSXExpressionContainer(attr.value)) {
        const evald = evalHrefExpression(attr.value.expression as t.Expression)
        return {
          static: evald.static ?? null,
          pattern: evald.pattern ?? evald.static ?? null,
          raw: evald.static ?? evald.pattern ?? null,
        }
      }
    }
  }
  return { static: null, pattern: null, raw: null }
}

// ---------- main pass ----------

async function scanFile(filePath: string, routeContext: string | null): Promise<void> {
  const code = fs.readFileSync(filePath, 'utf-8')
  let ast
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: true,
    })
  } catch {
    return
  }

  const relFile = path.relative(ROOT, filePath).replace(/\\/g, '/')

  traverse(ast, {
    JSXOpeningElement(path) {
      const name = path.node.name
      let tag: LinkEmission['tagName'] | null = null
      if (t.isJSXIdentifier(name)) {
        if (name.name === 'Link') tag = 'Link'
        else if (name.name === 'a') tag = 'a'
        else if (name.name === 'span') {
          // check for href attr on span (non-conformant)
          if (
            path.node.attributes.some(
              (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'href'
            )
          ) {
            tag = 'span-href'
          }
        }
      }
      if (!tag) return

      const { static: staticHref, pattern } = extractHref(path.node)
      if (!staticHref && !pattern) return

      const target = staticHref ?? pattern ?? ''
      // skip external/anchors
      if (/^https?:\/\//.test(target) || target.startsWith('mailto:') || target.startsWith('tel:'))
        return
      if (target === '' || target === '#') return

      const rel = extractRel(path.node)

      // Find the enclosing JSXElement to get children → anchor
      const parent = path.parentPath?.node
      let anchor: string | null = null
      if (parent && t.isJSXElement(parent)) {
        anchor = extractAnchorText(path.node, parent.children)
      }

      const line = path.node.loc?.start.line ?? 0

      const emission: LinkEmission = {
        sourceFile: relFile,
        sourceRoute: routeContext,
        targetStatic: staticHref,
        targetPattern: pattern,
        rel: rel.value,
        relIsDynamic: rel.isDynamic,
        anchorText: anchor,
        insideMap: isInsideMap(path),
        insideConditional: isInsideConditional(path),
        tagName: tag,
        line,
      }
      ALL_LINKS.push(emission)
      if (routeContext) {
        const tmpl = ROUTE_TEMPLATES.find((r) => r.filePath === relFile)
        if (tmpl) tmpl.linksOut.push(emission)
      }
    },
    CallExpression(path) {
      const callee = path.node.callee
      // router.push / router.replace
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.property) &&
        (callee.property.name === 'push' || callee.property.name === 'replace') &&
        t.isIdentifier(callee.object) &&
        callee.object.name === 'router'
      ) {
        const arg = path.node.arguments[0]
        let target = ''
        if (arg && t.isStringLiteral(arg)) target = arg.value
        else if (arg && t.isTemplateLiteral(arg))
          target = arg.quasis.map((q) => q.value.cooked).join('[x]')
        if (!target) return
        ALL_LINKS.push({
          sourceFile: relFile,
          sourceRoute: routeContext,
          targetStatic: t.isStringLiteral(arg) ? target : null,
          targetPattern: target,
          rel: null,
          relIsDynamic: false,
          anchorText: null,
          insideMap: false,
          insideConditional: false,
          tagName: callee.property.name === 'push' ? 'router.push' : 'router.replace',
          line: path.node.loc?.start.line ?? 0,
        })
      }
      // window.location.href = ...
      if (
        t.isMemberExpression(callee) &&
        t.isMemberExpression(callee.object) &&
        t.isIdentifier(callee.object.object) &&
        callee.object.object.name === 'window' &&
        t.isIdentifier(callee.object.property) &&
        callee.object.property.name === 'location'
      ) {
        // window.location.assign(...) / replace(...)
        const arg = path.node.arguments[0]
        let target = ''
        if (arg && t.isStringLiteral(arg)) target = arg.value
        if (!target || /^https?:\/\//.test(target)) return
        ALL_LINKS.push({
          sourceFile: relFile,
          sourceRoute: routeContext,
          targetStatic: target,
          targetPattern: target,
          rel: null,
          relIsDynamic: false,
          anchorText: null,
          insideMap: false,
          insideConditional: false,
          tagName: 'window.location',
          line: path.node.loc?.start.line ?? 0,
        })
      }
    },
  })
}

async function main() {
  console.log('=== AST Internal Linking Audit — CEO Grade ===')
  console.log(`Scanning ${APP_DIR} + ${COMPONENTS_DIR}...`)

  const pageFiles = await glob('**/page.tsx', { cwd: APP_DIR, absolute: true })
  console.log(`  ${pageFiles.length} route templates`)

  const componentFiles = await glob('**/*.{tsx,ts}', { cwd: COMPONENTS_DIR, absolute: true })
  console.log(`  ${componentFiles.length} component files`)

  // Pre-register route templates
  for (const file of pageFiles) {
    const route = filePathToRoute(file)
    const content = fs.readFileSync(file, 'utf-8')
    ROUTE_TEMPLATES.push({
      filePath: path.relative(ROOT, file).replace(/\\/g, '/'),
      route,
      hasBreadcrumbSchema:
        content.includes('getBreadcrumbSchema(') || content.includes('BreadcrumbList'),
      hasRobotsNoindexStatic: /robots:\s*\{\s*index:\s*false/.test(content),
      hasRobotsNoindexConditional: /robots:\s*\{[^}]*index:\s*!/.test(content),
      linksOut: [],
    })
  }

  // Scan
  let done = 0
  for (const file of pageFiles) {
    await scanFile(file, filePathToRoute(file))
    done++
    if (done % 50 === 0) console.log(`  [pages ${done}/${pageFiles.length}]`)
  }
  done = 0
  for (const file of componentFiles) {
    await scanFile(file, null)
    done++
    if (done % 100 === 0) console.log(`  [components ${done}/${componentFiles.length}]`)
  }

  // ---------- analysis ----------
  console.log('\nAnalysing...')

  const ahrefLinks = ALL_LINKS.filter((l) => l.tagName === 'Link' || l.tagName === 'a')
  const nonConform = ALL_LINKS.filter(
    (l) =>
      l.tagName === 'router.push' ||
      l.tagName === 'router.replace' ||
      l.tagName === 'window.location' ||
      l.tagName === 'span-href'
  )

  // Normalise target patterns for graph analysis
  const normalise = (s: string | null) =>
    s ? s.replace(/\?.*$/, '').replace(/#.*$/, '').replace(/\/$/, '') || '/' : ''

  const targetCounts = new Map<string, number>()
  for (const l of ahrefLinks) {
    const t = normalise(l.targetPattern ?? l.targetStatic)
    if (!t.startsWith('/')) continue
    targetCounts.set(t, (targetCounts.get(t) ?? 0) + 1)
  }

  // Known route patterns (from templates)
  const knownRoutes = new Set<string>()
  for (const tmpl of ROUTE_TEMPLATES) {
    const normed = tmpl.route.replace(/\[[^\]]+\]/g, '[x]').replace(/\/$/, '') || '/'
    knownRoutes.add(normed)
  }
  knownRoutes.add('/')
  knownRoutes.add('') // homepage sometimes rendered as ''

  // Orphans: route templates where no link targets their pattern
  const referencedRoutes = new Set<string>()
  for (const [target] of targetCounts) {
    const shape = target
      .replace(/\[x\]/g, '[x]')
      .replace(/\/[^/]+/g, (seg) => (/\[x\]/.test(seg) ? seg : seg))
    // try both raw and stylised
    referencedRoutes.add(target)
    // add pattern-matched shape
    const segs = target.split('/').filter(Boolean)
    for (const kr of knownRoutes) {
      const krs = kr.split('/').filter(Boolean)
      if (krs.length !== segs.length) continue
      let match = true
      for (let i = 0; i < krs.length; i++) {
        if (krs[i] === '[x]') continue
        if (segs[i].includes('[x]')) continue
        if (krs[i] !== segs[i]) {
          match = false
          break
        }
      }
      if (match) referencedRoutes.add(kr)
    }
  }

  const orphanTemplates = ROUTE_TEMPLATES.filter((t) => {
    const normed = t.route.replace(/\[[^\]]+\]/g, '[x]').replace(/\/$/, '') || '/'
    if (normed === '/' || t.route === '/') return false
    return !referencedRoutes.has(normed)
  })

  // Dangling
  const dangling: Array<{ target: string; count: number }> = []
  for (const [target, count] of targetCounts) {
    const segs = target.split('/').filter(Boolean)
    let matched = false
    for (const kr of knownRoutes) {
      const krs = kr.split('/').filter(Boolean)
      if (krs.length !== segs.length) continue
      let ok = true
      for (let i = 0; i < krs.length; i++) {
        if (krs[i] === '[x]') continue
        if (segs[i].includes('[x]')) continue
        if (krs[i] !== segs[i]) {
          ok = false
          break
        }
      }
      if (ok) {
        matched = true
        break
      }
    }
    if (
      !matched &&
      !target.startsWith('/api/') &&
      !target.startsWith('/_next/') &&
      !target.startsWith('/#')
    ) {
      dangling.push({ target, count })
    }
  }

  // Density per template (static counts — doesn't account for .map() bulk)
  const densityPerTemplate = ROUTE_TEMPLATES.map((t) => ({
    route: t.route,
    staticCount: t.linksOut.length,
    mapCount: t.linksOut.filter((l) => l.insideMap).length,
    dynCount: t.linksOut.filter((l) => l.targetPattern?.includes('[x]')).length,
  })).sort((a, b) => a.staticCount - b.staticCount)

  // Anchor diversity for top targets
  const anchorsByTarget = new Map<string, Set<string>>()
  for (const l of ahrefLinks) {
    if (!l.anchorText) continue
    const tg = normalise(l.targetPattern ?? l.targetStatic)
    if (!anchorsByTarget.has(tg)) anchorsByTarget.set(tg, new Set())
    anchorsByTarget.get(tg)!.add(l.anchorText.toLowerCase())
  }
  const lowDiversity = Array.from(anchorsByTarget.entries())
    .filter(([, s]) => s.size < 3)
    .map(([tg, s]) => ({ target: tg, variants: s.size, inbound: targetCounts.get(tg) ?? 0 }))
    .filter((x) => x.inbound >= 5)
    .sort((a, b) => b.inbound - a.inbound)

  // rel=nofollow sculpting
  const nofollowLinks = ahrefLinks.filter((l) => l.rel?.includes('nofollow'))
  const dynamicNofollow = nofollowLinks.filter((l) => l.relIsDynamic)
  const sponsoredLinks = ahrefLinks.filter((l) => l.rel?.includes('sponsored'))
  const ugcLinks = ahrefLinks.filter((l) => l.rel?.includes('ugc'))

  // Breadcrumb coverage
  const missingBreadcrumb = ROUTE_TEMPLATES.filter((t) => !t.hasBreadcrumbSchema && t.route !== '/')

  // Noindex templates (excluded from indexable-page density expectations)
  const noindexTemplates = ROUTE_TEMPLATES.filter(
    (t) => t.hasRobotsNoindexStatic || t.hasRobotsNoindexConditional
  )

  // ---------- report ----------
  const report: string[] = []
  report.push(`# Internal Linking Audit — AST Grade`)
  report.push(`\nGenerated ${new Date().toISOString()}\n`)
  report.push(
    `**Scope**: ${ROUTE_TEMPLATES.length} route templates + ${componentFiles.length} components`
  )
  report.push(`**Total link emissions detected**: ${ALL_LINKS.length}`)
  report.push(`- <Link>/<a href>: ${ahrefLinks.length}`)
  report.push(
    `- Emitted inside \`.map()\` (bulk, multiplies by N): ${ahrefLinks.filter((l) => l.insideMap).length}`
  )
  report.push(
    `- Dynamic pattern (href with \`[x]\`): ${ahrefLinks.filter((l) => l.targetPattern?.includes('[x]')).length}`
  )
  report.push(`- Non-conformant (Google ignores): ${nonConform.length}`)
  report.push(`\n---\n`)

  // Axis 1
  report.push(`## Axis 1 — Link discoverability (Google: <a href> only)`)
  report.push(`\n**${nonConform.length}** non-conformant emissions.\n`)
  if (nonConform.length > 0) {
    const byKind = new Map<string, number>()
    for (const l of nonConform) byKind.set(l.tagName, (byKind.get(l.tagName) ?? 0) + 1)
    report.push(`| Kind | Count |`)
    report.push(`|---|---|`)
    for (const [k, c] of Array.from(byKind.entries()).sort((a, b) => b[1] - a[1])) {
      report.push(`| \`${k}\` | ${c} |`)
    }
    report.push(`\nTop offenders:\n`)
    for (const l of nonConform.slice(0, 15)) {
      report.push(
        `- \`${l.sourceFile}:${l.line}\` — \`${l.tagName}\` → \`${(l.targetPattern ?? l.targetStatic ?? '').slice(0, 80)}\``
      )
    }
  }

  // Axis 3
  report.push(`\n## Axis 3 — Orphan route templates (0 inbound)`)
  report.push(
    `\n**${orphanTemplates.length}** / ${ROUTE_TEMPLATES.length} templates have no inbound contextual link detected.\n`
  )
  report.push(
    `⚠️ Caveat: dynamic routes like \`/guides/[slug]\` are matched by pattern, so a Link to \`/guides/X\` counts for \`/guides/[slug]\`. Orphans below are genuinely disconnected.\n`
  )
  for (const o of orphanTemplates.slice(0, 40)) {
    report.push(
      `- \`${o.route}\` _(${o.hasRobotsNoindexStatic ? 'noindex' : o.hasRobotsNoindexConditional ? 'cond-noindex' : 'indexable'})_`
    )
  }
  if (orphanTemplates.length > 40) report.push(`\n_... +${orphanTemplates.length - 40} more._`)

  // Axis 4
  report.push(`\n## Axis 4 — Dangling internal links (target route doesn't exist)`)
  report.push(`\n**${dangling.length}** distinct dangling targets.\n`)
  for (const d of dangling.slice(0, 40)) {
    report.push(`- \`${d.target}\` (${d.count} refs)`)
  }
  if (dangling.length > 40) report.push(`\n_... +${dangling.length - 40} more._`)

  // Axis 5
  report.push(`\n## Axis 5 — Density per template`)
  report.push(
    `\nStatic emission count (each \`.map()\` counts as 1 emission, but multiplies at runtime by N).\n`
  )
  const underDense = densityPerTemplate.filter((d) => d.staticCount < 3)
  const overDense = densityPerTemplate.filter((d) => d.staticCount > 30)
  report.push(`- Templates with < 3 emissions: **${underDense.length}**`)
  report.push(`- Templates with > 30 emissions (rich hubs): **${overDense.length}**`)
  report.push(`\nLightest 15 (zero static links = pure dead-ends if no components render links):\n`)
  for (const d of densityPerTemplate.slice(0, 15)) {
    report.push(`- \`${d.route}\` — static=${d.staticCount}, map=${d.mapCount}, dyn=${d.dynCount}`)
  }
  report.push(`\nHeaviest 15:\n`)
  for (const d of densityPerTemplate.slice(-15).reverse()) {
    report.push(`- \`${d.route}\` — static=${d.staticCount}, map=${d.mapCount}, dyn=${d.dynCount}`)
  }

  // Axis 6
  report.push(`\n## Axis 6 — Anchor diversity`)
  report.push(`\nTargets with ≥5 inbound and <3 anchor variants (anchor over-optimisation risk):\n`)
  if (lowDiversity.length > 0) {
    report.push(`| Target | Inbound | Variants |`)
    report.push(`|---|---|---|`)
    for (const x of lowDiversity.slice(0, 30)) {
      report.push(`| \`${x.target}\` | ${x.inbound} | ${x.variants} |`)
    }
  } else {
    report.push(`\n✅ None detected.`)
  }

  // Axis 7
  report.push(`\n## Axis 7 — rel attribute usage`)
  report.push(
    `\n- Total with \`rel="nofollow"\`: **${nofollowLinks.length}** (dynamic: ${dynamicNofollow.length})`
  )
  report.push(`- \`rel="sponsored"\`: **${sponsoredLinks.length}**`)
  report.push(`- \`rel="ugc"\`: **${ugcLinks.length}**`)
  report.push(
    `\nGoogle requires: \`sponsored\` MANDATORY on paid; \`ugc\` on user content (reviews); \`nofollow\` for untrusted. Dynamic \`rel\` (e.g. \`{noindex ? 'nofollow' : undefined}\`) = PageRank sculpting.`
  )

  // Axis 10
  report.push(`\n## Axis 10 — BreadcrumbList schema coverage`)
  report.push(
    `\nTemplates WITHOUT breadcrumb schema: **${missingBreadcrumb.length}** / ${ROUTE_TEMPLATES.length}\n`
  )
  for (const m of missingBreadcrumb.slice(0, 40)) {
    report.push(`- \`${m.route}\``)
  }
  if (missingBreadcrumb.length > 40) report.push(`\n_... +${missingBreadcrumb.length - 40} more._`)

  // Executive summary
  report.push(`\n---\n## Executive Summary\n`)
  report.push(`| Axis | Metric | Status |`)
  report.push(`|---|---|---|`)
  report.push(
    `| 1. Discoverability | ${nonConform.length} non-conformant | ${nonConform.length === 0 ? '✅' : '⚠️'} |`
  )
  report.push(
    `| 3. Orphans | ${orphanTemplates.length} / ${ROUTE_TEMPLATES.length} | ${orphanTemplates.length <= 5 ? '✅' : '⚠️'} |`
  )
  report.push(
    `| 4. Dangling | ${dangling.length} targets | ${dangling.length === 0 ? '✅' : '⚠️'} |`
  )
  report.push(
    `| 5. Under-dense (<3) | ${underDense.length} templates | ${underDense.length <= 10 ? '✅' : '⚠️'} |`
  )
  report.push(
    `| 6. Low anchor diversity | ${lowDiversity.length} targets | ${lowDiversity.length <= 3 ? '✅' : '⚠️'} |`
  )
  report.push(
    `| 7. rel=nofollow sculpting | ${nofollowLinks.length} (${dynamicNofollow.length} dynamic) | ${nofollowLinks.length > 0 ? '✅' : '⚠️'} |`
  )
  report.push(
    `| 7b. rel=sponsored | ${sponsoredLinks.length} | ${sponsoredLinks.length > 0 ? '✅' : 'N/A'} |`
  )
  report.push(`| 7c. rel=ugc | ${ugcLinks.length} | ${ugcLinks.length > 0 ? '✅' : 'N/A'} |`)
  report.push(
    `| 10. Breadcrumb coverage | ${ROUTE_TEMPLATES.length - missingBreadcrumb.length} / ${ROUTE_TEMPLATES.length} | ${missingBreadcrumb.length <= 5 ? '✅' : '⚠️'} |`
  )

  // Noindex stats (context only)
  report.push(`\n### Context`)
  report.push(
    `- Templates with static noindex: ${noindexTemplates.filter((t) => t.hasRobotsNoindexStatic).length}`
  )
  report.push(
    `- Templates with conditional noindex: ${noindexTemplates.filter((t) => t.hasRobotsNoindexConditional).length}`
  )
  report.push(`- Indexable templates: ${ROUTE_TEMPLATES.length - noindexTemplates.length}`)

  if (!fs.existsSync(path.dirname(REPORT_PATH))) {
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  }
  fs.writeFileSync(REPORT_PATH, report.join('\n'))
  console.log(`\n✅ Report: ${REPORT_PATH}`)
  console.log(
    `   ${ROUTE_TEMPLATES.length} templates · ${ALL_LINKS.length} emissions · ${orphanTemplates.length} orphans · ${dangling.length} dangling · ${nofollowLinks.length} nofollow (${dynamicNofollow.length} dyn)`
  )
}

main().catch((e) => {
  console.error('fatal:', e)
  process.exit(1)
})
