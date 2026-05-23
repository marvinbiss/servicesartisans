/**
 * POST /api/v1/graphql — Pillar 2 RGE-OS GraphQL endpoint.
 *
 * Zero-dep, hand-rolled GraphQL-as-RPC subset (parser + executor + resolvers
 * dans `_parser.ts`, `_executor.ts`, `_resolvers.ts`). Voir
 * `docs/API-V1-GRAPHQL.md` pour la doc d'usage.
 *
 * Rate-limit 60 req/min/IP fail-open (cf. memory upstash-rate-limit-fix-2026-
 * 04-22 : tout endpoint user-facing critique en fail-open).
 *
 * License : CC-BY 4.0. CORS ouvert (lecture seule, identique aux endpoints
 * REST `/api/v1/aides/*` et `/api/v1/rge/*`).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'

import { parseGraphQL, PARSER_LIMITS } from './_parser'
import { executeQuery } from './_executor'
import { SDL, ROOT_QUERY_FIELDS } from './_schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Enveloppe GraphQL-as-RPC : on valide uniquement `{ query: string }` et on
// préserve les champs inconnus (variables, operationName d'éventuels clients).
// La longueur max + le parse fin restent gérés en aval.
const graphqlBodySchema = z.object({ query: z.string().min(1) }).passthrough()

const SITE_URL = 'https://servicesartisans.fr'

const SUCCESS_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'X-License': 'CC-BY-4.0',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: SUCCESS_HEADERS })
}

export async function GET(): Promise<NextResponse> {
  const sdlPreview = SDL.split('\n').slice(0, 20).join('\n') + '\n... (truncated)'
  return NextResponse.json(
    {
      endpoint: '/api/v1/graphql',
      description:
        'GraphQL-as-RPC subset for SA RGE-OS APIs. POST {query} with read-only operations.',
      method: 'POST',
      content_type: 'application/json',
      rate_limit: '60 req/min/IP, fail-open',
      license: 'CC-BY-4.0',
      docs: `${SITE_URL}/developpeurs`,
      limits: {
        max_query_chars: PARSER_LIMITS.MAX_SOURCE_LEN,
        max_depth: PARSER_LIMITS.MAX_DEPTH,
        max_fields: PARSER_LIMITS.MAX_FIELDS,
      },
      root_fields: ROOT_QUERY_FIELDS,
      sdl_preview: sdlPreview,
      example_query: '{ rgeLookup(siret: "12345678901234") { siret nom ville } }',
    },
    { status: 200, headers: SUCCESS_HEADERS }
  )
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIp(req.headers)
    const rl = await checkRateLimit(`v1-graphql:${ip}`, {
      window: 60_000,
      max: 60,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        {
          data: null,
          errors: [{ message: 'Rate limit 60 req/min/IP exceeded.' }],
        },
        { status: 429, headers: SUCCESS_HEADERS }
      )
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        {
          data: null,
          errors: [{ message: 'Body must be valid JSON.' }],
        },
        { status: 400, headers: SUCCESS_HEADERS }
      )
    }

    const bodyParsed = graphqlBodySchema.safeParse(body)
    if (!bodyParsed.success) {
      const isObject = body !== null && typeof body === 'object'
      return NextResponse.json(
        {
          data: null,
          errors: [
            {
              message: isObject
                ? 'Missing required field: query (non-empty string).'
                : 'Body must be a JSON object.',
            },
          ],
        },
        { status: 400, headers: SUCCESS_HEADERS }
      )
    }

    const queryRaw = bodyParsed.data.query

    if (queryRaw.length > PARSER_LIMITS.MAX_SOURCE_LEN) {
      return NextResponse.json(
        {
          data: null,
          errors: [
            {
              message: `Query exceeds max length ${PARSER_LIMITS.MAX_SOURCE_LEN} chars.`,
            },
          ],
        },
        { status: 400, headers: SUCCESS_HEADERS }
      )
    }

    const parsed = parseGraphQL(queryRaw)
    if (!parsed.ok) {
      return NextResponse.json(
        {
          data: null,
          errors: [{ message: `Parse error: ${parsed.error}` }],
        },
        { status: 400, headers: SUCCESS_HEADERS }
      )
    }

    const result = await executeQuery(parsed.query, { ip })
    return NextResponse.json(result, { status: 200, headers: SUCCESS_HEADERS })
  } catch (err) {
    logger.error('v1/graphql: unexpected error', err)
    captureError(err, { tags: { route: 'api/v1/graphql', critical: 'true' } })
    return NextResponse.json(
      {
        data: null,
        errors: [{ message: 'Internal server error.' }],
      },
      { status: 500, headers: SUCCESS_HEADERS }
    )
  }
}
