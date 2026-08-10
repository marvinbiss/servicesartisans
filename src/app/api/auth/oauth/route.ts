import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { isSafeRedirectPath } from '@/lib/safe-redirect'

// POST request schema
const oauthSchema = z.object({
  provider: z.enum(['google', 'facebook', 'apple']),
  next: z.string().optional(),
})

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = oauthSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Provider invalide', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { provider, next } = result.data

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const siteUrl = SITE_URL
    const safeNext = next && isSafeRedirectPath(next) ? next : null
    const redirectTo = safeNext
      ? `${siteUrl}/auth/callback?next=${encodeURIComponent(safeNext)}`
      : `${siteUrl}/auth/callback`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'facebook' | 'apple',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      // G1-B1 : ne pas leak error.message Supabase (révèle "User not found",
      // "Email rate limit exceeded", etc. → mapping de la surface auth).
      // L'erreur reste tracée serveur côté logger + Sentry.
      logger.error('OAuth error', error)
      captureError(error, { tags: { route: 'api/auth/oauth', step: 'signin' } })
      return NextResponse.json(
        { error: 'Authentification impossible, vérifiez vos paramètres.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ url: data.url })
  } catch (error) {
    logger.error('OAuth error', error)
    captureError(error, { tags: { route: 'api/auth/oauth', critical: 'true' } })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
