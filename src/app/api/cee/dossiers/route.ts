/**
 * GET  /api/cee/dossiers — liste les dossiers de l'artisan courant
 * POST /api/cee/dossiers — crée un dossier draft (avec business gates)
 *
 * Sécurité (THREAT_MODEL_PR2) :
 *   - validateOrigin() sur POST (CSRF)
 *   - Rate-limit 10 req/min par user_id sur POST
 *   - RLS via createClient() (user_id = auth.uid())
 *   - Ownership via partner_id filtré sur user_id côté requête
 *   - Zéro PII dans les logs
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/cee/csrf'
import { checkRateLimit } from '@/lib/cee/rate-limit'
import { createDossier, CreateDossierInputSchema } from '@/lib/cee/dossier-creation'
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

  const parsed = CreateDossierInputSchema.safeParse(body)
  if (!parsed.success) {
    return badRequestResponse(
      'VALIDATION_ERROR',
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    )
  }

  // Verify partner belongs to authenticated user (ownership check before gate)
  const { data: partnerCheck } = await ctx.supabase
    .from('cee_artisan_partners')
    .select('id')
    .eq('id', parsed.data.partner_id)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (!partnerCheck) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Accès non autorisé à ce partenaire' },
      },
      { status: 403 }
    )
  }

  const result = await createDossier(ctx.supabase, parsed.data)

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
