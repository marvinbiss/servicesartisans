/**
 * RGE ADEME sync — shared logic between CLI script and Vercel cron.
 *
 * Source    : https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2
 * Licence   : Etalab 2.0 — attribution "Source : ADEME — France Rénov'" requise
 * Volume    : ~165k lignes, ~88k SIRET uniques (1 ligne = 1 qualification)
 *
 * Consumers :
 * - scripts/enrich-rge-ademe.ts (CLI, supporte --dry-run, --limit, --skip-backfill)
 * - src/app/api/cron/rge-sync/route.ts (cron Vercel hebdomadaire)
 */

import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ADEME_BASE = 'https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2/lines'
const ADEME_PAGE_SIZE = 10_000
const ADEME_USER_AGENT = 'servicesartisans-rge-sync/1.0 (contact@servicesartisans.fr)'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Ligne brute du dataset ADEME (schéma confirmé 2026-04-09 via dry-run).
 * Chaque ligne = UNE qualification pour UN SIRET donné.
 */
export interface AdemeRgeRow {
  _id?: string
  siret?: string
  nom_entreprise?: string
  code_qualification?: string
  nom_qualification?: string
  nom_certificat?: string
  organisme?: string
  domaine?: string
  meta_domaine?: string
  particulier?: boolean
  lien_date_debut?: string
  lien_date_fin?: string
  url_qualification?: string
  adresse?: string
  code_postal?: string
  commune?: string
  latitude?: number
  longitude?: number
  telephone?: string
  email?: string
  site_internet?: string
}

export interface RgeQualification {
  code: string
  nom: string
  organisme: string
  domaine: string | null
  meta_domaine: string | null
  date_debut: string
  date_fin: string
  url: string | null
}

export interface AggregatedProvider {
  siret: string
  qualifications: RgeQualification[]
  valid_until: string
  organismes: string[]
  source_url: string
}

export interface RgeSyncOptions {
  /** Si true, aucun UPDATE n'est effectué (log seulement). Default: false */
  dryRun?: boolean
  /** Nombre max de lignes ADEME à récupérer. Default: Infinity */
  limit?: number
  /** Si true, saute le backfill de communes.nb_artisans_rge. Default: false */
  skipBackfill?: boolean
  /** Logger injectable (console par défaut) */
  logger?: Pick<Console, 'log' | 'warn' | 'error'>
}

export interface RgeSyncResult {
  ademeRowsFetched: number
  expiredFiltered: number
  invalidSkipped: number
  uniqueSirets: number
  providersMatched: number
  providersUpdated: number
  staleCleared: number
  communesUpdated: number
  totalRgeActifs: number
  durationSeconds: number
}

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function normalizeSiret(raw: string | undefined | null): string | null {
  if (!raw) return null
  const cleaned = raw.replace(/\s+/g, '').replace(/\D/g, '')
  if (cleaned.length !== 14) return null
  return cleaned
}

function isValidDate(iso: string | undefined): boolean {
  if (!iso) return false
  const d = new Date(iso)
  return !Number.isNaN(d.getTime())
}

// ---------------------------------------------------------------------------
// 1. Fetch ADEME dataset (cursor pagination)
// ---------------------------------------------------------------------------

export async function fetchAllAdemeRows(
  limit: number = Infinity,
  log: RgeSyncOptions['logger'] = console,
): Promise<AdemeRgeRow[]> {
  log!.log('→ Fetching ADEME RGE dataset...')
  const rows: AdemeRgeRow[] = []
  let after: string | null = null
  let page = 0

  while (rows.length < limit) {
    const url = new URL(ADEME_BASE)
    url.searchParams.set('size', String(Math.min(ADEME_PAGE_SIZE, limit - rows.length)))
    if (after) url.searchParams.set('after', after)

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': ADEME_USER_AGENT, Accept: 'application/json' },
    })

    if (!res.ok) {
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('retry-after') || '30', 10)
        log!.warn(`  429 rate-limited, sleeping ${retryAfter}s...`)
        await sleep(retryAfter * 1000)
        continue
      }
      throw new Error(`ADEME API failed: ${res.status} ${res.statusText}`)
    }

    const body = await res.json() as { results?: AdemeRgeRow[]; next?: string; total?: number }
    const batch = body.results || []
    rows.push(...batch)
    page++
    log!.log(`  Page ${page}: +${batch.length} rows (total: ${rows.length}${body.total ? `/${body.total}` : ''})`)

    if (!body.next || batch.length === 0) break
    try {
      const nextUrl = new URL(body.next)
      after = nextUrl.searchParams.get('after')
    } catch {
      after = body.next
    }
    if (!after) break

    await sleep(200)
  }

  log!.log(`✓ Fetched ${rows.length} RGE qualification rows from ADEME`)
  return rows
}

// ---------------------------------------------------------------------------
// 2. Aggregate by SIRET
// ---------------------------------------------------------------------------

export function aggregateBySiret(
  rows: AdemeRgeRow[],
  log: RgeSyncOptions['logger'] = console,
): { aggregated: Map<string, AggregatedProvider>; expired: number; skipped: number } {
  log!.log('→ Aggregating rows by SIRET...')
  const byS: Map<string, AggregatedProvider> = new Map()
  const today = new Date().toISOString().slice(0, 10)
  let skipped = 0
  let expired = 0

  for (const row of rows) {
    const siret = normalizeSiret(row.siret)
    if (!siret) { skipped++; continue }
    if (!isValidDate(row.lien_date_debut) || !isValidDate(row.lien_date_fin)) { skipped++; continue }
    if (!row.code_qualification || !row.nom_qualification || !row.organisme) { skipped++; continue }

    const dateFin = row.lien_date_fin!.slice(0, 10)
    if (dateFin < today) { expired++; continue }

    const qual: RgeQualification = {
      code: row.code_qualification,
      nom: row.nom_qualification,
      organisme: row.organisme,
      domaine: row.domaine || null,
      meta_domaine: row.meta_domaine || null,
      date_debut: row.lien_date_debut!.slice(0, 10),
      date_fin: dateFin,
      url: row.url_qualification || null,
    }

    const existing = byS.get(siret)
    if (existing) {
      const dupKey = `${qual.code}|${qual.organisme}`
      const alreadyThere = existing.qualifications.find(q => `${q.code}|${q.organisme}` === dupKey)
      if (!alreadyThere) {
        existing.qualifications.push(qual)
        if (qual.date_fin > existing.valid_until) existing.valid_until = qual.date_fin
        if (!existing.organismes.includes(qual.organisme)) existing.organismes.push(qual.organisme)
      }
    } else {
      byS.set(siret, {
        siret,
        qualifications: [qual],
        valid_until: qual.date_fin,
        organismes: [qual.organisme],
        source_url: `https://france-renov.gouv.fr/annuaire-rge?siret=${siret}`,
      })
    }
  }

  // Cap à 10 qualifs / 5 organismes par entreprise (matches CHECK constraints 380)
  byS.forEach((agg) => {
    if (agg.qualifications.length > 10) agg.qualifications = agg.qualifications.slice(0, 10)
    if (agg.organismes.length > 5) agg.organismes = agg.organismes.slice(0, 5)
  })

  if (expired > 0) log!.log(`  Filtered ${expired} expired qualifications (lien_date_fin < ${today})`)
  log!.log(`✓ Aggregated into ${byS.size} unique SIRET (skipped ${skipped} invalid rows)`)
  return { aggregated: byS, expired, skipped }
}

// ---------------------------------------------------------------------------
// 3. Match against providers.siret and UPDATE
// ---------------------------------------------------------------------------

export async function matchAndUpdate(
  aggregated: Map<string, AggregatedProvider>,
  supabase: SupabaseClient,
  dryRun: boolean,
  log: RgeSyncOptions['logger'] = console,
): Promise<{ matched: number; updated: number }> {
  log!.log('→ Matching against providers.siret...')

  const sirets = Array.from(aggregated.keys())
  const BATCH = 100
  let matched = 0
  let updated = 0
  const now = new Date().toISOString()

  for (let i = 0; i < sirets.length; i += BATCH) {
    const chunk = sirets.slice(i, i + BATCH)

    // Retry avec backoff sur timeout (57014) — charge Supabase variable
    type ProviderRow = { id: string; siret: string | null }
    let providers: ProviderRow[] | null = null
    let selErr: { code?: string; message?: string } | null = null
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await supabase
        .from('providers')
        .select('id, siret')
        .in('siret', chunk)
      providers = (res.data ?? null) as ProviderRow[] | null
      selErr = res.error
      if (!selErr) break
      if (selErr.code !== '57014') break // seulement retry sur timeout
      const wait = 1000 * Math.pow(2, attempt)
      log!.warn(`  batch ${i}-${i + BATCH}: timeout, retry ${attempt + 1}/4 dans ${wait}ms`)
      await sleep(wait)
    }

    if (selErr) {
      log!.error(`  batch ${i}-${i + BATCH}: SELECT failed (abandonné)`, selErr)
      continue
    }
    if (!providers || providers.length === 0) continue

    matched += providers.length

    if (dryRun) {
      log!.log(`  [dry-run] would update ${providers.length} providers`)
      continue
    }

    for (const p of providers) {
      const agg = aggregated.get(p.siret!)
      if (!agg) continue

      const { error: updErr } = await supabase
        .from('providers')
        .update({
          rge_qualifications: agg.qualifications,
          rge_valid_until: agg.valid_until,
          rge_organismes: agg.organismes,
          rge_last_synced_at: now,
          rge_source_url: agg.source_url,
        })
        .eq('id', p.id)

      if (updErr) {
        log!.error(`  UPDATE failed for ${p.id}:`, updErr.message)
        continue
      }
      updated++
    }
  }

  log!.log(`✓ Matched ${matched} providers, updated ${updated}`)
  return { matched, updated }
}

// ---------------------------------------------------------------------------
// 4. Clear stale RGE on providers no longer in dataset
// ---------------------------------------------------------------------------

export async function clearStaleRge(
  currentSirets: Set<string>,
  supabase: SupabaseClient,
  dryRun: boolean,
  log: RgeSyncOptions['logger'] = console,
): Promise<number> {
  log!.log('→ Clearing stale RGE on providers no longer in ADEME dataset...')

  const { data: stale, error } = await supabase
    .from('providers')
    .select('id, siret')
    .not('rge_valid_until', 'is', null)

  if (error || !stale) {
    log!.error('  Failed to fetch stale:', error)
    return 0
  }

  const toClear = stale.filter(p => !p.siret || !currentSirets.has(p.siret))
  if (toClear.length === 0) {
    log!.log('  No stale RGE to clear')
    return 0
  }

  if (dryRun) {
    log!.log(`  [dry-run] would clear ${toClear.length} stale RGE`)
    return toClear.length
  }

  const { error: updErr } = await supabase
    .from('providers')
    .update({
      rge_qualifications: null,
      rge_valid_until: null,
      rge_organismes: null,
      rge_source_url: null,
    })
    .in('id', toClear.map(p => p.id))

  if (updErr) {
    log!.error('  Clear failed:', updErr)
    return 0
  }

  log!.log(`✓ Cleared ${toClear.length} stale RGE`)
  return toClear.length
}

// ---------------------------------------------------------------------------
// 5. Backfill communes.nb_artisans_rge (via RPC from migration 381)
// ---------------------------------------------------------------------------

export async function backfillCommunes(
  supabase: SupabaseClient,
  dryRun: boolean,
  log: RgeSyncOptions['logger'] = console,
): Promise<{ communesUpdated: number; totalRgeActifs: number }> {
  log!.log('→ Backfilling communes.nb_artisans_rge via RPC...')

  if (dryRun) {
    log!.log('  [dry-run] would call RPC rge_backfill_communes()')
    return { communesUpdated: 0, totalRgeActifs: 0 }
  }

  const { data, error } = await supabase
    .rpc('rge_backfill_communes')
    .single()

  if (error) {
    log!.error('  RPC rge_backfill_communes failed:', error.message)
    log!.error('  → Vérifie que la migration 381 a été appliquée sur la DB.')
    return { communesUpdated: 0, totalRgeActifs: 0 }
  }

  const row = data as { communes_updated?: number; total_rge?: number } | null
  const result = {
    communesUpdated: row?.communes_updated ?? 0,
    totalRgeActifs: row?.total_rge ?? 0,
  }
  log!.log(`✓ Backfilled ${result.communesUpdated} communes (total RGE actifs: ${result.totalRgeActifs})`)
  return result
}

// ---------------------------------------------------------------------------
// Orchestrator — top-level entry point
// ---------------------------------------------------------------------------

export async function syncRgeFromAdeme(
  supabase: SupabaseClient,
  options: RgeSyncOptions = {},
): Promise<RgeSyncResult> {
  const t0 = Date.now()
  const log = options.logger || console
  const dryRun = options.dryRun ?? false
  const skipBackfill = options.skipBackfill ?? false
  const limit = options.limit ?? Infinity

  log.log('═══ syncRgeFromAdeme ═══')
  log.log(`Mode: ${dryRun ? 'DRY-RUN' : 'WRITE'}`)
  log.log(`Limit: ${limit === Infinity ? 'none' : limit}`)
  log.log('')

  const rows = await fetchAllAdemeRows(limit, log)
  const { aggregated, expired, skipped } = aggregateBySiret(rows, log)
  const { matched, updated } = await matchAndUpdate(aggregated, supabase, dryRun, log)
  const cleared = await clearStaleRge(new Set(aggregated.keys()), supabase, dryRun, log)

  let communesUpdated = 0
  let totalRgeActifs = 0
  if (!skipBackfill) {
    const b = await backfillCommunes(supabase, dryRun, log)
    communesUpdated = b.communesUpdated
    totalRgeActifs = b.totalRgeActifs
  } else {
    log.log('→ Skipping commune backfill (option.skipBackfill)')
  }

  return {
    ademeRowsFetched: rows.length,
    expiredFiltered: expired,
    invalidSkipped: skipped,
    uniqueSirets: aggregated.size,
    providersMatched: matched,
    providersUpdated: updated,
    staleCleared: cleared,
    communesUpdated,
    totalRgeActifs,
    durationSeconds: Math.round((Date.now() - t0) / 1000),
  }
}
