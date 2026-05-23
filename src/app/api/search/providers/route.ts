/**
 * GET /api/search/providers?q=...&limit=20&offset=0
 *
 * Recherche FTS d'artisans par nom d'entreprise. Utilisée par :
 *   - HeroSearch / SearchBar : autocomplete dropdown quand le user tape une
 *     chaîne libre qui ne matche pas un service whitelist.
 *   - Page /recherche/artisans : server-side render via le helper direct.
 *
 * Rate-limit : appliqué par le middleware Next.js (src/middleware.ts) qui
 * route `/api/search/*` sur le bucket `search` (100/min, fail-open) —
 * cf. src/lib/rate-limiter.ts:401-405. Pas d'appel explicite dans le handler.
 * Cache CDN court : 60s s-maxage + 300s SWR (queries répétées par autocomplete).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { searchProvidersByName } from '@/lib/search/providers-search'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const parsed = QuerySchema.safeParse({
      q: url.searchParams.get('q'),
      limit: url.searchParams.get('limit') ?? undefined,
      offset: url.searchParams.get('offset') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const { q, limit, offset } = parsed.data
    const { results, truncatedQuery } = await searchProvidersByName({
      query: q,
      limit,
      offset,
    })

    return NextResponse.json(
      {
        query: truncatedQuery,
        count: results.length,
        results: results.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          stableId: r.stable_id,
          specialty: r.specialty,
          city: r.address_city,
          region: r.address_region,
          isVerified: r.is_verified,
          isClaimed: r.claimed_at !== null,
          rgeCount: Array.isArray(r.rge_qualifications) ? r.rge_qualifications.length : 0,
          rating: r.rating_average,
          reviewCount: r.review_count ?? 0,
        })),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    logger.error('[api/search/providers] GET failed', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
