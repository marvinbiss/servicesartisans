import { NextRequest, NextResponse } from 'next/server'
import { geocoder, reverseGeocode, autocompleteVille, autocompleteAdresse } from '@/lib/api/adresse'

/**
 * API Route pour le géocodage côté serveur
 * Utile pour le SSR ou les opérations batch
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')

  try {
    switch (action) {
      // Géocodage : Adresse → GPS
      case 'geocode': {
        const address = searchParams.get('address')
        if (!address) {
          return NextResponse.json(
            { success: false, error: 'Address is required' },
            { status: 400 }
          )
        }
        const result = await geocoder(address)
        return NextResponse.json({ success: true, data: result })
      }

      // Reverse geocoding : GPS → Adresse
      case 'reverse': {
        const lon = parseFloat(searchParams.get('lon') || '')
        const lat = parseFloat(searchParams.get('lat') || '')
        if (isNaN(lon) || isNaN(lat)) {
          return NextResponse.json(
            { success: false, error: 'Valid lon and lat are required' },
            { status: 400 }
          )
        }
        const result = await reverseGeocode(lon, lat)
        return NextResponse.json({ success: true, data: result })
      }

      // Autocomplete villes
      case 'cities': {
        const query = searchParams.get('q')
        const limit = parseInt(searchParams.get('limit') || '10')
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'Query is required' },
            { status: 400 }
          )
        }
        const results = await autocompleteVille(query, limit)
        return NextResponse.json({ success: true, data: results })
      }

      // Autocomplete adresses
      case 'addresses': {
        const query = searchParams.get('q')
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'Query is required' },
            { status: 400 }
          )
        }
        const results = await autocompleteAdresse(query, {
          limit: parseInt(searchParams.get('limit') || '5'),
          postcode: searchParams.get('postcode') || undefined
        })
        return NextResponse.json({ success: true, data: results })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: geocode, reverse, cities, addresses' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Geocode API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
