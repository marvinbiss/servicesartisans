/**
 * Enrich providers with INSEE/Sirene data via recherche-entreprises.api.gouv.fr.
 *
 * By default, targets providers currently in judged_fail status in the
 * description pipeline (these are the ones that desperately need E-E-A-T
 * signal boost). Use --target all to refresh every active RGE provider.
 *
 * Upserts into `provider_insee_enrichment` (migration 459).
 *
 * CLI:
 *   npx tsx scripts/enrich-providers-insee.ts --dry-run --limit 5
 *   npx tsx scripts/enrich-providers-insee.ts --limit 50
 *   npx tsx scripts/enrich-providers-insee.ts                    # all judged_fail
 *   npx tsx scripts/enrich-providers-insee.ts --target all       # all active
 */

import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { fetchBySiren, hitToEnrichment } from '@/lib/insee/recherche-entreprises'

type Args = {
  dryRun: boolean
  limit: number | null
  target: 'judged_fail' | 'all'
  concurrency: number
  skipExisting: boolean
}

const parseArgs = (argv: string[]): Args => {
  const out: Args = {
    dryRun: false,
    limit: null,
    target: 'judged_fail',
    concurrency: 5,
    skipExisting: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry-run') out.dryRun = true
    else if (a === '--skip-existing') out.skipExisting = true
    else if (a === '--limit') {
      out.limit = Number(argv[++i])
      if (!Number.isFinite(out.limit) || out.limit! <= 0) {
        throw new Error('--limit requires a positive integer')
      }
    } else if (a === '--target') {
      const v = argv[++i]
      if (v !== 'judged_fail' && v !== 'all') {
        throw new Error(`--target must be judged_fail or all (got ${v})`)
      }
      out.target = v
    } else if (a === '--concurrency') {
      out.concurrency = Number(argv[++i])
      if (!Number.isFinite(out.concurrency) || out.concurrency < 1 || out.concurrency > 10) {
        throw new Error('--concurrency must be 1..10')
      }
    } else throw new Error(`Unknown flag: ${a}`)
  }
  return out
}

async function fetchExistingEnrichmentIds(): Promise<Set<string>> {
  const supabase = createAdminClient()
  const out = new Set<string>()
  const PAGE = 1000
  let cursor: string | null = null
  for (;;) {
    let q = supabase
      .from('provider_insee_enrichment')
      .select('provider_id')
      .order('provider_id', { ascending: true })
      .limit(PAGE)
    if (cursor !== null) q = q.gt('provider_id', cursor)
    const { data, error } = await q
    if (error) throw new Error(`fetchExistingEnrichmentIds: ${error.message}`)
    const rows = data ?? []
    if (rows.length === 0) break
    for (const r of rows) out.add(r.provider_id as string)
    cursor = rows[rows.length - 1].provider_id as string
    if (rows.length < PAGE) break
  }
  return out
}

type Candidate = { id: string; siret: string | null }

async function fetchCandidates(target: Args['target']): Promise<Candidate[]> {
  const supabase = createAdminClient()
  const out: Candidate[] = []
  const PAGE = 1000

  if (target === 'judged_fail') {
    // Join draft → provider via PostgREST FK.
    const failIds: string[] = []
    let cursor: string | null = null
    for (;;) {
      let q = supabase
        .from('provider_descriptions_draft')
        .select('provider_id')
        .eq('status', 'judged_fail')
        .order('provider_id', { ascending: true })
        .limit(PAGE)
      if (cursor !== null) q = q.gt('provider_id', cursor)
      const { data, error } = await q
      if (error) throw new Error(`fetch judged_fail: ${error.message}`)
      const rows = data ?? []
      if (rows.length === 0) break
      for (const r of rows) failIds.push(r.provider_id as string)
      cursor = rows[rows.length - 1].provider_id as string
      if (rows.length < PAGE) break
    }
    // Chunk the id fetch to stay under Cloudflare URL limits.
    const CHUNK = 200
    for (let i = 0; i < failIds.length; i += CHUNK) {
      const slice = failIds.slice(i, i + CHUNK)
      const { data, error } = await supabase.from('providers').select('id, siret').in('id', slice)
      if (error) throw new Error(`fetch provider sirets: ${error.message}`)
      for (const r of data ?? []) {
        out.push({ id: r.id as string, siret: (r.siret as string | null) ?? null })
      }
    }
  } else {
    let cursor: string | null = null
    for (;;) {
      let q = supabase
        .from('providers')
        .select('id, siret')
        .eq('is_active', true)
        .not('rge_qualifications', 'is', null)
        .order('id', { ascending: true })
        .limit(PAGE)
      if (cursor !== null) q = q.gt('id', cursor)
      const { data, error } = await q
      if (error) throw new Error(`fetch active: ${error.message}`)
      const rows = data ?? []
      if (rows.length === 0) break
      for (const r of rows) {
        out.push({ id: r.id as string, siret: (r.siret as string | null) ?? null })
      }
      cursor = rows[rows.length - 1].id as string
      if (rows.length < PAGE) break
    }
  }
  return out
}

const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function processOne(
  cand: Candidate,
  dryRun: boolean
): Promise<{ ok: boolean; skipped: boolean; error?: string }> {
  if (!cand.siret || cand.siret.length < 9) {
    return { ok: false, skipped: true, error: 'no siret' }
  }
  const identifier = cand.siret.replace(/\s+/g, '').slice(0, 14)
  try {
    const hit = await fetchBySiren(identifier)
    if (!hit) return { ok: false, skipped: true, error: 'api 0 hits' }
    const enrichment = hitToEnrichment(hit)
    if (dryRun) {
      console.log(
        `  DRY ${cand.id.slice(0, 8)} ${enrichment.nom_complet} age=${enrichment.age_years} effectif=${enrichment.tranche_effectif_label} naf=${enrichment.activite_principale_naf} etat=${enrichment.etat_administratif} rge=${enrichment.liste_rge_codes.length}`
      )
      return { ok: true, skipped: false }
    }
    const supabase = createAdminClient()
    const { error } = await supabase.from('provider_insee_enrichment').upsert(
      {
        provider_id: cand.id,
        siren: enrichment.siren,
        siret_siege: enrichment.siret_siege,
        nom_complet: enrichment.nom_complet,
        date_creation: enrichment.date_creation,
        tranche_effectif_code: enrichment.tranche_effectif_code,
        tranche_effectif_label: enrichment.tranche_effectif_label,
        activite_principale_naf: enrichment.activite_principale_naf,
        etat_administratif: enrichment.etat_administratif,
        nombre_etablissements: enrichment.nombre_etablissements,
        nombre_etablissements_ouverts: enrichment.nombre_etablissements_ouverts,
        liste_rge_codes: enrichment.liste_rge_codes,
        raw: enrichment.raw,
        fetched_at: new Date().toISOString(),
        last_api_update: enrichment.last_api_update,
        fetch_error: null,
      },
      { onConflict: 'provider_id' }
    )
    if (error) {
      logger.warn('[enrich-insee] upsert failed', { providerId: cand.id, error: error.message })
      console.error(`  ERR upsert ${cand.id.slice(0, 8)} ${cand.siret}: ${error.message}`)
      return { ok: false, skipped: false, error: error.message }
    }
    return { ok: true, skipped: false }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`  ERR fetch ${cand.id.slice(0, 8)} ${cand.siret}: ${msg}`)
    return { ok: false, skipped: false, error: msg }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  console.log(
    `[enrich-insee] target=${args.target} dryRun=${args.dryRun} limit=${args.limit ?? 'none'} concurrency=${args.concurrency}`
  )

  let candidates = await fetchCandidates(args.target)
  if (args.skipExisting) {
    const existing = await fetchExistingEnrichmentIds()
    const before = candidates.length
    candidates = candidates.filter((c) => !existing.has(c.id))
    console.log(`[enrich-insee] skipped ${before - candidates.length} already enriched`)
  }
  const scope = args.limit ? candidates.slice(0, args.limit) : candidates
  console.log(`[enrich-insee] candidates=${candidates.length} scope=${scope.length}`)
  if (scope.length === 0) {
    console.log('[enrich-insee] nothing to do.')
    return
  }

  let ok = 0
  let err = 0
  let skipped = 0
  const start = Date.now()

  // Worker pool with rate budget (5 req/s max even with concurrency).
  const queue = [...scope]
  const runWorker = async (): Promise<void> => {
    for (;;) {
      const cand = queue.shift()
      if (!cand) return
      const before = Date.now()
      const r = await processOne(cand, args.dryRun)
      if (r.skipped) skipped++
      else if (r.ok) ok++
      else err++
      // Rate budget : at concurrency=5 and 200ms/call → 25 req/s without pace.
      // Enforce 200ms per call to keep under 5 req/s global (concurrency*5).
      const elapsed = Date.now() - before
      if (elapsed < 200) await delay(200 - elapsed)
    }
  }
  await Promise.all(Array.from({ length: args.concurrency }, () => runWorker()))

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  console.log(
    `[enrich-insee] done ok=${ok} skipped=${skipped} errors=${err} elapsed=${elapsed}s rate=${(scope.length / Number(elapsed)).toFixed(1)}/s`
  )
}

main().catch((e) => {
  console.error('[enrich-insee] fatal:', e)
  process.exit(1)
})
