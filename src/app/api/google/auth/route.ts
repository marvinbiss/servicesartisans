import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUrl } from '@/lib/google/calendar'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '@/lib/logger'

// GET /api/google/auth - Initiate Google OAuth flow
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    // Verify user is an artisan with Pro/Premium plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single()

    if (!profile || !['pro', 'premium'].includes(profile.subscription_plan)) {
      return NextResponse.json(
        { error: 'Cette fonctionnalité nécessite un abonnement Pro ou Premium' },
        { status: 403 }
      )
    }

    // Generate state token to prevent CSRF
    const state = uuidv4()

    // Store state in database for verification
    await supabase
      .from('oauth_states')
      .insert({
        state,
        user_id: user.id,
        provider: 'google',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      })

    // Generate authorization URL
    const authUrl = getAuthUrl(state)

    return NextResponse.json({ authUrl })
  } catch (error) {
    logger.error('Error initiating Google auth:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion à Google' },
      { status: 500 }
    )
  }
}
