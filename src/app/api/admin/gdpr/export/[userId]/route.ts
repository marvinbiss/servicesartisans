import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'

// POST - Exporter les données d'un utilisateur (RGPD)
export async function POST(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    // Récupérer toutes les données de l'utilisateur
    const [
      { data: profile },
      { data: bookings },
      { data: reviews },
      { data: conversations },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('bookings').select('*').or(`artisan_id.eq.${userId},client_email.eq.${userId}`),
      supabase.from('reviews').select('*').eq('client_id', userId),
      supabase.from('conversations').select('*').or(`client_id.eq.${userId},provider_id.eq.${userId}`),
    ])

    const exportData = {
      profile,
      bookings: bookings || [],
      reviews: reviews || [],
      conversations: conversations || [],
      exportedAt: new Date().toISOString(),
      exportedBy: authResult.admin.id,
    }

    // Log d'audit
    await logAdminAction(authResult.admin.id, 'gdpr.export', 'user', userId)

    return NextResponse.json({
      success: true,
      data: exportData,
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
