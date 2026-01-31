/**
 * Review Vote API - ServicesArtisans
 * Handles "Was this review helpful?" votes
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { reviewId, isHelpful } = body

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId requis' },
        { status: 400 }
      )
    }

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
