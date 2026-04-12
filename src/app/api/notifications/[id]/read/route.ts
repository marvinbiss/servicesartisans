/**
 * POST /api/notifications/:id/read — Mark a single notification as read
 * Private route, user can only mark their own notifications.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { markAsRead } from '@/lib/services/notifications-service'

export const dynamic = 'force-dynamic'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non authentifié' } },
        { status: 401 }
      )
    }

    const result = await markAsRead(supabase, id, user.id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: result.error } },
        { status: result.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Notification read POST error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
