/**
 * Tests — OPENAPI_SPEC structure + endpoint coverage
 * (`src/app/api/v1/openapi/_spec.ts`).
 *
 * Couvre :
 *  - version 3.1.0
 *  - title contient "ServicesArtisans"
 *  - license CC-BY 4.0
 *  - 13 endpoints attendus présents dans paths
 *  - schemas obligatoires présents
 *  - Geste enum = 10 valeurs
 *  - MenageCategorie enum = 4 valeurs
 *  - /api/v1/ask post responses inclut 200/400/422/429/503
 */
import { describe, it, expect } from 'vitest'

import { OPENAPI_SPEC } from '@/app/api/v1/openapi/_spec'

describe('OPENAPI_SPEC — meta', () => {
  it('declares OpenAPI 3.1.0', () => {
    expect(OPENAPI_SPEC.openapi).toBe('3.1.0')
  })

  it('info.title mentions ServicesArtisans', () => {
    expect(OPENAPI_SPEC.info.title).toMatch(/ServicesArtisans/i)
  })

  it('declares CC-BY 4.0 license', () => {
    expect(OPENAPI_SPEC.info.license.name).toBe('CC-BY 4.0')
  })
})

describe('OPENAPI_SPEC — endpoint coverage', () => {
  it('exposes all 13 v1 endpoints in paths', () => {
    const expected = [
      '/api/v1/ask',
      '/api/v1/aides/mpr-bareme',
      '/api/v1/aides/cee-bareme',
      '/api/v1/aides/cumul-rules',
      '/api/v1/rge/lookup',
      '/api/v1/rge/search',
      '/api/v1/graphql',
      '/api/v1/kg/sparql',
      '/api/v1/kg/ontology',
      '/api/v1/mcp',
      '/api/v1/webhooks/subscribe',
      '/api/v1/webhooks/unsubscribe',
      '/api/v1/webhooks/list',
      '/api/v1/webhooks/test',
      '/api/v1/openapi.json',
      '/api/v1/openapi.yaml',
    ]
    const pathKeys = Object.keys(OPENAPI_SPEC.paths)
    for (const path of expected) {
      expect(pathKeys).toContain(path)
    }
    expect(pathKeys.length).toBeGreaterThanOrEqual(13)
  })

  it('/api/v1/ask post declares 200, 400, 422, 429, 503 response codes', () => {
    const askPost = OPENAPI_SPEC.paths['/api/v1/ask'].post
    const codes = Object.keys(askPost.responses)
    expect(codes).toContain('200')
    expect(codes).toContain('400')
    expect(codes).toContain('422')
    expect(codes).toContain('429')
    expect(codes).toContain('503')
  })
})

describe('OPENAPI_SPEC — components.schemas', () => {
  it('exposes the canonical request/response schemas', () => {
    const schemas = OPENAPI_SPEC.components.schemas
    expect(schemas).toHaveProperty('AskRequest')
    expect(schemas).toHaveProperty('AskResponse')
    expect(schemas).toHaveProperty('ErrorResponse')
    expect(schemas).toHaveProperty('Geste')
    expect(schemas).toHaveProperty('MenageCategorie')
  })

  it('Geste enum lists exactly 10 supported gestures', () => {
    expect(OPENAPI_SPEC.components.schemas.Geste.enum.length).toBe(10)
  })

  it('MenageCategorie enum lists exactly 4 categories', () => {
    expect(OPENAPI_SPEC.components.schemas.MenageCategorie.enum.length).toBe(4)
  })
})
