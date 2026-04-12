/**
 * Artisan Reviews API
 * GET: Fetch reviews for the artisan
 * POST reply is handled by /api/artisan/avis/[id]/response
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import {
  getActiveProviderIdByUserId,
  getReviewsByProviderId,
  getReviewRatings,
} from '@/lib/services/artisan-profile-service'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non authentifié' } },
        { status: 401 }
      )
    }

    // Resolve provider.id from user.id (reviews.provider_id → providers.id)
    const { data: providerRow } = await getActiveProviderIdByUserId(supabase, user.id)

    const providerId = providerRow?.id
    if (!providerId) {
      return NextResponse.json({
        avis: [],
        stats: {
          moyenne: 0,
          total: 0,
          distribution: [5, 4, 3, 2, 1].map((note) => ({ note, count: 0 })),
        },
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      })
    }

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
    const {
      data: reviews,
      error: reviewsError,
      count,
    } = await getReviewsByProviderId(supabase, providerId, { orderColumn, ascending, from, to })

    if (reviewsError) {
      logger.error('Error fetching reviews:', reviewsError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des avis' },
        { status: 500 }
      )
    }

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit)

    // Calcul des stats via une seule requête (GROUP BY côté JS)
    const { data: allRatings, error: ratingsError } = await getReviewRatings(supabase, providerId)

    let stats
    if (ratingsError) {
      stats = {
        moyenne: 0,
        total: 0,
        distribution: [5, 4, 3, 2, 1].map((note) => ({ note, count: 0 })),
      }
    } else {
      const ratingCounts = [0, 0, 0, 0, 0] // index 0 = rating 1, index 4 = rating 5
      for (const row of allRatings || []) {
        const r = row.rating
        if (r >= 1 && r <= 5) ratingCounts[r - 1]++
      }
      const totalReviews = ratingCounts.reduce((sum, c) => sum + c, 0)
      const weightedSum = ratingCounts.reduce((sum, c, i) => sum + (i + 1) * c, 0)
      const averageRating = totalReviews > 0 ? weightedSum / totalReviews : 0

      const distribution = [5, 4, 3, 2, 1].map((note) => ({
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
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
