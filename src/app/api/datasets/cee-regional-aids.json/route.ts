import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { openDataCorsPreflightResponse } from '@/lib/open-data/cors'
import { SITE_NAME, SITE_URL } from '@/lib/seo/config'
import {
  CEE_REGIONAL_DATASET_LICENSE,
  CEE_REGIONAL_DATASET_PATH,
  getCeeRegionalDatasetEntries,
  getCeeRegionalDatasetLastReviewedAt,
} from '@/lib/cee/regional-aids-dataset'

/**
 * /api/datasets/cee-regional-aids.json — Sprint AI Wave G 2026-05-03.
 *
 * Dataset open-data (CC-BY 4.0) des aides CEE régionales 2026 — 13 régions
 * métropole + Corse (DOM exclu : dispositif GUSE distinct). Pour chaque
 * région : zone climatique RT2012, mix résidentiel INSEE RP 2021, et liste
 * des aides régionales cumulables avec la prime CEE nationale (montant,
 * détail, URL source officielle).
 *
 * Format : JSON-LD avec Schema.org Dataset wrapper. Le tableau `data`
 * contient les 13 régions avec leur arborescence d'aides.
 *
 * SLA-99.9 (2026-05-06) : RL 60/min/IP fail-open + try/catch + Sentry capture
 * + fallback JSON minimal pour ne jamais renvoyer un 5xx à un crawler
 * data.gouv.fr / Wikipedia / journaliste data.
 */

// Edge runtime : sérialisation pure, pas d'I/O DB.
export const runtime = 'edge'

// 24h cache : barèmes régionaux mis à jour trimestriellement maximum.
export const revalidate = 86400

const JSON_HEADERS_OK = {
  'Content-Type': 'application/ld+json; charset=utf-8',
  'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
  'CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'X-Robots-Tag': 'noindex',
  'X-License': CEE_REGIONAL_DATASET_LICENSE,
}

export async function GET(request: Request): Promise<Response> {
  // SLA-99.9 : RL 60/min (dataset lourd) fail-open. data.gouv crawler doit
  // ne jamais être bloqué — l'objectif est de freiner un script qui martèle.
  try {
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`dataset-cee-json:${ip}`, {
      window: 60_000,
      max: 60,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const entries = getCeeRegionalDatasetEntries()
    const lastReviewedAt = getCeeRegionalDatasetLastReviewedAt()
    const canonicalUrl = `${SITE_URL}${CEE_REGIONAL_DATASET_PATH}`

    const datasetSchema = {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: 'Aides CEE régionales France 2026',
      description:
        'Inventaire structuré des aides régionales cumulables avec la prime CEE nationale pour la rénovation énergétique résidentielle. 13 régions métropole + Corse (DOM exclu : dispositif GUSE distinct). Pour chaque région : zone climatique RT2012 (qui module les forfaits CEE chauffage/isolation), mix résidentiel INSEE RP 2021, et chaque aide régionale avec montant, détail et URL officielle source.',
      url: canonicalUrl,
      license: CEE_REGIONAL_DATASET_LICENSE,
      isAccessibleForFree: true,
      creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      inLanguage: 'fr-FR',
      dateModified: lastReviewedAt,
      temporalCoverage: '2026-01-01/2026-12-31',
      spatialCoverage: {
        '@type': 'Place',
        name: 'France métropolitaine + Corse',
      },
      keywords: [
        'CEE',
        'certificats économies énergie',
        'aides régionales',
        'rénovation énergétique',
        "MaPrimeRénov'",
        'zone climatique',
        'RT2012',
        'INSEE',
      ],
      distribution: [
        {
          '@type': 'DataDownload',
          encodingFormat: 'application/ld+json',
          contentUrl: `${SITE_URL}/api/datasets/cee-regional-aids.json`,
          name: 'JSON-LD',
        },
        {
          '@type': 'DataDownload',
          encodingFormat: 'text/csv',
          contentUrl: `${SITE_URL}/api/datasets/cee-regional-aids.csv`,
          name: 'CSV (Excel-ready, BOM UTF-8)',
        },
      ],
      data: entries,
    }

    return new NextResponse(JSON.stringify(datasetSchema, null, 2) + '\n', {
      status: 200,
      headers: JSON_HEADERS_OK,
    })
  } catch (err) {
    // SLA-99.9 : fallback JSON minimal + 200 — dataset référencé par
    // data.gouv.fr ne doit jamais sortir en 5xx.
    logger.error('cee-regional-aids.json endpoint failed', err as Error)
    captureError(err, { tags: { route: 'api/datasets/cee-regional-aids.json', critical: 'true' } })
    return NextResponse.json(
      {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: 'Aides CEE régionales France 2026',
        license: CEE_REGIONAL_DATASET_LICENSE,
        data: [],
      },
      {
        status: 200,
        headers: { ...JSON_HEADERS_OK, 'Cache-Control': 'public, s-maxage=60' },
      }
    )
  }
}

export async function OPTIONS(): Promise<Response> {
  return openDataCorsPreflightResponse()
}
