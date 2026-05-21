/**
 * GET /api/v1/aides/cumul-rules
 *
 * Sert la table `CUMUL_RULES_2026` (Ralph 14, `@/lib/cee`) :
 * quelle aide se cumule avec quelle aide, par geste. Réponse la plus
 * fréquemment demandée par les journalistes data et les particuliers.
 *
 * Cache : public, max-age=86400, swr=604800 (les règles de cumul évoluent au
 * mieux annuellement avec les arrêtés Coup de pouce).
 */

import { NextRequest, NextResponse } from 'next/server'

import { CUMUL_RULES_2026 } from '@/lib/cee'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'

import { jsonError } from '../_shared/error-response'
import { buildCumulDatasetSchema } from '../_shared/schema-org'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE_URL = 'https://servicesartisans.fr'
const SNAPSHOT_DATE = '2026-04-15'
const SOURCE_LABEL = 'Arrêtés Coup de pouce Chauffage/Isolation + Arrêté 22 décembre 2014 modifié'

const SUCCESS_HEADERS: Record<string, string> = {
  'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
  'X-Source': SOURCE_LABEL,
  'X-Snapshot-Date': SNAPSHOT_DATE,
  'X-License': 'CC-BY-4.0',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: SUCCESS_HEADERS })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-aides-cumul:${ip}`, {
      window: 60_000,
      max: 600,
      failOpen: true,
    })
    if (!rl.allowed) {
      return jsonError(429, 'too_many_requests', 'Limite 600 req/min/IP atteinte.')
    }

    const canonicalUrl = `${SITE_URL}/api/v1/aides/cumul-rules`

    const body = {
      ...buildCumulDatasetSchema(canonicalUrl),
      cumul_rules: CUMUL_RULES_2026,
      _meta: {
        api_version: 'v1',
        license: 'CC-BY-4.0',
        docs: `${SITE_URL}/developpeurs`,
        attribution: 'Source: ServicesArtisans + arrêtés Coup de pouce + Arrêté 22 déc 2014',
        snapshot_date: SNAPSHOT_DATE,
      },
    }

    return NextResponse.json(body, { status: 200, headers: SUCCESS_HEADERS })
  } catch (err) {
    logger.error('v1/aides/cumul-rules: error', err)
    captureError(err, { tags: { route: 'api/v1/aides/cumul-rules', critical: 'true' } })
    return jsonError(500, 'INTERNAL', 'Internal error serving cumul rules.')
  }
}
