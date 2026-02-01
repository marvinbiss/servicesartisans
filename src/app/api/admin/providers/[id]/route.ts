/**
 * API Admin Provider - CRUD complet
 * GET: Récupérer un provider avec toutes ses relations
 * PATCH: Mise à jour complète
 * DELETE: Soft delete
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET - Récupérer un provider complet
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      hourly_rate: provider.hourly_rate || null,
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
    console.error('Admin provider GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PATCH - Mise à jour complète du provider
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const providerId = params.id

    // Vérifier que le provider existe
    const { data: existingProvider, error: checkError } = await supabase
      .from('providers')
      .select('id, name, is_verified, is_active')
      .eq('id', providerId)
      .single()

    if (checkError || !existingProvider) {
      return NextResponse.json(
        { success: false, error: 'Provider non trouvé' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Mapper les champs frontend -> database
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Champs directs - Priorité à company_name, sinon full_name
    if (body.company_name && body.company_name.trim()) {
      updateData.name = body.company_name.trim()
    } else if (body.full_name && body.full_name.trim()) {
      updateData.name = body.full_name.trim()
    }
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.email !== undefined) updateData.email = body.email
    if (body.siret !== undefined) updateData.siret = body.siret
    if (body.description !== undefined) updateData.meta_description = body.description
    if (body.address !== undefined) updateData.address_street = body.address
    if (body.city !== undefined) updateData.address_city = body.city
    if (body.postal_code !== undefined) updateData.address_postal_code = body.postal_code
    if (body.department !== undefined) updateData.address_department = body.department
    if (body.region !== undefined) updateData.address_region = body.region
    if (body.latitude !== undefined) updateData.latitude = body.latitude
    if (body.longitude !== undefined) updateData.longitude = body.longitude
    if (body.hourly_rate !== undefined) updateData.hourly_rate = body.hourly_rate
    if (body.website !== undefined) updateData.website = body.website
    if (body.legal_form !== undefined) updateData.legal_form = body.legal_form

    // Champs booléens
    if (body.is_verified !== undefined) {
      updateData.is_verified = body.is_verified
      if (body.is_verified) {
        updateData.verification_date = new Date().toISOString()
      }
    }
    if (body.is_featured !== undefined) updateData.is_premium = body.is_featured
    if (body.is_active !== undefined) updateData.is_active = body.is_active

    // Régénérer le slug si le nom change
    if (updateData.name) {
      const name = updateData.name as string
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 100)

      const { data: existing } = await supabase
        .from('providers')
        .select('slug, siren')
        .eq('id', providerId)
        .single()

      const suffix = existing?.siren || providerId.substring(0, 8)
      updateData.slug = `${slug}-${suffix}`
    }

    // Update principal
    const { data, error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', providerId)
      .select()
      .single()

    if (error) {
      console.error('Admin provider PATCH error:', error)
      throw error
    }

    // Gérer les services si fournis
    if (body.services && Array.isArray(body.services)) {
      await supabase
        .from('provider_services')
        .delete()
        .eq('provider_id', providerId)

      const { data: servicesList } = await supabase
        .from('services')
        .select('id, name, slug')

      const serviceMap = new Map(servicesList?.map(s => [s.name.toLowerCase(), s.id]) || [])
      const serviceMapBySlug = new Map(servicesList?.map(s => [s.slug, s.id]) || [])

      for (const serviceName of body.services) {
        const serviceId = serviceMap.get(serviceName.toLowerCase()) || serviceMapBySlug.get(serviceName.toLowerCase())
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
    }

    // Log d'audit
    try {
      await supabase.from('audit_logs').insert({
        admin_id: 'system',
        action: 'provider.update',
        entity_type: 'provider',
        entity_id: providerId,
        new_data: updateData,
        created_at: new Date().toISOString(),
      })
    } catch {
      // Audit logging is non-critical
    }

    const response = NextResponse.json({
      success: true,
      data,
      message: 'Artisan mis à jour avec succès'
    })

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')

    return response
  } catch (error) {
    console.error('Admin provider PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de mise à jour' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const providerId = params.id

    const { error } = await supabase
      .from('providers')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', providerId)

    if (error) throw error

    // Log d'audit
    try {
      await supabase.from('audit_logs').insert({
        admin_id: 'system',
        action: 'provider.delete',
        entity_type: 'provider',
        entity_id: providerId,
        created_at: new Date().toISOString(),
      })
    } catch {
      // Audit logging is non-critical
    }

    return NextResponse.json({
      success: true,
      message: 'Artisan supprimé'
    })
  } catch (error) {
    console.error('Admin provider DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur de suppression' },
      { status: 500 }
    )
  }
}
