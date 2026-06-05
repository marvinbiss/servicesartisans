/**
 * Shared route helpers for CEE partner API routes.
 *
 * Centralises:
 *  - authenticated user + partner record lookup (RLS-respecting client)
 *  - standardised error JSON responses (user-facing FR messages)
 *  - environment fail-close guards (CEE_IBAN_KEY, YOUSIGN_WEBHOOK_SECRET)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { assertArtisanTwoFactor } from '@/lib/auth/artisan-guard'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface AuthContext {
  userId: string
  email: string | null
  supabase: SupabaseClient
}

/**
 * Resolve the authenticated user for the CEE partner API (/api/cee/**).
 *
 * Parité avec `requireArtisan()` (/api/artisan/**) : auth → role artisan →
 * gate 2FA verified (si activé). Le middleware ne couvre PAS /api/cee/* (son
 * bloc API ne fait que rate-limit + CSRF), donc sans ce gate une session
 * pré-challenge 2FA ou hijackée pourrait taper directement les mutations
 * financières (IBAN/SEPA, activation partenaire, dépôt dossier). On ne résout
 * PAS de provider ici : le périmètre CEE travaille sur `cee_artisan_partners`,
 * l'ownership étant assuré en aval par `.eq('user_id', ctx.userId)` + RLS.
 */
export async function requireArtisanAuth(): Promise<
  { ok: true; ctx: AuthContext } | { ok: false; response: NextResponse }
> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentification requise',
          },
        },
        { status: 401 }
      ),
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, two_factor_enabled')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'artisan') {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Accès réservé aux artisans' },
        },
        { status: 403 }
      ),
    }
  }

  // Gate 2FA — parité requireArtisan (Plan C-1, CVSS 8.1). Bloque le bypass
  // pré-challenge et les sessions hijackées sur le périmètre financier CEE.
  const twoFactorError = await assertArtisanTwoFactor(profile.two_factor_enabled, user.id)
  if (twoFactorError) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: { code: 'TWO_FACTOR_REQUIRED', message: 'Vérification 2FA requise' },
        },
        { status: 403 }
      ),
    }
  }

  return {
    ok: true,
    ctx: { userId: user.id, email: user.email ?? null, supabase },
  }
}

export function csrfRejectResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'CSRF_REJECTED',
        message: 'Origine de la requête non autorisée',
      },
    },
    { status: 403 }
  )
}

export function rateLimitedResponse(resetMs: number): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Trop de requêtes. Merci de patienter avant de réessayer.',
      },
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.max(1, Math.ceil(resetMs / 1000))),
      },
    }
  )
}

export function serverErrorResponse(code: string, message: string): NextResponse {
  return NextResponse.json({ success: false, error: { code, message } }, { status: 500 })
}

export function badRequestResponse(code: string, message: string): NextResponse {
  return NextResponse.json({ success: false, error: { code, message } }, { status: 400 })
}

export function notFoundResponse(message: string): NextResponse {
  return NextResponse.json(
    { success: false, error: { code: 'NOT_FOUND', message } },
    { status: 404 }
  )
}

/**
 * Fail-close guard for required production secrets.
 * In production, throws a 500 NextResponse if the env var is missing.
 * In dev, logs a warning and returns null (route continues with dev fallback).
 */
export function requireEnvProd(varName: string): NextResponse | null {
  const value = process.env[varName]
  if (!value || value.length === 0) {
    if (process.env.NODE_ENV === 'production') {
      logger.error('cee-route: required env var missing in production', undefined, {
        action: 'cee-env-missing',
        varName,
      })
      return serverErrorResponse('CONFIG_ERROR', 'Configuration serveur incomplète')
    }
    logger.warn('cee-route: env var missing (dev mode, continuing)', {
      action: 'cee-env-missing-dev',
      varName,
    })
  }
  return null
}
