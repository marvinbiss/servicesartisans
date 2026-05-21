import type { MCPInitializeResult } from '../types'

/**
 * MCP `initialize` handler.
 *
 * Returns the protocol version we implement + server capabilities. The
 * client (Claude Desktop, Cursor, ...) uses this to verify compatibility
 * before issuing any other method.
 *
 * v0 advertises only the `tools` capability — no resources, no prompts,
 * no SSE streaming. `listChanged: false` because the tool set is static
 * (registered at build time, not dynamic).
 */
export const MCP_PROTOCOL_VERSION = '2025-03-26'
export const MCP_SERVER_NAME = 'servicesartisans-rge-os'
export const MCP_SERVER_VERSION = '0.1.0'

export function handleInitialize(_params: unknown): MCPInitializeResult {
  return {
    protocolVersion: MCP_PROTOCOL_VERSION,
    capabilities: {
      tools: { listChanged: false },
    },
    serverInfo: {
      name: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
    },
  }
}
