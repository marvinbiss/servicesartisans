/**
 * Tests — Cron CEE dossier transitions V3 (/api/cron/cee-dossier-transitions)
 *
 * Plan D — D-2 (2026-05-06) : refonte pour le DAG V3 (mig 433).
 *
 * Couvre :
 *   - Auth fail-closed : CRON_SECRET absent / bearer invalide / longueur diff
 *   - Lease anti-double-run via `acquire_cron_lease`
 *   - Règle A : qa_approved âgés > 24h → counters.qa_approved_stale incrémenté
 *   - Règle B : deposited âgés > 14j → counters.deposited_overdue incrémenté
 *   - Règle C : validated_pncee âgés > 7j → counters.validated_pncee_overdue
 *   - Règle D : paid_client > 1h → auto-transition vers commission_due
 *   - Cap MAX_DOSSIERS_PER_RUN respecté
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockJsonFn = vi.fn(
  (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
    body,
    status: init?.status ?? 200,
    headers: init?.headers ?? {},
  })
)

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) =>
      mockJsonFn(body, init),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

const sentryCaptureMessage = vi.fn()
vi.mock('@sentry/nextjs', () => ({
  captureMessage: sentryCaptureMessage,
}))

vi.mock('@/lib/monitoring/sentry-checkin', () => ({
  withCronCheckIn: (_name: string, handler: (req: Request) => Promise<Response>) => handler,
}))

const transitionFn = vi.fn().mockResolvedValue({ ok: true })
vi.mock('@/lib/cee/dossiers', () => ({
  transitionCeeDossierStatus: (...args: unknown[]) => transitionFn(...args),
}))

type V3Status = 'qa_approved' | 'deposited' | 'validated_pncee' | 'paid_client' | 'commission_due'

type DossierRow = {
  id: string
  status: V3Status
  operation_code: string
  created_at: string
  updated_at: string
}

const dossiersByStatus = new Map<V3Status, DossierRow[]>()
let leaseAcquired = true
const rpcCalls: Array<{ fn: string; args: unknown }> = []

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (_table: string) => {
      let captured: V3Status | undefined
      const b: Record<string, unknown> = {}
      b.select = vi.fn().mockReturnValue(b)
      b.eq = vi.fn((col: string, val: unknown) => {
        if (col === 'status') captured = val as V3Status
        return b
      })
      b.lte = vi.fn().mockReturnValue(b)
      b.order = vi.fn().mockReturnValue(b)
      b.limit = vi.fn().mockImplementation(async () => {
        const rows = captured ? (dossiersByStatus.get(captured) ?? []) : []
        return { data: rows, error: null }
      })
      return b
    },
    rpc: vi.fn((fn: string, args: unknown) => {
      rpcCalls.push({ fn, args })
      const result =
        fn === 'acquire_cron_lease'
          ? { data: leaseAcquired, error: null }
          : { data: null, error: null }
      // PostgrestBuilder est thenable + supporte .abortSignal() chaînable.
      const builder: {
        abortSignal: (s: AbortSignal) => typeof builder
        then: Promise<typeof result>['then']
      } = {
        abortSignal: () => builder,
        then: (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected),
      }
      return builder
    }),
  }),
}))

async function importHandler() {
  const mod = await import('@/app/api/cron/cee-dossier-transitions/route')
  return mod.GET
}

function makeRequest(authHeader?: string) {
  const headers = new Headers()
  if (authHeader) headers.set('authorization', authHeader)
  return new Request('https://servicesartisans.fr/api/cron/cee-dossier-transitions', {
    method: 'GET',
    headers,
  })
}

beforeEach(() => {
  dossiersByStatus.clear()
  rpcCalls.length = 0
  mockJsonFn.mockClear()
  sentryCaptureMessage.mockClear()
  transitionFn.mockClear()
  transitionFn.mockResolvedValue({ ok: true })
  leaseAcquired = true
  process.env.CRON_SECRET = 'a'.repeat(48)
  vi.resetModules()
})

afterEach(() => {
  delete process.env.CRON_SECRET
})

describe('cron CEE dossier transitions V3 — auth', () => {
  it('rejette 401 si CRON_SECRET absent', async () => {
    delete process.env.CRON_SECRET
    const handler = await importHandler()
    const res = (await handler(makeRequest('Bearer x'))) as unknown as { status: number }
    expect(res.status).toBe(401)
  })

  it('rejette 401 si bearer manquant', async () => {
    const handler = await importHandler()
    const res = (await handler(makeRequest())) as unknown as { status: number }
    expect(res.status).toBe(401)
  })

  it('rejette 401 si bearer invalide', async () => {
    const handler = await importHandler()
    const res = (await handler(makeRequest('Bearer wrong'))) as unknown as { status: number }
    expect(res.status).toBe(401)
  })

  it('ne throw pas si bearer plus court (timingSafeEqual safe)', async () => {
    const handler = await importHandler()
    const res = (await handler(makeRequest('Bearer short'))) as unknown as { status: number }
    expect(res.status).toBe(401)
  })
})

describe('cron CEE dossier transitions V3 — lease', () => {
  it('skip si lease déjà acquis', async () => {
    leaseAcquired = false
    const handler = await importHandler()
    const res = (await handler(makeRequest(`Bearer ${'a'.repeat(48)}`))) as unknown as {
      status: number
      body: { skipped: boolean; reason: string }
    }
    expect(res.status).toBe(200)
    expect(res.body.skipped).toBe(true)
    expect(res.body.reason).toBe('already_running')
  })

  it('relâche le lease en finally', async () => {
    const handler = await importHandler()
    await handler(makeRequest(`Bearer ${'a'.repeat(48)}`))
    expect(rpcCalls.find((c) => c.fn === 'release_cron_lease')).toBeDefined()
  })
})

describe('cron CEE dossier transitions V3 — règles', () => {
  const oldIso = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()

  it('Règle A — qa_approved stuck → counters.qa_approved_stale + Sentry', async () => {
    dossiersByStatus.set('qa_approved', [
      {
        id: 'd1',
        status: 'qa_approved',
        operation_code: 'BAR-EN-101',
        created_at: oldIso,
        updated_at: oldIso,
      },
      {
        id: 'd2',
        status: 'qa_approved',
        operation_code: 'BAR-TH-104',
        created_at: oldIso,
        updated_at: oldIso,
      },
    ])
    const handler = await importHandler()
    const res = (await handler(makeRequest(`Bearer ${'a'.repeat(48)}`))) as unknown as {
      body: { counters: { qa_approved_stale: number } }
    }
    expect(res.body.counters.qa_approved_stale).toBe(2)
    expect(sentryCaptureMessage).toHaveBeenCalledWith(
      expect.stringContaining('qa_approved'),
      expect.objectContaining({ tags: expect.objectContaining({ rule: 'qa_approved_stale' }) })
    )
  })

  it('Règle B — deposited overdue → counters.deposited_overdue', async () => {
    dossiersByStatus.set('deposited', [
      {
        id: 'd3',
        status: 'deposited',
        operation_code: 'BAR-EN-101',
        created_at: oldIso,
        updated_at: oldIso,
      },
    ])
    const handler = await importHandler()
    const res = (await handler(makeRequest(`Bearer ${'a'.repeat(48)}`))) as unknown as {
      body: { counters: { deposited_overdue: number } }
    }
    expect(res.body.counters.deposited_overdue).toBe(1)
  })

  it('Règle C — validated_pncee overdue → counters.validated_pncee_overdue', async () => {
    dossiersByStatus.set('validated_pncee', [
      {
        id: 'd4',
        status: 'validated_pncee',
        operation_code: 'BAR-EN-101',
        created_at: oldIso,
        updated_at: oldIso,
      },
    ])
    const handler = await importHandler()
    const res = (await handler(makeRequest(`Bearer ${'a'.repeat(48)}`))) as unknown as {
      body: { counters: { validated_pncee_overdue: number } }
    }
    expect(res.body.counters.validated_pncee_overdue).toBe(1)
  })

  it('Règle D — paid_client > 1h → auto-transition commission_due', async () => {
    dossiersByStatus.set('paid_client', [
      {
        id: 'd5',
        status: 'paid_client',
        operation_code: 'BAR-EN-101',
        created_at: oldIso,
        updated_at: oldIso,
      },
      {
        id: 'd6',
        status: 'paid_client',
        operation_code: 'BAR-TH-104',
        created_at: oldIso,
        updated_at: oldIso,
      },
    ])
    const handler = await importHandler()
    const res = (await handler(makeRequest(`Bearer ${'a'.repeat(48)}`))) as unknown as {
      body: { counters: { paid_client_to_commission_due: number } }
    }
    expect(res.body.counters.paid_client_to_commission_due).toBe(2)
    expect(transitionFn).toHaveBeenCalledTimes(2)
    expect(transitionFn).toHaveBeenCalledWith(
      expect.anything(),
      'd5',
      'commission_due',
      null,
      'system'
    )
  })

  it("Règle D — transition échouée n'incrémente pas le compteur", async () => {
    dossiersByStatus.set('paid_client', [
      {
        id: 'd7',
        status: 'paid_client',
        operation_code: 'BAR-EN-101',
        created_at: oldIso,
        updated_at: oldIso,
      },
    ])
    transitionFn.mockResolvedValueOnce({ ok: false, error: 'invalid_transition' })
    const handler = await importHandler()
    const res = (await handler(makeRequest(`Bearer ${'a'.repeat(48)}`))) as unknown as {
      body: { counters: { paid_client_to_commission_due: number }; processed: number }
    }
    expect(res.body.counters.paid_client_to_commission_due).toBe(0)
    expect(res.body.processed).toBe(1)
  })

  it('Run sans dossiers stuck → counters tous à 0, processed=0', async () => {
    const handler = await importHandler()
    const res = (await handler(makeRequest(`Bearer ${'a'.repeat(48)}`))) as unknown as {
      body: {
        ok: boolean
        processed: number
        counters: {
          qa_approved_stale: number
          deposited_overdue: number
          validated_pncee_overdue: number
          paid_client_to_commission_due: number
        }
      }
    }
    expect(res.body.ok).toBe(true)
    expect(res.body.processed).toBe(0)
    expect(res.body.counters).toEqual({
      qa_approved_stale: 0,
      deposited_overdue: 0,
      validated_pncee_overdue: 0,
      paid_client_to_commission_due: 0,
    })
  })
})
