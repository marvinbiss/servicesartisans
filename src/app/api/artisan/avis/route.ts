/**
 * Artisan Reviews API
 * GET: Fetch reviews for the artisan
 * POST: Reply to a review
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { z } from 'zod'
import { sanitizeUserInput } from '@/lib/sanitize'

// POST request schema (reply to review)
const replyToReviewSchema = z.object({
  review_id: z.string().uuid(),
  response: z.string().min(10, 'La réponse doit contenir au moins 10 caractères').max(2000),
})

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

    // Calculate stats from a separate lightweight query (all reviews, not just current page)
    const { data: allRatings, error: statsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('artisan_id', user!.id)

    let stats
    if (statsError || !allRatings) {
      stats = {
        moyenne: 0,
        total: 0,
        distribution: [5, 4, 3, 2, 1].map(note => ({ note, count: 0 })),
      }
    } else {
      const totalReviews = allRatings.length
      const averageRating = totalReviews > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0

      const distribution = [5, 4, 3, 2, 1].map(note => ({
        note,
        count: allRatings.filter(r => r.rating === note).length,
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

export async function POST(request: Request) {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    const body = await request.json()
    const result = replyToReviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { review_id, response } = result.data

    // Verify the review belongs to this artisan and has no existing response
    const { data: review } = await supabase
      .from('reviews')
      .select('artisan_id, artisan_response')
      .eq('id', review_id)
      .single()

    if (!review || review.artisan_id !== user!.id) {
      return NextResponse.json(
        { error: 'Avis non trouvé ou non autorisé' },
        { status: 403 }
      )
    }

    // Guard against double-response
    if (review.artisan_response !== null) {
      return NextResponse.json(
        { error: 'Une réponse existe déjà pour cet avis' },
        { status: 409 }
      )
    }

    // Update with response
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ artisan_response: sanitizeUserInput(response.trim()), artisan_responded_at: new Date().toISOString() })
      .eq('id', review_id)

    if (updateError) {
      logger.error('Error updating review:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la réponse' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Réponse enregistrée',
    })
  } catch (error) {
    logger.error('Reviews POST error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
