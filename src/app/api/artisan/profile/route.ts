/**
 * Artisan Profile API
 * GET: Fetch artisan profile
 * PUT: Update artisan profile
 */

import { NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { logger } from '@/lib/logger'
import { revalidateArtisanProfile } from '@/lib/revalidate-artisan'
import { z } from 'zod'
import {
  getProfileById,
  getProviderForProfile,
  updateProfileById,
  updateProviderByUserId,
} from '@/lib/services/artisan-profile-service'

// PUT request schema — only columns that actually exist
// profiles: full_name
// providers: name, siret, phone, address_street, address_city, address_postal_code, specialty
const updateProfileSchema = z.object({
  full_name: z.string().max(100).optional(),
  // Provider fields (written to providers table, not profiles)
  name: z.string().max(200).optional(),
  siret: z
    .string()
    .regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres')
    .optional(),
  phone: z.string().max(20).optional(),
  address_street: z.string().max(200).optional(),
  address_city: z.string().max(100).optional(),
  address_postal_code: z.string().max(10).optional(),
  specialty: z.string().max(100).optional(),
})

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    // Fetch profile with explicit column list (profiles table)

    const { data: profile, error: profileError } = await getProfileById(supabase, user.id)

    if (profileError) {
      logger.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du profil' },
        { status: 500 }
      )
    }

    // Fetch associated provider data

    const { data: provider } = await getProviderForProfile(supabase, user.id)

    return NextResponse.json(
      { profile, provider },
      {
        headers: { 'Cache-Control': 'private, no-store, max-age=0' },
      }
    )
  } catch (error) {
    logger.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    // Parse request body
    const body = await request.json()
    const result = updateProfileSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Erreur de validation', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const {
      full_name,
      name,
      siret,
      phone,
      address_street,
      address_city,
      address_postal_code,
      specialty,
    } = result.data

    // Update profiles table (only columns that exist: full_name)
    const profileUpdate: Record<string, string> = {}
    if (full_name !== undefined) profileUpdate.full_name = full_name

    let profile = null
    if (Object.keys(profileUpdate).length > 0) {
      const { data, error: updateError } = await updateProfileById(supabase, user.id, profileUpdate)

      if (updateError) {
        logger.error('Error updating profile:', updateError)
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du profil' },
          { status: 500 }
        )
      }
      profile = data
    }

    // Update providers table (business data)
    const providerUpdate: Record<string, string> = {}
    if (name !== undefined) providerUpdate.name = name
    if (siret !== undefined) providerUpdate.siret = siret
    if (phone !== undefined) providerUpdate.phone = phone
    if (address_street !== undefined) providerUpdate.address_street = address_street
    if (address_city !== undefined) providerUpdate.address_city = address_city
    if (address_postal_code !== undefined) providerUpdate.address_postal_code = address_postal_code
    if (specialty !== undefined) providerUpdate.specialty = specialty

    let provider = null
    if (Object.keys(providerUpdate).length > 0) {
      const { data, error: providerError } = await updateProviderByUserId(
        supabase,
        user.id,
        providerUpdate
      )

      if (providerError) {
        logger.error('Error updating provider:', providerError)
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du profil artisan' },
          { status: 500 }
        )
      }
      provider = data
    }

    // Revalidation on-demand de la fiche publique (non-bloquant).
    // Helper central : construit le chemin via getArtisanUrl (résolution INSEE)
    // pour matcher l'URL réellement servie.
    if (provider) {
      await revalidateArtisanProfile(supabase, user.id)
    }

    return NextResponse.json(
      {
        success: true,
        profile,
        provider,
        message: 'Profil mis à jour avec succès',
      },
      {
        headers: { 'Cache-Control': 'private, no-store, max-age=0' },
      }
    )
  } catch (error) {
    logger.error('Profile PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
