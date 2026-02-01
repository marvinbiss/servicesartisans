/**
 * Artisan Reviews API
 * GET: Fetch reviews for the artisan
 * POST: Reply to a review
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Fetch reviews for this artisan
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        client:profiles!client_id(id, full_name, avatar_url),
        devis:devis(request:devis_requests(service_name))
      `)
      .eq('artisan_id', user.id)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      logger.error('Error fetching reviews:', reviewsError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des avis' },
        { status: 500 }
      )
    }

    // Calculate stats
    const totalReviews = reviews?.length || 0
    const averageRating = totalReviews > 0
      ? reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    // Distribution by rating
    const distribution = [5, 4, 3, 2, 1].map(note => ({
      note,
      count: reviews?.filter(r => r.rating === note).length || 0,
    }))

    const stats = {
      moyenne: Math.round(averageRating * 10) / 10,
      total: totalReviews,
      distribution,
    }

    // Format reviews for frontend
    const formattedReviews = reviews?.map(r => ({
      id: r.id,
      client: r.client?.full_name || 'Client',
      service: r.devis?.request?.service_name || 'Service',
      date: r.created_at,
      note: r.rating,
      commentaire: r.comment,
      reponse: r.response,
    })) || []

    return NextResponse.json({
      avis: formattedReviews,
      stats,
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
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { review_id, response } = body

    if (!review_id || !response) {
      return NextResponse.json(
        { error: 'ID de l\'avis et réponse requis' },
        { status: 400 }
      )
    }

    // Verify the review belongs to this artisan
    const { data: review } = await supabase
      .from('reviews')
      .select('artisan_id')
      .eq('id', review_id)
      .single()

    if (!review || review.artisan_id !== user.id) {
      return NextResponse.json(
        { error: 'Avis non trouvé ou non autorisé' },
        { status: 403 }
      )
    }

    // Update with response
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ response })
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
