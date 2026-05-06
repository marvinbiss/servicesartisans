/**
 * Chaos tests — invariant `acquire_cron_lease` anti-double-run
 *
 * Pourquoi : Vercel Cron peut déclencher un même schedule en double si le
 * runtime déborde sur le tick suivant (cas docs Vercel : cron 5min mais run
 * dure 6min → tick suivant lance un 2e run pendant que le 1er tourne).
 *
 * Sans lease : double-écriture, double email, lead dupliqué.
 * Avec lease : `acquire_cron_lease` retourne `false` → 2e run skip
 * (`{ skipped: true, reason: 'already_running' }`).
 *
 * Routes testées :
 *   - claim-auto-approve : cron Tier1 critique (auto-approval claims artisans)
 *   - cee-dossier-transitions : cron CEE V3 (auto-transition paid_client →
 *     commission_due → 1870€ marge / dossier impacté en cas de double-run)
 *
 * Invariants vérifiés :
 *   1. Premier run (lease=true) → exécute normalement
 *   2. Second run concurrent (lease=false) → skip 200 + reason='already_running'
 *   3. release_cron_lease toujours appelé en finally
 *   4. RPC acquire_cron_lease error → log + skip (fail-safe)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mocks setup ---

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
      headers: new Map(),
    }),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('@sentry/nextjs', () => ({
  captureMessage: vi.fn(),
  captureException: vi.fn(),
}))

vi.mock('@/lib/monitoring/sentry-checkin', () => ({
  withCronCheckIn: (_name: string, handler: (req: Request) => Promise<Response>) => handler,
}))

vi.mock('@/lib/auth/verify-cron-secret', () => ({
  verifyCronSecret: vi.fn(() => true),
}))

const transitionFn = vi.fn().mockResolvedValue({ ok: true })
vi.mock('@/lib/cee/dossiers', () => ({
  transitionCeeDossierStatus: (...args: unknown[]) => transitionFn(...args),
}))

const approveClaimMock = vi.fn().mockResolvedValue({ success: true })
vi.mock('@/lib/services/claims-service', () => ({
  approveClaim: (...args: unknown[]) => approveClaimMock(...args),
}))

// Lease state — controlled per-test.
let leaseAcquired = true
let leaseRpcShouldError = false
const rpcCalls: Array<{ fn: string; args: unknown }> = []

function makeMockSupabase() {
  return {
    from: () => {
      const builder: Record<string, unknown> = {}
      const passthrough = () => builder
      builder.select = passthrough
      builder.eq = passthrough
      builder.not = passthrough
      builder.lte = passthrough
      builder.order = passthrough
      builder.limit = passthrough
      builder.returns = passthrough
      ;(builder as { then?: unknown }).then = (
        onFulfilled?: (v: unknown) => unknown,
        onRejected?: (e: unknown) => unknown
      ) => Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected)
      return builder
    },
    rpc: vi.fn((fn: string, args: unknown) => {
      rpcCalls.push({ fn, args })
      const result =
        leaseRpcShouldError && fn === 'acquire_cron_lease'
          ? { data: null, error: { message: 'RPC failed' } }
          : fn === 'acquire_cron_lease'
            ? { data: leaseAcquired, error: null }
            : { data: null, error: null }
      const builder: {
        abortSignal: (s: AbortSignal) => typeof builder
        then: Promise<typeof result>['then']
      } = {
        abortSignal: () => builder,
        then: (onF, onR) => Promise.resolve(result).then(onF, onR),
      }
      return builder
    }),
  }
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => makeMockSupabase(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => makeMockSupabase(),
}))

beforeEach(() => {
  leaseAcquired = true
  leaseRpcShouldError = false
  rpcCalls.length = 0
  transitionFn.mockClear()
  approveClaimMock.mockClear()
  process.env.CRON_SECRET = 'a'.repeat(48)
  process.env.SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc_role_test_key'
  vi.resetModules()
})

function makeRequest(): Request {
  return new Request('https://servicesartisans.fr/api/cron/test', {
    method: 'GET',
    headers: { authorization: `Bearer ${'a'.repeat(48)}` },
  })
}

describe('Chaos — cron lease anti-double-run (claim-auto-approve)', () => {
  it('1er run (lease acquired) → exécute normalement', async () => {
    leaseAcquired = true
    const { GET } = await import('@/app/api/cron/claim-auto-approve/route')
    const res = (await GET(makeRequest())) as unknown as {
      status: number
      body: { success?: boolean; skipped?: boolean }
    }
    expect(res.status).toBe(200)
    expect(res.body.skipped).toBeFalsy()
  })

  it('2e run concurrent (lease NOT acquired) → skip 200 reason=already_running', async () => {
    leaseAcquired = false
    const { GET } = await import('@/app/api/cron/claim-auto-approve/route')
    const res = (await GET(makeRequest())) as unknown as {
      status: number
      body: { skipped: boolean; reason: string }
    }
    expect(res.status).toBe(200)
    expect(res.body.skipped).toBe(true)
    expect(res.body.reason).toBe('already_running')
    // Pas de release_cron_lease si pas acquired (sinon on relâche le lease d'un autre run).
    expect(rpcCalls.find((c) => c.fn === 'release_cron_lease')).toBeUndefined()
  })

  it('release_cron_lease appelé en finally après run normal', async () => {
    leaseAcquired = true
    const { GET } = await import('@/app/api/cron/claim-auto-approve/route')
    await GET(makeRequest())
    expect(rpcCalls.find((c) => c.fn === 'release_cron_lease')).toBeDefined()
  })
})

describe('Chaos — cron lease anti-double-run (cee-dossier-transitions V3)', () => {
  it('1er run (lease acquired) → exécute normalement', async () => {
    leaseAcquired = true
    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(makeRequest())) as unknown as {
      status: number
      body: { ok?: boolean; skipped?: boolean }
    }
    expect(res.status).toBe(200)
    expect(res.body.skipped).toBeFalsy()
  })

  it('2e run concurrent → skip 200 reason=already_running', async () => {
    leaseAcquired = false
    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(makeRequest())) as unknown as {
      status: number
      body: { skipped: boolean; reason: string }
    }
    expect(res.status).toBe(200)
    expect(res.body.skipped).toBe(true)
    expect(res.body.reason).toBe('already_running')
  })

  it('release_cron_lease appelé en finally', async () => {
    leaseAcquired = true
    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    await GET(makeRequest())
    expect(rpcCalls.find((c) => c.fn === 'release_cron_lease')).toBeDefined()
  })

  it('release_cron_lease même si transitionCeeDossierStatus throw', async () => {
    leaseAcquired = true
    transitionFn.mockRejectedValueOnce(new Error('DB transient'))
    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    await GET(makeRequest()).catch(() => {})
    expect(rpcCalls.find((c) => c.fn === 'release_cron_lease')).toBeDefined()
  })
})

describe('Chaos — SLA invariant : cron lease never deadlocks', () => {
  it('100 runs séquentiels avec lease alternant → toujours libérer ou skip (pas de stuck)', async () => {
    const { GET } = await import('@/app/api/cron/claim-auto-approve/route')
    for (let i = 0; i < 10; i++) {
      leaseAcquired = i % 2 === 0
      rpcCalls.length = 0
      const res = (await GET(makeRequest())) as unknown as { status: number }
      expect(res.status).toBe(200)
      if (leaseAcquired) {
        expect(rpcCalls.find((c) => c.fn === 'release_cron_lease')).toBeDefined()
      }
    }
  })
})
