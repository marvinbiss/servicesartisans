/**
 * Transmission e-facture via Iopole (PDP marque grise).
 * POST /api/artisan/invoices/[id]/transmit
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { getProviderIdByUserId } from '@/lib/services/artisan-profile-service'
import { isValidUUID } from '@/lib/validation/uuid'
import { logger } from '@/lib/logger'
import { transmitInvoice } from '@/lib/services/provider-invoices-service'

export const dynamic = 'force-dynamic'

const errorStatus = (code: string): number => {
  switch (code) {
    case 'NOT_FOUND':
    case 'QUOTE_NOT_FOUND':
    case 'PROVIDER_NOT_FOUND':
      return 404
    case 'EMITTER_SIREN_MISSING':
      return 422
    case 'IOPOLE_NOT_CONFIGURED':
      return 503
    default:
      return 502 // échec amont Iopole
  }
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { data, error } = await transmitInvoice(supabase, provider.id, id)
    if (error || !data) {
      const message =
        error === 'IOPOLE_NOT_CONFIGURED'
          ? 'Service e-facturation non configuré. Réessayez plus tard.'
          : error === 'EMITTER_SIREN_MISSING'
            ? 'SIRET manquant sur votre fiche : impossible d’identifier l’émetteur. Complétez votre SIRET.'
            : (error ?? 'Transmission impossible')
      return NextResponse.json(
        { success: false, error: { message } },
        { status: errorStatus(error ?? '') }
      )
    }

    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    logger.error('Artisan invoice transmit error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
