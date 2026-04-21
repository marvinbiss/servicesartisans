/**
 * Deep dive: rank 21-50 bucket — where does the dormant 73% of impressions live?
 *
 * GOAL: identify THE template that dominates, compute precise actionability,
 * prescribe surgical content fixes. Operate as if budget is minutes, not weeks.
 */

import * as path from 'path'
import * as fs from 'fs'

const ROOT = path.join(__dirname, '..')
const PAGES = path.join(ROOT, 'docs', 'ahrefs-audit-2026-04', 'normalized', 'Pages_v2.csv')

type PageRow = { url: string; clicks: number; impressions: number; ctr: number; position: number }

function parseCsv(p: string): PageRow[] {
  const raw = fs.readFileSync(p, 'utf-8')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  const rows: PageRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const parts: string[] = []
    let cur = ''
    let inQ = false
    for (const ch of lines[i]) {
      if (ch === '"') inQ = !inQ
      else if (ch === ',' && !inQ) {
        parts.push(cur)
        cur = ''
      } else cur += ch
    }
    parts.push(cur)
    if (parts.length < 5) continue
    const [url, clicks, impressions, ctrStr, position] = parts
    rows.push({
      url: url.trim().replace(/^https?:\/\/servicesartisans\.fr/, ''),
      clicks: Number(clicks) || 0,
      impressions: Number(impressions) || 0,
      ctr: parseFloat(ctrStr.replace('%', '').replace(',', '.')) / 100 || 0,
      position: parseFloat(position.replace(',', '.')) || 0,
    })
  }
  return rows
}

// URL → template pattern
function classifyUrl(url: string): string {
  if (url === '/' || url === '') return 'homepage'
  const segs = url.split('?')[0].split('/').filter(Boolean)
  if (segs[0] === 'services') {
    if (segs.length === 3 && segs[2].match(/^[a-z-]+-\d+$/)) return '/services/[s]/[v]/[publicId]' // fiche artisan
    if (segs.length === 3) return '/services/[s]/[v]'
    if (segs.length === 2) return '/services/[s]'
    return '/services/' + segs.slice(1).join('/')
  }
  if (segs[0] === 'devis') return segs.length === 3 ? '/devis/[s]/[loc]' : '/devis/[s]'
  if (segs[0] === 'urgence') return segs.length === 3 ? '/urgence/[s]/[v]' : '/urgence/[s]'
  if (segs[0] === 'tarifs' || segs[0] === 'tarifs-artisans')
    return segs.length === 3
      ? `/${segs[0]}/[s]/[v]`
      : segs.length === 2
        ? `/${segs[0]}/[s]`
        : `/${segs[0]}`
  if (segs[0] === 'rge') {
    if (segs.length === 3 && segs[1] !== 'qualifications') return '/rge/[s]/[v]'
    if (segs.length === 2 && segs[0] === 'rge' && segs[1] === 'qualifications')
      return '/rge/qualifications'
    if (segs.length === 2) return '/rge/[s]'
    return '/rge/' + segs.slice(1).join('/')
  }
  if (segs[0] === 'cee')
    return segs.length === 3 ? '/cee/[op]/[v]' : segs.length === 2 ? '/cee/[op]' : '/cee'
  if (segs[0] === 'artisan') return '/artisan/[slug]'
  if (segs[0] === 'avis') return segs.length === 3 ? '/avis/[s]/[v]' : '/avis/[s]'
  if (segs[0] === 'villes') return segs.length === 3 ? '/villes/[v]/[quartier]' : '/villes/[v]'
  if (segs[0] === 'guides') return '/guides/[slug]'
  if (segs[0] === 'blog') return '/blog/[slug]'
  if (segs[0] === 'problemes') return segs.length === 3 ? '/problemes/[p]/[v]' : '/problemes/[p]'
  if (segs[0] === 'departements') return '/departements/[dept]'
  if (segs[0] === 'regions') return segs.length === 3 ? '/regions/[r]/[s]' : '/regions/[r]'
  return `/${segs[0]}` + (segs.length > 1 ? '/*' : '')
}

function pct(n: number, d: number) {
  return d === 0 ? '0%' : ((n / d) * 100).toFixed(1) + '%'
}

function main() {
  const rows = parseCsv(PAGES)
  console.log(`=== Pages data: ${rows.length} URLs ===\n`)

  // Segment
  const r21_50 = rows.filter((r) => r.position >= 21 && r.position <= 50)
  const r11_20 = rows.filter((r) => r.position >= 11 && r.position <= 20)
  const r4_10 = rows.filter((r) => r.position >= 4 && r.position <= 10)
  const r1_3 = rows.filter((r) => r.position >= 1 && r.position < 4)

  const sumImpr = (rs: PageRow[]) => rs.reduce((a, r) => a + r.impressions, 0)
  const sumClicks = (rs: PageRow[]) => rs.reduce((a, r) => a + r.clicks, 0)
  const totalImpr = sumImpr(rows)

  console.log('Distribution per page (not per query):')
  console.log(
    `  rank 1-3:   ${r1_3.length} pages, ${sumImpr(r1_3)} impr, ${sumClicks(r1_3)} clicks`
  )
  console.log(
    `  rank 4-10:  ${r4_10.length} pages, ${sumImpr(r4_10)} impr, ${sumClicks(r4_10)} clicks`
  )
  console.log(
    `  rank 11-20: ${r11_20.length} pages, ${sumImpr(r11_20)} impr, ${sumClicks(r11_20)} clicks`
  )
  console.log(
    `  rank 21-50: ${r21_50.length} pages, ${sumImpr(r21_50)} impr, ${sumClicks(r21_50)} clicks`
  )

  // Template aggregation on the 21-50 bucket
  const tmplStats = new Map<string, { pages: number; impr: number; clicks: number }>()
  for (const r of r21_50) {
    const t = classifyUrl(r.url)
    const cur = tmplStats.get(t) ?? { pages: 0, impr: 0, clicks: 0 }
    cur.pages++
    cur.impr += r.impressions
    cur.clicks += r.clicks
    tmplStats.set(t, cur)
  }

  const sorted = Array.from(tmplStats.entries()).sort((a, b) => b[1].impr - a[1].impr)
  console.log(`\n--- Template domination in rank 21-50 (${sumImpr(r21_50)} impressions total) ---`)
  console.log(
    '  template'.padEnd(40) + 'pages'.padStart(6) + 'impr'.padStart(8) + 'share'.padStart(7)
  )
  for (const [t, s] of sorted.slice(0, 20)) {
    console.log(
      '  ' +
        t.padEnd(38) +
        s.pages.toString().padStart(6) +
        s.impr.toString().padStart(8) +
        pct(s.impr, sumImpr(r21_50)).padStart(7)
    )
  }

  // Top 30 individual pages in 21-50 (the specific fixes to prioritise)
  console.log(`\n--- Top 30 individual pages in rank 21-50 (sorted by impressions) ---`)
  const top30 = [...r21_50].sort((a, b) => b.impressions - a.impressions).slice(0, 30)
  for (const r of top30) {
    console.log(
      `  impr=${r.impressions.toString().padStart(5)} pos=${r.position.toFixed(1).padStart(5)} [${classifyUrl(r.url).padEnd(30)}] ${r.url.slice(0, 80)}`
    )
  }

  // Same for rank 11-20 (the "second page" push)
  console.log(`\n--- Top 20 pages rank 11-20 (push to top 10) ---`)
  const top11_20 = [...r11_20].sort((a, b) => b.impressions - a.impressions).slice(0, 20)
  for (const r of top11_20) {
    console.log(
      `  impr=${r.impressions.toString().padStart(5)} pos=${r.position.toFixed(1).padStart(5)} [${classifyUrl(r.url).padEnd(30)}] ${r.url.slice(0, 80)}`
    )
  }

  // Template-level totals across ALL pages (to know what drives the whole site)
  console.log(`\n--- Template share of total impressions (all pages) ---`)
  const allTmpl = new Map<string, { pages: number; impr: number; clicks: number }>()
  for (const r of rows) {
    const t = classifyUrl(r.url)
    const cur = allTmpl.get(t) ?? { pages: 0, impr: 0, clicks: 0 }
    cur.pages++
    cur.impr += r.impressions
    cur.clicks += r.clicks
    allTmpl.set(t, cur)
  }
  const allSorted = Array.from(allTmpl.entries()).sort((a, b) => b[1].impr - a[1].impr)
  console.log(
    '  template'.padEnd(40) +
      'pages'.padStart(6) +
      'impr'.padStart(8) +
      'clicks'.padStart(8) +
      'CTR'.padStart(7)
  )
  for (const [t, s] of allSorted.slice(0, 20)) {
    const ctr = s.impr > 0 ? (s.clicks / s.impr) * 100 : 0
    console.log(
      '  ' +
        t.padEnd(38) +
        s.pages.toString().padStart(6) +
        s.impr.toString().padStart(8) +
        s.clicks.toString().padStart(8) +
        (ctr.toFixed(2) + '%').padStart(7)
    )
  }

  // Decision axis: which template to surgically fix first?
  console.log(`\n=== CEO DECISION AXIS ===`)
  console.log(`Criterion: template that maximises (dormant_impr_21_50) × (addressability)`)
  const byScore = sorted
    .map(([t, s]) => ({ t, s, score: s.impr * s.pages }))
    .sort((a, b) => b.score - a.score)
  for (const { t, s, score } of byScore.slice(0, 10)) {
    console.log(
      `  ${t.padEnd(38)} score=${score.toString().padStart(8)}  (${s.pages} pages × ${s.impr} impr)`
    )
  }
}

main()
