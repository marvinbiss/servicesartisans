/**
 * Client Leads API — read-only
 * GET: Fetch client's devis_requests with status derived from lead_events
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { pageSchema } from '@/lib/validations/schemas'
import {
  getDevisRequestsForClient,
  getLeadEventsForLeads,
  deriveStatus,
  STATUS_LABELS,
} from '@/lib/services/leads-service'

const clientLeadsQuerySchema = z.object({
  page: pageSchema,
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  status: z.string().max(50).default('all'),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non authentifié' } },
        { status: 401 }
      )
    }

    // Parse and validate pagination from query params
    const url = request.nextUrl
    const parsed = clientLeadsQuerySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      pageSize: url.searchParams.get('pageSize') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides' } },
        { status: 400 }
      )
    }

    const { page, pageSize } = parsed.data
    const statusFilter = parsed.data.status

    // Fetch all devis_requests for this client
    const demandes = await getDevisRequestsForClient(supabase, user.id)

    if (demandes.length === 0) {
      return NextResponse.json({
        leads: [],
        stats: { total: 0, en_attente: 0, en_traitement: 0, devis_recus: 0, termine: 0 },
        pagination: { page: 1, pageSize, totalPages: 0, totalItems: 0 },
      })
    }

    // Fetch lead_events for all of this client's leads (admin client — RLS is admin-only)
    const adminClient = createAdminClient()
    const leadIds = demandes.map((d) => d.id)
    const allEvents = await getLeadEventsForLeads(adminClient, leadIds)

    // Group events by lead_id
    const eventsByLead: Record<string, Array<{ event_type: string; created_at: string }>> = {}
    for (const event of allEvents) {
      if (!eventsByLead[event.lead_id]) eventsByLead[event.lead_id] = []
      eventsByLead[event.lead_id].push(event)
    }

    // Build enriched leads with derived status + last activity
    const enrichedLeads = demandes.map((d) => {
      const events = eventsByLead[d.id] || []
      const derivedStatusValue = deriveStatus(events)
      const lastActivity = events.length > 0 ? events[0].created_at : d.created_at

      return {
        id: d.id,
        service_name: d.service_name,
        city: d.city,
        postal_code: d.postal_code,
        description: d.description,
        budget: d.budget,
        urgency: d.urgency,
        created_at: d.created_at,
        derived_status: derivedStatusValue,
        derived_status_label: STATUS_LABELS[derivedStatusValue],
        last_activity: lastActivity,
        event_count: events.length,
      }
    })

    // Sort by last activity (most recent first)
    enrichedLeads.sort(
      (a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
    )

    // Filter by derived status if requested
    const filtered =
      statusFilter === 'all'
        ? enrichedLeads
        : enrichedLeads.filter((l) => l.derived_status === statusFilter)

    // Stats (before filtering)
    const stats = {
      total: enrichedLeads.length,
      en_attente: enrichedLeads.filter((l) => l.derived_status === 'en_attente').length,
      en_traitement: enrichedLeads.filter((l) => l.derived_status === 'en_traitement').length,
      devis_recus: enrichedLeads.filter((l) => l.derived_status === 'devis_recus').length,
      termine: enrichedLeads.filter(
        (l) => l.derived_status === 'termine' || l.derived_status === 'accepte'
      ).length,
    }

    // Paginate
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

    return NextResponse.json({
      leads: paginated,
      stats,
      pagination: { page, pageSize, totalPages, totalItems: filtered.length },
    })
  } catch (error) {
    logger.error('Client leads GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
