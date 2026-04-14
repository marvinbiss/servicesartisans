/**
 * Review Vote API - ServicesArtisans
 * Handles "Was this review helpful?" votes.
 *
 * Rate limited to 10 votes per hour per IP.
 * Server-side deduplication via IP+reviewId tracking in memory
 * (review_votes table was dropped).
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

const voteSchema = z.object({
  reviewId: z.string().uuid(),
})

export const dynamic = 'force-dynamic'

// In-memory deduplication: track IP+reviewId combos to prevent duplicate votes
// Map<"ip:reviewId", timestamp>
const voteDedup = new Map<string, number>()
const DEDUP_TTL = 24 * 60 * 60 * 1000 // 24 hours

function cleanupDedup() {
  if (voteDedup.size > 50_000) {
    const now = Date.now()
    voteDedup.forEach((ts, key) => {
      if (now - ts > DEDUP_TTL) voteDedup.delete(key)
    })
  }
}

export async function POST(request: Request) {
  try {
    // Rate limiting: 10 votes per hour per IP
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`review-vote:${ip}`, { window: 3_600_000, max: 10 })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de votes, veuillez réessayer plus tard' } },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
        }
      )
    }

    const body = await request.json()
    const result = voteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Requête invalide', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { reviewId } = result.data

    // Server-side duplicate vote prevention (IP + reviewId)
    cleanupDedup()
    const dedupKey = `${ip}:${reviewId}`
    if (voteDedup.has(dedupKey)) {
      return NextResponse.json(
        { success: false, error: { message: 'Vous avez déjà voté pour cet avis' } },
        { status: 409 }
      )
    }

    const adminSupabase = createAdminClient()

    // Verify the review exists and is published
    const { data: review, error: fetchError } = await adminSupabase
      .from('reviews')
      .select('id, helpful_count')
      .eq('id', reviewId)
      .eq('status', 'published')
      .single()

    if (fetchError || !review) {
      return NextResponse.json(
        { success: false, error: { message: 'Avis non trouvé ou non publié' } },
        { status: 404 }
      )
    }

    // Increment and record the vote
    const newCount = (review.helpful_count ?? 0) + 1
    const { error: updateError } = await adminSupabase
      .from('reviews')
      .update({ helpful_count: newCount })
      .eq('id', reviewId)

    if (updateError) throw updateError

    // Mark this IP+review combo as voted
    voteDedup.set(dedupKey, Date.now())

    return NextResponse.json({ success: true, helpful_count: newCount })
  } catch (error) {
    logger.error('Erreur vote avis:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur lors du vote' } },
      { status: 500 }
    )
  }
}
