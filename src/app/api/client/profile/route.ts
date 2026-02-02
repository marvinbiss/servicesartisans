/**
 * Client Profile API
 * GET: Fetch client profile
 * PUT: Update client profile
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// PUT request schema
const updateClientProfileSchema = z.object({
  full_name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  postal_code: z.string().max(10).optional(),
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

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      logger.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du profil' },
        { status: 500 }
      )
    }

    // Verify user is a client (not artisan)
    if (profile.user_type === 'artisan') {
      return NextResponse.json(
        { error: 'Accès réservé aux clients. Utilisez /api/artisan/profile pour les artisans.' },
        { status: 403 }
      )
    }

    return NextResponse.json({ profile })
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

    // Verify user is a client (not artisan) before allowing update
    const { data: existingProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profileFetchError || !existingProfile) {
      return NextResponse.json(
        { error: 'Profil introuvable' },
        { status: 404 }
      )
    }

    if (existingProfile.user_type === 'artisan') {
      return NextResponse.json(
        { error: 'Accès réservé aux clients. Utilisez /api/artisan/profile pour les artisans.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const result = updateClientProfileSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const {
      full_name,
      phone,
      address,
      city,
      postal_code,
    } = result.data

    // Update profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name,
        phone,
        address,
        city,
        postal_code,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Error updating profile:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile,
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
