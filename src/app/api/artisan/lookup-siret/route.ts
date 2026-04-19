import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { checkRateLimit } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const querySchema = z.object({
  siret: z
    .string()
    .trim()
    .min(1, 'required')
    .transform((s) => s.replace(/\s+/g, '')),
})

type RgeQualificationRow = {
  code: string
  nom: string
  organisme: string
  domaine?: string | null
  meta_domaine?: string | null
  date_debut?: string | null
  date_fin?: string | null
  url?: string | null
}

type LookupSuccess = {
  success: true
  siret: string
  source: 'providers' | 'insee_fallback'
  businessName: string | null
  address: string | null
  postalCode: string | null
  city: string | null
  isActive: boolean
  rge: {
    hasQualifications: boolean
    qualifications: RgeQualificationRow[]
    validUntil: string | null
  }
  providerId?: string
  providerSlug?: string
  claimed: boolean
}

type LookupError = {
  success: false
  error: { code: string; message: string }
}

// Public endpoint returning PII (raison sociale, adresse, qualifs RGE).
// All responses must be marked as non-cacheable by CDNs and reverse-proxies.
const SECURITY_HEADERS: Record<string, string> = {
  'Cache-Control': 'private, no-store, max-age=0',
  Vary: 'Cookie',
}

function jsonResponse<T>(body: T, status: number): NextResponse<T> {
  return NextResponse.json<T>(body, { status, headers: SECURITY_HEADERS })
}

function validateSiretChecksum(siret: string): boolean {
  let sum = 0
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(siret[i], 10)
    if (i % 2 === 0) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

export async function GET(request: NextRequest) {
  // Rate limiting FIRST — runs before any validation so spammers don't
  // consume Zod/Supabase cycles. Public endpoint exposing PII → must be
  // throttled aggressively against scraping. 20 req/min/IP.
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  const rl = await checkRateLimit(`lookup-siret:${ip}`, { window: 60_000, max: 20 })
  if (!rl.allowed) {
    return jsonResponse<LookupError>(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Trop de requêtes. Réessayez dans une minute.',
        },
      },
      429
    )
  }

  const parsed = querySchema.safeParse({ siret: request.nextUrl.searchParams.get('siret') ?? '' })
  if (!parsed.success) {
    return jsonResponse<LookupError>(
      { success: false, error: { code: 'SIRET_REQUIRED', message: 'Le SIRET est requis.' } },
      400
    )
  }

  const { siret } = parsed.data

  if (!/^\d{14}$/.test(siret)) {
    return jsonResponse<LookupError>(
      {
        success: false,
        error: { code: 'SIRET_FORMAT', message: 'Le SIRET doit contenir exactement 14 chiffres.' },
      },
      400
    )
  }

  if (!validateSiretChecksum(siret)) {
    return jsonResponse<LookupError>(
      {
        success: false,
        error: {
          code: 'SIRET_CHECKSUM',
          message: 'Numéro SIRET invalide (échec du contrôle de cohérence).',
        },
      },
      400
    )
  }

  // 1. Primary source: local providers table (fed by ADEME sync).
  //    Covers ~60k SIRET uniques déjà qualifiés RGE.
  try {
    const supabase = createAdminClient()
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select(
        'id, slug, name, siret, address_city, address_region, postal_code, address_street, is_active, claimed_at, rge_qualifications, rge_valid_until'
      )
      .eq('siret', siret)
      .maybeSingle()

    if (providerError) {
      logger.warn('[lookup-siret] providers query failed — falling back to INSEE', {
        siret: siret.slice(0, 9) + '*****',
        error: providerError.message,
      })
    }

    if (provider) {
      const rawQualifs = Array.isArray(provider.rge_qualifications)
        ? (provider.rge_qualifications as RgeQualificationRow[])
        : []
      const activeQualifs = rawQualifs.filter((q) => {
        if (!q.date_fin) return true
        return new Date(q.date_fin) >= new Date()
      })

      const streetParts = [provider.address_street, provider.postal_code, provider.address_city]
        .filter(Boolean)
        .join(', ')

      return jsonResponse<LookupSuccess>(
        {
          success: true,
          siret,
          source: 'providers',
          businessName: provider.name ?? null,
          address: streetParts || null,
          postalCode: provider.postal_code ?? null,
          city: provider.address_city ?? null,
          isActive: provider.is_active !== false,
          rge: {
            hasQualifications: activeQualifs.length > 0,
            qualifications: activeQualifs,
            validUntil: provider.rge_valid_until ?? null,
          },
          providerId: provider.id,
          providerSlug: provider.slug,
          claimed: !!provider.claimed_at,
        },
        200
      )
    }
  } catch (err) {
    logger.error('[lookup-siret] unexpected error on providers lookup', {
      error: err instanceof Error ? err.message : 'unknown',
    })
  }

  // 2. Fallback: INSEE SIRENE API. Only if token configured — we don't fail the
  //    partner landing if INSEE is down; the user can still submit the SIRET
  //    manually and we'll enrich during the claim workflow.
  const apiToken = process.env.INSEE_API_TOKEN
  if (!apiToken) {
    return jsonResponse<LookupError>(
      {
        success: false,
        error: {
          code: 'NOT_IN_REGISTRY',
          message:
            "Ce SIRET n'est pas dans notre registre RGE. Vous pouvez continuer votre inscription, on le vérifiera manuellement.",
        },
      },
      404
    )
  }

  try {
    const response = await fetch(`https://api.insee.fr/entreprises/sirene/V3/siret/${siret}`, {
      headers: { Authorization: `Bearer ${apiToken}`, Accept: 'application/json' },
      cache: 'no-store',
    })

    if (response.status === 404) {
      return jsonResponse<LookupError>(
        {
          success: false,
          error: {
            code: 'SIRET_NOT_FOUND',
            message: 'Aucun établissement trouvé pour ce SIRET au registre SIRENE.',
          },
        },
        404
      )
    }

    if (!response.ok) {
      throw new Error(`INSEE API ${response.status}`)
    }

    const payload = (await response.json()) as {
      etablissement?: {
        siret: string
        uniteLegale: { denominationUniteLegale?: string }
        adresseEtablissement: {
          numeroVoieEtablissement?: string
          typeVoieEtablissement?: string
          libelleVoieEtablissement?: string
          codePostalEtablissement?: string
          libelleCommuneEtablissement?: string
        }
        periodesEtablissement?: Array<{ etatAdministratifEtablissement?: string }>
      }
    }

    const etab = payload.etablissement
    if (!etab) {
      return jsonResponse<LookupError>(
        {
          success: false,
          error: { code: 'SIRET_NOT_FOUND', message: 'Établissement introuvable.' },
        },
        404
      )
    }

    const address = [
      etab.adresseEtablissement.numeroVoieEtablissement,
      etab.adresseEtablissement.typeVoieEtablissement,
      etab.adresseEtablissement.libelleVoieEtablissement,
    ]
      .filter(Boolean)
      .join(' ')
      .trim()

    const isActive = etab.periodesEtablissement?.[0]?.etatAdministratifEtablissement === 'A'

    return jsonResponse<LookupSuccess>(
      {
        success: true,
        siret: etab.siret,
        source: 'insee_fallback',
        businessName: etab.uniteLegale.denominationUniteLegale ?? null,
        address: address || null,
        postalCode: etab.adresseEtablissement.codePostalEtablissement ?? null,
        city: etab.adresseEtablissement.libelleCommuneEtablissement ?? null,
        isActive,
        rge: { hasQualifications: false, qualifications: [], validUntil: null },
        claimed: false,
      },
      200
    )
  } catch (err) {
    logger.error('[lookup-siret] INSEE fallback failed', {
      error: err instanceof Error ? err.message : 'unknown',
    })
    return jsonResponse<LookupError>(
      {
        success: false,
        error: {
          code: 'LOOKUP_UNAVAILABLE',
          message:
            'Service de vérification SIRET momentanément indisponible. Vous pouvez continuer et on vérifiera manuellement.',
        },
      },
      503
    )
  }
}
