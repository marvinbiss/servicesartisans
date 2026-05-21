/**
 * GET /api/v1/rge/geojson
 * ----------------------------------------------------------------------------
 * GeoJSON FeatureCollection des artisans RGE actifs (qualification.date_fin >
 * now()). Linkable asset Pillar 4 — embeddable cartes Mapbox / Leaflet /
 * MapLibre. Attribution Etalab 2.0 obligatoire (mention + URL data.gouv).
 *
 * Caching : CDN public 1h frais + 6h stale-while-revalidate. ETag basée sur
 * `max(updated_at)::sec + total_count`. Respect `If-None-Match` -> 304.
 *
 * Pagination :
 *   - limit max 5000 (Edge payload + Mapbox layer budget)
 *   - offset cursor (cursor-stable via ORDER BY id)
 *   - dept filter optionnel (CODE INSEE 2-3 chars, voir CLAUDE.md dept code)
 *
 * Rate-limit fail-open 600 req/min/IP (pattern /api/v1/rge/search).
 *
 * Pas d'auth requise (donnée publique ADEME via data.gouv.fr).
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

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

const DEFAULT_LIMIT = 1000
const MAX_LIMIT = 5000
const ATTRIBUTION = 'Source : Registre RGE ADEME via data.gouv.fr — Licence Etalab 2.0 / CC-BY 4.0'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
  'Access-Control-Expose-Headers': 'ETag, X-Total-Count',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=21600',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

type ProviderRow = {
  id: string
  slug: string | null
  name: string
  latitude: number | null
  longitude: number | null
  address_city: string | null
  address_department: string | null
  rge_qualifications: RgeQualification[] | null
  updated_at: string
}

function clampLimit(raw: string | null): number {
  const parsed = parseInt(raw ?? '', 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT
  return Math.min(MAX_LIMIT, parsed)
}

function clampOffset(raw: string | null): number {
  const parsed = parseInt(raw ?? '', 10)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return parsed
}

function sanitizeDept(raw: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim().toUpperCase()
  if (!/^(2A|2B|\d{2,3})$/.test(trimmed)) return null
  return trimmed
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`v1-rge-geojson:${ip}`, {
      window: 60_000,
      max: 600,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'too_many_requests', message: 'Limite 600 req/min/IP atteinte.' },
        { status: 429, headers: CORS_HEADERS }
      )
    }

    const { searchParams } = request.nextUrl
    const limit = clampLimit(searchParams.get('limit'))
    const offset = clampOffset(searchParams.get('offset'))
    const dept = sanitizeDept(searchParams.get('dept'))

    const admin = createAdminClient()
    let query = admin
      .from('providers')
      .select(
        'id, slug, name, latitude, longitude, address_city, address_department, rge_qualifications, updated_at',
        { count: 'exact' }
      )
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .not('rge_qualifications', 'is', null)
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1)

    if (dept) {
      query = query.eq('address_department', dept)
    }

    const { data, count, error } = await query
    if (error) {
      logger.error('v1-rge-geojson.query_failed', { error: error.message })
      return NextResponse.json({ error: 'database_error' }, { status: 500, headers: CORS_HEADERS })
    }

    const rows = (data ?? []) as ProviderRow[]
    const now = Date.now()
    const features = []
    let maxUpdated = 0
    for (const row of rows) {
      if (row.latitude == null || row.longitude == null) continue
      if (!hasActiveRgeQualification(row.rge_qualifications, now)) continue
      const updatedMs = Date.parse(row.updated_at)
      if (Number.isFinite(updatedMs) && updatedMs > maxUpdated) maxUpdated = updatedMs

      features.push({
        type: 'Feature',
        id: row.id,
        geometry: {
          type: 'Point',
          coordinates: [row.longitude, row.latitude],
        },
        properties: {
          slug: row.slug,
          name: row.name,
          city: row.address_city,
          department: row.address_department,
          qualifications: (row.rge_qualifications ?? [])
            .filter((q) => {
              const end = Date.parse(q?.date_fin ?? '')
              return Number.isFinite(end) && end > now
            })
            .map((q) => ({
              code: q.code,
              nom: q.nom,
              organisme: q.organisme,
              date_fin: q.date_fin,
            })),
        },
      })
    }

    const etag = `W/"${maxUpdated.toString(36)}-${features.length}-${count ?? 0}"`
    const ifNoneMatch = request.headers.get('if-none-match')
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: { ...CORS_HEADERS, ETag: etag },
      })
    }

    const payload = {
      type: 'FeatureCollection',
      metadata: {
        attribution: ATTRIBUTION,
        license: 'https://creativecommons.org/licenses/by/4.0/',
        source: 'https://www.data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2/',
        generatedAt: new Date(now).toISOString(),
        totalCount: count ?? features.length,
        returnedCount: features.length,
        limit,
        offset,
        deptFilter: dept,
      },
      features,
    }

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        ETag: etag,
        'X-Total-Count': String(count ?? features.length),
      },
    })
  } catch (err) {
    captureError(err, { tags: { route: 'v1-rge-geojson' } })
    logger.error('v1-rge-geojson.unhandled', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'internal_error' }, { status: 500, headers: CORS_HEADERS })
  }
}
