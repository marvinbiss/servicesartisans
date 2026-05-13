/**
 * GET /api/reviews/by-providers?ids=uuid1,uuid2,…
 *
 * Renvoie les meilleurs avis publiés (rating ≥ 4, content > 20 chars) parmi
 * une liste de providers. Utilisé par le composant `HubReviewsCarousel` pour
 * surfacer la preuve sociale en haut du hub /services/[métier]/[ville].
 *
 * Limite stricte : 50 IDs max, 8 reviews retournées max.
 * ISR / edge cache via Cache-Control 300s + SWR 600s.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const revalidate = 300

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const idsParam = url.searchParams.get('ids') ?? ''
  const ids = idsParam
    .split(',')
    .map((s) => s.trim())
    .filter((s) => UUID_RE.test(s))
    .slice(0, 50)

  if (ids.length === 0) {
    return NextResponse.json({ reviews: [] })
  }

  try {
    const supabase = createAdminClient()
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, rating, content, author_name, provider_id, created_at')
      .in('provider_id', ids)
      .eq('status', 'published')
      .gte('rating', 4)
      .not('content', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      logger.error('reviews/by-providers query', error)
      return NextResponse.json({ reviews: [] })
    }

    const providerIds = Array.from(
      new Set((reviews || []).map((r) => r.provider_id).filter(Boolean))
    )
    let providerNames: Record<string, string> = {}
    if (providerIds.length > 0) {
      const { data: providers } = await supabase
        .from('providers')
        .select('id, name')
        .in('id', providerIds)
      if (providers) {
        providerNames = Object.fromEntries(providers.map((p) => [p.id, p.name]))
      }
    }

    const transformed = (reviews || [])
      .filter((r) => r.content && r.content.length > 20)
      .slice(0, 8)
      .map((r) => ({
        id: r.id,
        rating: r.rating,
        content: r.content,
        author_name: r.author_name || 'Client',
        provider_id: r.provider_id,
        provider_name: r.provider_id ? (providerNames[r.provider_id] ?? null) : null,
        created_at: r.created_at,
      }))

    return NextResponse.json(
      { reviews: transformed },
      {
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
      }
    )
  } catch (err) {
    logger.error('reviews/by-providers unexpected', err as Error)
    return NextResponse.json({ reviews: [] }, { status: 200 })
  }
}
