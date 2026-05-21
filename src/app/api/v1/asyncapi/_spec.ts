/**
 * AsyncAPI 3.0.0 spec — ServicesArtisans RGE-OS events.
 *
 * Event-driven companion to the OpenAPI 3.1 contract
 * (`src/app/api/v1/openapi/_spec.ts`, Ralph 27). Describes the four
 * webhook events emitted by the SA RGE-OS pipeline (Ralph 24) so that
 * integration platforms (EventCatalog, AsyncAPI Studio, Postman events,
 * AsyncAPI Generator) can auto-generate documentation, types, and SDKs
 * for subscribers.
 *
 * Served by:
 *  - GET /api/v1/asyncapi/json — JSON form
 *  - GET /api/v1/asyncapi/yaml — YAML form (reuses Ralph 27 encoder)
 *
 * Versioning policy : no breaking change without bumping to `/api/v2/*`.
 *
 * License : CC-BY 4.0. Cite as "Source: ServicesArtisans".
 */

export const ASYNCAPI_SPEC = {
  asyncapi: '3.0.0',
  info: {
    title: 'ServicesArtisans RGE-OS Events',
    version: '1.0.0',
    description:
      'Event catalog for SA RGE-OS webhooks. Subscribers POST a URL via /api/v1/webhooks/subscribe and receive HMAC-SHA256 signed POST callbacks on the events below.',
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
  defaultContentType: 'application/json',
  servers: {
    production: {
      host: 'servicesartisans.fr',
      protocol: 'https',
      pathname: '/api/v1/webhooks',
      description: 'Production webhook delivery target (subscriber-provided URL).',
    },
  },
  channels: {
    'rge.snapshot.refreshed': {
      address: 'rge.snapshot.refreshed',
      title: 'RGE Snapshot Refreshed',
      description: 'Emitted after the weekly ADEME import completes successfully.',
      messages: {
        snapshotRefreshed: { $ref: '#/components/messages/RgeSnapshotRefreshed' },
      },
    },
    'rge.qualification.added': {
      address: 'rge.qualification.added',
      title: 'RGE Qualification Added',
      description: 'Emitted when a new active qualification is added to an existing provider.',
      messages: {
        qualificationAdded: { $ref: '#/components/messages/RgeQualificationAdded' },
      },
    },
    'aides.bareme.updated': {
      address: 'aides.bareme.updated',
      title: 'Aides Bareme Updated',
      description: 'Emitted when the deterministic MPR or CEE bareme is bumped to a new version.',
      messages: {
        baremeUpdated: { $ref: '#/components/messages/AidesBaremeUpdated' },
      },
    },
    'ai.transparency.updated': {
      address: 'ai.transparency.updated',
      title: 'AI Transparency Page Updated',
      description: 'Emitted when /transparence-ia is updated (new model, new agent, new policy).',
      messages: {
        transparencyUpdated: { $ref: '#/components/messages/AiTransparencyUpdated' },
      },
    },
  },
  operations: {
    receiveSnapshotRefreshed: {
      action: 'receive',
      channel: { $ref: '#/channels/rge.snapshot.refreshed' },
      summary: 'Subscriber receives RGE snapshot refresh notification',
      bindings: {
        http: {
          method: 'POST',
          headers: {
            type: 'object',
            properties: {
              'X-SA-Signature': {
                type: 'string',
                description: 'v1,t=<unix>,sig=<hex>',
              },
              'X-SA-Event': {
                type: 'string',
                const: 'rge.snapshot.refreshed',
              },
            },
          },
        },
      },
    },
    receiveQualificationAdded: {
      action: 'receive',
      channel: { $ref: '#/channels/rge.qualification.added' },
      summary: 'Subscriber receives new RGE qualification notification',
      bindings: { http: { method: 'POST' } },
    },
    receiveBaremeUpdated: {
      action: 'receive',
      channel: { $ref: '#/channels/aides.bareme.updated' },
      summary: 'Subscriber receives MPR/CEE bareme update notification',
      bindings: { http: { method: 'POST' } },
    },
    receiveTransparencyUpdated: {
      action: 'receive',
      channel: { $ref: '#/channels/ai.transparency.updated' },
      summary: 'Subscriber receives transparence-ia page update notification',
      bindings: { http: { method: 'POST' } },
    },
  },
  components: {
    messages: {
      RgeSnapshotRefreshed: {
        name: 'RgeSnapshotRefreshed',
        title: 'RGE Snapshot Refreshed',
        contentType: 'application/json',
        headers: { $ref: '#/components/schemas/WebhookHeaders' },
        payload: { $ref: '#/components/schemas/RgeSnapshotRefreshedPayload' },
      },
      RgeQualificationAdded: {
        name: 'RgeQualificationAdded',
        title: 'RGE Qualification Added',
        contentType: 'application/json',
        headers: { $ref: '#/components/schemas/WebhookHeaders' },
        payload: { $ref: '#/components/schemas/RgeQualificationAddedPayload' },
      },
      AidesBaremeUpdated: {
        name: 'AidesBaremeUpdated',
        title: 'Aides Bareme Updated',
        contentType: 'application/json',
        headers: { $ref: '#/components/schemas/WebhookHeaders' },
        payload: { $ref: '#/components/schemas/AidesBaremeUpdatedPayload' },
      },
      AiTransparencyUpdated: {
        name: 'AiTransparencyUpdated',
        title: 'AI Transparency Page Updated',
        contentType: 'application/json',
        headers: { $ref: '#/components/schemas/WebhookHeaders' },
        payload: { $ref: '#/components/schemas/AiTransparencyUpdatedPayload' },
      },
    },
    schemas: {
      WebhookHeaders: {
        type: 'object',
        properties: {
          'X-SA-Signature': {
            type: 'string',
            pattern: '^v1,t=\\d+,sig=[0-9a-f]{64}$',
            description:
              'HMAC-SHA256 signature per X-SA-Signature spec. Verify with crypto.timingSafeEqual within a 5-min replay window.',
          },
          'X-SA-Event': { type: 'string' },
          'User-Agent': { type: 'string', const: 'sa-rge-os-webhooks/0.1.0' },
        },
        required: ['X-SA-Signature', 'X-SA-Event'],
      },
      EnvelopeBase: {
        type: 'object',
        required: ['event', 'payload', 'ts'],
        properties: {
          event: { type: 'string' },
          ts: {
            type: 'integer',
            description: 'Unix seconds at time of dispatch from SA worker.',
          },
          payload: { type: 'object', additionalProperties: true },
        },
      },
      RgeSnapshotRefreshedPayload: {
        type: 'object',
        required: ['event', 'payload', 'ts'],
        properties: {
          event: { const: 'rge.snapshot.refreshed' },
          ts: { type: 'integer' },
          payload: {
            type: 'object',
            required: ['snapshot_date', 'providers_count', 'qualifications_count'],
            properties: {
              snapshot_date: { type: 'string', format: 'date' },
              providers_count: { type: 'integer', minimum: 0 },
              qualifications_count: { type: 'integer', minimum: 0 },
            },
          },
        },
      },
      RgeQualificationAddedPayload: {
        type: 'object',
        required: ['event', 'payload', 'ts'],
        properties: {
          event: { const: 'rge.qualification.added' },
          ts: { type: 'integer' },
          payload: {
            type: 'object',
            required: ['siret', 'qualif_code', 'date_debut'],
            properties: {
              siret: { type: 'string', pattern: '^[0-9]{14}$' },
              qualif_code: { type: 'string' },
              date_debut: { type: 'string', format: 'date' },
            },
          },
        },
      },
      AidesBaremeUpdatedPayload: {
        type: 'object',
        required: ['event', 'payload', 'ts'],
        properties: {
          event: { const: 'aides.bareme.updated' },
          ts: { type: 'integer' },
          payload: {
            type: 'object',
            required: ['aide', 'version_id', 'snapshot_date'],
            properties: {
              aide: { type: 'string', enum: ['maprimerenov', 'cee'] },
              version_id: { type: 'string' },
              snapshot_date: { type: 'string', format: 'date' },
            },
          },
        },
      },
      AiTransparencyUpdatedPayload: {
        type: 'object',
        required: ['event', 'payload', 'ts'],
        properties: {
          event: { const: 'ai.transparency.updated' },
          ts: { type: 'integer' },
          payload: {
            type: 'object',
            required: ['version', 'change_summary'],
            properties: {
              version: { type: 'string' },
              change_summary: { type: 'string' },
            },
          },
        },
      },
    },
    securitySchemes: {
      HmacSignature: {
        type: 'apiKey',
        in: 'header',
        name: 'X-SA-Signature',
        description:
          'HMAC-SHA256 of v1.<unix-ts>.<raw-body> using the per-webhook secret returned from /api/v1/webhooks/subscribe. Verify with crypto.timingSafeEqual within a 5-min replay window per RFC9421-inspired pattern.',
      },
    },
  },
} as const
