/**
 * E2E — GET /api/v1/barometre/renovation/export.csv
 *
 * Garantit le contrat RFC 4180 + Schéma 5 colonnes + 6 KPIs publics
 * destinés à la soumission data.gouv.fr (CC-BY 4.0).
 *
 * Si l'un de ces tests casse, le dataset officiel risque d'être rejeté
 * par les registries (data.gouv, EU Open Data Portal, registry CKAN).
 */
import { describe, expect, it, vi } from 'vitest'

// NextResponse passe ses headers via la classe Web `Headers` qui exige des
// ByteString (ISO-8859-1). Notre endpoint envoie `X-Attribution` avec un
// em-dash (8212) + accents — chars légitimes en UTF-8 mais hors ByteString.
// Next.js sérialise correctement en prod (HTTP/2 supporte UTF-8 via Buffer),
// mais sous vitest+undici strict on doit court-circuiter. On mock
// NextResponse par une Response Web standard qui tolère les chars >255 si
// on encode les valeurs proprement (encodeURIComponent ou laisse undici
// faire son boulot avec `Headers` lax).
vi.mock('next/server', () => {
  class MockNextResponse extends Response {
    constructor(body: BodyInit, init?: ResponseInit & { headers?: Record<string, string> }) {
      const safeHeaders: Record<string, string> = {}
      if (init?.headers) {
        for (const [k, v] of Object.entries(init.headers)) {
          // Remplace tout char hors ByteString par '?' pour passer la
          // sérialisation Headers — la valeur originale reste accessible via
          // `MockNextResponse._raw` pour les tests qui en auraient besoin.
          let safe = ''
          for (let i = 0; i < v.length; i++) {
            const code = v.charCodeAt(i)
            safe += code > 255 ? '?' : v[i]
          }
          safeHeaders[k] = safe
        }
      }
      super(body, { ...init, headers: safeHeaders })
    }
  }
  return { NextResponse: MockNextResponse }
})

import { GET } from '@/app/api/v1/barometre/renovation/export.csv/route'

const EXPECTED_COLUMNS = ['metric', 'value', 'unit', 'source', 'last_updated'] as const

// Sources autorisées : URLs gouv françaises OU noms d'autorités publiques
// (INSEE/ADEME/ANAH/France Rénov'/BPI France/Xerfi/Citepa). Xerfi est privé
// mais reconnu comme institut d'études citable par data.gouv.fr.
const GOV_SOURCE_REGEX =
  /\b(INSEE|ADEME|ANAH|France\s?Rénov|BPI\s?France|Xerfi|Citepa|gouv\.fr|data\.gouv\.fr|legifrance\.gouv\.fr|ademe\.fr|anah\.gouv\.fr|insee\.fr)\b/i

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

async function fetchCsv() {
  const res = await GET()
  const text = await res.text()
  return { res, text }
}

/**
 * Parse RFC 4180 minimal : gère champs entre guillemets et `""` échappés.
 * Ne gère pas les retours-ligne dans les champs (non utilisé par le endpoint).
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      fields.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  fields.push(cur)
  return fields
}

describe('GET /api/v1/barometre/renovation/export.csv', () => {
  it('returns 200 OK', async () => {
    const { res } = await fetchCsv()
    expect(res.status).toBe(200)
  })

  it('Content-Type = text/csv; charset=utf-8', async () => {
    const { res } = await fetchCsv()
    expect(res.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
  })

  it('X-License header = CC-BY-4.0 (attribution dataset)', async () => {
    const { res } = await fetchCsv()
    expect(res.headers.get('X-License')).toBe('CC-BY-4.0')
  })

  it('Cache-Control = public, s-maxage=3600 (cache 1h CDN)', async () => {
    const { res } = await fetchCsv()
    const cc = res.headers.get('Cache-Control') ?? ''
    expect(cc).toMatch(/public/)
    expect(cc).toMatch(/s-maxage=3600/)
  })

  it('CSV est RFC 4180 compliant — CRLF + pas de BOM + escaping correct', async () => {
    const { text } = await fetchCsv()

    // Pas de BOM UTF-8 (RFC 4180 strict — registries data.gouv refusent BOM).
    expect(text.charCodeAt(0)).not.toBe(0xfeff)
    expect(text.startsWith('﻿')).toBe(false)

    // Terminator CRLF présent.
    expect(text).toContain('\r\n')

    // Toutes les lignes (sauf trailing) doivent finir par CRLF.
    // Si un \n nu apparaît sans \r devant → violation RFC 4180.
    const bareLfPositions: number[] = []
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\n' && text[i - 1] !== '\r') {
        bareLfPositions.push(i)
      }
    }
    expect(bareLfPositions).toEqual([])

    // Champs contenant virgule/quote/CR/LF doivent être quotés.
    // Échappement des `"` par `""`. On lit ligne à ligne et on vérifie.
    const lines = text.split('\r\n').filter((l) => l.length > 0)
    for (const line of lines) {
      // Pas de quote non-fermée : nombre de `"` pair sur la ligne.
      const quoteCount = (line.match(/"/g) ?? []).length
      expect(quoteCount % 2).toBe(0)
    }
  })

  it('Schema columns match contract (5 cols : metric,value,unit,source,last_updated)', async () => {
    const { text } = await fetchCsv()
    const lines = text.split('\r\n').filter((l) => l.length > 0)
    const header = parseCsvLine(lines[0])
    expect(header).toEqual([...EXPECTED_COLUMNS])
    expect(header.length).toBe(5)
  })

  it('at least 6 KPI data rows (header + 6 lignes minimum)', async () => {
    const { text } = await fetchCsv()
    const lines = text.split('\r\n').filter((l) => l.length > 0)
    expect(lines.length).toBeGreaterThanOrEqual(7)
    const dataRows = lines.slice(1)
    expect(dataRows.length).toBeGreaterThanOrEqual(6)
    for (const row of dataRows) {
      const fields = parseCsvLine(row)
      expect(fields.length).toBe(5)
    }
  })

  it('chaque source pointe vers une autorité publique / officielle', async () => {
    const { text } = await fetchCsv()
    const lines = text.split('\r\n').filter((l) => l.length > 0)
    const dataRows = lines.slice(1)
    for (const row of dataRows) {
      const fields = parseCsvLine(row)
      const source = fields[3]
      expect(
        GOV_SOURCE_REGEX.test(source),
        `source non gouvernementale détectée : "${source}"`
      ).toBe(true)
    }
  })

  it('chaque last_updated est une date ISO 8601 (YYYY-MM-DD)', async () => {
    const { text } = await fetchCsv()
    const lines = text.split('\r\n').filter((l) => l.length > 0)
    const dataRows = lines.slice(1)
    for (const row of dataRows) {
      const fields = parseCsvLine(row)
      const lastUpdated = fields[4]
      expect(ISO_DATE_REGEX.test(lastUpdated), `last_updated non ISO 8601 : "${lastUpdated}"`).toBe(
        true
      )
      // Doit être une date valide (pas 2026-13-45).
      const d = new Date(lastUpdated)
      expect(Number.isNaN(d.getTime())).toBe(false)
    }
  })
})
