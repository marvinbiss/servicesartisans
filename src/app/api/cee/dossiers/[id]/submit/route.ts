/**
 * POST /api/cee/dossiers/[id]/submit
 *
 * Transition draft → submitted_by_artisan.
 * Déclenche l'entrée dans la QA queue (côté ops SA Energy).
 *
 * Sécurité :
 *   - validateOrigin() CSRF
 *   - Rate-limit 3 req/min par user_id
 *   - Ownership check via partner_id → user_id = auth.uid()
 *   - Transition via assertDossierTransition() (pas de bypass possible)
 *   - Zéro PII dans les logs
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/cee/csrf'
import { checkRateLimit } from '@/lib/cee/rate-limit'
import { assertDossierTransition } from '@/lib/cee/dossier-transitions'
import type { CeeDossierV3Status } from '@/lib/cee/dossier-transitions'
import {
  requireArtisanAuth,
  csrfRejectResponse,
  rateLimitedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/cee/route-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

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

export async function POST(request: NextRequest, context: RouteContext) {
  if (!validateOrigin(request)) return csrfRejectResponse()

  const id = await resolveId(context)
  if (!id) return notFoundResponse('Dossier introuvable')

  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response
  const { ctx } = auth

  // Rate-limit: 3 req/min (plus restrictif que la création)
  const rl = checkRateLimit(`cee:dossiers:submit:${ctx.userId}`, {
    max: 3,
    windowMs: 60_000,
  })
  if (!rl.allowed) return rateLimitedResponse(rl.resetMs)

  try {
    // Fetch dossier + ownership
    const { data: dossier, error: fetchError } = await ctx.supabase
      .from('cee_dossiers')
      .select('id, partner_id, status')
      .eq('id', id)
      .maybeSingle()

    if (fetchError || !dossier) {
      return notFoundResponse('Dossier introuvable')
    }

    // Ownership check
    const { data: ownerCheck } = await ctx.supabase
      .from('cee_artisan_partners')
      .select('id')
      .eq('id', (dossier as { partner_id: string }).partner_id)
      .eq('user_id', ctx.userId)
      .maybeSingle()

    if (!ownerCheck) {
      return notFoundResponse('Dossier introuvable')
    }

    const currentStatus = (dossier as { status: string }).status as CeeDossierV3Status

    // Assert transition is legal (throws on illegal)
    try {
      assertDossierTransition(currentStatus, 'submitted_by_artisan')
    } catch (transErr) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ILLEGAL_TRANSITION',
            message:
              transErr instanceof Error
                ? transErr.message
                : `Transition ${currentStatus} → submitted_by_artisan non autorisée`,
          },
        },
        { status: 422 }
      )
    }

    // Use admin client for status update (RLS insert policy requires active partner,
    // but UPDATE transitions are controlled by this app-level gate + SQL trigger)
    const admin = createAdminClient()

    const { data: updated, error: updateError } = await admin
      .from('cee_dossiers')
      .update({ status: 'submitted_by_artisan' })
      .eq('id', id)
      .select('id, reference, status, updated_at')
      .single()

    if (updateError || !updated) {
      logger.error('cee-dossier-submit: update failed', updateError, {
        action: 'cee-dossier-submit',
        dossier_id: id,
      })
      return serverErrorResponse('UPDATE_FAILED', 'Soumission impossible')
    }

    // Append audit event (fail-open — ne bloque pas la réponse)
    admin
      .from('cee_dossier_events')
      .insert({
        dossier_id: id,
        event_type: 'status_change',
        actor_id: ctx.userId,
        actor_role: 'artisan',
        payload: {
          from: currentStatus,
          to: 'submitted_by_artisan',
        },
      })
      .then(({ error }) => {
        if (error) {
          logger.warn('cee-dossier-submit: event insert failed (fail-open)', {
            action: 'cee-dossier-submit-event',
            dossier_id: id,
            error: error.message,
          })
        }
      })

    logger.info('cee-dossier-submit: submitted', {
      action: 'cee-dossier-submitted',
      dossier_id: id,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    logger.error('cee-dossier-submit: unhandled error', error, {
      action: 'cee-dossier-submit-catch',
      dossier_id: id,
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
