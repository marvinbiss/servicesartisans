/**
 * Artisan Quotes (devis-light structuré, table provider_quotes — mig 547)
 * GET  /api/artisan/quotes        — liste paginée des devis de l'artisan
 * POST /api/artisan/quotes        — crée un devis (brouillon) + lignes
 *
 * ⚠️ Distinct de /api/artisan/devis (table legacy `quotes`, réponse plate à un lead).
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { getProviderIdByUserId } from '@/lib/services/artisan-profile-service'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { pageSchema } from '@/lib/validations/schemas'
import { quoteCreateSchema } from '@/lib/devis'
import { createProviderQuote, listProviderQuotes } from '@/lib/services/provider-quotes-service'

export const dynamic = 'force-dynamic'

const listQuerySchema = z.object({
  page: pageSchema,
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  status: z.string().max(20).default('all'),
})

const NO_STORE = { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }

export async function GET(request: NextRequest) {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    const { data: provider } = await getProviderIdByUserId(supabase, user.id)
    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Profil artisan non trouvé' } },
        { status: 404 }
      )
    }

    const { searchParams } = request.nextUrl
    const parsed = listQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    })
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Paramètres invalides' } },
        { status: 400 }
      )
    }

    const { data, error } = await listProviderQuotes(supabase, provider.id, parsed.data)
    if (error) {
      logger.error('Artisan quotes GET error:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur serveur' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, ...data }, NO_STORE)
  } catch (error) {
    logger.error('Artisan quotes GET exception:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    const { data: provider } = await getProviderIdByUserId(supabase, user.id)
    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Profil artisan non trouvé' } },
        { status: 404 }
      )
    }

    const body = await request.json()
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

    const { data, error } = await createProviderQuote(supabase, provider.id, parsed.data)
    if (error || !data) {
      logger.error('Artisan quotes POST error:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Création du devis impossible' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch (error) {
    logger.error('Artisan quotes POST exception:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
