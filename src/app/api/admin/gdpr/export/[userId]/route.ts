import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'
import { adminExportUserData } from '@/lib/services/gdpr-service'

export const dynamic = 'force-dynamic'

// POST - Exporter les données d'un utilisateur (RGPD)
export async function POST(_request: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params
  try {
    // Validate userId parameter
    if (!isValidUuid(params.userId)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    // Verify admin with users:read permission (GDPR export)
    const authResult = await requirePermission('users', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()
    const userId = params.userId

    const result = await adminExportUserData(supabase, userId)

    if (result.error) {
      logger.error('Admin GDPR export error', { message: result.error })
      return NextResponse.json(
        { success: false, error: { message: 'Erreur serveur' } },
        { status: 500 }
      )
    }

    // Log audit
    await logAdminAction(authResult.admin.id, 'gdpr.export', 'user', userId)

    return NextResponse.json({
      success: true,
      data: {
        ...result.data,
        exportedBy: authResult.admin.id,
      },
      message: 'Export RGPD généré',
    })
  } catch (error) {
    logger.error('Admin GDPR export error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
