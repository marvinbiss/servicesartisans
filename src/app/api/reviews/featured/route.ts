/**
 * API pour récupérer les avis en vedette (pour la homepage)
 * Retourne les meilleurs avis récents avec au moins 4 étoiles
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Fetch top-rated recent reviews with provider info (ALL real reviews)
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        author_name,
        created_at,
        is_verified,
        service_name,
        provider:providers (
          id,
          name,
          specialty,
          address_city,
          slug
        )
      `)
      // REMOVED: .eq('is_visible', true) to show ALL real reviews
      .gte('rating', 4)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Error fetching featured reviews:', error)
      return NextResponse.json({ reviews: [] })
    }

    // Transform reviews to include city and service info
    const transformedReviews = (reviews || [])
      .filter(r => r.comment && r.comment.length > 20) // Only reviews with actual content
      .map(review => {
        // Provider can be null, single object, or array depending on the relation
        const provider = Array.isArray(review.provider) ? review.provider[0] : review.provider
        return {
          id: review.id,
          author_name: review.author_name || 'Client',
          rating: review.rating,
          comment: review.comment,
          is_verified: review.is_verified,
          city: provider?.address_city || null,
          city_slug: provider?.address_city?.toLowerCase().replace(/\s+/g, '-') || null,
          service: review.service_name || provider?.specialty || null,
          service_slug: provider?.specialty?.toLowerCase().replace(/\s+/g, '-') || null,
          provider_name: provider?.name || null,
          provider_slug: provider?.slug || null,
          created_at: review.created_at
        }
      })

    return NextResponse.json({
      reviews: transformedReviews
    })

  } catch (error) {
    console.error('Error fetching featured reviews:', error)
    return NextResponse.json(
      { reviews: [] },
      { status: 200 } // Return empty array instead of error
    )
  }
}
