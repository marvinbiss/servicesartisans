import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// GET - Liste des demandes RGPD
export async function GET(_request: NextRequest) {
  try {
    // Verify admin with users:read permission (GDPR requests)
    const authResult = await requirePermission('users', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    // La table data_export_requests a été supprimée en migration 100.
    // La fonctionnalité de file d'attente RGPD est désactivée.
    return NextResponse.json({
      success: true,
      requests: [],
      total: 0,
      page: 1,
      totalPages: 1,
      message: 'Fonctionnalité de demandes RGPD désactivée — table non disponible',
    })
  } catch (error) {
    logger.error('Admin GDPR requests error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
