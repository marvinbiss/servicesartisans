/**
 * API Admin Provider - CRUD complet
 * GET: Récupérer un provider avec toutes ses relations
 * PATCH: Mise à jour complète
 * DELETE: Soft delete
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { z } from 'zod'

// PATCH request schema
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

// Conditional logger - only logs in development to prevent sensitive data exposure
const log = (level: string, message: string, data?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    // Sanitize sensitive data before logging
    const sanitizedData = data ? sanitizeForLogging(data) : undefined
    console.log(`[${new Date().toISOString()}] [${level}] ${message}`, sanitizedData ? JSON.stringify(sanitizedData, null, 2) : '')
  }
}

// Remove sensitive fields from logging
function sanitizeForLogging(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) return data

  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'email', 'phone', 'siret', 'siren']
  const sanitized = { ...data as Record<string, unknown> }

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  }

  return sanitized
}

// GET - Récupérer un provider complet
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin with providers:read permission
    const authResult = await requirePermission('providers', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()
    const providerId = params.id

    const { data: provider, error } = await supabase
      .from('providers')
      .select(`
        *,
        provider_services (
          id,
          is_primary,
          service:services (
            id,
            name,
            slug
          )
        ),
        provider_locations (
          id,
          is_primary,
          radius_km,
          location:locations (
            id,
            name,
            postal_code,
            department_name
          )
        )
      `)
      .eq('id', providerId)
      .single()

    if (error || !provider) {
      return NextResponse.json(
        { success: false, error: 'Provider non trouvé' },
        { status: 404 }
      )
    }

    // Transformer pour le frontend
    const services = provider.provider_services?.map((ps: { service: { name: string } }) => ps.service?.name).filter(Boolean) || []
    const zones = provider.provider_locations?.map((pl: { location: { name: string; postal_code: string } }) =>
      pl.location ? `${pl.location.name} (${pl.location.postal_code})` : null
    ).filter(Boolean) || []

    const transformedProvider = {
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
      hourly_rate: null, // Not stored in providers table - prices are in provider_services
      is_verified: provider.is_verified || false,
      is_featured: provider.is_premium || false,
      is_active: provider.is_active !== false,
      rating: provider.rating_average || null,
      reviews_count: provider.review_count || 0,
      subscription_plan: provider.is_premium ? 'premium' : 'gratuit',
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
    }

    const response = NextResponse.json({
      success: true,
      provider: transformedProvider,
    })

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')

    return response
  } catch (error) {
    log('ERROR', 'Admin provider GET error', error)
    return NextResponse.json(
      { success: false, error: `Erreur serveur: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}

// PATCH - Mise à jour complète du provider
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const providerId = params.id
  log('INFO', `PATCH /api/admin/providers/${providerId} started`)

  try {
    // Step 1: Verify admin authentication
    log('INFO', 'Step 1: Verifying admin permission')
    const authResult = await requirePermission('providers', 'write')
    if (!authResult.success || !authResult.admin) {
      log('ERROR', 'Auth failed', authResult)
      return authResult.error
    }
    log('INFO', 'Auth successful', { adminId: authResult.admin.id })

    // Step 2: Create Supabase client
    log('INFO', 'Step 2: Creating Supabase admin client')
    let supabase
    try {
      supabase = createAdminClient()
      log('INFO', 'Supabase client created')
    } catch (clientError) {
      log('ERROR', 'Failed to create Supabase client', clientError)
      return NextResponse.json(
        { success: false, error: `Erreur client Supabase: ${(clientError as Error).message}` },
        { status: 500 }
      )
    }

    // Step 3: Parse request body
    log('INFO', 'Step 3: Parsing request body')
    let body
    try {
      body = await request.json()
      log('INFO', 'Body parsed', { keys: Object.keys(body) })
    } catch (parseError) {
      log('ERROR', 'JSON parse error', parseError)
      return NextResponse.json(
        { success: false, error: 'JSON invalide dans le body' },
        { status: 400 }
      )
    }

    // Validate request body
    const validationResult = updateProviderSchema.safeParse(body)
    if (!validationResult.success) {
      log('ERROR', 'Validation failed', validationResult.error.flatten())
      return NextResponse.json(
        { success: false, error: 'Validation error', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    // Step 4: Build update data
    log('INFO', 'Step 4: Building update data')
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Map frontend fields to database fields
    if (body.company_name?.trim()) updateData.name = body.company_name.trim()
    else if (body.full_name?.trim()) updateData.name = body.full_name.trim()

    if (body.phone !== undefined) updateData.phone = body.phone || null
    if (body.email !== undefined) updateData.email = body.email || null
    if (body.siret !== undefined) updateData.siret = body.siret || null
    if (body.description !== undefined) updateData.meta_description = body.description || null
    if (body.address !== undefined) updateData.address_street = body.address || null
    if (body.city !== undefined) updateData.address_city = body.city || null
    if (body.postal_code !== undefined) updateData.address_postal_code = body.postal_code || null
    if (body.department !== undefined) updateData.address_department = body.department || null
    if (body.region !== undefined) updateData.address_region = body.region || null
    // Note: hourly_rate is not a column in providers table - prices are in provider_services
    if (body.website !== undefined) updateData.website = body.website || null
    if (body.legal_form !== undefined) updateData.legal_form = body.legal_form || null

    // Boolean fields
    if (body.is_verified !== undefined) {
      updateData.is_verified = Boolean(body.is_verified)
      if (body.is_verified) {
        updateData.verification_date = new Date().toISOString()
      }
    }
    if (body.is_featured !== undefined) updateData.is_premium = Boolean(body.is_featured)
    if (body.is_active !== undefined) updateData.is_active = Boolean(body.is_active)

    log('INFO', 'Update data built', { fields: Object.keys(updateData) })

    // Step 5: Execute update
    log('INFO', 'Step 5: Executing database update')
    const { data, error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', providerId)
      .select()
      .single()

    if (error) {
      log('ERROR', 'Database update failed', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return NextResponse.json({
        success: false,
        error: `Erreur DB: ${error.message}`,
        code: error.code,
        hint: error.hint,
        details: error.details
      }, { status: 500 })
    }

    log('INFO', 'Update successful', { providerId: data?.id })

    // Step 6: Update services if provided
    if (body.services && Array.isArray(body.services)) {
      log('INFO', 'Step 6: Updating services', { services: body.services })
      try {
        // Delete existing provider_services
        await supabase
          .from('provider_services')
          .delete()
          .eq('provider_id', providerId)

        // For each service name, find or create the service and link it
        for (const serviceName of body.services) {
          if (!serviceName || typeof serviceName !== 'string') continue

          // Try to find existing service by name
          let { data: existingService } = await supabase
            .from('services')
            .select('id')
            .ilike('name', serviceName.trim())
            .single()

          let serviceId = existingService?.id

          // If not found, create new service
          if (!serviceId) {
            const slug = serviceName.trim().toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')

            const { data: newService, error: createError } = await supabase
              .from('services')
              .insert({
                name: serviceName.trim(),
                slug: slug,
                is_active: true,
              })
              .select('id')
              .single()

            if (createError) {
              log('WARN', `Failed to create service: ${serviceName}`, createError)
              continue
            }
            serviceId = newService?.id
          }

          // Link provider to service
          if (serviceId) {
            await supabase
              .from('provider_services')
              .insert({
                provider_id: providerId,
                service_id: serviceId,
                is_primary: body.services.indexOf(serviceName) === 0,
              })
          }
        }
        log('INFO', 'Services updated successfully')
      } catch (servicesError) {
        log('WARN', 'Services update failed but main update succeeded', servicesError)
      }
    }

    // Step 6b: Update zones/locations if provided
    if (body.zones && Array.isArray(body.zones)) {
      log('INFO', 'Step 6b: Updating zones', { zones: body.zones })
      try {
        // Delete existing provider_locations
        await supabase
          .from('provider_locations')
          .delete()
          .eq('provider_id', providerId)

        // For each zone, find or create the location and link it
        for (const zone of body.zones) {
          if (!zone || typeof zone !== 'string') continue

          // Parse zone format: "City Name (postal_code)" or just "City Name"
          const match = zone.match(/^(.+?)(?:\s*\((\d{5})\))?$/)
          if (!match) continue

          const locationName = match[1].trim()
          const postalCode = match[2] || null

          // Try to find existing location
          let locationQuery = supabase
            .from('locations')
            .select('id')
            .ilike('name', locationName)

          if (postalCode) {
            locationQuery = locationQuery.eq('postal_code', postalCode)
          }

          const { data: existingLocation } = await locationQuery.single()
          let locationId = existingLocation?.id

          // If not found, create new location
          if (!locationId) {
            const { data: newLocation, error: createError } = await supabase
              .from('locations')
              .insert({
                name: locationName,
                postal_code: postalCode,
                is_active: true,
              })
              .select('id')
              .single()

            if (createError) {
              log('WARN', `Failed to create location: ${zone}`, createError)
              continue
            }
            locationId = newLocation?.id
          }

          // Link provider to location
          if (locationId) {
            await supabase
              .from('provider_locations')
              .insert({
                provider_id: providerId,
                location_id: locationId,
                is_primary: body.zones.indexOf(zone) === 0,
                radius_km: 20, // Default radius
              })
          }
        }
        log('INFO', 'Zones updated successfully')
      } catch (zonesError) {
        log('WARN', 'Zones update failed but main update succeeded', zonesError)
      }
    }

    // Step 7: Log audit action
    try {
      await logAdminAction(authResult.admin.id, 'provider.update', 'provider', providerId, updateData)
    } catch (auditError) {
      log('WARN', 'Audit log failed but update succeeded', auditError)
    }

    // Step 8: Return success
    return NextResponse.json({
      success: true,
      data,
      message: 'Artisan mis à jour avec succès'
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })

  } catch (error) {
    const err = error as Error
    log('ERROR', 'Unexpected error', { message: err.message, stack: err.stack })
    return NextResponse.json({
      success: false,
      error: `Erreur inattendue: ${err.message}`,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 })
  }
}

// DELETE - Soft delete
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const providerId = params.id
  log('INFO', `DELETE /api/admin/providers/${providerId} started`)

  try {
    // Verify admin with providers:delete permission
    const authResult = await requirePermission('providers', 'delete')
    if (!authResult.success || !authResult.admin) {
      log('ERROR', 'Auth failed for DELETE', authResult)
      return authResult.error
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('providers')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', providerId)

    if (error) {
      log('ERROR', 'Database delete failed', error)
      return NextResponse.json(
        { success: false, error: `Erreur DB: ${error.message}` },
        { status: 500 }
      )
    }

    // Log d'audit
    try {
      await logAdminAction(authResult.admin.id, 'provider.delete', 'provider', providerId)
    } catch (auditError) {
      log('WARN', 'Audit log failed but delete succeeded', auditError)
    }

    log('INFO', 'DELETE successful', { providerId })

    return NextResponse.json({
      success: true,
      message: 'Artisan supprimé'
    })
  } catch (error) {
    const err = error as Error
    log('ERROR', 'Unexpected DELETE error', { message: err.message, stack: err.stack })
    return NextResponse.json(
      { success: false, error: `Erreur de suppression: ${err.message}` },
      { status: 500 }
    )
  }
}
