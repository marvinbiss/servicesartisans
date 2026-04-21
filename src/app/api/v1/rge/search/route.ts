import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SITE_URL } from '@/lib/seo/config'
import { sanitizeQualificationCode } from '@/lib/rge/sanitize'

// Data ADEME rafraîchie hebdo → on peut cacher agressivement côté CDN Vercel
// (24h fresh + 7j stale-while-revalidate). Protège la DB des scrapers.
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

  try {
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

    const { data, count, error } = await query
      .order('rge_valid_until', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'search_failed', message: error.message },
        { status: 500, headers: CORS_HEADERS }
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
    return NextResponse.json(
      { error: 'internal_error', message: (err as Error).message.slice(0, 200) },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
