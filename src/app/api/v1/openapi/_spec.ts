/**
 * OpenAPI 3.1 spec — ServicesArtisans RGE-OS public API.
 *
 * Single source of truth for the SA RGE-OS public API contract. Covers all
 * v1 endpoints (AI ask, MPR/CEE bareme calcs, RGE lookup+search, GraphQL,
 * SPARQL, ontology, MCP, webhooks) with JSON Schema definitions for
 * inputs/outputs.
 *
 * Served by:
 *  - GET /api/v1/openapi/json — JSON form
 *  - GET /api/v1/openapi/yaml — YAML form (hand-rolled encoder, zero deps)
 *
 * Versioning policy : no breaking change without bumping to `/api/v2/*`.
 * The `info.version` follows semver of the contract itself.
 *
 * License : CC-BY 4.0. Cite as "Source: ServicesArtisans".
 */

export const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'ServicesArtisans RGE-OS Public API',
    version: '1.0.0',
    description:
      "Open API contract for the SA RGE-OS open-data + AI stack. CC-BY 4.0 licensed; cite as 'Source: ServicesArtisans'.",
    contact: {
      name: 'ServicesArtisans',
      url: 'https://servicesartisans.fr/developpeurs',
      email: 'data@servicesartisans.fr',
    },
    license: {
      name: 'CC-BY 4.0',
      url: 'https://creativecommons.org/licenses/by/4.0/',
    },
    termsOfService: 'https://servicesartisans.fr/transparence-ia',
  },
  servers: [{ url: 'https://servicesartisans.fr', description: 'Production' }],
  externalDocs: {
    description: 'Developer hub',
    url: 'https://servicesartisans.fr/developpeurs',
  },
  tags: [
    { name: 'AI', description: 'AnswerEngine and orchestrated AI endpoints' },
    { name: 'Aides', description: 'Deterministic MPR/CEE/Eco-PTZ calculators' },
    { name: 'RGE', description: 'French RGE provider lookup and search' },
    { name: 'KG', description: 'Knowledge Graph (SPARQL + ontology)' },
    { name: 'GraphQL', description: 'GraphQL-as-RPC subset' },
    { name: 'MCP', description: 'Model Context Protocol JSON-RPC server' },
    { name: 'Webhooks', description: 'Event subscription pipeline' },
    { name: 'Stats', description: 'Aggregated public statistics (Schema.org Dataset)' },
    { name: 'Meta', description: 'OpenAPI spec, ontology, etc.' },
  ],
  paths: {
    '/api/v1/ask': {
      post: {
        tags: ['AI'],
        summary: 'AnswerEngine — orchestrated LLM + Critic + ground-truth response',
        description:
          'POST a French-language query plus optional aidesContext to get a structured answer with citations, trace, and (on YMYL) Critic verdict. Rate-limit 60/min/IP fail-open.',
        operationId: 'ask',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AskRequest' },
              examples: {
                simple: {
                  value: {
                    query: 'Quel est le bareme MaPrimeRenov pour une PAC air/eau ?',
                  },
                },
                withContext: {
                  value: {
                    query: 'Suis-je eligible MPR + CEE ?',
                    aidesContext: {
                      geste: 'pac_air_eau',
                      menageCategorie: 'modeste',
                      rfr: 25000,
                      nbPersonnes: 3,
                      zone: 'hors_idf',
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AskResponse' },
              },
            },
          },
          '400': {
            description: 'Bad Request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '422': {
            description: 'Critic blocked YMYL answer',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '429': {
            description: 'Rate limit',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '503': {
            description: 'AI service unavailable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Meta'],
        summary: 'Endpoint discovery metadata',
        operationId: 'askMeta',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/v1/aides/mpr-bareme': {
      get: {
        tags: ['Aides'],
        summary: 'Deterministic MaPrimeRenov 2026 bareme',
        operationId: 'mprBareme',
        parameters: [
          {
            name: 'geste',
            in: 'query',
            required: true,
            schema: { $ref: '#/components/schemas/Geste' },
          },
          {
            name: 'menage_categorie',
            in: 'query',
            required: true,
            schema: { $ref: '#/components/schemas/MenageCategorie' },
          },
          {
            name: 'zone',
            in: 'query',
            required: true,
            schema: { type: 'string', enum: ['idf', 'hors_idf'] },
          },
          {
            name: 'rfr',
            in: 'query',
            required: true,
            schema: { type: 'integer', minimum: 0 },
          },
          {
            name: 'nb_personnes',
            in: 'query',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MprBaremeResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '429': { description: 'Rate limit' },
        },
      },
    },
    '/api/v1/aides/cee-bareme': {
      get: {
        tags: ['Aides'],
        summary: 'Deterministic CEE 2026 bareme',
        operationId: 'ceeBareme',
        parameters: [
          {
            name: 'geste',
            in: 'query',
            required: true,
            schema: { $ref: '#/components/schemas/Geste' },
          },
          {
            name: 'zone_climatique',
            in: 'query',
            required: true,
            schema: { type: 'string', enum: ['H1', 'H2', 'H3'] },
          },
          {
            name: 'type_logement',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              enum: ['maison_individuelle', 'appartement'],
            },
          },
          {
            name: 'menage_categorie',
            in: 'query',
            required: true,
            schema: { $ref: '#/components/schemas/MenageCategorie' },
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CeeBaremeResponse' },
              },
            },
          },
          '400': { description: 'Validation error' },
          '429': { description: 'Rate limit' },
        },
      },
    },
    '/api/v1/aides/cumul-rules': {
      get: {
        tags: ['Aides'],
        summary: 'Aides cumulability rules (MPR + CEE + Eco-PTZ)',
        operationId: 'cumulRules',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/rge/lookup': {
      get: {
        tags: ['RGE'],
        summary: 'Lookup RGE provider by SIRET',
        operationId: 'rgeLookup',
        parameters: [
          {
            name: 'siret',
            in: 'query',
            required: true,
            schema: { type: 'string', pattern: '^[0-9]{14}$' },
          },
        ],
        responses: {
          '200': { description: 'OK' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/rge/search': {
      get: {
        tags: ['RGE'],
        summary: 'Search RGE providers by metier + ville',
        operationId: 'rgeSearch',
        parameters: [
          {
            name: 'metier',
            in: 'query',
            required: true,
            schema: { type: 'string', maxLength: 100 },
          },
          {
            name: 'ville',
            in: 'query',
            required: true,
            schema: { type: 'string', maxLength: 100 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 50 },
          },
        ],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/rge/geojson': {
      get: {
        tags: ['RGE'],
        summary: 'GeoJSON FeatureCollection of active RGE providers',
        description:
          'FeatureCollection of all RGE-active providers (qualification date_fin > now()). Designed for direct consumption by Mapbox/MapLibre/Leaflet. Includes per-feature qualifications array with code/nom/organisme/date_fin. Attribution Etalab 2.0 mandatory.',
        operationId: 'rgeGeoJson',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 5000, default: 1000 },
          },
          {
            name: 'offset',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 0, default: 0 },
          },
          {
            name: 'dept',
            in: 'query',
            required: false,
            description: 'INSEE department code 2-3 chars (75, 69, 2A, 974). Filters providers.',
            schema: { type: 'string', pattern: '^(2A|2B|\\d{2,3})$' },
          },
          {
            name: 'If-None-Match',
            in: 'header',
            required: false,
            description: 'ETag from previous response. Returns 304 if unchanged.',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'GeoJSON FeatureCollection',
            headers: {
              ETag: { schema: { type: 'string' } },
              'X-Total-Count': { schema: { type: 'integer' } },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RgeGeoJsonFeatureCollection' },
              },
            },
          },
          '304': { description: 'Not modified (ETag match)' },
          '429': { description: 'Rate-limited (600 req/min/IP).' },
          '500': { description: 'Database error.' },
        },
      },
    },
    '/api/v1/stats/department/{code}': {
      get: {
        tags: ['Stats'],
        summary: 'RGE statistics aggregated by INSEE department',
        description:
          'Schema.org Dataset partial with totalProviders, totalRgeActive, rgePenetration, topQualifications (top 5), avgRating, totalReviews. Distribution = JSON inline. License CC-BY 4.0. Designed for media citation + LLM reference.',
        operationId: 'statsDepartment',
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            description: 'INSEE department code (75, 69, 2A, 974).',
            schema: { type: 'string', pattern: '^(2A|2B|\\d{2,3})$' },
          },
        ],
        responses: {
          '200': {
            description: 'Department stats Dataset',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DepartmentStatsDataset' },
              },
            },
          },
          '400': { description: 'Invalid department code.' },
          '429': { description: 'Rate-limited (600 req/min/IP).' },
          '500': { description: 'Database error.' },
        },
      },
    },
    '/api/v1/graphql': {
      post: {
        tags: ['GraphQL'],
        summary: 'GraphQL-as-RPC subset',
        operationId: 'graphqlQuery',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { query: { type: 'string', maxLength: 8000 } },
                required: ['query'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'OK' },
          '400': { description: 'Parse error' },
          '429': { description: 'Rate limit' },
        },
      },
      get: {
        tags: ['GraphQL'],
        summary: 'Endpoint metadata + SDL preview',
        operationId: 'graphqlMeta',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/kg/sparql': {
      get: {
        tags: ['KG'],
        summary: 'SPARQL 1.1 subset query (GET form)',
        operationId: 'sparqlGet',
        parameters: [
          {
            name: 'query',
            in: 'query',
            required: true,
            schema: { type: 'string', maxLength: 4000 },
          },
          {
            name: 'format',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['json', 'csv', 'tsv', 'xml'] },
          },
        ],
        responses: { '200': { description: 'OK' } },
      },
      post: {
        tags: ['KG'],
        summary: 'SPARQL 1.1 subset query (POST form)',
        operationId: 'sparqlPost',
        requestBody: {
          required: true,
          content: {
            'application/sparql-query': { schema: { type: 'string' } },
            'application/x-www-form-urlencoded': {
              schema: {
                type: 'object',
                properties: { query: { type: 'string' } },
              },
            },
            'application/json': {
              schema: {
                type: 'object',
                properties: { query: { type: 'string' } },
              },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/kg/ontology': {
      get: {
        tags: ['KG'],
        summary: 'SA-RGE OWL ontology (Turtle or JSON-LD)',
        operationId: 'kgOntology',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/mcp': {
      post: {
        tags: ['MCP'],
        summary: 'Model Context Protocol JSON-RPC 2.0 server',
        operationId: 'mcpRpc',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', additionalProperties: true },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/webhooks/subscribe': {
      post: {
        tags: ['Webhooks'],
        summary: 'Subscribe to RGE-OS events',
        operationId: 'webhooksSubscribe',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WebhookSubscribeRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Created' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/api/v1/webhooks/unsubscribe': {
      delete: {
        tags: ['Webhooks'],
        summary: 'Unsubscribe',
        operationId: 'webhooksUnsubscribe',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  secret: { type: 'string' },
                },
                required: ['id', 'secret'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'OK' },
          '403': { description: 'Secret mismatch' },
        },
      },
    },
    '/api/v1/webhooks/list': {
      get: {
        tags: ['Webhooks'],
        summary: 'List webhooks by integrator',
        operationId: 'webhooksList',
        parameters: [
          {
            name: 'Authorization',
            in: 'header',
            required: true,
            schema: { type: 'string', pattern: '^Bearer ' },
          },
        ],
        responses: {
          '200': { description: 'OK' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/webhooks/test': {
      post: {
        tags: ['Webhooks'],
        summary: 'Fire test event payload',
        operationId: 'webhooksTest',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  secret: { type: 'string' },
                  event: { type: 'string' },
                },
                required: ['id', 'secret', 'event'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Delivered (or attempt logged)' },
          '403': { description: 'Secret mismatch' },
          '404': { description: 'Webhook not found' },
        },
      },
    },
    '/api/v1/openapi.json': {
      get: {
        tags: ['Meta'],
        summary: 'OpenAPI 3.1 spec (JSON)',
        operationId: 'openapiJson',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
        },
      },
    },
    '/api/v1/openapi.yaml': {
      get: {
        tags: ['Meta'],
        summary: 'OpenAPI 3.1 spec (YAML)',
        operationId: 'openapiYaml',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/yaml': { schema: { type: 'string' } },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      RgeGeoJsonFeatureCollection: {
        type: 'object',
        required: ['type', 'metadata', 'features'],
        properties: {
          type: { type: 'string', const: 'FeatureCollection' },
          metadata: {
            type: 'object',
            properties: {
              attribution: { type: 'string' },
              license: { type: 'string', format: 'uri' },
              source: { type: 'string', format: 'uri' },
              generatedAt: { type: 'string', format: 'date-time' },
              totalCount: { type: 'integer' },
              returnedCount: { type: 'integer' },
              limit: { type: 'integer' },
              offset: { type: 'integer' },
              deptFilter: { type: ['string', 'null'] },
            },
          },
          features: {
            type: 'array',
            items: {
              type: 'object',
              required: ['type', 'geometry', 'properties'],
              properties: {
                type: { type: 'string', const: 'Feature' },
                id: { type: 'string' },
                geometry: {
                  type: 'object',
                  required: ['type', 'coordinates'],
                  properties: {
                    type: { type: 'string', const: 'Point' },
                    coordinates: {
                      type: 'array',
                      minItems: 2,
                      maxItems: 2,
                      items: { type: 'number' },
                    },
                  },
                },
                properties: {
                  type: 'object',
                  properties: {
                    slug: { type: ['string', 'null'] },
                    name: { type: 'string' },
                    city: { type: ['string', 'null'] },
                    department: { type: ['string', 'null'] },
                    qualifications: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          code: { type: 'string' },
                          nom: { type: 'string' },
                          organisme: { type: 'string' },
                          date_fin: { type: 'string', format: 'date' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      DepartmentStatsDataset: {
        type: 'object',
        required: ['@context', '@type', 'name', 'stats', 'metadata'],
        properties: {
          '@context': { type: 'string', const: 'https://schema.org' },
          '@type': { type: 'string', const: 'Dataset' },
          '@id': { type: 'string', format: 'uri' },
          name: { type: 'string' },
          description: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          license: { type: 'string', format: 'uri' },
          creator: { type: 'object' },
          isBasedOn: { type: 'string', format: 'uri' },
          keywords: { type: 'array', items: { type: 'string' } },
          temporalCoverage: { type: 'string' },
          distribution: { type: 'array' },
          metadata: {
            type: 'object',
            properties: {
              attribution: { type: 'string' },
              generatedAt: { type: 'string', format: 'date-time' },
              departmentCode: { type: 'string' },
            },
          },
          stats: {
            type: 'object',
            required: ['totalProviders', 'totalRgeActive', 'rgePenetration'],
            properties: {
              totalProviders: { type: 'integer' },
              totalRgeActive: { type: 'integer' },
              rgePenetration: { type: 'number', minimum: 0, maximum: 1 },
              topQualifications: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    code: { type: 'string' },
                    count: { type: 'integer' },
                  },
                },
              },
              avgRating: { type: ['number', 'null'] },
              totalReviews: { type: 'integer' },
            },
          },
        },
      },
      Geste: {
        type: 'string',
        enum: [
          'pac_air_eau',
          'pac_geothermique',
          'pac_air_air',
          'chauffe_eau_thermo',
          'isolation_combles',
          'isolation_ite',
          'isolation_planchers_bas',
          'vmc_double_flux',
          'chaudiere_biomasse',
          'audit_energetique',
        ],
      },
      MenageCategorie: {
        type: 'string',
        enum: ['tres_modeste', 'modeste', 'intermediaire', 'superieur'],
      },
      AskRequest: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string', minLength: 1, maxLength: 4000 },
          classification: { type: 'string' },
          aidesContext: {
            type: 'object',
            properties: {
              geste: { $ref: '#/components/schemas/Geste' },
              menageCategorie: { $ref: '#/components/schemas/MenageCategorie' },
              rfr: { type: 'integer', minimum: 0 },
              nbPersonnes: { type: 'integer', minimum: 1 },
              zone: { type: 'string', enum: ['idf', 'hors_idf'] },
            },
            required: ['geste'],
          },
          citedSources: {
            type: 'array',
            maxItems: 20,
            items: {
              type: 'object',
              properties: {
                url: { type: 'string', format: 'uri' },
                title: { type: 'string' },
                retrievedAt: { type: 'string', format: 'date-time' },
              },
              required: ['url', 'title', 'retrievedAt'],
            },
          },
        },
      },
      AskResponse: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
              answer: { type: 'string' },
              citations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    url: { type: 'string' },
                    title: { type: 'string' },
                  },
                },
              },
              trace: { type: 'object', additionalProperties: true },
              reason: { type: 'string' },
            },
            required: ['ok'],
          },
          _meta: {
            type: 'object',
            properties: {
              api_version: { const: 'v1' },
              license: { const: 'CC-BY-4.0' },
              docs: { type: 'string' },
              disclosure: { type: 'string' },
            },
            required: ['api_version', 'license'],
          },
        },
      },
      MprBaremeResponse: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              eligible: { type: 'boolean' },
              montant_eur: { type: 'integer' },
              plafond_eur: { type: 'integer' },
              reason: { type: 'string' },
            },
          },
          input: { type: 'object', additionalProperties: true },
          _meta: { type: 'object', additionalProperties: true },
        },
      },
      CeeBaremeResponse: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              eligible: { type: 'boolean' },
              montant_eur: { type: 'integer' },
              reason: { type: 'string' },
            },
          },
          input: { type: 'object', additionalProperties: true },
          _meta: { type: 'object', additionalProperties: true },
        },
      },
      WebhookSubscribeRequest: {
        type: 'object',
        required: ['url', 'events'],
        properties: {
          url: { type: 'string', format: 'uri', maxLength: 500 },
          email: { type: 'string', format: 'email' },
          events: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'rge.snapshot.refreshed',
                'rge.qualification.added',
                'aides.bareme.updated',
                'ai.transparency.updated',
              ],
            },
            minItems: 1,
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              errors: {
                type: 'array',
                items: { type: 'object', additionalProperties: true },
              },
            },
            required: ['code', 'message'],
          },
          _meta: { type: 'object', additionalProperties: true },
        },
        required: ['error'],
      },
    },
  },
} as const

export type OpenApiSpec = typeof OPENAPI_SPEC
