/**
 * GET /api/v1/aides/cee-bareme
 *
 * Expose le calculator déterministe CEE 2026 (Ralph 14 26c190d4f) en
 * endpoint REST public CC-BY 4.0.
 *
 * Inputs (query params, tous obligatoires) :
 *   - geste            : voir `Geste` enum (`@/lib/aides`)
 *   - zone_climatique  : 'H1' | 'H2' | 'H3'
 *   - type_logement    : 'maison_individuelle' | 'appartement'
 *   - menage_categorie : 'tres_modeste' | 'modeste' | 'intermediaire' | 'superieur'
 *
 * Cache : public, max-age=3600, swr=86400 (forfaits CEE stables jusqu'à révision
 * arrêté). Rate-limit : 600 req/min/IP fail-open.
 *
 * v0 retournera `eligible:false reason:"forfait paramétrique..."` pour la
 * plupart des gestes — le Critic YMYL utilise précisément ce contrat pour
 * bloquer les outputs LLM qui inventeraient un chiffre.
 */

import { NextRequest, NextResponse } from 'next/server'

import { computeCEEAmount, type CalculCEEInput } from '@/lib/cee'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'

import { jsonError } from '../_shared/error-response'
import { buildCeeDatasetSchema } from '../_shared/schema-org'
import {
  validateGeste,
  validateMenageCat,
  validateTypeLogement,
  validateZoneClimatique,
  type ValidationError,
} from '../_shared/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE_URL = 'https://servicesartisans.fr'
const SNAPSHOT_DATE = '2026-04-15'
const SOURCE_LABEL = 'Arrete 22 decembre 2014 modifie - fiches BAR-XX-XXX'

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
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-aides-cee:${ip}`, {
      window: 60_000,
      max: 600,
      failOpen: true,
    })
    if (!rl.allowed) {
      return jsonError(429, 'too_many_requests', 'Limite 600 req/min/IP atteinte.')
    }

    const params = req.nextUrl.searchParams

    const gesteV = validateGeste(params.get('geste'))
    const zoneClimV = validateZoneClimatique(params.get('zone_climatique'))
    const typeLogV = validateTypeLogement(params.get('type_logement'))
    const menageCatV = validateMenageCat(params.get('menage_categorie'))

    const errors: ValidationError[] = []
    if (!gesteV.ok) errors.push(gesteV.error)
    if (!zoneClimV.ok) errors.push(zoneClimV.error)
    if (!typeLogV.ok) errors.push(typeLogV.error)
    if (!menageCatV.ok) errors.push(menageCatV.error)

    if (errors.length > 0) {
      return jsonError(400, 'INVALID_PARAMS', 'Query parameters validation failed', errors)
    }

    if (!gesteV.ok || !zoneClimV.ok || !typeLogV.ok || !menageCatV.ok) {
      return jsonError(500, 'INTERNAL', 'unreachable')
    }

    const input: CalculCEEInput = {
      geste: gesteV.value,
      zone: zoneClimV.value,
      typeLogement: typeLogV.value,
      menageCategorie: menageCatV.value,
    }
    const result = computeCEEAmount(input)

    const canonicalUrl =
      `${SITE_URL}/api/v1/aides/cee-bareme` +
      `?geste=${encodeURIComponent(gesteV.value)}` +
      `&zone_climatique=${encodeURIComponent(zoneClimV.value)}` +
      `&type_logement=${encodeURIComponent(typeLogV.value)}` +
      `&menage_categorie=${encodeURIComponent(menageCatV.value)}`

    const body = {
      ...buildCeeDatasetSchema(canonicalUrl),
      result,
      input,
      _meta: {
        api_version: 'v1',
        license: 'CC-BY-4.0',
        docs: `${SITE_URL}/developpeurs`,
        attribution: 'Source: ServicesArtisans + Arrêté 22 décembre 2014 modifié (CEE 2026)',
        snapshot_date: SNAPSHOT_DATE,
      },
    }

    return NextResponse.json(body, { status: 200, headers: SUCCESS_HEADERS })
  } catch (err) {
    logger.error('v1/aides/cee-bareme: error', err)
    captureError(err, { tags: { route: 'api/v1/aides/cee-bareme', critical: 'true' } })
    return jsonError(500, 'INTERNAL', 'Internal error computing CEE bareme.')
  }
}
