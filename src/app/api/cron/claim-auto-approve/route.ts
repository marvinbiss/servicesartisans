/**
 * Cron : auto-approve des claims pending qui satisfont les 4 conditions strictes
 * de la politique S3.0b validée Marvin 2026-05-04.
 *
 * @sprint-4-vague-4
 * @ahrefs-rationale tmp/ahrefs/audit-vague4-2026-05-04.md
 *   Bottleneck supply identifié : claim_rate 0.002% (19 / 970K). Auto-approve
 *   débloque le funnel pour les artisans RGE qui ont rempli le formulaire et
 *   confirmé leur email — sans attendre revue admin manuelle (24-72h).
 * @snapshot 2026-05-04
 *
 * Politique (4 conditions OBLIGATOIRES, AND) :
 *   1. claim.status = 'pending'
 *   2. claim.email_confirmed_at IS NOT NULL          → email pro vérifié
 *   3. provider.user_id IS NULL                       → fiche pas déjà claimée
 *   4. provider.rge_valid_until > now()               → RGE actif (ADEME)
 *
 * SIRET match (5e condition implicite) : déjà OK car createClaim n'insère
 * un claim que si le SIRET fourni matche providers.siret. Pas besoin de
 * re-checker côté cron (cf. src/lib/services/claims-service.ts:112).
 *
 * Cadence : Vercel Cron 1h (`0 * * * *`). Batch BATCH_SIZE = 50 par run pour
 * laisser de la marge à approveClaim qui crée potentiellement un compte auth
 * + envoie un email Resend par claim (~2-4s/claim côté chaud).
 *
 * Audit trail : chaque tentative (approuvée OU skippée) loggue dans
 * claims_auto_approve_log avec décision + raisons. Permet KPI + debug.
 *
 * Hardening SLA-99.9 (2026-05-06) :
 *   - Lease 15 min anti-double-run (50 claims × 2-4s = potentiel 100-200s)
 *   - Wall-clock 50s : on sort de la boucle approveClaim avant kill Vercel
 *   - Per-claim try/catch : l'échec d'un email Resend ne casse pas le batch
 *   - Audit log inséré pour ce qui a été traité (best-effort)
 *   - Release du lease en finally
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'
import { approveClaim } from '@/lib/services/claims-service'

export const dynamic = 'force-dynamic'

const BATCH_SIZE = 50

// SLA-99.9 : cap dur sur le nombre de claims traités par run (alias explicite
// de BATCH_SIZE pour le contrôle SLA — 50 claims × 2-4s tient sous 60s).
const MAX_CLAIMS_PER_RUN = BATCH_SIZE

// SLA-99.9 : wall-clock 50s + lease 15min.
const MAX_RUNTIME_MS = 50_000
const LEASE_NAME = 'cron_claim_auto_approve'
const LEASE_TTL_SECONDS = 15 * 60

type ClaimRow = {
  id: string
  provider_id: string
  status: string
  email_confirmed_at: string | null
  manual_verification_required: boolean | null
  providers: {
    id: string
    user_id: string | null
    rge_valid_until: string | null
    siret: string | null
  } | null
}

type LogRow = {
  claim_id: string
  provider_id: string
  decision: 'approved' | 'skipped'
  reasons: string[]
  rge_valid_until: string | null
  email_confirmed: boolean
}

export const GET = withCronCheckIn('cron-claim-auto-approve', async (request: Request) => {
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const startedAt = Date.now()
  const nowIso = new Date().toISOString()

  // SLA-99.9 : lease avec abort 5s.
  const leaseController = new AbortController()
  const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
  let acquired: boolean | null = null
  let leaseErr: { message: string } | null = null
  try {
    const result = await supabase
      .rpc('acquire_cron_lease', {
        p_name: LEASE_NAME,
        p_ttl_seconds: LEASE_TTL_SECONDS,
      })
      .abortSignal(leaseController.signal)
    acquired = result.data as boolean | null
    leaseErr = result.error
  } catch (err) {
    leaseErr = { message: err instanceof Error ? err.message : String(err) }
  } finally {
    clearTimeout(leaseTimer)
  }

  if (leaseErr) {
    logger.error('[claim-auto-approve] lease error', undefined, {
      lease: LEASE_NAME,
      error: leaseErr.message,
    })
    return NextResponse.json({ success: false, error: 'lease_error' }, { status: 500 })
  }
  if (acquired !== true) {
    logger.info('[claim-auto-approve] skipped (lease already held)', { lease: LEASE_NAME })
    return NextResponse.json({ success: true, skipped: true, reason: 'already_running' })
  }

  try {
    // Précondition 2 (email_confirmed_at NOT NULL) en SQL pour limiter la
    // surface du batch. Préconditions 3+4 vérifiées en mémoire car le join
    // JSONB sur providers.user_id IS NULL ne peut pas se filtrer côté
    // PostgREST embedded resource (limitation `.is()` sur join).
    const { data: claims, error } = await supabase
      .from('provider_claims')
      .select(
        `id, provider_id, status, email_confirmed_at, manual_verification_required,
         providers:provider_id (id, user_id, rge_valid_until, siret)`
      )
      .eq('status', 'pending')
      .eq('manual_verification_required', false)
      .not('email_confirmed_at', 'is', null)
      .order('created_at', { ascending: true })
      .limit(MAX_CLAIMS_PER_RUN)
      .returns<ClaimRow[]>()

    if (error) {
      logger.error('[claim-auto-approve] fetch error', error)
      return NextResponse.json({ success: false, error: 'fetch_failed' }, { status: 500 })
    }

    const candidates = claims ?? []
    if (candidates.length === 0) {
      return NextResponse.json({ success: true, scanned: 0, approved: 0, skipped: 0 })
    }

    let approved = 0
    let skipped = 0
    let capReached = false
    const logs: LogRow[] = []

    for (const claim of candidates) {
      // SLA-99.9 : wall-clock guard (1 approveClaim = 2-4s).
      if (Date.now() - startedAt > MAX_RUNTIME_MS) {
        capReached = true
        break
      }

      // SLA-99.9 : per-claim try/catch — l'échec d'un approveClaim (email
      // Resend down, race condition) ne casse pas le batch.
      try {
        const provider = claim.providers
        const reasons: string[] = []

        if (!provider) {
          reasons.push('provider_not_found')
        } else {
          if (provider.user_id !== null) reasons.push('provider_already_claimed')
          if (!provider.siret) reasons.push('provider_siret_missing')
          if (claim.manual_verification_required) reasons.push('manual_verification_required')
          if (!provider.rge_valid_until) reasons.push('rge_missing')
          else if (new Date(provider.rge_valid_until).getTime() <= Date.now()) {
            reasons.push('rge_expired')
          }
        }

        if (reasons.length > 0) {
          skipped++
          logs.push({
            claim_id: claim.id,
            provider_id: claim.provider_id,
            decision: 'skipped',
            reasons,
            rge_valid_until: provider?.rge_valid_until ?? null,
            email_confirmed: claim.email_confirmed_at !== null,
          })
          continue
        }

        const result = await approveClaim(supabase, claim.id, null)

        if (result.success) {
          approved++
          logs.push({
            claim_id: claim.id,
            provider_id: claim.provider_id,
            decision: 'approved',
            reasons: ['auto_4_conditions_met'],
            // À ce stade `provider` est non-null (sinon on aurait skip). Cast safe.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            rge_valid_until: provider!.rge_valid_until,
            email_confirmed: true,
          })
        } else {
          // approveClaim peut échouer en cas de race (provider déjà claimé entre
          // SELECT et UPDATE atomique) — log skipped avec raison technique.
          skipped++
          logs.push({
            claim_id: claim.id,
            provider_id: claim.provider_id,
            decision: 'skipped',
            reasons: [`approve_failed:${result.error.slice(0, 80)}`],
            rge_valid_until: provider?.rge_valid_until ?? null,
            email_confirmed: true,
          })
          logger.warn('[claim-auto-approve] approveClaim returned failure', {
            claimId: claim.id,
            error: result.error,
            status: result.status,
          })
        }
      } catch (claimErr) {
        skipped++
        logger.warn('[claim-auto-approve] claim processing failed', {
          claimId: claim.id,
          error: claimErr instanceof Error ? claimErr.message : String(claimErr),
        })
      }
    }

    if (logs.length > 0) {
      const { error: logError } = await supabase.from('claims_auto_approve_log').insert(logs)
      if (logError) {
        logger.error('[claim-auto-approve] audit log insert failed', logError)
        // Ne pas faire échouer le cron : les approbations ont eu lieu, l'audit
        // log est best-effort. Sentry capture via checkIn pour traçabilité.
      }
    }

    logger.info('[claim-auto-approve] run complete', {
      scanned: candidates.length,
      approved,
      skipped,
      cap_reached: capReached,
      duration_ms: Date.now() - startedAt,
      timestamp: nowIso,
    })

    return NextResponse.json({
      success: true,
      scanned: candidates.length,
      approved,
      skipped,
      cap_reached: capReached,
      duration_ms: Date.now() - startedAt,
    })
  } finally {
    // SLA-99.9 : release best-effort.
    try {
      await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
    } catch {
      // swallowed : TTL acts as safety net
    }
  }
})
