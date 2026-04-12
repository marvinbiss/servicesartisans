import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'
import { adminGdprDeleteSchema, adminDeleteUserData } from '@/lib/services/gdpr-service'

export const dynamic = 'force-dynamic'

// POST - Supprimer/Anonymiser les données d'un utilisateur (RGPD)
export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Verify admin with users:delete permission (GDPR deletion is critical)
    const authResult = await requirePermission('users', 'delete')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    if (!isValidUuid(params.userId)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const userId = params.userId
    const body = await request.json()
    const result = adminGdprDeleteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Confirmation requise (SUPPRIMER)', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }

    const deleteResult = await adminDeleteUserData(supabase, userId)

    if (deleteResult.error) {
      logger.error('GDPR delete failed', { completedSteps: deleteResult.completedSteps, userId })
      return NextResponse.json(
        {
          success: false,
          error: {
            message: deleteResult.error,
            completedSteps: deleteResult.completedSteps,
          },
        },
        { status: 500 }
      )
    }

    // Log audit (step was tracked in service but actual logging done here with admin context)
    await logAdminAction(authResult.admin.id, 'gdpr.delete', 'user', userId, { anonymized: true })

    return NextResponse.json({
      success: true,
      message: 'Données utilisateur anonymisées conformément au RGPD',
    })
  } catch (error) {
    logger.error('Admin GDPR delete error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
