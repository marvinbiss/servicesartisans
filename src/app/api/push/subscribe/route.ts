/**
 * Push Subscription API - ServicesArtisans
 * Manages push notification subscriptions
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getVapidPublicKey } from '@/lib/notifications/push'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// POST request schema
const subscribePostSchema = z.object({
  userId: z.string().uuid(),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }),
})

// DELETE request query params schema
const unsubscribeSchema = z.object({
  endpoint: z.string().url().optional(),
  userId: z.string().uuid().optional(),
}).refine(data => data.endpoint || data.userId, {
  message: 'endpoint or userId required',
})

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/push/subscribe - Get VAPID public key
export const dynamic = 'force-dynamic'

export async function GET() {
  const vapidKey = getVapidPublicKey()

  if (!vapidKey) {
    return NextResponse.json(
      { error: 'Push notifications not configured' },
      { status: 503 }
    )
  }

  return NextResponse.json({ vapidPublicKey: vapidKey })
}

// POST /api/push/subscribe - Subscribe to push notifications
export async function POST(request: Request) {
  try {
    // Auth check: verify caller is the user they claim to be
    const serverSupabase = await createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
    }

    const body = await request.json()
    const result = subscribePostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Requête invalide', details: result.error.flatten() }, { status: 400 })
    }
    const { userId, subscription } = result.data

    // Verify userId matches authenticated user
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { endpoint, keys } = subscription

    // Get user agent
    const userAgent = request.headers.get('user-agent') || ''

    // Upsert subscription
    const { error } = await getSupabaseAdmin()
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          user_agent: userAgent,
          is_active: true,
          last_used_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Push subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}

// DELETE /api/push/subscribe - Unsubscribe from push notifications
export async function DELETE(request: Request) {
  try {
    // Auth check
    const serverSupabase = await createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = {
      endpoint: searchParams.get('endpoint') || undefined,
      userId: searchParams.get('userId') || undefined,
    }
    const result = unsubscribeSchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json({ error: 'Requête invalide', details: result.error.flatten() }, { status: 400 })
    }
    const { endpoint, userId } = result.data

    // Verify userId matches authenticated user if provided
    if (userId && userId !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const query = getSupabaseAdmin().from('push_subscriptions')

    if (endpoint) {
      // Delete specific subscription
      const { error } = await query.delete().eq('endpoint', endpoint)
      if (error) throw error
    } else if (userId) {
      // Delete all subscriptions for user
      const { error } = await query.delete().eq('user_id', userId)
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Push unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    )
  }
}
