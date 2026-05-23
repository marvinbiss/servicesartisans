/**
 * GET /api/v1/asyncapi/yaml — AsyncAPI 3.0.0 spec (YAML form).
 *
 * Same source as the JSON form (`../_spec.ts`), serialized via the
 * Ralph 27 hand-rolled `encodeYaml` (zero npm deps — direct import from
 * the OpenAPI sibling endpoint). 3-line comment header carries license +
 * attribution for visibility on direct browser open.
 *
 * License : CC-BY 4.0.
 */

import { NextResponse } from 'next/server'

import { encodeYaml } from '@/app/api/v1/openapi/_yaml-encoder'

import { ASYNCAPI_SPEC } from '../_spec'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function GET(): Promise<NextResponse> {
  try {
    const body =
      '# AsyncAPI 3.0.0 spec — ServicesArtisans RGE-OS Events\n' +
      '# License: CC-BY 4.0\n' +
      '# Source: https://servicesartisans.fr\n' +
      encodeYaml(ASYNCAPI_SPEC, 0).trimStart()
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
    logger.error('[api/v1/asyncapi/yaml] GET failed', error)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}
