import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Chercher le service "plombier"
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('slug', 'plombier')
      .single()

    if (serviceError) {
      return NextResponse.json({ error: 'Service error', details: serviceError }, { status: 500 })
    }

    // 2. Chercher la location "Paris"
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('*')
      .eq('slug', 'paris')
      .single()

    if (locationError) {
      return NextResponse.json({ error: 'Location error', details: locationError }, { status: 500 })
    }

    // 3. Test SANS filtre service (tous les artisans à Paris)
    const { data: allProviders, error: allError } = await supabase
      .from('providers')
      .select('*')
      .ilike('address_city', location.name)
      .eq('is_active', true)

    // 4. Test AVEC filtre service (plombiers à Paris)
    const { data: plumbers, error: plumbersError } = await supabase
      .from('providers')
      .select(`
        *,
        provider_services!inner(service_id)
      `)
      .eq('provider_services.service_id', service.id)
      .ilike('address_city', location.name)
      .eq('is_active', true)
      .order('is_premium', { ascending: false })
      .order('name')

    // 5. Vérifier les associations provider_services
    const { count: assocCount } = await supabase
      .from('provider_services')
      .select('provider_id', { count: 'exact' })
      .eq('service_id', service.id)

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      env: {
        supabaseUrl: supabaseUrl || 'MISSING',
        hasKey: !!supabaseKey,
      },
      service: {
        id: service.id,
        name: service.name,
        slug: service.slug,
      },
      location: {
        id: location.id,
        name: location.name,
        slug: location.slug,
      },
      results: {
        allProvidersInParis: allProviders?.length || 0,
        plumbersInParis: plumbers?.length || 0,
        associationsForPlombier: assocCount || 0,
      },
      samplePlumbers: plumbers?.slice(0, 5).map(p => ({
        name: p.name,
        city: p.address_city,
        premium: p.is_premium,
      })) || [],
      errors: {
        allError: allError?.message,
        plumbersError: plumbersError?.message,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Unexpected error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
