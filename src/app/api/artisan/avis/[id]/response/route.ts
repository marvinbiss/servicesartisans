import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { isValidUUID } from '@/lib/validation/uuid'
import { z } from 'zod'
import { sanitizeUserInput } from '@/lib/sanitize'

// POST request schema
const reviewResponseSchema = z.object({
  response: z.string().min(10, 'La réponse doit contenir au moins 10 caractères').max(2000),
})

export const dynamic = 'force-dynamic'

// POST - Respond to a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const body = await request.json()
    const result = reviewResponseSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Erreur de validation', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { response } = result.data

    // Check review belongs to this artisan and has no response yet
    // reviews.artisan_id → profiles.id, which equals user.id directly
    const { data: review } = await supabase
      .from('reviews')
      .select('id, artisan_id, artisan_response')
      .eq('id', id)
      .eq('artisan_id', user!.id)
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
        artisan_response: sanitizeUserInput(response.trim()),
        artisan_responded_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) throw updateError

    // Revalidate public artisan page (ISR cache bust)
    try {
      const { data: provider } = await supabase
        .from('providers')
        .select('specialty, address_city, slug, stable_id')
        .eq('user_id', user!.id)
        .single()

      if (provider) {
        const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-')
        const serviceSlug = toSlug(provider.specialty || '')
        const locationSlug = toSlug(provider.address_city || '')
        if (serviceSlug && locationSlug && provider.stable_id) {
          revalidatePath(`/services/${serviceSlug}/${locationSlug}/${provider.stable_id}`)
          revalidatePath(`/services/${serviceSlug}/${locationSlug}`)
        }
      }
    } catch (revalidateError) {
      logger.error('Revalidation error after review response:', revalidateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Review response error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
