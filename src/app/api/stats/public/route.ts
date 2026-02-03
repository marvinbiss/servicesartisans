/**
 * API pour les statistiques publiques du site
 * Retourne les compteurs d'artisans, réservations, note moyenne, etc.
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get counts in parallel
    const [
      { count: artisanCount },
      { count: bookingCount },
      { data: ratingData },
      { count: reviewCount }
    ] = await Promise.all([
      // Count verified artisans (from providers table)
      supabase
        .from('providers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),

      // Count bookings
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true }),

      // Get average rating
      supabase
        .from('reviews')
        .select('rating')
        .eq('is_visible', true),

      // Count reviews
      supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('is_visible', true)
    ])

    // Calculate average rating
    let averageRating = 0
    if (ratingData && ratingData.length > 0) {
      const total = ratingData.reduce((sum, r) => sum + r.rating, 0)
      averageRating = total / ratingData.length
    }

    return NextResponse.json({
      artisanCount: artisanCount || 0,
      bookingCount: bookingCount || 0,
      reviewCount: reviewCount || 0,
      averageRating: Math.round(averageRating * 10) / 10,
      updatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching public stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
