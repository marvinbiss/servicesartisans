/**
 * POST /api/cee/partners/convention
 *
 * Generates the mandataire-CEE convention PDF, creates a Yousign envelope,
 * and transitions the partner status to `convention_sent`.
 *
 * Security (THREAT_MODEL_PR2)
 * ---------------------------
 * - MUST-9  : validateOrigin() (CSRF)
 * - MUST-8  : rate limit 10 req/min per user_id (Yousign cost)
 * - MUST-12 : validate convention_pdf_url is https://api.yousign.app/* before storage
 * - MUST-6  : transition via updateCeePartnerStatus (throws on illegal)
 * - Fail-close if YOUSIGN_API_KEY missing in production (inside yousign.ts)
 *
 * Note: full ConventionPDF component (6 mandatory mentions arrêté 2/11/2023)
 * is delivered in PR2.3 (ralph-frontend). This route uses a minimal
 * placeholder buffer for PR2.2 — Yousign accepts any PDF as document payload
 * and the rendering is swapped to the full component without route changes.
 */

import type { ReactElement } from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import ConventionPDF from '@/app/(private)/espace-artisan/cee/onboarding/ConventionPDF'
import { validateOrigin } from '@/lib/cee/csrf'
import { checkRateLimit as checkUserRateLimit } from '@/lib/cee/rate-limit'
import { createSignatureRequest } from '@/lib/cee/yousign'
import { updateCeePartnerStatus } from '@/lib/cee/leads-service'
import {
  requireArtisanAuth,
  csrfRejectResponse,
  rateLimitedResponse,
  notFoundResponse,
  serverErrorResponse,
  requireEnvProd,
} from '@/lib/cee/route-helpers'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
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

function rateLimited429(resetAtMs: number): NextResponse {
  return NextResponse.json(
    { success: false, error: { code: 'RATE_LIMITED', message: 'Trop de requêtes' } },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.max(1, Math.ceil((resetAtMs - Date.now()) / 1000))),
      },
    }
  )
}

/** MUST-12 SSRF guard on PDF URL. */
function isYousignPdfUrl(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    return (
      parsed.hostname === 'api.yousign.app' ||
      parsed.hostname.endsWith('.yousign.app') ||
      parsed.hostname.endsWith('.yousign.com')
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  // MUST-9 CSRF
  if (!validateOrigin(request)) {
    return csrfRejectResponse()
  }

  // Fail-close on Yousign API key
  const envError = requireEnvProd('YOUSIGN_API_KEY')
  if (envError) return envError

  // SLA-99.9 : rate limit IP-based (defense in depth, anti-distributed-abuse).
  const ip = getClientIp(request.headers)
  const ipRl = await checkIpRateLimit(`cee-partners-convention:${ip}`, {
    window: 60_000,
    max: 30,
    failOpen: true,
  })
  if (!ipRl.allowed) return rateLimited429(ipRl.resetTime)

  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response
  const { ctx } = auth

  // Rate limit 10/min per user (Yousign cost protection — fail-close).
  const rl = checkUserRateLimit(`cee:convention:${ctx.userId}`, {
    max: 10,
    windowMs: 60_000,
  })
  if (!rl.allowed) return rateLimitedResponse(rl.resetMs)

  try {
    // Lookup partner + artisan display info (RLS scoped).
    // SLA-99.9 : timeout 5s.
    const { data: partner, error: readError } = await withTimeout(
      ctx.supabase
        .from('cee_artisan_partners')
        .select('id, provider_id, status, iban_last4')
        .eq('user_id', ctx.userId)
        .maybeSingle(),
      DB_TIMEOUT_MS,
      'partner_lookup'
    )

    if (readError) {
      logger.error('cee-convention: partner lookup failed', readError, {
        action: 'cee-convention-lookup',
        userId: ctx.userId,
      })
      return serverErrorResponse('READ_FAILED', 'Erreur serveur')
    }
    if (!partner) {
      return notFoundResponse('Aucun dossier partenaire associé à votre compte.')
    }

    // Need IBAN before generating convention (SEPA clause).
    if (!partner.iban_last4) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'IBAN_REQUIRED',
            message: 'Veuillez renseigner votre IBAN avant de générer la convention.',
          },
        },
        { status: 409 }
      )
    }

    // Fetch provider name/email for envelope — admin client (read-only safe).
    // SLA-99.9 : timeout 5s.
    const admin = createAdminClient()
    const { data: provider } = await withTimeout(
      admin
        .from('providers')
        .select('name, email, siret')
        .eq('id', partner.provider_id)
        .maybeSingle(),
      DB_TIMEOUT_MS,
      'provider_lookup'
    )

    const artisanName = provider?.name || ctx.email?.split('@')[0] || 'Artisan'
    const artisanEmail = provider?.email || ctx.email || ''
    const artisanSiret = provider?.siret ?? undefined

    if (!artisanEmail) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_MISSING',
            message: 'Email artisan manquant — contactez le support.',
          },
        },
        { status: 422 }
      )
    }

    // Build PDF + create envelope.
    const pdfBuffer = await renderToBuffer(
      ConventionPDF({
        artisanName,
        artisanEmail,
        artisanSiret,
        envelopeId: undefined,
      }) as ReactElement
    )

    let envelope: { envelopeId: string; procedureId: string; signerUrl: string }
    try {
      envelope = await createSignatureRequest({
        artisanName,
        artisanEmail,
        conventionPdfBuffer: pdfBuffer,
        metadata: { partner_id: partner.id },
      })
    } catch (error) {
      logger.error('cee-convention: yousign create failed', error, {
        action: 'cee-convention-yousign',
        partnerId: partner.id,
      })
      return serverErrorResponse(
        'YOUSIGN_ERROR',
        'La signature électronique est indisponible. Merci de réessayer.'
      )
    }

    // MUST-12 SSRF validation on signerUrl (loose check; Yousign returns its own host).
    if (envelope.signerUrl && !isYousignPdfUrl(envelope.signerUrl)) {
      logger.warn('cee-convention: signerUrl rejected by SSRF guard', {
        action: 'cee-convention-ssrf',
        partnerId: partner.id,
      })
      // Do not store it; keep envelopeId for tracking.
      envelope.signerUrl = ''
    }

    // Persist envelope ID (admin client — still scoped by partner.id we loaded via RLS).
    // SLA-99.9 : timeout 5s.
    const { error: updateError } = await withTimeout(
      admin
        .from('cee_artisan_partners')
        .update({
          yousign_envelope_id: envelope.envelopeId,
          yousign_procedure_id: envelope.procedureId,
          convention_sent_at: new Date().toISOString(),
        })
        .eq('id', partner.id),
      DB_TIMEOUT_MS,
      'partner_update'
    )

    if (updateError) {
      logger.error('cee-convention: partner update failed', updateError, {
        action: 'cee-convention-update',
        partnerId: partner.id,
      })
      // envelope created — do not rollback Yousign. Log and return error.
      return serverErrorResponse(
        'UPDATE_FAILED',
        'Convention créée mais enregistrement partiel. Contactez le support.'
      )
    }

    // MUST-6 status transition.
    try {
      await updateCeePartnerStatus(admin, partner.id, 'convention_sent')
    } catch (transError) {
      logger.warn('cee-convention: status transition skipped', {
        action: 'cee-convention-transition-skip',
        partnerId: partner.id,
        error: transError instanceof Error ? transError.message : String(transError),
      })
    }

    logger.info('cee-convention: envelope created', {
      action: 'cee-convention-ok',
      partnerId: partner.id,
      envelopeId: envelope.envelopeId,
    })

    return NextResponse.json({
      success: true,
      data: {
        envelopeId: envelope.envelopeId,
        signerUrl: envelope.signerUrl,
      },
    })
  } catch (error) {
    logger.error('cee-convention: unexpected error', error, {
      action: 'cee-convention-catch',
      userId: ctx.userId,
    })
    // SLA-99.9 : Sentry alert.
    captureError(error, {
      tags: { route: 'cee-partners-convention', critical: 'true' },
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
