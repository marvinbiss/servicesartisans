import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { isValidUUID } from '@/lib/validation/uuid'
import { z } from 'zod'
import { sanitizeUserInput } from '@/lib/sanitize'
import { slugify } from '@/lib/utils'
import {
  getActiveProviderIdByUserId,
  getReviewByIdForProvider,
  updateReviewReply,
  getProviderForRevalidation,
} from '@/lib/services/artisan-profile-service'

// POST request schema
const reviewResponseSchema = z.object({
  response: z.string().min(10, 'La réponse doit contenir au moins 10 caractères').max(2000),
})

export const dynamic = 'force-dynamic'

// POST - Respond to a review
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non authentifié' } },
        { status: 401 }
      )
    }

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
        {
          success: false,
          error: { message: 'Erreur de validation', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const { response } = result.data

    // Resolve this user's provider.id (reviews.provider_id → providers.id)
    const { data: providerRow } = await getActiveProviderIdByUserId(supabase, user.id)

    const providerId = providerRow?.id
    if (!providerId) {
      return NextResponse.json(
        { success: false, error: { message: 'Avis non trouvé' } },
        { status: 404 }
      )
    }

    // Check review belongs to this provider and has no reply yet
    const { data: review } = await getReviewByIdForProvider(supabase, id, providerId)

    if (!review) {
      return NextResponse.json(
        { success: false, error: { message: 'Avis non trouvé' } },
        { status: 404 }
      )
    }

    if (review.reply) {
      return NextResponse.json(
        { success: false, error: { message: 'Cet avis a déjà une réponse' } },
        { status: 400 }
      )
    }

    // Update review with reply
    const { error: updateError } = await updateReviewReply(
      supabase,
      id,
      providerId,
      sanitizeUserInput(response.trim())
    )

    if (updateError) throw updateError

    // Revalidate public artisan page (ISR cache bust)
    try {
      const { data: provider } = await getProviderForRevalidation(supabase, user.id)

      if (provider) {
        // 2026-06-07 : slugify accent-safe + slug || stable_id (cf. provider/route.ts)
        const serviceSlug = slugify(provider.specialty || '')
        const locationSlug = slugify(provider.address_city || '')
        const publicId = provider.slug || provider.stable_id
        if (serviceSlug && locationSlug && publicId) {
          revalidatePath(`/services/${serviceSlug}/${locationSlug}/${publicId}`, 'page')
          revalidatePath(`/services/${serviceSlug}/${locationSlug}`, 'page')
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
