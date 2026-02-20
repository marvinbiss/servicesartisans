/**
 * Artisan Profile API
 * GET: Fetch artisan profile
 * PUT: Update artisan profile
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// PUT request schema — only columns that actually exist
// profiles: full_name, phone_e164
// providers: name, siret, phone, address_street, address_city, address_postal_code, specialty
const updateProfileSchema = z.object({
  full_name: z.string().max(100).optional(),
  phone_e164: z.string().max(20).optional(),
  // Provider fields (written to providers table, not profiles)
  name: z.string().max(200).optional(),
  siret: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  address_street: z.string().max(200).optional(),
  address_city: z.string().max(100).optional(),
  address_postal_code: z.string().max(10).optional(),
  specialty: z.string().max(100).optional(),
})

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Fetch profile with explicit column list (profiles table)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, phone_e164, average_rating, review_count')
      .eq('id', user.id)
      .single()

    if (profileError) {
      logger.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du profil' },
        { status: 500 }
      )
    }

    if (profile.role !== 'artisan') {
      return NextResponse.json(
        { error: 'Accès réservé aux artisans' },
        { status: 403 }
      )
    }

    // Fetch associated provider data
    const { data: provider } = await supabase
      .from('providers')
      .select('id, name, slug, siret, phone, address_street, address_city, address_postal_code, address_region, specialty, rating_average, review_count, is_verified, is_active')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ profile, provider })
  } catch (error) {
    logger.error('Profile GET error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Verify user is an artisan before allowing profile update
    const { data: existingProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileFetchError || !existingProfile) {
      return NextResponse.json(
        { error: 'Profil introuvable' },
        { status: 404 }
      )
    }

    if (existingProfile.role !== 'artisan') {
      return NextResponse.json(
        { error: 'Accès réservé aux artisans' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const result = updateProfileSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const {
      full_name,
      phone_e164,
      name,
      siret,
      phone,
      address_street,
      address_city,
      address_postal_code,
      specialty,
    } = result.data

    // Update profiles table (only columns that exist: full_name, phone_e164)
    const profileUpdate: Record<string, string> = {}
    if (full_name !== undefined) profileUpdate.full_name = full_name
    if (phone_e164 !== undefined) profileUpdate.phone_e164 = phone_e164

    let profile = null
    if (Object.keys(profileUpdate).length > 0) {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)
        .select('id, email, full_name, role, phone_e164, average_rating, review_count')
        .single()

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
      const { data, error: providerError } = await supabase
        .from('providers')
        .update(providerUpdate)
        .eq('id', user.id)
        .select('id, name, slug, siret, phone, address_street, address_city, address_postal_code, specialty, is_verified, is_active')
        .single()

      if (providerError) {
        logger.error('Error updating provider:', providerError)
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du profil artisan' },
          { status: 500 }
        )
      }
      provider = data
    }

    return NextResponse.json({
      success: true,
      profile,
      provider,
      message: 'Profil mis à jour avec succès'
    })
  } catch (error) {
    logger.error('Profile PUT error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
