/**
 * Tests — /api/cron/webhooks-retry
 *
 * The route's only logic is :
 *   1. Auth via verifyCronSecret
 *   2. Wire the real Supabase + deliverWebhook into runWebhookRetry
 *   3. Surface the summary + error to JSON.
 *
 * The orchestrator (`runWebhookRetry`) is covered in detail by
 * `retry.test.ts`. Here we only check the wiring + auth + error mapping
 * by mocking `runWebhookRetry` itself.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: vi.fn() })),
}))

const mockRunWebhookRetry = vi.fn()
vi.mock('@/lib/webhooks/retry', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/webhooks/retry')>('@/lib/webhooks/retry')
  return {
    ...actual,
    runWebhookRetry: (...args: unknown[]) => mockRunWebhookRetry(...args),
  }
})

vi.mock('@/lib/webhooks/delivery', () => ({
  deliverWebhook: vi.fn(),
}))

function buildRequest(authHeader?: string): Request {
  const headers: Record<string, string> = {}
  if (authHeader) headers.authorization = authHeader
  return new Request('http://localhost/api/cron/webhooks-retry', {
    method: 'GET',
    headers,
  })
}

beforeEach(() => {
  process.env.CRON_SECRET = 'test-cron-secret'
  mockRunWebhookRetry.mockReset()
  mockRunWebhookRetry.mockResolvedValue({
    processed: 0,
    retried: 0,
    terminal_success: 0,
    terminal_failure: 0,
    circuit_broken: 0,
    skipped_inactive: 0,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
  delete process.env.CRON_SECRET
})

async function callRoute(req: Request) {
  const mod = await import('@/app/api/cron/webhooks-retry/route')
  return mod.GET(req as unknown as Parameters<typeof mod.GET>[0])
}

describe('GET /api/cron/webhooks-retry', () => {
  it('401 when authorization header is missing', async () => {
    const res = await callRoute(buildRequest())
    expect(res.status).toBe(401)
  })

  it('401 when authorization header is wrong', async () => {
    const res = await callRoute(buildRequest('Bearer wrong-secret-padding-to-match-length'))
    expect(res.status).toBe(401)
    expect(mockRunWebhookRetry).not.toHaveBeenCalled()
  })

  it('401 when CRON_SECRET env is missing (fail-closed, no bypass)', async () => {
    delete process.env.CRON_SECRET
    const res = await callRoute(buildRequest('Bearer test-cron-secret'))
    expect(res.status).toBe(401)
    expect(mockRunWebhookRetry).not.toHaveBeenCalled()
  })

  it('200 with summary when CRON_SECRET matches + empty rows', async () => {
    const res = await callRoute(buildRequest('Bearer test-cron-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.summary).toMatchObject({ processed: 0, retried: 0 })
    expect(mockRunWebhookRetry).toHaveBeenCalledTimes(1)
  })

  it('500 when runWebhookRetry throws', async () => {
    mockRunWebhookRetry.mockRejectedValueOnce(new Error('supabase exploded'))
    const res = await callRoute(buildRequest('Bearer test-cron-secret'))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.error).toMatch(/supabase exploded/)
  })

  it('forwards the summary returned by runWebhookRetry verbatim', async () => {
    mockRunWebhookRetry.mockResolvedValueOnce({
      processed: 4,
      retried: 2,
      terminal_success: 1,
      terminal_failure: 1,
      circuit_broken: 0,
      skipped_inactive: 0,
    })
    const res = await callRoute(buildRequest('Bearer test-cron-secret'))
    const body = await res.json()
    expect(body.summary.processed).toBe(4)
    expect(body.summary.retried).toBe(2)
    expect(body.summary.terminal_success).toBe(1)
    expect(body.summary.terminal_failure).toBe(1)
  })
})
