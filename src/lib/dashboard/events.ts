/**
 * Dashboard V2 — Event logging helpers (server-side only)
 * All functions use admin client (service_role) — bypasses RLS.
 */

import { createAdminClient } from '@/lib/supabase/admin'

export type LeadEventType =
  | 'created'
  | 'dispatched'
  | 'viewed'
  | 'quoted'
  | 'declined'
  | 'accepted'
  | 'refused'
  | 'completed'
  | 'expired'
  | 'reassigned'

export async function logLeadEvent(
  leadId: string,
  eventType: LeadEventType,
  opts?: {
    providerId?: string
    actorId?: string
    metadata?: Record<string, unknown>
  }
) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('lead_events').insert({
    lead_id: leadId,
    event_type: eventType,
    provider_id: opts?.providerId ?? null,
    actor_id: opts?.actorId ?? null,
    metadata: opts?.metadata ?? {},
  })
  if (error) {
    console.error('Failed to log lead event:', error.message)
  }
}

export async function logAccess(
  path: string,
  opts?: {
    userId?: string
    method?: string
    statusCode?: number
    ipAddress?: string
    userAgent?: string
  }
) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('access_logs').insert({
    path,
    user_id: opts?.userId ?? null,
    method: opts?.method ?? 'GET',
    status_code: opts?.statusCode ?? null,
    ip_address: opts?.ipAddress ?? null,
    user_agent: opts?.userAgent ?? null,
  })
  if (error) {
    console.error('Failed to log access:', error.message)
  }
}
