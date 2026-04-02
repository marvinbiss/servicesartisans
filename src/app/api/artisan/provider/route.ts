/**
 * Artisan Provider API
 * GET: Fetch artisan's provider data
 * PUT: Update artisan's provider data
 */

import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { providerArtisanUpdateSchema } from '@/schemas/provider'
import { sanitizeUserInput } from '@/lib/sanitize'
// DOMPurify lazy-imported inside PUT to avoid JSDOM crash in serverless cold start

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Verify user is an artisan
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profil introuvable' },
        { status: 404 }
      )
    }

    if (profile.role !== 'artisan') {
      return NextResponse.json(
        { error: 'Accès réservé aux artisans' },
        { status: 403 }
      )
    }

    // Fetch provider by user_id
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, stable_id, name, slug, email, phone, phone_secondary, website, siret, specialty, description, bio, address_street, address_city, address_postal_code, address_region, address_department, latitude, longitude, is_verified, is_active, noindex, rating_average, review_count, user_id, avatar_url, created_at, updated_at, opening_hours, accepts_new_clients, free_quote, available_24h, intervention_radius_km, services_offered, service_prices, faq, team_size')
      .eq('user_id', user.id)
      .or('is_active.eq.true,is_active.is.null')
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Aucun profil artisan trouvé. Contactez le support.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ provider })
  } catch (error) {
    logger.error('Provider GET error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Verify user is an artisan
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profil introuvable' },
        { status: 404 }
      )
    }

    if (profile.role !== 'artisan') {
      return NextResponse.json(
        { error: 'Accès réservé aux artisans' },
        { status: 403 }
      )
    }

    // Get provider by user_id (need provider.id for update + fields for revalidation)
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, specialty, address_city, slug, stable_id')
      .eq('user_id', user.id)
      .or('is_active.eq.true,is_active.is.null')
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Aucun profil artisan trouvé. Contactez le support.' },
        { status: 404 }
      )
    }

    // Parse + validate body
    const body = await request.json()
    const result = providerArtisanUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Erreur de validation', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const validated = result.data

    // Sanitize text fields (XSS prevention + DOMPurify for rich text)
    const updateData: Record<string, unknown> = {}
    const freeTextFields = new Set(['description', 'bio'])

    for (const [key, value] of Object.entries(validated)) {
      if (value === undefined) continue

      if (key === 'description') {
        // Sanitize user input first, then strip all HTML tags via DOMPurify
        if (typeof value === 'string') {
          const sanitized = sanitizeUserInput(value)
          const { default: DOMPurify } = await import('isomorphic-dompurify')
          updateData[key] = DOMPurify.sanitize(sanitized, { ALLOWED_TAGS: [] })
        } else {
          updateData[key] = value
        }
      } else if (freeTextFields.has(key)) {
        // Sanitize free-text fields against XSS
        updateData[key] = typeof value === 'string' ? sanitizeUserInput(value) : value
      } else if (key === 'name') {
        // Trim name
        updateData[key] = typeof value === 'string' ? value.trim() : value
      } else if (typeof value === 'string') {
        // Trim all other string fields
        updateData[key] = value.trim()
      } else {
        updateData[key] = value
      }
    }

    // Update providers table
    const { data: updated, error: updateError } = await supabase
      .from('providers')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', provider.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Error updating provider:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil artisan' },
        { status: 500 }
      )
    }

    // Revalidate public artisan page (ISR cache bust)
    try {
      const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-')
      const serviceSlug = toSlug(provider.specialty || '')
      const locationSlug = toSlug(provider.address_city || '')
      if (serviceSlug && locationSlug && provider.stable_id) {
        revalidatePath(`/services/${serviceSlug}/${locationSlug}/${provider.stable_id}`)
        revalidatePath(`/services/${serviceSlug}/${locationSlug}`)
      }
    } catch (revalidateError) {
      logger.error('Revalidation error after provider update:', revalidateError)
    }

    // Sync overlapping fields to profiles (best-effort, fire and forget)
    const profileData: Record<string, unknown> = {}

    // Only sync columns that exist on profiles table
    if (updateData.name !== undefined) profileData.full_name = updateData.name
    if (updateData.email !== undefined) profileData.email = updateData.email

    if (Object.keys(profileData).length > 0) {
      supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .then(({ error: syncError }) => {
          if (syncError) {
            logger.error('Error syncing provider data to profile:', syncError)
          }
        })
    }

    return NextResponse.json({
      success: true,
      provider: updated,
    })
  } catch (error) {
    logger.error('Provider PUT error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
