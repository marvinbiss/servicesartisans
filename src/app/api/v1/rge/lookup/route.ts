import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { SITE_URL } from '@/lib/seo/config'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { withTimeout } from '@/lib/api/timeout'

// Data ADEME rafraîchie hebdo → cache CDN 24h + stale-while-revalidate 7j.
// Public lookup API — open CORS by design.
export const dynamic = 'force-dynamic'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
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
 *
 * SLA-99.9 (2026-05-06) : RL 600/min/IP fail-open, timeout amont 5s, fallback
 * 200 vide pour ne pas casser l'embed des consommateurs API tiers (widgets,
 * dashboards CRM, CMS partenaires).
 */
export async function GET(request: NextRequest) {
  // SLA-99.9 : RL public API 600/min/IP fail-open.
  try {
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`v1-rge-lookup:${ip}`, {
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

    const supabase = createAdminClient()
    // Priority: exact SIRET match. Fallback: SIREN prefix if SIRET provided → siege établissement.
    const lookupValue = siret || siren
    const lookupField = siret ? 'siret' : 'siren'

    // SLA-99.9 : timeout amont 5s. Au-delà, fallback `not_found` cacheable
    // au lieu d'un 5xx qui casserait l'intégration partenaire.
    const { data: rows, error } = await withTimeout(
      supabase
        .from('providers')
        .select(
          'id,siret,siren,name,address_city,address_postal_code,specialty,rge_qualifications,rge_valid_until,rge_organismes,slug,stable_id,updated_at'
        )
        .eq(lookupField, lookupValue)
        .eq('is_active', true)
        .eq('noindex', false)
        .limit(1),
      5_000,
      'v1_rge_lookup'
    )

    if (error) {
      logger.error('v1/rge/lookup: supabase error', error)
      captureError(error, { tags: { route: 'api/v1/rge/lookup', critical: 'true' } })
      return NextResponse.json(
        {
          identifier: lookupValue,
          identifier_type: lookupField,
          found: false,
          rge_status: 'not_found',
          source: 'ADEME annuaire-entreprises RGE officiel (sync hebdo)',
          docs: `${SITE_URL}/api/v1/docs`,
        },
        { status: 200, headers: { ...CORS_HEADERS, 'Cache-Control': 'public, s-maxage=60' } }
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
              .replace(/[̀-ͯ]/g, '')
              .replace(/[^a-z0-9]+/g, '-')}/${row.stable_id}`
          : null,
        last_update: row.updated_at,
        source: 'ADEME annuaire-entreprises RGE officiel (sync hebdo)',
        docs: `${SITE_URL}/api/v1/docs`,
      },
      { status: 200, headers: CORS_HEADERS }
    )
  } catch (err) {
    // SLA-99.9 : fallback `not_found` 200 — l'intégration partenaire ne casse
    // pas, et le caller peut retry plus tard.
    logger.error('v1/rge/lookup: error', err)
    captureError(err, { tags: { route: 'api/v1/rge/lookup', critical: 'true' } })
    return NextResponse.json(
      {
        found: false,
        rge_status: 'not_found',
        source: 'ADEME annuaire-entreprises RGE officiel (sync hebdo)',
        docs: `${SITE_URL}/api/v1/docs`,
      },
      { status: 200, headers: { ...CORS_HEADERS, 'Cache-Control': 'public, s-maxage=60' } }
    )
  }
}
