import { describe, expect, it } from 'vitest'
import { OPENAPI_SPEC } from '@/app/api/v1/openapi/_spec'

describe('OpenAPI 3.1 spec — coverage', () => {
  it('declares OpenAPI 3.1 with required info', () => {
    expect(OPENAPI_SPEC.openapi).toBe('3.1.0')
    expect(OPENAPI_SPEC.info.title).toMatch(/ServicesArtisans/)
    expect(OPENAPI_SPEC.info.version).toBeTruthy()
    expect(OPENAPI_SPEC.info.license?.name).toBe('CC-BY 4.0')
  })

  it('declares production server', () => {
    expect(OPENAPI_SPEC.servers).toBeDefined()
    const prod = OPENAPI_SPEC.servers?.find((s) => s.url.includes('servicesartisans.fr'))
    expect(prod).toBeDefined()
  })

  it('covers Sprint 4 endpoints (geojson + stats/department)', () => {
    const paths = OPENAPI_SPEC.paths as Record<string, unknown>
    expect(paths['/api/v1/rge/geojson']).toBeDefined()
    expect(paths['/api/v1/stats/department/{code}']).toBeDefined()
  })

  it('covers core RGE + Aides + AI endpoints', () => {
    const paths = OPENAPI_SPEC.paths as Record<string, unknown>
    expect(paths['/api/v1/rge/lookup']).toBeDefined()
    expect(paths['/api/v1/rge/search']).toBeDefined()
    expect(paths['/api/v1/aides/mpr-bareme']).toBeDefined()
    expect(paths['/api/v1/aides/cee-bareme']).toBeDefined()
    expect(paths['/api/v1/ask']).toBeDefined()
    expect(paths['/api/v1/mcp']).toBeDefined()
  })

  it('declares Stats tag for new department endpoint', () => {
    const tags = (OPENAPI_SPEC.tags ?? []) as unknown as Array<{ name: string }>
    expect(tags.some((t) => t.name === 'Stats')).toBe(true)
  })

  it('declares schemas referenced by new endpoints', () => {
    const schemas = (OPENAPI_SPEC.components as { schemas: Record<string, unknown> }).schemas
    expect(schemas.RgeGeoJsonFeatureCollection).toBeDefined()
    expect(schemas.DepartmentStatsDataset).toBeDefined()
  })

  it('every path has at least one operation', () => {
    const paths = OPENAPI_SPEC.paths as Record<string, Record<string, unknown>>
    for (const [route, def] of Object.entries(paths)) {
      const verbs = Object.keys(def).filter((k) =>
        ['get', 'post', 'put', 'delete', 'patch'].includes(k)
      )
      expect(verbs.length, `path ${route} has no HTTP verb`).toBeGreaterThan(0)
    }
  })

  it('all geojson + stats operations declare 200 + error responses', () => {
    const paths = OPENAPI_SPEC.paths as Record<
      string,
      Record<string, { responses?: Record<string, unknown> }>
    >
    const geojsonResp = paths['/api/v1/rge/geojson']?.get?.responses ?? {}
    expect(geojsonResp['200']).toBeDefined()
    expect(geojsonResp['429']).toBeDefined()
    expect(geojsonResp['500']).toBeDefined()
    const statsResp = paths['/api/v1/stats/department/{code}']?.get?.responses ?? {}
    expect(statsResp['200']).toBeDefined()
    expect(statsResp['400']).toBeDefined()
    expect(statsResp['500']).toBeDefined()
  })

  it('spec serializes to valid JSON', () => {
    const serialized = JSON.stringify(OPENAPI_SPEC)
    expect(serialized.length).toBeGreaterThan(1000)
    const reparsed = JSON.parse(serialized)
    expect(reparsed.openapi).toBe('3.1.0')
  })
})
