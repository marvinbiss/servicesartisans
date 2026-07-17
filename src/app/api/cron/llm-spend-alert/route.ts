/**
 * Cron quotidien : LLM spend guard.
 * ----------------------------------------------------------------------------
 * Somme le coût `cost_usd` des `critic_runs` sur une fenêtre glissante 24h et
 * escalade vers Sentry/logger quand il dépasse les seuils
 * `LLM_SPEND_DAILY_WARN_USD` / `LLM_SPEND_DAILY_CRIT_USD`. Cible le batch
 * automatisé cluster-critic (seul risque de coût runaway) — voir
 * `src/lib/llm/spend-monitor.ts` pour le périmètre.
 *
 * Auth : Bearer CRON_SECRET (pattern partagé rge-health, check-aides-freshness).
 * Schedule : `0 6 * * *` (quotidien 06h UTC, après le batch nocturne).
 *
 * Payload JSON minimal (anti-fuite état interne si CRON_SECRET fuite) : le
 * détail par modèle n'est renvoyé qu'avec le header `X-Debug-Detail: 1`.
 */

import { NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'
import { captureError } from '@/lib/monitoring/sentry'
import { logger } from '@/lib/logger'
import { computeLlmSpendReport } from '@/lib/llm/spend-monitor'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const GET = withCronCheckIn('cron-llm-spend-alert', async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const now = new Date()
    const supabase = createAdminClient()
    const report = await computeLlmSpendReport(supabase, now)
    const timestamp = now.toISOString()

    if (report.status === 'critical') {
      logger.error('[llm-spend-alert] CRITICAL — LLM 24h spend over hard threshold', undefined, {
        kind: 'llm_spend_critical',
        rolling24hUSD: report.rolling24hUSD,
        critThresholdUSD: report.critThresholdUSD,
        runCount24h: report.runCount24h,
        byModel: report.byModel,
      })
      captureError(new Error(`LLM 24h spend critical: $${report.rolling24hUSD}`), {
        tags: { area: 'llm-spend', status: 'critical' },
        extras: { ...report },
        level: 'error',
      })
    } else if (report.status === 'warning') {
      logger.warn('[llm-spend-alert] WARNING — LLM 24h spend over warn threshold', {
        kind: 'llm_spend_warning',
        rolling24hUSD: report.rolling24hUSD,
        warnThresholdUSD: report.warnThresholdUSD,
        runCount24h: report.runCount24h,
        byModel: report.byModel,
      })
    } else {
      logger.info('[llm-spend-alert] OK', {
        rolling24hUSD: report.rolling24hUSD,
        runCount24h: report.runCount24h,
      })
    }

    const debugDetail = request.headers.get('x-debug-detail') === '1'
    return NextResponse.json({
      ok: report.status === 'ok',
      status: report.status,
      rolling24hUSD: report.rolling24hUSD,
      timestamp,
      ...(debugDetail ? { report } : {}),
    })
  } catch (error) {
    logger.error('[llm-spend-alert] cron failed', error)
    return NextResponse.json({ ok: false, error: 'llm-spend-alert cron failure' }, { status: 500 })
  }
})
