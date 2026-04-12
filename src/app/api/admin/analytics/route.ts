/**
 * Admin Analytics API — World-class analytics endpoint
 * GET /api/admin/analytics?range=7d|30d|90d|all&search=...&feedPage=1
 */

import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { getAnalyticsEvents } from '@/lib/services/admin-stats-service'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const authResult = await requirePermission('settings', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'
    const search = searchParams.get('search')?.trim().toLowerCase() || ''
    const feedPage = Math.max(1, parseInt(searchParams.get('feedPage') || '1', 10) || 1)

    const result = await getAnalyticsEvents({ range, search, feedPage })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    logger.error('Admin analytics error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
