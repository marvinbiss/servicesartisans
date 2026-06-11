/**
 * Artisan Quotes — opérations par devis (table provider_quotes, mig 547)
 * GET    /api/artisan/quotes/[id]  — devis + lignes
 * PATCH  /api/artisan/quotes/[id]  — met à jour un devis brouillon (remplace lignes)
 * DELETE /api/artisan/quotes/[id]  — supprime un devis brouillon
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { getProviderIdByUserId } from '@/lib/services/artisan-profile-service'
import { isValidUUID } from '@/lib/validation/uuid'
import { logger } from '@/lib/logger'
import { quoteCreateSchema } from '@/lib/devis'
import {
  getProviderQuote,
  updateProviderQuote,
  deleteProviderQuote,
} from '@/lib/services/provider-quotes-service'

export const dynamic = 'force-dynamic'

const NO_STORE = { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }

const errorStatus = (code: string): number => {
  switch (code) {
    case 'NOT_FOUND':
      return 404
    case 'ONLY_DRAFT_EDITABLE':
    case 'ONLY_DRAFT_DELETABLE':
      return 403
    default:
      return 500
  }
}

async function resolve(idPromise: Promise<{ id: string }>) {
  const { id } = await idPromise
  const guard = await requireArtisan()
  return { id, ...guard }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id, error: guardError, user, supabase } = await resolve(params)
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

    const { data, error } = await getProviderQuote(supabase, provider.id, id)
    if (error || !data) {
      return NextResponse.json(
        { success: false, error: { message: 'Devis introuvable' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, quote: data }, NO_STORE)
  } catch (error) {
    logger.error('Artisan quotes [id] GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id, error: guardError, user, supabase } = await resolve(params)
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
    const parsed = quoteCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erreur de validation', details: parsed.error.flatten() },
        },
        { status: 400 }
      )
    }

    const { data, error } = await updateProviderQuote(supabase, provider.id, id, parsed.data)
    if (error || !data) {
      return NextResponse.json(
        { success: false, error: { message: error ?? 'Mise à jour impossible' } },
        { status: errorStatus(error ?? '') }
      )
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    logger.error('Artisan quotes [id] PATCH error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id, error: guardError, user, supabase } = await resolve(params)
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

    const { data, error } = await deleteProviderQuote(supabase, provider.id, id)
    if (error || !data) {
      return NextResponse.json(
        { success: false, error: { message: error ?? 'Suppression impossible' } },
        { status: errorStatus(error ?? '') }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Artisan quotes [id] DELETE error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
