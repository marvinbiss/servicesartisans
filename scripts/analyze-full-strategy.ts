/**
 * Full strategy data dump — everything needed to write the CEO plan.
 *
 * Outputs:
 *  1. Template dormance full breakdown (not just /services)
 *  2. Pillar #2 rénovation énergétique state (routes live, traffic, gaps)
 *  3. Conversion funnel: devis→assignment→review rates
 *  4. Revenue data: leads dispatched, bookings, claimed artisans
 *  5. Provider distribution: RGE vs non-RGE, claimed vs unclaimed, active vs inactive
 *  6. Blog/Guides CTR catastrophe (ranking without clicks)
 *  7. Internal keyword portfolio: what we own vs what we lost
 *  8. Money keywords gap (commercial/transactional intent, KD≤30)
 */
import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

const ROOT = path.join(__dirname, '..')
const NORM = path.join(ROOT, 'docs', 'ahrefs-audit-2026-04', 'normalized')

function parseCsv(p: string): Record<string, string>[] {
  const raw = fs.readFileSync(p, 'utf-8').replace(/^\uFEFF/, '')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const header = parseLine(lines[0])
  const out: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const parts = parseLine(lines[i])
    const row: Record<string, string> = {}
    header.forEach((h, idx) => (row[h] = parts[idx] ?? ''))
    out.push(row)
  }
  return out
}
function parseLine(line: string): string[] {
  const parts: string[] = []
  let cur = ''
  let inQ = false
  for (const ch of line) {
    if (ch === '"') inQ = !inQ
    else if (ch === ',' && !inQ) {
      parts.push(cur)
      cur = ''
    } else cur += ch
  }
  parts.push(cur)
  return parts.map((p) => p.replace(/^"|"$/g, '').trim())
}

function classify(url: string): string {
  const segs = url.split('?')[0].split('/').filter(Boolean)
  if (!segs.length) return 'homepage'
  if (segs[0] === 'services' && segs.length === 3 && segs[2].match(/^[a-z-]+-\d+$/))
    return '/services/[s]/[v]/[publicId]'
  if (segs[0] === 'services' && segs.length === 3) return '/services/[s]/[v]'
  if (segs[0] === 'services' && segs.length === 2) return '/services/[s]'
  if (segs[0] === 'services') return '/services'
  if (segs[0] === 'tarifs' && segs.length === 3) return '/tarifs/[s]/[v]'
  if (segs[0] === 'tarifs' && segs.length === 2) return '/tarifs/[s]'
  if (segs[0] === 'tarifs') return '/tarifs'
  if (segs[0] === 'urgence' && segs.length === 3) return '/urgence/[s]/[v]'
  if (segs[0] === 'urgence' && segs.length === 2) return '/urgence/[s]'
  if (segs[0] === 'urgence') return '/urgence'
  if (segs[0] === 'departements') return '/departements/[dept]'
  if (segs[0] === 'regions' && segs.length === 3) return '/regions/[r]/[s]'
  if (segs[0] === 'regions') return '/regions/[r]'
  if (segs[0] === 'rge' && segs.length === 3) return '/rge/[s]/[v]'
  if (segs[0] === 'rge' && segs.length === 2) return '/rge/[s]'
  if (segs[0] === 'rge') return '/rge'
  if (segs[0] === 'avis' && segs.length === 3) return '/avis/[s]/[v]'
  if (segs[0] === 'avis') return '/avis/[s]'
  if (segs[0] === 'villes' && segs.length === 3) return '/villes/[v]/[q]'
  if (segs[0] === 'villes') return '/villes/[v]'
  if (segs[0] === 'problemes' && segs.length === 3) return '/problemes/[p]/[v]'
  if (segs[0] === 'problemes') return '/problemes/[p]'
  if (segs[0] === 'blog') return '/blog/[slug]'
  if (segs[0] === 'guides') return '/guides/[slug]'
  if (segs[0] === 'devis') return '/devis/*'
  if (segs[0] === 'artisan') return '/artisan/[slug]'
  return `/${segs[0]}/*`
}

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function main() {
  // ============ 1) TEMPLATE DORMANCE FULL ============
  console.log(`\n====== 1) TEMPLATE DORMANCE (ALL rank buckets) ======`)
  const pages = parseCsv(path.join(NORM, 'Pages_v2.csv')).map((r) => {
    const k = Object.keys(r)[0]
    return {
      url: (r[k] || '').replace(/^https?:\/\/servicesartisans\.fr/, ''),
      impr: Number(r['Impressions'] || 0),
      clicks: Number(r['Clicks'] || 0),
      pos: parseFloat((r['Position'] || '0').replace(',', '.')) || 0,
    }
  })
  const buckets: Record<string, { pages: number; impr: number; clicks: number }> = {}
  for (const p of pages) {
    if (p.pos === 0 || p.impr === 0) continue
    const t = classify(p.url)
    const bucket =
      p.pos <= 3
        ? '1-3'
        : p.pos <= 10
          ? '4-10'
          : p.pos <= 20
            ? '11-20'
            : p.pos <= 50
              ? '21-50'
              : '51+'
    const key = `${t}|${bucket}`
    const cur = buckets[key] || { pages: 0, impr: 0, clicks: 0 }
    cur.pages++
    cur.impr += p.impr
    cur.clicks += p.clicks
    buckets[key] = cur
  }
  // Aggregate per template
  const byTmpl: Record<
    string,
    { impr: number; clicks: number; pages: number; dormantImpr: number; dormantPages: number }
  > = {}
  for (const [k, v] of Object.entries(buckets)) {
    const [t, b] = k.split('|')
    const e = byTmpl[t] || { impr: 0, clicks: 0, pages: 0, dormantImpr: 0, dormantPages: 0 }
    e.impr += v.impr
    e.clicks += v.clicks
    e.pages += v.pages
    if (b === '11-20' || b === '21-50') {
      e.dormantImpr += v.impr
      e.dormantPages += v.pages
    }
    byTmpl[t] = e
  }
  const templates = Object.entries(byTmpl).sort((a, b) => b[1].dormantImpr - a[1].dormantImpr)
  console.log(
    '  template                              pages   impr  clicks   CTR   dormPage dormImpr'
  )
  for (const [t, s] of templates.slice(0, 20)) {
    const ctr = s.impr ? ((s.clicks / s.impr) * 100).toFixed(2) + '%' : '0%'
    console.log(
      `  ${t.padEnd(38)}${s.pages.toString().padStart(5)}${s.impr.toString().padStart(7)}${s.clicks.toString().padStart(8)}  ${ctr.padStart(6)}  ${s.dormantPages.toString().padStart(7)}${s.dormantImpr.toString().padStart(9)}`
    )
  }

  // ============ 2) PILLAR #2 STATE ============
  console.log(`\n====== 2) PILLAR #2 — RÉNOVATION ÉNERGÉTIQUE ======`)
  const queries = parseCsv(path.join(NORM, 'Requêtes_v2.csv')).map((r) => {
    const k = Object.keys(r)[0]
    return {
      q: r[k] || '',
      impr: Number(r['Impressions'] || 0),
      clicks: Number(r['Clicks'] || 0),
      pos: parseFloat((r['Position'] || '0').replace(',', '.')) || 0,
    }
  })
  const renovRegex =
    /rge|rénovation énerg|renovation energ|maprimerénov|maprimerenov|isolation|pompe.à.chaleur|pompe à chaleur|\bpac\b|chaudière|ite|combles|aides?.rénovation|cee|certificats.économie|passoire.?therm|dpe|audit.énerg|dpe.g|diagnostic.performance/i
  const renov = queries.filter((q) => renovRegex.test(q.q))
  const renovImpr = renov.reduce((a, r) => a + r.impr, 0)
  const renovClicks = renov.reduce((a, r) => a + r.clicks, 0)
  const avgPos = renov.reduce((a, r) => a + r.pos * r.impr, 0) / Math.max(renovImpr, 1)
  console.log(`  Queries détectées Pillar #2: ${renov.length}`)
  console.log(
    `  Impressions: ${renovImpr} | Clicks: ${renovClicks} | avg pos: ${avgPos.toFixed(1)}`
  )
  console.log(`  Top 20 queries Pillar #2 par impressions:`)
  for (const q of renov.sort((a, b) => b.impr - a.impr).slice(0, 20)) {
    console.log(
      `    impr=${q.impr.toString().padStart(5)} pos=${q.pos.toFixed(1).padStart(5)} clicks=${q.clicks.toString().padStart(3)}  "${q.q}"`
    )
  }
  const pillarPages = pages.filter((p) =>
    /renovation-energetique|rge|aides|cee|maprimerenov|pompe-a-chaleur|isolation|chaudiere|audit-energetique/i.test(
      p.url
    )
  )
  console.log(`  Pages Pillar #2 indexées dans top 1000: ${pillarPages.length}`)
  console.log(`  Top 10 pages Pillar:`)
  for (const p of pillarPages.sort((a, b) => b.impr - a.impr).slice(0, 10)) {
    console.log(
      `    impr=${p.impr.toString().padStart(5)} pos=${p.pos.toFixed(1).padStart(5)} clicks=${p.clicks.toString().padStart(3)}  ${p.url}`
    )
  }

  // ============ 3) CONVERSION FUNNEL ============
  const supabase = db()
  console.log(`\n====== 3) CONVERSION FUNNEL (30j glissants) ======`)
  if (supabase) {
    const since = new Date(Date.now() - 30 * 86400e3).toISOString()
    const [devis, assign, reviews, invits, bookings] = await Promise.all([
      supabase
        .from('devis_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since),
      supabase
        .from('lead_assignments')
        .select('*', { count: 'exact', head: true })
        .gte('assigned_at', since),
      supabase.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', since),
      supabase
        .from('review_invitations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since),
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since),
    ])
    console.log(`  devis_requests (30j):       ${devis.count ?? '?'}`)
    console.log(`  lead_assignments (30j):     ${assign.count ?? '?'}`)
    console.log(`  review_invitations (30j):   ${invits.count ?? '?'}`)
    console.log(`  reviews created (30j):      ${reviews.count ?? '?'}`)
    console.log(`  bookings (30j):             ${bookings.count ?? '?'}`)
    if (devis.count && assign.count)
      console.log(`  → dispatch rate: ${((assign.count / devis.count) * 100).toFixed(1)}%`)
    if (invits.count && reviews.count)
      console.log(`  → invitation→review: ${((reviews.count / invits.count) * 100).toFixed(1)}%`)
    if (devis.count && reviews.count)
      console.log(`  → devis→review: ${((reviews.count / devis.count) * 100).toFixed(2)}%`)

    // Status breakdown
    const { data: statuses } = await supabase
      .from('lead_assignments')
      .select('status')
      .gte('assigned_at', since)
    const byStatus: Record<string, number> = {}
    for (const s of statuses || [])
      byStatus[s.status || 'null'] = (byStatus[s.status || 'null'] || 0) + 1
    console.log(`  Assignment status breakdown:`, byStatus)
  }

  // ============ 4) REVENUE BASELINE ============
  console.log(`\n====== 4) REVENUE BASELINE ======`)
  if (supabase) {
    const [providers, claimedAll, rgeAll, activeAll, subscribed] = await Promise.all([
      supabase.from('providers').select('*', { count: 'exact', head: true }),
      supabase
        .from('providers')
        .select('*', { count: 'exact', head: true })
        .not('claimed_at', 'is', null),
      supabase
        .from('providers')
        .select('*', { count: 'exact', head: true })
        .not('rge_qualifications', 'is', null),
      supabase.from('providers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase
        .from('providers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .not('user_id', 'is', null),
    ])
    console.log(`  Total providers:        ${providers.count}`)
    console.log(`  Claimed (user_id set):  ${claimedAll.count}`)
    console.log(`  RGE qualifications:     ${rgeAll.count}`)
    console.log(`  Active:                 ${activeAll.count}`)
    console.log(`  Claimed active:         ${subscribed.count}`)
    if (claimedAll.count && providers.count) {
      console.log(
        `  Claim rate:             ${((claimedAll.count / providers.count) * 100).toFixed(2)}%`
      )
    }
  }

  // ============ 5) BLOG/GUIDES CTR CATASTROPHE ============
  console.log(`\n====== 5) BLOG/GUIDES CTR catastrophe ======`)
  const blogGuides = pages.filter((p) => /^\/(blog|guides)\//.test(p.url))
  const bgImpr = blogGuides.reduce((a, p) => a + p.impr, 0)
  const bgClicks = blogGuides.reduce((a, p) => a + p.clicks, 0)
  console.log(
    `  pages: ${blogGuides.length}  impr: ${bgImpr}  clicks: ${bgClicks}  CTR: ${((bgClicks / Math.max(bgImpr, 1)) * 100).toFixed(2)}%`
  )
  console.log(`  Pages with 0 clicks but ≥50 impressions:`)
  const zeroClick = blogGuides
    .filter((p) => p.clicks === 0 && p.impr >= 50)
    .sort((a, b) => b.impr - a.impr)
    .slice(0, 20)
  for (const p of zeroClick) {
    console.log(
      `    impr=${p.impr.toString().padStart(5)} pos=${p.pos.toFixed(1).padStart(5)}  ${p.url}`
    )
  }

  // ============ 6) WINNING KEYWORDS (rank ≤10, brief) ============
  console.log(`\n====== 6) CURRENT WINNING KEYWORDS (rank ≤10, impr ≥50) ======`)
  const winning = queries.filter((q) => q.pos > 0 && q.pos <= 10 && q.impr >= 50)
  const winTotal = { impr: 0, clicks: 0, n: winning.length }
  for (const q of winning) {
    winTotal.impr += q.impr
    winTotal.clicks += q.clicks
  }
  console.log(
    `  queries: ${winTotal.n}  impr: ${winTotal.impr}  clicks: ${winTotal.clicks}  CTR: ${((winTotal.clicks / Math.max(winTotal.impr, 1)) * 100).toFixed(1)}%`
  )
  console.log(`  Top 20:`)
  for (const q of winning.sort((a, b) => b.clicks - a.clicks).slice(0, 20)) {
    console.log(
      `    clicks=${q.clicks.toString().padStart(3)} impr=${q.impr.toString().padStart(5)} pos=${q.pos.toFixed(1).padStart(5)}  "${q.q}"`
    )
  }

  // ============ 7) MONEY KEYWORDS GAP (commercial/transactional, KD≤30) ============
  console.log(`\n====== 7) MONEY KEYWORDS GAP (commercial KD≤30 vol≥300) ======`)
  const gap = parseCsv(path.join(NORM, 'ahrefs-content-gap.csv'))
  const ourPosCol = 'servicesartisans.fr/: URL'
  const relevantRegex =
    /\b(plombier|electricien|serrurier|chauffagiste|couvreur|macon|maçon|peintre|menuisier|carreleur|jardinier|paysagiste|platrier|plâtrier|isolation|pompe|chaudière|chaudiere|climaticien|climatisation|renovation|rénovation|energetique|énergétique|ravalement|façade|facade|terrasse|toiture|fenetre|fenêtre|dégât.des.eaux|fuite|débouchage|urgence|dépannage|depannage|devis)/i
  let gapCount = 0
  const bigGap: Array<{ kw: string; vol: number; kd: number; kind: string }> = []
  for (const r of gap) {
    const kw = ((Object.values(r)[0] as string) || '').trim()
    if (!relevantRegex.test(kw)) continue
    const vol = parseInt(r['Volume'] || '0') || 0
    const kd = parseInt(r['KD'] || '0') || 0
    const ourUrl = r[ourPosCol] || ''
    if (vol < 300 || kd > 30) continue
    if (!ourUrl) {
      gapCount++
      bigGap.push({ kw, vol, kd, kind: 'no rank' })
    }
  }
  console.log(
    `  Relevant (artisanat/rénovation) keywords vol≥300 KD≤30 where we DON'T rank: ${gapCount}`
  )
  console.log(`  Top 40:`)
  for (const g of bigGap.sort((a, b) => b.vol - a.vol).slice(0, 40)) {
    console.log(
      `    vol=${g.vol.toString().padStart(6)} KD=${g.kd.toString().padStart(3)}  ${g.kw}`
    )
  }

  console.log('\n=== END ===\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
