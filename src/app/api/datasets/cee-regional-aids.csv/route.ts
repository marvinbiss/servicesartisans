import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'
import { openDataCorsPreflightResponse } from '@/lib/open-data/cors'
import { toCsvRow } from '@/lib/seo/csv'
import {
  CEE_REGIONAL_DATASET_LICENSE,
  getCeeRegionalAidsFlat,
} from '@/lib/cee/regional-aids-dataset'

/**
 * /api/datasets/cee-regional-aids.csv — Sprint AI Wave G 2026-05-03.
 *
 * Variante CSV plat (one-row-per-aid) du dataset JSON. Optimisé pour Excel /
 * data.gouv.fr / Power BI. Encoding UTF-8 + BOM pour les accents (é, à).
 * RFC 4180 compliant (CRLF, doublage des quotes internes).
 *
 * Mêmes garanties que /api/glossaire-rge.csv : Content-Disposition `inline`
 * (data.gouv.fr et Power BI URL-dataset refusent `attachment`).
 */

export const runtime = 'edge'
export const revalidate = 86400

const CSV_HEADER = [
  'region_slug',
  'region_name',
  'climate_zone',
  'pct_maisons_individuelles',
  'pct_construction_pre_1975',
  'aid_name',
  'aid_montant',
  'aid_detail',
  'aid_source_url',
  'last_reviewed_at',
]

export async function GET(): Promise<Response> {
  try {
    const rows = getCeeRegionalAidsFlat()

    const bom = String.fromCharCode(0xfeff)
    const headerRow = toCsvRow(CSV_HEADER)
    const dataRows = rows.map((r) =>
      toCsvRow([
        r.region_slug,
        r.region_name,
        r.climate_zone,
        String(r.pct_maisons_individuelles),
        String(r.pct_construction_pre_1975),
        r.aid_name,
        r.aid_montant,
        r.aid_detail,
        r.aid_source_url,
        r.last_reviewed_at,
      ])
    )

    const csv = bom + [headerRow, ...dataRows].join('\r\n') + '\r\n'

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'inline; filename="cee-regional-aids-servicesartisans.csv"',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        'CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'X-Robots-Tag': 'noindex',
        'X-License': CEE_REGIONAL_DATASET_LICENSE,
      },
    })
  } catch (err) {
    logger.error('cee-regional-aids.csv endpoint failed', err as Error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function OPTIONS(): Promise<Response> {
  return openDataCorsPreflightResponse()
}
