/**
 * Tests — GET /api/devis/weekly-count
 *
 * Couvre :
 *  - Sans filtres : count all 7-day requests
 *  - Avec specialty : join sur services
 *  - Avec city : ILIKE pattern (slug → %slug%)
 *  - specialty inconnu → count 0
 *  - DB error → fail-safe { count: 0 }
 *  - Cache-Control headers présents
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---- mocks ----

const loggerErrorMock = vi.fn()
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: (...a: unknown[]) => loggerErrorMock(...a),
  },
}))

// Mutable mock state
let serviceLookupResult: { id: string } | null = { id: 'svc-1' }
let countResult: { count: number | null; error: { message: string } | null } = {
  count: 7,
  error: null,
}
const filtersCaptured: Array<{ method: string; args: unknown[] }> = []

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'services') {
        const services: Record<string, unknown> = {}
        services.select = (..._a: unknown[]) => services
        services.eq = (..._a: unknown[]) => services
        services.single = async () => ({ data: serviceLookupResult, error: null })
        return services
      }
      // devis_requests — chainable + thenable
      const q: Record<string, unknown> = {}
      q.select = (..._a: unknown[]) => q
      q.gte = (col: unknown, val: unknown) => {
        filtersCaptured.push({ method: 'gte', args: [col, val] })
        return q
      }
      q.eq = (col: unknown, val: unknown) => {
        filtersCaptured.push({ method: 'eq', args: [col, val] })
        return q
      }
      q.ilike = (col: unknown, val: unknown) => {
        filtersCaptured.push({ method: 'ilike', args: [col, val] })
        return q
      }
      q.then = (resolve: (v: unknown) => unknown) => resolve(countResult)
      return q
    },
  }),
}))

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/devis/weekly-count/route'

function buildReq(qs = ''): Parameters<typeof GET>[0] {
  return new NextRequest(`http://localhost/api/devis/weekly-count${qs}`) as unknown as Parameters<
    typeof GET
  >[0]
}

describe('GET /api/devis/weekly-count', () => {
  beforeEach(() => {
    serviceLookupResult = { id: 'svc-1' }
    countResult = { count: 7, error: null }
    filtersCaptured.length = 0
    loggerErrorMock.mockClear()
  })

  it('sans filtres → count all + Cache-Control', async () => {
    const res = await GET(buildReq())
    expect(res.status).toBe(200)
    const body = (await (res as Response).json()) as { count: number }
    expect(body.count).toBe(7)
    expect(res.headers.get('Cache-Control')).toMatch(/public.*s-maxage/)
    // gte sur created_at toujours appliqué
    expect(filtersCaptured.find((f) => f.method === 'gte')).toBeDefined()
  })

  it('avec specialty connu → eq service_id', async () => {
    const res = await GET(buildReq('?specialty=plombier'))
    expect(res.status).toBe(200)
    const eqs = filtersCaptured.filter((f) => f.method === 'eq')
    expect(eqs.find((f) => f.args[0] === 'service_id')).toBeDefined()
  })

  it('avec specialty inconnu → count 0 + headers cache', async () => {
    serviceLookupResult = null
    const res = await GET(buildReq('?specialty=inconnu'))
    expect(res.status).toBe(200)
    const body = (await (res as Response).json()) as { count: number }
    expect(body.count).toBe(0)
    expect(res.headers.get('Cache-Control')).toMatch(/public/)
  })

  it('avec city → ILIKE pattern slug avec % entre tokens', async () => {
    const res = await GET(buildReq('?city=aix-en-provence'))
    expect(res.status).toBe(200)
    const ilikeCall = filtersCaptured.find((f) => f.method === 'ilike')
    expect(ilikeCall).toBeDefined()
    expect(ilikeCall?.args[0]).toBe('city')
    expect(ilikeCall?.args[1]).toBe('%aix%en%provence%')
  })

  it('combinaison specialty + city', async () => {
    const res = await GET(buildReq('?specialty=plombier&city=paris'))
    expect(res.status).toBe(200)
    expect(
      filtersCaptured.find((f) => f.method === 'eq' && f.args[0] === 'service_id')
    ).toBeDefined()
    expect(filtersCaptured.find((f) => f.method === 'ilike' && f.args[0] === 'city')).toBeDefined()
  })

  it('DB error → fail-safe { count: 0 } sans propager 500', async () => {
    countResult = { count: null, error: { message: 'connection refused' } }
    const res = await GET(buildReq())
    expect(res.status).toBe(200)
    const body = (await (res as Response).json()) as { count: number }
    expect(body.count).toBe(0)
    expect(loggerErrorMock).toHaveBeenCalled()
  })

  it('count null → 0 fallback', async () => {
    countResult = { count: null, error: null }
    const res = await GET(buildReq())
    const body = (await (res as Response).json()) as { count: number }
    expect(body.count).toBe(0)
  })
})
