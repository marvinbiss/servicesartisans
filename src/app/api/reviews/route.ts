/**
 * Reviews API - ServicesArtisans
 * Thin handler: parse request, validate, call service, return response
 */

import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { createReviewSchema, validateRequest, formatZodErrors } from '@/lib/validations/schemas'
import { createErrorResponse, createSuccessResponse, ErrorCode } from '@/lib/errors/types'
import { z } from 'zod'
import {
  getArtisanDisplayName,
  computeReviewStats,
  generateReviewToken,
  createReview,
} from '@/lib/services/review-service'
import type { BookingWithRelations } from '@/lib/services/review-service'

// Initialize Supabase client (anon key only — RLS enforced)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing')
  }

  return createSupabaseClient(supabaseUrl, supabaseKey)
}

// Query schema for GET request
const getQuerySchema = z
  .object({
    bookingId: z.string().uuid('ID de réservation invalide').optional(),
    artisanId: z.string().uuid().optional(),
  })
  .refine((data) => data.bookingId || data.artisanId, {
    message: 'bookingId ou artisanId requis',
  })

export const dynamic = 'force-dynamic'

// GET /api/reviews - Get booking info for review or artisan reviews
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

    // Get booking info for review submission
    if (bookingId) {
      const { data: booking, error } = await supabase
        .from('bookings')
        .select(
          `
          id,
          client_id,
          provider_id,
          service_name,
          status,
          client:profiles!client_id(full_name, email, phone_e164),
          artisan:providers!bookings_provider_id_fkey(id, name)
        `
        )
        .eq('id', bookingId)
        .single()

      if (error || !booking) {
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

      // Generate reviewToken only for authenticated client of this booking
      let reviewToken: string | undefined
      try {
        const authSupabase = await createServerClient()
        const {
          data: { user },
        } = await authSupabase.auth.getUser()
        if (user && typedBooking.client_id === user.id) {
          reviewToken = generateReviewToken(bookingId) ?? undefined
        }
      } catch {
        // Auth check failed — no token returned
      }

      return NextResponse.json(
        createSuccessResponse({
          artisanName: getArtisanDisplayName(typedBooking.artisan),
          serviceName: typedBooking.service_name || 'Service',
          alreadyReviewed: !!existingReview,
          ...(reviewToken ? { reviewToken } : {}),
        })
      )
    }

    // Get published reviews for an artisan
    if (artisanId) {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(
          `
          id,
          rating,
          content,
          would_recommend,
          author_name,
          created_at,
          reply,
          reply_date
        `
        )
        .eq('provider_id', artisanId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Database error:', error)
        return NextResponse.json(
          createErrorResponse(ErrorCode.DATABASE_ERROR, 'Erreur lors de la recuperation des avis'),
          { status: 500 }
        )
      }

      const typedReviews = (reviews || []) as {
        id: string
        rating: number
        content: string | null
        would_recommend: boolean
        author_name: string
        created_at: string
        reply: string | null
        reply_date: string | null
      }[]

      const stats = computeReviewStats(typedReviews)

      return NextResponse.json(
        createSuccessResponse({
          reviews: typedReviews,
          stats,
        })
      )
    }

    return NextResponse.json(
      createErrorResponse(ErrorCode.VALIDATION_ERROR, 'bookingId ou artisanId requis'),
      { status: 400 }
    )
  } catch (error) {
    logger.error('Reviews GET error:', error)
    return NextResponse.json(createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Erreur serveur'), {
      status: 500,
    })
  }
}

// POST /api/reviews - Submit a review
export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`reviews:${ip}`, { window: 60_000, max: 5 })
    if (!rl.allowed) {
      return NextResponse.json(
        createErrorResponse(
          ErrorCode.RATE_LIMIT_EXCEEDED,
          'Trop de requêtes, veuillez réessayer plus tard'
        ),
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
        }
      )
    }

    const body = await request.json()

    // Validate request body
    const validation = validateRequest(createReviewSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Donnees invalides', {
          fields: formatZodErrors(validation.errors),
        }),
        { status: 400 }
      )
    }

    const { bookingId, rating, comment, reviewToken } = validation.data
    const wouldRecommend = body.wouldRecommend ?? true

    // Validate bookingId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(bookingId)) {
      return NextResponse.json(
        createErrorResponse(ErrorCode.VALIDATION_ERROR, 'ID de réservation invalide'),
        { status: 400 }
      )
    }

    // Auth check: reviewer must be authenticated
    const authSupabase = await createServerClient()
    const {
      data: { user },
    } = await authSupabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        createErrorResponse(
          ErrorCode.UNAUTHORIZED,
          'Authentification requise pour laisser un avis'
        ),
        { status: 401 }
      )
    }

    // Use admin client (RLS deny-all on reviews INSERT since migration 414)
    const supabase = createAdminClient()

    // Call service
    const result = await createReview(supabase, {
      bookingId,
      userId: user.id,
      rating,
      comment,
      wouldRecommend,
      reviewToken,
    })

    if (!result.success) {
      switch (result.code) {
        case 'booking_not_found':
          return NextResponse.json(
            createErrorResponse(ErrorCode.NOT_FOUND, 'Reservation non trouvee'),
            { status: 404 }
          )
        case 'not_owner':
          return NextResponse.json(
            createErrorResponse(
              ErrorCode.UNAUTHORIZED,
              'Vous ne pouvez laisser un avis que pour vos propres réservations'
            ),
            { status: 403 }
          )
        case 'missing_token':
          return NextResponse.json(
            createErrorResponse(ErrorCode.REVIEW_TOKEN_INVALID, 'Token de vérification requis'),
            { status: 403 }
          )
        case 'invalid_token':
          return NextResponse.json(createErrorResponse(ErrorCode.UNAUTHORIZED, 'Token invalide'), {
            status: 401,
          })
        case 'wrong_status':
          return NextResponse.json(
            createErrorResponse(
              ErrorCode.VALIDATION_ERROR,
              'Cette reservation ne peut pas etre evaluee'
            ),
            { status: 400 }
          )
        case 'already_reviewed':
          return NextResponse.json(
            createErrorResponse(
              ErrorCode.REVIEW_ALREADY_EXISTS,
              'Vous avez déjà laissé un avis pour cette réservation'
            ),
            { status: 409 }
          )
        case 'db_error':
          return NextResponse.json(
            createErrorResponse(ErrorCode.DATABASE_ERROR, "Erreur lors de la creation de l'avis"),
            { status: 500 }
          )
      }
    }

    return NextResponse.json(
      createSuccessResponse({
        review: {
          id: result.success ? result.reviewId : undefined,
          status: result.success ? result.status : undefined,
        },
        message:
          result.success && result.fraudDetected
            ? 'Votre avis sera publie apres verification'
            : 'Merci pour votre avis !',
      }),
      { status: 201 }
    )
  } catch (error) {
    logger.error('Reviews POST error:', error)
    return NextResponse.json(
      createErrorResponse(ErrorCode.INTERNAL_ERROR, "Erreur lors de l'envoi de l'avis"),
      { status: 500 }
    )
  }
}
