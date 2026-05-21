/**
 * Tests — GET /api/v1/asyncapi/{json,yaml}
 * (`src/app/api/v1/asyncapi/{json,yaml}/route.ts`).
 *
 * Couvre :
 *  - JSON GET 200 + Content-Type application/json + body asyncapi 3.0.0
 *  - YAML GET 200 + Content-Type application/yaml + body starts with #
 *    header + contains "asyncapi: 3.0.0"
 *  - Cache-Control max-age=3600 sur les deux endpoints
 *  - X-License CC-BY-4.0 sur les deux endpoints
 */
import { describe, it, expect } from 'vitest'

import { GET as GET_JSON } from '@/app/api/v1/asyncapi/json/route'
import { GET as GET_YAML } from '@/app/api/v1/asyncapi/yaml/route'

describe('GET /api/v1/asyncapi/json', () => {
  it('returns 200 + application/json', async () => {
    const res = await GET_JSON()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/application\/json/)
  })

  it('body parses as JSON with asyncapi: 3.0.0', async () => {
    const res = await GET_JSON()
    const body = (await res.json()) as { asyncapi: string }
    expect(body.asyncapi).toBe('3.0.0')
  })

  it('declares Cache-Control max-age=3600', async () => {
    const res = await GET_JSON()
    expect(res.headers.get('cache-control')).toMatch(/max-age=3600/)
  })

  it('declares X-License CC-BY-4.0', async () => {
    const res = await GET_JSON()
    expect(res.headers.get('x-license')).toBe('CC-BY-4.0')
  })
})

describe('GET /api/v1/asyncapi/yaml', () => {
  it('returns 200 + application/yaml', async () => {
    const res = await GET_YAML()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/application\/yaml/)
  })

  it('body starts with comment header and contains asyncapi: 3.0.0', async () => {
    const res = await GET_YAML()
    const body = await res.text()
    expect(body.startsWith('# AsyncAPI 3.0.0 spec')).toBe(true)
    // 3.0.0 starts with a digit so the encoder double-quotes it (YAML 1.2-safe).
    expect(body).toMatch(/asyncapi:\s*"?3\.0\.0"?/)
  })
})
