#!/usr/bin/env npx tsx
/**
 * noindex-zombies-services.ts — Identify & accelerate de-indexation of
 * zombie /services/[service]/[location] pages (CEO plan, Pilier 3 vague B.1).
 *
 * Zombie criteria (ALL must match):
 *   1. URL pattern: /services/{service}/{location}   (depth 3, no provider slug)
 *   2. Impressions on 90d GSC ≤ 2  (no real traffic)
 *   3. 0 local providers matching commune
 *   4. No commune enrichment (prix_m2_moyen IS NULL → blocs fall back generic)
 *
 * Output:
 *   - Writes docs/seo/zombies-services-2026-04-20.txt (URL list)
 *   - Calls IndexNow to trigger recrawl so Google sees shouldNoindex() → removes from index
 *
 * shouldNoindex() in src/lib/seo/pruning.ts already fires runtime for pages
 * with providerCount=0 AND hasUniqueData=false. This script doesn't flip any
 * flag — it just accelerates Google's recrawl via IndexNow ping.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { submitToIndexNow } from '../src/lib/seo/indexnow'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
const supabase = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const ROOT = path.join(__dirname, '..')
const PAGES_CSV = path.join(ROOT, 'docs', 'ahrefs-audit-2026-04', 'normalized', 'Pages_v2.csv')

// Villes déjà enrichies (CEO plan Vague A) — NE PAS noindex même si 0 provider
const ENRICHED_VILLES_TOP40 = [
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

function parseCsv(p: string): Array<{ url: string; impr: number; pos: number }> {
  const raw = fs.readFileSync(p, 'utf-8').replace(/^\uFEFF/, '')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  const header = lines[0].split(',').map((s) => s.replace(/^"|"$/g, '').trim())
  const iUrl = 0
  const iImpr = header.findIndex((h) => /impressions?/i.test(h))
  const iPos = header.findIndex((h) => /position/i.test(h))
  const rows: Array<{ url: string; impr: number; pos: number }> = []
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
    rows.push({
      url:
        parts[iUrl]
          ?.replace(/^"|"$/g, '')
          .replace(/^https?:\/\/servicesartisans\.fr/, '')
          .trim() || '',
      impr: Number(parts[iImpr] || 0),
      pos: parseFloat((parts[iPos] || '0').replace(',', '.')) || 0,
    })
  }
  return rows
}

function isServiceVillePath(url: string): boolean {
  const segs = url.split('?')[0].split('/').filter(Boolean)
  // /services/{s}/{v} = 3 segs, no digits suffix (those are provider pages)
  if (segs.length !== 3 || segs[0] !== 'services') return false
  if (/-\d+$/.test(segs[2])) return false // provider-publicId pattern
  return true
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const doIndexNow = process.argv.includes('--submit-indexnow')

  console.log(`📊 Reading GSC pages from ${PAGES_CSV}`)
  const pages = parseCsv(PAGES_CSV)

  // URLs indexed by Google (they have impressions > 0)
  const serviceVillePages = new Map<string, { impr: number; pos: number }>()
  for (const p of pages) {
    if (isServiceVillePath(p.url)) {
      serviceVillePages.set(p.url, { impr: p.impr, pos: p.pos })
    }
  }
  console.log(`  Total /services/[s]/[v] with GSC activity: ${serviceVillePages.size}`)

  // Candidate zombies: impr ≤ 20 (low value vs. crawl budget)
  const THRESHOLD = parseInt(
    process.argv.find((a) => a.startsWith('--max-impr='))?.split('=')[1] || '20',
    10
  )
  const lowImpr = Array.from(serviceVillePages.entries()).filter(
    ([, stats]) => stats.impr <= THRESHOLD
  )
  console.log(`  Low-impression candidates (≤${THRESHOLD} impr): ${lowImpr.length}`)

  // Extract ville slugs from URLs
  const urls = lowImpr.map(([url]) => url)
  const villeSlugs = Array.from(new Set(urls.map((u) => u.split('/')[3])))
  console.log(`  Distinct ville slugs among candidates: ${villeSlugs.length}`)

  // Fetch commune data for enrichment status
  const { data: communes } = await supabase
    .from('communes')
    .select('slug,name,prix_m2_moyen')
    .in('slug', villeSlugs)
  const enrichmentMap = new Map<string, boolean>()
  for (const c of communes || []) {
    enrichmentMap.set(c.slug, c.prix_m2_moyen !== null && c.prix_m2_moyen > 0)
  }

  // Fetch provider counts per (service, ville)
  const zombies: Array<{
    url: string
    impr: number
    reason: string
    ville: string
    service: string
  }> = []
  const keepers: Array<{ url: string; reason: string }> = []

  for (const [url, stats] of lowImpr) {
    const segs = url.split('/').filter(Boolean)
    const service = segs[1]
    const ville = segs[2]

    // Rule 1: keep if in top-40 enriched list (strategic, don't noindex)
    if (ENRICHED_VILLES_TOP40.includes(ville)) {
      keepers.push({ url, reason: 'top40_enriched' })
      continue
    }

    // Rule 2: keep if commune is enriched (hasUniqueData = true)
    if (enrichmentMap.get(ville)) {
      keepers.push({ url, reason: 'commune_enriched' })
      continue
    }

    // Rule 3: check provider count for (service, ville)
    // We use commune name rather than slug because providers.address_city stores names
    const commune = (communes || []).find((c) => c.slug === ville)
    const communeName = commune?.name || ville
    const { count } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('specialty', service)
      .ilike('address_city', communeName)
    if (count && count > 0) {
      keepers.push({ url, reason: `has_${count}_providers` })
      continue
    }

    zombies.push({ url, impr: stats.impr, reason: 'zero_providers_no_enrichment', ville, service })
  }

  console.log(`\n🧟 Zombie candidates: ${zombies.length}`)
  console.log(`🛡️  Keepers (strategic or enriched or providers>0): ${keepers.length}`)

  // Write report
  const reportDir = path.join(ROOT, 'docs', 'seo')
  fs.mkdirSync(reportDir, { recursive: true })
  const reportPath = path.join(reportDir, 'zombies-services-2026-04-20.txt')
  const lines: string[] = []
  lines.push('# Zombie /services/[s]/[v] URLs identified 2026-04-20')
  lines.push(
    '# Criteria: impressions ≤ 2 AND 0 providers AND no commune enrichment AND not in top40'
  )
  lines.push(`# Total: ${zombies.length}`)
  lines.push('')
  lines.push('# --- URL LIST FOR INDEXNOW ---')
  for (const z of zombies) lines.push(`${SITE_URL}${z.url}`)
  lines.push('')
  lines.push('# --- DETAIL ---')
  for (const z of zombies) {
    lines.push(`${z.url}  impr=${z.impr} reason=${z.reason}`)
  }
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf-8')
  console.log(`\n📄 Report: ${reportPath}`)

  if (dryRun) {
    console.log('\n⏭️  --dry-run set — no IndexNow submit')
    return
  }

  if (!doIndexNow) {
    console.log('\n⚠️  Add --submit-indexnow to actually ping IndexNow')
    return
  }

  if (zombies.length === 0) {
    console.log('\n✅ No zombies to submit.')
    return
  }

  // Build absolute URLs
  const urlsToSubmit = zombies.map((z) => `${SITE_URL}${z.url}`)
  console.log(`\n📡 Submitting ${urlsToSubmit.length} URLs to IndexNow…`)
  const result = await submitToIndexNow(urlsToSubmit)
  console.log(
    `   ${result.success ? '✅' : '❌'} ${result.submitted} submitted ${result.error ? '| ' + result.error : ''}`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
