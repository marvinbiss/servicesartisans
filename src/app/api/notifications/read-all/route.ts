/**
 * POST /api/notifications/read-all — Mark all notifications as read
 * Private route, user can only mark their own notifications.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { markAllAsRead } from '@/lib/services/notifications-service'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
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

    const result = await markAllAsRead(supabase, user.id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: result.error } },
        { status: result.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Read-all POST error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
