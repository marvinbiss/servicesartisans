/**
 * Client Leads API — read-only
 * GET: Fetch client's devis_requests with status derived from lead_events
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

type DerivedStatus = 'en_attente' | 'en_traitement' | 'devis_recus' | 'accepte' | 'termine' | 'expire' | 'refuse'

function deriveStatus(events: Array<{ event_type: string }>): DerivedStatus {
  if (events.length === 0) return 'en_attente'

  // Check for terminal states first (scan all events)
  const types = new Set(events.map(e => e.event_type))
  if (types.has('completed')) return 'termine'
  if (types.has('expired')) return 'expire'
  if (types.has('accepted')) return 'accepte'
  if (types.has('refused')) return 'refuse'
  if (types.has('quoted')) return 'devis_recus'
  if (types.has('dispatched') || types.has('viewed') || types.has('declined') || types.has('reassigned')) return 'en_traitement'
  return 'en_attente'
}

const STATUS_LABELS: Record<DerivedStatus, string> = {
  en_attente: 'En attente',
  en_traitement: 'En traitement',
  devis_recus: 'Devis reçu(s)',
  accepte: 'Accepté',
  termine: 'Terminé',
  expire: 'Expiré',
  refuse: 'Refusé',
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Parse pagination from query params
    const url = request.nextUrl
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20')))
    const statusFilter = url.searchParams.get('status') || 'all'

    // Fetch all devis_requests for this client
    const { data: demandes, error: demandesError } = await supabase
      .from('devis_requests')
      .select('id, service_name, city, postal_code, description, budget, urgency, status, client_name, created_at')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })

    if (demandesError) {
      logger.error('Client leads fetch error:', demandesError)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    if (!demandes || demandes.length === 0) {
      return NextResponse.json({
        leads: [],
        stats: { total: 0, en_attente: 0, en_traitement: 0, devis_recus: 0, termine: 0 },
        pagination: { page: 1, pageSize, totalPages: 0, totalItems: 0 },
      })
    }

    // Fetch lead_events for all of this client's leads (admin client — RLS is admin-only)
    const adminClient = createAdminClient()
    const leadIds = demandes.map(d => d.id)
    const { data: allEvents, error: eventsError } = await adminClient
      .from('lead_events')
      .select('lead_id, event_type, created_at')
      .in('lead_id', leadIds)
      .order('created_at', { ascending: false })

    if (eventsError) {
      logger.error('Client lead_events fetch error:', eventsError)
      // Non-blocking: fall back to devis_requests.status
    }

    // Group events by lead_id
    const eventsByLead: Record<string, Array<{ event_type: string; created_at: string }>> = {}
    for (const event of allEvents || []) {
      if (!eventsByLead[event.lead_id]) eventsByLead[event.lead_id] = []
      eventsByLead[event.lead_id].push(event)
    }

    // Build enriched leads with derived status + last activity
    const enrichedLeads = demandes.map(d => {
      const events = eventsByLead[d.id] || []
      const derivedStatus = deriveStatus(events)
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
        derived_status: derivedStatus,
        derived_status_label: STATUS_LABELS[derivedStatus],
        last_activity: lastActivity,
        event_count: events.length,
      }
    })

    // Sort by last activity (most recent first)
    enrichedLeads.sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())

    // Filter by derived status if requested
    const filtered = statusFilter === 'all'
      ? enrichedLeads
      : enrichedLeads.filter(l => l.derived_status === statusFilter)

    // Stats (before filtering)
    const stats = {
      total: enrichedLeads.length,
      en_attente: enrichedLeads.filter(l => l.derived_status === 'en_attente').length,
      en_traitement: enrichedLeads.filter(l => l.derived_status === 'en_traitement').length,
      devis_recus: enrichedLeads.filter(l => l.derived_status === 'devis_recus').length,
      termine: enrichedLeads.filter(l => l.derived_status === 'termine' || l.derived_status === 'accepte').length,
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
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
