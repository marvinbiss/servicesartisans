/**
 * API de diagnostic - Liste les tables et leur contenu
 * A SUPPRIMER EN PRODUCTION
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const results: Record<string, unknown> = {}

    // Verifier les providers (artisans importes/scrapes)
    const { data: providers, error: providersError, count: providersCount } = await supabase
      .from('providers')
      .select('id, name, address_city, siret, is_verified, is_active', { count: 'exact' })
      .limit(10)

    results.providers = {
      count: providersCount,
      sample: providers,
      error: providersError?.message
    }

    // Verifier les profiles (utilisateurs inscrits)
    const { data: profiles, error: profilesError, count: profilesCount } = await supabase
      .from('profiles')
      .select('id, full_name, company_name, city, user_type, is_verified', { count: 'exact' })
      .eq('user_type', 'artisan')
      .limit(10)

    results.artisan_profiles = {
      count: profilesCount,
      sample: profiles,
      error: profilesError?.message
    }

    // Verifier les reviews
    const { data: reviews, error: reviewsError, count: reviewsCount } = await supabase
      .from('reviews')
      .select('id, rating, provider_id, artisan_id, is_verified', { count: 'exact' })
      .limit(10)

    results.reviews = {
      count: reviewsCount,
      sample: reviews,
      error: reviewsError?.message
    }

    // Verifier les services
    const { data: services, error: servicesError, count: servicesCount } = await supabase
      .from('services')
      .select('id, name, slug, is_active', { count: 'exact' })
      .limit(10)

    results.services = {
      count: servicesCount,
      sample: services,
      error: servicesError?.message
    }

    // Verifier les locations/communes
    const { data: locations, error: locationsError, count: locationsCount } = await supabase
      .from('locations')
      .select('id, name, postal_code, department_name', { count: 'exact' })
      .limit(10)

    results.locations = {
      count: locationsCount,
      sample: locations,
      error: locationsError?.message
    }

    // Verifier provider_services (liaisons)
    const { data: providerServices, error: psError, count: psCount } = await supabase
      .from('provider_services')
      .select('id, provider_id, service_id', { count: 'exact' })
      .limit(5)

    results.provider_services = {
      count: psCount,
      sample: providerServices,
      error: psError?.message
    }

    // Verifier provider_locations (liaisons)
    const { data: providerLocations, error: plError, count: plCount } = await supabase
      .from('provider_locations')
      .select('id, provider_id, location_id', { count: 'exact' })
      .limit(5)

    results.provider_locations = {
      count: plCount,
      sample: providerLocations,
      error: plError?.message
    }

    return NextResponse.json({
      success: true,
      message: 'Diagnostic de la base de donnees',
      tables: results,
      tip: 'Si une table affiche une erreur, elle n\'existe peut-etre pas encore dans Supabase'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
