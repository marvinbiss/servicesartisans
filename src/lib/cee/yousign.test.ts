/**
 * Tests yousign.ts — HMAC verify, replay, fetch mock.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import crypto from 'crypto'

const SECRET = 'test-yousign-webhook-secret-random-ok-32'

describe('verifyYousignWebhook', () => {
  const ORIGINAL_ENV = { ...process.env }

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV, YOUSIGN_WEBHOOK_SECRET: SECRET }
    vi.resetModules()
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  async function getVerify() {
    const mod = await import('./yousign')
    return mod.verifyYousignWebhook
  }

  it('accepte une signature HMAC-SHA256 sur rawBody valide', async () => {
    const verify = await getVerify()
    const body = '{"event":"signature_request.done"}'
    const ts = Math.floor(Date.now() / 1000).toString()
    const sig = crypto.createHmac('sha256', SECRET).update(body).digest('hex')

    expect(verify(body, sig, ts)).toBe(true)
  })

  it('accepte une signature sur timestamp.rawBody', async () => {
    const verify = await getVerify()
    const body = '{"event":"x"}'
    const ts = Math.floor(Date.now() / 1000).toString()
    const sig = crypto.createHmac('sha256', SECRET).update(`${ts}.${body}`).digest('hex')

    expect(verify(body, sig, ts)).toBe(true)
  })

  it('rejette une signature invalide', async () => {
    const verify = await getVerify()
    const body = '{"a":1}'
    const ts = Math.floor(Date.now() / 1000).toString()
    const sig = crypto.createHmac('sha256', 'wrong-secret').update(body).digest('hex')
    expect(verify(body, sig, ts)).toBe(false)
  })

  it('rejette un timestamp trop ancien (replay)', async () => {
    const verify = await getVerify()
    const body = '{"a":1}'
    const old = (Math.floor(Date.now() / 1000) - 600).toString()
    const sig = crypto.createHmac('sha256', SECRET).update(body).digest('hex')
    expect(verify(body, sig, old)).toBe(false)
  })

  it('rejette un timestamp futur hors fenêtre', async () => {
    const verify = await getVerify()
    const body = '{"a":1}'
    const future = (Math.floor(Date.now() / 1000) + 600).toString()
    const sig = crypto.createHmac('sha256', SECRET).update(body).digest('hex')
    expect(verify(body, sig, future)).toBe(false)
  })

  it('rejette un timestamp non numérique', async () => {
    const verify = await getVerify()
    expect(verify('{}', 'abcd', 'not-a-number')).toBe(false)
  })

  it('rejette si headers manquants', async () => {
    const verify = await getVerify()
    const ts = Math.floor(Date.now() / 1000).toString()
    expect(verify('{}', '', ts)).toBe(false)
    expect(verify('{}', 'x', '')).toBe(false)
  })

  it('rejette si secret absent/placeholder', async () => {
    delete process.env.YOUSIGN_WEBHOOK_SECRET
    vi.resetModules()
    const verify = await getVerify()
    const ts = Math.floor(Date.now() / 1000).toString()
    expect(verify('{}', 'anything', ts)).toBe(false)
  })
})

describe('createSignatureRequest', () => {
  const ORIGINAL_ENV = { ...process.env }

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV, YOUSIGN_API_KEY: 'test-api-key' }
    vi.resetModules()
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
    vi.restoreAllMocks()
  })

  it('enchaîne draft → document → signer → activate et retourne envelopeId', async () => {
    const fetchMock = vi
      .fn()
      // 1. draft
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 'env_123' }),
      })
      // 2. document
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 'doc_456' }),
      })
      // 3. signer
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: 'signer_1',
          signature_link: 'https://yousign.test/sign/xyz',
        }),
      })
      // 4. activate
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) })

    vi.stubGlobal('fetch', fetchMock)

    const mod = await import('./yousign')
    const result = await mod.createSignatureRequest({
      artisanName: 'Jean Dupont',
      artisanEmail: 'jean@example.test',
      conventionPdfBuffer: Buffer.from('%PDF-1.4 fake'),
      metadata: { partner_id: 'p_1' },
    })

    expect(result.envelopeId).toBe('env_123')
    expect(result.signerUrl).toBe('https://yousign.test/sign/xyz')
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('throw sur erreur draft 4xx (pas de retry)', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'bad request',
    })
    vi.stubGlobal('fetch', fetchMock)

    const mod = await import('./yousign')
    await expect(
      mod.createSignatureRequest({
        artisanName: 'X',
        artisanEmail: 'x@y.z',
        conventionPdfBuffer: Buffer.from(''),
      })
    ).rejects.toThrow('Yousign draft failed: 400')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retry 1× sur 5xx puis succès', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => 'down' })
      .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: 'env_ok' }) })
      .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: 'doc' }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 's', signature_link: 'u' }),
      })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) })

    vi.stubGlobal('fetch', fetchMock)
    const mod = await import('./yousign')
    const result = await mod.createSignatureRequest({
      artisanName: 'X',
      artisanEmail: 'x@y.z',
      conventionPdfBuffer: Buffer.from(''),
    })
    expect(result.envelopeId).toBe('env_ok')
    // 1 draft failed + 1 draft retry + doc + signer + activate = 5
    expect(fetchMock).toHaveBeenCalledTimes(5)
  })
})

describe('getSignatureRequest', () => {
  const ORIGINAL_ENV = { ...process.env }

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV, YOUSIGN_API_KEY: 'test-api-key' }
    vi.resetModules()
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
    vi.restoreAllMocks()
  })

  it('retourne status normalisé', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'env_1',
        status: 'done',
        signed_at: '2026-04-14T10:00:00Z',
        signed_document_url: 'https://yousign/pdf',
      }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const mod = await import('./yousign')
    const result = await mod.getSignatureRequest('env_1')
    expect(result.status).toBe('done')
    expect(result.signedPdfUrl).toBe('https://yousign/pdf')
  })
})
