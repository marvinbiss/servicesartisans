/**
 * Admin Metrics API — baseline CEO S2-S4 dashboard feed
 * GET /api/admin/metrics?days=30
 *
 * Retourne :
 *   - latest   : snapshot du jour (ou dernier disponible)
 *   - baseline : snapshot 2026-04-22 (J0, figé pour compare)
 *   - series   : N derniers jours (default 30)
 *
 * Source : table metrics_snapshots (migration 470), alimentée chaque nuit
 * par /api/cron/metrics-snapshot → RPC snapshot_metrics_daily().
 */

import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const BASELINE_DATE = '2026-04-22'

export async function GET(request: Request) {
  try {
    const authResult = await requirePermission('settings', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const { searchParams } = new URL(request.url)
    const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30', 10) || 30, 1), 365)

    const supabase = createAdminClient()

    const { data: series, error: seriesErr } = await supabase
      .from('metrics_snapshots')
      .select('*')
      .gte('captured_at', new Date(Date.now() - days * 86400000).toISOString().slice(0, 10))
      .order('captured_at', { ascending: false })

    if (seriesErr) {
      logger.error('admin/metrics series query failed', seriesErr)
      return NextResponse.json(
        { success: false, error: { message: seriesErr.message } },
        { status: 500 }
      )
    }

    const { data: baseline } = await supabase
      .from('metrics_snapshots')
      .select('*')
      .eq('captured_at', BASELINE_DATE)
      .maybeSingle()

    const latest = series?.[0] ?? null

    return NextResponse.json({
      success: true,
      latest,
      baseline,
      baselineDate: BASELINE_DATE,
      series: series ?? [],
      days,
    })
  } catch (err) {
    logger.error('admin/metrics unhandled error', err)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
