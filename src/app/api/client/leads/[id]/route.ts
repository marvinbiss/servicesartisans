/**
 * Client Lead Detail API — read-only
 * GET: Fetch single devis_request with full event timeline
 * No write operations — client is read-only for lead_events
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const CLIENT_SAFE_EVENT_LABELS: Record<string, string> = {
  created: 'Demande créée',
  dispatched: 'Artisans contactés',
  viewed: 'Artisan intéressé',
  quoted: 'Devis reçu',
  declined: 'Artisan indisponible',
  accepted: 'Devis accepté',
  refused: 'Devis refusé',
  completed: 'Mission terminée',
  expired: 'Demande expirée',
  reassigned: 'Nouvel artisan contacté',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Fetch the devis_request — RLS ensures client_id = auth.uid()
    const { data: lead, error: leadError } = await supabase
      .from('devis_requests')
      .select('id, service_name, city, postal_code, description, budget, urgency, status, client_name, client_email, client_phone, created_at')
      .eq('id', id)
      .eq('client_id', user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }

    // Fetch events for this lead (admin client — RLS is admin-only on lead_events)
    const adminClient = createAdminClient()
    const { data: events, error: eventsError } = await adminClient
      .from('lead_events')
      .select('id, event_type, metadata, created_at')
      .eq('lead_id', id)
      .order('created_at', { ascending: true })

    if (eventsError) {
      logger.error('Client lead detail events error:', eventsError)
    }

    // Sanitize events for client view:
    // - Use client-friendly labels
    // - Strip provider_id, actor_id
    // - Expose only safe metadata (amounts, no internal IDs)
    const clientEvents = (events || []).map(e => ({
      id: e.id,
      event_type: e.event_type,
      label: CLIENT_SAFE_EVENT_LABELS[e.event_type] || e.event_type,
      metadata: sanitizeMetadata(e.event_type, e.metadata),
      created_at: e.created_at,
    }))

    // Count quotes received
    const quotesCount = (events || []).filter(e => e.event_type === 'quoted').length

    return NextResponse.json({
      lead,
      events: clientEvents,
      quotesCount,
    })
  } catch (error) {
    logger.error('Client lead detail GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function sanitizeMetadata(
  eventType: string,
  metadata: Record<string, unknown>
): Record<string, unknown> {
  // Only expose client-safe metadata
  if (eventType === 'quoted' && metadata.amount) {
    return { amount: metadata.amount }
  }
  if (eventType === 'declined' && metadata.reason) {
    return { reason: metadata.reason }
  }
  return {}
}
