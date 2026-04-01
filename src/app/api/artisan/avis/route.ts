/**
 * Artisan Reviews API
 * GET: Fetch reviews for the artisan
 * POST reply is handled by /api/artisan/avis/[id]/response
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireArtisan } from '@/lib/auth/artisan-guard'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    // Parse pagination & sort params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const sort = searchParams.get('sort') || 'recent'

    // Determine sort column & direction
    let orderColumn: string = 'created_at'
    let ascending = false
    switch (sort) {
      case 'oldest':
        orderColumn = 'created_at'
        ascending = true
        break
      case 'rating_high':
        orderColumn = 'rating'
        ascending = false
        break
      case 'rating_low':
        orderColumn = 'rating'
        ascending = true
        break
      case 'recent':
      default:
        orderColumn = 'created_at'
        ascending = false
        break
    }

    const from = (page - 1) * limit
    const to = page * limit - 1

    // Fetch reviews for this artisan — explicit columns only (no fraud/scoring fields)
    const { data: reviews, error: reviewsError, count } = await supabase
      .from('reviews')
      .select('id, artisan_id, rating, comment, artisan_response, artisan_responded_at, client_name, booking_id, created_at, updated_at', { count: 'exact' })
      .eq('artisan_id', user!.id)
      .order(orderColumn, { ascending })
      .range(from, to)

    if (reviewsError) {
      logger.error('Error fetching reviews:', reviewsError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des avis' },
        { status: 500 }
      )
    }

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit)

    // Calcul des stats via COUNT SQL (pas de fetch de toutes les lignes)
    const [count1, count2, count3, count4, count5] = await Promise.all(
      [1, 2, 3, 4, 5].map(rating =>
        supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('artisan_id', user!.id)
          .eq('rating', rating)
      )
    )

    const counts = [count1, count2, count3, count4, count5]
    const hasStatsError = counts.some(c => c.error)

    let stats
    if (hasStatsError) {
      stats = {
        moyenne: 0,
        total: 0,
        distribution: [5, 4, 3, 2, 1].map(note => ({ note, count: 0 })),
      }
    } else {
      const ratingCounts = counts.map(c => c.count || 0) // index 0 = rating 1, index 4 = rating 5
      const totalReviews = ratingCounts.reduce((sum, c) => sum + c, 0)
      const weightedSum = ratingCounts.reduce((sum, c, i) => sum + (i + 1) * c, 0)
      const averageRating = totalReviews > 0 ? weightedSum / totalReviews : 0

      const distribution = [5, 4, 3, 2, 1].map(note => ({
        note,
        count: ratingCounts[note - 1],
      }))

      stats = {
        moyenne: Math.round(averageRating * 10) / 10,
        total: totalReviews,
        distribution,
      }
    }

    return NextResponse.json({
      avis: reviews || [],
      stats,
      page,
      limit,
      total,
      totalPages,
    })
  } catch (error) {
    logger.error('Reviews GET error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
