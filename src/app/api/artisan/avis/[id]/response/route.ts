import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// POST request schema
const reviewResponseSchema = z.object({
  response: z.string().min(10, 'La réponse doit contenir au moins 10 caractères').max(2000),
})

export const dynamic = 'force-dynamic'

// POST - Respond to a review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentification requise' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = reviewResponseSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation error', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { response } = result.data

    // Check review belongs to this artisan and has no response yet
    // reviews.artisan_id → profiles.id, which equals user.id directly
    const { data: review } = await supabase
      .from('reviews')
      .select('id, artisan_id, artisan_response')
      .eq('id', params.id)
      .eq('artisan_id', user.id)
      .single()

    if (!review) {
      return NextResponse.json(
        { success: false, error: { message: 'Avis non trouvé' } },
        { status: 404 }
      )
    }

    if (review.artisan_response) {
      return NextResponse.json(
        { success: false, error: { message: 'Cet avis a déjà une réponse' } },
        { status: 400 }
      )
    }

    // Update review with response
    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        artisan_response: response.trim(),
        artisan_responded_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Review response error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
