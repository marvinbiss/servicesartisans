import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import DevelopersHubPage, { generateMetadata } from '@/app/(public)/developpeurs/page'

describe('/developpeurs hub page', () => {
  it('declares H1 with primary KW "API RGE France"', () => {
    const html = renderToStaticMarkup(<DevelopersHubPage />)
    expect(html).toMatch(/API RGE France/)
    expect(html).toMatch(/OpenAPI 3\.1/)
  })

  it('mentions all Sprint 4-6 surfaces in cards', () => {
    const html = renderToStaticMarkup(<DevelopersHubPage />)
    expect(html).toContain('GeoJSON RGE')
    expect(html).toContain('Stats département')
    expect(html).toContain('MCP server')
    expect(html).toContain('Bruno collection')
    expect(html).toContain('ChatGPT Action')
  })

  it('lists 10+ endpoints with method + path', () => {
    const html = renderToStaticMarkup(<DevelopersHubPage />)
    expect(html).toContain('/api/v1/rge/lookup')
    expect(html).toContain('/api/v1/rge/search')
    expect(html).toContain('/api/v1/rge/geojson')
    expect(html).toContain('/api/v1/stats/department')
    expect(html).toContain('/api/v1/aides/mpr-bareme')
    expect(html).toContain('/api/v1/aides/cee-bareme')
    expect(html).toContain('/api/v1/ask')
    expect(html).toContain('/api/v1/mcp')
    expect(html).toContain('/api/v1/openapi/json')
    expect(html).toContain('/api/v1/asyncapi/json')
  })

  it('fixed broken /api/v1/openapi.yaml link (was 404)', () => {
    const html = renderToStaticMarkup(<DevelopersHubPage />)
    expect(html).not.toMatch(/href="[^"]*\/api\/v1\/openapi\.yaml[^/]/)
    expect(html).toContain('/api/v1/openapi/json')
  })

  it('Bruno collection points to GitHub docs/api/bruno', () => {
    const html = renderToStaticMarkup(<DevelopersHubPage />)
    expect(html).toMatch(
      /github\.com\/marvinbiss\/servicesartisans\/tree\/master\/docs\/api\/bruno/
    )
  })

  it('cites ADEME + Etalab 2.0 + CC-BY 4.0', () => {
    const html = renderToStaticMarkup(<DevelopersHubPage />)
    expect(html).toMatch(/ADEME/)
    expect(html).toMatch(/Etalab/i)
    expect(html).toMatch(/CC-BY/i)
  })

  it('emits 4 JSON-LD blocks (Breadcrumb + WebAPI + Service + SoftwareApplication)', () => {
    const html = renderToStaticMarkup(<DevelopersHubPage />)
    expect(html).toContain('"@type":"BreadcrumbList"')
    expect(html).toContain('"@type":"WebAPI"')
    expect(html).toContain('"@type":"Service"')
    expect(html).toContain('"@type":"SoftwareApplication"')
  })

  it('SoftwareApplication declares free offer + CC-BY 4.0', () => {
    const html = renderToStaticMarkup(<DevelopersHubPage />)
    expect(html).toMatch(/"price":"0"/)
    expect(html).toMatch(/"priceCurrency":"EUR"/)
    expect(html).toContain('creativecommons.org/licenses/by/4.0')
  })

  it('metadata title contains primary + secondary KWs', async () => {
    const meta = await generateMetadata()
    const title = String(meta.title ?? '')
    expect(title).toMatch(/API RGE France/)
    expect(title).toMatch(/OpenAPI 3\.1/)
    expect(title).toMatch(/MCP/)
    expect(title).toMatch(/CC-BY 4\.0/)
  })

  it('metadata description mentions key endpoints and license', async () => {
    const meta = await generateMetadata()
    const desc = String(meta.description ?? '')
    expect(desc).toMatch(/49 228/)
    expect(desc).toMatch(/CC-BY 4\.0/i)
    expect(desc).toMatch(/MCP/)
    expect(desc).toMatch(/MaPrimeRénov/)
  })
})
