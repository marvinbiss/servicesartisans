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
import { sanitizeUserInput, stripHtmlTags } from '@/lib/sanitize'
import { slugify } from '@/lib/utils'
import { assertArtisanTwoFactor } from '@/lib/auth/artisan-guard'
import {
  getProviderFull,
  getProviderForUpdate,
  updateProviderById,
  syncProviderToProfile,
} from '@/lib/services/artisan-profile-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Verify user is an artisan
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, two_factor_enabled')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
    }

    if (profile.role !== 'artisan') {
      return NextResponse.json({ error: 'Accès réservé aux artisans' }, { status: 403 })
    }

    const twoFactorError = await assertArtisanTwoFactor(profile.two_factor_enabled, user.id)
    if (twoFactorError) return twoFactorError

    // Fetch provider by user_id
    const { data: provider, error: providerError } = await getProviderFull(supabase, user.id)

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Aucun profil artisan trouvé. Contactez le support.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ provider })
  } catch (error) {
    logger.error('Provider GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Verify user is an artisan
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, two_factor_enabled')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
    }

    if (profile.role !== 'artisan') {
      return NextResponse.json({ error: 'Accès réservé aux artisans' }, { status: 403 })
    }

    const twoFactorError = await assertArtisanTwoFactor(profile.two_factor_enabled, user.id)
    if (twoFactorError) return twoFactorError

    // Get provider by user_id (need provider.id for update + fields for revalidation)
    const { data: provider, error: providerError } = await getProviderForUpdate(supabase, user.id)

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

    // Sanitize text fields (XSS prevention + plain-text strip for description)
    const updateData: Record<string, unknown> = {}
    const freeTextFields = new Set(['description', 'bio', 'artisan_quote'])

    for (const [key, value] of Object.entries(validated)) {
      if (value === undefined) continue

      if (key === 'description') {
        // Sanitize user input first, then strip all remaining HTML tags.
        // stripHtmlTags is pure JS (no jsdom) — DOMPurify crashed on serverless
        // cold start, which 500'd every "Activité & présentation" save (2026-06-07).
        updateData[key] =
          typeof value === 'string' ? stripHtmlTags(sanitizeUserInput(value)) : value
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
    const { data: updated, error: updateError } = await updateProviderById(supabase, provider.id, {
      ...updateData,
      updated_at: new Date().toISOString(),
    })

    if (updateError) {
      logger.error('Error updating provider:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil artisan' },
        { status: 500 }
      )
    }

    // Revalidate public artisan page (ISR cache bust).
    // 2026-06-07 : slugify() de @/lib/utils (l'ancien toSlug naïf cassait les
    // accents — « Électricien »/« Saint-Étienne » → path jamais revalidé) +
    // publicId = slug || stable_id (les fiches claimed sont servies par slug).
    try {
      const serviceSlug = slugify(provider.specialty || '')
      const locationSlug = slugify(provider.address_city || '')
      const publicId = provider.slug || provider.stable_id
      if (serviceSlug && locationSlug && publicId) {
        revalidatePath(`/services/${serviceSlug}/${locationSlug}/${publicId}`, 'page')
        revalidatePath(`/services/${serviceSlug}/${locationSlug}`, 'page')
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
      syncProviderToProfile(supabase, user.id, profileData)
    }

    return NextResponse.json({
      success: true,
      provider: updated,
    })
  } catch (error) {
    logger.error('Provider PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
