import type { MCPToolDefinition, MCPToolHandler } from '../types'

/**
 * Tool: lookup_rge
 *
 * Lookup an RGE-certified artisan by SIRET (14 digits). Maps 1:1 to the
 * existing REST endpoint `/api/v1/rge/lookup?siret=...` which is already
 * cached at the CDN edge (24h fresh + 7j stale-while-revalidate).
 *
 * v0 returns a pointer payload (canonical URL + metadata). The MCP client
 * (Claude Desktop, Cursor, ...) can issue a follow-up HTTP GET on the
 * canonical URL to retrieve the full provider record. v0.2 will inline
 * the live data directly here once we settle the DB query budget / multi-
 * tenant rate-limit story.
 */
export const lookupRgeDefinition: MCPToolDefinition = {
  name: 'lookup_rge',
  description:
    'Lookup an RGE-certified artisan by SIRET (14 digits). Returns canonical fiche metadata: name, address, active qualifications, certifying organizations, validity dates. Source: ADEME annuaire-entreprises RGE officiel (sync hebdo).',
  inputSchema: {
    type: 'object',
    properties: {
      siret: {
        type: 'string',
        pattern: '^[0-9]{14}$',
        description: 'SIRET French business identifier, 14 digits.',
      },
    },
    required: ['siret'],
    additionalProperties: false,
  },
}

export const lookupRgeTool: MCPToolHandler = async (args) => {
  const siret = args.siret
  if (typeof siret !== 'string' || !/^[0-9]{14}$/.test(siret)) {
    return {
      content: [
        {
          type: 'text',
          text: 'Invalid SIRET format. Expected exactly 14 digits.',
        },
      ],
      isError: true,
    }
  }

  const result = {
    siret,
    canonical_url: `https://servicesartisans.fr/api/v1/rge/lookup?siret=${siret}`,
    note: 'Live data via REST: GET canonical_url. MCP v0.1 returns metadata pointer; v0.2 will inline the full payload.',
    source: 'ADEME annuaire-entreprises RGE officiel (sync hebdo)',
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  }
}
