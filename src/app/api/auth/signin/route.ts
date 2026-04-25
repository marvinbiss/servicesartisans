/**
 * User Signin API - ServicesArtisans
 * Handles user authentication with proper cookie management
 */

import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { signInSchema, validateRequest, formatZodErrors } from '@/lib/validations/schemas'
import { createErrorResponse, createSuccessResponse, ErrorCode } from '@/lib/errors/types'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { twoFactorAuth } from '@/lib/auth/two-factor'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Rate limiting (10 requests per 5 min per IP)
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`signin:${ip}`, { window: 300_000, max: 10, failOpen: true })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives de connexion, veuillez réessayer plus tard' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
        }
      )
    }

    // Validate environment
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Configuration serveur manquante'),
        { status: 500 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(signInSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Données invalides', {
          fields: formatZodErrors(validation.errors),
        }),
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Create Supabase client with cookie handling
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    })

    // Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })

    if (error) {
      // Handle specific error types
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          createErrorResponse(ErrorCode.UNAUTHORIZED, 'Email ou mot de passe incorrect'),
          { status: 401 }
        )
      }
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          createErrorResponse(
            ErrorCode.UNAUTHORIZED,
            'Veuillez confirmer votre email avant de vous connecter'
          ),
          { status: 401 }
        )
      }
      return NextResponse.json(
        createErrorResponse(ErrorCode.UNAUTHORIZED, "Erreur d'authentification"),
        { status: 401 }
      )
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.UNAUTHORIZED, "Échec de l'authentification"),
        { status: 401 }
      )
    }

    // Audit 2026-04-25 (agent #4 BLOCKER H6) : avant ce check, signin posait
    // immédiatement le cookie session après signInWithPassword, ignorant le
    // flag two_factor_enabled. N'importe qui avec mot de passe entrait, 2FA
    // désactivé de fait. Si l'utilisateur a 2FA activé, on déconnecte la
    // session Supabase et on renvoie un signal `requires2FA` au client, qui
    // doit faire un second round avec le code TOTP via /api/auth/2fa.
    try {
      const requiresTwoFactor = await twoFactorAuth.isEnabled(data.user.id)
      if (requiresTwoFactor) {
        // Annule la session que signInWithPassword vient d'établir.
        await supabase.auth.signOut()
        return NextResponse.json(
          createSuccessResponse({
            requires2FA: true,
            userId: data.user.id,
            // Pas de tokens. Le client doit appeler /api/auth/2fa/verify avec
            // le code TOTP, qui re-créera une session si valide.
          }),
          { status: 200 }
        )
      }
    } catch (twoFAError) {
      // Fail-closed sur le check 2FA : un user qui a activé 2FA ne doit
      // jamais passer si on ne peut pas le vérifier (faux positifs OK,
      // faux négatifs interdits).
      logger.error('2FA check failed during signin', twoFAError as Error)
      captureError(twoFAError, {
        tags: { route: 'api/auth/signin', step: '2fa_check', critical: 'true' },
      })
      await supabase.auth.signOut()
      return NextResponse.json(
        createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Vérification 2FA indisponible. Réessayez.'),
        { status: 503 }
      )
    }

    // Get user profile (may not exist yet)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single()

    // Déterminer si l'utilisateur est un artisan basé sur role
    const isArtisan = profile?.role === 'artisan'

    // SECURITY FIX: Ne pas exposer le refresh token dans la réponse JSON
    // Le refresh token est géré par les cookies HTTP-only de Supabase
    const response = NextResponse.json(
      createSuccessResponse({
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName:
            profile?.full_name ||
            data.user.user_metadata?.full_name ||
            `${data.user.user_metadata?.first_name || ''} ${data.user.user_metadata?.last_name || ''}`.trim() ||
            null,
          role: profile?.role || 'user',
          userType: profile?.role === 'artisan' ? 'artisan' : 'client',
          isArtisan,
        },
        session: {
          accessToken: data.session.access_token,
          expiresAt: data.session.expires_at,
          // refreshToken intentionally omitted for security
        },
      })
    )

    // Set refresh token as HTTP-only cookie for security
    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    logger.error('Signin error:', error)
    captureError(error, { tags: { route: 'api/auth/signin', critical: 'true' } })
    return NextResponse.json(
      createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Erreur lors de la connexion'),
      { status: 500 }
    )
  }
}
