/**
 * Reviews API - ServicesArtisans
 * Handles review submission and retrieval with proper validation
 * World-class review system with fraud detection
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { createReviewSchema, validateRequest, formatZodErrors } from '@/lib/validations/schemas'
import { createErrorResponse, createSuccessResponse, ErrorCode } from '@/lib/errors/types'
import { z } from 'zod'
import type { SupabaseClientType } from '@/types'

// Type definitions for database responses
interface BookingSlot {
  date: string
}

interface ArtisanProfile {
  full_name: string | null
  company_name: string | null
  business_name: string | null
  first_name: string | null
  last_name: string | null
}

interface BookingWithRelations {
  id: string
  client_name: string
  client_email: string
  service_description: string | null
  artisan_id: string
  status: string
  slot: BookingSlot | BookingSlot[] | null
  artisan: ArtisanProfile | ArtisanProfile[] | null
}

interface Review {
  id: string
  rating: number
  comment: string | null
  would_recommend: boolean
  client_name: string
  created_at: string
  artisan_response: string | null
  artisan_responded_at: string | null
}

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing')
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Helper to get artisan display name
function getArtisanDisplayName(artisan: ArtisanProfile | ArtisanProfile[] | null): string {
  if (!artisan) return 'Artisan'

  const profile = Array.isArray(artisan) ? artisan[0] : artisan

  return profile?.company_name ||
    profile?.business_name ||
    profile?.full_name ||
    (profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : 'Artisan')
}

// Helper to get slot date
function getSlotDate(slot: BookingSlot | BookingSlot[] | null): string | null {
  if (!slot) return null
  const slotData = Array.isArray(slot) ? slot[0] : slot
  return slotData?.date || null
}

// Query schema for GET request - require full UUID for bookingId to prevent enumeration
const getQuerySchema = z.object({
  bookingId: z.string().uuid('ID de réservation invalide').optional(),
  artisanId: z.string().uuid().optional(),
}).refine(data => data.bookingId || data.artisanId, {
  message: 'bookingId ou artisanId requis',
})

// GET /api/reviews - Get booking info for review or artisan reviews
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const queryValidation = getQuerySchema.safeParse({
      bookingId: searchParams.get('bookingId') || undefined,
      artisanId: searchParams.get('artisanId') || undefined,
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          queryValidation.error.issues[0]?.message || 'Parametres invalides'
        ),
        { status: 400 }
      )
    }

    const { bookingId, artisanId } = queryValidation.data
    const supabase = getSupabaseClient()

    // Get booking info for review submission - use exact match to prevent enumeration
    if (bookingId) {
      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          id,
          client_name,
          service_description,
          artisan_id,
          slot:availability_slots(date),
          artisan:profiles!bookings_artisan_id_fkey(full_name, company_name, business_name, first_name, last_name)
        `)
        .eq('id', bookingId)
        .single()

      if (error || !booking) {
        // Don't reveal whether the booking exists or not to prevent enumeration
        return NextResponse.json(
          createErrorResponse(ErrorCode.NOT_FOUND, 'Reservation non trouvee'),
          { status: 404 }
        )
      }

      const typedBooking = booking as BookingWithRelations

      // Check if already reviewed
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', typedBooking.id)
        .single()

      const slotDate = getSlotDate(typedBooking.slot)

      return NextResponse.json(
        createSuccessResponse({
          artisanName: getArtisanDisplayName(typedBooking.artisan),
          serviceName: typedBooking.service_description || 'Service',
          date: slotDate
            ? new Date(slotDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : '',
          alreadyReviewed: !!existingReview,
        })
      )
    }

    // Get ALL reviews for an artisan (no status filter to show all real reviews)
    if (artisanId) {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          would_recommend,
          client_name,
          created_at,
          artisan_response,
          artisan_responded_at
        `)
        .eq('artisan_id', artisanId)
        // REMOVED: .eq('status', 'published') to show ALL real reviews
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Database error:', error)
        return NextResponse.json(
          createErrorResponse(ErrorCode.DATABASE_ERROR, 'Erreur lors de la recuperation des avis'),
          { status: 500 }
        )
      }

      const typedReviews = (reviews || []) as Review[]

      // Calculate stats
      const totalReviews = typedReviews.length
      const avgRating = totalReviews > 0
        ? typedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0
      const recommendRate = totalReviews > 0
        ? (typedReviews.filter((r) => r.would_recommend).length / totalReviews) * 100
        : 0

      // Rating distribution
      const distribution = [0, 0, 0, 0, 0]
      typedReviews.forEach((r) => {
        if (r.rating >= 1 && r.rating <= 5) {
          distribution[r.rating - 1]++
        }
      })

      return NextResponse.json(
        createSuccessResponse({
          reviews: typedReviews,
          stats: {
            total: totalReviews,
            average: Math.round(avgRating * 10) / 10,
            recommendRate: Math.round(recommendRate),
            distribution,
          },
        })
      )
    }

    return NextResponse.json(
      createErrorResponse(ErrorCode.VALIDATION_ERROR, 'bookingId ou artisanId requis'),
      { status: 400 }
    )
  } catch (error) {
    logger.error('Reviews GET error:', error)
    return NextResponse.json(
      createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Erreur serveur'),
      { status: 500 }
    )
  }
}

// POST /api/reviews - Submit a review
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = validateRequest(createReviewSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Donnees invalides',
          { fields: formatZodErrors(validation.errors) }
        ),
        { status: 400 }
      )
    }

    const { bookingId, rating, comment } = validation.data
    const wouldRecommend = body.wouldRecommend ?? true

    // Validate bookingId is a valid UUID to prevent enumeration
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(bookingId)) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.VALIDATION_ERROR, 'ID de réservation invalide'),
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // Find the booking using exact match to prevent enumeration
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, artisan_id, client_name, client_email, status')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      // Generic error to prevent enumeration
      return NextResponse.json(
        createErrorResponse(ErrorCode.NOT_FOUND, 'Reservation non trouvee'),
        { status: 404 }
      )
    }

    // Check booking status
    if (!['confirmed', 'completed'].includes(booking.status)) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Cette reservation ne peut pas etre evaluee'),
        { status: 400 }
      )
    }

    // Check if already reviewed
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', booking.id)
      .single()

    if (existingReview) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.REVIEW_ALREADY_EXISTS, 'Vous avez déjà laissé un avis pour cette réservation'),
        { status: 409 }
      )
    }

    // Basic fraud detection
    const cleanComment = comment.trim()
    const fraudIndicators = detectFraudIndicators(cleanComment, rating)

    // Create the review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        booking_id: booking.id,
        artisan_id: booking.artisan_id,
        client_name: booking.client_name,
        client_email: booking.client_email,
        rating,
        comment: cleanComment,
        would_recommend: wouldRecommend,
        status: fraudIndicators.length > 0 ? 'pending_review' : 'published',
        fraud_indicators: fraudIndicators.length > 0 ? fraudIndicators : null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      logger.error('Review insert error:', insertError)
      return NextResponse.json(
        createErrorResponse(ErrorCode.DATABASE_ERROR, 'Erreur lors de la creation de l\'avis'),
        { status: 500 }
      )
    }

    // Update artisan's average rating (non-blocking)
    updateArtisanRating(supabase, booking.artisan_id).catch((err) => logger.error('Update rating failed', err))

    // Award loyalty points if applicable (non-blocking)
    awardReviewPoints(supabase, booking.artisan_id, booking.client_email).catch((err) => logger.error('Award points failed', err))

    return NextResponse.json(
      createSuccessResponse({
        review: {
          id: review.id,
          status: review.status,
        },
        message: fraudIndicators.length > 0
          ? 'Votre avis sera publie apres verification'
          : 'Merci pour votre avis !',
      }),
      { status: 201 }
    )
  } catch (error) {
    logger.error('Reviews POST error:', error)
    return NextResponse.json(
      createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Erreur lors de l\'envoi de l\'avis'),
      { status: 500 }
    )
  }
}

// Fraud detection helper
function detectFraudIndicators(comment: string, rating: number): string[] {
  const indicators: string[] = []

  if (comment.length > 0) {
    // All caps
    if (comment === comment.toUpperCase() && comment.length > 20) {
      indicators.push('all_caps')
    }

    // Repeated characters
    if (/(.)\1{4,}/.test(comment)) {
      indicators.push('repeated_chars')
    }

    // Links
    if (/https?:\/\/|www\./i.test(comment)) {
      indicators.push('contains_links')
    }

    // Excessive punctuation
    if (/[!?]{3,}/.test(comment)) {
      indicators.push('excessive_punctuation')
    }

    // Very short extreme rating
    if (comment.length < 10 && (rating === 1 || rating === 5)) {
      indicators.push('short_extreme_rating')
    }
  }

  return indicators
}

// Update artisan's average rating (using ALL real reviews, not just published)
async function updateArtisanRating(supabase: SupabaseClientType, artisanId: string) {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('artisan_id', artisanId)
    // REMOVED: .eq('status', 'published') to include ALL real reviews in rating calculation

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length

    await supabase
      .from('profiles')
      .update({
        average_rating: Math.round(avgRating * 10) / 10,
        review_count: reviews.length,
      })
      .eq('id', artisanId)
  }
}

// Award points for leaving a review
async function awardReviewPoints(
  supabase: SupabaseClientType,
  artisanId: string,
  clientEmail: string
) {
  try {
    await supabase.from('loyalty_points').insert({
      artisan_id: artisanId,
      client_email: clientEmail,
      points: 10,
      reason: 'Avis laisse',
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    // Non-critical, log and continue
    logger.error('Failed to award review points:', error)
  }
}
