/**
 * POST /api/artisan/leads/:id/action — Lead actions for authenticated artisan
 * Actions: view, quote, decline
 *
 * RLS note: lead_assignments has policy "lead_assignments_provider_update" (migration 103)
 * allowing artisans to UPDATE their own assignments. The authenticated `supabase` client
 * is therefore used for mutations instead of adminClient, which would bypass RLS.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { isValidUUID } from '@/lib/validation/uuid'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import {
  getProviderForUser,
  getAssignmentForAction,
  updateAssignmentStatus,
  getExistingQuote,
  insertQuote,
  logLeadEvent,
} from '@/lib/services/leads-service'
import { dispatchLead } from '@/app/actions/dispatch'

export const dynamic = 'force-dynamic'

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('view') }),
  z.object({
    action: z.literal('quote'),
    amount: z.number().positive(),
    description: z.string().max(2000).optional(),
    validDays: z.number().int().positive().optional(),
  }),
  z.object({
    action: z.literal('decline'),
    reason: z.string().max(500).optional(),
  }),
])

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const rawBody = await request.json()
    const result = actionSchema.safeParse(rawBody)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Action invalide. Valeurs: view, quote, decline',
            details: result.error.flatten(),
          },
        },
        { status: 400 }
      )
    }
    const body = result.data

    const provider = await getProviderForUser(supabase, user.id)

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Aucun profil artisan' } },
        { status: 403 }
      )
    }

    // Verify assignment exists and belongs to this provider.
    // adminClient used for SELECT only (read across RLS boundary is harmless here;
    // the provider_id check ensures the artisan only sees their own record).
    const adminClient = createAdminClient()
    const assignment = await getAssignmentForAction(adminClient, id, provider.id)

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: { message: 'Lead non trouvé' } },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()

    if (body.action === 'view') {
      // Bug 2 fix: only advance to 'viewed' from 'pending'.
      // Any other status (quoted, declined, viewed) must not be downgraded.
      if (!['pending'].includes(assignment.status)) {
        // Just log the view event without mutating the status.
        await logLeadEvent(assignment.lead_id, 'viewed', {
          providerId: provider.id,
          actorId: user.id,
        })
        return NextResponse.json({ success: true, action: body.action })
      }

      // Bug 1 fix: use authenticated supabase client (RLS policy "lead_assignments_provider_update"
      // from migration 103 allows the artisan to UPDATE their own assignments).
      await updateAssignmentStatus(supabase, id, provider.id, { status: 'viewed', viewed_at: now })

      await logLeadEvent(assignment.lead_id, 'viewed', {
        providerId: provider.id,
        actorId: user.id,
      })
    } else if (body.action === 'quote') {
      const { amount, description: quoteDesc, validDays } = body

      // Check for duplicate quote (409 Conflict)
      const existingQuote = await getExistingQuote(adminClient, assignment.lead_id, provider.id)

      if (existingQuote) {
        return NextResponse.json(
          { success: false, error: { message: 'Un devis existe déjà pour ce lead' } },
          { status: 409 }
        )
      }

      // validDays is validated as positive integer by Zod; default 30
      const days = validDays ?? 30
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + days)

      // Bug 3 fix: UPDATE lead_assignment FIRST, then INSERT quote.
      // If the UPDATE fails we bail out before creating an orphan quote row.
      // If the INSERT fails after the UPDATE, we roll back the status to 'viewed'
      // (the most recent prior state for a quoted action) to keep a consistent state.

      // Step 1: UPDATE assignment status -> 'quoted'
      await updateAssignmentStatus(supabase, id, provider.id, { status: 'quoted' })

      // Step 2: INSERT quote — if this fails, roll back assignment status
      try {
        await insertQuote(supabase, {
          requestId: assignment.lead_id,
          providerId: provider.id,
          amount,
          description: quoteDesc || '',
          validUntil: validUntil.toISOString().split('T')[0],
        })
      } catch {
        // Rollback: restore previous status
        await updateAssignmentStatus(supabase, id, provider.id, { status: assignment.status })
        return NextResponse.json(
          { success: false, error: { message: 'Erreur lors de la création du devis' } },
          { status: 500 }
        )
      }

      await logLeadEvent(assignment.lead_id, 'quoted', {
        providerId: provider.id,
        actorId: user.id,
        metadata: { amount, validDays: days },
      })
    } else if (body.action === 'decline') {
      const { reason } = body

      // Bug 1 fix: use authenticated supabase client for mutation
      await updateAssignmentStatus(supabase, id, provider.id, { status: 'declined' })

      await logLeadEvent(assignment.lead_id, 'declined', {
        providerId: provider.id,
        actorId: user.id,
        metadata: { reason: reason || '' },
      })

      // Audit 2026-04-25 (agent #5 BLOCKER) : auparavant le decline laissait
      // le lead orphelin — l'index UNIQUE le libérait, mais aucun cron ne
      // ré-appelait `dispatch_lead`. Avec ~0 artisans qui acceptent
      // aujourd'hui, chaque decline = lead mort. On déclenche un re-dispatch
      // immédiat (fire-and-forget : on ne bloque pas la réponse user). Le
      // cron `lead-reassign` est le filet pour les declines silencieusement
      // ratés.
      void dispatchLead(assignment.lead_id).catch((err) => {
        logger.error('Re-dispatch on decline failed', err as Error, {
          leadId: assignment.lead_id,
          excludedProvider: provider.id,
        })
      })
    }

    return NextResponse.json({ success: true, action: body.action })
  } catch (error) {
    logger.error('Lead action POST error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
