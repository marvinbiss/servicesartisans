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
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'
import { approveClaim } from '@/lib/services/claims-service'

export const dynamic = 'force-dynamic'

const BATCH_SIZE = 50

type ClaimRow = {
  id: string
  provider_id: string
  status: string
  email_confirmed_at: string | null
  providers: {
    id: string
    user_id: string | null
    rge_valid_until: string | null
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

  const nowIso = new Date().toISOString()

  // Précondition 2 (email_confirmed_at NOT NULL) en SQL pour limiter la
  // surface du batch. Préconditions 3+4 vérifiées en mémoire car le join
  // JSONB sur providers.user_id IS NULL ne peut pas se filtrer côté
  // PostgREST embedded resource (limitation `.is()` sur join).
  const { data: claims, error } = await supabase
    .from('provider_claims')
    .select(
      `id, provider_id, status, email_confirmed_at,
       providers:provider_id (id, user_id, rge_valid_until)`
    )
    .eq('status', 'pending')
    .not('email_confirmed_at', 'is', null)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)
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
  const logs: LogRow[] = []

  for (const claim of candidates) {
    const provider = claim.providers
    const reasons: string[] = []

    if (!provider) {
      reasons.push('provider_not_found')
    } else {
      if (provider.user_id !== null) reasons.push('provider_already_claimed')
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
    timestamp: nowIso,
  })

  return NextResponse.json({
    success: true,
    scanned: candidates.length,
    approved,
    skipped,
  })
})
