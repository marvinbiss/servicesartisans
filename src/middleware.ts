import { type NextRequest, NextResponse, type NextFetchEvent } from 'next/server'
import { type CookieOptions } from '@supabase/ssr'
import { updateSession } from '@/lib/supabase/middleware'
import {
  checkRateLimit,
  getRateLimitConfig,
  getRateLimitKey,
  getClientIp,
} from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'

// Edge runtime — `node:crypto` is not available. Implements constant-time
// comparison manually so we don't leak timing info on CRON_SECRET (audit
// 2026-04-25 agent #9 H1).
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}
import { isSafeRedirectPath } from '@/lib/safe-redirect'
import { evaluateGonePath, goneResponseHeaders, GONE_RESPONSE_BODY } from '@/lib/seo/gone-paths'

/**
 * Middleware v3 — performance-optimized
 * - Session refresh (with validation cache)
 * - Auth guard for private routes
 * - URL canonicalization
 * - CSP header with per-request nonce (other security headers in next.config.js)
 * - Rate limiting for API routes (Upstash Redis in production, in-memory fallback in dev)
 */

// Static CSP — no nonce (Next.js 14 App Router doesn't propagate nonce to framework chunks)
// 'unsafe-inline' required for Next.js inline scripts; 'self' covers /_next/static/chunks/*.js
const STATIC_CSP =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://t.contentsquare.net https://www.clarity.ms; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com data:; " +
  "img-src 'self' data: blob: https: http:; " +
  "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co https://api-adresse.data.gouv.fr https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://api.anthropic.com https://api.openai.com https://www.clarity.ms https://*.contentsquare.net https://connect.facebook.net https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com; " +
  "worker-src 'self' blob:; " +
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.openstreetmap.org; " +
  "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests"

// CSP headers only — other security headers are set in next.config.js (more efficient, handled at CDN edge)
function addCspHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const userAgent = request.headers.get('user-agent') || ''
  const isCapacitor =
    userAgent.includes('Capacitor') || userAgent.includes('Android') || userAgent.includes('iPhone')
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev || isCapacitor) {
    return response
  }

  response.headers.set('Content-Security-Policy', STATIC_CSP)

  return response
}

// Legacy redirects — hoisted to module scope to avoid per-request allocation
const LEGACY_REDIRECTS: Record<string, string> = {
  '/problemes-courants': '/problemes',
  '/outils/diagnostic-artisan': '/outils/diagnostic',
  '/barometre-prix': '/barometre',
  '/calculateur': '/outils/calculateur-prix',
}

// URL canonicalization — all fixes combined into a single 301 hop
function getCanonicalRedirect(request: NextRequest): string | null {
  const url = request.nextUrl
  const host = request.headers.get('host') || 'servicesartisans.fr'

  let canonicalHost = host
  let pathname = url.pathname
  let needsRedirect = false

  // 1. http → https + www → non-www
  if (process.env.NODE_ENV === 'production') {
    if (url.protocol === 'http:' || host.startsWith('www.')) {
      canonicalHost = host.replace(/^www\./, '')
      needsRedirect = true
    }
  }

  // 2. Trailing slash removal
  if (pathname !== '/' && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1)
    needsRedirect = true
  }

  // 3. UTM/tracking parameters preserved — GA4/GTM need them in the URL at page load time.
  //    Stripping via 301 before JS executes destroys all attribution data in Google Analytics.
  const search = url.search

  // 4. Lowercase normalization — prevent duplicate content from mixed-case URLs
  //    Exclude artisan publicId paths: /services/{service}/{location}/{publicId}
  //    because stable_id contains mixed-case characters (HMAC-SHA256 base64)
  //    Exclude simulateur result paths: /simulateur-aides-renovation/resultat/EST-YYYY-MM-DD-xxxxxx
  //    because public_id uses uppercase EST- prefix stored as-is in DB
  const isArtisanPublicIdPath = /^\/services\/[^/]+\/[^/]+\/[^/]+$/.test(pathname)
  const isSimulateurResultPath = /^\/simulateur-aides-renovation\/resultat\/[^/]+$/.test(pathname)
  if (!isArtisanPublicIdPath && !isSimulateurResultPath && pathname !== pathname.toLowerCase()) {
    pathname = pathname.toLowerCase()
    needsRedirect = true
  }

  if (needsRedirect) {
    return `https://${canonicalHost}${pathname}${search}`
  }

  return null
}

// Bot detection — includes Googlebot, Googlebot-Mobile/Image, AdsBot-Google,
// Google-InspectionTool (GSC URL inspection), GoogleOther (R&D), Google-CloudVertexBot,
// Google-Extended (Gemini training), Applebot/Applebot-Extended, Bingbot/Bingbot-2.0,
// DuckDuckBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot.
//
// Audit 2026-04-25 (agent #1 bis B3) : on n'exempte du rate-limit que les
// requêtes GET/HEAD pour éviter qu'un attaquant spoof son UA en `Googlebot`
// pour spammer /api/devis, /api/reviews, /api/simulateur/submit. Le DNS
// reverse anti-spoofing officiel Google n'est pas possible dans Edge runtime
// (pas d'accès `node:dns`) — il sera ajouté côté Node runtime sur les routes
// sensibles si besoin (cf. Vague H).
const CRAWLER_RE =
  /Googlebot|AdsBot-Google|APIs-Google|Mediapartners-Google|Google-InspectionTool|GoogleOther|Google-CloudVertexBot|Google-Extended|bingbot|Applebot|DuckDuckBot|OAI-SearchBot|ChatGPT-User|PerplexityBot|ClaudeBot/i

/** Fire-and-forget Googlebot log to Supabase (runs in waitUntil, never blocks response) */
async function logGooglebotCrawl(url: string, userAgent: string) {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    await supabase.from('googlebot_logs').insert({ url, user_agent: userAgent })
  } catch {
    // Silent fail — logging must never impact user experience
  }
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl

  // Soft 404 permanent solve (bug Next.js 14.2 #69103) — DOIT passer avant
  // toute autre logique. Les routes ISR avec `dynamicParams: true` + `notFound()`
  // retournent HTTP 200 en 14.2 ; on intercepte en amont sur les slugs
  // structurellement invalides et on retourne un vrai HTTP 410 Gone au CDN.
  // Validation purement statique (zéro I/O), voir `@/lib/seo/gone-paths`.
  //
  // GET/HEAD uniquement — on ne veut pas casser d'éventuels webhook /cee/xxx
  // qui passeraient par middleware en POST (aucun en prod aujourd'hui, mais
  // défense en profondeur).
  if (request.method === 'GET' || request.method === 'HEAD') {
    const goneDecision = evaluateGonePath(pathname)
    if (goneDecision.gone) {
      return new NextResponse(GONE_RESPONSE_BODY, {
        status: 410,
        headers: goneResponseHeaders(),
      })
    }
  }

  // Redirect /tarifs-artisans → /tarifs (301 permanent, cached at CDN edge)
  if (pathname.startsWith('/tarifs-artisans')) {
    const newPath = pathname.replace('/tarifs-artisans', '/tarifs')
    const host = request.headers.get('host') || 'servicesartisans.fr'
    const redirectResponse = NextResponse.redirect(
      `https://${host}${newPath}${request.nextUrl.search}`,
      301
    )
    redirectResponse.headers.set(
      'Cache-Control',
      'public, s-maxage=31536000, stale-while-revalidate=31536000'
    )
    redirectResponse.headers.set(
      'CDN-Cache-Control',
      'public, s-maxage=31536000, stale-while-revalidate=31536000'
    )
    return redirectResponse
  }

  // Redirect legacy/mistyped URLs → correct paths (301 permanent, cached at CDN edge)
  if (LEGACY_REDIRECTS[pathname]) {
    const host = request.headers.get('host') || 'servicesartisans.fr'
    const legacyRedirect = NextResponse.redirect(
      `https://${host}${LEGACY_REDIRECTS[pathname]}${request.nextUrl.search}`,
      301
    )
    legacyRedirect.headers.set(
      'Cache-Control',
      'public, s-maxage=31536000, stale-while-revalidate=31536000'
    )
    legacyRedirect.headers.set(
      'CDN-Cache-Control',
      'public, s-maxage=31536000, stale-while-revalidate=31536000'
    )
    return legacyRedirect
  }

  // URL canonicalization
  const canonicalUrl = getCanonicalRedirect(request)
  if (canonicalUrl && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(canonicalUrl, 301)
  }

  // Nonce removed — Next.js 14 App Router doesn't propagate nonce to framework chunk <script> tags
  // so 'strict-dynamic' CSP breaks all /_next/static/chunks/*.js loading

  // Auth guard for private spaces
  // Uses proper cookie handling to avoid token rotation race condition:
  // the Supabase client may refresh an expired JWT, so set() MUST persist
  // the new tokens — otherwise updateSession re-reads stale cookies and
  // the already-rotated refresh token is rejected, destroying the session.
  // authGuardResponse carries refreshed Set-Cookie headers to the browser.
  let authGuardResponse: NextResponse | null = null
  if (
    pathname.startsWith('/espace-client') ||
    pathname.startsWith('/espace-artisan') ||
    (pathname.startsWith('/admin') && pathname !== '/admin/connexion')
  ) {
    try {
      const { createServerClient } = await import('@supabase/ssr')

      let pendingResponse = NextResponse.next({
        request: { headers: request.headers },
      })

      const supabase = createServerClient(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              request.cookies.set({ name, value, ...options })
              pendingResponse = NextResponse.next({
                request: { headers: request.headers },
              })
              pendingResponse.cookies.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              request.cookies.set({ name, value: '', ...options })
              pendingResponse = NextResponse.next({
                request: { headers: request.headers },
              })
              pendingResponse.cookies.set({ name, value: '', ...options })
            },
          },
        }
      )

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        const redirectUrl = isSafeRedirectPath(pathname)
          ? encodeURIComponent(pathname)
          : encodeURIComponent('/espace-client')
        return NextResponse.redirect(new URL(`/connexion?redirect=${redirectUrl}`, request.url))
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile) {
        if (pathname.startsWith('/espace-artisan') && profile.role !== 'artisan') {
          return NextResponse.redirect(new URL('/espace-client', request.url))
        }
        if (pathname.startsWith('/espace-client') && profile.role === 'artisan') {
          return NextResponse.redirect(new URL('/espace-artisan', request.url))
        }
      }

      // Keep the response with refreshed cookies for use as the final response
      authGuardResponse = pendingResponse
    } catch (error) {
      logger.error('Middleware auth error:', error)
      const loginUrl = new URL('/connexion', request.url)
      loginUrl.searchParams.set(
        'redirect',
        isSafeRedirectPath(request.nextUrl.pathname) ? request.nextUrl.pathname : '/espace-client'
      )
      return NextResponse.redirect(loginUrl)
    }
  }

  // Rate limiting for API routes (skip health check — must always respond fast)
  // Skip Googlebot + other validated crawlers: GSC reports "Connectivité serveur"
  // quand Googlebot prend un 429 (incident 2026-04-22 Upstash fail-close, 62.1%
  // échec exploration). On isole les crawlers officiels du rate-limit user-facing.
  const uaForRateLimit = request.headers.get('user-agent') || ''
  // Crawler exemption ne s'applique QUE sur GET/HEAD pour empêcher un attaquant
  // de spoofer son UA en `Googlebot` afin de bypasser le rate-limit sur les
  // mutations (POST /api/devis, /api/reviews, /api/simulateur/submit).
  const isReadOnlyMethod = request.method === 'GET' || request.method === 'HEAD'
  const isCrawlerExempt = isReadOnlyMethod && CRAWLER_RE.test(uaForRateLimit)
  // Server Actions transitent en POST sur l'URL de la page avec header
  // `Next-Action: <hash>` (Next 14 App Router). Sans cette détection, elles
  // échappaient au rate-limit (gap CVE GHSA-h25m-26qc-wcjf, audit 2026-04-26).
  const isServerAction = request.method === 'POST' && request.headers.has('next-action')
  if (
    (pathname.startsWith('/api/') && pathname !== '/api/health' && !isCrawlerExempt) ||
    isServerAction
  ) {
    const clientIp = getClientIp(request.headers)
    // Pour Server Actions, le `pathname` est l'URL de la page (ex. `/devis`),
    // pas `/api/*`. On force un bucket dédié pour ne pas tomber sur le bucket
    // `default` (trop permissif) ou un bucket de page non pertinent.
    const rateLimitConfig = isServerAction
      ? getRateLimitConfig('/_next/server-action')
      : getRateLimitConfig(pathname)
    const rateLimitKey = isServerAction
      ? getRateLimitKey(clientIp, '/_next/server-action')
      : getRateLimitKey(clientIp, pathname)

    try {
      const result = await checkRateLimit(rateLimitKey, rateLimitConfig)

      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000)
        return new NextResponse(
          JSON.stringify({ error: 'Trop de requêtes. Veuillez réessayer plus tard.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(retryAfter),
              'X-RateLimit-Limit': String(rateLimitConfig.max),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(result.resetTime),
            },
          }
        )
      }
    } catch (error) {
      // Audit 2026-04-25 (agent #8 BLOCKER) : auparavant le catch swallowait
      // toute erreur Upstash et laissait passer la requête, ce qui rendait
      // de fait fail-open les buckets `payment`, `gdpr`, `ai`, `verify`,
      // `geocode` (déclarés sans `failOpen: true`). On respecte désormais le
      // flag explicitement : si le bucket veut fail-close, retourner 503.
      logger.error('Rate limiter error:', error)
      if (rateLimitConfig.failOpen !== true) {
        return new NextResponse(
          JSON.stringify({
            error: 'Service temporairement indisponible',
            code: 'RATE_LIMITER_DOWN',
          }),
          {
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '30',
            },
          }
        )
      }
    }
  }

  // CSRF protection — validate Origin header for mutating API requests
  // Sécurité : comparaison stricte du hostname (pas de .includes()),
  // fail-closed si Origin absent (sauf Bearer token ou CRON_SECRET)
  const method = request.method
  if (
    method !== 'GET' &&
    method !== 'HEAD' &&
    method !== 'OPTIONS' &&
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/webhooks/') &&
    !pathname.startsWith('/api/cron/') &&
    !pathname.startsWith('/api/sitemap') &&
    !pathname.startsWith('/api/indexnow') &&
    pathname !== '/api/health'
  ) {
    const origin = request.headers.get('origin')

    // Exceptions : les requêtes avec Bearer token (Supabase auth) ou CRON_SECRET
    // peuvent légitimement ne pas avoir d'en-tête Origin
    const authHeader = request.headers.get('authorization') || ''
    const hasBearerToken = authHeader.startsWith('Bearer ')
    const cronSecret =
      request.headers.get('x-cron-secret') || request.nextUrl.searchParams.get('cron_secret')
    const expectedCronSecret = process.env.CRON_SECRET
    const hasValidCronSecret = !!(
      cronSecret &&
      expectedCronSecret &&
      constantTimeEqual(cronSecret, expectedCronSecret)
    )
    const isExempted = hasBearerToken || hasValidCronSecret

    if (!origin) {
      // Fail-closed : rejeter si pas d'Origin sur les requêtes mutantes (sauf exceptions)
      if (!isExempted) {
        return new NextResponse(JSON.stringify({ error: 'En-tête Origin requis' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } else {
      // Vérification stricte du hostname (=== ou sous-domaine légitime)
      const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
      try {
        const allowedHostname = new URL(allowedOrigin).hostname
        const originHostname = new URL(origin).hostname
        const isAllowed =
          originHostname === allowedHostname || originHostname.endsWith('.' + allowedHostname)
        if (!isAllowed) {
          return new NextResponse(JSON.stringify({ error: 'Origine non autorisée' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      } catch {
        // Fail-closed : si le parsing URL échoue, rejeter la requête
        return new NextResponse(JSON.stringify({ error: 'Origine invalide' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  }

  // Refresh session — only for routes that need auth (skip Supabase call for public pages)
  // If auth guard already refreshed the session, reuse its response (carries Set-Cookie headers)
  let response: NextResponse
  const needsAuth =
    pathname.startsWith('/espace-') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/booking')
  if (authGuardResponse) {
    // Auth guard already refreshed the session — reuse its response with Set-Cookie headers
    response = authGuardResponse
  } else if (needsAuth) {
    try {
      response = await updateSession(request)
    } catch {
      response = NextResponse.next()
    }
  } else {
    response = NextResponse.next()
  }

  response.headers.set('x-pathname', pathname)

  // X-Robots-Tag + Cache-Control for all private, admin, and auth routes.
  // Belt-and-suspenders: metadata robots in layout.tsx handles <meta>, this handles HTTP header.
  // Both signals ensure crawlers never index private content even if one is missed.
  if (
    pathname.startsWith('/espace-artisan') ||
    pathname.startsWith('/espace-client') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/booking') ||
    pathname.startsWith('/auth/')
  ) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  }
  // Auth pages — noindex via HTTP header (supplements layout.tsx metadata)
  if (
    pathname === '/connexion' ||
    pathname === '/inscription' ||
    pathname === '/inscription-artisan' ||
    pathname === '/mot-de-passe-oublie' ||
    pathname === '/definir-mot-de-passe'
  ) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  // CDN cache headers for public pages.
  // Vercel CDN does NOT cache 4xx/5xx responses regardless of Cache-Control,
  // so these headers only affect successful (2xx) responses.
  //
  // Strategy: prefix-match covers all dynamic/nested routes, exact-match covers leaf pages.
  // Any public route that starts with one of these prefixes gets CDN caching.
  const publicCachePrefixes = [
    '/services/',
    '/devis/',
    '/tarifs/',
    '/avis/',
    '/villes/',
    '/departements/',
    '/regions/',
    '/problemes/',
    '/urgence/',
    '/guides/',
    '/questions/',
    '/blog/',
    '/comparaison/',
    '/barometre/',
    '/outils/',
  ]
  // Exact-match pages (no sub-routes, or the index page of a prefix group)
  const publicCacheExact = new Set([
    '/',
    '/blog',
    '/faq',
    '/contact',
    '/comment-ca-marche',
    '/comparaison',
    '/artisans',
    '/carte-artisans',
    '/a-propos',
    '/garantie',
    '/cgv',
    '/confidentialite',
    '/accessibilite',
    '/avant-apres',
    '/calendrier-travaux',
    '/badge-artisan',
    '/carrieres',
    '/barometre',
    '/glossaire',
    '/guides',
    '/faq',
    '/avis',
    '/problemes',
    '/departements',
    '/regions',
    '/villes',
    '/normes',
    '/outils',
    '/checklist-travaux',
    '/statistiques-artisans-france',
    '/presse',
    '/partenaires',
    '/mediation',
    '/mentions-legales',
    '/politique-avis',
    '/plan-du-site',
    '/verifier-artisan',
    '/notre-processus-de-verification',
    '/devis',
    '/tarifs',
    // /recherche removed — 301-redirects to /services (never reaches middleware cache logic)
  ])
  if (publicCacheExact.has(pathname) || publicCachePrefixes.some((p) => pathname.startsWith(p))) {
    response.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')
    response.headers.set(
      'CDN-Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=604800'
    )
  }

  // Googlebot crawl logging — non-blocking via waitUntil. Restreint à
  // Googlebot stricto sensu (pas tous les crawlers) pour éviter de polluer
  // googlebot_logs avec Bing/Apple/etc, et limité aux GET/HEAD pour éviter
  // qu'un attaquant spoofant `Googlebot` flood la table via POST.
  const ua = request.headers.get('user-agent') || ''
  if ((request.method === 'GET' || request.method === 'HEAD') && /Googlebot/i.test(ua)) {
    event.waitUntil(logGooglebotCrawl(pathname, ua))
  }

  return addCspHeaders(response, request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|sitemap/|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|css|js|woff2?)$).*)',
  ],
}
