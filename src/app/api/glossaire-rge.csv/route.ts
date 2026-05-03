import { NextResponse } from 'next/server'

import { SITE_URL } from '@/lib/seo/config'
import { getAllRgeGlossaryEntries } from '@/lib/seo/rge-qualifications-glossary'

/**
 * /api/glossaire-rge.csv — Sprint AF Ahrefs 2026-05-03.
 *
 * Variante CSV de Sprint AC `/api/glossaire-rge.json` pour les consommateurs
 * qui ne lisent pas JSON-LD :
 *
 *   - data.gouv.fr (datasets tabulaires + ouverture Excel/LibreOffice)
 *   - Tableurs métiers (gestionnaires CEE, BET, syndics)
 *   - Pipelines ETL académiques / journalistiques
 *   - Outils BI (Power BI, Tableau, Looker Studio import URL)
 *
 * Convention RFC 4180 :
 *   - Délimiteur virgule (`,`)
 *   - Quote `"` autour des valeurs contenant virgule, quote ou newline
 *   - Doublage des `"` internes (`"` → `""`)
 *   - Newlines `\r\n` (CRLF) entre rangs (interopérabilité Windows/Excel)
 *
 * Encoding : UTF-8 + BOM (3 octets EF BB BF, U+FEFF) pour qu'Excel ouvre
 * correctement les caractères accentués (é, è, à, ô) sans affichage cassé `Ã©`.
 *
 * Headers HTTP :
 *   - `Content-Type: text/csv; charset=utf-8`
 *   - `Content-Disposition: attachment; filename=...` (déclenche download)
 *   - Cache 24h CDN + SWR 7j (mêmes valeurs que JSON endpoint)
 *   - `X-Robots-Tag: noindex` (asset technique, pas page SERP)
 *   - `X-License: CC-BY 4.0`
 *   - CORS `*` pour fetch tiers
 */

// Edge runtime : pure computation (zéro I/O DB), latence minimale.
export const runtime = 'edge'

// ISR-style cache : revalidate 24h. Les 16 qualifications RGE sont stables.
export const revalidate = 86400

const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/'

const CSV_HEADER = ['slug', 'code', 'name', 'organisme', 'definition', 'term_code', 'canonical_url']

/**
 * Escape une valeur CSV selon RFC 4180.
 *
 * Quote la valeur si elle contient virgule, quote ou newline. Double les
 * quotes internes. Sinon retourne la valeur telle quelle.
 */
function escapeCsvField(value: string | undefined): string {
  const v = value ?? ''
  const needsQuote = /[",\r\n]/.test(v)
  if (!needsQuote) return v
  // Double les quotes internes puis quote la valeur entière.
  return `"${v.replace(/"/g, '""')}"`
}

function toCsvRow(fields: ReadonlyArray<string | undefined>): string {
  return fields.map(escapeCsvField).join(',')
}

export async function GET(): Promise<Response> {
  const entries = getAllRgeGlossaryEntries()

  // BOM UTF-8 : 3 octets (EF BB BF) encodés en U+FEFF (1 char UTF-16).
  // Indispensable pour qu'Excel reconnaisse l'encoding sans assistant import.
  // String.fromCharCode pour éviter d'embarquer un caractère invisible dans
  // le source (les éditeurs/outils strippent souvent le BOM literal).
  const bom = String.fromCharCode(0xfeff)

  const headerRow = toCsvRow(CSV_HEADER)

  const dataRows = entries.map((entry) => {
    const canonicalUrl = `${SITE_URL}/rge/glossaire#term-${entry.slug}`
    return toCsvRow([
      entry.slug,
      entry.code,
      entry.name,
      entry.organisme,
      entry.definition,
      entry.termCode,
      canonicalUrl,
    ])
  })

  // CRLF entre rangs (RFC 4180 + interopérabilité Excel Windows).
  const csv = bom + [headerRow, ...dataRows].join('\r\n') + '\r\n'

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      // Déclenche un download direct côté navigateur avec un nom de fichier
      // explicite (préférable à un viewer in-browser pour un asset open-data).
      'Content-Disposition': 'attachment; filename="glossaire-rge-servicesartisans.csv"',
      // Cache CDN 24h + stale-while-revalidate 7j. Cohérent avec /glossaire-rge.json.
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      'CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      // CORS permissif : asset open-data réutilisable par tiers.
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      // Asset technique, pas une page SERP. Le SEO se fait via /rge/glossaire.
      'X-Robots-Tag': 'noindex',
      // Hint dataset open-data pour crawlers spécialisés.
      'X-License': LICENSE_URL,
    },
  })
}

export async function OPTIONS(): Promise<NextResponse> {
  // CORS preflight pour les fetch JS depuis domaines tiers.
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Max-Age': '86400',
    },
  })
}
