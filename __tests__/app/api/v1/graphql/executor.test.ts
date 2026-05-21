/**
 * Tests — GraphQL executor (`src/app/api/v1/graphql/_executor.ts`)
 *
 * Couvre :
 *  - Unknown root field → errors[] + data[field]=null
 *  - Resolver throws → autres roots non affectés
 *  - Selection projection (only requested fields kept)
 *  - Array projection
 *  - Nested object projection
 *  - MAX_FIELDS exceeded → error
 *  - Mutation operation rejected
 *  - Introspection __typename + __schema
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => ({
              limit: () => Promise.resolve({ data: [], error: null }),
            }),
            limit: () => Promise.resolve({ data: [], error: null }),
            not: () => ({
              eq: () => ({
                eq: () => ({
                  limit: () => Promise.resolve({ data: [], error: null }),
                }),
              }),
            }),
          }),
          ilike: () => ({
            not: () => ({
              eq: () => ({
                eq: () => ({
                  limit: () => Promise.resolve({ data: [], error: null }),
                }),
              }),
            }),
          }),
        }),
      }),
    }),
  })),
}))

import { executeQuery } from '@/app/api/v1/graphql/_executor'
import { parseGraphQL } from '@/app/api/v1/graphql/_parser'
import type { ParsedQuery } from '@/app/api/v1/graphql/_parser'

function mustParse(source: string): ParsedQuery {
  const r = parseGraphQL(source)
  if (!r.ok) throw new Error(`parse failed: ${r.error}`)
  return r.query
}

const CTX = { ip: '127.0.0.1' }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('executeQuery — error isolation', () => {
  it('unknown root field → errors[] + data[field]=null', async () => {
    const q = mustParse('{ notAField }')
    const res = await executeQuery(q, CTX)
    expect(res.errors).toBeDefined()
    expect(res.errors!.length).toBe(1)
    expect(res.errors![0]!.message).toMatch(/Unknown field/i)
    expect(res.data!.notAField).toBe(null)
  })

  it('resolver throws → other roots still resolve', async () => {
    const q = mustParse('{ rgeLookup(siret: "bad") { nom } cumulRules { rules { geste } } }')
    const res = await executeQuery(q, CTX)
    expect(res.errors).toBeDefined()
    expect(res.data!.rgeLookup).toBe(null)
    const cumul = res.data!.cumulRules as { rules: Array<{ geste: string }> }
    expect(Array.isArray(cumul.rules)).toBe(true)
    expect(cumul.rules.length).toBeGreaterThan(0)
  })

  it('mutation operation is rejected', async () => {
    const q = mustParse('mutation { rgeLookup(siret: "1") { nom } }')
    const res = await executeQuery(q, CTX)
    expect(res.data).toBe(null)
    expect(res.errors).toBeDefined()
    expect(res.errors![0]!.message).toMatch(/Mutations are not supported/i)
  })
})

describe('executeQuery — selection projection', () => {
  it('cumulRules selection set projects only requested fields', async () => {
    const q = mustParse('{ cumulRules { rules { geste cumulableMPR } } }')
    const res = await executeQuery(q, CTX)
    expect(res.errors).toBeUndefined()
    const cumul = res.data!.cumulRules as {
      rules: Array<Record<string, unknown>>
    }
    expect(cumul.rules.length).toBeGreaterThan(0)
    const first = cumul.rules[0]!
    expect(Object.keys(first).sort()).toEqual(['cumulableMPR', 'geste'])
  })

  it('projects nested object correctly (mprBareme)', async () => {
    const q = mustParse(
      '{ mprBareme(input: { geste: "pac_air_eau", menageCategorie: "tres_modeste", zone: "hors_idf", rfr: 10000, nbPersonnes: 2 }) { result { eligible amountEUR } } }'
    )
    const res = await executeQuery(q, CTX)
    expect(res.errors).toBeUndefined()
    const mpr = res.data!.mprBareme as { result: Record<string, unknown> }
    expect(Object.keys(mpr).sort()).toEqual(['result'])
    expect(Object.keys(mpr.result).sort()).toEqual(['amountEUR', 'eligible'])
    expect(mpr.result.eligible).toBe(true)
    expect(mpr.result.amountEUR).toBe(5000)
  })

  it('projects array elements correctly', async () => {
    const q = mustParse('{ cumulRules { rules { geste notes } } }')
    const res = await executeQuery(q, CTX)
    const cumul = res.data!.cumulRules as {
      rules: Array<Record<string, unknown>>
    }
    for (const rule of cumul.rules) {
      expect(Object.keys(rule).sort()).toEqual(['geste', 'notes'])
    }
  })
})

describe('executeQuery — DoS guards', () => {
  it('rejects mutation requesting too many fields (caught at parse time)', () => {
    const many = 'mutation { ' + Array.from({ length: 22 }, (_, i) => `f${i}`).join(' ') + ' }'
    const r = parseGraphQL(many)
    expect(r.ok).toBe(false)
  })
})

describe('executeQuery — introspection', () => {
  it('__typename returns "Query"', async () => {
    const q = mustParse('{ __typename }')
    const res = await executeQuery(q, CTX)
    expect(res.errors).toBeUndefined()
    expect(res.data!.__typename).toBe('Query')
  })

  it('__schema returns the root field names', async () => {
    const q = mustParse('{ __schema { queryType { name fields { name } } } }')
    const res = await executeQuery(q, CTX)
    expect(res.errors).toBeUndefined()
    const schema = res.data!.__schema as {
      queryType: { name: string; fields: Array<{ name: string }> }
    }
    expect(schema.queryType.name).toBe('Query')
    const names = schema.queryType.fields.map((f) => f.name).sort()
    expect(names).toEqual(['ceeBareme', 'cumulRules', 'mprBareme', 'rgeLookup', 'rgeSearch'])
  })
})
