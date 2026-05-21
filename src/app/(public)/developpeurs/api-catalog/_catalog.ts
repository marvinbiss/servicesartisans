/**
 * Source-of-truth pour la page `/developpeurs/api-catalog`.
 *
 * Liste exhaustive de toutes les surfaces publiques v1 RGE-OS :
 *   - REST + GraphQL + SPARQL + MCP
 *   - Webhooks (subscribe / unsubscribe / list / test)
 *   - SDK npm + CLI
 *   - Widget Embed
 *   - Specs Meta (OpenAPI 3.1 + AsyncAPI 3.0 + Health)
 *
 * Page consommatrice : `page.tsx` (server component, noindex + nofollow,
 * grandfathered dans `docs/ahrefs-first-grandfather.json` car
 * technique — pas une cible SEO).
 */

export type ApiCategory =
  | 'AI'
  | 'Aides'
  | 'RGE'
  | 'KG'
  | 'GraphQL'
  | 'MCP'
  | 'Webhooks'
  | 'Meta'
  | 'Streaming'
  | 'Embed'
  | 'SDK'
  | 'CLI'

export type ApiEntry = {
  id: string
  category: ApiCategory
  title: string
  description: string
  path: string
  methods: ReadonlyArray<'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS'>
  status: 'stable' | 'beta' | 'experimental'
  ralphRef?: string
  docsPath?: string
}

export const API_CATALOG: ReadonlyArray<ApiEntry> = [
  // AI
  {
    id: 'ask',
    category: 'AI',
    title: 'AnswerEngine',
    description:
      'POST une requête FR + contexte aides optionnel → réponse orchestrée avec citations, trace, Critic YMYL.',
    path: '/api/v1/ask',
    methods: ['POST', 'GET'],
    status: 'beta',
    ralphRef: 'Ralph 19',
    docsPath: '/docs/API-V1-ASK.md',
  },
  {
    id: 'ask-stream',
    category: 'Streaming',
    title: 'AnswerEngine SSE',
    description:
      'POST → text/event-stream. Events: start, groundtruth, chunk, critic, done, error, heartbeat.',
    path: '/api/v1/ask/stream',
    methods: ['POST', 'GET'],
    status: 'beta',
    ralphRef: 'Ralph 28',
    docsPath: '/docs/API-V1-ASK-STREAM.md',
  },

  // Aides
  {
    id: 'mpr-bareme',
    category: 'Aides',
    title: 'MaPrimeRénov 2026',
    description:
      'Calculator déterministe MPR. Inputs: geste, menage_categorie, zone, rfr, nb_personnes. CC-BY 4.0.',
    path: '/api/v1/aides/mpr-bareme',
    methods: ['GET'],
    status: 'stable',
    ralphRef: 'Ralph 16',
  },
  {
    id: 'cee-bareme',
    category: 'Aides',
    title: 'CEE 2026',
    description:
      'Calculator déterministe CEE. Inputs: geste, zone_climatique, type_logement, menage_categorie.',
    path: '/api/v1/aides/cee-bareme',
    methods: ['GET'],
    status: 'stable',
    ralphRef: 'Ralph 16',
  },
  {
    id: 'cumul-rules',
    category: 'Aides',
    title: 'Aides cumulability rules',
    description: 'Règles de cumul MPR + CEE + Eco-PTZ.',
    path: '/api/v1/aides/cumul-rules',
    methods: ['GET'],
    status: 'stable',
    ralphRef: 'Ralph 16',
  },

  // RGE
  {
    id: 'rge-lookup',
    category: 'RGE',
    title: 'Lookup RGE par SIRET',
    description: 'GET ?siret=14 chiffres → fiche RGE complète.',
    path: '/api/v1/rge/lookup',
    methods: ['GET'],
    status: 'stable',
  },
  {
    id: 'rge-search',
    category: 'RGE',
    title: 'Search RGE par métier + ville',
    description: 'GET ?metier=X&ville=Y[&limit=N] → liste paginée.',
    path: '/api/v1/rge/search',
    methods: ['GET'],
    status: 'stable',
  },

  // GraphQL
  {
    id: 'graphql',
    category: 'GraphQL',
    title: 'GraphQL-as-RPC',
    description:
      'POST {query} → exécute la requête sur les 5 root fields (rgeLookup, rgeSearch, mprBareme, ceeBareme, cumulRules).',
    path: '/api/v1/graphql',
    methods: ['POST', 'GET'],
    status: 'beta',
    ralphRef: 'Ralph 23',
  },

  // KG
  {
    id: 'sparql',
    category: 'KG',
    title: 'SPARQL Knowledge Graph',
    description: 'SPARQL 1.1 subset. GET ?query=... ou POST. Formats: json/csv/tsv/xml.',
    path: '/api/v1/kg/sparql',
    methods: ['GET', 'POST'],
    status: 'beta',
    ralphRef: 'Ralph 25',
  },
  {
    id: 'ontology',
    category: 'KG',
    title: 'SA-RGE Ontology',
    description: 'OWL ontology RGE en Turtle ou JSON-LD selon Accept header.',
    path: '/api/v1/kg/ontology',
    methods: ['GET'],
    status: 'stable',
    ralphRef: 'Ralph 25',
  },

  // MCP
  {
    id: 'mcp',
    category: 'MCP',
    title: 'Model Context Protocol',
    description: 'JSON-RPC 2.0 server. 6 tools pour agents Claude/Gemini/GPT.',
    path: '/api/v1/mcp',
    methods: ['POST'],
    status: 'beta',
    ralphRef: 'Ralph 11',
  },

  // Webhooks
  {
    id: 'webhooks-subscribe',
    category: 'Webhooks',
    title: 'Subscribe webhook',
    description: 'POST {url, email?, events[]} → 201 {id, secret, api_key}.',
    path: '/api/v1/webhooks/subscribe',
    methods: ['POST'],
    status: 'beta',
    ralphRef: 'Ralph 24',
  },
  {
    id: 'webhooks-unsubscribe',
    category: 'Webhooks',
    title: 'Unsubscribe webhook',
    description: 'DELETE {id, secret}.',
    path: '/api/v1/webhooks/unsubscribe',
    methods: ['DELETE'],
    status: 'beta',
    ralphRef: 'Ralph 24',
  },
  {
    id: 'webhooks-list',
    category: 'Webhooks',
    title: 'List webhooks',
    description: 'GET avec Authorization: Bearer <api_key>.',
    path: '/api/v1/webhooks/list',
    methods: ['GET'],
    status: 'beta',
    ralphRef: 'Ralph 24',
  },
  {
    id: 'webhooks-test',
    category: 'Webhooks',
    title: 'Test webhook delivery',
    description: 'POST {id, secret, event} → fire mock payload + record delivery.',
    path: '/api/v1/webhooks/test',
    methods: ['POST'],
    status: 'beta',
    ralphRef: 'Ralph 24',
  },

  // Meta
  {
    id: 'openapi-json',
    category: 'Meta',
    title: 'OpenAPI 3.1 spec (JSON)',
    description: 'Single source of truth contract. Postman/Insomnia/Bruno auto-import.',
    path: '/api/v1/openapi/json',
    methods: ['GET'],
    status: 'stable',
    ralphRef: 'Ralph 27',
    docsPath: '/docs/API-V1-OPENAPI.md',
  },
  {
    id: 'openapi-yaml',
    category: 'Meta',
    title: 'OpenAPI 3.1 spec (YAML)',
    description: 'YAML variant.',
    path: '/api/v1/openapi/yaml',
    methods: ['GET'],
    status: 'stable',
    ralphRef: 'Ralph 27',
  },
  {
    id: 'asyncapi-json',
    category: 'Meta',
    title: 'AsyncAPI 3.0 spec (JSON)',
    description: 'Events catalog pour webhooks. EventCatalog / AsyncAPI Studio import.',
    path: '/api/v1/asyncapi/json',
    methods: ['GET'],
    status: 'stable',
    ralphRef: 'Ralph 30',
    docsPath: '/docs/API-V1-ASYNCAPI.md',
  },
  {
    id: 'asyncapi-yaml',
    category: 'Meta',
    title: 'AsyncAPI 3.0 spec (YAML)',
    description: 'YAML variant.',
    path: '/api/v1/asyncapi/yaml',
    methods: ['GET'],
    status: 'stable',
    ralphRef: 'Ralph 30',
  },
  {
    id: 'health',
    category: 'Meta',
    title: 'Health check (shallow)',
    description: 'Uptime probe pour monitoring. Toujours 200 si la fonction Vercel répond.',
    path: '/api/v1/health',
    methods: ['GET', 'HEAD'],
    status: 'stable',
    ralphRef: 'Ralph 32',
  },
  {
    id: 'health-deep',
    category: 'Meta',
    title: 'Health check (deep)',
    description: 'Pings Supabase + Upstash + check LLM keys. 503 si fail.',
    path: '/api/v1/health/deep',
    methods: ['GET'],
    status: 'stable',
    ralphRef: 'Ralph 32',
  },

  // Embed
  {
    id: 'embed-rge',
    category: 'Embed',
    title: 'RGE search widget',
    description: 'Iframe-able search box pour intégration tiers (3 lignes HTML).',
    path: '/embed/rge',
    methods: ['GET'],
    status: 'stable',
    ralphRef: 'Ralph 21',
  },

  // SDK + CLI (off-platform)
  {
    id: 'sdk-ts',
    category: 'SDK',
    title: '@servicesartisans/rge-sdk',
    description: 'Typed npm client (Node 18+, MIT, zero-dep).',
    path: 'npm:@servicesartisans/rge-sdk',
    methods: [],
    status: 'beta',
    ralphRef: 'Ralph 22',
  },
  {
    id: 'cli',
    category: 'CLI',
    title: 'sa-rge-os CLI',
    description: 'Node 18+ CLI public (npm install -g sa-rge-os).',
    path: 'npm:sa-rge-os',
    methods: [],
    status: 'beta',
    ralphRef: 'Ralph 20',
  },
] as const

export const CATEGORY_ORDER: ReadonlyArray<ApiCategory> = [
  'AI',
  'Streaming',
  'Aides',
  'RGE',
  'GraphQL',
  'KG',
  'MCP',
  'Webhooks',
  'Embed',
  'Meta',
  'SDK',
  'CLI',
] as const

export function groupByCategory(): Map<ApiCategory, ApiEntry[]> {
  const map = new Map<ApiCategory, ApiEntry[]>()
  for (const entry of API_CATALOG) {
    const existing = map.get(entry.category) ?? []
    existing.push(entry)
    map.set(entry.category, existing)
  }
  return map
}
