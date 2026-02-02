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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const nonce = generateNonce()

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

  // Check for protected routes (client-side will handle redirect)
  // Note: Actual auth check happens in the page/API route level

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
