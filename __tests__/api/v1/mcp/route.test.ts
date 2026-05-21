/**
 * Tests — MCP server JSON-RPC dispatcher (`/api/v1/mcp`).
 *
 * Couvre :
 *   - JSON-RPC error codes (PARSE, INVALID_REQUEST, METHOD_NOT_FOUND,
 *     INVALID_PARAMS, INTERNAL, UNAUTHORIZED)
 *   - Method dispatch (initialize / tools.list / tools.call / unknown)
 *   - Tool execution success + isError branch
 *   - Bearer auth (public mode, header missing, scheme invalid, length
 *     mismatch, value mismatch, valid match)
 *   - GET discovery endpoint
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ============================================
// Mocks
// ============================================

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
  NextRequest: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// ============================================
// Helpers
// ============================================

type MockResp = { body: unknown; status: number }

function makeReq(body: unknown, headers: Record<string, string> = {}): unknown {
  const h = new Map<string, string>(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
  return {
    headers: {
      get: (k: string) => h.get(k.toLowerCase()) ?? null,
    },
    json: async () => {
      if (body === '__INVALID_JSON__') {
        throw new Error('Unexpected token')
      }
      return body
    },
  }
}

// ============================================
// Tests
// ============================================

const originalEnv = { ...process.env }
beforeEach(() => {
  delete process.env.MCP_BEARER_TOKEN
  vi.clearAllMocks()
})

afterEach(() => {
  process.env = { ...originalEnv }
})

describe('POST /api/v1/mcp — JSON-RPC dispatcher', () => {
  it('returns PARSE_ERROR (-32700) when body is not valid JSON', async () => {
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(makeReq('__INVALID_JSON__') as never)) as unknown as MockResp
    expect(res.status).toBe(400)
    const body = res.body as { error: { code: number; message: string } }
    expect(body.error.code).toBe(-32700)
  })

  it('returns INVALID_REQUEST (-32600) when jsonrpc field is not "2.0"', async () => {
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(
      makeReq({ jsonrpc: '1.0', id: 1, method: 'initialize' }) as never
    )) as unknown as MockResp
    expect(res.status).toBe(400)
    const body = res.body as { error: { code: number } }
    expect(body.error.code).toBe(-32600)
  })

  it('returns INVALID_REQUEST when method field is missing', async () => {
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(makeReq({ jsonrpc: '2.0', id: 1 }) as never)) as unknown as MockResp
    expect(res.status).toBe(400)
    const body = res.body as { error: { code: number } }
    expect(body.error.code).toBe(-32600)
  })

  it('handles initialize and returns protocolVersion + serverInfo', async () => {
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(
      makeReq({ jsonrpc: '2.0', id: 'init-1', method: 'initialize' }) as never
    )) as unknown as MockResp
    expect(res.status).toBe(200)
    const body = res.body as {
      jsonrpc: string
      id: string
      result: {
        protocolVersion: string
        capabilities: { tools: { listChanged: boolean } }
        serverInfo: { name: string; version: string }
      }
    }
    expect(body.jsonrpc).toBe('2.0')
    expect(body.id).toBe('init-1')
    expect(body.result.protocolVersion).toBe('2025-03-26')
    expect(body.result.capabilities.tools.listChanged).toBe(false)
    expect(body.result.serverInfo.name).toBe('servicesartisans-rge-os')
    expect(body.result.serverInfo.version).toBe('0.1.0')
  })

  it('handles tools/list and returns the 4 registered tools', async () => {
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(
      makeReq({ jsonrpc: '2.0', id: 2, method: 'tools/list' }) as never
    )) as unknown as MockResp
    expect(res.status).toBe(200)
    const body = res.body as {
      result: { tools: Array<{ name: string; description: string; inputSchema: unknown }> }
    }
    expect(body.result.tools).toHaveLength(4)
    const names = body.result.tools.map((t) => t.name).sort()
    expect(names).toEqual(['get_aides_for_geste', 'get_bareme_mpr', 'lookup_rge', 'search_rge'])
    for (const tool of body.result.tools) {
      expect(typeof tool.description).toBe('string')
      expect(typeof tool.inputSchema).toBe('object')
    }
  })

  it('handles tools/call with lookup_rge + valid SIRET', async () => {
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(
      makeReq({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: 'lookup_rge', arguments: { siret: '12345678901234' } },
      }) as never
    )) as unknown as MockResp
    expect(res.status).toBe(200)
    const body = res.body as {
      result: { content: Array<{ type: string; text: string }>; isError?: boolean }
    }
    expect(body.result.isError).toBeUndefined()
    expect(body.result.content[0].type).toBe('text')
    const payload = JSON.parse(body.result.content[0].text) as {
      siret: string
      canonical_url: string
    }
    expect(payload.siret).toBe('12345678901234')
    expect(payload.canonical_url).toContain('/api/v1/rge/lookup?siret=12345678901234')
  })

  it('handles tools/call with lookup_rge + invalid SIRET returns isError', async () => {
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(
      makeReq({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: { name: 'lookup_rge', arguments: { siret: 'bad' } },
      }) as never
    )) as unknown as MockResp
    expect(res.status).toBe(200)
    const body = res.body as { result: { isError: boolean; content: Array<{ text: string }> } }
    expect(body.result.isError).toBe(true)
    expect(body.result.content[0].text).toContain('Invalid SIRET')
  })

  it('returns METHOD_NOT_FOUND (-32601) for an unknown tool name', async () => {
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(
      makeReq({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: { name: 'does_not_exist' },
      }) as never
    )) as unknown as MockResp
    expect(res.status).toBe(404)
    const body = res.body as { error: { code: number; message: string } }
    expect(body.error.code).toBe(-32601)
    expect(body.error.message).toContain('does_not_exist')
  })

  it('returns INVALID_PARAMS (-32602) when tools/call is missing params.name', async () => {
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(
      makeReq({ jsonrpc: '2.0', id: 6, method: 'tools/call', params: {} }) as never
    )) as unknown as MockResp
    expect(res.status).toBe(400)
    const body = res.body as { error: { code: number } }
    expect(body.error.code).toBe(-32602)
  })

  it('returns METHOD_NOT_FOUND for an unknown top-level method', async () => {
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(
      makeReq({ jsonrpc: '2.0', id: 7, method: 'totally/unknown' }) as never
    )) as unknown as MockResp
    expect(res.status).toBe(404)
    const body = res.body as { error: { code: number; message: string } }
    expect(body.error.code).toBe(-32601)
    expect(body.error.message).toContain('totally/unknown')
  })

  it('echoes back the id even when id is null', async () => {
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(
      makeReq({ jsonrpc: '2.0', id: null, method: 'initialize' }) as never
    )) as unknown as MockResp
    const body = res.body as { id: unknown }
    expect(body.id).toBeNull()
  })
})

describe('POST /api/v1/mcp — Bearer auth', () => {
  it('allows requests in public mode (MCP_BEARER_TOKEN not set)', async () => {
    delete process.env.MCP_BEARER_TOKEN
    vi.resetModules()
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(
      makeReq({ jsonrpc: '2.0', id: 1, method: 'initialize' }) as never
    )) as unknown as MockResp
    expect(res.status).toBe(200)
  })

  it('rejects when token is configured but Authorization header is missing', async () => {
    process.env.MCP_BEARER_TOKEN = 'sekret-abc'
    vi.resetModules()
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(
      makeReq({ jsonrpc: '2.0', id: 1, method: 'initialize' }) as never
    )) as unknown as MockResp
    expect(res.status).toBe(401)
    const body = res.body as { error: { code: number; message: string } }
    expect(body.error.code).toBe(-32001)
    expect(body.error.message).toBe('missing_authorization_header')
  })

  it('rejects when Authorization header uses an unknown scheme', async () => {
    process.env.MCP_BEARER_TOKEN = 'sekret-abc'
    vi.resetModules()
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(
      makeReq(
        { jsonrpc: '2.0', id: 1, method: 'initialize' },
        { authorization: 'Basic dXNlcjpwYXNz' }
      ) as never
    )) as unknown as MockResp
    expect(res.status).toBe(401)
    const body = res.body as { error: { message: string } }
    expect(body.error.message).toBe('invalid_authorization_scheme')
  })

  it('rejects when the Bearer token does not match', async () => {
    process.env.MCP_BEARER_TOKEN = 'sekret-abc'
    vi.resetModules()
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(
      makeReq(
        { jsonrpc: '2.0', id: 1, method: 'initialize' },
        { authorization: 'Bearer different-token' }
      ) as never
    )) as unknown as MockResp
    expect(res.status).toBe(401)
    const body = res.body as { error: { message: string } }
    expect(body.error.message).toBe('token_mismatch')
  })

  it('accepts when the Bearer token matches', async () => {
    process.env.MCP_BEARER_TOKEN = 'sekret-abc'
    vi.resetModules()
    const { POST } = await import('@/app/api/v1/mcp/route')
    const res = (await POST(
      makeReq(
        { jsonrpc: '2.0', id: 1, method: 'initialize' },
        { authorization: 'Bearer sekret-abc' }
      ) as never
    )) as unknown as MockResp
    expect(res.status).toBe(200)
    const body = res.body as { result: { protocolVersion: string } }
    expect(body.result.protocolVersion).toBe('2025-03-26')
  })
})

describe('GET /api/v1/mcp — discovery endpoint', () => {
  it('returns server metadata + tool names', async () => {
    const { GET } = await import('@/app/api/v1/mcp/route')
    const res = (await GET()) as unknown as MockResp
    expect(res.status).toBe(200)
    const body = res.body as {
      server: string
      version: string
      protocol: string
      tools: string[]
      docs: string
    }
    expect(body.server).toBe('servicesartisans-rge-os')
    expect(body.version).toBe('0.1.0')
    expect(body.protocol).toBe('2025-03-26')
    expect(body.tools).toHaveLength(4)
    expect(body.tools).toContain('lookup_rge')
    expect(body.tools).toContain('search_rge')
    expect(body.tools).toContain('get_bareme_mpr')
    expect(body.tools).toContain('get_aides_for_geste')
    expect(body.docs).toMatch(/^https:\/\//)
  })
})
