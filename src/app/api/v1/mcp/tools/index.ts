import type { MCPToolDefinition, MCPToolHandler } from '../types'
import { lookupRgeDefinition, lookupRgeTool } from './lookup-rge'
import { searchRgeDefinition, searchRgeTool } from './search-rge'
import { getBaremeMprDefinition, getBaremeMprTool } from './get-bareme-mpr'
import { getAidesForGesteDefinition, getAidesForGesteTool } from './get-aides-for-geste'

/**
 * Static MCP tool registry. Order in TOOL_DEFINITIONS is the order
 * advertised to clients via `tools/list`. Keep it stable — many MCP
 * clients display tools in array order in their picker UI.
 */
export const TOOL_DEFINITIONS: ReadonlyArray<MCPToolDefinition> = [
  lookupRgeDefinition,
  searchRgeDefinition,
  getBaremeMprDefinition,
  getAidesForGesteDefinition,
]

export const TOOL_HANDLERS: Record<string, MCPToolHandler> = {
  lookup_rge: lookupRgeTool,
  search_rge: searchRgeTool,
  get_bareme_mpr: getBaremeMprTool,
  get_aides_for_geste: getAidesForGesteTool,
}
