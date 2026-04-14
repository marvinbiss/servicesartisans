/**
 * GET   /api/cee/dossiers/[id] — détail dossier (ownership check)
 * PATCH /api/cee/dossiers/[id] — update champs autorisés en draft (pas de transition)
 *
 * Sécurité :
 *   - Auth obligatoire (401)
 *   - Ownership via partner_id → user_id = auth.uid() (403 / 404 masqué)
 *   - PATCH : validateOrigin() CSRF + champs patchables restreints
 *   - Zéro PII dans les logs
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateOrigin } from '@/lib/cee/csrf'
import { artisanCanEdit } from '@/lib/cee/dossier-transitions'
import {
  requireArtisanAuth,
  csrfRejectResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/cee/route-helpers'
import { logger } from '@/lib/logger'
import type { CeeDossierV3Status } from '@/lib/cee/dossier-transitions'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ id: string }> | { id: string }
}

async function resolveId(ctx: RouteContext): Promise<string> {
  const p = ctx.params
  const resolved = p instanceof Promise ? await p : p
  return resolved.id
}

const DOSSIER_DETAIL_SELECT = [
  'id', 'reference', 'partner_id', 'provider_id',
  'client_email_hash', 'client_code_postal', 'client_commune_insee',
  'foyer_personnes', 'revenus_categorie', 'rfr_declared_cts',
  'operation_code', 'type_travaux', 'surface_m2', 'annee_construction', 'energie_remplacee',
  'montant_ht_cts', 'montant_ttc_cts', 'prime_total_cts', 'reste_a_charge_cts',
  'date_devis', 'date_chantier_prevue', 'date_chantier_realisee',
  'forfait_id', 'forfait_version', 'prime_cee_cts', 'prime_mpr_cts',
  'commission_rate', 'commission_amount_cts', 'commission_status',
  'status', 'qa_score', 'qa_reviewed_at', 'qa_notes',
  'delegataire', 'delegataire_reference', 'pncee_reference',
  'delegataire_response_status', 'delegataire_response_motif',
  'created_at', 'updated_at', 'expires_at',
].join(',')

// Fields the artisan is allowed to patch (draft or qa_rejected only)
const PatchableFieldsSchema = z.object({
  type_travaux: z.string().min(1).max(200).optional(),
  surface_m2: z.number().positive().nullish(),
  annee_construction: z.number().int().min(1800).max(2100).nullish(),
  energie_remplacee: z.string().max(50).nullish(),
  date_chantier_prevue: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
    .nullish(),
  foyer_personnes: z.number().int().min(1).max(12).optional(),
  revenus_categorie: z.enum(['tres_modeste', 'modeste', 'intermediaire', 'superieur']).optional(),
  rfr_declared_cts: z.number().int().nonnegative().nullish(),
}).strict()

// ---------------------------------------------------------------------------
// GET /api/cee/dossiers/[id]
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest, context: RouteContext) {
  const id = await resolveId(context)
  if (!id) return notFoundResponse('Dossier introuvable')

  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response
  const { ctx } = auth

  try {
    // Fetch with ownership check via RLS + explicit partner filter
    const { data: dossier, error } = await ctx.supabase
      .from('cee_dossiers')
      .select(DOSSIER_DETAIL_SELECT)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      logger.error('cee-dossier-get: DB error', error, {
        action: 'cee-dossier-get',
        dossier_id: id,
      })
      return serverErrorResponse('READ_FAILED', 'Erreur serveur')
    }

    if (!dossier) {
      return notFoundResponse('Dossier introuvable')
    }

    // Explicit ownership verification (defense in depth beyond RLS)
    const { data: ownerCheck } = await ctx.supabase
      .from('cee_artisan_partners')
      .select('id')
      .eq('id', (dossier as unknown as { partner_id: string }).partner_id)
      .eq('user_id', ctx.userId)
      .maybeSingle()

    if (!ownerCheck) {
      return notFoundResponse('Dossier introuvable')
    }

    return NextResponse.json({ success: true, data: dossier })
  } catch (error) {
    logger.error('cee-dossier-get: unhandled error', error, {
      action: 'cee-dossier-get-catch',
      dossier_id: id,
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/cee/dossiers/[id]
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!validateOrigin(request)) return csrfRejectResponse()

  const id = await resolveId(context)
  if (!id) return notFoundResponse('Dossier introuvable')

  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response
  const { ctx } = auth

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequestResponse('INVALID_BODY', 'Corps de requête JSON invalide')
  }

  const parsed = PatchableFieldsSchema.safeParse(body)
  if (!parsed.success) {
    return badRequestResponse(
      'VALIDATION_ERROR',
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    )
  }

  if (Object.keys(parsed.data).length === 0) {
    return badRequestResponse('EMPTY_PATCH', 'Aucun champ à mettre à jour')
  }

  try {
    // Fetch current dossier (RLS guarantees artisan sees own)
    const { data: current, error: fetchError } = await ctx.supabase
      .from('cee_dossiers')
      .select('id, partner_id, status')
      .eq('id', id)
      .maybeSingle()

    if (fetchError || !current) {
      return notFoundResponse('Dossier introuvable')
    }

    // Ownership check
    const { data: ownerCheck } = await ctx.supabase
      .from('cee_artisan_partners')
      .select('id')
      .eq('id', (current as { partner_id: string }).partner_id)
      .eq('user_id', ctx.userId)
      .maybeSingle()

    if (!ownerCheck) {
      return notFoundResponse('Dossier introuvable')
    }

    // Status gate: only editable in draft / qa_rejected
    const currentStatus = (current as { status: string }).status as CeeDossierV3Status
    if (!artisanCanEdit(currentStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STATUS_LOCKED',
            message: `Impossible de modifier un dossier en statut '${currentStatus}'`,
          },
        },
        { status: 422 }
      )
    }

    const { data: updated, error: updateError } = await ctx.supabase
      .from('cee_dossiers')
      .update(parsed.data)
      .eq('id', id)
      .select(DOSSIER_DETAIL_SELECT)
      .single()

    if (updateError || !updated) {
      logger.error('cee-dossier-patch: update failed', updateError, {
        action: 'cee-dossier-patch',
        dossier_id: id,
      })
      return serverErrorResponse('UPDATE_FAILED', 'Mise à jour impossible')
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    logger.error('cee-dossier-patch: unhandled error', error, {
      action: 'cee-dossier-patch-catch',
      dossier_id: id,
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
