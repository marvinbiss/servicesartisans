import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'
import { openDataCorsPreflightResponse } from '@/lib/open-data/cors'
import { toCsvRow } from '@/lib/seo/csv'
import { SITE_URL } from '@/lib/seo/config'
import { getAllRgeGlossaryEntries, RGE_GLOSSAIRE_PATH } from '@/lib/seo/rge-qualifications-glossary'

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

// Sprint AI Ahrefs 2026-05-03 — `escapeCsvField` + `toCsvRow` extraits vers
// `@/lib/seo/csv` (Next.js App Router refuse tout export non-handler dans
// route.ts → DEPLOY BLOCKED découvert par audit Build). Module dédié leaf,
// edge-safe, importable depuis tests sans contrainte route handler.

export async function GET(): Promise<Response> {
  // Sprint AI Ahrefs 2026-05-03 — wrap try/catch + logger.error (Adversarial #19).
  try {
    const entries = getAllRgeGlossaryEntries()

    // BOM UTF-8 : 3 octets (EF BB BF) encodés en U+FEFF (1 char UTF-16).
    // Indispensable pour qu'Excel reconnaisse l'encoding sans assistant import.
    // String.fromCharCode pour éviter d'embarquer un caractère invisible dans
    // le source (les éditeurs/outils strippent souvent le BOM literal).
    const bom = String.fromCharCode(0xfeff)

    const headerRow = toCsvRow(CSV_HEADER)

    const dataRows = entries.map((entry) => {
      const canonicalUrl = `${SITE_URL}${RGE_GLOSSAIRE_PATH}#term-${entry.slug}`
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
        // Sprint AI Ahrefs 2026-05-03 (Reviewer agent H3) — `inline` au lieu
        // de `attachment` : data.gouv.fr et certains parseurs (Power BI URL
        // dataset, Looker Studio) refusent les URLs CSV en mode `attachment`
        // car ils preview/parse le contenu before download. Le filename hint
        // reste ; l'utilisateur final peut Save-As manuellement.
        'Content-Disposition': 'inline; filename="glossaire-rge-servicesartisans.csv"',
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
  } catch (err) {
    logger.error('glossaire-rge.csv endpoint failed', err as Error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function OPTIONS(): Promise<Response> {
  // Sprint AI Ahrefs 2026-05-03 — handler partagé via `openDataCorsPreflightResponse`
  // (déduplication avec /api/glossaire-rge.json).
  return openDataCorsPreflightResponse()
}
