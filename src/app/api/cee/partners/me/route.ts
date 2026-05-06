/**
 * GET /api/cee/partners/me
 *
 * Returns the authenticated artisan's `cee_artisan_partners` record.
 *
 * Security (THREAT_MODEL_PR2 MUST-13, A01 BAC)
 * --------------------------------------------
 * - Uses `createClient()` (cookie-based, RLS-respecting). No service_role.
 * - Filter `.eq('user_id', auth.uid())` explicit — defense-in-depth even
 *   though RLS policy `cee_artisan_partners_artisan_self_read` already
 *   scopes rows.
 * - Never returns `iban_encrypted`. Only `iban_last4` is UI-safe.
 *
 * SLA-99.9 hardening (2026-05-06)
 * -------------------------------
 * - IP rate limit 60/min via Upstash (failOpen) — endpoint polling-friendly.
 * - Promise.race timeout 5s sur Supabase pour ne jamais hang.
 * - Sentry captureError sur catch racine.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireArtisanAuth, serverErrorResponse } from '@/lib/cee/route-helpers'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { captureError } from '@/lib/monitoring/sentry'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// SLA-99.9 : timeout court sur DB.
const DB_TIMEOUT_MS = 5_000

function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${label}_timeout`)), ms)),
  ])
}

const PARTNER_PUBLIC_COLUMNS =
  'id, provider_id, user_id, status, invited_at, onboarding_started_at, ' +
  'convention_sent_at, convention_signed_at, training_completed_at, ' +
  'certification_score, certified_at, activated_at, suspended_at, ' +
  'revoked_at, iban_last4, bic, titulaire_compte, ' +
  'commission_rate_effective, operations_allowed, zones_allowed, ' +
  'yousign_envelope_id, convention_pdf_url, created_at, updated_at'

export async function GET(request: NextRequest) {
  // SLA-99.9 : rate limit IP-based 60/min (polling UI).
  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`cee-partners-me:${ip}`, {
    window: 60_000,
    max: 60,
    failOpen: true,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMITED', message: 'Trop de requêtes' } },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((rl.resetTime - Date.now()) / 1000))),
        },
      }
    )
  }

  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response

  const { ctx } = auth

  try {
    // SLA-99.9 : timeout 5s sur lookup.
    const { data, error } = await withTimeout(
      ctx.supabase
        .from('cee_artisan_partners')
        .select(PARTNER_PUBLIC_COLUMNS)
        .eq('user_id', ctx.userId)
        .maybeSingle(),
      DB_TIMEOUT_MS,
      'partner_lookup'
    )

    if (error) {
      logger.error('cee-partners-me: read failed', error, {
        action: 'cee-partners-me-read',
        userId: ctx.userId,
      })
      return serverErrorResponse('READ_FAILED', 'Impossible de récupérer votre dossier partenaire')
    }

    return NextResponse.json({
      success: true,
      data: data ?? null,
    })
  } catch (error) {
    logger.error('cee-partners-me: unexpected error', error, {
      action: 'cee-partners-me-catch',
      userId: ctx.userId,
    })
    // SLA-99.9 : Sentry alert.
    captureError(error, {
      tags: { route: 'cee-partners-me', critical: 'true' },
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
