import { describe, expect, it } from 'vitest'

import { GET as getJson, OPTIONS as optionsJson } from '../cee-regional-aids.json/route'
import { GET as getCsv, OPTIONS as optionsCsv } from '../cee-regional-aids.csv/route'

/**
 * Sprint AI Wave G 2026-05-03 — verrou endpoints open-data CEE régional.
 *
 * Garantit la stabilité du contrat HTTP que data.gouv.fr et les consommateurs
 * tiers (Power BI URL dataset, Looker, ETL académiques) attendent :
 *   - 200 OK sur GET (pas de 500 silencieux)
 *   - Content-Type stable (sinon les parsers tiers cassent)
 *   - Cache headers présents (CDN sain)
 *   - CORS `*` (consommation client-side autorisée)
 *   - X-License = CC-BY 4.0 (signal licence machine-readable)
 *   - X-Robots-Tag noindex (pages SERP via /datasets/cee-regional-aids)
 *   - OPTIONS preflight 204 + Allow-Methods correct
 *   - CSV : BOM UTF-8 + CRLF (interopérabilité Excel) + Content-Disposition `inline`
 *     (et NON `attachment` — data.gouv.fr / Power BI refusent attachment)
 */

describe('Sprint AI Wave G — /api/datasets/cee-regional-aids.json', () => {
  it('GET retourne 200 + Content-Type JSON-LD', async () => {
    const res = await getJson(
      new Request('https://servicesartisans.fr/api/datasets/cee-regional-aids.json')
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('application/ld+json')
  })

  it('expose les Schema.org Dataset wrapper + data array', async () => {
    const res = await getJson(
      new Request('https://servicesartisans.fr/api/datasets/cee-regional-aids.json')
    )
    const body = await res.json()
    expect(body['@context']).toBe('https://schema.org')
    expect(body['@type']).toBe('Dataset')
    expect(body.license).toBe('https://creativecommons.org/licenses/by/4.0/')
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })

  it('headers CDN + CORS + license corrects', async () => {
    const res = await getJson(
      new Request('https://servicesartisans.fr/api/datasets/cee-regional-aids.json')
    )
    expect(res.headers.get('cache-control')).toContain('s-maxage=86400')
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
    expect(res.headers.get('x-license')).toBe('https://creativecommons.org/licenses/by/4.0/')
    expect(res.headers.get('x-robots-tag')).toBe('noindex')
  })

  it('OPTIONS preflight 204', async () => {
    const res = await optionsJson()
    expect(res.status).toBe(204)
    expect(res.headers.get('access-control-allow-methods')).toContain('GET')
  })
})

describe('Sprint AI Wave G — /api/datasets/cee-regional-aids.csv', () => {
  it('GET retourne 200 + Content-Type text/csv', async () => {
    const res = await getCsv(
      new Request('https://servicesartisans.fr/api/datasets/cee-regional-aids.csv')
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/csv')
  })

  it('démarre par BOM UTF-8 (octets EF BB BF) — Excel-friendly accents', async () => {
    const res = await getCsv(
      new Request('https://servicesartisans.fr/api/datasets/cee-regional-aids.csv')
    )
    // `.text()` décode via TextDecoder qui strip silencieusement le BOM
    // (cf. WHATWG Encoding §6 ignoreBOM). On lit donc les bytes bruts.
    const buf = new Uint8Array(await res.arrayBuffer())
    expect(buf[0]).toBe(0xef)
    expect(buf[1]).toBe(0xbb)
    expect(buf[2]).toBe(0xbf)
  })

  it('utilise CRLF entre rangs (RFC 4180 + Excel Windows)', async () => {
    const res = await getCsv(
      new Request('https://servicesartisans.fr/api/datasets/cee-regional-aids.csv')
    )
    const body = await res.text()
    // Au moins un CRLF entre header et 1ère data row.
    expect(body.includes('\r\n')).toBe(true)
  })

  it('header CSV inclut tous les champs documentés', async () => {
    const res = await getCsv(
      new Request('https://servicesartisans.fr/api/datasets/cee-regional-aids.csv')
    )
    const body = await res.text()
    // `.text()` strip déjà le BOM (WHATWG Encoding §6) — split direct.
    const firstLine = body.split('\r\n')[0]
    expect(firstLine).toContain('region_slug')
    expect(firstLine).toContain('region_name')
    expect(firstLine).toContain('climate_zone')
    expect(firstLine).toContain('aid_source_url')
    expect(firstLine).toContain('last_reviewed_at')
  })

  it('Content-Disposition inline (PAS attachment — Power BI/data.gouv.fr)', async () => {
    const res = await getCsv(
      new Request('https://servicesartisans.fr/api/datasets/cee-regional-aids.csv')
    )
    const cd = res.headers.get('content-disposition')
    expect(cd).toBeTruthy()
    expect(cd).toContain('inline')
    expect(cd).not.toContain('attachment')
  })

  it('X-Robots-Tag noindex (asset technique)', async () => {
    const res = await getCsv(
      new Request('https://servicesartisans.fr/api/datasets/cee-regional-aids.csv')
    )
    expect(res.headers.get('x-robots-tag')).toBe('noindex')
  })

  it('OPTIONS preflight 204', async () => {
    const res = await optionsCsv()
    expect(res.status).toBe(204)
  })
})
