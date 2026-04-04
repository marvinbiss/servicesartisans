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

    // Fetch top-rated recent reviews (only published reviews)
    // Note: reviews.artisan_id FK target is ambiguous in schema cache,
    // so we fetch reviews without join and resolve provider name separately.
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, client_name, artisan_id, created_at')
      .eq('status', 'published')
      .gte('rating', 4)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      logger.error('Error fetching featured reviews:', error)
      return NextResponse.json({ reviews: [] })
    }

    // Resolve artisan names from providers table in a single batch query
    const artisanIds = Array.from(new Set((reviews || []).map(r => r.artisan_id).filter(Boolean)))
    let providerNames: Record<string, string> = {}

    if (artisanIds.length > 0) {
      const { data: providers } = await supabase
        .from('providers')
        .select('id, name')
        .in('id', artisanIds)

      if (providers) {
        providerNames = Object.fromEntries(providers.map(p => [p.id, p.name]))
      }
    }

    // Transform reviews to include artisan info
    const transformedReviews = (reviews || [])
      .filter(r => r.comment && r.comment.length > 20)
      .map(review => ({
        id: review.id,
        author_name: review.client_name || 'Client',
        rating: review.rating,
        comment: review.comment,
        artisan_name: (review.artisan_id && providerNames[review.artisan_id]) || null,
        created_at: review.created_at,
      }))

    return NextResponse.json({
      reviews: transformedReviews
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })

  } catch (error) {
    logger.error('Error fetching featured reviews:', error)
    return NextResponse.json(
      { reviews: [] },
      { status: 200 } // Return empty array instead of error
    )
  }
}
