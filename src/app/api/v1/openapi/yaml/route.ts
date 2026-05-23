/**
 * GET /api/v1/openapi/yaml — OpenAPI 3.1 spec (YAML form).
 *
 * Same source as the JSON form (`../_spec.ts`), but serialized via the
 * hand-rolled `encodeYaml` (zero npm deps). 3-line comment header carries
 * license + attribution for visibility on direct browser open.
 *
 * License : CC-BY 4.0.
 */

import { NextResponse } from 'next/server'

import { OPENAPI_SPEC } from '../_spec'
import { encodeYaml } from '../_yaml-encoder'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function GET(): Promise<NextResponse> {
  try {
    const body =
      '# OpenAPI 3.1 spec — ServicesArtisans RGE-OS\n' +
      '# License: CC-BY 4.0\n' +
      '# Source: https://servicesartisans.fr\n' +
      encodeYaml(OPENAPI_SPEC, 0).trimStart()
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/yaml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-License': 'CC-BY-4.0',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    logger.error('[api/v1/openapi/yaml] GET failed', error)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}
