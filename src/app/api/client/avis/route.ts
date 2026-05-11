/**
 * Client Reviews API
 * GET: Fetch reviews written by the client and pending reviews
 * POST: Submit a new review
 * PUT: Update an existing review
 * DELETE: Delete a review
 */

import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { slugify } from '@/lib/utils'
import {
  clientCreateReviewSchema,
  clientUpdateReviewSchema,
  clientDeleteReviewSchema,
} from '@/lib/validations/schemas'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Fetch published reviews by this client via bookings (reviews has no direct client FK)
    // Step 1: get booking IDs for this client
    const { data: clientBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('client_id', user.id)

    const bookingIds = clientBookings?.map((b: { id: string }) => b.id) || []

    // Step 2: fetch reviews for those bookings.
    // Note: schema actuel = `reviews.booking_id` -> bookings (1:1). Aucun
    // chemin reviews -> devis_requests (devis = lead, pas livrable).
    // Si on veut afficher avis par "devis accepte", il faut soit ajouter
    // `reviews.devis_request_id`, soit traverser bookings.devis_request_id.
    // Note: profiles does not have company_name or avatar_url
    const { data: avisPublies, error: avisError } = await supabase
      .from('reviews')
      .select(
        `
        *,
        artisan:providers!provider_id(id, name),
        booking:bookings!booking_id(service_name)
      `
      )
      .in(
        'booking_id',
        bookingIds.length > 0 ? bookingIds : ['00000000-0000-0000-0000-000000000000']
      )
      .order('created_at', { ascending: false })

    if (avisError) {
      logger.error('Error fetching reviews:', avisError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des avis' },
        { status: 500 }
      )
    }

    // Pending reviews path desactive : `devis_requests.status='accepted'`
    // existe, mais aucun signal "service complete" ne declenche d'invitation
    // d'avis cote client. Bridge devis -> invitation cree par cron
    // `send-review-invitations` (voir memory reviews-flywheel-2026-04-18) :
    // l'invitation se fait apres booking complete, pas via cette route.
    const avisEnAttente: unknown[] = []

    // Format published reviews
    const formattedAvisPublies =
      avisPublies?.map((r) => ({
        id: r.id,
        artisan: r.artisan?.name || 'Artisan',
        provider_id: r.provider_id,
        service: (r.booking as { service_name?: string } | null)?.service_name || null,
        date: r.created_at,
        note: r.rating,
        commentaire: r.content,
        reponse: r.reply,
      })) || []

    return NextResponse.json({
      avisPublies: formattedAvisPublies,
      avisEnAttente,
    })
  } catch (error) {
    logger.error('Client avis GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const result = clientCreateReviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Erreur de validation', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { provider_id, booking_id, rating, content } = result.data

    // Fetch client profile to get name and email for the review record
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // Insert review (reviews has author_name, author_email — no user_id FK)
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        provider_id,
        booking_id: booking_id || null,
        author_name: clientProfile?.full_name || user.email || 'Client',
        author_email: clientProfile?.email || user.email || '',
        rating,
        content,
      })
      .select()
      .single()

    if (insertError) {
      logger.error('Error inserting review:', insertError)
      return NextResponse.json(
        { error: "Erreur lors de la publication de l'avis" },
        { status: 500 }
      )
    }

    // Revalidation on-demand des pages affectées (non-bloquant)
    try {
      const { data: providerData } = await supabase
        .from('providers')
        .select('specialty, address_city, slug, stable_id')
        .eq('id', provider_id)
        .single()

      if (providerData) {
        const serviceSlug = slugify(providerData.specialty || 'artisan')
        const locationSlug = slugify(providerData.address_city || 'france')
        const publicId = providerData.slug || providerData.stable_id

        if (publicId) {
          revalidatePath(`/services/${serviceSlug}/${locationSlug}/${publicId}`, 'page')
        }
        revalidatePath(`/avis/${serviceSlug}/${locationSlug}`, 'page')
        revalidatePath(`/services/${serviceSlug}/${locationSlug}`, 'page')

        logger.info('Revalidated paths after client review submission', {
          providerId: provider_id,
          reviewId: review.id,
        })
      }
    } catch (revalError) {
      logger.error('Revalidation failed after client review:', revalError)
    }

    return NextResponse.json({
      success: true,
      review,
      message: 'Avis publié avec succès',
    })
  } catch (error) {
    logger.error('Client avis POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const result = clientUpdateReviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Erreur de validation', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { review_id, rating, content } = result.data

    // Verify the review belongs to this client via booking ownership
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('booking_id')
      .eq('id', review_id)
      .single()

    if (!existingReview) {
      return NextResponse.json({ error: 'Avis non trouvé ou non autorisé' }, { status: 403 })
    }

    const { data: ownerBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', existingReview.booking_id)
      .eq('client_id', user.id)
      .single()

    if (!ownerBooking) {
      return NextResponse.json({ error: 'Avis non trouvé ou non autorisé' }, { status: 403 })
    }

    // Update review
    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        rating,
        content,
      })
      .eq('id', review_id)

    if (updateError) {
      logger.error('Error updating review:', updateError)
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour de l'avis" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Avis mis à jour avec succès',
    })
  } catch (error) {
    logger.error('Client avis PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = {
      id: searchParams.get('id'),
    }
    const result = clientDeleteReviewSchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const review_id = result.data.id

    // Verify the review belongs to this client via booking ownership
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('booking_id')
      .eq('id', review_id)
      .single()

    if (!existingReview) {
      return NextResponse.json({ error: 'Avis non trouvé ou non autorisé' }, { status: 403 })
    }

    const { data: ownerBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', existingReview.booking_id)
      .eq('client_id', user.id)
      .single()

    if (!ownerBooking) {
      return NextResponse.json({ error: 'Avis non trouvé ou non autorisé' }, { status: 403 })
    }

    // Delete review
    const { error: deleteError } = await supabase.from('reviews').delete().eq('id', review_id)

    if (deleteError) {
      logger.error('Error deleting review:', deleteError)
      return NextResponse.json(
        { error: "Erreur lors de la suppression de l'avis" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Avis supprimé avec succès',
    })
  } catch (error) {
    logger.error('Client avis DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
