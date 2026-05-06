/**
 * POST /api/cee/partners/onboarding/iban
 *
 * Stores the artisan's IBAN/BIC/titulaire for SEPA batch payouts.
 *
 * Security (THREAT_MODEL_PR2)
 * ---------------------------
 * - MUST-9  : validateOrigin() (CSRF)
 * - MUST-8  : rate limit 3 req/min per user_id
 * - MUST-4  : fail-close if CEE_IBAN_KEY absent in production
 * - MUST-3  : encryption via SECURITY DEFINER RPC `cee_store_partner_iban`
 *             (atomic, uses bind params, ownership check via auth.uid() in SQL).
 *             Node never holds the key long — passes it through to pgcrypto.
 * - MUST-11 : never log the IBAN; only `last4`.
 * - MUST-6  : status transition invited → onboarding (if applicable) is
 *             delegated to updateCeePartnerStatus, which throws on illegal
 *             transitions.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateOrigin } from '@/lib/cee/csrf'
import { checkRateLimit as checkUserRateLimit } from '@/lib/cee/rate-limit'
import { validateIban } from '@/lib/cee/iban-crypto'
import { updateCeePartnerStatus } from '@/lib/cee/leads-service'
import {
  requireArtisanAuth,
  csrfRejectResponse,
  rateLimitedResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  requireEnvProd,
} from '@/lib/cee/route-helpers'
import { logger } from '@/lib/logger'
import { checkRateLimit as checkIpRateLimit, getClientIp } from '@/lib/rate-limiter'
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

const BodySchema = z.object({
  iban: z.string().min(14).max(64),
  bic: z
    .string()
    .regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i)
    .transform((v) => v.toUpperCase()),
  titulaire: z.string().min(2).max(120),
})

export async function POST(request: NextRequest) {
  // MUST-9 CSRF
  if (!validateOrigin(request)) {
    return csrfRejectResponse()
  }

  // MUST-4 fail-close
  const envError = requireEnvProd('CEE_IBAN_KEY')
  if (envError) return envError

  // SLA-99.9 : rate limit IP-based 10/min (defense in depth contre abus
  // distribué qui contournerait le user-bucket en réutilisant des sessions).
  const ip = getClientIp(request.headers)
  const ipRl = await checkIpRateLimit(`cee-partners-iban:${ip}`, {
    window: 60_000,
    max: 10,
    failOpen: true,
  })
  if (!ipRl.allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMITED', message: 'Trop de requêtes' } },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((ipRl.resetTime - Date.now()) / 1000))),
        },
      }
    )
  }

  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response
  const { ctx } = auth

  // MUST-8 rate limit 3/min per user (anti-bruteforce IBAN enumeration).
  const rl = checkUserRateLimit(`cee:iban:${ctx.userId}`, {
    max: 3,
    windowMs: 60_000,
  })
  if (!rl.allowed) {
    return rateLimitedResponse(rl.resetMs)
  }

  // Parse body
  let body: z.infer<typeof BodySchema>
  try {
    const json = await request.json()
    body = BodySchema.parse(json)
  } catch (_error) {
    return badRequestResponse(
      'INVALID_BODY',
      'Données invalides. Vérifiez IBAN, BIC et titulaire du compte.'
    )
  }

  // Validate IBAN (FR + modulo 97). Never log the IBAN itself.
  const ibanCheck = validateIban(body.iban)
  if (!ibanCheck.valid || !ibanCheck.normalized || !ibanCheck.last4) {
    return badRequestResponse('INVALID_IBAN', 'IBAN invalide.')
  }

  try {
    // Fetch current partner record (RLS-scoped) to get partner_id.
    // SLA-99.9 : timeout 5s.
    const { data: partner, error: readError } = await withTimeout(
      ctx.supabase
        .from('cee_artisan_partners')
        .select('id, status')
        .eq('user_id', ctx.userId)
        .maybeSingle(),
      DB_TIMEOUT_MS,
      'partner_lookup'
    )

    if (readError) {
      logger.error('cee-iban: partner lookup failed', readError, {
        action: 'cee-iban-partner-lookup',
        userId: ctx.userId,
      })
      return serverErrorResponse('READ_FAILED', 'Erreur serveur')
    }

    if (!partner) {
      return notFoundResponse('Aucun dossier partenaire associé à votre compte.')
    }

    // MUST-3 atomic store via SECURITY DEFINER RPC (ownership check SQL-side).
    // CWE-798: fail-close — no hardcoded fallback. CEE_IBAN_KEY must be set
    // (validated at module boot in iban-crypto.ts via validateCeeIbanKey()).
    const key = process.env.CEE_IBAN_KEY
    if (!key) {
      logger.error('cee-iban: CEE_IBAN_KEY missing', null, {
        action: 'cee-iban-env',
        userId: ctx.userId,
      })
      return serverErrorResponse('CONFIG_ERROR', 'Configuration serveur incomplète')
    }
    // SLA-99.9 : timeout 5s sur RPC (encryption + insert pgcrypto).
    const { error: rpcError } = await withTimeout(
      ctx.supabase.rpc('cee_store_partner_iban', {
        p_partner_id: partner.id,
        p_iban: ibanCheck.normalized,
        p_bic: body.bic,
        p_titulaire: body.titulaire,
        p_key: key,
      }),
      DB_TIMEOUT_MS,
      'iban_rpc'
    )

    if (rpcError) {
      logger.error('cee-iban: RPC failed', rpcError, {
        action: 'cee-iban-rpc',
        userId: ctx.userId,
        partnerId: partner.id,
        code: (rpcError as { code?: string }).code,
        // SLA-99.9 : NEVER log the IBAN, BIC or titulaire (PII bancaire).
      })
      return serverErrorResponse(
        'ENCRYPT_FAILED',
        'Impossible d’enregistrer les coordonnées bancaires.'
      )
    }

    // MUST-6 transition invited → onboarding (idempotent). Throws on illegal.
    if (partner.status === 'invited') {
      try {
        await updateCeePartnerStatus(ctx.supabase, partner.id, 'onboarding')
      } catch (transError) {
        // Non-blocking — IBAN already stored; log and continue.
        logger.warn('cee-iban: status transition skipped', {
          action: 'cee-iban-transition-skip',
          partnerId: partner.id,
          error: transError instanceof Error ? transError.message : String(transError),
        })
      }
    }

    logger.info('cee-iban: IBAN stored', {
      action: 'cee-iban-stored',
      userId: ctx.userId,
      partnerId: partner.id,
      last4: ibanCheck.last4, // last4 only — safe to log.
    })

    return NextResponse.json({
      success: true,
      data: { iban_last4: ibanCheck.last4, bic: body.bic },
    })
  } catch (error) {
    logger.error('cee-iban: unexpected error', error, {
      action: 'cee-iban-catch',
      userId: ctx.userId,
      // SLA-99.9 : NEVER include body / IBAN / BIC / titulaire in error context.
    })
    // SLA-99.9 : Sentry alert. NE JAMAIS passer le body en extras
    // (contiendrait IBAN clair). Tags only.
    captureError(error, {
      tags: { route: 'cee-partners-iban', critical: 'true' },
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
