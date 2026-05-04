/**
 * Open-data CORS helpers — Sprint AI Ahrefs 2026-05-03.
 *
 * Module leaf (zéro import) pour les handlers OPTIONS preflight des endpoints
 * open-data CC-BY 4.0 (Sprints AC `/api/glossaire-rge.json` + AF `/api/glossaire-rge.csv`).
 *
 * Avant Sprint AI, le handler OPTIONS était dupliqué octet-pour-octet entre
 * les 2 routes. Tout futur endpoint open-data réutilise cette helper.
 *
 * Edge-safe : pas d'import Node, retourne une `Response` standard Web API.
 */

export function openDataCorsPreflightResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Max-Age': '86400',
    },
  })
}
