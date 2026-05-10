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
import { tryAcquireLock, releaseLock } from '@/lib/cache/redis-client'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ADEME_BASE =
  'https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2/lines'
const ADEME_PAGE_SIZE = 10_000
const ADEME_USER_AGENT = 'servicesartisans-rge-sync/1.0 (contact@servicesartisans.fr)'

/**
 * Garde-fou P0 (TS-side) : seuil minimal de lignes ADEME en dessous duquel on
 * refuse tout swap avec clear. Le dataset complet fait ~165k lignes. Si on en
 * récupère < 50k, c'est un signal d'alerte (API partiellement down, changement
 * de schéma, rate-limit silencieux, coupure réseau à mi-pagination) et
 * effacer les providers actuels serait catastrophique. La RPC
 * `rge_apply_staging_atomic` a son propre garde-fou côté DB (défense en profondeur).
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

/**
 * Note : `providers.rge_categories_decret` est recalculé automatiquement par la
 * RPC atomique (`rge_apply_staging_atomic`, migration 413) via
 * `derive_rge_categories_from_qualif` (migration 404). La source unique est
 * Postgres — la colonne est dérivée inline depuis `rge_qualifications` côté SQL.
 */

export interface AggregatedProvider {
  siret: string
  qualifications: RgeQualification[]
  valid_until: string
  organismes: string[]
  source_url: string
  /** Téléphone déclaré par l'artisan dans le registre ADEME (première valeur non-vide trouvée) */
  telephone: string | null
  /** Email déclaré par l'artisan dans le registre ADEME (première valeur non-vide trouvée) */
  email: string | null
}

export interface RgeSyncOptions {
  /** Si true, aucun UPDATE n'est effectué (log seulement). Default: false */
  dryRun?: boolean
  /** Nombre max de lignes ADEME à récupérer. Default: Infinity */
  limit?: number
  /** Si true, saute le backfill de communes.nb_artisans_rge. Default: false */
  skipBackfill?: boolean
  /**
   * Si true, déclare explicitement une sync partielle — le clear des providers
   * stale sera skippé (allow_clear_stale=false) pour éviter d'effacer des
   * providers hors de la fenêtre limitée. Auto-activé si `limit` est défini
   * et `< Infinity`. Default: false
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
  contactsEnriched: number
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

/**
 * Strips characters PostgreSQL rejects inside a JSONB value.
 *
 * PostgreSQL's JSONB type forbids U+0000 (null byte) — unlike the JSON spec —
 * and rejects unpaired UTF-16 surrogates. When such a char sneaks into the
 * payload of `rge_stage_rows(payload jsonb)`, the INSERT fails with
 * `22P05 unsupported Unicode escape sequence` and the whole batch is aborted.
 *
 * Observed in production 2026-04 on the full ADEME dataset (~88k SIRET): one
 * row ~offset 54000 carries a stray control char in `nom_qualification` or
 * `url_qualification`, killing the sync at 88%.
 *
 * This helper removes:
 *  - U+0000 (null byte) — forbidden in JSONB
 *  - Other C0 control chars (0x01-0x08, 0x0B, 0x0C, 0x0E-0x1F) — unsafe in JSON strings
 *  - Lone surrogates (U+D800-U+DFFF not part of a valid pair) — invalid UTF-8
 * Preserves \t (0x09), \n (0x0A), \r (0x0D) which are legal in JSON.
 */
function stripJsonbUnsafe(raw: string): string {
  if (!raw) return raw
  // eslint-disable-next-line no-control-regex -- intentional: strip control chars that break JSONB
  let out = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
  // Remove any UTF-16 surrogate that is not part of a valid pair.
  out = out.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
  return out
}

function sanitizeJsonbString(raw: string | null | undefined): string | null {
  if (raw == null) return null
  const cleaned = stripJsonbUnsafe(String(raw))
  return cleaned.length > 0 ? cleaned : null
}

/**
 * Normalise un numéro de téléphone français brut ADEME → format E.164-ish (0XXXXXXXXX).
 * Retourne null si le résultat ne fait pas 10 chiffres.
 */
function normalizePhone(raw: string | undefined | null): string | null {
  if (!raw) return null
  const cleaned = raw.replace(/[\s.\-/()]+/g, '').trim()
  if (cleaned.startsWith('+33') && cleaned.length >= 12) {
    return '0' + cleaned.slice(3).replace(/\D/g, '')
  }
  const digits = cleaned.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('0')) return digits
  return null
}

function normalizeEmail(raw: string | undefined | null): string | null {
  if (!raw) return null
  // Strip JSONB-hostile chars (null bytes, lone surrogates, C0 controls) BEFORE
  // any other processing. Required since `ademe_email` est sérialisé tel quel
  // dans le payload `rge_stage_rows(payload jsonb)` — un U+0000 dans un email
  // ADEME tue tout le batch (Postgres erreur 22P05). Observé prod 2026-04
  // (cron mort depuis 2026-04-13, batch offset 50000-52000).
  const cleaned = stripJsonbUnsafe(String(raw)).trim().toLowerCase()
  if (!cleaned || !cleaned.includes('@') || !cleaned.includes('.')) return null
  return cleaned
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

    // Strip JSONB-hostile chars (null bytes, lone surrogates, C0 controls) from
    // every string field that will end up inside the JSONB payload sent to
    // rge_stage_rows(). Required since PostgreSQL JSONB rejects \u0000 —
    // ADEME dataset has been observed to carry stray control chars (2026-04).
    const qualCode = sanitizeJsonbString(row.code_qualification)
    const qualNom = sanitizeJsonbString(row.nom_qualification)
    const qualOrganisme = sanitizeJsonbString(row.organisme)
    if (!qualCode || !qualNom || !qualOrganisme) {
      skipped++
      continue
    }

    const qual: RgeQualification = {
      code: qualCode,
      nom: qualNom,
      organisme: qualOrganisme,
      domaine: sanitizeJsonbString(row.domaine),
      meta_domaine: sanitizeJsonbString(row.meta_domaine),
      date_debut: dateDebutRaw.slice(0, 10),
      date_fin: dateFin,
      url: sanitizeJsonbString(row.url_qualification),
    }

    const phone = normalizePhone(row.telephone)
    const email = normalizeEmail(row.email)

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
      // Garde le premier tel/email non-null trouvé pour ce SIRET
      if (!existing.telephone && phone) existing.telephone = phone
      if (!existing.email && email) existing.email = email
    } else {
      byS.set(siret, {
        siret,
        qualifications: [qual],
        valid_until: qual.date_fin,
        organismes: [qual.organisme],
        source_url: `https://france-renov.gouv.fr/annuaire-rge?siret=${siret}`,
        telephone: phone,
        email,
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
// 3. Stage aggregated rows + atomic swap (migration 413)
// ---------------------------------------------------------------------------

/**
 * Shape d'une ligne envoyée à `rge_stage_rows(payload)`. Doit correspondre à
 * `jsonb_to_recordset(payload) AS s(...)` côté SQL (migration 413).
 */
interface StagingRow {
  siret: string
  rge_qualifications: RgeQualification[]
  rge_valid_until: string
  rge_organismes: string[]
  rge_source_url: string
  ademe_telephone: string | null
  ademe_email: string | null
}

const STAGE_BATCH = 2_000

/**
 * Charge les lignes aggregées dans `rge_sync_staging` par batches. Non-atomique
 * avec la table providers — aucun risque tant que le swap n'a pas été appelé.
 * TRUNCATE préalable pour garantir qu'aucune ligne orpheline d'un run précédent
 * ne traine dans staging.
 */
export async function stageAggregated(
  aggregated: Map<string, AggregatedProvider>,
  supabase: SupabaseClient,
  dryRun: boolean,
  log: Pick<Console, 'log' | 'warn' | 'error'> = console
): Promise<{ staged: number }> {
  log.log(`→ Staging ${aggregated.size} SIRET into rge_sync_staging...`)

  if (dryRun) {
    log.log(`  [dry-run] would truncate + stage ${aggregated.size} rows`)
    return { staged: 0 }
  }

  const { error: truncErr } = await supabase.rpc('rge_truncate_staging')
  if (truncErr) {
    throw new Error(`rge_truncate_staging failed: ${truncErr.message}`)
  }

  const rows: StagingRow[] = []
  aggregated.forEach((agg) => {
    rows.push({
      siret: agg.siret,
      rge_qualifications: agg.qualifications,
      rge_valid_until: agg.valid_until,
      rge_organismes: agg.organismes,
      rge_source_url: agg.source_url,
      ademe_telephone: agg.telephone,
      ademe_email: agg.email,
    })
  })

  let staged = 0
  for (let i = 0; i < rows.length; i += STAGE_BATCH) {
    const slice = rows.slice(i, i + STAGE_BATCH)

    let lastErr: { code?: string; message?: string } | null = null
    for (let attempt = 0; attempt < 4; attempt++) {
      const { data, error } = await supabase.rpc('rge_stage_rows', { payload: slice })
      if (!error) {
        staged += typeof data === 'number' ? data : slice.length
        lastErr = null
        break
      }
      lastErr = error as { code?: string; message?: string }
      if (lastErr.code !== '57014') break
      const wait = 1000 * Math.pow(2, attempt)
      log.warn(`  stage batch ${i}: timeout, retry ${attempt + 1}/4 dans ${wait}ms`)
      await sleep(wait)
    }

    if (lastErr) {
      throw new Error(
        `rge_stage_rows failed at batch offset ${i} (${slice.length} rows): ${lastErr.message}`
      )
    }

    log.log(`  ✓ staged ${Math.min(i + STAGE_BATCH, rows.length)}/${rows.length}`)
  }

  log.log(`✓ Staged ${staged} rows into rge_sync_staging`)
  return { staged }
}

interface AtomicApplyResult {
  staging_rows: number
  providers_matched: number
  providers_updated: number
  contacts_enriched: number
  stale_cleared: number
}

/**
 * Applique staging → providers en UNE seule transaction côté Postgres via
 * `rge_apply_staging_atomic()`. Remplace l'ancien couple
 * `matchAndUpdate()` (batches de 500) + `clearStaleRge()` (phase séparée)
 * qui laissait une fenêtre de mixed state inacceptable en prod.
 */
export async function applyStagingAtomic(
  supabase: SupabaseClient,
  options: {
    lastSyncedAt: string
    allowClearStale: boolean
    minStagingRows: number
    dryRun: boolean
    log: Pick<Console, 'log' | 'warn' | 'error'>
  }
): Promise<AtomicApplyResult> {
  const { lastSyncedAt, allowClearStale, minStagingRows, dryRun, log } = options
  log.log(
    `→ Applying staging atomically (clear_stale=${allowClearStale}, min_staging=${minStagingRows})...`
  )

  if (dryRun) {
    log.log('  [dry-run] would call rge_apply_staging_atomic()')
    return {
      staging_rows: 0,
      providers_matched: 0,
      providers_updated: 0,
      contacts_enriched: 0,
      stale_cleared: 0,
    }
  }

  const { data, error } = await supabase
    .rpc('rge_apply_staging_atomic', {
      p_last_synced_at: lastSyncedAt,
      p_allow_clear_stale: allowClearStale,
      p_min_staging_rows: minStagingRows,
    })
    .single()

  if (error) {
    throw new Error(`rge_apply_staging_atomic failed: ${error.message}`)
  }

  const result = data as AtomicApplyResult
  log.log(
    `✓ Atomic swap applied: matched=${result.providers_matched}, updated=${result.providers_updated}, contacts=${result.contacts_enriched}, cleared=${result.stale_cleared}`
  )
  return result
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
  log.log(`Partial sync: ${isPartialSync ? 'YES (stale clear will be skipped)' : 'no (full sync)'}`)
  log.log('')

  // Garde-fou P0 : verrou distribué Redis — empêche deux syncs concurrentes.
  // Scénario cauchemar : cron hebdo déclenché pendant qu'un sync manuel tourne
  // → double stage/swap, double backfill, locks PostgreSQL qui s'accumulent.
  // TTL 1h = durée max estimée + marge.
  // Dry-run ne pose pas de verrou (lecture seule).
  const LOCK_KEY = 'rge:sync'
  const LOCK_TTL_SECONDS = 3_600
  let lockToken: string | null = null
  if (!dryRun) {
    lockToken = await tryAcquireLock(LOCK_KEY, LOCK_TTL_SECONDS)
    if (!lockToken) {
      throw new Error(
        'syncRgeFromAdeme: verrou Redis `sa:lock:rge:sync` déjà détenu. ' +
          'Un autre sync est en cours (cron + manuel ?). Réessayer plus tard ou ' +
          'libérer le verrou manuellement si un sync a crashé : DEL sa:lock:rge:sync.'
      )
    }
    log.log(`✓ Verrou Redis acquis (TTL ${LOCK_TTL_SECONDS}s)`)
  }

  try {
    const rows = await fetchAllAdemeRows(limit, log)
    const { aggregated, expired, skipped } = aggregateBySiret(rows, log)

    // Garde-fou P0 (côté TS) : dataset ADEME anormalement petit — refuser tout
    // swap avec clear. Redondant avec le check SQL (rge_apply_staging_atomic
    // a son propre threshold) mais permet de planter AVANT de staging ~60k
    // rows inutilement.
    if (!isPartialSync && rows.length < ADEME_MIN_ROWS_FOR_CLEAR) {
      log.error(
        `✗ ADEME dataset anormalement petit (${rows.length} lignes < seuil ${ADEME_MIN_ROWS_FOR_CLEAR}).`
      )
      log.error('  Refus de lancer le swap atomique pour protéger les données existantes.')
      log.error(
        '  Causes probables : ADEME API partiellement down, schéma modifié, rate-limit, coupure réseau.'
      )
      log.error("  Aucun provider n'a été modifié à ce stade.")
      throw new Error(
        `ADEME returned only ${rows.length} rows (< ${ADEME_MIN_ROWS_FOR_CLEAR} threshold) — ` +
          `refusing to apply staging swap to protect existing providers. Check ADEME API health.`
      )
    }

    if (isPartialSync) {
      log.warn(
        '⚠ Partial sync detected — staging will be applied with clear_stale=false (no provider nulled out).'
      )
      log.warn(
        '  To run a full sync (with stale cleanup), omit `limit` or pass `isPartialSync: false` explicitly.'
      )
    }

    await stageAggregated(aggregated, supabase, dryRun, log)

    // Threshold côté SQL : on attend au minimum la moitié du dataset unique
    // habituel (~60k SIRET) pour autoriser le clear. En dessous, la RPC
    // refuse atomiquement. Honoré par la RPC uniquement si allow_clear_stale=true.
    const MIN_STAGING_ROWS_FOR_CLEAR = 30_000
    const applyResult = await applyStagingAtomic(supabase, {
      lastSyncedAt: new Date().toISOString(),
      allowClearStale: !isPartialSync,
      minStagingRows: MIN_STAGING_ROWS_FOR_CLEAR,
      dryRun,
      log,
    })

    const matched = applyResult.providers_matched
    const updated = applyResult.providers_updated
    const contactsEnriched = applyResult.contacts_enriched
    const cleared = applyResult.stale_cleared

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
      contactsEnriched,
      staleCleared: cleared,
      communesUpdated,
      totalRgeActifs,
      durationSeconds: Math.round((Date.now() - t0) / 1000),
    }
  } finally {
    if (lockToken) {
      await releaseLock(LOCK_KEY, lockToken)
      log.log('✓ Verrou Redis libéré')
    }
  }
}
