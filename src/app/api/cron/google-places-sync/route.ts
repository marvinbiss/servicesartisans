import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as Sentry from '@sentry/nextjs'
import { findPlaceBySiret } from '@/lib/google/places-client'
import { logger } from '@/lib/logger'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

/**
 * Hebdomadaire — sync incrémental Google Places pour combler le gap
 * aggregateRating sur ~44 560 fiches RGE (97.56% sans rating, audit
 * 2026-05-22). Driver runtime du script `scripts/backfill-google-places.ts`
 * en mode petit-batch automatisé.
 *
 * Stratégie :
 *   1. Priorise `google_sync_status='pending'` AVEC qualif RGE active
 *      (impact SERP maximal : ces fiches sont indexées sans étoiles).
 *   2. Fallback pending sans RGE quand le pool RGE est vide.
 *   3. Cible BATCH_SIZE providers par run (50 par défaut, ~50 calls Places
 *      ~= 0.85€/run, ~3.40€/mois, 4 runs/mois pour Cycle complet sur 49K
 *      ~= 980 runs ~= 19 ans → mais avec backfill manuel d'amorçage via
 *      `scripts/backfill-google-places.ts --apply --limit=5000` une fois
 *      la clé fournie, le cron sert au refresh + au pickup des nouveaux
 *      providers RGE chaque semaine).
 *
 * Fail-loud :
 *   - GOOGLE_PLACES_API_KEY manquant → 500 + Sentry warning (jamais run
 *     silencieusement sans clé)
 *   - CRON_SECRET manquant → 500 (config invalide)
 *   - Tout 4xx/5xx Places → comptabilisé en `api_error` côté DB, jamais
 *     stoppe le batch
 *
 * Coût Marvin :
 *   Places Text Search = 0.017€/call → 50 calls × 4 runs/mois ≈ 3.40€/mois
 *   en régime stationnaire. Cold start manuel (49K) ≈ 833€ one-shot.
 *
 * Schedule  : `0 3 * * 1` (lundi 03:00 UTC — heure creuse Google)
 * maxDuration : 60s (limit Vercel Pro standard) — 50 calls × 300ms throttle
 *               ~= 15s + 50 UPDATE Supabase ~= 25s total, marge 2.4×.
 */

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const BATCH_SIZE = 50
const THROTTLE_MS = 300
const STALE_DAYS = 90

// SLA-99.9 : cap dur par run (alias explicite de BATCH_SIZE) + lease anti-double-run.
const MAX_PROVIDERS_PER_RUN = BATCH_SIZE
const LEASE_NAME = 'cron_google_places_sync'
const LEASE_TTL_SECONDS = 15 * 60

type ProviderRow = {
  id: string
  name: string
  siret: string | null
  address_postal_code: string | null
  google_synced_at: string | null
  google_sync_status: string | null
  rge_valid_until: string | null
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const GET = withCronCheckIn(
  'cron-google-places-sync',
  async (request: Request): Promise<Response> => {
    if (!process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Serveur mal configuré : CRON_SECRET manquant' },
        { status: 500 }
      )
    }
    const authHeader = request.headers.get('authorization')
    if (!verifyCronSecret(authHeader)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      // Fail-loud : on remonte Sentry pour que Marvin soit alerté, mais on
      // renvoie 503 (Service Unavailable) plutôt que 500. Sémantiquement
      // c'est : "la fonctionnalité existe mais elle dépend d'une dépendance
      // externe non provisionnée" — différent d'un bug serveur.
      Sentry.captureMessage('GOOGLE_PLACES_API_KEY missing — cron disabled', {
        level: 'warning',
        tags: { cron: 'google-places-sync' },
      })
      logger.error('[google-places-sync] GOOGLE_PLACES_API_KEY missing — skipping run')
      return NextResponse.json(
        {
          success: false,
          error: 'GOOGLE_PLACES_API_KEY missing',
          hint: 'Set GOOGLE_PLACES_API_KEY in Vercel env (Places API New, billing enabled)',
        },
        { status: 503 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Variables Supabase manquantes' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const startedAt = Date.now()

    // SLA-99.9 : lease avec abort 5s.
    const leaseController = new AbortController()
    const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
    let acquired: boolean | null = null
    let leaseErr: { message: string } | null = null
    try {
      const leaseResult = await supabase
        .rpc('acquire_cron_lease', {
          p_name: LEASE_NAME,
          p_ttl_seconds: LEASE_TTL_SECONDS,
        })
        .abortSignal(leaseController.signal)
      acquired = leaseResult.data as boolean | null
      leaseErr = leaseResult.error
    } catch (err) {
      leaseErr = { message: err instanceof Error ? err.message : String(err) }
    } finally {
      clearTimeout(leaseTimer)
    }

    if (leaseErr) {
      logger.error('[google-places-sync] lease error', leaseErr.message)
      return NextResponse.json({ success: false, error: 'lease_error' }, { status: 500 })
    }
    if (acquired !== true) {
      logger.info('[google-places-sync] skipped (lease already held)')
      return NextResponse.json({ success: true, skipped: true, reason: 'already_running' })
    }

    Sentry.addBreadcrumb({
      category: 'cron',
      level: 'info',
      message: 'google-places-sync start',
    })

    try {
      // Pool prioritaire : pending + qualif RGE active. Ces fiches sont
      // indexées dans Google SERP et leur absence d'étoiles tue le CTR.
      const nowIso = new Date().toISOString()
      const { data: priorityBatch, error: pErr } = await supabase
        .from('providers')
        .select(
          'id, name, siret, address_postal_code, google_synced_at, google_sync_status, rge_valid_until'
        )
        .eq('google_sync_status', 'pending')
        .not('siret', 'is', null)
        .neq('siret', '')
        .gt('rge_valid_until', nowIso)
        .order('id', { ascending: true })
        .limit(MAX_PROVIDERS_PER_RUN)

      if (pErr) {
        throw new Error(`select priority batch failed: ${pErr.message}`)
      }

      // Fallback : si pool RGE vide, on prend les pending sans RGE
      // (non-prio mais ne laisse pas le batch tourner à vide).
      let batch: ProviderRow[] = (priorityBatch ?? []) as ProviderRow[]
      const ranOutOfRge = batch.length === 0
      if (batch.length === 0) {
        const { data: fallbackBatch, error: fErr } = await supabase
          .from('providers')
          .select(
            'id, name, siret, address_postal_code, google_synced_at, google_sync_status, rge_valid_until'
          )
          .eq('google_sync_status', 'pending')
          .not('siret', 'is', null)
          .neq('siret', '')
          .order('id', { ascending: true })
          .limit(MAX_PROVIDERS_PER_RUN)
        if (fErr) throw new Error(`select fallback batch failed: ${fErr.message}`)
        batch = (fallbackBatch ?? []) as ProviderRow[]
      }

      // Si toujours rien : refresh `matched` stale (>90j) — re-sync rating
      // qui peut avoir bougé côté Google. Ne run que si on n'a rien d'autre
      // (budget conservé pour les pending d'abord).
      const ranOutOfPending = batch.length === 0
      if (batch.length === 0) {
        const staleCutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString()
        const { data: staleBatch, error: sErr } = await supabase
          .from('providers')
          .select(
            'id, name, siret, address_postal_code, google_synced_at, google_sync_status, rge_valid_until'
          )
          .eq('google_sync_status', 'matched')
          .lt('google_synced_at', staleCutoff)
          .not('siret', 'is', null)
          .neq('siret', '')
          .order('google_synced_at', { ascending: true })
          .limit(MAX_PROVIDERS_PER_RUN)
        if (sErr) throw new Error(`select stale batch failed: ${sErr.message}`)
        batch = (staleBatch ?? []) as ProviderRow[]
      }

      if (batch.length === 0) {
        logger.info('[google-places-sync] nothing to process — all providers synced')
        await pingHeartbeat('google-places-sync')
        return NextResponse.json({
          success: true,
          processed: 0,
          poolDrained: true,
          timestamp: new Date().toISOString(),
        })
      }

      const stats: Record<string, number> = {
        matched: 0,
        no_match: 0,
        api_error: 0,
        skipped: 0,
        collision: 0,
      }

      for (const p of batch) {
        if (!p.siret || !/^\d{14}$/.test(p.siret)) {
          stats.skipped += 1
          await supabase
            .from('providers')
            .update({
              google_sync_status: 'skipped',
              google_synced_at: new Date().toISOString(),
            })
            .eq('id', p.id)
          continue
        }

        const result = await findPlaceBySiret(
          { siret: p.siret, companyName: p.name, postalCode: p.address_postal_code },
          { apiKey }
        )
        stats[result.status] = (stats[result.status] ?? 0) + 1

        const update: Record<string, unknown> = {
          google_sync_status: result.status,
          google_synced_at: new Date().toISOString(),
        }
        if (result.status === 'matched') {
          const placeId = result.placeId
          // Validation format place_id (cf. CHECK SQL providers_google_place_id_format)
          if (placeId && /^[A-Za-z0-9_-]+$/.test(placeId) && placeId.length <= 300) {
            update.google_place_id = placeId
            update.google_rating = result.rating
            update.google_user_ratings_total = result.userRatingsTotal
            update.google_business_status = result.businessStatus
          } else {
            update.google_sync_status = 'api_error'
          }
        }

        const { error: upErr } = await supabase.from('providers').update(update).eq('id', p.id)
        if (upErr) {
          // 23505 = duplicate place_id (homonymie SIRET) — flag collision
          // pour sortir le row du pool 'pending' (audit security 04-29).
          if (upErr.code === '23505') {
            stats.collision = (stats.collision ?? 0) + 1
            const { error: collisionErr } = await supabase
              .from('providers')
              .update({
                google_sync_status: 'collision',
                google_synced_at: new Date().toISOString(),
              })
              .eq('id', p.id)
            if (collisionErr) {
              // Re-update failed : row reste 'pending' — stat collision_unflagged
              // pour visibilité Sentry (row sera retraité au prochain run).
              stats.collision_unflagged = (stats.collision_unflagged ?? 0) + 1
              logger.warn(
                `[google-places-sync] collision flag failed for ${p.id}: ${collisionErr.message}`
              )
            }
          } else {
            logger.warn(`[google-places-sync] update failed for ${p.id}: ${upErr.message}`)
          }
        }

        if (THROTTLE_MS > 0) await sleep(THROTTLE_MS)
      }

      const durationMs = Date.now() - startedAt
      logger.info('[google-places-sync] done', {
        action: 'google-places-sync',
        batchSize: batch.length,
        stats,
        durationMs,
        ranOutOfRge,
        ranOutOfPending,
      })

      Sentry.captureMessage('google-places-sync completed', {
        level: 'info',
        tags: { cron: 'google-places-sync' },
        extra: { batchSize: batch.length, stats, durationMs, ranOutOfRge, ranOutOfPending },
      })

      await pingHeartbeat('google-places-sync')
      return NextResponse.json({
        success: true,
        processed: batch.length,
        stats,
        durationMs,
        ranOutOfRge,
        ranOutOfPending,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      logger.error('[google-places-sync] cron failed', err)
      Sentry.captureException(err, {
        tags: { cron: 'google-places-sync' },
        extra: { message },
      })
      return NextResponse.json({ success: false, error: message }, { status: 500 })
    } finally {
      // SLA-99.9 : release best-effort.
      try {
        await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
      } catch {
        // swallowed : TTL acts as safety net
      }
    }
  }
)
