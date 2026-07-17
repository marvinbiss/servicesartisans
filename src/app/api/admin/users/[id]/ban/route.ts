import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'
import { z } from 'zod'
import { banUser } from '@/lib/services/admin-crud-service'

// POST request schema
const banUserSchema = z.object({
  action: z.enum(['ban', 'unban']),
  reason: z.string().max(500).optional(),
})

export const dynamic = 'force-dynamic'

// POST - Bannir ou débannir un utilisateur
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
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

    const body = await request.json()
    const result = banUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erreur de validation', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const { action, reason } = result.data

    const supabase = createAdminClient()
    const serviceResult = await banUser(supabase, params.id, action)

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    await logAdminAction(
      authResult.admin.id,
      action === 'ban' ? 'user.ban' : 'user.unban',
      'user',
      params.id,
      { is_banned: action === 'ban', reason }
    )

    return NextResponse.json({ success: true, message: serviceResult.data.message })
  } catch (error) {
    logger.error('Admin user ban error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
