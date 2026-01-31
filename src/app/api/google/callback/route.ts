import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTokensFromCode } from '@/lib/google/calendar'
import { logger } from '@/lib/logger'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// GET /api/google/callback - Handle Google OAuth callback
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      logger.error('Google OAuth error:', error)
      return NextResponse.redirect(
        `${SITE_URL}/espace-artisan/calendrier?google=error&message=${encodeURIComponent('Connexion refusée')}`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${SITE_URL}/espace-artisan/calendrier?google=error&message=${encodeURIComponent('Paramètres manquants')}`
      )
    }

    const supabase = createClient()

    // Verify state token
    const { data: oauthState, error: stateError } = await supabase
      .from('oauth_states')
      .select('user_id')
      .eq('state', state)
      .eq('provider', 'google')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (stateError || !oauthState) {
      logger.error('Invalid or expired state:', stateError)
      return NextResponse.redirect(
        `${SITE_URL}/espace-artisan/calendrier?google=error&message=${encodeURIComponent('Session expirée')}`
      )
    }

    // Delete used state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state)

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code)

    // Store tokens in database
    const { error: insertError } = await supabase
      .from('google_calendar_tokens')
      .upsert({
        user_id: oauthState.user_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: new Date(tokens.expiry_date).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })

    if (insertError) {
      logger.error('Error storing tokens:', insertError)
      return NextResponse.redirect(
        `${SITE_URL}/espace-artisan/calendrier?google=error&message=${encodeURIComponent('Erreur de sauvegarde')}`
      )
    }

    // Update user profile to indicate Google Calendar is connected
    await supabase
      .from('profiles')
      .update({
        google_calendar_connected: true,
      })
      .eq('id', oauthState.user_id)

    return NextResponse.redirect(
      `${SITE_URL}/espace-artisan/calendrier?google=success`
    )
  } catch (error) {
    logger.error('Google callback error:', error)
    return NextResponse.redirect(
      `${SITE_URL}/espace-artisan/calendrier?google=error&message=${encodeURIComponent('Erreur inattendue')}`
    )
  }
}
