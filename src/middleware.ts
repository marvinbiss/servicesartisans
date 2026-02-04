import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Rate limiting store (in production, use Redis)
const rateLimit = new Map<string, { count: number; resetTime: number }>()

// Rate limit configurations per route type
const RATE_LIMITS = {
  auth: { window: 60 * 1000, max: 10 }, // 10 requests per minute for auth
  api: { window: 60 * 1000, max: 60 }, // 60 requests per minute for general API
  booking: { window: 60 * 1000, max: 30 }, // 30 requests per minute for bookings
  payment: { window: 60 * 1000, max: 10 }, // 10 requests per minute for payments
  reviews: { window: 60 * 1000, max: 5 }, // 5 requests per minute for reviews (prevent spam)
  devis: { window: 60 * 1000, max: 10 }, // 10 requests per minute for devis requests
  contact: { window: 300 * 1000, max: 3 }, // 3 requests per 5 minutes for contact
  default: { window: 60 * 1000, max: 100 }, // 100 requests per minute default
}

function getRateLimitConfig(pathname: string) {
  if (pathname.startsWith('/api/auth')) return RATE_LIMITS.auth
  if (pathname.startsWith('/api/payments') || pathname.startsWith('/api/stripe')) return RATE_LIMITS.payment
  if (pathname.startsWith('/api/bookings')) return RATE_LIMITS.booking
  if (pathname.startsWith('/api/reviews')) return RATE_LIMITS.reviews
  if (pathname.startsWith('/api/devis') || pathname.startsWith('/api/artisan/devis')) return RATE_LIMITS.devis
  if (pathname.startsWith('/api/contact')) return RATE_LIMITS.contact
  if (pathname.startsWith('/api/')) return RATE_LIMITS.api
  return RATE_LIMITS.default
}

function getRateLimitKey(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  return `${ip}:${request.nextUrl.pathname}`
}

function checkRateLimit(key: string, config: { window: number; max: number }): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimit.get(key)

  // Clean up old entries periodically
  if (rateLimit.size > 10000) {
    Array.from(rateLimit.entries()).forEach(([k, v]) => {
      if (now > v.resetTime) rateLimit.delete(k)
    })
  }

  if (!record || now > record.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + config.window })
    return { allowed: true, remaining: config.max - 1 }
  }

  if (record.count >= config.max) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: config.max - record.count }
}

// Generate nonce for CSP
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

// Security headers
function addSecurityHeaders(response: NextResponse, _nonce: string, request: NextRequest): NextResponse {
  // Skip strict CSP in development or for mobile app (Capacitor WebView)
  const userAgent = request.headers.get('user-agent') || ''
  const isCapacitor = userAgent.includes('Capacitor') || userAgent.includes('Android') || userAgent.includes('iPhone')
  const isDev = process.env.NODE_ENV === 'development'

  // In development or mobile app, use permissive CSP
  if (isDev || isCapacitor) {
    const permissiveCsp = [
      "default-src * 'self' data: blob:",
      "script-src * 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src * 'self' 'unsafe-inline'",
      "font-src * 'self' data:",
      "img-src * 'self' data: blob: https: http:",
      "connect-src * 'self' https: http: ws: wss:",
      "frame-src *",
    ]
    response.headers.set('Content-Security-Policy', permissiveCsp.join('; '))

    // Other security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-DNS-Prefetch-Control', 'on')

    return response
  }

  // Content Security Policy - Production version compatible with Next.js
  // Note: 'unsafe-inline' is required for Next.js inline scripts/styles
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co https://api-adresse.data.gouv.fr",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.openstreetmap.org https://openstreetmap.org",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ]

  response.headers.set('Content-Security-Policy', cspDirectives.join('; '))

  // Other security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  // CSRF Token header for API routes
  if (response.headers.get('content-type')?.includes('application/json')) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }

  return response
}

// URL canonicalization
function getCanonicalUrl(request: NextRequest): string | null {
  const url = request.nextUrl
  const host = request.headers.get('host') || 'servicesartisans.fr'

  // Force HTTPS and remove www in production
  if (process.env.NODE_ENV === 'production') {
    if (url.protocol === 'http:' || host.startsWith('www.')) {
      const canonicalHost = host.replace(/^www\./, '')
      return `https://${canonicalHost}${url.pathname}${url.search}`
    }
  }

  // Remove trailing slashes (except for root)
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    return `https://${host}${url.pathname.slice(0, -1)}${url.search}`
  }

  return null
}

// Check if string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const nonce = generateNonce()

  // Redirect legacy /services/artisan/[uuid] to new SEO-friendly URLs
  const legacyArtisanMatch = pathname.match(/^\/services\/artisan\/([^\/]+)$/)
  if (legacyArtisanMatch) {
    const idOrSlug = legacyArtisanMatch[1]
    // Only redirect UUIDs - slugs might be valid routes
    if (isValidUUID(idOrSlug)) {
      try {
        // Fetch provider data to get the correct redirect URL
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
        const apiResponse = await fetch(`${baseUrl}/api/artisans/${idOrSlug}`, {
          headers: { 'Accept': 'application/json' },
        })

        if (apiResponse.ok) {
          const data = await apiResponse.json()
          if (data.success && data.artisan) {
            const artisan = data.artisan
            // Generate slugs for the new URL
            const slugify = (text: string) => text
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')

            const serviceSlug = artisan.specialty_slug || slugify(artisan.specialty || 'artisan')
            const citySlug = artisan.city_slug || slugify(artisan.city || 'france')
            const artisanSlug = artisan.slug || slugify(artisan.business_name || idOrSlug)

            const newUrl = `${baseUrl}/services/${serviceSlug}/${citySlug}/${artisanSlug}`
            return NextResponse.redirect(newUrl, 301)
          }
        }
      } catch (error) {
        console.error('Error redirecting legacy artisan URL:', error)
      }
    }
  }

  // Rate limiting for all API routes
  if (pathname.startsWith('/api/')) {
    const config = getRateLimitConfig(pathname)
    const rateLimitKey = getRateLimitKey(request)
    const { allowed } = checkRateLimit(rateLimitKey, config)

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: 9004,
            message: 'Trop de requetes. Veuillez reessayer plus tard.'
          }
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + 60),
          },
        }
      )
    }
  }

  // URL canonicalization (redirect if needed)
  const canonicalUrl = getCanonicalUrl(request)
  if (canonicalUrl && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(canonicalUrl, 301)
  }

  // Redirect /pro/* to /espace-artisan/* (unification)
  if (pathname.startsWith('/pro')) {
    const newPath = pathname.replace('/pro', '/espace-artisan')
    return NextResponse.redirect(new URL(newPath, request.url), 301)
  }

  // PROTECTION STRICTE DES ESPACES CLIENT/ARTISAN
  // Check BEFORE processing session to avoid unnecessary work
  if (pathname.startsWith('/espace-client') || pathname.startsWith('/espace-artisan')) {
    try {
      const { createServerClient } = await import('@supabase/ssr')
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set() {},
            remove() {},
          },
        }
      )

      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        // No session, redirect to login
        const redirectUrl = encodeURIComponent(pathname)
        return NextResponse.redirect(new URL(`/connexion?redirect=${redirectUrl}`, request.url))
      }

      // Fetch user profile to check user_type
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()

      if (profile) {
        // Block clients from artisan space
        if (pathname.startsWith('/espace-artisan') && profile.user_type !== 'artisan') {
          return NextResponse.redirect(new URL('/espace-client', request.url))
        }

        // Block artisans from client space
        if (pathname.startsWith('/espace-client') && profile.user_type === 'artisan') {
          return NextResponse.redirect(new URL('/espace-artisan', request.url))
        }
      }
    } catch (error) {
      console.error('Error checking user type in middleware:', error)
      // In case of error, let the page handle auth
    }
  }

  // Process session and continue
  let response: NextResponse
  try {
    response = await updateSession(request)
  } catch {
    response = NextResponse.next()
  }

  // Add nonce to response for use in pages
  response.headers.set('x-nonce', nonce)

  // Add pathname for server components
  response.headers.set('x-pathname', pathname)

  // Add security headers
  return addSecurityHeaders(response, nonce, request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
