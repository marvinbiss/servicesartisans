import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(__dirname, '..', '..')

describe('public/llms.txt', () => {
  const content = readFileSync(path.join(ROOT, 'public', 'llms.txt'), 'utf8')

  it('begins with site header per Anthropic spec', () => {
    expect(content).toMatch(/^# ServicesArtisans/)
  })

  it('declares post-Sprint-5 endpoints (OpenAPI, GeoJSON, MCP, ask)', () => {
    expect(content).toContain('/api/v1/openapi/json')
    expect(content).toContain('/api/v1/rge/geojson')
    expect(content).toContain('/api/v1/stats/department/{code}')
    expect(content).toContain('/api/v1/mcp')
    expect(content).toContain('/api/v1/ask')
  })

  it('mentions CC-BY 4.0 license + attribution', () => {
    expect(content).toMatch(/CC-BY 4\.0/i)
    expect(content).toMatch(/Source: ServicesArtisans/i)
  })

  it('mentions Bruno collection link for devs', () => {
    expect(content).toContain('bruno')
  })
})

describe('public/.well-known/ai-plugin.json', () => {
  const raw = readFileSync(path.join(ROOT, 'public', '.well-known', 'ai-plugin.json'), 'utf8')
  const parsed = JSON.parse(raw) as Record<string, unknown>

  it('is valid JSON', () => {
    expect(parsed).toBeTypeOf('object')
  })

  it('declares schema_version v1', () => {
    expect(parsed.schema_version).toBe('v1')
  })

  it('points api.url to current /api/v1/openapi/json (not stale /api/v1/openapi.json)', () => {
    const api = parsed.api as Record<string, unknown>
    expect(api.type).toBe('openapi')
    expect(api.url).toBe('https://servicesartisans.fr/api/v1/openapi/json')
  })

  it('description_for_model mentions RGE + ADEME + Etalab + CC-BY', () => {
    const desc = String(parsed.description_for_model ?? '')
    expect(desc).toMatch(/RGE/)
    expect(desc).toMatch(/ADEME/)
    expect(desc).toMatch(/Etalab/i)
    expect(desc).toMatch(/CC-BY/i)
  })

  it('auth is none (read-only public API)', () => {
    const auth = parsed.auth as Record<string, unknown>
    expect(auth.type).toBe('none')
  })

  it('mentions all 8 main endpoints in description_for_model', () => {
    const desc = String(parsed.description_for_model ?? '')
    expect(desc).toContain('/api/v1/rge/lookup')
    expect(desc).toContain('/api/v1/rge/search')
    expect(desc).toContain('/api/v1/rge/geojson')
    expect(desc).toContain('/api/v1/stats/department')
    expect(desc).toContain('/api/v1/aides/mpr-bareme')
    expect(desc).toContain('/api/v1/aides/cee-bareme')
    expect(desc).toContain('/api/v1/ask')
    expect(desc).toContain('/api/v1/mcp')
  })
})

describe('next.config.js rewrites — .well-known aliases', () => {
  const configRaw = readFileSync(path.join(ROOT, 'next.config.js'), 'utf8')

  it('rewrites /.well-known/openapi.yaml to /api/v1/openapi/yaml', () => {
    expect(configRaw).toMatch(
      /source:\s*['"]\/\.well-known\/openapi\.yaml['"]\s*,\s*destination:\s*['"]\/api\/v1\/openapi\/yaml['"]/
    )
  })

  it('rewrites /.well-known/openapi.json to /api/v1/openapi/json', () => {
    expect(configRaw).toMatch(
      /source:\s*['"]\/\.well-known\/openapi\.json['"]\s*,\s*destination:\s*['"]\/api\/v1\/openapi\/json['"]/
    )
  })
})
