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

    // Fetch published reviews by this client
    const { data: avisPublies, error: avisError } = await supabase
      .from('reviews')
      .select(`
        *,
        artisan:profiles!artisan_id(id, full_name, company_name, avatar_url),
        devis:devis(request:devis_requests(service_name))
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

    // Fetch completed devis that don't have reviews yet (pending reviews)
    const { data: devisCompleted, error: devisError } = await supabase
      .from('devis')
      .select(`
        *,
        request:devis_requests!devis_request_id(id, service_name, client_id),
        artisan:profiles!artisan_id(id, full_name, company_name, avatar_url)
      `)
      .eq('status', 'completed')

    if (devisError) {
      logger.error('Error fetching completed devis:', devisError)
    }

    // Filter devis for this client that don't have reviews
    const reviewedDevisIds = new Set(avisPublies?.map(r => r.devis_id) || [])
    const avisEnAttente = devisCompleted?.filter(d =>
      d.request?.client_id === user.id && !reviewedDevisIds.has(d.id)
    ).map(d => ({
      id: d.id,
      artisan: d.artisan?.company_name || d.artisan?.full_name || 'Artisan',
      artisan_id: d.artisan_id,
      service: d.request?.service_name || 'Service',
      date: d.updated_at || d.created_at,
      devis_id: d.id,
    })) || []

    // Format published reviews
    const formattedAvisPublies = avisPublies?.map(r => ({
      id: r.id,
      artisan: r.artisan?.company_name || r.artisan?.full_name || 'Artisan',
      artisan_id: r.artisan_id,
      service: r.devis?.request?.service_name || 'Service',
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
    const { artisan_id, devis_id, rating, comment } = body

    if (!artisan_id || !rating || !comment) {
      return NextResponse.json(
        { error: 'Artisan, note et commentaire requis' },
        { status: 400 }
      )
    }

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
    const { review_id, rating, comment } = body

    if (!review_id) {
      return NextResponse.json(
        { error: 'ID de l\'avis requis' },
        { status: 400 }
      )
    }

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
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const review_id = searchParams.get('id')

    if (!review_id) {
      return NextResponse.json(
        { error: 'ID de l\'avis requis' },
        { status: 400 }
      )
    }

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
