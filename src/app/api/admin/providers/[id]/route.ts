/**
 * API Admin Provider - CRUD complet
 * GET: Récupérer un provider avec toutes ses relations
 * PATCH: Mise à jour complète
 * DELETE: Soft delete
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { sanitizeSearchQuery, isValidUuid } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const updateProviderSchema = z.object({
  company_name: z.string().max(200).optional(),
  full_name: z.string().max(200).optional(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  siret: z.string().max(20).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(10).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  legal_form: z.string().max(50).optional().nullable(),
  is_verified: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  services: z.array(z.string().max(100)).optional(),
  zones: z.array(z.string().max(100)).optional(),
})

export const dynamic = 'force-dynamic'

/** Strip HTML tags from text inputs */
const stripTags = (val: string | null | undefined): string | null =>
  val ? val.replace(/<[^>]*>/g, '').trim() : null

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
}

/** Map frontend form fields to database column names and sanitize values */
function buildUpdateData(body: Record<string, unknown>): Record<string, unknown> {
  const data: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  // Name: prefer company_name, fall back to full_name
  if (body.company_name && typeof body.company_name === 'string' && body.company_name.trim()) {
    data.name = stripTags(body.company_name as string)
  } else if (body.full_name && typeof body.full_name === 'string' && (body.full_name as string).trim()) {
    data.name = stripTags(body.full_name as string)
  }

  // Direct nullable fields (no sanitization needed)
  const directFields: [string, string][] = [
    ['phone', 'phone'],
    ['email', 'email'],
    ['siret', 'siret'],
    ['postal_code', 'address_postal_code'],
    ['website', 'website'],
    ['legal_form', 'legal_form'],
  ]
  for (const [src, dest] of directFields) {
    if (body[src] !== undefined) data[dest] = body[src] || null
  }

  // Text fields that need HTML stripping
  const textFields: [string, string][] = [
    ['description', 'meta_description'],
    ['address', 'address_street'],
    ['city', 'address_city'],
    ['department', 'address_department'],
    ['region', 'address_region'],
  ]
  for (const [src, dest] of textFields) {
    if (body[src] !== undefined) data[dest] = stripTags(body[src] as string)
  }

  // Boolean fields
  if (body.is_verified !== undefined) {
    data.is_verified = Boolean(body.is_verified)
    if (body.is_verified) data.verification_date = new Date().toISOString()
  }
  // is_premium column was dropped; is_featured is no longer stored
  if (body.is_active !== undefined) data.is_active = Boolean(body.is_active)

  return data
}

/**
 * Find an existing record by name (ilike) or create a new one.
 * Returns the ID, or null on failure.
 */
async function findOrCreateRecord(
  supabase: ReturnType<typeof createAdminClient>,
  table: 'services' | 'locations',
  name: string,
  extraMatch?: Record<string, unknown>,
  extraInsert?: Record<string, unknown>,
): Promise<string | null> {
  const sanitizedName = sanitizeSearchQuery(name.trim())
  let query = supabase.from(table).select('id').ilike('name', sanitizedName)
  if (extraMatch) {
    for (const [k, v] of Object.entries(extraMatch)) {
      query = query.eq(k, v)
    }
  }
  const { data: existing } = await query.single()
  if (existing?.id) return existing.id

  // Create new record
  const insertData: Record<string, unknown> = {
    name: name.trim(),
    is_active: true,
    ...extraInsert,
  }
  if (table === 'services') {
    insertData.slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }
  const { data: created, error } = await supabase.from(table).insert(insertData).select('id').single()
  if (error) return null
  return created?.id ?? null
}

// GET - Récupérer un provider complet
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requirePermission('providers', 'read')
    if (!authResult.success || !authResult.admin) return authResult.error

    const providerId = params.id
    if (!isValidUuid(providerId)) {
      return NextResponse.json(
        { success: false, error: 'Identifiant invalide' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: provider, error } = await supabase
      .from('providers')
      .select(`
        *,
        provider_services (
          id, is_primary,
          service:services ( id, name, slug )
        ),
        provider_locations (
          id, is_primary, radius_km,
          location:locations ( id, name, postal_code, department_name )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !provider) {
      return NextResponse.json({ success: false, error: 'Provider non trouvé' }, { status: 404 })
    }

    const services = provider.provider_services?.map((ps: { service: { name: string } }) => ps.service?.name).filter(Boolean) || []
    const zones = provider.provider_locations?.map((pl: { location: { name: string; postal_code: string } }) =>
      pl.location ? `${pl.location.name} (${pl.location.postal_code})` : null
    ).filter(Boolean) || []

    const response = NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        user_id: provider.user_id || null,
        email: provider.email || '',
        full_name: provider.name,
        company_name: provider.name,
        phone: provider.phone || '',
        siret: provider.siret || '',
        siren: provider.siren || '',
        description: provider.meta_description || '',
        services,
        zones,
        address: provider.address_street || '',
        city: provider.address_city || '',
        postal_code: provider.address_postal_code || '',
        department: provider.address_department || '',
        region: provider.address_region || '',
        latitude: provider.latitude,
        longitude: provider.longitude,
        hourly_rate: null,
        is_verified: provider.is_verified || false,
        is_featured: false,
        is_active: provider.is_active !== false,
        rating: provider.rating_average || null,
        reviews_count: provider.review_count || 0,
        subscription_plan: 'gratuit',
        source: provider.source || 'manual',
        source_id: provider.source_id || null,
        website: provider.website || '',
        legal_form: provider.legal_form || '',
        creation_date: provider.creation_date || '',
        employee_count: provider.employee_count || null,
        created_at: provider.created_at,
        updated_at: provider.updated_at,
        slug: provider.slug,
        _provider_services: provider.provider_services,
        _provider_locations: provider.provider_locations,
      },
    })

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    return response
  } catch (error) {
    logger.error('Admin provider GET error', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération du profil' }, { status: 500 })
  }
}

// PATCH - Mise à jour complète du provider
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const providerId = params.id

  try {
    const authResult = await requirePermission('providers', 'write')
    if (!authResult.success || !authResult.admin) return authResult.error

    if (!isValidUuid(providerId)) {
      return NextResponse.json(
        { success: false, error: 'Identifiant invalide' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Parse and validate request body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: 'JSON invalide dans le body' }, { status: 400 })
    }

    const validationResult = updateProviderSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Erreur de validation', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    // Build and execute update
    const updateData = buildUpdateData(body)

    const { data, error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', providerId)
      .select()
      .single()

    if (error) {
      logger.error('Database update failed', { code: error.code, message: error.message })
      return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    // Update services if provided
    if (body.services && Array.isArray(body.services)) {
      try {
        await supabase.from('provider_services').delete().eq('provider_id', providerId)
        for (const serviceName of body.services) {
          if (!serviceName || typeof serviceName !== 'string') continue
          const serviceId = await findOrCreateRecord(supabase, 'services', serviceName)
          if (serviceId) {
            await supabase.from('provider_services').insert({
              provider_id: providerId,
              service_id: serviceId,
              is_primary: (body.services as string[]).indexOf(serviceName) === 0,
            })
          }
        }
      } catch (servicesError) {
        logger.warn('Services update failed (main update succeeded)')
      }
    }

    // Update zones/locations if provided
    if (body.zones && Array.isArray(body.zones)) {
      try {
        await supabase.from('provider_locations').delete().eq('provider_id', providerId)
        for (const zone of body.zones) {
          if (!zone || typeof zone !== 'string') continue
          const match = zone.match(/^(.+?)(?:\s*\((\d{5})\))?$/)
          if (!match) continue

          const locationName = match[1].trim()
          const postalCode = match[2] || null
          const extraMatch = postalCode ? { postal_code: postalCode } : undefined
          const extraInsert = postalCode ? { postal_code: postalCode } : undefined

          const locationId = await findOrCreateRecord(supabase, 'locations', locationName, extraMatch, extraInsert)
          if (locationId) {
            await supabase.from('provider_locations').insert({
              provider_id: providerId,
              location_id: locationId,
              is_primary: (body.zones as string[]).indexOf(zone) === 0,
              radius_km: 20,
            })
          }
        }
      } catch (zonesError) {
        logger.warn('Zones update failed (main update succeeded)')
      }
    }

    // Audit log
    try {
      await logAdminAction(authResult.admin.id, 'provider.update', 'provider', providerId, updateData)
    } catch (auditError) {
      logger.warn('Audit log failed')
    }

    return NextResponse.json(
      { success: true, data, message: 'Artisan mis à jour avec succès' },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error) {
    const err = error as Error
    logger.error('Unexpected PATCH error', { message: err.message })
    return NextResponse.json({ success: false, error: 'Erreur inattendue lors de la mise à jour' }, { status: 500 })
  }
}

// DELETE - Soft delete
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const providerId = params.id

  try {
    const authResult = await requirePermission('providers', 'delete')
    if (!authResult.success || !authResult.admin) return authResult.error

    if (!isValidUuid(providerId)) {
      return NextResponse.json(
        { success: false, error: 'Identifiant invalide' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('providers')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', providerId)

    if (error) {
      logger.error('Database delete failed', error)
      return NextResponse.json({ success: false, error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    try {
      await logAdminAction(authResult.admin.id, 'provider.delete', 'provider', providerId)
    } catch (auditError) {
      logger.warn('Audit log failed')
    }

    return NextResponse.json({ success: true, message: 'Artisan supprimé' })
  } catch (error) {
    const err = error as Error
    logger.error('Unexpected DELETE error', { message: err.message })
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
