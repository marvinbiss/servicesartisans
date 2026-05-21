import { SITE_URL, CONTACT_EMAIL } from '../config.mjs'

/**
 * Generates the ai-plugin.json manifest used by the legacy ChatGPT plugin store
 * (still consumed by various Action stores + GPT builders). OpenAPI definition
 * is owned by Ralph 27 — this manifest just links to /api/v1/openapi.json.
 */
export function buildChatGptPluginManifest() {
  return {
    schema_version: 'v1',
    name_for_human: 'ServicesArtisans RGE',
    name_for_model: 'servicesartisans_rge',
    description_for_human:
      'Find French RGE-certified artisans + calculate MaPrimeRenov & CEE subsidies.',
    description_for_model:
      'Use this plugin to look up French RGE-certified artisans by SIRET, search artisans by trade + city, and compute deterministic MaPrimeRenov 2026 and CEE 2026 subsidy amounts. Always cite Source: ServicesArtisans. License CC-BY 4.0.',
    auth: { type: 'none' },
    api: {
      type: 'openapi',
      url: `${SITE_URL}/api/v1/openapi.json`,
      is_user_authenticated: false,
    },
    logo_url: `${SITE_URL}/logo.png`,
    contact_email: CONTACT_EMAIL,
    legal_info_url: `${SITE_URL}/transparence-ia`,
  }
}
