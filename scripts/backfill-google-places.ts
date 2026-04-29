/**
 * Backfill Google Places — enrichit public.providers (49K fiches RGE/non-RGE)
 * avec rating + place_id + user_ratings_total + business_status via SIRET match.
 *
 * Plan v2 ULTRA DOMINATION SEO synthèse 10-agents 2026-04-28 #5.
 *
 * Safety :
 *   - Dry-run par défaut ; passer --apply pour écrire en DB.
 *   - Throttle inter-call (--throttle=ms, default 200ms — Places autorise 100 QPM).
 *   - --limit pour tester sur petit échantillon avant scale.
 *   - --status=pending|api_error pour cibler les retry vs cold start.
 *   - Idempotent : un provider sync_status='matched' n'est pas re-querié sauf
 *     si --force ou si google_synced_at < 90 jours (re-sync incrémental).
 *
 * Coût : ~0.017 € par Find Place call → 49K × 0.017 ≈ 833 € pour cold start
 * complet. Avec ratio match attendu ~70-80% : 833 € one-shot, puis re-sync
 * incrémental mensuel ~70 € (10K stale).
 */

import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'
import { findPlaceBySiret } from '@/lib/google/places-client'

const APPLY = process.argv.includes('--apply')
const FORCE = process.argv.includes('--force')
const LIMIT = Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? 50)
const THROTTLE_MS = Number(
  process.argv.find((a) => a.startsWith('--throttle='))?.split('=')[1] ?? 200
)
const STATUS_FILTER =
  (process.argv.find((a) => a.startsWith('--status='))?.split('=')[1] as string | undefined) ??
  'pending'
const STALE_DAYS = 90

type ProviderRow = {
  id: string
  name: string
  siret: string | null
  address_postal_code: string | null
  google_synced_at: string | null
  google_sync_status: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.error('[backfill-google-places] GOOGLE_PLACES_API_KEY missing in env')
    process.exit(1)
  }

  const supabase = createAdminClient()
  const staleCutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString()

  console.log(
    `[backfill-google-places] mode=${APPLY ? 'APPLY' : 'DRY-RUN'} status=${STATUS_FILTER} ` +
      `limit=${LIMIT} throttle=${THROTTLE_MS}ms force=${FORCE} stale_cutoff=${staleCutoff}`
  )

  // Query : providers avec SIRET valide, sync_status filtré, ordre stable.
  let query = supabase
    .from('providers')
    .select('id, name, siret, address_postal_code, google_synced_at, google_sync_status')
    .not('siret', 'is', null)
    .neq('siret', '')
    .order('id', { ascending: true })
    .limit(LIMIT)

  if (!FORCE) {
    if (STATUS_FILTER === 'pending') {
      query = query.eq('google_sync_status', 'pending')
    } else if (STATUS_FILTER === 'api_error') {
      query = query.eq('google_sync_status', 'api_error')
    } else if (STATUS_FILTER === 'stale') {
      // Stale = matched OU api_error avec synced_at >= 90j. Le code-reviewer
      // a flaggé que les api_error transitoires ne se ré-essaient pas via
      // ce mode (P2 — 2026-04-29). Le filtre `.in()` couvre les deux à la fois.
      query = query
        .in('google_sync_status', ['matched', 'api_error'])
        .lt('google_synced_at', staleCutoff)
    }
  }

  const { data: providers, error } = await query
  if (error) {
    console.error('[backfill-google-places] query failed:', error)
    process.exit(1)
  }
  if (!providers?.length) {
    console.log('[backfill-google-places] no providers to process.')
    return
  }

  console.log(`[backfill-google-places] ${providers.length} providers in batch.`)

  const stats: Record<string, number> = {
    matched: 0,
    no_match: 0,
    api_error: 0,
    skipped: 0,
    collision: 0,
  }

  for (const p of providers as ProviderRow[]) {
    if (!p.siret || !/^\d{14}$/.test(p.siret)) {
      stats.skipped += 1
      console.log(`  SKIP ${p.id} ${p.name} — invalid SIRET ${p.siret}`)
      if (APPLY) {
        await supabase
          .from('providers')
          .update({ google_sync_status: 'skipped', google_synced_at: new Date().toISOString() })
          .eq('id', p.id)
      }
      continue
    }

    const result = await findPlaceBySiret(
      { siret: p.siret, companyName: p.name, postalCode: p.address_postal_code },
      { apiKey }
    )

    stats[result.status] = (stats[result.status] ?? 0) + 1

    const logLine = `  ${result.status.toUpperCase()} ${p.id} ${p.name.slice(0, 40)}`
    if (result.status === 'matched') {
      console.log(
        `${logLine} → place_id=${result.placeId?.slice(0, 24)}… rating=${result.rating} ` +
          `total=${result.userRatingsTotal} biz=${result.businessStatus}`
      )
    } else if (result.status === 'api_error') {
      console.warn(`${logLine} → ${result.errorReason}`)
    } else {
      console.log(logLine)
    }

    if (APPLY) {
      const update: Record<string, unknown> = {
        google_sync_status: result.status,
        google_synced_at: new Date().toISOString(),
      }
      if (result.status === 'matched') {
        // Validation format place_id avant write (audit security 2026-04-29 LOW).
        // Format Places attendu : alphanumeric + `_` + `-`, longueur 4-300.
        // Mêmes contraintes que le CHECK SQL providers_google_place_id_format,
        // mais on valide en amont pour ne pas perdre la metadata (status,
        // synced_at) en cas de refus du CHECK.
        const placeId = result.placeId
        if (placeId && /^[A-Za-z0-9_\-]+$/.test(placeId) && placeId.length <= 300) {
          update.google_place_id = placeId
          update.google_rating = result.rating
          update.google_user_ratings_total = result.userRatingsTotal
          update.google_business_status = result.businessStatus
        } else {
          console.warn(`    ⚠ place_id format invalid for ${p.id}, skipping enrichment fields`)
          update.google_sync_status = 'api_error'
        }
      }
      const { error: upErr } = await supabase.from('providers').update(update).eq('id', p.id)
      if (upErr) {
        // Code 23505 = unique-index violation sur google_place_id : un autre
        // provider porte déjà ce place_id (homonymie SIRET → audit manuel).
        // On ré-écrit avec sync_status='collision' pour sortir le row du
        // pool 'pending' (sinon il sera retenté indéfiniment — audit
        // security 2026-04-29 INFO).
        if (upErr.code === '23505') {
          stats.collision = (stats.collision ?? 0) + 1
          console.warn(`    ⚠ collision 23505 for ${p.id} (place_id duplicate)`)
          // Audit security 2026-04-29 — guard sur l'UPDATE de fallback :
          // si le second update échoue (RLS, timeout, etc.) le row reste
          // en 'pending' et serait retenté indéfiniment. On loggue
          // explicitement pour visibilité opérationnelle.
          const { error: collisionErr } = await supabase
            .from('providers')
            .update({
              google_sync_status: 'collision',
              google_synced_at: new Date().toISOString(),
            })
            .eq('id', p.id)
          if (collisionErr) {
            console.warn(`    ⚠ collision-status update failed for ${p.id}:`, collisionErr.message)
          }
        } else {
          console.warn(`    ⚠ update failed for ${p.id}:`, upErr.message)
        }
      }
    }

    if (THROTTLE_MS > 0) await sleep(THROTTLE_MS)
  }

  console.log(`[backfill-google-places] done. stats=${JSON.stringify(stats)}`)
}

main().catch((err) => {
  console.error('[backfill-google-places] fatal:', err)
  process.exit(1)
})
