import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { logger } from '@/lib/logger'

import { checkMCPAuth } from './auth'
import {
  MCP_PROTOCOL_VERSION,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
  handleInitialize,
} from './handlers/initialize'
import { TOOL_DEFINITIONS, TOOL_HANDLERS } from './tools'
import type { JsonRpcId, JsonRpcRequest, JsonRpcResponse } from './types'

/**
 * MCP (Model Context Protocol) server — JSON-RPC 2.0 over HTTP POST.
 *
 * Pillar 4 of the RGE-OS roadmap (cf. docs/RGE-OS-MANIFESTO.md). Exposes
 * RGE / CEE / aides primitives to LLMs through the emerging MCP standard
 * (Anthropic 2024-2025), so that Claude Desktop, Cursor, Continue.dev,
 * Cline, and any custom agent can discover + invoke these tools through
 * a uniform interface — turning ServicesArtisans into native AI-agent
 * infrastructure for French renovation aides.
 *
 * v0 scope:
 *   - Methods: initialize, tools/list, tools/call
 *   - Tools: lookup_rge, search_rge, get_bareme_mpr, get_aides_for_geste
 *   - Auth: optional Bearer token via MCP_BEARER_TOKEN env
 *   - No SSE streaming (POST → JSON response only)
 *   - No resources/list, no prompts/list
 *
 * Spec: https://modelcontextprotocol.io/specification/2025-03-26
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const JSONRPC_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  UNAUTHORIZED: -32001,
} as const

class MCPError extends Error {
  readonly code: number
  constructor(code: number, message: string) {
    super(message)
    this.code = code
    this.name = 'MCPError'
  }
}

// Enveloppe JSON-RPC 2.0 — loose + passthrough : on préserve params/id et tout
// champ inconnu. La conformité fine (jsonrpc === '2.0', method string) reste
// vérifiée plus bas pour renvoyer le code JSON-RPC INVALID_REQUEST exact.
const jsonRpcEnvelopeSchema = z
  .object({
    jsonrpc: z.unknown().optional(),
    method: z.unknown().optional(),
    id: z.unknown().optional(),
    params: z.unknown().optional(),
  })
  .passthrough()

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = checkMCPAuth(req.headers.get('authorization'))
  if (!auth.authorized) {
    return jsonRpcError(null, JSONRPC_ERROR_CODES.UNAUTHORIZED, auth.reason, 401)
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonRpcError(null, JSONRPC_ERROR_CODES.PARSE_ERROR, 'invalid JSON body', 400)
  }

  const envelope = jsonRpcEnvelopeSchema.safeParse(raw)
  if (!envelope.success) {
    return jsonRpcError(
      null,
      JSONRPC_ERROR_CODES.INVALID_REQUEST,
      'not a valid JSON-RPC 2.0 request',
      400
    )
  }
  const body = envelope.data as JsonRpcRequest

  if (
    !body ||
    typeof body !== 'object' ||
    body.jsonrpc !== '2.0' ||
    typeof body.method !== 'string'
  ) {
    const id = body && typeof body === 'object' ? (body.id ?? null) : null
    return jsonRpcError(
      id,
      JSONRPC_ERROR_CODES.INVALID_REQUEST,
      'not a valid JSON-RPC 2.0 request',
      400
    )
  }

  const id = body.id ?? null
  try {
    const result = await dispatchMethod(body)
    const response: JsonRpcResponse = {
      jsonrpc: '2.0',
      id,
      result,
    }
    return NextResponse.json(response)
  } catch (err) {
    if (err instanceof MCPError) {
      const httpStatus =
        err.code === JSONRPC_ERROR_CODES.METHOD_NOT_FOUND
          ? 404
          : err.code === JSONRPC_ERROR_CODES.INVALID_PARAMS
            ? 400
            : 500
      return jsonRpcError(id, err.code, err.message, httpStatus)
    }
    logger.error('mcp.dispatch.error', err, { method: body.method })
    return jsonRpcError(id, JSONRPC_ERROR_CODES.INTERNAL_ERROR, 'internal server error', 500)
  }
}

async function dispatchMethod(req: JsonRpcRequest): Promise<unknown> {
  if (req.method === 'initialize') {
    return handleInitialize(req.params)
  }
  if (req.method === 'tools/list') {
    return { tools: TOOL_DEFINITIONS }
  }
  if (req.method === 'tools/call') {
    const params = (req.params ?? {}) as {
      name?: unknown
      arguments?: unknown
    }
    const toolName = params.name
    if (typeof toolName !== 'string' || toolName.length === 0) {
      throw new MCPError(JSONRPC_ERROR_CODES.INVALID_PARAMS, 'tools/call requires params.name')
    }
    const handler = TOOL_HANDLERS[toolName]
    if (!handler) {
      throw new MCPError(JSONRPC_ERROR_CODES.METHOD_NOT_FOUND, `unknown tool: ${toolName}`)
    }
    const args =
      params.arguments && typeof params.arguments === 'object' && !Array.isArray(params.arguments)
        ? (params.arguments as Record<string, unknown>)
        : {}
    return handler(args)
  }
  throw new MCPError(JSONRPC_ERROR_CODES.METHOD_NOT_FOUND, `unknown method: ${req.method}`)
}

function jsonRpcError(
  id: JsonRpcId,
  code: number,
  message: string,
  httpStatus: number
): NextResponse {
  const body: JsonRpcResponse = {
    jsonrpc: '2.0',
    id,
    error: { code, message },
  }
  return NextResponse.json(body, { status: httpStatus })
}

/**
 * GET /api/v1/mcp — discovery endpoint (not part of the JSON-RPC spec).
 * Returns server metadata so curious callers / monitoring probes can
 * introspect without crafting a POST body.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    server: MCP_SERVER_NAME,
    version: MCP_SERVER_VERSION,
    protocol: MCP_PROTOCOL_VERSION,
    tools: TOOL_DEFINITIONS.map((t) => t.name),
    docs: 'https://servicesartisans.fr/api/v1/mcp/docs',
    note: 'POST JSON-RPC 2.0 to this endpoint to invoke. See docs/MCP-SERVER.md.',
  })
}
