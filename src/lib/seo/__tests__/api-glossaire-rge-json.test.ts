import { describe, expect, it } from 'vitest'

import { GET, OPTIONS } from '@/app/api/glossaire-rge.json/route'

/**
 * Sprint AC Ahrefs 2026-05-03 — verrou endpoint open-data /api/glossaire-rge.json.
 *
 * Asset open-data CC-BY 4.0 destiné à être référencé par data.gouv.fr,
 * Wikipedia, journalistes et devs tiers. Le shape, les headers cache et
 * les CORS doivent rester stables — toute régression brise les intégrations
 * externes.
 *
 * Vérifications :
 *   - GET retourne 200 + JSON-LD valide (DefinedTermSet + 16 termes)
 *   - License CC-BY 4.0 explicite
 *   - Headers cache + CORS + noindex
 *   - OPTIONS preflight réponds 204 avec headers CORS
 *   - distribution.contentUrl = self URL (canonical asset)
 */
describe('Sprint AC — /api/glossaire-rge.json open-data endpoint', () => {
  it('GET retourne 200 avec Content-Type application/ld+json', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('application/ld+json')
  })

  it('payload contient DefinedTermSet + 16 DefinedTerm', async () => {
    const res = await GET()
    const body = (await res.json()) as Record<string, unknown>
    expect(body['@context']).toBe('https://schema.org')
    expect(body['@type']).toBe('DefinedTermSet')
    const terms = body.hasDefinedTerm as Array<Record<string, unknown>>
    expect(Array.isArray(terms)).toBe(true)
    expect(terms.length).toBe(16)
  })

  it('payload contient license CC-BY 4.0 explicite', async () => {
    const res = await GET()
    const body = (await res.json()) as Record<string, unknown>
    expect(body.license).toBe('https://creativecommons.org/licenses/by/4.0/')
  })

  it('payload contient creator Organization ServicesArtisans', async () => {
    const res = await GET()
    const body = (await res.json()) as Record<string, unknown>
    const creator = body.creator as Record<string, unknown>
    expect(creator['@type']).toBe('Organization')
    expect(creator.name).toBe('ServicesArtisans')
    expect(typeof creator.url).toBe('string')
  })

  it('payload contient distribution avec contentUrl self-référent', async () => {
    const res = await GET()
    const body = (await res.json()) as Record<string, unknown>
    const distribution = body.distribution as Record<string, unknown>
    expect(distribution['@type']).toBe('DataDownload')
    expect(distribution.encodingFormat).toBe('application/ld+json')
    expect(distribution.contentUrl).toContain('/api/glossaire-rge.json')
  })

  it('payload contient isBasedOn (sources officielles ADEME / France Rénov)', async () => {
    const res = await GET()
    const body = (await res.json()) as Record<string, unknown>
    const sources = body.isBasedOn as string[]
    expect(Array.isArray(sources)).toBe(true)
    expect(sources.some((s) => s.includes('france-renov.gouv.fr'))).toBe(true)
    expect(sources.some((s) => s.includes('annuaire-rge.ademe.fr'))).toBe(true)
  })

  it('headers cache CDN 24h + stale-while-revalidate 7j', async () => {
    const res = await GET()
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=86400')
    expect(res.headers.get('Cache-Control')).toContain('stale-while-revalidate=604800')
    expect(res.headers.get('CDN-Cache-Control')).toContain('s-maxage=86400')
  })

  it("CORS permissif : Access-Control-Allow-Origin '*'", async () => {
    const res = await GET()
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it("X-Robots-Tag 'noindex' (asset technique, pas page SERP)", async () => {
    const res = await GET()
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex')
  })

  it('OPTIONS preflight retourne 204 avec headers CORS', async () => {
    const res = await OPTIONS()
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET')
    expect(res.headers.get('Access-Control-Max-Age')).toBe('86400')
  })

  it('chaque term garde son @id canonique pointant vers /rge/glossaire#term-<slug>', async () => {
    const res = await GET()
    const body = (await res.json()) as Record<string, unknown>
    const terms = body.hasDefinedTerm as Array<Record<string, unknown>>
    for (const t of terms) {
      const id = t['@id'] as string
      expect(id).toContain('/rge/glossaire#term-')
    }
  })
})
