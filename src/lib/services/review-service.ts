/**
 * Review Service — Business logic for review processing
 * Framework-agnostic: no NextRequest/NextResponse
 */

import { revalidatePath } from 'next/cache'
import { createHmac, timingSafeEqual } from 'crypto'
import { logger } from '@/lib/logger'
import { slugify } from '@/lib/utils'
import { submitToIndexNow } from '@/lib/seo/indexnow'
import type { SupabaseClientType } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClientProfile {
  full_name: string | null
  email: string | null
  phone_e164: string | null
}

interface ArtisanProfile {
  id: string
  name: string | null
}

export interface BookingWithRelations {
  id: string
  client_id: string
  provider_id: string
  service_name: string | null
  status: string
  client: ClientProfile | ClientProfile[] | null
  artisan: ArtisanProfile | ArtisanProfile[] | null
}

export interface ReviewStats {
  total: number
  average: number
  recommendRate: number
  distribution: number[]
}

interface Review {
  id: string
  rating: number
  content: string | null
  would_recommend: boolean
  author_name: string
  created_at: string
  reply: string | null
  reply_date: string | null
}

export type CreateReviewResult =
  | { success: true; reviewId: string; status: string; fraudDetected: boolean }
  | {
      success: false
      code:
        | 'booking_not_found'
        | 'not_owner'
        | 'invalid_token'
        | 'wrong_status'
        | 'already_reviewed'
        | 'missing_token'
        | 'db_error'
    }

export interface BookingInfoResult {
  artisanName: string
  serviceName: string
  alreadyReviewed: boolean
  reviewToken?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get artisan display name from joined data */
export function getArtisanDisplayName(artisan: ArtisanProfile | ArtisanProfile[] | null): string {
  if (!artisan) return 'Artisan'
  const profile = Array.isArray(artisan) ? artisan[0] : artisan
  return profile?.name || 'Artisan'
}

/** Get client info from profiles join */
export function getClientInfo(client: ClientProfile | ClientProfile[] | null): {
  name: string
  email: string
  phone: string | null
} {
  if (!client) return { name: 'Client', email: '', phone: null }
  const profile = Array.isArray(client) ? client[0] : client
  return {
    name: profile?.full_name || 'Client',
    email: profile?.email || '',
    phone: profile?.phone_e164 || null,
  }
}

// ---------------------------------------------------------------------------
// Fraud detection
// ---------------------------------------------------------------------------

export function detectFraudIndicators(comment: string, rating: number): string[] {
  const indicators: string[] = []

  if (comment.length > 0) {
    if (comment === comment.toUpperCase() && comment.length > 20) {
      indicators.push('all_caps')
    }
    if (/(.)\1{4,}/.test(comment)) {
      indicators.push('repeated_chars')
    }
    if (/https?:\/\/|www\./i.test(comment)) {
      indicators.push('contains_links')
    }
    if (/[!?]{3,}/.test(comment)) {
      indicators.push('excessive_punctuation')
    }
    if (comment.length < 10 && (rating === 1 || rating === 5)) {
      indicators.push('short_extreme_rating')
    }
  }

  return indicators
}

// ---------------------------------------------------------------------------
// HMAC token
// ---------------------------------------------------------------------------

export function generateReviewToken(bookingId: string): string | null {
  const secret = process.env.REVIEW_HMAC_SECRET
  if (!secret) return null
  return createHmac('sha256', secret).update(bookingId).digest('hex').slice(0, 32)
}

export function verifyReviewToken(bookingId: string, token: string): boolean {
  const secret = process.env.REVIEW_HMAC_SECRET
  if (!secret) return false

  const expected = createHmac('sha256', secret).update(bookingId).digest('hex').slice(0, 32)
  const provided = Buffer.from(token, 'hex')
  const expectedBuf = Buffer.from(expected, 'hex')
  if (provided.length !== expectedBuf.length) return false

  try {
    return timingSafeEqual(provided, expectedBuf)
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Review stats computation
// ---------------------------------------------------------------------------

export function computeReviewStats(reviews: Review[]): ReviewStats {
  const totalReviews = reviews.length
  const avgRating =
    totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0
  const recommendRate =
    totalReviews > 0 ? (reviews.filter((r) => r.would_recommend).length / totalReviews) * 100 : 0

  const distribution = [0, 0, 0, 0, 0]
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating - 1]++
    }
  })

  return {
    total: totalReviews,
    average: Math.round(avgRating * 10) / 10,
    recommendRate: Math.round(recommendRate),
    distribution,
  }
}

// ---------------------------------------------------------------------------
// Update artisan rating
// ---------------------------------------------------------------------------

export async function updateArtisanRating(
  supabase: SupabaseClientType,
  providerId: string
): Promise<void> {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('provider_id', providerId)

  if (reviews && reviews.length > 0) {
    const avgRating =
      reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length

    await supabase
      .from('providers')
      .update({
        rating_average: Math.round(avgRating * 10) / 10,
        review_count: reviews.length,
      })
      .eq('id', providerId)
  }
}

// ---------------------------------------------------------------------------
// Revalidate paths after review
// ---------------------------------------------------------------------------

export async function revalidateReviewPaths(
  supabase: SupabaseClientType,
  providerId: string,
  reviewId: string
): Promise<void> {
  try {
    const { data: providerData } = await supabase
      .from('providers')
      .select('specialty, address_city, slug, stable_id')
      .eq('id', providerId)
      .single()

    if (!providerData) return

    const serviceSlug = slugify(providerData.specialty || 'artisan')
    const locationSlug = slugify(providerData.address_city || 'france')
    const publicId = providerData.slug || providerData.stable_id

    // Tous les templates pSEO qui consomment rating_average / review_count
    // et émettent Schema.org aggregateRating. Revalidate + IndexNow pour
    // que Google repush les étoiles SERP en 24-48h au lieu de 2-3 semaines
    // de recrawl naturel.
    const listingPaths = [
      `/services/${serviceSlug}/${locationSlug}`,
      `/avis/${serviceSlug}/${locationSlug}`,
      `/tarifs/${serviceSlug}/${locationSlug}`,
      `/urgence/${serviceSlug}/${locationSlug}`,
      `/devis/${serviceSlug}/${locationSlug}`,
      `/rge/${serviceSlug}/${locationSlug}`,
    ]
    const pathsToRevalidate = [...listingPaths]
    if (publicId) {
      pathsToRevalidate.push(`/services/${serviceSlug}/${locationSlug}/${publicId}`)
    }

    for (const p of pathsToRevalidate) {
      try {
        revalidatePath(p, 'page')
      } catch (e) {
        // Un template absent (ex: /rge pour un service non-RGE) ne doit
        // pas casser la revalidation des autres. Next.js throw si le path
        // ne matche aucune route.
        logger.warn(`Revalidate skipped for ${p}`, {
          error: e instanceof Error ? e.message : String(e),
        })
      }
    }

    // IndexNow push fire-and-forget : pas dans le chemin critique du
    // submit review, mais accélère fortement l'apparition des étoiles
    // en SERP. L'endpoint IndexNow accepte jusqu'à 10K URLs par batch.
    submitToIndexNow(pathsToRevalidate).catch((e) =>
      logger.warn('IndexNow push failed after review submission', {
        error: e instanceof Error ? e.message : String(e),
      })
    )

    logger.info('Revalidated paths after review submission', {
      providerId,
      reviewId,
      paths: pathsToRevalidate.length,
    })
  } catch (revalError) {
    logger.error('Revalidation failed after review submission:', revalError)
  }
}

// ---------------------------------------------------------------------------
// Create review
// ---------------------------------------------------------------------------

export async function createReview(
  supabase: SupabaseClientType,
  params: {
    bookingId: string
    userId: string
    rating: number
    comment: string
    wouldRecommend: boolean
    reviewToken: string | undefined
  }
): Promise<CreateReviewResult> {
  const { bookingId, userId, rating, comment, wouldRecommend, reviewToken } = params

  // --- Find booking ---
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(
      `
      id,
      client_id,
      provider_id,
      status,
      client:profiles!client_id(full_name, email, phone_e164)
    `
    )
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    return { success: false, code: 'booking_not_found' }
  }

  // --- Auth: reviewer must be booking client ---
  if (booking.client_id !== userId) {
    return { success: false, code: 'not_owner' }
  }

  // --- HMAC token validation ---
  if (!process.env.REVIEW_HMAC_SECRET || !reviewToken) {
    return { success: false, code: 'missing_token' }
  }
  if (!verifyReviewToken(bookingId, reviewToken)) {
    return { success: false, code: 'invalid_token' }
  }

  // --- Booking status ---
  if (!['confirmed', 'completed'].includes(booking.status)) {
    return { success: false, code: 'wrong_status' }
  }

  // --- Duplicate check ---
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', booking.id)
    .single()

  if (existingReview) {
    return { success: false, code: 'already_reviewed' }
  }

  // --- Extract client info ---
  const clientInfo = getClientInfo(booking.client as ClientProfile | ClientProfile[] | null)

  // --- Fraud detection ---
  const cleanComment = comment.trim()
  const fraudIndicators = detectFraudIndicators(cleanComment, rating)

  // --- Insert review ---
  const { data: review, error: insertError } = await supabase
    .from('reviews')
    .insert({
      booking_id: booking.id,
      provider_id: booking.provider_id,
      author_name: clientInfo.name,
      author_email: clientInfo.email,
      rating,
      content: cleanComment,
      would_recommend: wouldRecommend,
      status: fraudIndicators.length > 0 ? 'pending_review' : 'published',
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError) {
    logger.error('Review insert error:', insertError)
    return { success: false, code: 'db_error' }
  }

  // --- Post-insert side effects (non-blocking) ---
  updateArtisanRating(supabase, booking.provider_id).catch((err) =>
    logger.error('Update rating failed', err)
  )
  revalidateReviewPaths(supabase, booking.provider_id, review.id).catch(() => {
    // already logged inside
  })

  return {
    success: true,
    reviewId: review.id,
    status: review.status,
    fraudDetected: fraudIndicators.length > 0,
  }
}
