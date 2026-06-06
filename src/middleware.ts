import { type NextRequest, NextResponse, type NextFetchEvent } from 'next/server'
import { type CookieOptions } from '@supabase/ssr'
import { updateSession } from '@/lib/supabase/middleware'
import {
  checkRateLimit,
  getRateLimitConfig,
  getRateLimitKey,
  getClientIp,
  RATE_LIMITS,
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

// Plan D — SLA 99.9% : middleware sur le hot path de tous les /espace-* et
// /admin. Supabase auth.getUser() + profile fetch sans timeout = stall = tous
// les private routes hangent. 3s = budget large (auth normale 50-200ms) mais
// fail-fast permet au catch de rediriger vers /connexion si Supabase down.
//
// Note : on race juste la promise (pas d'AbortController natif sur
// supabase.auth.getUser()). Le fetch sortant peut continuer en background
// (lifecycle de la fonction Edge le terminera). Acceptable car middleware
// retourne déjà une redirect → la requête utilisateur est libérée.
const MIDDLEWARE_AUTH_TIMEOUT_MS = 3_000
function withAuthTimeout<T>(promise: PromiseLike<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null
  return new Promise<T>((resolve, reject) => {
    timer = setTimeout(
      () => reject(new Error(`[middleware-timeout] ${label} > ${MIDDLEWARE_AUTH_TIMEOUT_MS}ms`)),
      MIDDLEWARE_AUTH_TIMEOUT_MS
    )
    Promise.resolve(promise).then(
      (val) => {
        if (timer) clearTimeout(timer)
        resolve(val)
      },
      (err) => {
        if (timer) clearTimeout(timer)
        reject(err)
      }
    )
  })
}
import { isSafeRedirectPath } from '@/lib/safe-redirect'
import { evaluateGonePath, goneResponseHeaders, GONE_RESPONSE_BODY } from '@/lib/seo/gone-paths'
import {
  PENDING_COOKIE_NAME,
  VERIFIED_COOKIE_NAME,
  readVerifiedCookie,
} from '@/lib/auth/two-factor-cookies'

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
function addCspHeaders(response: NextResponse, _request: NextRequest): NextResponse {
  if (process.env.NODE_ENV === 'development') {
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
  //    Exclude /api/** — no duplicate-content concern, and the 301 corrupts
  //    case-sensitive path params (review invitation tokens) while converting
  //    POST to GET (fetch follows 301 with method rewrite → 405)
  //    Exclude /invitation-avis/{token} — base64url tokens are case-sensitive;
  //    lowercasing breaks the SHA256 lookup ("Invitation introuvable")
  const isArtisanPublicIdPath = /^\/services\/[^/]+\/[^/]+\/[^/]+$/.test(pathname)
  const isSimulateurResultPath = /^\/simulateur-aides-renovation\/resultat\/[^/]+$/.test(pathname)
  const isCaseSensitivePath =
    pathname.startsWith('/api/') || pathname.startsWith('/invitation-avis/')
  if (
    !isArtisanPublicIdPath &&
    !isSimulateurResultPath &&
    !isCaseSensitivePath &&
    pathname !== pathname.toLowerCase()
  ) {
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
// Audit 2026-04-30 (incident 5xx 12 890 GSC) : on whiteliste aussi les bots
// SEO/data tools (AhrefsBot, SemrushBot, MJ12bot, DataForSeoBot, YandexBot,
// BLEXBot) car (1) ils crawlent en pic et déclenchaient `RATE_LIMITS.api`
// fail-open mais saturaient quand même le compteur Upstash, (2) couper Ahrefs
// nous prive de notre propre télémétrie SEO. Tous en GET/HEAD only (cf. note
// ci-dessus sur le risque de spoofing UA).
export const CRAWLER_RE =
  /Googlebot|AdsBot-Google|APIs-Google|Mediapartners-Google|Google-InspectionTool|GoogleOther|Google-CloudVertexBot|Google-Extended|bingbot|Applebot|Applebot-Extended|DuckDuckBot|GPTBot|OAI-SearchBot|ChatGPT-User|PerplexityBot|ClaudeBot|Claude-SearchBot|Claude-User|anthropic-ai|MistralBot|Mistralai-User|Amazonbot|Meta-ExternalAgent|YouBot|CCBot|AhrefsBot|SemrushBot|MJ12bot|DataForSeoBot|YandexBot|BLEXBot|facebookexternalhit|LinkedInBot|Twitterbot/i

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
    if (goneDecision.redirect) {
      const host = request.headers.get('host') || 'servicesartisans.fr'
      const target = `https://${host}${goneDecision.redirect.to}`
      const response = NextResponse.redirect(target, goneDecision.redirect.status)
      // Sprint AI Ahrefs 2026-05-03 — Cache-Control par-redirect.
      // Si le decision fournit un override (cas Sprints U/W récents), on l'utilise.
      // Sinon, default 24h (TTL legacy stable, sans purge fréquente).
      const cacheControl =
        goneDecision.redirect.cacheControl ??
        'public, s-maxage=86400, stale-while-revalidate=604800'
      response.headers.set('Cache-Control', cacheControl)
      response.headers.set('CDN-Cache-Control', cacheControl)
      return response
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
      } = await withAuthTimeout(supabase.auth.getUser(), 'auth.getUser')

      if (authError || !user) {
        const redirectUrl = isSafeRedirectPath(pathname)
          ? encodeURIComponent(pathname)
          : encodeURIComponent('/espace-artisan')
        return NextResponse.redirect(new URL(`/connexion?redirect=${redirectUrl}`, request.url))
      }

      const { data: profile } = await withAuthTimeout(
        supabase.from('profiles').select('role, two_factor_enabled').eq('id', user.id).single(),
        'profiles.select'
      )

      if (profile) {
        // Plan C — C-1 (BLOCKER CVSS 8.1) : 2FA gate post-signin.
        // Si l'utilisateur a activé 2FA, on exige le cookie HMAC `sa_2fa_verified`
        // valide AVANT de servir une route privée. Sinon redirect vers
        // /verifier-2fa qui collectera le code TOTP. Couvre aussi les sessions
        // hijackées : un attaquant qui vole la session Supabase doit toujours
        // produire un cookie verified signé HMAC (impossible sans le code TOTP).
        if (profile.two_factor_enabled === true) {
          const verifiedCookieValue = request.cookies.get(VERIFIED_COOKIE_NAME)?.value
          let verifiedPayload = null
          try {
            verifiedPayload = await readVerifiedCookie(verifiedCookieValue, user.id)
          } catch {
            verifiedPayload = null
          }
          if (!verifiedPayload) {
            const verifyUrl = new URL('/verifier-2fa', request.url)
            const nextPath = isSafeRedirectPath(pathname) ? pathname : '/espace-artisan'
            verifyUrl.searchParams.set('next', nextPath)
            const redirectResp = NextResponse.redirect(verifyUrl)
            // Si pas de cookie pending non plus, le user n'a même pas franchi
            // signin → on le renvoie vers /connexion. Sinon /verifier-2fa va
            // accepter sa session pending.
            const hasPending = !!request.cookies.get(PENDING_COOKIE_NAME)?.value
            if (!hasPending) {
              const loginUrl = new URL('/connexion', request.url)
              loginUrl.searchParams.set('redirect', nextPath)
              return NextResponse.redirect(loginUrl)
            }
            return redirectResp
          }
        }

        if (pathname.startsWith('/espace-artisan') && profile.role !== 'artisan') {
          // Espace particulier fermé 2026-06-05 : ne jamais y envoyer un
          // admin ; un client legacy garde son espace (RGPD conservé).
          const target = profile.role === 'super_admin' ? '/admin' : '/espace-client'
          return NextResponse.redirect(new URL(target, request.url))
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
        isSafeRedirectPath(request.nextUrl.pathname) ? request.nextUrl.pathname : '/espace-artisan'
      )
      return NextResponse.redirect(loginUrl)
    }
  }

  // Rate limiting for API routes (skip health check — must always respond fast)
  // Audit V1 P0-2 : exemption totale crawler ouvrait un DoS via UA spoofing.
  // Désormais : crawlers GET/HEAD sont placés dans bucket `crawler` 600/min/IP
  // (10 req/s, large pour Googlebot légitime mais cap un attaquant qui spoof).
  // Mutations (POST/PUT/DELETE) ne bénéficient d'aucune exemption.
  const uaForRateLimit = request.headers.get('user-agent') || ''
  const isReadOnlyMethod = request.method === 'GET' || request.method === 'HEAD'
  const isCrawlerLike = isReadOnlyMethod && CRAWLER_RE.test(uaForRateLimit)
  // Server Actions transitent en POST sur l'URL de la page avec header
  // `Next-Action: <hash>` (Next 14 App Router). Sans cette détection, elles
  // échappaient au rate-limit (gap CVE GHSA-h25m-26qc-wcjf, audit 2026-04-26).
  const isServerAction = request.method === 'POST' && request.headers.has('next-action')
  if ((pathname.startsWith('/api/') && pathname !== '/api/health') || isServerAction) {
    const clientIp = getClientIp(request.headers)
    const bucketPath = isServerAction
      ? '/_next/server-action'
      : isCrawlerLike
        ? '/_crawler'
        : pathname
    const rateLimitConfig = isCrawlerLike ? RATE_LIMITS.crawler : getRateLimitConfig(bucketPath)
    const rateLimitKey = getRateLimitKey(clientIp, bucketPath)

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
      // Vérification stricte du hostname.
      //
      // 2026-05-07 — assouplit la vérif :
      //   1. same-origin (Origin === request URL origin) : par définition non-CSRF.
      //   2. NEXT_PUBLIC_SITE_URL et ses sous-domaines (apex/www).
      //   3. Vercel previews du projet SA uniquement : `servicesartisans-*.vercel.app`.
      //      L'ancien wildcard `*.vercel.app` acceptait n'importe quel projet
      //      Vercel tiers comme Origin valide = CSRF cross-tenant.
      try {
        const originHostname = new URL(origin).hostname
        const requestHostname = request.nextUrl.hostname
        const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
        const allowedHostname = new URL(allowedOrigin).hostname

        const isSameOrigin = originHostname === requestHostname
        const isAllowedHost =
          originHostname === allowedHostname || originHostname.endsWith('.' + allowedHostname)
        const isSaVercelPreview =
          originHostname.endsWith('.vercel.app') && originHostname.startsWith('servicesartisans-')

        if (!isSameOrigin && !isAllowedHost && !isSaVercelPreview) {
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
