/**
 * API pour récupérer les artisans par ville
 * Utilisé pour afficher les markers sur la carte
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: providers, error } = await supabase
      .from('providers')
      .select('id, name, slug, latitude, longitude, rating_average, review_count, specialty, address_city')
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .ilike('address_city', `%${city}%`)
      .order('rating_average', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching providers by city:', error)
      return NextResponse.json(
        { error: 'Failed to fetch providers' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      providers: providers || [],
      count: providers?.length || 0
    })

  } catch (error) {
    console.error('Error in providers by city API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
