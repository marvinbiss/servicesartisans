/**
 * GDPR Cookie Consent API - ServicesArtisans
 * Records user cookie consent for compliance
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { logger } from '@/lib/logger'
import { consentPostSchema, updateConsent, getConsentHistory } from '@/lib/services/gdpr-service'

// Lazy initialize to avoid build-time errors
function getSupabaseAdmin() {
  return createClient(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/gdpr/consent - Record cookie consent
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = consentPostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Requête invalide', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { preferences, timestamp, userAgent } = result.data

    // Get user if authenticated
    let userId: string | null = null
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(
              cookiesToSet: Array<{
                name: string
                value: string
                options?: Record<string, unknown>
              }>
            ) {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            },
          },
        }
      )
      const {
        data: { user },
      } = await supabase.auth.getUser()
      userId = user?.id || null
    } catch {
      // User not authenticated, that's fine
    }

    // Get IP address (for compliance records)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'

    const adminSupabase = getSupabaseAdmin()
    const consentResult = await updateConsent(adminSupabase, {
      user_id: userId,
      session_id: crypto.randomUUID(),
      ip_address: ip,
      user_agent: userAgent,
      necessary: preferences.necessary,
      functional: preferences.functional ?? false,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
      personalization: preferences.personalization,
      consent_given_at: timestamp,
    })

    if (consentResult.error) throw new Error(consentResult.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('GDPR consent error:', error)
    return NextResponse.json(
      { success: false, error: { message: "Erreur lors de l'enregistrement du consentement" } },
      { status: 500 }
    )
  }
}

// GET /api/gdpr/consent - Get user's consent history
export async function GET(_request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(
            cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>
          ) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentification requise' } },
        { status: 401 }
      )
    }

    const adminSupabase = getSupabaseAdmin()
    const result = await getConsentHistory(adminSupabase, user.id)

    if (result.error) throw new Error(result.error)

    return NextResponse.json({ consents: result.data })
  } catch (error) {
    logger.error('GDPR consent fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: "Erreur lors de la récupération de l'historique de consentement" },
      },
      { status: 500 }
    )
  }
}
