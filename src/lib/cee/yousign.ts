/**
 * Yousign API v3 client — signature électronique convention partenaire CEE
 * + mandats client (arrêté 2/11/2023).
 *
 * Design
 * ------
 * - HTTP direct (pas de SDK — aucun package npm officiel fiable).
 * - Timeout 10s, retry 1× sur 5xx, aucun retry sur 4xx.
 * - Webhook verify : HMAC-SHA256 + timing-safe compare + dérive timestamp <5min.
 * - Fail-close en production si `YOUSIGN_API_KEY` absent.
 *
 * Reference: https://developers.yousign.com/reference/oas-specification
 */

import crypto from 'crypto'
import { logger } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreateSignatureRequestParams {
  artisanName: string
  artisanEmail: string
  /** PDF de la convention (buffer). */
  conventionPdfBuffer: Buffer
  /** Métadonnées arbitraires (partner_id, operation_code, etc.). */
  metadata?: Record<string, string>
}

export interface CreateSignatureRequestResult {
  envelopeId: string
  procedureId: string
  signerUrl: string
}

export interface SignatureRequestStatus {
  envelopeId: string
  status: 'draft' | 'ongoing' | 'done' | 'expired' | 'canceled' | 'declined'
  signedAt: string | null
  signedPdfUrl: string | null
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const YOUSIGN_BASE_URL =
  process.env.YOUSIGN_BASE_URL || 'https://api.yousign.app/v3'
const HTTP_TIMEOUT_MS = 10_000
const WEBHOOK_MAX_DRIFT_SEC = 300

function readApiKey(): string {
  const key = process.env.YOUSIGN_API_KEY
  if (!key || key.startsWith('your-yousign')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('YOUSIGN_API_KEY manquante en production')
    }
    logger.warn('yousign: API key absente/placeholder, dev mode', {
      action: 'yousign-key-missing',
    })
    return 'dev-mock-key'
  }
  return key
}

// ---------------------------------------------------------------------------
// HTTP helper avec timeout + retry 1× sur 5xx
// ---------------------------------------------------------------------------

async function yousignFetch(
  path: string,
  init: RequestInit & { isFormData?: boolean } = {}
): Promise<Response> {
  const apiKey = readApiKey()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS)

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    ...(init.headers as Record<string, string> | undefined),
  }
  if (!init.isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const doFetch = async () => {
    return fetch(`${YOUSIGN_BASE_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    })
  }

  try {
    let response = await doFetch()
    // Retry 1× sur 5xx uniquement
    if (response.status >= 500 && response.status < 600) {
      logger.warn('yousign: 5xx, retry 1×', {
        action: 'yousign-retry',
        status: response.status,
        path,
      })
      response = await doFetch()
    }
    return response
  } finally {
    clearTimeout(timeout)
  }
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

/**
 * Crée une signature request Yousign v3 pour la convention mandataire.
 *
 * Flow :
 *  1. POST /signature_requests (draft)
 *  2. POST /signature_requests/:id/documents (upload PDF)
 *  3. POST /signature_requests/:id/signers (ajout signataire)
 *  4. POST /signature_requests/:id/activate (démarre)
 *
 * @returns `{ envelopeId, procedureId, signerUrl }`
 */
export async function createSignatureRequest(
  params: CreateSignatureRequestParams
): Promise<CreateSignatureRequestResult> {
  const { artisanName, artisanEmail, conventionPdfBuffer, metadata } = params

  // 1. Draft
  const draftRes = await yousignFetch('/signature_requests', {
    method: 'POST',
    body: JSON.stringify({
      name: `Convention mandataire CEE — ${artisanName}`,
      delivery_mode: 'email',
      timezone: 'Europe/Paris',
      external_id: metadata?.partner_id,
    }),
  })

  if (!draftRes.ok) {
    const text = await draftRes.text()
    logger.error('yousign: draft failed', undefined, {
      action: 'yousign-create-draft',
      status: draftRes.status,
      snippet: text.slice(0, 200),
    })
    throw new Error(`Yousign draft failed: ${draftRes.status}`)
  }

  const draft = (await draftRes.json()) as { id: string }
  const envelopeId = draft.id

  // 2. Upload document
  const fd = new FormData()
  fd.append('nature', 'signable_document')
  fd.append('parse_anchors', 'true')
  // Blob accepte Buffer à runtime (Node 18+) mais TS strict diverge selon lib.dom.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBlob = new Blob([conventionPdfBuffer as any], { type: 'application/pdf' })
  fd.append('file', pdfBlob, 'convention.pdf')

  const docRes = await yousignFetch(
    `/signature_requests/${envelopeId}/documents`,
    { method: 'POST', body: fd, isFormData: true }
  )
  if (!docRes.ok) {
    throw new Error(`Yousign document upload failed: ${docRes.status}`)
  }
  const doc = (await docRes.json()) as { id: string }

  // 3. Signer
  const signerRes = await yousignFetch(
    `/signature_requests/${envelopeId}/signers`,
    {
      method: 'POST',
      body: JSON.stringify({
        info: {
          first_name: artisanName.split(' ')[0] || artisanName,
          last_name: artisanName.split(' ').slice(1).join(' ') || artisanName,
          email: artisanEmail,
          locale: 'fr',
        },
        signature_level: 'electronic_signature',
        signature_authentication_mode: 'no_otp',
      }),
    }
  )
  if (!signerRes.ok) {
    throw new Error(`Yousign signer failed: ${signerRes.status}`)
  }
  const signer = (await signerRes.json()) as {
    id: string
    signature_link?: string
  }

  // 4. Activate
  const activateRes = await yousignFetch(
    `/signature_requests/${envelopeId}/activate`,
    { method: 'POST' }
  )
  if (!activateRes.ok) {
    throw new Error(`Yousign activate failed: ${activateRes.status}`)
  }

  logger.info('yousign: signature request created', {
    action: 'yousign-create',
    envelopeId,
    documentId: doc.id,
  })

  return {
    envelopeId,
    procedureId: envelopeId, // v3 : envelope_id = procedure_id
    signerUrl: signer.signature_link || '',
  }
}

/**
 * Récupère le status d'une signature request.
 */
export async function getSignatureRequest(
  envelopeId: string
): Promise<SignatureRequestStatus> {
  const res = await yousignFetch(`/signature_requests/${envelopeId}`, {
    method: 'GET',
  })
  if (!res.ok) {
    throw new Error(`Yousign get failed: ${res.status}`)
  }
  const data = (await res.json()) as {
    id: string
    status: SignatureRequestStatus['status']
    signed_at?: string | null
    signed_document_url?: string | null
  }
  return {
    envelopeId: data.id,
    status: data.status,
    signedAt: data.signed_at ?? null,
    signedPdfUrl: data.signed_document_url ?? null,
  }
}

// ---------------------------------------------------------------------------
// Webhook verify — HMAC-SHA256 + timing-safe + timestamp <5min
// ---------------------------------------------------------------------------

/**
 * Vérifie une signature webhook Yousign.
 *
 * Format (Yousign v3) :
 * - Header `X-Yousign-Signature-256` = hex(HMAC-SHA256(secret, rawBody))
 * - Header `X-Yousign-Timestamp` = epoch seconds (optionnel selon config)
 *
 * @param rawBody Body brut RAW (pas parsé).
 * @param signature Valeur du header `X-Yousign-Signature-256`.
 * @param timestamp Valeur du header `X-Yousign-Timestamp` (epoch seconds).
 * @returns true si signature valide + timestamp récent.
 */
export function verifyYousignWebhook(
  rawBody: string,
  signature: string,
  timestamp: string
): boolean {
  const secret = process.env.YOUSIGN_WEBHOOK_SECRET
  if (!secret || secret.startsWith('your-yousign')) {
    logger.warn('yousign: YOUSIGN_WEBHOOK_SECRET absent/placeholder', {
      action: 'yousign-webhook-no-secret',
    })
    return false
  }

  if (!signature || !timestamp) {
    return false
  }

  // Timestamp drift check (replay protection)
  const tsSec = Number(timestamp)
  if (!Number.isFinite(tsSec)) return false
  const nowSec = Math.floor(Date.now() / 1000)
  if (Math.abs(nowSec - tsSec) > WEBHOOK_MAX_DRIFT_SEC) {
    logger.warn('yousign: webhook timestamp drift too large', {
      action: 'yousign-webhook-drift',
      driftSec: nowSec - tsSec,
    })
    return false
  }

  // HMAC-SHA256 hex (Yousign convention : signature = hex digest sur rawBody seul
  // OU sur `timestamp.rawBody` selon configuration. On supporte les deux).
  const expectedA = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  const expectedB = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')

  const sigBuf = Buffer.from(signature, 'utf8')
  const candidates = [expectedA, expectedB]
  for (const expected of candidates) {
    const expBuf = Buffer.from(expected, 'utf8')
    if (expBuf.length !== sigBuf.length) continue
    try {
      if (crypto.timingSafeEqual(expBuf, sigBuf)) return true
    } catch {
      // length mismatch — continue
    }
  }
  return false
}
