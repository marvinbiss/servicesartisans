/**
 * GET /api/notifications — Fetch current user's in-app notifications
 * Private route, no public access. Read-only for client.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { listNotifications } from '@/lib/services/notifications-service'

const notificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  unread: z.enum(['true', 'false']).default('false'),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    const url = request.nextUrl
    const parsed = notificationsQuerySchema.safeParse({
      limit: url.searchParams.get('limit') ?? undefined,
      unread: url.searchParams.get('unread') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides' } },
        { status: 400 }
      )
    }

    const result = await listNotifications(supabase, {
      userId: user.id,
      limit: parsed.data.limit,
      unreadOnly: parsed.data.unread === 'true',
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: result.error } },
        { status: result.status }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    logger.error('Notifications GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
