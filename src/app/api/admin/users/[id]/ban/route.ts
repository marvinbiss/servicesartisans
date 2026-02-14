import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'
import { z } from 'zod'

// POST request schema
const banUserSchema = z.object({
  action: z.enum(['ban', 'unban']),
  reason: z.string().max(500).optional(),
})

export const dynamic = 'force-dynamic'

// POST - Bannir ou débannir un utilisateur
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin with users:write permission
    const authResult = await requirePermission('users', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    if (!isValidUuid(params.id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const result = banUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Erreur de validation', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { action, reason } = result.data

    const isBanning = action === 'ban'

    // Mettre à jour le profil
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_banned: isBanning,
        ban_reason: isBanning ? reason : null,
        banned_at: isBanning ? new Date().toISOString() : null,
        banned_by: isBanning ? authResult.admin.id : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      logger.error('User ban/unban failed', { code: error.code, message: error.message })
      return NextResponse.json(
        { success: false, error: { message: 'Impossible de modifier le statut de l\'utilisateur' } },
        { status: 500 }
      )
    }

    // Si c'est un artisan, désactiver/réactiver également le provider
    if (data?.user_type === 'artisan') {
      await supabase
        .from('providers')
        .update({
          is_active: !isBanning,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', params.id)
    }

    // Enregistrer l'action dans les logs d'audit
    await logAdminAction(
      authResult.admin.id,
      isBanning ? 'user.ban' : 'user.unban',
      'user',
      params.id,
      { is_banned: isBanning, reason }
    )

    return NextResponse.json({
      success: true,
      user: data,
      message: isBanning ? 'Utilisateur banni' : 'Utilisateur débanni',
    })
  } catch (error) {
    logger.error('Admin user ban error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
