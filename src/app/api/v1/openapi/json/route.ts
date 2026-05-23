/**
 * GET /api/v1/openapi/json — OpenAPI 3.1 spec (JSON form).
 *
 * Single source of truth = `../_spec.ts`. Cached 1h at the edge + swr 24h ;
 * no rate-limit (static read-only). CORS open.
 *
 * Use cases :
 *  - Postman/Insomnia/Bruno auto-import via URL
 *  - SDK codegen (openapi-typescript, openapi-generator)
 *  - ChatGPT plugin manifest reference
 *  - Swagger UI / Redocly / Stoplight Elements browse-friendly
 *
 * License : CC-BY 4.0 (cf. `X-License` header).
 */

import { NextResponse } from 'next/server'

import { OPENAPI_SPEC } from '../_spec'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(OPENAPI_SPEC, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-License': 'CC-BY-4.0',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    logger.error('[api/v1/openapi/json] GET failed', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
