/**
 * Tests — MCP tools isolated (lookup_rge, search_rge, get_bareme_mpr,
 * get_aides_for_geste). Couvre validation des inputs + shape des
 * payloads + structure des inputSchema (JSON Schema draft-07 minimal).
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

describe('Tool: lookup_rge', () => {
  it('rejects a SIRET that is not 14 digits', async () => {
    const { lookupRgeTool } = await import('@/app/api/v1/mcp/tools/lookup-rge')
    const res = await lookupRgeTool({ siret: '1234' })
    expect(res.isError).toBe(true)
    expect(res.content[0]).toMatchObject({ type: 'text' })
  })

  it('rejects a SIRET containing letters', async () => {
    const { lookupRgeTool } = await import('@/app/api/v1/mcp/tools/lookup-rge')
    const res = await lookupRgeTool({ siret: 'ABCDEFGHIJKLMN' })
    expect(res.isError).toBe(true)
  })

  it('accepts a valid 14-digit SIRET and returns canonical_url', async () => {
    const { lookupRgeTool } = await import('@/app/api/v1/mcp/tools/lookup-rge')
    const res = await lookupRgeTool({ siret: '83001931100026' })
    expect(res.isError).toBeUndefined()
    expect(res.content).toHaveLength(1)
    const first = res.content[0]
    expect(first.type).toBe('text')
    const payload = JSON.parse((first as { type: 'text'; text: string }).text) as {
      siret: string
      canonical_url: string
      source: string
    }
    expect(payload.siret).toBe('83001931100026')
    expect(payload.canonical_url).toContain('/api/v1/rge/lookup?siret=83001931100026')
    expect(payload.source).toContain('ADEME')
  })

  it('rejects when siret arg is missing or not a string', async () => {
    const { lookupRgeTool } = await import('@/app/api/v1/mcp/tools/lookup-rge')
    const r1 = await lookupRgeTool({})
    expect(r1.isError).toBe(true)
    const r2 = await lookupRgeTool({ siret: 12345678901234 })
    expect(r2.isError).toBe(true)
  })
})

describe('Tool: search_rge', () => {
  it('rejects when ville is missing', async () => {
    const { searchRgeTool } = await import('@/app/api/v1/mcp/tools/search-rge')
    const res = await searchRgeTool({ metier: 'chauffagiste-rge' })
    expect(res.isError).toBe(true)
  })

  it('rejects when metier is empty', async () => {
    const { searchRgeTool } = await import('@/app/api/v1/mcp/tools/search-rge')
    const res = await searchRgeTool({ ville: 'lyon', metier: '   ' })
    expect(res.isError).toBe(true)
  })

  it('accepts valid ville+metier and returns a canonical URL', async () => {
    const { searchRgeTool } = await import('@/app/api/v1/mcp/tools/search-rge')
    const res = await searchRgeTool({ ville: 'lyon', metier: 'pompe-a-chaleur' })
    expect(res.isError).toBeUndefined()
    const payload = JSON.parse((res.content[0] as { text: string }).text) as {
      ville: string
      metier: string
      limit: number
      canonical_url: string
    }
    expect(payload.ville).toBe('lyon')
    expect(payload.metier).toBe('pompe-a-chaleur')
    expect(payload.limit).toBe(10)
    expect(payload.canonical_url).toContain('city=lyon')
    expect(payload.canonical_url).toContain('q=pompe-a-chaleur')
  })

  it('clamps limit to [1, 50]', async () => {
    const { searchRgeTool } = await import('@/app/api/v1/mcp/tools/search-rge')
    const tooBig = await searchRgeTool({ ville: 'paris', metier: 'isolation', limit: 999 })
    const tooBigPayload = JSON.parse((tooBig.content[0] as { text: string }).text) as {
      limit: number
    }
    expect(tooBigPayload.limit).toBe(10)

    const ok = await searchRgeTool({ ville: 'paris', metier: 'isolation', limit: 25 })
    const okPayload = JSON.parse((ok.content[0] as { text: string }).text) as { limit: number }
    expect(okPayload.limit).toBe(25)
  })
})

describe('Tool: get_bareme_mpr', () => {
  it('rejects an unknown geste', async () => {
    const { getBaremeMprTool } = await import('@/app/api/v1/mcp/tools/get-bareme-mpr')
    const res = await getBaremeMprTool({ geste: 'fake_geste', menage_categorie: 'modeste' })
    expect(res.isError).toBe(true)
  })

  it('rejects an unknown menage_categorie', async () => {
    const { getBaremeMprTool } = await import('@/app/api/v1/mcp/tools/get-bareme-mpr')
    const res = await getBaremeMprTool({ geste: 'pac_air_eau', menage_categorie: 'riche' })
    expect(res.isError).toBe(true)
  })

  it('accepts a valid (geste, menage) and stubs amount=null', async () => {
    const { getBaremeMprTool } = await import('@/app/api/v1/mcp/tools/get-bareme-mpr')
    const res = await getBaremeMprTool({
      geste: 'pac_air_eau',
      menage_categorie: 'modeste',
    })
    expect(res.isError).toBeUndefined()
    const payload = JSON.parse((res.content[0] as { text: string }).text) as {
      geste: string
      menage_categorie: string
      annee: number
      amount: null
      source: string
    }
    expect(payload.geste).toBe('pac_air_eau')
    expect(payload.menage_categorie).toBe('modeste')
    expect(payload.annee).toBe(2026)
    expect(payload.amount).toBeNull()
    expect(payload.source).toBe('pending_v0.2')
  })

  it('rejects an annee outside [2024, 2030]', async () => {
    const { getBaremeMprTool } = await import('@/app/api/v1/mcp/tools/get-bareme-mpr')
    const res = await getBaremeMprTool({
      geste: 'pac_air_eau',
      menage_categorie: 'modeste',
      annee: 1999,
    })
    expect(res.isError).toBe(true)
  })
})

describe('Tool: get_aides_for_geste', () => {
  it('rejects an unknown geste', async () => {
    const { getAidesForGesteTool } = await import('@/app/api/v1/mcp/tools/get-aides-for-geste')
    const res = await getAidesForGesteTool({ geste: 'unknown_thing' })
    expect(res.isError).toBe(true)
  })

  it('returns aides list including MPR + CEE for pac_air_eau', async () => {
    const { getAidesForGesteTool } = await import('@/app/api/v1/mcp/tools/get-aides-for-geste')
    const res = await getAidesForGesteTool({ geste: 'pac_air_eau' })
    expect(res.isError).toBeUndefined()
    const payload = JSON.parse((res.content[0] as { text: string }).text) as {
      geste: string
      aides: Array<{ code: string; cumulable: boolean }>
    }
    expect(payload.geste).toBe('pac_air_eau')
    expect(payload.aides.length).toBeGreaterThan(0)
    const codes = payload.aides.map((a) => a.code)
    expect(codes).toContain('MPR')
    expect(codes).toContain('CEE')
    expect(codes).toContain('ECO_PTZ')
    expect(payload.aides.every((a) => typeof a.cumulable === 'boolean')).toBe(true)
  })

  it('returns at least MPR for audit_energetique', async () => {
    const { getAidesForGesteTool } = await import('@/app/api/v1/mcp/tools/get-aides-for-geste')
    const res = await getAidesForGesteTool({ geste: 'audit_energetique' })
    expect(res.isError).toBeUndefined()
    const payload = JSON.parse((res.content[0] as { text: string }).text) as {
      aides: Array<{ code: string }>
    }
    expect(payload.aides.map((a) => a.code)).toContain('MPR')
  })
})

describe('Tool definitions — JSON Schema structural checks', () => {
  it('every tool has a non-empty name, description, and object inputSchema', async () => {
    const { TOOL_DEFINITIONS } = await import('@/app/api/v1/mcp/tools')
    expect(TOOL_DEFINITIONS).toHaveLength(4)
    for (const tool of TOOL_DEFINITIONS) {
      expect(typeof tool.name).toBe('string')
      expect(tool.name.length).toBeGreaterThan(0)
      expect(typeof tool.description).toBe('string')
      expect(tool.description.length).toBeGreaterThan(10)
      expect(typeof tool.inputSchema).toBe('object')
      const schema = tool.inputSchema as { type?: unknown; properties?: unknown }
      expect(schema.type).toBe('object')
      expect(typeof schema.properties).toBe('object')
    }
  })

  it('tool registry exports a handler for every advertised tool name', async () => {
    const { TOOL_DEFINITIONS, TOOL_HANDLERS } = await import('@/app/api/v1/mcp/tools')
    for (const tool of TOOL_DEFINITIONS) {
      expect(typeof TOOL_HANDLERS[tool.name]).toBe('function')
    }
  })
})
