import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 1004,
            message: 'Erreur lors de la déconnexion',
          },
        },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    })

    // Explicitly clear the refresh token cookie
    response.cookies.set('sb-refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error) {
    logger.error('Logout error', error)
    captureError(error, { tags: { route: 'api/auth/logout', critical: 'true' } })
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 9999,
          message: 'Erreur serveur',
        },
      },
      { status: 500 }
    )
  }
}
