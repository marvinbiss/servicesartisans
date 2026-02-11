/**
 * Admin Dispatch API
 * GET: Dispatch monitoring (queue status, recent assignments)
 * POST: Dispatch actions (reassign, replay)
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logLeadEvent } from '@/lib/dashboard/events'
import { dispatchLead } from '@/app/actions/dispatch'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin()
  if (!auth.success || !auth.admin) return auth.error!

  try {
    const supabase = createAdminClient()
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    // Recent assignments with provider info
    const { data: assignments, error: assignError } = await supabase
      .from('lead_assignments')
      .select(`
        id,
        lead_id,
        status,
        assigned_at,
        viewed_at,
        source_table,
        score,
        distance_km,
        position,
        provider:providers (id, name, specialty, address_city)
      `)
      .order('assigned_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (assignError) {
      return NextResponse.json({ error: assignError.message }, { status: 500 })
    }

    // Queue stats
    const { count: pendingCount } = await supabase
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { count: viewedCount } = await supabase
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'viewed')

    const { count: quotedCount } = await supabase
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'quoted')

    const { count: totalCount } = await supabase
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })

    return NextResponse.json({
      assignments: assignments || [],
      stats: {
        pending: pendingCount || 0,
        viewed: viewedCount || 0,
        quoted: quotedCount || 0,
        total: totalCount || 0,
      },
      page,
      pageSize: limit,
    })
  } catch (error) {
    console.error('Dispatch GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin()
  if (!auth.success || !auth.admin) return auth.error!

  try {
    const body = await request.json()
    const { action, assignmentId, newProviderId } = body as {
      action: string
      assignmentId: string
      newProviderId?: string
    }

    if (!action || !assignmentId) {
      return NextResponse.json({ error: 'action et assignmentId requis' }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (action === 'reassign') {
      if (!newProviderId) {
        return NextResponse.json({ error: 'newProviderId requis pour reassign' }, { status: 400 })
      }

      // Get current assignment
      const { data: current } = await supabase
        .from('lead_assignments')
        .select('lead_id, provider_id, source_table')
        .eq('id', assignmentId)
        .single()

      if (!current) {
        return NextResponse.json({ error: 'Assignment non trouvé' }, { status: 404 })
      }

      // Update assignment to new provider
      await supabase
        .from('lead_assignments')
        .update({
          provider_id: newProviderId,
          status: 'pending',
          assigned_at: new Date().toISOString(),
          viewed_at: null,
        })
        .eq('id', assignmentId)

      await logLeadEvent(current.lead_id, 'reassigned', {
        providerId: newProviderId,
        actorId: auth.admin.id,
        metadata: {
          previousProviderId: current.provider_id,
          reason: 'admin_reassign',
        },
      })

      await logAdminAction(
        auth.admin.id,
        'dispatch_reassign',
        'lead_assignment',
        assignmentId,
        { from: current.provider_id, to: newProviderId }
      )
    } else if (action === 'replay') {
      // Re-dispatch using configurable algorithm
      const { data: currentReplay } = await supabase
        .from('lead_assignments')
        .select('lead_id, source_table')
        .eq('id', assignmentId)
        .single()

      if (!currentReplay) {
        return NextResponse.json({ error: 'Assignment non trouvé' }, { status: 404 })
      }

      const result = await dispatchLead(currentReplay.lead_id, {
        sourceTable: (currentReplay.source_table as 'devis_requests' | 'leads') || 'devis_requests',
      })

      await logAdminAction(
        auth.admin.id,
        'dispatch_replay',
        'lead_assignment',
        assignmentId,
        { newAssignments: result }
      )
    } else {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }

    return NextResponse.json({ success: true, action })
  } catch (error) {
    console.error('Dispatch POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
