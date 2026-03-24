/**
 * Review Vote API - ServicesArtisans
 * Handles "Was this review helpful?" votes.
 *
 * NOTE: The `review_votes` table was dropped. Deduplication is no longer
 * performed server-side — we simply increment `helpful_count` on the
 * `reviews` row. Client-side localStorage prevents casual double-votes.
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const voteSchema = z.object({
  reviewId: z.string().uuid(),
})

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = voteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Requête invalide', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { reviewId } = result.data

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

    // Simple increment — review_votes table was dropped, no server-side dedup
    const newCount = (review.helpful_count ?? 0) + 1
    const { error: updateError } = await adminSupabase
      .from('reviews')
      .update({ helpful_count: newCount })
      .eq('id', reviewId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, helpful_count: newCount })
  } catch (error) {
    logger.error('Erreur vote avis:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur lors du vote' } },
      { status: 500 }
    )
  }
}
