/**
 * Facture d'acompte issue d'un devis accepté.
 * POST /api/artisan/quotes/[id]/invoices  → crée la facture d'acompte (idempotent).
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { getProviderIdByUserId } from '@/lib/services/artisan-profile-service'
import { isValidUUID } from '@/lib/validation/uuid'
import { logger } from '@/lib/logger'
import { createAcompteInvoice, listInvoicesByQuote } from '@/lib/services/provider-invoices-service'

export const dynamic = 'force-dynamic'

const NO_STORE = { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { data, error } = await listInvoicesByQuote(supabase, provider.id, id)
    if (error) {
      return NextResponse.json(
        { success: false, error: { message: 'Erreur serveur' } },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true, invoices: data ?? [] }, NO_STORE)
  } catch (error) {
    logger.error('Artisan quote invoices GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

const errorStatus = (code: string): number => {
  switch (code) {
    case 'QUOTE_NOT_FOUND':
      return 404
    case 'QUOTE_NOT_ACCEPTED':
      return 409
    default:
      return 500
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

    const { data, error } = await createAcompteInvoice(supabase, provider.id, id)
    if (error || !data) {
      return NextResponse.json(
        { success: false, error: { message: error ?? 'Création impossible' } },
        { status: errorStatus(error ?? '') }
      )
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch (error) {
    logger.error('Artisan quote invoice create error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
