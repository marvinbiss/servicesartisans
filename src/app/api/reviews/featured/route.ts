/**
 * API pour récupérer les avis en vedette (pour la homepage)
 * Retourne les meilleurs avis récents avec au moins 4 étoiles
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const revalidate = 3600 // Cache for 1 hour (ISR)

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Fetch top-rated recent reviews (only published reviews).
    //
    // Schéma prod réel (vérifié 2026-04-09, information_schema) :
    //   id, provider_id, author_name, author_email, rating, title,
    //   content, reply, reply_date, status, created_at, …
    // ATTENTION : le code legacy dans d'autres fichiers utilise encore
    // `comment`/`client_name`/`artisan_id` — refactor complet à venir.
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, rating, content, author_name, provider_id, created_at')
      .eq('status', 'published')
      .gte('rating', 4)
      .not('content', 'is', null)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      logger.error('Error fetching featured reviews:', error)
      return NextResponse.json({ reviews: [] })
    }

    // Resolve artisan names from providers table in a single batch query
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

    // Transform reviews to include artisan info.
    // Output keep `comment` as field name for backward compat with any
    // client consuming this API by the old contract.
    const transformedReviews = (reviews || [])
      .filter((r) => r.content && r.content.length > 20)
      .map((review) => ({
        id: review.id,
        author_name: review.author_name || 'Client',
        rating: review.rating,
        comment: review.content,
        artisan_name: (review.provider_id && providerNames[review.provider_id]) || null,
        created_at: review.created_at,
      }))

    return NextResponse.json(
      {
        reviews: transformedReviews,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    logger.error('Error fetching featured reviews:', error)
    return NextResponse.json(
      { reviews: [] },
      { status: 200 } // Return empty array instead of error
    )
  }
}
