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

const ADEME_BASE =
  'https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2/lines'
const ADEME_PAGE_SIZE = 10_000
const ADEME_USER_AGENT = 'servicesartisans-rge-sync/1.0 (contact@servicesartisans.fr)'

/**
 * Garde-fou P0 : seuil minimal de lignes ADEME en dessous duquel on refuse
 * de lancer clearStaleRge(). Le dataset complet fait ~165k lignes. Si on en
 * récupère < 50k, c'est un signal d'alerte (API partiellement down, changement
 * de schéma, rate-limit silencieux, coupure réseau à mi-pagination...) et
 * effacer les providers actuels serait catastrophique (scénario ADEME vide).
 */
const ADEME_MIN_ROWS_FOR_CLEAR = 50_000

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
  /**
   * Si true, déclare explicitement une sync partielle — clearStaleRge() sera skippé
   * pour éviter d'effacer des providers hors de la fenêtre limitée.
   * Auto-activé si `limit` est défini et `< Infinity`.
   * Default: false
   */
  isPartialSync?: boolean
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
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeSiret(raw: string | undefined | null): string | null {
  if (!raw) return null
  const cleaned = raw.replace(/\s+/g, '').replace(/\D/g, '')
  if (cleaned.length !== 14) return null
  return cleaned
}

function isValidDate(iso: string | undefined): iso is string {
  if (!iso) return false
  const d = new Date(iso)
  return !Number.isNaN(d.getTime())
}

// ---------------------------------------------------------------------------
// 1. Fetch ADEME dataset (cursor pagination)
// ---------------------------------------------------------------------------

export async function fetchAllAdemeRows(
  limit: number = Infinity,
  log: Pick<Console, 'log' | 'warn' | 'error'> = console
): Promise<AdemeRgeRow[]> {
  log.log('→ Fetching ADEME RGE dataset...')
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
        log.warn(`  429 rate-limited, sleeping ${retryAfter}s...`)
        await sleep(retryAfter * 1000)
        continue
      }
      throw new Error(`ADEME API failed: ${res.status} ${res.statusText}`)
    }

    const body = (await res.json()) as { results?: AdemeRgeRow[]; next?: string; total?: number }
    const batch = body.results || []
    rows.push(...batch)
    page++
    log.log(
      `  Page ${page}: +${batch.length} rows (total: ${rows.length}${body.total ? `/${body.total}` : ''})`
    )

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

  log.log(`✓ Fetched ${rows.length} RGE qualification rows from ADEME`)
  return rows
}

// ---------------------------------------------------------------------------
// 2. Aggregate by SIRET
// ---------------------------------------------------------------------------

export function aggregateBySiret(
  rows: AdemeRgeRow[],
  log: Pick<Console, 'log' | 'warn' | 'error'> = console
): { aggregated: Map<string, AggregatedProvider>; expired: number; skipped: number } {
  log.log('→ Aggregating rows by SIRET...')
  const byS: Map<string, AggregatedProvider> = new Map()
  const today = new Date().toISOString().slice(0, 10)
  let skipped = 0
  let expired = 0

  for (const row of rows) {
    const siret = normalizeSiret(row.siret)
    if (!siret) {
      skipped++
      continue
    }
    const dateDebutRaw = row.lien_date_debut
    const dateFinRaw = row.lien_date_fin
    if (!isValidDate(dateDebutRaw) || !isValidDate(dateFinRaw)) {
      skipped++
      continue
    }
    if (!row.code_qualification || !row.nom_qualification || !row.organisme) {
      skipped++
      continue
    }

    const dateFin = dateFinRaw.slice(0, 10)
    if (dateFin < today) {
      expired++
      continue
    }

    const qual: RgeQualification = {
      code: row.code_qualification,
      nom: row.nom_qualification,
      organisme: row.organisme,
      domaine: row.domaine || null,
      meta_domaine: row.meta_domaine || null,
      date_debut: dateDebutRaw.slice(0, 10),
      date_fin: dateFin,
      url: row.url_qualification || null,
    }

    const existing = byS.get(siret)
    if (existing) {
      const dupKey = `${qual.code}|${qual.organisme}`
      const alreadyThere = existing.qualifications.find(
        (q) => `${q.code}|${q.organisme}` === dupKey
      )
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

  if (expired > 0)
    log.log(`  Filtered ${expired} expired qualifications (lien_date_fin < ${today})`)
  log.log(`✓ Aggregated into ${byS.size} unique SIRET (skipped ${skipped} invalid rows)`)
  return { aggregated: byS, expired, skipped }
}

// ---------------------------------------------------------------------------
// 3. Match against providers.siret and UPDATE
// ---------------------------------------------------------------------------

/**
 * Payload row envoyé à la RPC `rge_bulk_update_providers` (migration 385).
 * Shape doit matcher `jsonb_to_recordset(payload) AS upd(...)` côté SQL.
 */
interface RgeBulkUpdateRow {
  id: string
  rge_qualifications: RgeQualification[]
  rge_valid_until: string
  rge_organismes: string[]
  rge_last_synced_at: string
  rge_source_url: string
}

export async function matchAndUpdate(
  aggregated: Map<string, AggregatedProvider>,
  supabase: SupabaseClient,
  dryRun: boolean,
  log: Pick<Console, 'log' | 'warn' | 'error'> = console
): Promise<{ matched: number; updated: number }> {
  log.log('→ Matching against providers.siret...')

  const sirets = Array.from(aggregated.keys())
  const SELECT_BATCH = 500
  const RPC_BATCH = 500
  let matched = 0
  let updated = 0
  const now = new Date().toISOString()

  for (let i = 0; i < sirets.length; i += SELECT_BATCH) {
    const chunk = sirets.slice(i, i + SELECT_BATCH)

    // Retry avec backoff sur timeout (57014) — charge Supabase variable
    type ProviderRow = { id: string; siret: string | null }
    let providers: ProviderRow[] | null = null
    let selErr: { code?: string; message?: string } | null = null
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await supabase.from('providers').select('id, siret').in('siret', chunk)
      providers = (res.data ?? null) as ProviderRow[] | null
      selErr = res.error as { code?: string; message?: string } | null
      if (!selErr) break
      if (selErr.code !== '57014') break // seulement retry sur timeout
      const wait = 1000 * Math.pow(2, attempt)
      log.warn(`  batch ${i}-${i + SELECT_BATCH}: timeout, retry ${attempt + 1}/4 dans ${wait}ms`)
      await sleep(wait)
    }

    if (selErr) {
      log.error(`  batch ${i}-${i + SELECT_BATCH}: SELECT failed (abandonné)`, selErr)
      continue
    }
    if (!providers || providers.length === 0) continue

    matched += providers.length

    if (dryRun) {
      log.log(`  [dry-run] would update ${providers.length} providers`)
      continue
    }

    // Construit le payload RPC — uniquement les providers pour lesquels on a des données.
    const payload: RgeBulkUpdateRow[] = []
    for (const p of providers) {
      if (!p.siret) continue
      const agg = aggregated.get(p.siret)
      if (!agg) continue
      payload.push({
        id: p.id,
        rge_qualifications: agg.qualifications,
        rge_valid_until: agg.valid_until,
        rge_organismes: agg.organismes,
        rge_last_synced_at: now,
        rge_source_url: agg.source_url,
      })
    }

    // Bulk UPDATE atomique via RPC (migration 385). Chaque appel = 1 transaction.
    // Si la RPC échoue, AUCUN provider du sous-batch n'est modifié — pas de mix
    // old-qualifs/new-last_synced_at possible (contrat atomicité).
    for (let j = 0; j < payload.length; j += RPC_BATCH) {
      const slice = payload.slice(j, j + RPC_BATCH)
      let rpcErr: { code?: string; message?: string } | null = null
      let updatedInBatch = 0
      for (let attempt = 0; attempt < 4; attempt++) {
        const { data, error } = await supabase.rpc('rge_bulk_update_providers', {
          payload: slice,
        })
        if (!error) {
          updatedInBatch = typeof data === 'number' ? data : 0
          rpcErr = null
          break
        }
        rpcErr = error as { code?: string; message?: string }
        if (rpcErr.code !== '57014') break
        const wait = 1000 * Math.pow(2, attempt)
        log.warn(`  rpc batch ${i}/${j}: timeout, retry ${attempt + 1}/4 dans ${wait}ms`)
        await sleep(wait)
      }
      if (rpcErr) {
        // Atomicité garantie par la RPC : rien n'a été écrit en DB pour ce sous-batch.
        // On skip proprement, surtout pas de `rge_last_synced_at = now` séparé.
        log.error(
          `  batch ${i}/${j}: RPC rge_bulk_update_providers failed — ${slice.length} providers unchanged`,
          rpcErr.message
        )
        continue
      }
      updated += updatedInBatch
      log.log(
        `  ✓ rpc batch ${i}/${j}: updated ${updatedInBatch}/${slice.length} providers atomically`
      )
    }
  }

  log.log(`✓ Matched ${matched} providers, updated ${updated}`)
  return { matched, updated }
}

// ---------------------------------------------------------------------------
// 4. Clear stale RGE on providers no longer in dataset
// ---------------------------------------------------------------------------

export async function clearStaleRge(
  currentSirets: Set<string>,
  supabase: SupabaseClient,
  dryRun: boolean,
  log: Pick<Console, 'log' | 'warn' | 'error'> = console,
  isPartialSync: boolean = false
): Promise<number> {
  // Garde-fou P0 : refuser de s'exécuter en mode sync partielle.
  // Sinon, currentSirets ne contient qu'une fraction du dataset et on effacerait
  // tous les providers hors de la fenêtre limitée (documenté dans memory/servicesartisans-rge-integration.md).
  if (isPartialSync) {
    throw new Error(
      'clearStaleRge() refuses to run in partial sync mode — would erase providers outside the limited window. Use --full-sync explicitly to override.'
    )
  }

  log.log('→ Clearing stale RGE on providers no longer in ADEME dataset...')

  const { data: stale, error } = await supabase
    .from('providers')
    .select('id, siret')
    .not('rge_valid_until', 'is', null)

  if (error || !stale) {
    log.error('  Failed to fetch stale:', error)
    return 0
  }

  const toClear = stale.filter((p) => !p.siret || !currentSirets.has(p.siret))
  if (toClear.length === 0) {
    log.log('  No stale RGE to clear')
    return 0
  }

  if (dryRun) {
    log.log(`  [dry-run] would clear ${toClear.length} stale RGE`)
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
    .in(
      'id',
      toClear.map((p) => p.id)
    )

  if (updErr) {
    log.error('  Clear failed:', updErr)
    return 0
  }

  log.log(`✓ Cleared ${toClear.length} stale RGE`)
  return toClear.length
}

// ---------------------------------------------------------------------------
// 5. Backfill communes.nb_artisans_rge (via RPC from migration 381)
// ---------------------------------------------------------------------------

export async function backfillCommunes(
  supabase: SupabaseClient,
  dryRun: boolean,
  log: Pick<Console, 'log' | 'warn' | 'error'> = console
): Promise<{ communesUpdated: number; totalRgeActifs: number }> {
  log.log('→ Backfilling communes.nb_artisans_rge via RPC...')

  if (dryRun) {
    log.log('  [dry-run] would call RPC rge_backfill_communes()')
    return { communesUpdated: 0, totalRgeActifs: 0 }
  }

  const { data, error } = await supabase.rpc('rge_backfill_communes').single()

  if (error) {
    log.error('  RPC rge_backfill_communes failed:', error.message)
    log.error('  → Vérifie que la migration 381 a été appliquée sur la DB.')
    return { communesUpdated: 0, totalRgeActifs: 0 }
  }

  const row = data as { communes_updated?: number; total_rge?: number } | null
  const result = {
    communesUpdated: row?.communes_updated ?? 0,
    totalRgeActifs: row?.total_rge ?? 0,
  }
  log.log(
    `✓ Backfilled ${result.communesUpdated} communes (total RGE actifs: ${result.totalRgeActifs})`
  )
  return result
}

// ---------------------------------------------------------------------------
// Orchestrator — top-level entry point
// ---------------------------------------------------------------------------

export async function syncRgeFromAdeme(
  supabase: SupabaseClient,
  options: RgeSyncOptions = {}
): Promise<RgeSyncResult> {
  const t0 = Date.now()
  const log = options.logger || console
  const dryRun = options.dryRun ?? false
  const skipBackfill = options.skipBackfill ?? false
  const limit = options.limit ?? Infinity
  // Une sync est partielle si `limit` est fini OU si le caller l'a explicitement déclaré.
  const isPartialSync = options.isPartialSync ?? Number.isFinite(limit)

  log.log('═══ syncRgeFromAdeme ═══')
  log.log(`Mode: ${dryRun ? 'DRY-RUN' : 'WRITE'}`)
  log.log(`Limit: ${limit === Infinity ? 'none' : limit}`)
  log.log(
    `Partial sync: ${isPartialSync ? 'YES (clearStaleRge will be skipped)' : 'no (full sync)'}`
  )
  log.log('')

  const rows = await fetchAllAdemeRows(limit, log)
  const { aggregated, expired, skipped } = aggregateBySiret(rows, log)
  const { matched, updated } = await matchAndUpdate(aggregated, supabase, dryRun, log)

  let cleared = 0
  if (isPartialSync) {
    log.warn(
      '⚠ Partial sync detected — skipping clearStaleRge() to avoid erasing providers outside the limited window.'
    )
    log.warn(
      '  To run a full sync (with stale cleanup), omit `limit` or pass `isPartialSync: false` explicitly.'
    )
  } else if (rows.length < ADEME_MIN_ROWS_FOR_CLEAR) {
    // Garde-fou P0 : dataset ADEME anormalement petit — refuser le clear.
    // Scénario cauchemar : ADEME renvoie 0 ou très peu de lignes (API down, schéma modifié,
    // rate-limit silencieux, coupure réseau à mi-pagination). Si on clearStaleRge ici on efface
    // TOUS les providers RGE actuels. Le sync doit planter proprement, PAS effacer les données.
    log.error(
      `✗ ADEME dataset anormalement petit (${rows.length} lignes < seuil ${ADEME_MIN_ROWS_FOR_CLEAR}).`
    )
    log.error('  Refus de lancer clearStaleRge() pour protéger les données existantes.')
    log.error(
      '  Causes probables : ADEME API partiellement down, schéma modifié, rate-limit, coupure réseau.'
    )
    log.error("  Les UPDATEs déjà appliqués sont conservés ; aucun provider n'est effacé.")
    throw new Error(
      `ADEME returned only ${rows.length} rows (< ${ADEME_MIN_ROWS_FOR_CLEAR} threshold) — ` +
        `refusing to run clearStaleRge to protect existing providers. Check ADEME API health.`
    )
  } else {
    cleared = await clearStaleRge(new Set(aggregated.keys()), supabase, dryRun, log, false)
  }

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
