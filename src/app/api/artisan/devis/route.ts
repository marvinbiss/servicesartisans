/**
 * Artisan Devis (Quotes) API
 * GET: Get quotes sent by the artisan (from `quotes` table)
 * POST: Send a quote to a client for a given devis_request
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { z } from 'zod'
import {
  getProviderIdByUserId,
  getQuotesByProviderId,
  getLeadAssignment,
  getDevisRequestById,
  getExistingQuote,
  insertQuote,
  getQuoteByIdForProvider,
  updateQuote,
} from '@/lib/services/artisan-profile-service'

export const dynamic = 'force-dynamic'

const DEFAULT_VALID_UNTIL = () =>
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const createQuoteSchema = z.object({
  request_id: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().min(1).max(5000),
  valid_until: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD requis')
    .optional(),
})

export async function GET() {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    // Get provider linked to this user
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { data: provider } = await getProviderIdByUserId(supabase, user!.id)

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Profil artisan non trouvé' } },
        { status: 404 }
      )
    }

    // Fetch quotes sent by this provider
    const { data: quotes, error: quotesError } = await getQuotesByProviderId(supabase, provider.id)

    if (quotesError) {
      logger.error('Error fetching quotes:', quotesError)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la récupération des devis' } },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { devis: quotes || [] },
      {
        headers: { 'Cache-Control': 'private, no-store, max-age=0' },
      }
    )
  } catch (error) {
    logger.error('Artisan devis GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    // Get provider linked to this user
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { data: provider } = await getProviderIdByUserId(supabase, user!.id)

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Profil artisan non trouvé' } },
        { status: 404 }
      )
    }

    const body = await request.json()
    const result = createQuoteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erreur de validation', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const { request_id, amount, description, valid_until } = result.data

    // Validate valid_until is in the future if provided
    if (valid_until !== undefined) {
      const validUntilDate = new Date(valid_until)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (validUntilDate < today) {
        return NextResponse.json(
          { success: false, error: { message: "La date d'expiration doit être dans le futur" } },
          { status: 400 }
        )
      }
    }

    // Verify the artisan has a lead_assignment for this request
    const { data: assignment } = await getLeadAssignment(supabase, provider.id, request_id)

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: { message: 'Demande non assignée' } },
        { status: 403 }
      )
    }

    // Verify the devis_request exists
    const { data: devisRequest } = await getDevisRequestById(supabase, request_id)

    if (!devisRequest) {
      return NextResponse.json(
        { success: false, error: { message: 'Demande introuvable' } },
        { status: 404 }
      )
    }

    // Reject quotes on closed/completed requests
    if (!['pending', 'sent'].includes(devisRequest.status)) {
      return NextResponse.json(
        { success: false, error: { message: "Cette demande n'accepte plus de devis" } },
        { status: 409 }
      )
    }

    // Check for duplicate quote (same request_id + provider_id)
    const { data: existing } = await getExistingQuote(supabase, request_id, provider.id)

    if (existing) {
      return NextResponse.json(
        { success: false, error: { message: 'Un devis a déjà été envoyé pour cette demande' } },
        { status: 409 }
      )
    }

    // Insert quote
    const { data: quote, error: insertError } = await insertQuote(supabase, {
      request_id,
      provider_id: provider.id,
      amount,
      description,
      valid_until: valid_until ?? DEFAULT_VALID_UNTIL(),
      status: 'pending',
    })

    if (insertError) {
      logger.error('Error inserting quote:', insertError)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la création du devis' } },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        devis: quote,
        message: 'Devis envoyé avec succès',
      },
      {
        headers: { 'Cache-Control': 'private, no-store, max-age=0' },
      }
    )
  } catch (error) {
    logger.error('Artisan devis POST error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

const updateQuoteSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive().optional(),
  description: z.string().min(1).max(5000).optional(),
  valid_until: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD requis')
    .optional(),
})

export async function PUT(request: Request) {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { data: provider } = await getProviderIdByUserId(supabase, user!.id)

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Profil artisan non trouvé' } },
        { status: 404 }
      )
    }

    const body = await request.json()
    const result = updateQuoteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erreur de validation', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const { id, amount, description, valid_until } = result.data

    // Validate valid_until is in the future if provided
    if (valid_until !== undefined) {
      const validDate = new Date(valid_until)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (validDate <= today) {
        return NextResponse.json(
          { success: false, error: { message: "La date d'expiration doit être dans le futur" } },
          { status: 400 }
        )
      }
    }

    // Verify quote exists, belongs to this provider, and is still pending
    const { data: existingQuote } = await getQuoteByIdForProvider(supabase, id, provider.id)

    if (!existingQuote) {
      return NextResponse.json(
        { success: false, error: { message: 'Devis introuvable' } },
        { status: 404 }
      )
    }
    if (existingQuote.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: { message: 'Seul un devis en attente peut être modifié' } },
        { status: 403 }
      )
    }

    const patch: Record<string, unknown> = {}
    if (amount !== undefined) patch.amount = amount
    if (description !== undefined) patch.description = description
    if (valid_until !== undefined) patch.valid_until = valid_until

    const { data: quote, error: updateError } = await updateQuote(supabase, id, provider.id, patch)

    if (updateError) {
      logger.error('Error updating quote:', updateError)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la mise à jour du devis' } },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, devis: quote },
      {
        headers: { 'Cache-Control': 'private, no-store, max-age=0' },
      }
    )
  } catch (error) {
    logger.error('Artisan devis PUT error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
