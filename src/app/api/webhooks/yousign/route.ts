/**
 * POST /api/webhooks/yousign
 *
 * Receives Yousign v3 webhook events (convention signature lifecycle).
 * Transitions `cee_artisan_partners.status` → convention_signed on signature
 * done.
 *
 * Security (THREAT_MODEL_PR2)
 * ---------------------------
 * - MUST-1  : HMAC-SHA256 compared via crypto.timingSafeEqual (inside lib)
 * - MUST-2  : timestamp drift <= 5 min (replay protection, inside lib)
 * - MUST-5  : fail-close if YOUSIGN_WEBHOOK_SECRET missing in production
 * - MUST-10 : idempotency via (source='yousign', event_id=envelopeId:type)
 * - MUST-16 : Content-Type application/json required
 *
 * Never calls validateOrigin() — Yousign origin is not configurable. HMAC is
 * the only trust anchor.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyYousignWebhook } from '@/lib/cee/yousign'
import { recordWebhookEvent } from '@/lib/cee/webhook-idempotency'
import { updateCeePartnerStatus } from '@/lib/cee/leads-service'
import { requireEnvProd, serverErrorResponse } from '@/lib/cee/route-helpers'
import { validateYousignFileUrl } from '@/lib/cee/url-validation'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function unauthorized(reason: string): NextResponse {
  return NextResponse.json(
    { success: false, error: { code: 'UNAUTHORIZED', message: reason } },
    { status: 401 }
  )
}

export async function POST(request: NextRequest) {
  // MUST-5 fail-close
  const envError = requireEnvProd('YOUSIGN_WEBHOOK_SECRET')
  if (envError) return envError

  // MUST-16 Content-Type check
  const ct = request.headers.get('content-type') || ''
  if (!ct.toLowerCase().includes('application/json')) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Content-Type invalide' },
      },
      { status: 415 }
    )
  }

  // Extract raw body for HMAC verification — must be EXACT bytes as received.
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch (error) {
    logger.warn('yousign-webhook: body read failed', {
      action: 'yousign-webhook-body-read',
      error: error instanceof Error ? error.message : String(error),
    })
    return unauthorized('Body unreadable')
  }

  const signature =
    request.headers.get('x-yousign-signature-256') ||
    request.headers.get('X-Yousign-Signature-256') ||
    ''
  const timestamp =
    request.headers.get('x-yousign-timestamp') ||
    request.headers.get('X-Yousign-Timestamp') ||
    ''

  if (!signature || !timestamp) {
    return unauthorized('Missing signature or timestamp')
  }

  // MUST-1 + MUST-2
  const valid = verifyYousignWebhook(rawBody, signature, timestamp)
  if (!valid) {
    logger.warn('yousign-webhook: signature/timestamp rejected', {
      action: 'yousign-webhook-invalid',
    })
    return unauthorized('Invalid signature')
  }

  // Parse event.
  let event: {
    event_name?: string
    event_type?: string
    event_id?: string
    data?: {
      signature_request?: {
        id?: string
        status?: string
        signed_document_url?: string
        signers?: Array<{ signed_at?: string | null }>
      }
    }
  }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_JSON', message: 'Body invalide' } },
      { status: 400 }
    )
  }

  const eventType = event.event_type || event.event_name || 'unknown'
  const envelopeId = event.data?.signature_request?.id || ''
  if (!envelopeId) {
    logger.warn('yousign-webhook: no envelope id in payload', {
      action: 'yousign-webhook-no-env',
      eventType,
    })
    return NextResponse.json({ success: true, ignored: true })
  }

  // MUST-10 idempotency
  const admin = createAdminClient()
  const eventKey = event.event_id || `${envelopeId}:${eventType}`

  try {
    const { fresh } = await recordWebhookEvent(admin, {
      source: 'yousign',
      event_id: eventKey,
      event_type: eventType,
      payload: event as Record<string, unknown>,
    })

    if (!fresh) {
      // Duplicate — return 200 so Yousign stops retrying.
      return NextResponse.json({ success: true, duplicate: true })
    }
  } catch (error) {
    logger.error('yousign-webhook: idempotency store failed', error, {
      action: 'yousign-webhook-idem',
    })
    return serverErrorResponse('IDEMPOTENCY_ERROR', 'Erreur serveur')
  }

  // Only act on terminal signature-done events.
  const isSigned =
    eventType === 'signature_request.done' ||
    eventType === 'signer.done' ||
    event.data?.signature_request?.status === 'done'

  if (!isSigned) {
    return NextResponse.json({ success: true, processed: false })
  }

  try {
    // Locate the partner via envelope_id.
    const { data: partner, error: readError } = await admin
      .from('cee_artisan_partners')
      .select('id, status')
      .eq('yousign_envelope_id', envelopeId)
      .maybeSingle()

    if (readError || !partner) {
      logger.warn('yousign-webhook: partner not found for envelope', {
        action: 'yousign-webhook-partner-missing',
        envelopeId,
      })
      return NextResponse.json({ success: true, processed: false })
    }

    // MUST-6 transition convention_sent → convention_signed (idempotent via
    // canTransition + updateCeePartnerStatus no-op for same status).
    if (partner.status === 'convention_sent') {
      try {
        await updateCeePartnerStatus(admin, partner.id, 'convention_signed')
      } catch (transError) {
        logger.warn('yousign-webhook: transition skipped', {
          action: 'yousign-webhook-transition-skip',
          partnerId: partner.id,
          error:
            transError instanceof Error
              ? transError.message
              : String(transError),
        })
      }
    }

    // Persist signed PDF URL — SSRF guard via validateYousignFileUrl (CWE-918).
    // Allowlist: api.yousign.app, api.yousign.com, files.yousign.app.
    // Rejects: non-HTTPS, IP literals, RFC1918, loopback, unlisted hosts.
    const signedUrl = event.data?.signature_request?.signed_document_url
    if (signedUrl) {
      if (validateYousignFileUrl(signedUrl)) {
        await admin
          .from('cee_artisan_partners')
          .update({ convention_pdf_url: signedUrl })
          .eq('id', partner.id)
      } else {
        // Log rejection without PII — do not include the URL itself.
        logger.warn('yousign-webhook: signed_document_url rejected by SSRF guard', {
          action: 'yousign-webhook-ssrf',
          partnerId: partner.id,
        })
      }
    }

    logger.info('yousign-webhook: processed', {
      action: 'yousign-webhook-ok',
      partnerId: partner.id,
      envelopeId,
      eventType,
    })

    return NextResponse.json({ success: true, processed: true })
  } catch (error) {
    logger.error('yousign-webhook: processing failed', error, {
      action: 'yousign-webhook-catch',
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
