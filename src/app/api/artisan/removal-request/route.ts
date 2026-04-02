/**
 * RGPD Art. 21 — Provider Removal Request API
 * POST: Submit a request to remove a provider page (right of objection)
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { checkRateLimit } from '@/lib/rate-limiter'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const removalSchema = z.object({
  providerId: z.string().uuid('ID artisan invalide'),
  siret: z.string().regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres'),
  requesterName: z.string().min(2, 'Le nom est requis (min. 2 caractères)'),
  requesterEmail: z.string().email('Email invalide'),
  reason: z.string().max(2000, 'Le motif ne peut pas dépasser 2000 caractères').optional(),
})

export async function POST(request: Request) {
  try {
    // Rate limiting: 3 requests per hour per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || request.headers.get('cf-connecting-ip')
      || 'unknown'
    const rl = await checkRateLimit(`removal:${ip}`, { window: 3_600_000, max: 3 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de demandes. Réessayez dans une heure.' },
        { status: 429 }
      )
    }

    // Parse body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Corps de requête invalide' },
        { status: 400 }
      )
    }

    // Validate
    const validation = removalSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { providerId, siret, requesterName, requesterEmail, reason } = validation.data
    const adminClient = createAdminClient()

    // Check provider exists and has matching SIRET
    const { data: provider, error: providerError } = await adminClient
      .from('providers')
      .select('id, name, siret')
      .eq('id', providerId)
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Fiche artisan introuvable' },
        { status: 404 }
      )
    }

    if (!provider.siret) {
      return NextResponse.json(
        { error: 'Impossible de vérifier cette fiche. Contactez support@servicesartisans.fr avec votre extrait Kbis.' },
        { status: 400 }
      )
    }

    // SIRET verification (exact 14-digit match)
    const normalizedInput = siret.replace(/\s/g, '')
    const normalizedStored = provider.siret.replace(/\s/g, '')

    if (normalizedInput !== normalizedStored) {
      logger.warn('Removal request SIRET mismatch', {
        requesterEmail,
        providerId,
        providerName: provider.name,
        inputSiren: normalizedInput.slice(0, 9),
        storedSiren: normalizedStored.slice(0, 9),
      })
      return NextResponse.json(
        { error: 'Le SIRET fourni ne correspond pas à cette fiche. Vérifiez votre numéro ou contactez support@servicesartisans.fr.' },
        { status: 403 }
      )
    }

    // Check for existing pending request for this provider
    const { data: existingRequests } = await adminClient
      .from('provider_removal_requests')
      .select('id')
      .eq('provider_id', providerId)
      .eq('status', 'pending')
      .limit(1)

    if (existingRequests && existingRequests.length > 0) {
      return NextResponse.json(
        { error: 'Une demande de suppression est déjà en cours pour cette fiche.' },
        { status: 409 }
      )
    }

    // Create removal request
    const { error: insertError } = await adminClient
      .from('provider_removal_requests')
      .insert({
        provider_id: providerId,
        requester_name: requesterName.trim(),
        requester_email: requesterEmail.trim().toLowerCase(),
        siret: normalizedInput,
        reason: reason?.trim() || null,
        status: 'pending',
      })

    if (insertError) {
      logger.error('Removal request insert error', { error: insertError, providerId })
      return NextResponse.json(
        { error: 'Erreur lors de la soumission de la demande' },
        { status: 500 }
      )
    }

    // RGPD good faith: immediately set provider to noindex
    const { error: noindexError } = await adminClient
      .from('providers')
      .update({ noindex: true, updated_at: new Date().toISOString() })
      .eq('id', providerId)

    if (noindexError) {
      logger.error('Failed to set noindex on provider after removal request', {
        error: noindexError,
        providerId,
      })
    }

    logger.info('Removal request submitted (RGPD Art. 21)', {
      requesterEmail: requesterEmail.trim().toLowerCase(),
      providerId,
      providerName: provider.name,
      noindexApplied: !noindexError,
    })

    return NextResponse.json({
      success: true,
      message: 'Votre demande de suppression a été enregistrée. La fiche a été immédiatement retirée de l\'indexation. Un administrateur traitera votre demande sous 72 heures.',
    })
  } catch (err) {
    logger.error('Removal request API unexpected error', { error: err })
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
