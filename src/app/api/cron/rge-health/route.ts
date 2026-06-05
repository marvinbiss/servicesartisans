/**
 * Cron quotidien : RGE / CEE Health Check
 * ----------------------------------------------------------------------------
 * Auth : Bearer CRON_SECRET (pattern sitemap-health).
 * Calcule les métriques de santé du pipeline RGE + catalogue CEE et lève
 * des alertes structurées (logger + Sentry) si un seuil critique est violé.
 *
 * Schedule : `15 8 * * *` (quotidien, 08h15 UTC — décalé du pic 08h00) — déclaré dans vercel.json (ajout 2026-06-05, était codé mais jamais programmé).
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRgeHealthMetrics } from '@/lib/monitoring/rge-health'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const GET = withCronCheckIn('cron-rge-health', async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const client = createAdminClient()
    const report = await getRgeHealthMetrics(client)

    // Trace complète dans les logs Vercel pour archivage
    logger.info('[rge-health]', {
      status: report.status,
      metrics: report.metrics as unknown as Record<string, unknown>,
      alertCount: report.alerts.length,
    })

    return NextResponse.json({
      ok: report.status === 'ok',
      status: report.status,
      metrics: report.metrics,
      alerts: report.alerts,
      timestamp: report.timestamp,
    })
  } catch (error) {
    logger.error('[rge-health] cron failed', error)
    return NextResponse.json({ ok: false, error: 'rge-health cron failure' }, { status: 500 })
  }
})
