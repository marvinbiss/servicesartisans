import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/geo — IP-based geolocation fallback
 * Uses Vercel headers first, then ipapi.co as fallback for dev
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Try Vercel geo headers (free, automatic on Vercel)
    const vercelCity = request.headers.get('x-vercel-ip-city')
    const vercelCountry = request.headers.get('x-vercel-ip-country')
    const vercelLat = request.headers.get('x-vercel-ip-latitude')
    const vercelLon = request.headers.get('x-vercel-ip-longitude')

    if (vercelCity && vercelCountry === 'FR') {
      const city = decodeURIComponent(vercelCity)
      return NextResponse.json(
        {
          city,
          citySlug: slugify(city),
          lat: vercelLat ? parseFloat(vercelLat) : null,
          lon: vercelLon ? parseFloat(vercelLon) : null,
        },
        {
          headers: {
            'Cache-Control': 'private, max-age=86400',
          },
        }
      )
    }

    // 2. Fallback: ipapi.co (free tier: 30K req/month)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json({ city: null, citySlug: null }, { status: 200 })
    }

    const data = await res.json()

    // Only return French locations
    if (data.country_code !== 'FR') {
      return NextResponse.json({ city: null, citySlug: null }, { status: 200 })
    }

    return NextResponse.json(
      {
        city: data.city || null,
        citySlug: data.city ? slugify(data.city) : null,
        region: data.region || null,
        lat: data.latitude || null,
        lon: data.longitude || null,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=86400',
        },
      }
    )
  } catch {
    // Never fail — return empty
    return NextResponse.json({ city: null, citySlug: null }, { status: 200 })
  }
}

/** Normalize city name to URL slug */
function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
