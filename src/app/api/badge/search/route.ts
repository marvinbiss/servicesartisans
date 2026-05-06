import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { withTimeout } from '@/lib/api/timeout'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // SLA-99.9 : RL 600/min, fail-open. Endpoint public consommé par le widget
  // d'autocomplétion partenaire — UN crawler ne doit jamais le bloquer.
  try {
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`badge-search:${ip}`, {
      window: 60_000,
      max: 600,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const q = request.nextUrl.searchParams.get('q')?.trim()

    if (!q || q.length < 2) {
      return NextResponse.json(
        { results: [] },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      )
    }

    const safeQ = q.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçœæÀÂÄÉÈÊËÏÎÔÙÛÜŸÇŒÆ\s'-]/g, '')

    if (!safeQ || safeQ.length < 2) {
      return NextResponse.json(
        { results: [] },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      )
    }

    const supabase = await createClient()

    // SLA-99.9 : timeout amont 5s. Au-delà, le partenaire reçoit un payload
    // vide cacheable plutôt qu'un 5xx — on protège le widget tiers.
    const { data, error } = await withTimeout(
      supabase
        .from('providers')
        .select(
          'name, slug, stable_id, specialty, address_city, is_verified, rating_average, review_count'
        )
        .or(`name.ilike.%${safeQ}%,slug.ilike.%${safeQ}%`)
        .eq('is_active', true)
        .order('is_verified', { ascending: false })
        .order('review_count', { ascending: false, nullsFirst: false })
        .limit(10),
      5_000,
      'badge_search_providers'
    )

    if (error) {
      logger.error('badge-search: supabase error', error)
      captureError(error, { tags: { route: 'api/badge/search', critical: 'true' } })
      return NextResponse.json(
        { results: [] },
        {
          status: 200,
          headers: { 'Cache-Control': 'public, s-maxage=60' },
        }
      )
    }

    return NextResponse.json(
      {
        results: (data || []).map(
          (p: {
            name: string
            slug: string
            stable_id?: string | null
            specialty?: string | null
            address_city?: string | null
            is_verified?: boolean | null
            rating_average?: number | null
            review_count?: number | null
          }) => ({
            name: p.name,
            slug: p.slug,
            stable_id: p.stable_id,
            specialty: p.specialty,
            city: p.address_city,
            is_verified: p.is_verified === true,
            rating: p.rating_average,
            reviews: p.review_count,
          })
        ),
      },
      {
        // SLA-99.9 : Cache 1h CDN + SWR 24h. Recherche par nom = signal
        // suffisamment stable pour cacher agressivement.
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    // SLA-99.9 : fallback 200 + payload vide → le widget tiers ne casse pas.
    logger.error('badge-search: error', error)
    captureError(error, { tags: { route: 'api/badge/search', critical: 'true' } })
    return NextResponse.json(
      { results: [] },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, s-maxage=60' },
      }
    )
  }
}
