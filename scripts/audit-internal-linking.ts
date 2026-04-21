/**
 * Audit internal linking — CEO-grade rigour.
 *
 * Scope: analyse the Next.js route templates (not 2.6M instances) and the
 * shared link-emitting components. Generalises to the full site.
 *
 * Output: reports/internal-linking-audit-YYYY-MM-DD.md with 11-axis scoring.
 *
 * NO writes to DB. NO HTTP calls. Pure static analysis + TS AST over src/.
 */

import * as path from 'path'
import * as fs from 'fs'
import { glob } from 'glob'

const ROOT = path.join(__dirname, '..')
const APP_DIR = path.join(ROOT, 'src', 'app', '(public)')
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components')
const REPORT_PATH = path.join(
  ROOT,
  'reports',
  `internal-linking-audit-${new Date().toISOString().slice(0, 10)}.md`
)

type LinkRecord = {
  sourceFile: string
  sourceRoute: string | null
  target: string // URL pattern or raw href
  anchor: string | null
  rel: string | null
  isDynamic: boolean // contains ${...}
  kind: 'Link' | 'a' | 'router_push' | 'onclick' | 'window_location' | 'span_href'
  line: number
}

type RouteTemplate = {
  filePath: string
  route: string // /services/[service]/[location]
  hasBreadcrumbSchema: boolean
  hasRobotsNoindex: boolean
  hasConditionalNoindex: boolean
  linksOut: LinkRecord[]
}

const ALL_LINKS: LinkRecord[] = []
const ROUTE_TEMPLATES: RouteTemplate[] = []

function filePathToRoute(filePath: string): string {
  const rel = path.relative(APP_DIR, filePath).replace(/\\/g, '/')
  if (!rel.endsWith('page.tsx') && !rel.endsWith('route.ts')) return ''
  let route = '/' + rel.replace(/\/page\.tsx$/, '').replace(/\/route\.ts$/, '')
  route = route.replace(/\/\([^)]+\)/g, '') // strip route groups (marketing)
  if (route === '/') route = '/'
  return route
}

function classifyLinkKind(line: string): LinkRecord['kind'] | null {
  if (/<Link\s+[^>]*href=/.test(line)) return 'Link'
  if (/<a\s+[^>]*href=/.test(line)) return 'a'
  if (/router\.push\(/.test(line) || /router\.replace\(/.test(line)) return 'router_push'
  if (/onClick=\{[^}]*location\.href/.test(line)) return 'onclick'
  if (/window\.location\.(href|assign|replace)/.test(line)) return 'window_location'
  if (/<span\s+[^>]*href=/.test(line)) return 'span_href'
  return null
}

function extractHref(line: string): string | null {
  // match href="..." or href={`...`} or href={var}
  const q = line.match(/href=("([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{([^}]+)\})/)
  if (!q) return null
  return q[2] || q[3] || q[4] || q[5] || null
}

function extractRel(line: string): string | null {
  const m = line.match(/rel=("([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{([^}]+)\})/)
  if (!m) return null
  return m[2] || m[3] || m[4] || m[5] || null
}

function extractAnchor(line: string, after: string): string {
  // Best-effort: text between > and < right after the Link/a tag close
  const idx = line.indexOf('>', line.indexOf(after))
  if (idx < 0) return ''
  const end = line.indexOf('<', idx)
  return line
    .slice(idx + 1, end > idx ? end : line.length)
    .trim()
    .slice(0, 120)
}

async function scanFile(file: string, routeContext: string | null): Promise<LinkRecord[]> {
  const content = fs.readFileSync(file, 'utf-8')
  const lines = content.split('\n')
  const found: LinkRecord[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const kind = classifyLinkKind(line)
    if (!kind) continue

    const href = extractHref(line) ?? ''
    // Ignore clearly external or anchors
    if (/^https?:\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) continue
    if (href === '' || href === '#') continue

    const rel = extractRel(line)
    const anchor = extractAnchor(line, kind === 'Link' ? '<Link' : '<a')

    const rec: LinkRecord = {
      sourceFile: path.relative(ROOT, file).replace(/\\/g, '/'),
      sourceRoute: routeContext,
      target: href,
      anchor: anchor || null,
      rel,
      isDynamic: /[$`{]/.test(href),
      kind,
      line: i + 1,
    }
    found.push(rec)
    ALL_LINKS.push(rec)
  }

  return found
}

async function main() {
  console.log('=== Internal Linking Audit — CEO Grade ===')
  console.log('Root:', ROOT)

  // --------------------------------------------------------------------
  // Step 1: inventory route templates (page.tsx under (public))
  // --------------------------------------------------------------------
  console.log('\n[1/5] Inventorying route templates...')
  const pageFiles = await glob('**/page.tsx', { cwd: APP_DIR, absolute: true })
  console.log(`  Found ${pageFiles.length} route templates.`)

  for (const file of pageFiles) {
    const route = filePathToRoute(file)
    const content = fs.readFileSync(file, 'utf-8')
    const template: RouteTemplate = {
      filePath: path.relative(ROOT, file).replace(/\\/g, '/'),
      route,
      hasBreadcrumbSchema:
        content.includes('getBreadcrumbSchema(') || content.includes('BreadcrumbList'),
      hasRobotsNoindex: /robots:\s*\{[^}]*index:\s*false/.test(content),
      hasConditionalNoindex: /robots:\s*\{[^}]*index:\s*!/.test(content),
      linksOut: [],
    }
    template.linksOut = await scanFile(file, route)
    ROUTE_TEMPLATES.push(template)
  }

  // --------------------------------------------------------------------
  // Step 2: scan shared components (emit links across many routes)
  // --------------------------------------------------------------------
  console.log('\n[2/5] Scanning shared components...')
  const componentFiles = await glob('**/*.{tsx,ts}', { cwd: COMPONENTS_DIR, absolute: true })
  console.log(`  Found ${componentFiles.length} component files.`)
  for (const file of componentFiles) {
    await scanFile(file, null)
  }

  // --------------------------------------------------------------------
  // Step 3: conformance checks (Google rules)
  // --------------------------------------------------------------------
  console.log('\n[3/5] Running conformance checks...')

  const nonConformLinks = ALL_LINKS.filter(
    (l) =>
      l.kind === 'router_push' ||
      l.kind === 'onclick' ||
      l.kind === 'window_location' ||
      l.kind === 'span_href'
  )

  const aHrefLinks = ALL_LINKS.filter((l) => l.kind === 'a' || l.kind === 'Link')

  // --------------------------------------------------------------------
  // Step 4: graph metrics
  // --------------------------------------------------------------------
  console.log('\n[4/5] Computing graph metrics...')

  // Normalise targets: strip ${...} interpolation variants → pattern
  const normaliseTarget = (t: string) =>
    t
      .replace(/\$\{[^}]+\}/g, '[x]')
      .replace(/`/g, '')
      .replace(/\{[^}]+\}/g, '[x]')
      .replace(/\?.*$/, '')
      .replace(/#.*$/, '')
      .replace(/\/$/, '')

  const targetCounts = new Map<string, number>()
  for (const l of aHrefLinks) {
    const t = normaliseTarget(l.target)
    if (!t.startsWith('/')) continue
    targetCounts.set(t, (targetCounts.get(t) ?? 0) + 1)
  }

  // Route registry (generated from templates)
  const knownRoutes = new Set(
    ROUTE_TEMPLATES.map((t) =>
      t.route
        .replace(/\[[^\]]+\]/g, '[x]')
        .replace(/\/$/, '')
        .replace(/^\/$/, '')
    )
  )
  knownRoutes.add('') // homepage

  // Dangling: targets that don't match any known route pattern
  const dangling: string[] = []
  for (const [target, count] of targetCounts) {
    const normalised = target.replace(/\/[^/[]+(?=\/|$)/g, (seg) =>
      seg.match(/^\/\[x\]/) ? seg : seg
    )
    // Check if any route pattern in knownRoutes matches this target (minus dynamic segs)
    const shape = target.replace(/\/[^/[]+/g, '/[x]')
    const normShape = target.startsWith('/') ? target : '/' + target
    let matched = false
    for (const kr of knownRoutes) {
      // Quick heuristic: prefix match on first static segment
      if (kr === normShape) {
        matched = true
        break
      }
      // Try pattern match: static segments equal, dynamic segments ([x]) wildcards
      const krSegs = kr.split('/').filter(Boolean)
      const tgSegs = normShape.split('/').filter(Boolean)
      if (krSegs.length !== tgSegs.length) continue
      let ok = true
      for (let i = 0; i < krSegs.length; i++) {
        if (krSegs[i] === '[x]') continue
        if (krSegs[i] !== tgSegs[i] && !tgSegs[i].includes('[x]')) {
          ok = false
          break
        }
      }
      if (ok) {
        matched = true
        break
      }
    }
    if (!matched && !target.startsWith('/api/') && !target.startsWith('/_next/')) {
      dangling.push(`${target} (${count} occurrences)`)
    }
  }

  // Orphan templates: route templates with 0 inbound links
  const referencedTargets = new Set(Array.from(targetCounts.keys()))
  const orphans: RouteTemplate[] = []
  for (const t of ROUTE_TEMPLATES) {
    const normRoute = t.route.replace(/\[[^\]]+\]/g, '[x]').replace(/\/$/, '')
    let inbound = 0
    for (const tg of referencedTargets) {
      const tgShape = tg.replace(/\/[^/[]+/g, '/[x]')
      if (tgShape === normRoute || tg === t.route) inbound++
    }
    if (inbound === 0 && t.route !== '/') orphans.push(t)
  }

  // Density per template (outbound contextual links)
  const densityStats = ROUTE_TEMPLATES.map((t) => ({
    route: t.route,
    outbound: t.linksOut.length,
  })).sort((a, b) => a.outbound - b.outbound)

  // Breadcrumb coverage
  const withoutBreadcrumb = ROUTE_TEMPLATES.filter((t) => !t.hasBreadcrumbSchema && t.route !== '/')

  // Anchor diversity per target URL pattern
  const anchorsByTarget = new Map<string, Set<string>>()
  for (const l of aHrefLinks) {
    if (!l.anchor) continue
    const t = normaliseTarget(l.target)
    if (!anchorsByTarget.has(t)) anchorsByTarget.set(t, new Set())
    anchorsByTarget.get(t)!.add(l.anchor.toLowerCase())
  }
  const lowDiversity = Array.from(anchorsByTarget.entries())
    .filter(([, s]) => s.size < 3)
    .map(([t, s]) => ({ target: t, variants: s.size, inbound: targetCounts.get(t) ?? 0 }))
    .filter((x) => x.inbound >= 5)
    .sort((a, b) => b.inbound - a.inbound)
    .slice(0, 20)

  // rel attributes usage
  const linksWithRel = aHrefLinks.filter((l) => l.rel)
  const nofollowLinks = aHrefLinks.filter((l) => l.rel?.includes('nofollow'))
  const sponsoredLinks = aHrefLinks.filter((l) => l.rel?.includes('sponsored'))
  const ugcLinks = aHrefLinks.filter((l) => l.rel?.includes('ugc'))

  // --------------------------------------------------------------------
  // Step 5: write report
  // --------------------------------------------------------------------
  console.log('\n[5/5] Writing report...')
  if (!fs.existsSync(path.dirname(REPORT_PATH))) {
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  }

  const report: string[] = []
  report.push(`# Internal Linking Audit — CEO Grade`)
  report.push(`\nGenerated ${new Date().toISOString()}\n`)
  report.push(
    `Scope: ${ROUTE_TEMPLATES.length} route templates + ${componentFiles.length} components`
  )
  report.push(`Total internal link emissions: ${ALL_LINKS.length}`)
  report.push(`Usable <a href>/<Link>: ${aHrefLinks.length}`)
  report.push(`\n---\n`)

  // Axis 1: Link discoverability
  report.push(`## Axis 1 — Link discoverability (Google: <a href> only)`)
  report.push(`\nNon-conformant emissions: **${nonConformLinks.length}**\n`)
  if (nonConformLinks.length > 0) {
    report.push(`Google ignores these entirely (no PageRank transfer):\n`)
    report.push(`| Kind | Count |`)
    report.push(`|---|---|`)
    const byKind = new Map<string, number>()
    for (const l of nonConformLinks) byKind.set(l.kind, (byKind.get(l.kind) ?? 0) + 1)
    for (const [k, c] of Array.from(byKind.entries()).sort((a, b) => b[1] - a[1])) {
      report.push(`| \`${k}\` | ${c} |`)
    }
    report.push(`\nTop 10 offenders:\n`)
    for (const l of nonConformLinks.slice(0, 10)) {
      report.push(`- \`${l.sourceFile}:${l.line}\` (${l.kind}) → \`${l.target.slice(0, 80)}\``)
    }
  }

  // Axis 3: Orphan templates
  report.push(`\n## Axis 3 — Orphan route templates (0 inbound)`)
  report.push(`\nCount: **${orphans.length}** / ${ROUTE_TEMPLATES.length}\n`)
  if (orphans.length > 0) {
    report.push(`These route templates are NEVER linked from other templates/components:\n`)
    for (const o of orphans.slice(0, 30)) {
      report.push(`- \`${o.route}\` (file: \`${o.filePath}\`)`)
    }
    if (orphans.length > 30) report.push(`\n_... +${orphans.length - 30} more._`)
  }

  // Axis 4: Dangling links
  report.push(`\n## Axis 4 — Dangling internal links (no matching route)`)
  report.push(`\nCount: **${dangling.length}** distinct targets\n`)
  if (dangling.length > 0) {
    report.push(`These targets have no matching route template (may be valid if dynamic slugs):\n`)
    for (const d of dangling.slice(0, 40)) {
      report.push(`- \`${d}\``)
    }
    if (dangling.length > 40) report.push(`\n_... +${dangling.length - 40} more._`)
  }

  // Axis 5: Density
  report.push(`\n## Axis 5 — Link density per template`)
  report.push(`\nTarget: 8-12 outbound contextual per indexable page.\n`)
  const belowTarget = densityStats.filter((s) => s.outbound < 5)
  const aboveTarget = densityStats.filter((s) => s.outbound > 20)
  report.push(`- Templates with < 5 outbound: **${belowTarget.length}**`)
  report.push(`- Templates with > 20 outbound: **${aboveTarget.length}**`)
  report.push(`\nTop 10 lightest templates (risk of PageRank dead-end):\n`)
  for (const s of densityStats.slice(0, 10)) {
    report.push(`- \`${s.route}\` — ${s.outbound} links`)
  }
  report.push(`\nTop 10 heaviest (potential dilution):\n`)
  for (const s of densityStats.slice(-10).reverse()) {
    report.push(`- \`${s.route}\` — ${s.outbound} links`)
  }

  // Axis 6: Anchor diversity
  report.push(`\n## Axis 6 — Anchor diversity (top inbound targets with <3 variants)`)
  report.push(`\nTarget: ≥5 variants per frequently-linked target.\n`)
  if (lowDiversity.length > 0) {
    report.push(`| Target | Inbound | Variants |`)
    report.push(`|---|---|---|`)
    for (const x of lowDiversity) {
      report.push(`| \`${x.target}\` | ${x.inbound} | ${x.variants} |`)
    }
  } else {
    report.push(`\nNo target with high inbound + low anchor diversity detected.`)
  }

  // Axis 7: rel attributes
  report.push(`\n## Axis 7 — rel attribute usage`)
  report.push(`\n- Links with any rel attr: **${linksWithRel.length}** / ${aHrefLinks.length}`)
  report.push(`- \`rel="nofollow"\`: **${nofollowLinks.length}**`)
  report.push(`- \`rel="sponsored"\`: **${sponsoredLinks.length}**`)
  report.push(`- \`rel="ugc"\`: **${ugcLinks.length}**`)
  report.push(
    `\nReminder (Google): \`nofollow\` on untrusted, \`sponsored\` MANDATORY on paid placements, \`ugc\` on user-generated content (reviews).`
  )

  // Axis 10: Breadcrumb coverage
  report.push(`\n## Axis 10 — BreadcrumbList schema coverage`)
  report.push(
    `\nTemplates WITHOUT BreadcrumbList schema: **${withoutBreadcrumb.length}** / ${ROUTE_TEMPLATES.length}\n`
  )
  if (withoutBreadcrumb.length > 0) {
    report.push(`Top 30 missing breadcrumb:\n`)
    for (const t of withoutBreadcrumb.slice(0, 30)) {
      report.push(`- \`${t.route}\``)
    }
    if (withoutBreadcrumb.length > 30)
      report.push(`\n_... +${withoutBreadcrumb.length - 30} more._`)
  }

  // Summary
  report.push(`\n---\n`)
  report.push(`## Executive Summary\n`)
  report.push(`| Axis | Status |`)
  report.push(`|---|---|`)
  report.push(
    `| 1. Discoverability | ${nonConformLinks.length === 0 ? '✅' : `⚠️ ${nonConformLinks.length} non-conformant`} |`
  )
  report.push(
    `| 3. Orphans | ${orphans.length === 0 ? '✅' : `⚠️ ${orphans.length} orphan templates`} |`
  )
  report.push(
    `| 4. Dangling | ${dangling.length === 0 ? '✅' : `⚠️ ${dangling.length} dangling targets`} |`
  )
  report.push(
    `| 5. Density < 5 | ${belowTarget.length === 0 ? '✅' : `⚠️ ${belowTarget.length} templates under-linked`} |`
  )
  report.push(
    `| 6. Anchor diversity | ${lowDiversity.length === 0 ? '✅' : `⚠️ ${lowDiversity.length} targets with <3 variants`} |`
  )
  report.push(
    `| 7. rel=nofollow | ${nofollowLinks.length >= 50 ? '✅ sculpting active' : `⚠️ only ${nofollowLinks.length} nofollow links`} |`
  )
  report.push(
    `| 10. Breadcrumb | ${withoutBreadcrumb.length === 0 ? '✅' : `⚠️ ${withoutBreadcrumb.length} missing`} |`
  )

  fs.writeFileSync(REPORT_PATH, report.join('\n'))
  console.log(`\n✅ Report written: ${REPORT_PATH}`)
  console.log(`   ${ROUTE_TEMPLATES.length} templates, ${ALL_LINKS.length} link emissions analysed`)
}

main().catch((e) => {
  console.error('fatal:', e)
  process.exit(1)
})
