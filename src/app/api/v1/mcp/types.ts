/**
 * MCP (Model Context Protocol) — type contracts.
 *
 * Spec : https://modelcontextprotocol.io/specification/2025-03-26
 *
 * v0 expose un sous-ensemble :
 *   - JSON-RPC 2.0 over HTTP POST (pas de SSE streaming)
 *   - methods: initialize, tools/list, tools/call
 *   - capabilities: tools only
 *
 * Pillar 4 du RGE-OS (cf. docs/RGE-OS-MANIFESTO.md) : exposer les
 * primitives RGE / CEE / aides aux LLMs (Claude Desktop, Cursor,
 * Continue.dev, Cline) via un standard ouvert, pour que SA devienne
 * l'infrastructure agent IA canonique du marché rénovation énergétique
 * français.
 */

export type JsonRpcId = string | number | null

export type JsonRpcRequest = {
  jsonrpc: '2.0'
  id: JsonRpcId
  method: string
  params?: Record<string, unknown>
}

export type JsonRpcSuccessResponse = {
  jsonrpc: '2.0'
  id: JsonRpcId
  result: unknown
}

export type JsonRpcErrorPayload = {
  code: number
  message: string
  data?: unknown
}

export type JsonRpcErrorResponse = {
  jsonrpc: '2.0'
  id: JsonRpcId
  error: JsonRpcErrorPayload
}

export type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse

/**
 * Tool definition exposed via `tools/list`.
 * `inputSchema` is JSON Schema draft-07.
 */
export type MCPToolDefinition = {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export type MCPToolTextContent = {
  type: 'text'
  text: string
}

export type MCPToolResourceContent = {
  type: 'resource'
  resource: { uri: string; mimeType: string }
}

export type MCPToolContent = MCPToolTextContent | MCPToolResourceContent

export type MCPToolResult = {
  content: ReadonlyArray<MCPToolContent>
  isError?: boolean
}

export type MCPToolHandler = (args: Record<string, unknown>) => Promise<MCPToolResult>

export type MCPInitializeResult = {
  protocolVersion: string
  capabilities: {
    tools: { listChanged: boolean }
    resources?: { listChanged: boolean; subscribe: boolean }
    prompts?: { listChanged: boolean }
  }
  serverInfo: {
    name: string
    version: string
  }
}
