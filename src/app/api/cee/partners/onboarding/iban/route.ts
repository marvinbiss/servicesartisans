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
import { checkRateLimit } from '@/lib/cee/rate-limit'
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

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response
  const { ctx } = auth

  // MUST-8 rate limit 3/min
  const rl = checkRateLimit(`cee:iban:${ctx.userId}`, {
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
  } catch (error) {
    return badRequestResponse(
      'INVALID_BODY',
      "Données invalides. Vérifiez IBAN, BIC et titulaire du compte."
    )
  }

  // Validate IBAN (FR + modulo 97). Never log the IBAN itself.
  const ibanCheck = validateIban(body.iban)
  if (!ibanCheck.valid || !ibanCheck.normalized || !ibanCheck.last4) {
    return badRequestResponse('INVALID_IBAN', 'IBAN invalide.')
  }

  try {
    // Fetch current partner record (RLS-scoped) to get partner_id.
    const { data: partner, error: readError } = await ctx.supabase
      .from('cee_artisan_partners')
      .select('id, status')
      .eq('user_id', ctx.userId)
      .maybeSingle()

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
    const { error: rpcError } = await ctx.supabase.rpc(
      'cee_store_partner_iban',
      {
        p_partner_id: partner.id,
        p_iban: ibanCheck.normalized,
        p_bic: body.bic,
        p_titulaire: body.titulaire,
        p_key: key,
      }
    )

    if (rpcError) {
      logger.error('cee-iban: RPC failed', rpcError, {
        action: 'cee-iban-rpc',
        userId: ctx.userId,
        partnerId: partner.id,
        code: (rpcError as { code?: string }).code,
        // NEVER log the IBAN, BIC or titulaire.
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
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
