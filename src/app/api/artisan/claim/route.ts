/**
 * Artisan Claim API
 * POST: Submit a claim request for a provider page (SIRET verification + admin review)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const claimSchema = z.object({
  providerId: z.string().uuid('ID artisan invalide'),
  siret: z.string().regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres'),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour revendiquer une fiche' },
        { status: 401 }
      )
    }

    // Validate body
    const body = await request.json()
    const validation = claimSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { providerId, siret } = validation.data
    const adminClient = createAdminClient()

    // Check if user already has a claimed provider
    const { data: existingProvider } = await adminClient
      .from('providers')
      .select('id, name')
      .eq('user_id', user.id)
      .single()

    if (existingProvider) {
      return NextResponse.json(
        { error: 'Vous avez déjà une fiche artisan associée à votre compte' },
        { status: 409 }
      )
    }

    // Check if user already has a pending claim
    const { data: existingClaim } = await adminClient
      .from('provider_claims')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (existingClaim) {
      return NextResponse.json(
        { error: 'Vous avez déjà une demande de revendication en cours de validation' },
        { status: 409 }
      )
    }

    // Fetch provider
    const { data: provider, error: providerError } = await adminClient
      .from('providers')
      .select('id, name, siret, user_id')
      .eq('id', providerId)
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Fiche artisan introuvable' },
        { status: 404 }
      )
    }

    // Check if already claimed
    if (provider.user_id) {
      return NextResponse.json(
        { error: 'Cette fiche a déjà été revendiquée par un autre utilisateur' },
        { status: 409 }
      )
    }

    // Check if provider has a SIRET to match against
    if (!provider.siret) {
      return NextResponse.json(
        { error: 'Cette fiche ne contient pas de numéro SIRET. Contactez-nous à support@servicesartisans.fr pour revendiquer cette fiche manuellement.' },
        { status: 400 }
      )
    }

    // SIRET verification
    const normalizedInput = siret.replace(/\s/g, '')
    const normalizedStored = provider.siret.replace(/\s/g, '')

    if (normalizedInput !== normalizedStored) {
      return NextResponse.json(
        { error: 'Le numéro SIRET ne correspond pas à celui enregistré pour cet artisan' },
        { status: 403 }
      )
    }

    // SIRET matches — create a pending claim for admin review
    const { error: insertError } = await adminClient
      .from('provider_claims')
      .insert({
        provider_id: providerId,
        user_id: user.id,
        siret_provided: normalizedInput,
        status: 'pending',
      })

    if (insertError) {
      // Handle unique constraint violation
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Vous avez déjà soumis une demande pour cette fiche' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Erreur lors de la soumission de la demande' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Votre demande de revendication a été soumise. Un administrateur la validera sous 24 à 48 heures.',
    })
  } catch {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
