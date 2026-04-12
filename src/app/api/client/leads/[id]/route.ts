/**
 * Client Lead Detail API — read-only
 * GET: Fetch single devis_request with quotes + event timeline + stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import {
  getDevisRequestById,
  getQuotesForLead,
  getLeadEventsById,
  getAssignmentsForLead,
  type LeadEventRow,
} from '@/lib/services/leads-service'

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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    // Fetch the devis_request — RLS ensures client_id = auth.uid()
    const lead = await getDevisRequestById(supabase, id, user.id)

    if (!lead) {
      return NextResponse.json(
        { success: false, error: { message: 'Demande non trouvée' } },
        { status: 404 }
      )
    }

    // Use admin client for tables restricted by RLS to providers only
    const adminClient = createAdminClient()

    // Fetch quotes, events, and assignments in parallel
    const [quotesRaw, events, assignments] = await Promise.all([
      getQuotesForLead(adminClient, id),
      getLeadEventsById(adminClient, id),
      getAssignmentsForLead(adminClient, id),
    ])

    // Sanitize events for client view
    const clientEvents = events.map((e: LeadEventRow) => ({
      id: e.id,
      event_type: e.event_type,
      label: CLIENT_SAFE_EVENT_LABELS[e.event_type] || e.event_type,
      metadata: sanitizeMetadata(e.event_type, e.metadata),
      created_at: e.created_at,
    }))

    // Build quotes list — strip provider_id from client response
    const quotes = quotesRaw.map((q) => {
      const providerRaw = Array.isArray(q.provider) ? q.provider[0] : q.provider
      return {
        id: q.id,
        amount: q.amount,
        description: q.description,
        valid_until: q.valid_until,
        status: q.status,
        created_at: q.created_at,
        provider: providerRaw
          ? {
              name: providerRaw.name as string,
              specialty: providerRaw.specialty as string | null,
              city: providerRaw.address_city as string | null,
              rating_average: providerRaw.rating_average as number | null,
            }
          : null,
      }
    })

    const artisansViewed = assignments.filter((a) =>
      ['viewed', 'quoted', 'declined'].includes(a.status)
    ).length

    const stats = {
      artisans_notified: assignments.length,
      artisans_viewed: artisansViewed,
      quotes_count: quotes.length,
    }

    // Legacy field kept for backward compatibility with existing page
    const quotesCount = quotes.length

    return NextResponse.json({
      lead,
      quotes,
      events: clientEvents,
      stats,
      quotesCount,
    })
  } catch (error) {
    logger.error('Client lead detail GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
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
