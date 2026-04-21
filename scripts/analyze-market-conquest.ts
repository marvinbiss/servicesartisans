/**
 * Market conquest data dump — single script, maximum signal.
 *
 * Outputs:
 *  1. Top 40 target pages (rank 21-50, dormant impressions)
 *  2. DB completeness audit: communeData + reviewStats for those 40
 *  3. Ahrefs content gap: which keywords do competitors rank for that we don't?
 *  4. Competitors profile: DR, traffic, shared vs exclusive keywords
 *  5. Backlinks profile: clean vs spam ratio
 *  6. Organic keywords lost/gained since last audit
 *  7. Tech-debt: low-word-count pages, missing H1, title too long (sample)
 *  8. Provider/reviews density per department+service
 */

import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

const ROOT = path.join(__dirname, '..')
const NORM = path.join(ROOT, 'docs', 'ahrefs-audit-2026-04', 'normalized')

// ---- CSV parser (reused, handles quoted commas + BOM) ----
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

function pct(n: number, d: number): string {
  return d === 0 ? '0%' : ((n / d) * 100).toFixed(1) + '%'
}

// ---- DB client (best-effort) ----
function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.warn('⚠️  NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY absent — skip DB parts')
    return null
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function main() {
  // ================== 1) TOP 40 TARGET PAGES ==================
  const pagesCsv = path.join(NORM, 'Pages_v2.csv')
  const pagesRaw = parseCsv(pagesCsv)

  type PRow = { url: string; clicks: number; impressions: number; ctr: number; position: number }
  const pages: PRow[] = pagesRaw.map((r) => {
    const urlCol = Object.keys(r)[0]
    return {
      url: (r[urlCol] || '').replace(/^https?:\/\/servicesartisans\.fr/, ''),
      clicks: Number(r['Clicks'] || r['clicks'] || '0') || 0,
      impressions: Number(r['Impressions'] || r['impressions'] || '0') || 0,
      ctr: parseFloat((r['CTR'] || r['ctr'] || '0').replace('%', '').replace(',', '.')) / 100 || 0,
      position: parseFloat((r['Position'] || r['position'] || '0').replace(',', '.')) || 0,
    }
  })

  const top40 = pages
    .filter(
      (p) =>
        p.position >= 21 &&
        p.position <= 50 &&
        p.url.startsWith('/services/') &&
        p.url.split('/').filter(Boolean).length === 3
    )
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 40)

  console.log(`\n====== 1) TOP 40 TARGET PAGES (rank 21-50, /services/[s]/[v]) ======`)
  console.log(`Total impressions on this block: ${top40.reduce((a, p) => a + p.impressions, 0)}`)
  console.log(
    `Avg rank: ${(top40.reduce((a, p) => a + p.position, 0) / Math.max(top40.length, 1)).toFixed(1)}`
  )
  console.log()
  for (const p of top40) {
    console.log(
      `  impr=${p.impressions.toString().padStart(5)} pos=${p.position.toFixed(1).padStart(5)} ctr=${(p.ctr * 100).toFixed(1).padStart(4)}%  ${p.url}`
    )
  }

  // ================== 2) DB COMPLETENESS AUDIT ==================
  const supabase = db()
  const targets = top40.map((p) => {
    const segs = p.url.split('/').filter(Boolean)
    return { url: p.url, service: segs[1], ville: segs[2], impr: p.impressions, pos: p.position }
  })

  console.log(`\n====== 2) DB COMPLETENESS — communes & reviews ======`)
  if (supabase) {
    const villeSlugs = Array.from(new Set(targets.map((t) => t.ville)))
    const { data: communes, error: ce } = await supabase
      .from('communes')
      .select(
        'slug,name,departement_code,population,prix_m2_moyen,revenu_median,densite_population,climat_zone,gentile,description,nb_artisans_btp,nb_artisans_rge,pct_passoires_dpe,jours_gel_annuels,precipitation_annuelle,temperature_moyenne_hiver,risque_inondation,risque_argile,zone_sismique,nb_catnat,nb_maprimerenov_annuel'
      )
      .in('slug', villeSlugs)
    if (ce) console.log('  ⚠️ communes err:', ce.message)

    const byVille = new Map<string, any>()
    for (const c of communes || []) byVille.set(c.slug, c)

    const missColsCount: Record<string, number> = {}
    console.log('  ville → completeness (fields filled / total 21)')
    for (const t of targets) {
      const c = byVille.get(t.ville)
      if (!c) {
        console.log(`    ❌ ${t.ville} — NO ROW`)
        continue
      }
      const cols = [
        'population',
        'prix_m2_moyen',
        'revenu_median',
        'densite_population',
        'climat_zone',
        'gentile',
        'description',
        'nb_artisans_btp',
        'nb_artisans_rge',
        'pct_passoires_dpe',
        'jours_gel_annuels',
        'precipitation_annuelle',
        'temperature_moyenne_hiver',
        'risque_inondation',
        'risque_argile',
        'zone_sismique',
        'nb_catnat',
        'nb_maprimerenov_annuel',
      ]
      let filled = 0
      const miss: string[] = []
      for (const col of cols) {
        const v = c[col]
        const isNull = v === null || v === undefined || v === '' || v === 0
        if (!isNull) filled++
        else {
          miss.push(col)
          missColsCount[col] = (missColsCount[col] || 0) + 1
        }
      }
      console.log(
        `    ${filled >= 12 ? '✅' : filled >= 6 ? '🟡' : '🔴'} ${t.ville.padEnd(25)} ${filled}/${cols.length}  miss:${miss.slice(0, 5).join(',')}${miss.length > 5 ? '…' : ''}`
      )
    }

    console.log('\n  Colonnes NULL par fréquence :')
    const sorted = Object.entries(missColsCount).sort((a, b) => b[1] - a[1])
    for (const [col, n] of sorted)
      console.log(`    ${col.padEnd(28)} ${n}/${targets.length} villes`)

    // Reviews by (service, dept)
    console.log(`\n  Reviews par service+dept pour top 40 :`)
    const deptCodes = Array.from(
      new Set((communes || []).map((c) => c.departement_code).filter(Boolean))
    )
    const { data: reviews, error: re } = await supabase
      .from('reviews')
      .select('service_slug, department_name, department_code, rating, is_published')
      .eq('is_published', true)
      .in('department_code', deptCodes)
    if (re) console.log('    ⚠️ reviews err:', re.message)
    const byKey = new Map<string, { count: number; sum: number }>()
    for (const r of reviews || []) {
      const key = `${r.service_slug}|${r.department_code}`
      const cur = byKey.get(key) || { count: 0, sum: 0 }
      cur.count++
      cur.sum += Number(r.rating || 0)
      byKey.set(key, cur)
    }
    let hasProof = 0
    for (const t of targets) {
      const c = byVille.get(t.ville)
      if (!c) continue
      const key = `${t.service}|${c.departement_code}`
      const s = byKey.get(key)
      const ok = !!s && s.count >= 5
      if (ok) hasProof++
      console.log(
        `    ${ok ? '✅' : '❌'} ${t.service.padEnd(18)} dept ${c.departement_code} ${s ? `${s.count} avis (avg ${(s.sum / s.count).toFixed(1)})` : '0 avis'}`
      )
    }
    console.log(
      `\n  → ${hasProof}/${targets.length} pages ont le seuil ≥5 avis pour title prefix social proof`
    )
  }

  // ================== 3) AHREFS CONTENT GAP ==================
  console.log(`\n====== 3) AHREFS CONTENT GAP — competitors keywords we miss ======`)
  const gapCsv = path.join(NORM, 'ahrefs-content-gap.csv')
  const gap = parseCsv(gapCsv)
  console.log(`  Total keyword rows in gap: ${gap.length}`)
  // Our column: "servicesartisans.fr/: Organic Position"
  const ourPos = 'servicesartisans.fr/: Organic Position'
  const ourUrl = 'servicesartisans.fr/: URL'
  const vol = 'Volume'
  const kd = 'KD'
  const kwCol = Object.keys(gap[0] || {})[0] // first col = keyword

  let wMissing = 0
  const bigMiss: Array<{ kw: string; vol: number; kd: number; why: string }> = []
  for (const r of gap) {
    const p = parseInt(r[ourPos] || '') || 0
    const v = parseInt(r[vol] || '0') || 0
    const k = parseInt(r[kd] || '0') || 0
    const kw = (r[kwCol] || '').trim()
    if (!kw) continue
    if (!p && v >= 500 && k <= 30) {
      wMissing++
      if (bigMiss.length < 40) bigMiss.push({ kw, vol: v, kd: k, why: 'no rank' })
    } else if (p > 30 && v >= 500 && k <= 30) {
      if (bigMiss.length < 40) bigMiss.push({ kw, vol: v, kd: k, why: `weak rank ${p}` })
    }
  }
  console.log(`  Keywords volume≥500 KD≤30 where we don't rank: ${wMissing}`)
  console.log(`\n  Top 40 high-value gaps:`)
  for (const g of bigMiss.slice(0, 40)) {
    console.log(
      `    vol=${g.vol.toString().padStart(6)} KD=${g.kd.toString().padStart(3)} ${g.why.padEnd(12)} ${g.kw}`
    )
  }

  // ================== 4) COMPETITORS PROFILE ==================
  console.log(`\n====== 4) COMPETITORS PROFILE ======`)
  const compCsv = path.join(NORM, 'ahrefs-competitors.csv')
  const comps = parseCsv(compCsv)
  for (const c of comps.slice(0, 20)) {
    const domain = Object.values(c)[0]
    console.log(
      `  ${(domain as string).padEnd(35)} DR=${c['DR'] || '?'} commons=${c['Common keywords'] || '?'}  traffic=${c['Current  traffic'] || c['Current traffic'] || '?'}  pages=${c['Current # of pages'] || '?'}`
    )
  }

  // ================== 5) BACKLINKS PROFILE ==================
  console.log(`\n====== 5) BACKLINKS PROFILE ======`)
  const blCsv = path.join(NORM, 'ahrefs-backlinks.csv')
  const bl = parseCsv(blCsv)
  console.log(`  Total backlinks in file: ${bl.length}`)
  let spam = 0
  let clean = 0
  let dofollow = 0
  let nofollow = 0
  const cleanLinks: Array<{ ref: string; dr: number; anchor: string; target: string }> = []
  for (const b of bl) {
    const isSpam = (b['Is spam'] || '').toLowerCase() === 'true'
    const nof = (b['Nofollow'] || '').toLowerCase() === 'true'
    const dr = parseFloat(b['Domain rating'] || '0') || 0
    if (isSpam) spam++
    else {
      clean++
      cleanLinks.push({
        ref: b['Referring page URL'] || '',
        dr,
        anchor: b['Anchor'] || '',
        target: b['Target URL'] || '',
      })
    }
    if (nof) nofollow++
    else dofollow++
  }
  console.log(`  spam=${spam} (${pct(spam, bl.length)})  clean=${clean} (${pct(clean, bl.length)})`)
  console.log(`  dofollow=${dofollow}  nofollow=${nofollow}`)
  console.log(`\n  Clean backlinks (non-spam):`)
  for (const c of cleanLinks.slice(0, 30)) {
    console.log(
      `    DR=${c.dr.toString().padStart(3)}  ${c.anchor.slice(0, 40).padEnd(40)}  ref=${c.ref.slice(0, 60)}`
    )
  }

  // ================== 6) ORGANIC KEYWORDS MOVEMENT ==================
  console.log(`\n====== 6) ORGANIC KEYWORDS MOVEMENT ======`)
  const okCsv = path.join(NORM, 'ahrefs-organic-keywords.csv')
  const ok = parseCsv(okCsv)
  let lost = 0
  let gained = 0
  let dropped = 0
  const lostBig: Array<{ kw: string; vol: number; prev: number }> = []
  const gainedBig: Array<{ kw: string; vol: number; cur: number }> = []
  for (const r of ok) {
    const status = r['Current position kind'] || r['Previous position kind'] || ''
    const vol = parseInt(r['Volume'] || '0') || 0
    const prev = parseInt(r['Previous position'] || '0') || 0
    const cur = parseInt(r['Current position'] || '0') || 0
    const kw = Object.values(r)[0] as string
    if (status === 'Lost') {
      lost++
      if (vol >= 100) lostBig.push({ kw, vol, prev })
    } else if (status === 'New') {
      gained++
      if (vol >= 100) gainedBig.push({ kw, vol, cur })
    } else if (prev > 0 && cur > prev + 5) dropped++
  }
  console.log(`  Lost: ${lost} | Gained (New): ${gained} | Dropped>5pos: ${dropped}`)
  console.log(`\n  Top 20 LOST with volume ≥100:`)
  for (const l of lostBig.sort((a, b) => b.vol - a.vol).slice(0, 20)) {
    console.log(
      `    vol=${l.vol.toString().padStart(5)} prev_pos=${l.prev.toString().padStart(3)}  ${l.kw}`
    )
  }
  console.log(`\n  Top 20 GAINED with volume ≥100:`)
  for (const g of gainedBig.sort((a, b) => b.vol - a.vol).slice(0, 20)) {
    console.log(
      `    vol=${g.vol.toString().padStart(5)} cur_pos=${g.cur.toString().padStart(3)}  ${g.kw}`
    )
  }

  // ================== 7) TECH DEBT ==================
  console.log(`\n====== 7) TECH DEBT (Ahrefs warnings sample) ======`)
  const warnFiles = [
    ['Low word count', 'Warning-indexable-Low_word_count.csv'],
    ['Missing H1', 'Warning-indexable-H1_tag_missing_or_empty.csv'],
    ['Meta desc too short', 'Warning-indexable-Meta_description_too_short.csv'],
    ['Title too long', 'Warning-indexable-Title_too_long.csv'],
    ['Orphan pages', 'Error-indexable-Orphan_page_(has_no_incoming_internal_links).csv'],
    ['No outgoing links', 'Error-indexable-Page_has_no_outgoing_links.csv'],
  ]
  for (const [label, file] of warnFiles) {
    const p = path.join(NORM, file)
    if (!fs.existsSync(p)) continue
    const rows = parseCsv(p)
    const urlCol =
      Object.keys(rows[0] || {}).find((k) => k.toLowerCase().includes('url')) ||
      Object.keys(rows[0] || {})[0]
    const byTemplate: Record<string, number> = {}
    for (const r of rows) {
      const u = (r[urlCol] || '').replace(/^https?:\/\/servicesartisans\.fr/, '')
      const segs = u.split('?')[0].split('/').filter(Boolean)
      const t = segs[0] || 'homepage'
      byTemplate[t] = (byTemplate[t] || 0) + 1
    }
    console.log(`  ${label}: ${rows.length} total`)
    const top5 = Object.entries(byTemplate)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    for (const [tmpl, n] of top5) console.log(`    /${tmpl}: ${n}`)
  }

  // ================== 8) PROVIDERS DENSITY ==================
  console.log(`\n====== 8) PROVIDERS DENSITY (for top 40) ======`)
  if (supabase) {
    for (const t of targets.slice(0, 20)) {
      const { count, error } = await supabase
        .from('providers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .ilike('address_city', `%${t.ville}%`)
      if (error) continue
      console.log(
        `    ${t.service.padEnd(18)} ${t.ville.padEnd(22)}  providers=${count ?? 0}  impr=${t.impr}`
      )
    }
  }

  console.log('\n=== END ===\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
