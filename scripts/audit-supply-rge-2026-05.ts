/**
 * Audit F — Supply marché : top 5K artisans RGE prioritaires onboarding
 *
 * Phase 0 audit Domination 2026-05-03 (cf. memory `servicesartisans-phase0-audit-2026-05-03.md`).
 * Sortie : 4 CSV dans C:\Users\USER\Downloads\_phase0_audit\F_supply\
 */
import { supabase } from './lib/supabase-admin'
import * as fs from 'fs'
import * as path from 'path'

const OUT_DIR = String.raw`C:\Users\USER\Downloads\_phase0_audit\F_supply`

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return ''
    let s: string
    if (Array.isArray(v)) {
      s = v
        .map((item) => {
          if (item && typeof item === 'object') {
            const o = item as { code?: string; nom?: string; organisme?: string }
            return o.code || o.nom || JSON.stringify(item)
          }
          return String(item)
        })
        .join('|')
    } else if (v && typeof v === 'object') {
      s = JSON.stringify(v)
    } else {
      s = String(v)
    }
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join(
    '\n'
  )
}

function writeCsv(name: string, rows: Record<string, unknown>[]) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
  const file = path.join(OUT_DIR, name)
  fs.writeFileSync(file, toCsv(rows), 'utf-8')
  console.log(
    `  >>> ${file} (${rows.length} lignes, ${fs.statSync(file).size.toLocaleString()} bytes)`
  )
}

async function main() {
  console.log('='.repeat(80))
  console.log('AUDIT F — SUPPLY RGE — Phase 0 Domination 2026-05-03')
  console.log('='.repeat(80))

  // ---- F.1 : Distribution ----
  console.log('\n[F.1] Distribution actuelle artisans RGE...')
  const { count: totalRge, error: e1a } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .not('rge_qualifications', 'is', null)
    .eq('is_active', true)
  if (e1a) console.error('  ERREUR:', e1a.message)

  const { count: withEmail } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .not('rge_qualifications', 'is', null)
    .eq('is_active', true)
    .not('email', 'is', null)
    .neq('email', '')

  const { count: withPhone } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .not('rge_qualifications', 'is', null)
    .eq('is_active', true)
    .not('phone', 'is', null)
    .neq('phone', '')

  const { count: alreadyClaimed } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .not('rge_qualifications', 'is', null)
    .eq('is_active', true)
    .not('claimed_at', 'is', null)

  const f1 = [
    {
      total_rge: totalRge,
      with_email: withEmail,
      with_phone: withPhone,
      already_claimed: alreadyClaimed,
      claim_rate_pct: totalRge ? ((100 * (alreadyClaimed || 0)) / totalRge).toFixed(2) : '0',
      email_rate_pct: totalRge ? ((100 * (withEmail || 0)) / totalRge).toFixed(2) : '0',
    },
  ]
  console.log('  Distribution :', f1[0])
  writeCsv('F1_distribution.csv', f1)

  // ---- F.2 : Top 5K artisans RGE prioritaires ----
  console.log('\n[F.2] Top 5K artisans RGE prioritaires (paginated)...')
  const TOP_VILLES = new Set([
    'paris',
    'marseille',
    'lyon',
    'toulouse',
    'nice',
    'nantes',
    'montpellier',
    'strasbourg',
    'bordeaux',
    'lille',
    'rennes',
    'reims',
    'le-havre',
    'toulon',
    'grenoble',
    'dijon',
    'angers',
    'nimes',
    'villeurbanne',
    'saint-denis',
    'aix-en-provence',
    'le-mans',
    'clermont-ferrand',
    'brest',
    'tours',
    'amiens',
    'limoges',
    'annecy',
    'perpignan',
    'besancon',
    'metz',
    'orleans',
  ])

  const all: Record<string, unknown>[] = []
  const PAGE = 1000
  for (let offset = 0; offset < 30000; offset += PAGE) {
    const { data, error } = await supabase
      .from('providers')
      .select(
        'id, stable_id, name, slug, email, phone, siret, address_city, address_region, rge_qualifications, rge_verified_at, rge_expires_at, review_count, rating_average'
      )
      .not('rge_qualifications', 'is', null)
      .eq('is_active', true)
      .is('claimed_at', null)
      .order('review_count', { ascending: false, nullsFirst: false })
      .range(offset, offset + PAGE - 1)
    if (error) {
      console.error('  ERREUR page', offset, ':', error.message)
      break
    }
    if (!data || data.length === 0) break
    all.push(
      ...data.map((p) => {
        const qualifs = (p.rge_qualifications as string[] | null) || []
        const nbQ = qualifs.length
        const inTop = p.slug && TOP_VILLES.has(p.slug as string)
        const future =
          p.rge_expires_at &&
          new Date(p.rge_expires_at as string).getTime() > Date.now() + 365 * 86400_000
        const score =
          (nbQ >= 2 ? 50 : 0) +
          (p.email ? 30 : 0) +
          (p.phone ? 20 : 0) +
          (inTop ? 15 : 0) +
          (future ? 10 : 0)
        return {
          id: p.id,
          stable_id: p.stable_id,
          name: p.name,
          slug: p.slug,
          email: p.email,
          phone: p.phone,
          siret: p.siret,
          address_city: p.address_city,
          address_region: p.address_region,
          rge_qualifications: qualifs,
          nb_qualifs: nbQ,
          rge_verified_at: p.rge_verified_at,
          rge_expires_at: p.rge_expires_at,
          review_count: p.review_count,
          rating_average: p.rating_average,
          priority_score: score,
        }
      })
    )
    if (data.length < PAGE) break
  }
  all.sort((a, b) => Number(b.priority_score) - Number(a.priority_score))
  const top5k = all.slice(0, 5000)
  console.log(`  Récupérés : ${all.length} artisans RGE non-claimed | top 5K conservés`)
  writeCsv('F2_top5000_artisans.csv', top5k)

  // Distribution scores
  const buckets = { '100+': 0, '70-99': 0, '40-69': 0, '20-39': 0, '0-19': 0 }
  for (const r of top5k) {
    const s = Number(r.priority_score)
    if (s >= 100) buckets['100+']++
    else if (s >= 70) buckets['70-99']++
    else if (s >= 40) buckets['40-69']++
    else if (s >= 20) buckets['20-39']++
    else buckets['0-19']++
  }
  console.log('  Buckets priorité :', buckets)

  // ---- F.3 : Distribution par qualification (rge_qualifications = array of objects) ----
  console.log('\n[F.3] Distribution par qualification RGE...')
  type Qualif = {
    code?: string
    nom?: string
    domaine?: string
    meta_domaine?: string
    organisme?: string
    date_fin?: string
  }
  const byCode = new Map<
    string,
    { nb: number; email: number; domaine: string; organisme: string }
  >()
  const byMeta = new Map<string, { nb: number; email: number }>()
  const byOrg = new Map<string, { nb: number; email: number }>()
  for (const r of all) {
    const qualifs = (r.rge_qualifications as Qualif[]) || []
    for (const q of qualifs) {
      const code = q.code || 'unknown'
      const meta = q.meta_domaine || 'unknown'
      const org = q.organisme || 'unknown'
      const c = byCode.get(code) || { nb: 0, email: 0, domaine: q.domaine || '', organisme: org }
      c.nb++
      if (r.email) c.email++
      byCode.set(code, c)
      const m = byMeta.get(meta) || { nb: 0, email: 0 }
      m.nb++
      if (r.email) m.email++
      byMeta.set(meta, m)
      const o = byOrg.get(org) || { nb: 0, email: 0 }
      o.nb++
      if (r.email) o.email++
      byOrg.set(org, o)
    }
  }
  const f3code = Array.from(byCode.entries())
    .map(([code, v]) => ({
      code,
      domaine: v.domaine,
      organisme: v.organisme,
      nb_artisans: v.nb,
      with_email: v.email,
    }))
    .sort((a, b) => b.nb_artisans - a.nb_artisans)
    .slice(0, 80)
  const f3meta = Array.from(byMeta.entries())
    .map(([meta_domaine, v]) => ({ meta_domaine, nb_artisans: v.nb, with_email: v.email }))
    .sort((a, b) => b.nb_artisans - a.nb_artisans)
  const f3org = Array.from(byOrg.entries())
    .map(([organisme, v]) => ({ organisme, nb_artisans: v.nb, with_email: v.email }))
    .sort((a, b) => b.nb_artisans - a.nb_artisans)
  console.log(
    `  Codes uniques : ${byCode.size} | Meta-domaines : ${byMeta.size} | Organismes : ${byOrg.size}`
  )
  writeCsv('F3_qualifications_by_code.csv', f3code)
  writeCsv('F3_qualifications_by_meta.csv', f3meta)
  writeCsv('F3_qualifications_by_organisme.csv', f3org)

  // ---- F.4 : Distribution par région ----
  console.log('\n[F.4] Distribution par région...')
  const regionMap = new Map<string, { nb: number; email: number; phone: number; multi: number }>()
  for (const r of all) {
    const reg = (r.address_region as string) || 'INCONNU'
    const cur = regionMap.get(reg) || { nb: 0, email: 0, phone: 0, multi: 0 }
    cur.nb++
    if (r.email) cur.email++
    if (r.phone) cur.phone++
    if (Number(r.nb_qualifs) >= 2) cur.multi++
    regionMap.set(reg, cur)
  }
  const f4 = Array.from(regionMap.entries())
    .map(([region, v]) => ({
      region,
      nb_rge: v.nb,
      with_email: v.email,
      with_phone: v.phone,
      multi_qualif: v.multi,
    }))
    .sort((a, b) => b.nb_rge - a.nb_rge)
  writeCsv('F4_regions.csv', f4)

  console.log('\n' + '='.repeat(80))
  console.log('AUDIT F LIVRÉ — 4 CSV dans', OUT_DIR)
  console.log('='.repeat(80))
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
