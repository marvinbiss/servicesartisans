import { SITE_URL, ORG_NAME, CONTACT_EMAIL } from '../config.mjs'

/**
 * Builds the application JSON used to submit the SA MCP server to Anthropic's
 * MCP registry (still beta as of 2026-05). Endpoint shape inspired by the
 * official MCP servers index repo.
 */
export function buildMcpRegistryApplication() {
  return {
    name: 'servicesartisans-rge',
    title: 'ServicesArtisans RGE-OS MCP Server',
    description:
      'MCP server exposing French RGE provider lookup, MaPrimeRenov & CEE bareme calculators, and AnswerEngine.',
    org: ORG_NAME,
    homepage: SITE_URL,
    endpoint: `${SITE_URL}/api/v1/mcp`,
    transport: 'http',
    protocol_version: '2025-03-26',
    license: 'CC-BY-4.0',
    tags: ['rge', 'french-data', 'renovation', 'open-data'],
    auth: 'none',
    rate_limit: '60/min/IP',
    contact: { email: CONTACT_EMAIL },
    tools_count: 6,
    safety_disclosure: `${SITE_URL}/transparence-ia`,
  }
}
