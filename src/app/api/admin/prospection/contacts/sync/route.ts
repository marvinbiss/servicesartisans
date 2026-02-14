import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { syncArtisansFromDatabase } from '@/lib/prospection/import-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission('prospection', 'write')
    if (!authResult.success || !authResult.admin) return authResult.error

    const body = await request.json().catch(() => ({}))
    const department = body.department as string | undefined

    const result = await syncArtisansFromDatabase({ department })

    await logAdminAction(authResult.admin.id, 'contact.sync', 'prospection_contact', 'bulk', {
      department: department || 'all',
      result,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    logger.error('Sync artisans error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}
