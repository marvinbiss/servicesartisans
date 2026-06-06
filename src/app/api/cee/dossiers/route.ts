/**
 * GET  /api/cee/dossiers — liste les dossiers de l'artisan courant
 * POST /api/cee/dossiers — crée un dossier draft (avec business gates)
 *
 * Sécurité (THREAT_MODEL_PR2) :
 *   - validateOrigin() sur POST (CSRF)
 *   - Rate-limit 10 req/min par user_id sur POST
 *   - RLS via createClient() (user_id = auth.uid())
 *   - Le client envoie des données déclaratives en clair
 *     (DossierClientInputSchema) ; tout ce qui fait autorité est résolu
 *     serveur : partner/provider (user_id auth), zone climatique
 *     (zones_climatiques_ref), forfait + prime (cee_forfaits via bareme.ts),
 *     commission (commission_rate_effective), chiffrement PII (pii-crypto) et
 *     email hash. Fail-closed si CEE_PII_KEY absente.
 *   - Zéro PII dans les logs
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/cee/csrf'
import { checkRateLimit } from '@/lib/cee/rate-limit'
import { createDossier, hashEmailForDossier } from '@/lib/cee/dossier-creation'
import type { CreateDossierInput } from '@/lib/cee/dossier-creation'
import { DossierClientInputSchema } from '@/lib/cee/dossier-client-schema'
import { lookupForfaitSnapshot } from '@/lib/cee/bareme'
import { encryptPiiToB64, isPiiCryptoConfigured } from '@/lib/cee/pii-crypto'
import {
  requireArtisanAuth,
  csrfRejectResponse,
  rateLimitedResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/cee/route-helpers'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ---------------------------------------------------------------------------
// GET /api/cee/dossiers — liste dossiers artisan (RLS via user_id)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response
  const { ctx } = auth

  try {
    // Resolve partner for this user (RLS via createClient)
    const { data: partner, error: partnerError } = await ctx.supabase
      .from('cee_artisan_partners')
      .select('id')
      .eq('user_id', ctx.userId)
      .maybeSingle()

    if (partnerError) {
      logger.error('cee-dossiers-list: partner lookup error', partnerError, {
        action: 'cee-dossiers-list',
      })
      return serverErrorResponse('READ_FAILED', 'Erreur serveur')
    }

    if (!partner) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Parse optional query params
    const url = new URL(request.url)
    const statusFilter = url.searchParams.get('status')
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10)), 100) : 50

    let query = ctx.supabase
      .from('cee_dossiers')
      .select(
        'id, reference, operation_code, status, client_code_postal, client_commune_insee, ' +
          'montant_ht_cts, prime_cee_cts, commission_rate, commission_amount_cts, ' +
          'date_devis, date_chantier_prevue, date_chantier_realisee, ' +
          'qa_score, delegataire, pncee_reference, created_at, updated_at'
      )
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    const { data: dossiers, error: listError } = await query

    if (listError) {
      logger.warn('cee-dossiers-list: DB error (fail-open)', {
        action: 'cee-dossiers-list-db',
        error: listError.message,
      })
      return NextResponse.json({ success: true, data: [] })
    }

    return NextResponse.json({ success: true, data: dossiers ?? [] })
  } catch (error) {
    logger.error('cee-dossiers-list: unhandled error', error, {
      action: 'cee-dossiers-list-catch',
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}

// ---------------------------------------------------------------------------
// POST /api/cee/dossiers — crée dossier draft
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // CSRF check
  if (!validateOrigin(request)) return csrfRejectResponse()

  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response
  const { ctx } = auth

  // Rate limit: 10 req/min
  const rl = checkRateLimit(`cee:dossiers:create:${ctx.userId}`, {
    max: 10,
    windowMs: 60_000,
  })
  if (!rl.allowed) return rateLimitedResponse(rl.resetMs)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequestResponse('INVALID_BODY', 'Corps de requête JSON invalide')
  }

  const parsed = DossierClientInputSchema.safeParse(body)
  if (!parsed.success) {
    return badRequestResponse(
      'VALIDATION_ERROR',
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    )
  }
  const input = parsed.data

  // Fail-closed : sans clé de chiffrement, aucune PII ne doit être écrite.
  if (!isPiiCryptoConfigured()) {
    logger.error('cee-dossiers-create: CEE_PII_KEY missing — write path refused', undefined, {
      action: 'cee-dossiers-create-pii-key',
    })
    return serverErrorResponse('PII_CRYPTO_NOT_CONFIGURED', 'Service momentanément indisponible')
  }

  // Résolution partner côté serveur (jamais depuis le payload client)
  const { data: partner, error: partnerError } = await ctx.supabase
    .from('cee_artisan_partners')
    .select('id, provider_id, commission_rate_effective')
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (partnerError) {
    logger.error('cee-dossiers-create: partner lookup error', partnerError, {
      action: 'cee-dossiers-create-partner',
    })
    return serverErrorResponse('PARTNER_LOOKUP_FAILED', 'Erreur serveur')
  }

  if (!partner) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PARTNER_NOT_FOUND',
          message: 'Aucun partenariat CEE actif pour ce compte. Complétez votre onboarding.',
        },
      },
      { status: 404 }
    )
  }

  // Zone climatique depuis la commune INSEE (FK cee_dossiers — fail-closed)
  const { data: zoneRow, error: zoneError } = await ctx.supabase
    .from('zones_climatiques_ref')
    .select('code_insee, zone')
    .eq('code_insee', input.client.commune_insee)
    .maybeSingle()

  if (zoneError) {
    logger.error('cee-dossiers-create: zone lookup error', zoneError, {
      action: 'cee-dossiers-create-zone',
    })
    return serverErrorResponse('ZONE_LOOKUP_FAILED', 'Erreur serveur')
  }

  if (!zoneRow) {
    return badRequestResponse(
      'COMMUNE_INCONNUE',
      'Commune introuvable dans le référentiel — vérifiez le code postal et la commune.'
    )
  }

  // Snapshot barème côté serveur (le client n'influence jamais la prime)
  const forfait = await lookupForfaitSnapshot(ctx.supabase, {
    operationCode: input.operation_code,
    zone: (zoneRow as { zone: string }).zone,
    revenusCategorie: input.revenus_categorie,
    surfaceM2: input.surface_m2 ?? null,
  })

  if (!forfait.ok) {
    if (forfait.error === 'SURFACE_REQUIRED') {
      return badRequestResponse(
        'SURFACE_REQUIRED',
        'La surface est obligatoire pour cette opération d’isolation.'
      )
    }
    if (forfait.error === 'BAREME_NOT_FOUND') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BAREME_NOT_FOUND',
            message: 'Aucun barème en vigueur pour cette opération — contactez SA Energy.',
          },
        },
        { status: 422 }
      )
    }
    return serverErrorResponse('BAREME_LOOKUP_FAILED', 'Erreur serveur')
  }

  const partnerRow = partner as {
    id: string
    provider_id: string
    commission_rate_effective: number | string | null
  }

  const dossierInput: CreateDossierInput = {
    partner_id: partnerRow.id,
    provider_id: partnerRow.provider_id,
    client_nom_b64: encryptPiiToB64(input.client.nom),
    client_prenom_b64: encryptPiiToB64(input.client.prenom),
    client_email_b64: encryptPiiToB64(input.client.email),
    client_email_hash: hashEmailForDossier(input.client.email),
    client_telephone_b64: input.client.telephone ? encryptPiiToB64(input.client.telephone) : null,
    client_adresse_b64: encryptPiiToB64(input.client.adresse),
    client_code_postal: input.client.code_postal,
    client_commune_insee: input.client.commune_insee,
    foyer_personnes: input.foyer_personnes,
    revenus_categorie: input.revenus_categorie,
    rfr_declared_cts: null,
    operation_code: input.operation_code,
    type_travaux: input.type_travaux,
    surface_m2: input.surface_m2 ?? null,
    annee_construction: input.annee_construction ?? null,
    energie_remplacee: input.energie_remplacee ?? null,
    montant_ht_cts: Math.round(input.montant_ht_eur * 100),
    montant_ttc_cts: Math.round(input.montant_ttc_eur * 100),
    date_devis: input.date_devis,
    date_chantier_prevue: input.date_chantier_prevue ?? null,
    forfait_id: forfait.snapshot.forfait_id,
    forfait_version: forfait.snapshot.forfait_version,
    prime_cee_cts: forfait.snapshot.prime_cee_cts,
    prime_mpr_cts: null,
    commission_rate: Number(partnerRow.commission_rate_effective ?? 10),
  }

  const result = await createDossier(ctx.supabase, dossierInput)

  if (!result.ok) {
    const statusMap: Record<string, number> = {
      PARTNER_NOT_FOUND: 404,
      PARTNER_NOT_ACTIVE: 403,
      CONVENTION_NOT_SIGNED: 403,
      NOT_CERTIFIED: 403,
      RGE_EXPIRED: 422,
      OPERATION_NOT_ALLOWED: 422,
      VALIDATION_ERROR: 400,
      DB_ERROR: 500,
    }
    const httpStatus = statusMap[result.error] ?? 500
    return NextResponse.json(
      { success: false, error: { code: result.error, message: result.detail ?? result.error } },
      { status: httpStatus }
    )
  }

  const httpStatus = result.status === 'existing' ? 200 : 201
  return NextResponse.json(
    {
      success: true,
      data: result.dossier,
      meta: { created: result.status === 'draft' },
    },
    { status: httpStatus }
  )
}
