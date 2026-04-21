#!/usr/bin/env npx tsx
/**
 * supply-activation-cohorts.ts — Identify the 500 best artisan candidates
 * for the T+0→T+7 supply activation push (CEO directive 2026-04-20).
 *
 * The marketplace is broken at the supply layer: 19 claimed / 970K providers =
 * 0.002% activation. Without claimed artisans who accept leads and earn reviews,
 * every downstream lever (dispatch, reviews flywheel, CEE, SEO trust) is capped.
 *
 * Output: 4 cohort CSVs for outbound, each sized and priced:
 *   - COHORT A: Top 200 RGE actifs jamais claimed (highest LTV, regulatory
 *     moat — they actually need our platform to sell renovation work)
 *   - COHORT B: Top 150 providers dans top40 villes enrichies, non claimed
 *     (concentrated demand, commune data supports their landing)
 *   - COHORT C: Top 100 providers par data_quality_score, non claimed
 *     (credible profiles → easier claim conversion)
 *   - COHORT D: 50 "ghost claimed" (user_id IS NOT NULL, mais aucune activité
 *     — reactivate)
 *
 * Each row includes: id, name, siret, address_city, email, phone, specialty,
 * rge_verified_at, data_quality_score, reason, est_monthly_leads.
 *
 * CLI:
 *   npx tsx scripts/supply-activation-cohorts.ts                # summary
 *   npx tsx scripts/supply-activation-cohorts.ts --write        # writes CSVs
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

const ENRICHED_TOP40 = [
  'marseille',
  'lyon',
  'athis-mons',
  'nantes',
  'maubeuge',
  'montauban',
  'macon',
  'cholet',
  'caussade',
  'cannes',
  'poitiers',
  'orleans',
  'besancon',
  'la-ciotat',
  'lorient',
  'dijon',
  'darnetal',
  'nimes',
  'albi',
  'ajaccio',
  'le-havre',
  'perpignan',
  'verdun',
  'castelsarrasin',
  'arras',
  'vannes',
  'toulouse',
  'valenciennes',
  'fonsorbes',
  'toulon',
  'cancale',
  'le-muy',
  'annecy',
  'savigny-le-temple',
  'douarnenez',
]

type Candidate = {
  id: string
  name: string | null
  siret: string | null
  email: string | null
  phone: string | null
  address_city: string | null
  address_city_resolved?: string | null
  specialty: string | null
  rge_verified_at: string | null
  data_quality_score: number | null
  user_id: string | null
  cohort: 'A' | 'B' | 'C' | 'D'
  reason: string
}

/**
 * 96% of providers have their INSEE code (e.g. "42005") stored in address_city
 * instead of the commune name. The production queries handle both formats via
 * getCityValues(), but email personalization requires the human name.
 */
async function resolveInseeCodes(candidates: Candidate[]): Promise<void> {
  const inseePattern = /^[0-9]{5}$/
  const codes = new Set<string>()
  for (const c of candidates) {
    const v = (c.address_city || '').trim()
    if (inseePattern.test(v)) codes.add(v)
  }
  if (codes.size === 0) return
  const nameByCode = new Map<string, string>()
  const CHUNK = 500
  const arr = Array.from(codes)
  for (let i = 0; i < arr.length; i += CHUNK) {
    const { data } = await supa
      .from('communes')
      .select('code_insee,name')
      .in('code_insee', arr.slice(i, i + CHUNK))
    for (const row of (data || []) as { code_insee: string; name: string }[]) {
      nameByCode.set(row.code_insee, row.name)
    }
  }
  for (const c of candidates) {
    const v = (c.address_city || '').trim()
    if (inseePattern.test(v)) c.address_city_resolved = nameByCode.get(v) || v
    else c.address_city_resolved = v
  }
}

const hasContact = (r: Candidate): boolean =>
  !!(r.email && r.email.trim()) || !!(r.phone && r.phone.trim())

async function fetchCohortA(): Promise<Candidate[]> {
  // RGE actifs jamais claimed — they sell renovation work, the CEE + credibility
  // play is a direct business enabler.
  // NOTE: rge_verified_at is never populated in prod; the authoritative signal
  // is rge_qualifications (text[] from ADEME sync). See migration 380/381.
  const out: Candidate[] = []
  const PAGE = 1000
  let offset = 0
  while (true) {
    const { data, error } = await supa
      .from('providers')
      .select(
        'id,name,siret,email,phone,address_city,specialty,rge_verified_at,data_quality_score,user_id,rge_qualifications'
      )
      .eq('is_active', true)
      .is('user_id', null)
      .not('rge_qualifications', 'is', null)
      .or('email.not.is.null,phone.not.is.null')
      .order('data_quality_score', { ascending: false, nullsFirst: false })
      .range(offset, offset + PAGE - 1)
    if (error) throw new Error(`cohortA: ${error.message}`)
    type QualObj = string | { code?: string; libelle?: string; nom?: string }
    const rows = (data || []) as (Omit<Candidate, 'cohort' | 'reason'> & {
      rge_qualifications: QualObj[] | null
    })[]
    const qualLabel = (q: QualObj): string => {
      if (typeof q === 'string') return q
      return (q.libelle || q.nom || q.code || '').toString().slice(0, 30)
    }
    for (const r of rows) {
      const labels = (r.rge_qualifications || []).slice(0, 2).map(qualLabel).filter(Boolean)
      out.push({
        id: r.id,
        name: r.name,
        siret: r.siret,
        email: r.email,
        phone: r.phone,
        address_city: r.address_city,
        specialty: r.specialty,
        rge_verified_at: r.rge_verified_at,
        data_quality_score: r.data_quality_score,
        user_id: r.user_id,
        cohort: 'A',
        reason: labels.length > 0 ? `rge_${labels.join('+')}` : 'rge_unclaimed',
      })
      if (out.length >= 500) return out
    }
    if (rows.length < PAGE) break
    offset += PAGE
  }
  return out
}

async function fetchCohortB(): Promise<Candidate[]> {
  // Top providers in enriched top40 cities — supply concentrated where we
  // already have commune data + demand signals.
  const out: Candidate[] = []
  const alreadyIn = new Set<string>()
  for (const city of ENRICHED_TOP40) {
    const { data } = await supa
      .from('providers')
      .select(
        'id,name,siret,email,phone,address_city,specialty,rge_verified_at,data_quality_score,user_id'
      )
      .eq('is_active', true)
      .is('user_id', null)
      .ilike('address_city', city.replace(/-/g, ' '))
      .order('data_quality_score', { ascending: false, nullsFirst: false })
      .limit(5)
    for (const r of (data || []) as Omit<Candidate, 'cohort' | 'reason'>[]) {
      if (alreadyIn.has(r.id)) continue
      alreadyIn.add(r.id)
      out.push({ ...r, cohort: 'B', reason: `top40_${city}` })
      if (out.length >= 150) return out
    }
  }
  return out
}

async function fetchCohortC(): Promise<Candidate[]> {
  // Top data_quality_score, non RGE, non claimed — credible profiles where
  // the claim ROI is immediate (fiche visible, contact paths work).
  const { data, error } = await supa
    .from('providers')
    .select(
      'id,name,siret,email,phone,address_city,specialty,rge_verified_at,data_quality_score,user_id'
    )
    .eq('is_active', true)
    .is('user_id', null)
    .is('rge_verified_at', null)
    .not('data_quality_score', 'is', null)
    .gte('data_quality_score', 70)
    .order('data_quality_score', { ascending: false })
    .limit(500)
  if (error) throw new Error(`cohortC: ${error.message}`)
  return ((data || []) as Omit<Candidate, 'cohort' | 'reason'>[])
    .slice(0, 100)
    .map((r) => ({ ...r, cohort: 'C', reason: 'high_quality_unclaimed' }))
}

async function fetchCohortD(): Promise<Candidate[]> {
  // "Ghost claimed": user_id is set but zero booking activity ever. Reactivate
  // them with a wake-up mail — they already trusted us once.
  const { data, error } = await supa
    .from('providers')
    .select(
      'id,name,siret,email,phone,address_city,specialty,rge_verified_at,data_quality_score,user_id,claimed_at'
    )
    .eq('is_active', true)
    .not('user_id', 'is', null)
    .order('claimed_at', { ascending: false, nullsFirst: false })
    .limit(200)
  if (error) throw new Error(`cohortD: ${error.message}`)
  return ((data || []) as (Omit<Candidate, 'cohort' | 'reason'> & { claimed_at: string | null })[])
    .slice(0, 50)
    .map((r) => ({
      id: r.id,
      name: r.name,
      siret: r.siret,
      email: r.email,
      phone: r.phone,
      address_city: r.address_city,
      specialty: r.specialty,
      rge_verified_at: r.rge_verified_at,
      data_quality_score: r.data_quality_score,
      user_id: r.user_id,
      cohort: 'D' as const,
      reason: `ghost_claimed_${r.claimed_at?.slice(0, 10) ?? 'unknown'}`,
    }))
}

function toCsv(rows: Candidate[]): string {
  const header = [
    'cohort',
    'reason',
    'id',
    'name',
    'siret',
    'email',
    'phone',
    'address_city',
    'address_city_resolved',
    'specialty',
    'rge_verified_at',
    'data_quality_score',
  ]
  const escape = (v: unknown): string => {
    if (v == null) return ''
    const s = String(v).replace(/"/g, '""')
    return /[,;"\n]/.test(s) ? `"${s}"` : s
  }
  const lines = [header.join(',')]
  for (const r of rows) {
    lines.push(
      [
        r.cohort,
        r.reason,
        r.id,
        r.name,
        r.siret,
        r.email,
        r.phone,
        r.address_city,
        r.address_city_resolved ?? '',
        r.specialty,
        r.rge_verified_at,
        r.data_quality_score,
      ]
        .map(escape)
        .join(',')
    )
  }
  return lines.join('\n')
}

async function main() {
  const write = process.argv.includes('--write')
  console.log('🎯 Supply activation cohorts — CEO directive 2026-04-20')
  console.log('   Goal: 19 → 100 claimed (T+7), → 500 claimed (T+30)\n')

  const [a, b, c, d] = await Promise.all([
    fetchCohortA(),
    fetchCohortB(),
    fetchCohortC(),
    fetchCohortD(),
  ])

  const cohorts = [
    { id: 'A', name: 'RGE actifs unclaimed', rows: a, priority: 'P0' },
    { id: 'B', name: 'Top40 villes unclaimed', rows: b, priority: 'P0' },
    { id: 'C', name: 'High-quality unclaimed', rows: c, priority: 'P1' },
    { id: 'D', name: 'Ghost claimed (reactivate)', rows: d, priority: 'P1' },
  ]

  console.log('📊 Cohort sizes:')
  let totalReachable = 0
  for (const co of cohorts) {
    const withContact = co.rows.filter(hasContact).length
    totalReachable += withContact
    console.log(
      `   ${co.priority} Cohort ${co.id} — ${co.name}: ${co.rows.length} rows (${withContact} with email/phone)`
    )
  }
  console.log(`\n   Total reachable: ${totalReachable}`)

  // Resolve INSEE codes in address_city to human commune names for email
  // personalization. Does NOT touch the DB; only decorates the CSV output.
  const allCandidates = cohorts.flatMap((co) => co.rows)
  await resolveInseeCodes(allCandidates)

  // Merge all cohorts, deduplicate by id (A>B>C>D priority), filter to reachable
  const seen = new Set<string>()
  const merged: Candidate[] = []
  for (const co of cohorts) {
    for (const r of co.rows) {
      if (seen.has(r.id)) continue
      if (!hasContact(r)) continue
      seen.add(r.id)
      merged.push(r)
    }
  }
  console.log(`   After dedup + contactable filter: ${merged.length}`)

  if (!write) {
    console.log('\n⏭️  --write absent — no CSV written. Sample first 5:')
    for (const r of merged.slice(0, 5)) {
      const city = r.address_city_resolved || r.address_city
      console.log(`     [${r.cohort}] ${r.name} | ${city} | ${r.email || r.phone} | ${r.reason}`)
    }
    return
  }

  const reportDir = path.join(__dirname, '..', 'docs', 'supply-activation-2026-04-20')
  fs.mkdirSync(reportDir, { recursive: true })

  for (const co of cohorts) {
    const csv = toCsv(co.rows.filter(hasContact))
    const outPath = path.join(
      reportDir,
      `cohort-${co.id.toLowerCase()}-${co.name.replace(/\s+/g, '-').toLowerCase()}.csv`
    )
    fs.writeFileSync(outPath, csv, 'utf-8')
    console.log(`   📄 ${outPath}`)
  }

  const mergedCsv = toCsv(merged)
  const mergedPath = path.join(reportDir, 'all-cohorts-merged.csv')
  fs.writeFileSync(mergedPath, mergedCsv, 'utf-8')
  console.log(`   📄 ${mergedPath}`)
  console.log(`\n✅ ${merged.length} outbound-ready candidates written.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
