/**
 * Client Reviews API
 * GET: Fetch reviews written by the client and pending reviews
 * POST: Submit a new review
 * PUT: Update an existing review
 * DELETE: Delete a review
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// POST request schema
const createReviewSchema = z.object({
  artisan_id: z.string().uuid(),
  devis_id: z.string().uuid().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(2000),
})

// PUT request schema
const updateReviewSchema = z.object({
  review_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(10).max(2000).optional(),
})

// DELETE query params schema
const deleteReviewSchema = z.object({
  id: z.string().uuid(),
})

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Fetch published reviews by this client
    // Note: 'devis' table does not exist (TODO: re-enable join when reconciled)
    // Note: profiles does not have company_name or avatar_url
    const { data: avisPublies, error: avisError } = await supabase
      .from('reviews')
      .select(`
        *,
        artisan:profiles!artisan_id(id, full_name)
      `)
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })

    if (avisError) {
      logger.error('Error fetching reviews:', avisError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des avis' },
        { status: 500 }
      )
    }

    // TODO: table 'devis' does not exist — pending reviews from completed devis disabled
    const avisEnAttente: unknown[] = []

    // Format published reviews
    const formattedAvisPublies = avisPublies?.map(r => ({
      id: r.id,
      artisan: r.artisan?.full_name || 'Artisan',
      artisan_id: r.artisan_id,
      service: 'Service',
      date: r.created_at,
      note: r.rating,
      commentaire: r.comment,
      reponse: r.response,
    })) || []

    return NextResponse.json({
      avisPublies: formattedAvisPublies,
      avisEnAttente,
    })
  } catch (error) {
    logger.error('Client avis GET error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = createReviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { artisan_id, devis_id, rating, comment } = result.data

    // Insert review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        client_id: user.id,
        artisan_id,
        devis_id: devis_id || null,
        rating,
        comment,
      })
      .select()
      .single()

    if (insertError) {
      logger.error('Error inserting review:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de la publication de l\'avis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      review,
      message: 'Avis publié avec succès',
    })
  } catch (error) {
    logger.error('Client avis POST error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = updateReviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { review_id, rating, comment } = result.data

    // Verify the review belongs to this client
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('client_id')
      .eq('id', review_id)
      .single()

    if (!existingReview || existingReview.client_id !== user.id) {
      return NextResponse.json(
        { error: 'Avis non trouvé ou non autorisé' },
        { status: 403 }
      )
    }

    // Update review
    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        rating,
        comment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', review_id)

    if (updateError) {
      logger.error('Error updating review:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'avis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Avis mis à jour avec succès',
    })
  } catch (error) {
    logger.error('Client avis PUT error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryParams = {
      id: searchParams.get('id'),
    }
    const result = deleteReviewSchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const review_id = result.data.id

    // Verify the review belongs to this client
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('client_id')
      .eq('id', review_id)
      .single()

    if (!existingReview || existingReview.client_id !== user.id) {
      return NextResponse.json(
        { error: 'Avis non trouvé ou non autorisé' },
        { status: 403 }
      )
    }

    // Delete review
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', review_id)

    if (deleteError) {
      logger.error('Error deleting review:', deleteError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'avis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Avis supprimé avec succès',
    })
  } catch (error) {
    logger.error('Client avis DELETE error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
