/**
 * Webhook cycle de vie Iopole (PDP, mode Push) → met à jour provider_invoices.
 * POST /api/webhooks/iopole
 *
 * Signature (doc Iopole) : canonical = `{ts}\n{METHOD}\n{path_with_query}\n{checksum}`
 *   - ts       = header `x-timestamp` (UNIX epoch ms)
 *   - checksum = SHA-256 hex du corps brut
 *   - signature = HMAC-SHA256(secret, canonical) hex, comparé au header `x-signature`
 * Fail-closed si secret absent. Idempotent via `eventId` (provider_invoice_events).
 *
 * Payload : { eventId, eventType, timestamp, payload: { invoiceId, documentId, … } }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual, createHash } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { getIopoleWebhookSecret } from '@/lib/einvoice/iopole'
import { applyIopoleStatus } from '@/lib/services/provider-invoices-service'

export const dynamic = 'force-dynamic'

// Tolérance anti-rejeu sur l'horodatage signé.
const MAX_SKEW_MS = 5 * 60 * 1000

function timingEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

function verifySignature(
  rawBody: string,
  method: string,
  pathWithQuery: string,
  timestamp: string | null,
  signature: string | null,
  secret: string
): boolean {
  if (!timestamp || !signature) return false
  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_SKEW_MS) return false

  const checksum = createHash('sha256').update(rawBody, 'utf8').digest('hex')
  const canonical = `${timestamp}\n${method.toUpperCase()}\n${pathWithQuery}\n${checksum}`
  const expected = createHmac('sha256', secret).update(canonical, 'utf8').digest('hex')
  return timingEqualHex(expected, signature.trim().replace(/^sha256=/i, ''))
}

function pick(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v) return v
  }
  return null
}

export async function POST(req: NextRequest) {
  const secret = getIopoleWebhookSecret()
  if (!secret) {
    logger.error('[iopole webhook] IOPOLE_WEBHOOK_SECRET manquant — rejet')
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const rawBody = await req.text()
  const url = new URL(req.url)
  const pathWithQuery = `${url.pathname}${url.search}`

  const ok = verifySignature(
    rawBody,
    'POST',
    pathWithQuery,
    req.headers.get('x-timestamp'),
    req.headers.get('x-signature'),
    secret
  )
  if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const inner = (body.payload as Record<string, unknown>) ?? body
  const iopoleId = pick(inner, ['invoiceId', 'id', 'documentId'])
  const eventId = pick(body, ['eventId', 'id'])
  // Le type d'événement porte le statut (ex. INVOICE_OUTBOUND_ACCEPTED) ;
  // fallback sur un champ status explicite si présent.
  const rawStatus = pick(body, ['eventType']) ?? pick(inner, ['status', 'state'])

  if (!iopoleId || !rawStatus) {
    return NextResponse.json({ error: 'Missing invoiceId/status' }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const { error } = await applyIopoleStatus(supabase, {
      iopoleId,
      rawStatus,
      eventId,
      payload: body,
    })
    if (error === 'INVOICE_NOT_FOUND') {
      logger.warn('[iopole webhook] facture inconnue', { iopoleId })
      return NextResponse.json({ ok: true, ignored: true })
    }
    if (error) {
      logger.error('[iopole webhook] applyIopoleStatus error', { error, iopoleId })
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    logger.error('[iopole webhook] exception', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
