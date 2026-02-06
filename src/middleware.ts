import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Middleware v2 — simplified
 * - Session refresh
 * - Auth guard for private routes
 * - URL canonicalization
 * - Security headers
 *
 * Rate-limiting should be handled at edge/CDN level (Vercel, Cloudflare)
 * not in-memory which resets on every deploy.
 */

// Security headers
function addSecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const userAgent = request.headers.get('user-agent') || ''
  const isCapacitor = userAgent.includes('Capacitor') || userAgent.includes('Android') || userAgent.includes('iPhone')
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev || isCapacitor) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-DNS-Prefetch-Control', 'on')
    return response
  }

  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co https://api-adresse.data.gouv.fr",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ]

  response.headers.set('Content-Security-Policy', cspDirectives.join('; '))
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  return response
}

// URL canonicalization
function getCanonicalRedirect(request: NextRequest): string | null {
  const url = request.nextUrl
  const host = request.headers.get('host') || 'servicesartisans.fr'

  if (process.env.NODE_ENV === 'production') {
    if (url.protocol === 'http:' || host.startsWith('www.')) {
      const canonicalHost = host.replace(/^www\./, '')
      return `https://${canonicalHost}${url.pathname}${url.search}`
    }
  }

  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    return `https://${host}${url.pathname.slice(0, -1)}${url.search}`
  }

  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // URL canonicalization
  const canonicalUrl = getCanonicalRedirect(request)
  if (canonicalUrl && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(canonicalUrl, 301)
  }

  // Auth guard for private spaces
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
        const redirectUrl = encodeURIComponent(pathname)
        return NextResponse.redirect(new URL(`/connexion?redirect=${redirectUrl}`, request.url))
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()

      if (profile) {
        if (pathname.startsWith('/espace-artisan') && profile.user_type !== 'artisan') {
          return NextResponse.redirect(new URL('/espace-client', request.url))
        }
        if (pathname.startsWith('/espace-client') && profile.user_type === 'artisan') {
          return NextResponse.redirect(new URL('/espace-artisan', request.url))
        }
      }
    } catch (error) {
      console.error('Middleware auth error:', error)
    }
  }

  // Refresh session
  let response: NextResponse
  try {
    response = await updateSession(request)
  } catch {
    response = NextResponse.next()
  }

  response.headers.set('x-pathname', pathname)

  return addSecurityHeaders(response, request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
