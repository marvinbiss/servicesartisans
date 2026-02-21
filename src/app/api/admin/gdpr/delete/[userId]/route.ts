import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'
import { z } from 'zod'

// POST request schema
const gdprDeleteSchema = z.object({
  confirmDelete: z.literal('SUPPRIMER'),
})

export const dynamic = 'force-dynamic'

// POST - Supprimer/Anonymiser les données d'un utilisateur (RGPD)
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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
    const result = gdprDeleteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Confirmation requise (SUPPRIMER)', details: result.error.flatten() } },
        { status: 400 }
      )
    }

    // Récupérer l'email du profil pour anonymiser les avis client
    const { data: profileData } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    // Anonymiser le profil — seules les colonnes qui existent sur profiles
    await supabase
      .from('profiles')
      .update({
        email: `deleted_${userId.slice(0, 8)}@anonymized.local`,
        full_name: 'Utilisateur supprimé',
        phone_e164: null,
      })
      .eq('id', userId)

    // Anonymiser les avis client (filtrés par client_email car reviews.user_id n'existe pas)
    if (profileData?.email) {
      await supabase
        .from('reviews')
        .update({
          client_name: 'Utilisateur supprimé',
          client_email: 'deleted@anonymized.local',
        })
        .eq('client_email', profileData.email)
    }

    // Anonymiser les réponses d'avis si l'utilisateur était un artisan
    await supabase
      .from('reviews')
      .update({
        artisan_response: null,
        artisan_responded_at: null,
      })
      .eq('artisan_id', userId)

    // Désactiver le provider si c'est un artisan
    await supabase
      .from('providers')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    // Log d'audit
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
