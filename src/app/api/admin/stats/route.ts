/**
 * Admin Stats API - ServicesArtisans
 * Real platform statistics, trends, activity data, and chart series
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requirePermission } from '@/lib/admin-auth'
import { getDashboardStats } from '@/lib/services/admin-stats-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const authResult = await requirePermission('settings', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const result = await getDashboardStats()

    const response = NextResponse.json({
      success: true,
      ...result,
    })

    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Surrogate-Control', 'no-store')
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store')
    return response
  } catch (error) {
    logger.error('Admin stats error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors de la récupération des statistiques' } },
      { status: 500 }
    )
  }
}
