/**
 * GET /api/v1/stats/department/[code]
 * ----------------------------------------------------------------------------
 * Stats agrégées par département (CODE INSEE 2-3 chars) — linkable Pillar 4.
 *
 * Format : Schema.org Dataset partial (Distribution = JSON inline). CC-BY 4.0
 * + attribution Etalab 2.0. Conçu pour citation média + LLM (LE Monde / Capital
 * / Le Figaro / ChatGPT / Perplexity).
 *
 * Métriques :
 *   - totalProviders (is_active = true)
 *   - totalRgeActive (au moins 1 qualif active)
 *   - rgePenetration (totalRgeActive / totalProviders)
 *   - topQualifications (top 5 codes RGE actifs)
 *   Ratings : non inclus v1 — providers.average_rating live sur profiles
 *   (join 2-hops). À ajouter en v2 via reviews aggregate.
 *
 * Cache CDN 24h frais + 7j SWR. Pas d'auth (donnée publique).
 * Rate-limit 600/min/IP fail-open.
 */

import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import {
  hasActiveRgeQualification,
  type RgeQualification,
} from '@/lib/rge/has-active-qualification'
import { SITE_URL } from '@/lib/seo/config'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
}

const ATTRIBUTION = 'Source : Registre RGE ADEME via data.gouv.fr — Licence Etalab 2.0 / CC-BY 4.0'

const DEPT_CODE_RE = /^(2A|2B|\d{2,3})$/

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

type ProviderRow = {
  id: string
  rge_qualifications: RgeQualification[] | null
}

function sanitizeCode(raw: string): string | null {
  const upper = raw.trim().toUpperCase()
  return DEPT_CODE_RE.test(upper) ? upper : null
}

type Params = { params: Promise<{ code: string }> }

export async function GET(request: NextRequest, props: Params) {
  const params = await props.params
  try {
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`v1-stats-dept:${ip}`, {
      window: 60_000,
      max: 600,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'too_many_requests' },
        { status: 429, headers: CORS_HEADERS }
      )
    }

    const code = sanitizeCode(params.code)
    if (!code) {
      return NextResponse.json(
        { error: 'invalid_department_code' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('providers')
      .select('id, rge_qualifications')
      .eq('is_active', true)
      .eq('address_department', code)
      .limit(50_000)

    if (error) {
      logger.error('v1-stats-dept.query_failed', { code, error: error.message })
      return NextResponse.json({ error: 'database_error' }, { status: 500, headers: CORS_HEADERS })
    }

    const rows = (data ?? []) as ProviderRow[]
    const now = Date.now()

    let totalRgeActive = 0
    const qualifCount = new Map<string, number>()

    for (const row of rows) {
      const isActive = hasActiveRgeQualification(row.rge_qualifications, now)
      if (isActive) {
        totalRgeActive += 1
        for (const q of row.rge_qualifications ?? []) {
          const end = Date.parse(q?.date_fin ?? '')
          if (Number.isFinite(end) && end > now) {
            qualifCount.set(q.code, (qualifCount.get(q.code) ?? 0) + 1)
          }
        }
      }
    }

    const topQualifications = Array.from(qualifCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([code, count]) => ({ code, count }))

    const totalProviders = rows.length
    const rgePenetration = totalProviders > 0 ? totalRgeActive / totalProviders : 0

    const datasetUrl = `${SITE_URL}/api/v1/stats/department/${code}`
    const datasetSchema = {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      '@id': datasetUrl,
      name: `Statistiques artisans RGE — département ${code}`,
      description: `Répartition des artisans RGE actifs et qualifications dans le département ${code}. Mise à jour quotidienne via le registre ADEME (data.gouv.fr).`,
      url: datasetUrl,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      creator: { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
      isBasedOn: 'https://www.data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2/',
      keywords: ['RGE', 'ADEME', 'rénovation énergétique', 'France', `département ${code}`],
      temporalCoverage: new Date(now).toISOString().slice(0, 10),
      distribution: [
        {
          '@type': 'DataDownload',
          encodingFormat: 'application/json',
          contentUrl: datasetUrl,
        },
      ],
    }

    return NextResponse.json(
      {
        ...datasetSchema,
        metadata: {
          attribution: ATTRIBUTION,
          generatedAt: new Date(now).toISOString(),
          departmentCode: code,
        },
        stats: {
          totalProviders,
          totalRgeActive,
          rgePenetration: Math.round(rgePenetration * 10_000) / 10_000,
          topQualifications,
        },
      },
      { status: 200, headers: CORS_HEADERS }
    )
  } catch (err) {
    captureError(err, { tags: { route: 'v1-stats-dept', code: params.code } })
    logger.error('v1-stats-dept.unhandled', {
      code: params.code,
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'internal_error' }, { status: 500, headers: CORS_HEADERS })
  }
}
