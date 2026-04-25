/**
 * GET /api/admin/system/kpis — System dashboard KPIs
 * Platform health, quality metrics, funnel, monitoring.
 */

import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { getKPIs } from '@/lib/services/admin-stats-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Verify admin with settings:read permission (system KPIs)
    const auth = await requirePermission('settings', 'read')

    if (!auth.success || !auth.admin) return auth.error

    const result = await getKPIs()

    return NextResponse.json(result)
  } catch (error) {
    logger.error('System KPIs GET error', error)
    return NextResponse.json({
      leads: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
      events: { total: 0, today: 0 },
      assignments: { total: 0, pending: 0, viewed: 0, quoted: 0, declined: 0 },
      providers: { total: 0, active: 0, withLeads: 0 },
      quality: { avgResponseMinutes: 0, conversionRate: 0, declineRate: 0, expiredRate: 0 },
      funnel: [],
      dailyLeads: [],
      topServices: [],
      topCities: [],
    })
  }
}
