import type { MCPToolDefinition, MCPToolHandler } from '../types'

/**
 * Tool: search_rge
 *
 * Search RGE-certified artisans by (ville, métier). Maps to the existing
 * REST endpoint `/api/v1/rge/search?city=...&q=...`. v0 returns a
 * canonical URL pointer; v0.2 will inline the top N results.
 */
export const searchRgeDefinition: MCPToolDefinition = {
  name: 'search_rge',
  description:
    'Search RGE-certified artisans by city and métier (specialty). Returns up to `limit` matches (default 10, max 50), ranked by RGE validity date. Source: ADEME annuaire-entreprises RGE officiel (sync hebdo).',
  inputSchema: {
    type: 'object',
    properties: {
      ville: {
        type: 'string',
        minLength: 1,
        maxLength: 80,
        description: 'French city name, e.g. "lyon", "marseille", "paris".',
      },
      metier: {
        type: 'string',
        minLength: 1,
        maxLength: 80,
        description:
          'Métier or RGE qualification, e.g. "pompe-a-chaleur", "chauffagiste-rge", "QualiPAC".',
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 50,
        default: 10,
        description: 'Maximum number of results to return (1-50).',
      },
    },
    required: ['ville', 'metier'],
    additionalProperties: false,
  },
}

const MAX_LIMIT = 50
const DEFAULT_LIMIT = 10

export const searchRgeTool: MCPToolHandler = async (args) => {
  const ville = typeof args.ville === 'string' ? args.ville.trim() : ''
  const metier = typeof args.metier === 'string' ? args.metier.trim() : ''
  const rawLimit = typeof args.limit === 'number' ? args.limit : DEFAULT_LIMIT

  if (ville.length === 0 || ville.length > 80) {
    return {
      content: [{ type: 'text', text: 'Invalid ville: must be 1-80 chars.' }],
      isError: true,
    }
  }
  if (metier.length === 0 || metier.length > 80) {
    return {
      content: [{ type: 'text', text: 'Invalid metier: must be 1-80 chars.' }],
      isError: true,
    }
  }
  const limit =
    Number.isFinite(rawLimit) && rawLimit >= 1 && rawLimit <= MAX_LIMIT
      ? Math.floor(rawLimit)
      : DEFAULT_LIMIT

  const params = new URLSearchParams({
    city: ville,
    q: metier,
    limit: String(limit),
  })
  const result = {
    ville,
    metier,
    limit,
    canonical_url: `https://servicesartisans.fr/api/v1/rge/search?${params.toString()}`,
    note: 'Live data via REST: GET canonical_url. MCP v0.1 returns metadata pointer; v0.2 will inline the top matches.',
    source: 'ADEME annuaire-entreprises RGE officiel (sync hebdo)',
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  }
}
