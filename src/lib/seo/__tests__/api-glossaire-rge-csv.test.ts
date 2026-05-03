import { describe, expect, it } from 'vitest'

import { GET, OPTIONS } from '@/app/api/glossaire-rge.csv/route'
import { getAllRgeGlossaryEntries } from '@/lib/seo/rge-qualifications-glossary'

/**
 * Sprint AF Ahrefs 2026-05-03 — verrou endpoint open-data /api/glossaire-rge.csv.
 *
 * Variante CSV de Sprint AC. Cible les consommateurs non-JSON :
 *   - data.gouv.fr (datasets tabulaires)
 *   - Tableurs Excel/LibreOffice (BOM UTF-8 obligatoire pour accents)
 *   - Pipelines ETL / outils BI
 *
 * Vérifications :
 *   - GET 200 + Content-Type text/csv
 *   - Content-Disposition attachment + filename
 *   - BOM UTF-8 en première position
 *   - Header CSV cohérent (7 colonnes)
 *   - 16 lignes de données (1 par term)
 *   - Escape RFC 4180 (virgule dans definition → quoted)
 *   - canonical_url contient `/rge/glossaire#term-` pour chaque ligne
 *   - Cache headers 24h SWR 7j cohérents avec endpoint JSON
 *   - CORS `*` + X-Robots-Tag noindex
 *   - OPTIONS preflight 204
 */

describe('Sprint AF — /api/glossaire-rge.csv open-data endpoint', () => {
  it('GET retourne 200 avec Content-Type text/csv; charset=utf-8', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const contentType = res.headers.get('Content-Type')
    expect(contentType).toContain('text/csv')
    expect(contentType).toContain('charset=utf-8')
  })

  it('Content-Disposition déclenche download avec filename explicite', async () => {
    const res = await GET()
    const cd = res.headers.get('Content-Disposition')
    expect(cd).toContain('attachment')
    expect(cd).toContain('filename="glossaire-rge-servicesartisans.csv"')
  })

  it('le body commence par le BOM UTF-8 (octets EF BB BF — Excel ouvre les accents correctement)', async () => {
    const res = await GET()
    // IMPORTANT : `.text()` décode via TextDecoder qui strip silencieusement
    // le BOM (cf. WHATWG Encoding §6 ignoreBOM). On lit donc les bytes bruts.
    const buf = new Uint8Array(await res.arrayBuffer())
    expect(buf[0]).toBe(0xef)
    expect(buf[1]).toBe(0xbb)
    expect(buf[2]).toBe(0xbf)
  })

  it('header CSV ligne 1 = slug,code,name,organisme,definition,term_code,canonical_url', async () => {
    const res = await GET()
    // `.text()` strip le BOM → split direct sur CRLF (pas de slice à faire).
    const body = await res.text()
    const lines = body.split('\r\n')
    expect(lines[0]).toBe('slug,code,name,organisme,definition,term_code,canonical_url')
  })

  it('contient 16 lignes de données (1 par qualification RGE)', async () => {
    const res = await GET()
    const body = await res.text()
    const expected = getAllRgeGlossaryEntries().length
    expect(expected).toBe(16)
    // BOM strip par TextDecoder + drop trailing CRLF + split. Ligne 0 = header.
    const lines = body.replace(/\r\n$/, '').split('\r\n')
    expect(lines.length).toBe(1 + expected)
  })

  it('escape RFC 4180 : les definitions contenant virgules sont quotées', async () => {
    const res = await GET()
    const body = await res.text()
    const lines = body.replace(/\r\n$/, '').split('\r\n')
    const dataLines = lines.slice(1)

    // Verrou ciblé : la définition de `qualipac` contient explicitement la
    // virgule "(air/eau, air/air)". Sa ligne CSV doit donc avoir au moins
    // un field quoté + le fragment exact `air/eau, air/air` survivant intact.
    const qualipacLine = dataLines.find((l) => l.startsWith('qualipac,'))
    expect(qualipacLine, 'pas de ligne qualipac trouvée').toBeDefined()
    expect(qualipacLine).toContain('"')
    expect(qualipacLine).toContain('air/eau, air/air')

    // Verrou structurel sur toutes les lignes : aucune quote orpheline.
    // Le nombre de `"` par ligne doit toujours être pair (toute ouverture
    // a sa fermeture — RFC 4180 §2.5).
    for (const line of dataLines) {
      const quoteCount = (line.match(/"/g) ?? []).length
      expect(quoteCount % 2, `nombre impair de quotes dans: ${line}`).toBe(0)
    }
  })

  it('chaque canonical_url pointe vers /rge/glossaire#term-<slug>', async () => {
    const res = await GET()
    const body = await res.text()
    const lines = body.replace(/\r\n$/, '').split('\r\n')
    const dataLines = lines.slice(1)
    for (const line of dataLines) {
      expect(line, `ligne sans canonical: ${line}`).toContain('/rge/glossaire#term-')
    }
  })

  it('headers cache CDN 24h + stale-while-revalidate 7j (cohérents avec /glossaire-rge.json)', async () => {
    const res = await GET()
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=86400')
    expect(res.headers.get('Cache-Control')).toContain('stale-while-revalidate=604800')
    expect(res.headers.get('CDN-Cache-Control')).toContain('s-maxage=86400')
    expect(res.headers.get('CDN-Cache-Control')).toContain('stale-while-revalidate=604800')
  })

  it("CORS permissif : Access-Control-Allow-Origin '*'", async () => {
    const res = await GET()
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET')
  })

  it("X-Robots-Tag 'noindex' (asset technique, pas page SERP)", async () => {
    const res = await GET()
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex')
  })

  it('X-License hint open-data CC-BY 4.0', async () => {
    const res = await GET()
    expect(res.headers.get('X-License')).toBe('https://creativecommons.org/licenses/by/4.0/')
  })

  it('OPTIONS preflight retourne 204 avec headers CORS', async () => {
    const res = await OPTIONS()
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET')
    expect(res.headers.get('Access-Control-Max-Age')).toBe('86400')
  })
})
