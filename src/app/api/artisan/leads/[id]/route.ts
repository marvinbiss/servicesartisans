/**
 * GET /api/artisan/leads/:id — Single lead detail for authenticated artisan
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { isValidUUID } from '@/lib/validation/uuid'
import { logger } from '@/lib/logger'
import { getProviderForUser, getLeadByIdForArtisan } from '@/lib/services/leads-service'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const provider = await getProviderForUser(supabase, user.id)

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Aucun profil artisan' } },
        { status: 403 }
      )
    }

    const assignment = await getLeadByIdForArtisan(supabase, id, provider.id)

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: { message: 'Lead non trouvé' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    logger.error('Lead detail GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
