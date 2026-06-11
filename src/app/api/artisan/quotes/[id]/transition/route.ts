/**
 * Artisan Quotes — transition de statut (table provider_quotes, mig 547)
 * POST /api/artisan/quotes/[id]/transition  body: { to: QuoteStatus }
 *
 * Au passage en 'envoye' : attribue le numéro (RPC next_document_number) + le
 * token d'accès client. La validité de la transition est garantie par la
 * machine à états (lib/devis/state-machine).
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { getProviderIdByUserId } from '@/lib/services/artisan-profile-service'
import { isValidUUID } from '@/lib/validation/uuid'
import { logger } from '@/lib/logger'
import { quoteTransitionSchema } from '@/lib/devis'
import { transitionProviderQuote } from '@/lib/services/provider-quotes-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { data: provider } = await getProviderIdByUserId(supabase, user.id)
    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Profil artisan non trouvé' } },
        { status: 404 }
      )
    }

    const body = await req.json()
    const parsed = quoteTransitionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Transition invalide' } },
        { status: 400 }
      )
    }

    const { data, error } = await transitionProviderQuote(supabase, provider.id, id, parsed.data.to)

    if (error) {
      const status = error === 'NOT_FOUND' ? 404 : error === 'INVALID_TRANSITION' ? 409 : 500
      return NextResponse.json({ success: false, error: { message: error } }, { status })
    }

    return NextResponse.json({ success: true, status: data?.status })
  } catch (error) {
    logger.error('Artisan quotes transition error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
