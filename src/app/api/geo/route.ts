import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

// Force dynamic rendering — GET handler reads request.headers (cron-secret / IP / origin).
export const dynamic = 'force-dynamic'

// SLA-99.9 (2026-05-06) :
//   - RL 600/min/IP, fail-open (geo-resolution non bloquante).
//   - Timeout 3s sur ipapi (déjà en place) + Cache CDN 24h.
//   - Fail-soft : retourne 200 avec city=null plutôt que 5xx.
const IPAPI_TIMEOUT_MS = 3000
const HANDLER_TIMEOUT_MS = 5000

/**
 * GET /api/geo — IP-based geolocation fallback
 * Uses Vercel headers first, then ipapi.co as fallback for dev
 */
export async function GET(request: NextRequest) {
  // SLA-99.9 : RL 600/min/IP fail-open.
  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`geo:${ip}`, { window: 60_000, max: 600, failOpen: true })
  if (!rl.allowed) {
    return NextResponse.json(
      { city: null, citySlug: null, error: 'rate_limited' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
      }
    )
  }

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
            // SLA-99.9 : cache 24h CDN public (résolution geo IP stable).
            'Cache-Control': 'private, max-age=86400',
          },
        }
      )
    }

    // 2. Fallback: ipapi.co (free tier: 30K req/month) — SLA-99.9 timeout 3s.
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), IPAPI_TIMEOUT_MS)

    const fetchPromise = fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    })

    // SLA-99.9 : ceinture+bretelles — handler global timeout 5s.
    const res = await Promise.race([
      fetchPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('handler-timeout')), HANDLER_TIMEOUT_MS)
      ),
    ])
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
    // SLA-99.9 : never fail — return empty (200) plutôt que 5xx.
    return NextResponse.json({ city: null, citySlug: null }, { status: 200 })
  }
}

/** Normalize city name to URL slug */
function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
