/**
 * GET /api/v1/aides/mpr-bareme
 *
 * Expose le calculator déterministe MaPrimeRénov' 2026 (Ralph 12 c60e95250)
 * en endpoint REST public CC-BY 4.0.
 *
 * Inputs (query params, tous obligatoires) :
 *   - geste            : voir `Geste` enum (`@/lib/aides`)
 *   - menage_categorie : enum MenageCategorie (laissé optionnel côté param —
 *                        la catégorie effective est dérivée de rfr/nbPersonnes/zone
 *                        par le calculator ; on n'utilise `menage_categorie`
 *                        que pour reconstruire l'URL canonique du payload)
 *   - zone             : 'idf' | 'hors_idf'
 *   - rfr              : entier >= 0 (Revenu Fiscal de Référence en EUR)
 *   - nb_personnes     : entier >= 1 (taille du foyer fiscal)
 *
 * Cache : public, max-age=3600, swr=86400 (barème stable jusqu'à révision ANAH).
 * Rate-limit : 600 req/min/IP fail-open (cf. memory upstash-rate-limit-fix).
 *
 * Payload : enveloppe Schema.org Dataset + `result` + `input` + `_meta`.
 */

import { NextRequest, NextResponse } from 'next/server'

import { computeMprAmount, type EligibilityInput } from '@/lib/aides'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'

import { jsonError } from '../_shared/error-response'
import { buildMprDatasetSchema } from '../_shared/schema-org'
import {
  validateGeste,
  validateMenageCat,
  validatePositiveInt,
  validateStrictPositiveInt,
  validateZone,
  type ValidationError,
} from '../_shared/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE_URL = 'https://servicesartisans.fr'
const SNAPSHOT_DATE = '2026-04-15'
const SOURCE_LABEL = 'ANAH/France-Renov 2026'

const SUCCESS_HEADERS: Record<string, string> = {
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
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
    // SLA-99.9 : RL public API 600/min/IP fail-open (Redis down ≠ self-DoS).
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-aides-mpr:${ip}`, {
      window: 60_000,
      max: 600,
      failOpen: true,
    })
    if (!rl.allowed) {
      return jsonError(429, 'too_many_requests', 'Limite 600 req/min/IP atteinte.')
    }

    const params = req.nextUrl.searchParams

    const gesteV = validateGeste(params.get('geste'))
    const menageCatV = validateMenageCat(params.get('menage_categorie'))
    const zoneV = validateZone(params.get('zone'))
    const rfrV = validatePositiveInt(params.get('rfr'), 'rfr')
    const nbPersV = validateStrictPositiveInt(params.get('nb_personnes'), 'nb_personnes')

    const errors: ValidationError[] = []
    if (!gesteV.ok) errors.push(gesteV.error)
    if (!menageCatV.ok) errors.push(menageCatV.error)
    if (!zoneV.ok) errors.push(zoneV.error)
    if (!rfrV.ok) errors.push(rfrV.error)
    if (!nbPersV.ok) errors.push(nbPersV.error)

    if (errors.length > 0) {
      return jsonError(400, 'INVALID_PARAMS', 'Query parameters validation failed', errors)
    }

    // Re-narrowing TypeScript post-aggregation (les 5 sont OK si on est ici).
    if (!gesteV.ok || !menageCatV.ok || !zoneV.ok || !rfrV.ok || !nbPersV.ok) {
      return jsonError(500, 'INTERNAL', 'unreachable')
    }

    const input: EligibilityInput = {
      geste: gesteV.value,
      rfr: rfrV.value,
      nbPersonnes: nbPersV.value,
      zone: zoneV.value,
    }
    const result = computeMprAmount(input)

    const canonicalUrl =
      `${SITE_URL}/api/v1/aides/mpr-bareme` +
      `?geste=${encodeURIComponent(gesteV.value)}` +
      `&menage_categorie=${encodeURIComponent(menageCatV.value)}` +
      `&zone=${encodeURIComponent(zoneV.value)}` +
      `&rfr=${rfrV.value}` +
      `&nb_personnes=${nbPersV.value}`

    const body = {
      ...buildMprDatasetSchema(canonicalUrl),
      result,
      input,
      _meta: {
        api_version: 'v1',
        license: 'CC-BY-4.0',
        docs: `${SITE_URL}/developpeurs`,
        attribution: 'Source: ServicesArtisans + ANAH MaPrimeRenov 2026',
        snapshot_date: SNAPSHOT_DATE,
      },
    }

    return NextResponse.json(body, { status: 200, headers: SUCCESS_HEADERS })
  } catch (err) {
    logger.error('v1/aides/mpr-bareme: error', err)
    captureError(err, { tags: { route: 'api/v1/aides/mpr-bareme', critical: 'true' } })
    return jsonError(500, 'INTERNAL', 'Internal error computing MPR bareme.')
  }
}
