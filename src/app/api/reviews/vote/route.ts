/**
 * Review Vote API - ServicesArtisans
 * Handles "Was this review helpful?" votes
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// POST request schema
const voteSchema = z.object({
  reviewId: z.string().uuid(),
  isHelpful: z.boolean().optional().default(true),
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = voteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request', details: result.error.flatten() }, { status: 400 })
    }
    const { reviewId, isHelpful } = result.data

    // Get voter IP for deduplication
    const voterIp =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('review_votes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('voter_ip', voterIp)
      .single()

    if (existingVote) {
      return NextResponse.json(
        { error: 'Vous avez déjà voté pour cet avis' },
        { status: 400 }
      )
    }

    // Create vote
    const { error: insertError } = await supabase
      .from('review_votes')
      .insert({
        review_id: reviewId,
        voter_ip: voterIp,
        is_helpful: isHelpful !== false,
      })

    if (insertError) {
      // Ignore unique constraint violations (already voted)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Vous avez déjà voté pour cet avis' },
          { status: 400 }
        )
      }
      throw insertError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Review vote error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
