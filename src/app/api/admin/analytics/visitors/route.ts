/**
 * Admin Visitor Analytics API
 * GET /api/admin/analytics/visitors?range=7d|30d|90d|all
 *
 * Returns unique visitors, page views, top pages, and session journeys.
 * Separate from the artisan-focused /api/admin/analytics endpoint.
 */

import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { getVisitorStats } from '@/lib/services/admin-stats-service'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const authResult = await requirePermission('settings', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const { searchParams } = new URL(request.url)
    const ALLOWED_RANGES = ['7d', '30d', '90d', 'all'] as const
    const rangeParam = searchParams.get('range')
    const range = ALLOWED_RANGES.includes(rangeParam as (typeof ALLOWED_RANGES)[number])
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        rangeParam!
      : '30d'

    const result = await getVisitorStats({ range })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    logger.error('Admin visitor analytics error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
