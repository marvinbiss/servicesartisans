import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SITE_URL } from '@/lib/seo/config'

// Data ADEME rafraîchie hebdo → cache CDN 24h + stale-while-revalidate 7j.
// Public lookup API — open CORS by design.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

type RgeQualif = {
  code?: string | null
  nom?: string | null
  libelle?: string | null
  organisme?: string | null
  date_debut?: string | null
  date_fin?: string | null
}

/**
 * GET /api/v1/rge/lookup?siret=83001931100026
 * GET /api/v1/rge/lookup?siren=830019311
 *
 * Retourne le statut RGE officiel d'une entreprise (source ADEME, sync hebdo).
 * Payload stable versionné — contrat vis-à-vis des consommateurs API externes.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const siret = (searchParams.get('siret') || '').replace(/\s+/g, '')
  const siren = (searchParams.get('siren') || '').replace(/\s+/g, '')

  if (!siret && !siren) {
    return NextResponse.json(
      {
        error: 'missing_identifier',
        message: 'Fournir ?siret=14chiffres ou ?siren=9chiffres',
        docs: `${SITE_URL}/api/v1/docs`,
      },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  if (siret && !/^\d{14}$/.test(siret)) {
    return NextResponse.json(
      {
        error: 'invalid_siret',
        message: 'Le SIRET doit contenir exactement 14 chiffres',
        docs: `${SITE_URL}/api/v1/docs`,
      },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  if (siren && !/^\d{9}$/.test(siren)) {
    return NextResponse.json(
      {
        error: 'invalid_siren',
        message: 'Le SIREN doit contenir exactement 9 chiffres',
        docs: `${SITE_URL}/api/v1/docs`,
      },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  try {
    const supabase = createAdminClient()
    // Priority: exact SIRET match. Fallback: SIREN prefix if SIRET provided → siege établissement.
    const lookupValue = siret || siren
    const lookupField = siret ? 'siret' : 'siren'

    const { data: rows, error } = await supabase
      .from('providers')
      .select(
        'id,siret,siren,name,address_city,address_postal_code,specialty,rge_qualifications,rge_valid_until,rge_organismes,slug,stable_id,updated_at'
      )
      .eq(lookupField, lookupValue)
      .eq('is_active', true)
      .limit(1)

    if (error) {
      return NextResponse.json(
        { error: 'lookup_failed', message: error.message },
        { status: 500, headers: CORS_HEADERS }
      )
    }

    const row = (rows ?? [])[0]
    if (!row) {
      return NextResponse.json(
        {
          identifier: lookupValue,
          identifier_type: lookupField,
          found: false,
          rge_status: 'not_found',
          source: 'ADEME annuaire-entreprises RGE officiel (sync hebdo)',
          docs: `${SITE_URL}/api/v1/docs`,
        },
        { status: 200, headers: CORS_HEADERS }
      )
    }

    const quals = Array.isArray(row.rge_qualifications)
      ? (row.rge_qualifications as RgeQualif[])
      : []

    const today = new Date().toISOString().slice(0, 10)
    const validUntil = row.rge_valid_until ?? null
    const rgeStatus: 'rge_active' | 'rge_expired' | 'not_rge' =
      quals.length === 0
        ? 'not_rge'
        : validUntil && validUntil >= today
          ? 'rge_active'
          : 'rge_expired'

    return NextResponse.json(
      {
        identifier: lookupValue,
        identifier_type: lookupField,
        found: true,
        siret: row.siret,
        siren: row.siren,
        name: row.name,
        address_city: row.address_city,
        address_postal_code: row.address_postal_code,
        specialty: row.specialty,
        rge_status: rgeStatus,
        rge_valid_until: validUntil,
        rge_organismes: row.rge_organismes ?? [],
        rge_qualifications: quals.map((q) => ({
          code: q.code ?? null,
          nom: q.nom ?? q.libelle ?? null,
          organisme: q.organisme ?? null,
          date_debut: q.date_debut ?? null,
          date_fin: q.date_fin ?? null,
        })),
        public_url: row.stable_id
          ? `${SITE_URL}/services/${row.specialty || 'artisan'}/${row.address_city
              ?.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')}/${row.stable_id}`
          : null,
        last_update: row.updated_at,
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
