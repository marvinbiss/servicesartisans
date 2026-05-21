/**
 * Tests — GET /api/v1/kg/ontology route.
 *
 * Couvre :
 *  - Default Accept → JSON-LD
 *  - Accept: text/turtle → Turtle
 *  - Cache-Control 86400
 *  - X-License CC-BY-4.0
 *  - Turtle body contains expected class/property declarations
 */

import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'

import { GET } from '@/app/api/v1/kg/ontology/route'

const URL_BASE = 'https://servicesartisans.fr/api/v1/kg/ontology'

function buildGet(accept = ''): NextRequest {
  return new NextRequest(URL_BASE, {
    method: 'GET',
    headers: accept ? { accept } : {},
  })
}

describe('GET /api/v1/kg/ontology', () => {
  it('returns JSON-LD by default', async () => {
    const res = await GET(buildGet())
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/application\/ld\+json/)
    const body = (await res.json()) as { '@context': Record<string, string>; '@graph': unknown[] }
    expect(body['@context'].sa).toBe('https://servicesartisans.fr/ontology/rge#')
    expect(Array.isArray(body['@graph'])).toBe(true)
  })

  it('returns Turtle when Accept: text/turtle', async () => {
    const res = await GET(buildGet('text/turtle'))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/text\/turtle/)
    const body = await res.text()
    expect(body).toMatch(/@prefix sa:/)
    expect(body).toMatch(/sa:RgeProvider\s+a\s+owl:Class/)
    expect(body).toMatch(/sa:hasQualification/)
  })

  it('emits long cache and X-License headers', async () => {
    const res = await GET(buildGet())
    expect(res.headers.get('cache-control')).toMatch(/max-age=86400/)
    expect(res.headers.get('x-license')).toBe('CC-BY-4.0')
  })

  it('opens CORS', async () => {
    const res = await GET(buildGet())
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })
})
