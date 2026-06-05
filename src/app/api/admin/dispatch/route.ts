/**
 * Admin Dispatch API
 * GET: Dispatch monitoring (queue status, recent assignments)
 * POST: Dispatch actions (reassign, replay)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { dispatchLead } from '@/app/actions/dispatch'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'
import { z } from 'zod'
import {
  getDispatchAssignments,
  getDispatchStats,
  getAssignmentById,
  getLeadSummary,
  reassignAssignment,
  deleteAssignment,
  logLeadEvent,
} from '@/lib/services/leads-service'
import { sendLeadAlert } from '@/lib/services/notifications-service'

const actionBodySchema = z.object({
  action: z.enum(['reassign', 'replay']),
  assignmentId: z.string().uuid(),
  newProviderId: z.string().uuid().optional(),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Verify admin with services:read permission
  const auth = await requirePermission('services', 'read')

  if (!auth.success || !auth.admin) return auth.error

  try {
    const supabase = createAdminClient()
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = 20

    const [assignments, stats] = await Promise.all([
      getDispatchAssignments(supabase, { page, limit }),
      getDispatchStats(supabase),
    ])

    return NextResponse.json({
      assignments,
      stats,
      page,
      pageSize: limit,
    })
  } catch (error) {
    logger.error('Dispatch GET error', error)
    return NextResponse.json({
      assignments: [],
      stats: { pending: 0, viewed: 0, quoted: 0, total: 0 },
      page: 1,
      pageSize: 20,
    })
  }
}

export async function POST(request: NextRequest) {
  // Verify admin with services:write permission
  const auth = await requirePermission('services', 'write')

  if (!auth.success || !auth.admin) return auth.error

  try {
    const body = await request.json()
    const bodyValidation = actionBodySchema.safeParse(body)
    if (!bodyValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Paramètres invalides', details: bodyValidation.error.flatten() },
        },
        { status: 400 }
      )
    }
    const { action, assignmentId, newProviderId } = bodyValidation.data

    const supabase = createAdminClient()

    if (action === 'reassign') {
      if (!newProviderId) {
        return NextResponse.json(
          { success: false, error: { message: 'newProviderId requis pour reassign' } },
          { status: 400 }
        )
      }

      // Get current assignment
      const current = await getAssignmentById(supabase, assignmentId)

      if (!current) {
        return NextResponse.json(
          { success: false, error: { message: 'Assignment non trouvé' } },
          { status: 404 }
        )
      }

      // Update assignment to new provider
      await reassignAssignment(supabase, assignmentId, newProviderId)

      await logLeadEvent(current.lead_id, 'reassigned', {
        providerId: newProviderId,
        actorId: auth.admin.id,
        metadata: {
          previousProviderId: current.provider_id,
          reason: 'admin_reassign',
        },
      })

      await logAdminAction(auth.admin.id, 'dispatch_reassign', 'lead_assignment', assignmentId, {
        from: current.provider_id,
        to: newProviderId,
      })

      // Alerte le nouvel artisan (email + SMS + in-app). Fire-and-forget.
      if (current.source_table === 'devis_requests' || current.source_table === null) {
        const lead = await getLeadSummary(supabase, current.lead_id)
        void sendLeadAlert({
          provider_ids: [newProviderId],
          service: lead?.service_name ?? undefined,
          city: lead?.city ?? undefined,
          urgency: lead?.urgency ?? undefined,
          client_name: lead?.client_name ?? undefined,
          description: lead?.description ?? undefined,
        }).catch((err) => logger.error('Reassign lead alert failed (non-blocking)', err))
      }
    } else if (action === 'replay') {
      // Re-dispatch using configurable algorithm
      const currentReplay = await getAssignmentById(supabase, assignmentId)

      if (!currentReplay) {
        return NextResponse.json(
          { success: false, error: { message: 'Assignment non trouvé' } },
          { status: 404 }
        )
      }

      const result = await dispatchLead(currentReplay.lead_id, {
        sourceTable: (currentReplay.source_table as 'devis_requests' | 'leads') || 'devis_requests',
      })

      await logAdminAction(auth.admin.id, 'dispatch_replay', 'lead_assignment', assignmentId, {
        newAssignments: result,
      })
    } else {
      return NextResponse.json(
        { success: false, error: { message: 'Action invalide' } },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, action })
  } catch (error) {
    logger.error('Dispatch POST error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une assignation
export async function DELETE(request: NextRequest) {
  const auth = await requirePermission('services', 'delete')

  if (!auth.success || !auth.admin) return auth.error

  try {
    const body = await request.json()
    const id = body?.id

    if (!id || !isValidUuid(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'ID invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    await deleteAssignment(supabase, id)

    await logAdminAction(auth.admin.id, 'dispatch_assignment_deleted', 'lead_assignment', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Dispatch assignment delete error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
