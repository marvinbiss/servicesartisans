import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SITE_URL } from '@/lib/seo/config'
import { sanitizeQualificationCode } from '@/lib/rge/sanitize'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { withTimeout } from '@/lib/api/timeout'

// Data ADEME rafraîchie hebdo → on peut cacher agressivement côté CDN Vercel
// (24h fresh + 7j stale-while-revalidate). Protège la DB des scrapers.
export const dynamic = 'force-dynamic'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

/**
 * GET /api/v1/rge/search?city=lyon&qualification=QualiPAC&limit=20
 * GET /api/v1/rge/search?q=RENOV&city=marseille
 *
 * Recherche publique d'artisans RGE actifs. Max 50 résultats par requête,
 * rge_valid_until > today only. Trié par rge_valid_until DESC.
 */
export async function GET(request: NextRequest) {
  try {
    // SLA-99.9 : RL public API 600/min/IP fail-open (Redis down ≠ self-DoS).
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`v1-rge-search:${ip}`, {
      window: 60_000,
      max: 600,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'too_many_requests', message: 'Limite 600 req/min/IP atteinte.' },
        { status: 429, headers: CORS_HEADERS }
      )
    }

    const { searchParams } = request.nextUrl
    const q = (searchParams.get('q') || '').trim().slice(0, 100)
    const city = (searchParams.get('city') || '').trim().slice(0, 80)
    const qualification = (searchParams.get('qualification') || '').trim().slice(0, 40)
    const specialty = (searchParams.get('specialty') || '').trim().slice(0, 40)
    const limitRaw = parseInt(searchParams.get('limit') || '20', 10)
    const limit = Math.max(1, Math.min(50, Number.isFinite(limitRaw) ? limitRaw : 20))
    const offsetRaw = parseInt(searchParams.get('offset') || '0', 10)
    const offset = Math.max(0, Number.isFinite(offsetRaw) ? offsetRaw : 0)

    if (!q && !city && !qualification && !specialty) {
      return NextResponse.json(
        {
          error: 'missing_filter',
          message: 'Fournir au moins un filtre : ?q= | ?city= | ?qualification= | ?specialty=',
          docs: `${SITE_URL}/api/v1/docs`,
        },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const supabase = createAdminClient()
    const today = new Date().toISOString().slice(0, 10)

    let query = supabase
      .from('providers')
      .select(
        'siret,siren,name,address_city,address_postal_code,specialty,rge_qualifications,rge_valid_until,rge_organismes,stable_id',
        { count: 'exact' }
      )
      .eq('is_active', true)
      .not('rge_qualifications', 'is', null)
      .gte('rge_valid_until', today)

    if (q) query = query.ilike('name', `%${q}%`)
    if (city) query = query.ilike('address_city', city)
    if (specialty) query = query.eq('specialty', specialty)
    // Qualification filter : JSONB `@>` contains check. The value is interpolated
    // into both a JSON literal AND a Postgres array literal — strict whitelist
    // applied by `sanitizeQualificationCode`.
    if (qualification) {
      const safe = sanitizeQualificationCode(qualification)
      if (safe.length >= 2) {
        query = query.or(`rge_qualifications.cs.[{"code":"${safe}"}],rge_organismes.cs.{${safe}}`)
      }
    }

    // SLA-99.9 : timeout amont 5s. Au-delà, fallback `not_found` 200 cacheable.
    const { data, count, error } = await withTimeout(
      query.order('rge_valid_until', { ascending: false }).range(offset, offset + limit - 1),
      5_000,
      'v1_rge_search'
    )

    if (error) {
      logger.error('v1/rge/search: supabase error', error)
      captureError(error, { tags: { route: 'api/v1/rge/search', critical: 'true' } })
      return NextResponse.json(
        { error: 'search_failed', message: 'Erreur temporaire, réessayez.' },
        { status: 503, headers: { ...CORS_HEADERS, 'Cache-Control': 'public, s-maxage=60' } }
      )
    }

    const results = (data ?? []).map((r) => ({
      siret: r.siret,
      siren: r.siren,
      name: r.name,
      address_city: r.address_city,
      address_postal_code: r.address_postal_code,
      specialty: r.specialty,
      rge_valid_until: r.rge_valid_until,
      rge_organismes: r.rge_organismes ?? [],
      qualification_count: Array.isArray(r.rge_qualifications) ? r.rge_qualifications.length : 0,
      public_url: r.stable_id
        ? `${SITE_URL}/services/${r.specialty || 'artisan'}/${(r.address_city || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')}/${r.stable_id}`
        : null,
    }))

    return NextResponse.json(
      {
        filters: {
          q: q || null,
          city: city || null,
          qualification: qualification || null,
          specialty: specialty || null,
        },
        pagination: { limit, offset, total: count ?? results.length },
        count: results.length,
        results,
        source: 'ADEME annuaire-entreprises RGE officiel (sync hebdo)',
        docs: `${SITE_URL}/api/v1/docs`,
      },
      { status: 200, headers: CORS_HEADERS }
    )
  } catch (err) {
    // SLA-99.9 : fallback 200 vide pour ne pas casser les intégrations B2B.
    logger.error('v1/rge/search: error', err)
    captureError(err, { tags: { route: 'api/v1/rge/search', critical: 'true' } })
    return NextResponse.json(
      {
        results: [],
        count: 0,
        error: 'internal_error',
        message: 'Erreur temporaire, réessayez.',
        source: 'ADEME annuaire-entreprises RGE officiel (sync hebdo)',
        docs: `${SITE_URL}/api/v1/docs`,
      },
      { status: 200, headers: { ...CORS_HEADERS, 'Cache-Control': 'public, s-maxage=60' } }
    )
  }
}
