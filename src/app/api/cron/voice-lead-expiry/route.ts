import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

// Force dynamic rendering — cron lit request.headers (cron-secret) à chaque appel.
export const dynamic = 'force-dynamic'

export const maxDuration = 60

// SLA-99.9 : wall-clock guard 50s + lease anti-double-run.
const MAX_RUNTIME_MS = 50_000
const LEASE_NAME = 'cron_voice_lead_expiry'
const LEASE_TTL_SECONDS = 15 * 60

export const GET = withCronCheckIn('cron-voice-lead-expiry', async (request: NextRequest) => {
  // Verify CRON_SECRET
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const startedAt = Date.now()

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
    logger.error('voice-lead-expiry: lease error', undefined, {
      lease: LEASE_NAME,
      error: leaseErr.message,
    })
    return NextResponse.json({ error: 'lease_error' }, { status: 500 })
  }
  if (acquired !== true) {
    logger.info('voice-lead-expiry: skipped (lease already held)', { lease: LEASE_NAME })
    return NextResponse.json({ success: true, skipped: true, reason: 'already_running' })
  }

  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // Find completed calls with leads that haven't been dispatched
    const { data: expiredCalls, error } = await supabase
      .from('voice_calls')
      .select('id, lead_id, qualification_score, caller_phone')
      .eq('status', 'completed')
      .in('qualification_score', ['A', 'B'])
      .not('lead_id', 'is', null)
      .lt('created_at', cutoff)

    if (error) {
      logger.error('voice-lead-expiry: query error', { error })
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    let expiredCount = 0
    for (const call of expiredCalls || []) {
      // SLA-99.9 : wall-clock guard.
      if (Date.now() - startedAt > MAX_RUNTIME_MS) break
      // Check if lead has been viewed or quoted
      const { data: assignment } = await supabase
        .from('lead_assignments')
        .select('status')
        .eq('lead_id', call.lead_id)
        .in('status', ['viewed', 'quoted', 'accepted'])
        .limit(1)
        .maybeSingle()

      if (!assignment) {
        // No artisan action — mark as expired
        logger.info('Voice lead expired', { callId: call.id, leadId: call.lead_id })
        expiredCount++
      }
    }

    logger.info('voice-lead-expiry completed', {
      checked: expiredCalls?.length || 0,
      expired: expiredCount,
    })

    return NextResponse.json({
      success: true,
      data: { checked: expiredCalls?.length || 0, expired: expiredCount },
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
