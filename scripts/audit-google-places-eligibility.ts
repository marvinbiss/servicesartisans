/**
 * Audit Google Places eligibility — preflight ZÉRO appel API.
 *
 * Objectif : permettre à Marvin de prendre la décision Google Places backfill
 * (~833€) en se basant sur des données chiffrées AVANT de payer.
 *
 * Méthode : pour chaque provider en DB, on classifie la qualité de match
 * attendu (high/medium/low/skip) en se basant sur :
 *   - Format SIRET valide
 *   - Présence + format code postal
 *   - Nombre de tokens distinctifs dans le nom (hors stop-words métier)
 *
 * Output :
 *   - Distribution des 4 buckets par sync_status existant
 *   - Coût estimé brut + après crédit gratuit Google ($200/mois)
 *   - Match rate attendu pondéré
 *   - Top 50 providers low-confidence (pour audit manuel optionnel)
 *   - JSON pour piping CI / Slack
 *
 * Usage :
 *   npx tsx scripts/audit-google-places-eligibility.ts            # console table
 *   npx tsx scripts/audit-google-places-eligibility.ts --json     # machine-readable
 *   npx tsx scripts/audit-google-places-eligibility.ts --csv      # export low_confidence
 *
 * Read-only. Idempotent. Safe en CI/cron.
 */
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import { createClient } from '@supabase/supabase-js'
import {
  classifyProviderConfidence,
  estimateBackfillCostUsd,
  estimateMatchRate,
  extractDistinctiveTokens,
  type MatchConfidence,
} from '../src/lib/google/name-quality'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY requis dans .env.local ou .env'
  )
  process.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' },
})

type ProviderRow = {
  id: string
  name: string
  siret: string | null
  address_postal_code: string | null
  google_sync_status: string | null
}

type AuditResult = {
  timestamp: string
  totalProviders: number
  byConfidence: Record<MatchConfidence, number>
  bySyncStatus: Record<string, Record<MatchConfidence, number>>
  costEstimateUsdBrut: number
  costEstimateUsdAfterFreeCredit: number
  matchRateExpected: number
  recommendation: string
  lowConfidenceSample: Array<{ id: string; name: string; siret: string | null; reason: string }>
}

const FREE_CREDIT_USD = 200
const PAGE_SIZE = 1000

function reasonForLow(p: ProviderRow): string {
  const siret = (p.siret ?? '').trim()
  if (!/^\d{14}$/.test(siret)) return 'SIRET invalid or missing'
  const tokens = extractDistinctiveTokens(p.name)
  if (tokens.length === 0) return 'name 100% generic (only trade words)'
  if (tokens.length === 1 && !p.address_postal_code)
    return 'single distinctive token + no postal code'
  return 'medium signals only'
}

async function fetchAllProviders(): Promise<ProviderRow[]> {
  const all: ProviderRow[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('providers')
      .select('id, name, siret, address_postal_code, google_sync_status')
      .eq('is_active', true)
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(`fetchAllProviders failed at offset ${from}: ${error.message}`)
    if (!data || data.length === 0) break
    all.push(...(data as ProviderRow[]))
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return all
}

function buildRecommendation(buckets: Record<MatchConfidence, number>, costBrut: number): string {
  const high = buckets.high ?? 0
  const medium = buckets.medium ?? 0
  const low = buckets.low ?? 0
  const skip = buckets.skip ?? 0
  const callable = high + medium + low
  const matchRate = estimateMatchRate(buckets)

  if (callable === 0) {
    return 'NO-GO — no callable providers (all skip or empty DB).'
  }
  if (high / callable >= 0.7 && matchRate >= 0.75) {
    return `GO — ${Math.round((high / callable) * 100)}% high-confidence, expected match rate ${Math.round(matchRate * 100)}%. Cost ~$${costBrut.toFixed(0)}.`
  }
  if (high / callable >= 0.5 && matchRate >= 0.65) {
    return `CONDITIONAL GO — ${Math.round((high / callable) * 100)}% high-confidence. Run --apply --limit=500 first to validate match rate empirically. Cost ~$${costBrut.toFixed(0)}.`
  }
  if (skip / (callable + skip) > 0.3) {
    return `WAIT — ${Math.round((skip / (callable + skip)) * 100)}% of providers have invalid SIRET. Backfill SIRET data first or accept ${callable} eligible. Cost ~$${costBrut.toFixed(0)} for those.`
  }
  return `WAIT — only ${Math.round(matchRate * 100)}% expected match rate, ${Math.round((low / callable) * 100)}% low-confidence. Improve name quality (extract commercial names from raw rows) before paying.`
}

async function main() {
  const args = process.argv.slice(2)
  const wantJson = args.includes('--json')
  const wantCsv = args.includes('--csv')

  console.error('[audit-google-places-eligibility] fetching providers from DB…')
  const providers = await fetchAllProviders()
  console.error(`[audit-google-places-eligibility] ${providers.length} active providers loaded.`)

  const buckets: Record<MatchConfidence, number> = { high: 0, medium: 0, low: 0, skip: 0 }
  const bySyncStatus: Record<string, Record<MatchConfidence, number>> = {}
  const lowSample: AuditResult['lowConfidenceSample'] = []

  for (const p of providers) {
    const conf = classifyProviderConfidence({
      name: p.name,
      siret: p.siret,
      postalCode: p.address_postal_code,
    })
    buckets[conf] += 1

    const status = p.google_sync_status ?? 'pending'
    if (!bySyncStatus[status]) {
      bySyncStatus[status] = { high: 0, medium: 0, low: 0, skip: 0 }
    }
    bySyncStatus[status][conf] += 1

    if (conf === 'low' && lowSample.length < 50) {
      lowSample.push({ id: p.id, name: p.name, siret: p.siret, reason: reasonForLow(p) })
    }
  }

  const costBrut = estimateBackfillCostUsd(buckets)
  const costAfterCredit = Math.max(0, costBrut - FREE_CREDIT_USD)
  const matchRate = estimateMatchRate(buckets)

  const result: AuditResult = {
    timestamp: new Date().toISOString(),
    totalProviders: providers.length,
    byConfidence: buckets,
    bySyncStatus,
    costEstimateUsdBrut: costBrut,
    costEstimateUsdAfterFreeCredit: Math.round(costAfterCredit * 100) / 100,
    matchRateExpected: matchRate,
    recommendation: buildRecommendation(buckets, costBrut),
    lowConfidenceSample: lowSample,
  }

  if (wantJson) {
    console.log(JSON.stringify(result, null, 2))
    return
  }

  if (wantCsv) {
    const out = path.join(__dirname, '..', '.cache', 'google-places-low-confidence.csv')
    fs.mkdirSync(path.dirname(out), { recursive: true })
    const lines = ['id,name,siret,reason']
    for (const row of lowSample) {
      const safeName = (row.name ?? '').replace(/"/g, '""')
      lines.push(`${row.id},"${safeName}",${row.siret ?? ''},"${row.reason}"`)
    }
    fs.writeFileSync(out, lines.join('\n'), 'utf8')
    console.log(`✅ CSV exported → ${out} (${lowSample.length} rows)`)
    return
  }

  console.log(`\n=== Google Places eligibility audit — ${result.timestamp} ===`)
  console.log(`Total providers (active) : ${result.totalProviders.toLocaleString('fr-FR')}`)
  console.log('')
  console.log('Confidence buckets :')
  console.log(
    `  🟢 high   : ${buckets.high.toLocaleString('fr-FR')}  (≥2 distinctive tokens + valid SIRET + postal code)`
  )
  console.log(
    `  🟡 medium : ${buckets.medium.toLocaleString('fr-FR')}  (1+ token, partial signals)`
  )
  console.log(
    `  🔴 low    : ${buckets.low.toLocaleString('fr-FR')}  (generic name only — high collision risk)`
  )
  console.log(
    `  ⚪ skip   : ${buckets.skip.toLocaleString('fr-FR')}  (SIRET invalid → backfill skips)`
  )
  console.log('')
  console.log(`Cost estimate (Text Search Pro $0.032/call) :`)
  console.log(`  Brut             : $${costBrut.toFixed(2)}  (~€${(costBrut * 0.92).toFixed(0)})`)
  console.log(
    `  After $200 credit: $${costAfterCredit.toFixed(2)}  (~€${(costAfterCredit * 0.92).toFixed(0)})`
  )
  console.log('')
  console.log(
    `Expected match rate : ${(matchRate * 100).toFixed(1)}%  (weighted: high=0.9, medium=0.6, low=0.2)`
  )
  console.log('')
  console.log('By existing sync_status :')
  const statusKeys = Object.keys(bySyncStatus).sort()
  for (const s of statusKeys) {
    const b = bySyncStatus[s]
    const total = b.high + b.medium + b.low + b.skip
    console.log(
      `  ${s.padEnd(12)} → total=${total.toString().padStart(6)} | high=${b.high} medium=${b.medium} low=${b.low} skip=${b.skip}`
    )
  }
  console.log('')
  console.log(`Recommendation : ${result.recommendation}`)
  console.log('')
  if (lowSample.length > 0) {
    console.log(`Top ${lowSample.length} low-confidence providers (sample) :`)
    for (const row of lowSample.slice(0, 10)) {
      console.log(`  - ${row.id} ${row.name.slice(0, 50).padEnd(50)} → ${row.reason}`)
    }
    if (lowSample.length > 10)
      console.log(`  …and ${lowSample.length - 10} more (run with --csv to export all)`)
  }
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
