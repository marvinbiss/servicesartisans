/**
 * RGE-OS pillar 8 — admin webhooks data helpers.
 *
 * `listWebhooksWithStats()` joins `rge_os_webhooks` with the deliveries
 * append-log so the operator sees, at a glance :
 *   - how many deliveries we've fired for each hook
 *   - how many of those landed in the 2xx range
 *   - the most recent attempt + its status
 *
 * Why pull the deliveries inline (vs a SQL view) : keeping the data
 * fetch in TypeScript means we can iterate on the success-rate
 * heuristic without writing migrations. At 200 hooks × ~50 deliveries
 * the payload is small enough (~ a few MB) that PostgREST + the
 * Supabase client both stay comfortable. If this ever pages, switch
 * to a Postgres view + RPC.
 *
 * `listRecentDeliveries()` is unrelated to the join above — it powers
 * the inline expand on the table, so we want it strict (single hook,
 * top 20, descending) and cheap.
 */

import { createAdminClient } from '@/lib/supabase/admin'

import type { WebhookSummary, DeliveryRow } from './_types'

type DeliveryStatusRow = {
  id: number | null
  status: number | null
}

type WebhookJoinedRow = {
  id: string
  url: string
  events: string[] | null
  active: boolean | null
  created_at: string
  last_delivery_at: string | null
  last_delivery_status: number | null
  email: string | null
  consecutive_failures: number | null
  rge_os_webhook_deliveries: DeliveryStatusRow[] | DeliveryStatusRow | null
}

function countSuccesses(rows: DeliveryStatusRow[]): number {
  let success = 0
  for (const r of rows) {
    if (typeof r?.status === 'number' && r.status >= 200 && r.status < 300) success++
  }
  return success
}

export function projectWebhookSummary(row: WebhookJoinedRow): WebhookSummary {
  const deliveries = Array.isArray(row.rge_os_webhook_deliveries)
    ? row.rge_os_webhook_deliveries
    : row.rge_os_webhook_deliveries
      ? [row.rge_os_webhook_deliveries]
      : []
  return {
    id: row.id,
    url: row.url,
    events: Array.isArray(row.events) ? row.events : [],
    active: row.active === true,
    created_at: row.created_at,
    delivery_count: deliveries.length,
    success_count: countSuccesses(deliveries),
    last_delivery_at: row.last_delivery_at,
    last_delivery_status: row.last_delivery_status,
    email: row.email,
    consecutive_failures:
      typeof row.consecutive_failures === 'number' ? row.consecutive_failures : 0,
  }
}

export async function listWebhooksWithStats(): Promise<WebhookSummary[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('rge_os_webhooks')
    .select(
      'id, url, events, active, created_at, last_delivery_at, last_delivery_status, email, consecutive_failures, rge_os_webhook_deliveries(id, status)'
    )
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw new Error(`listWebhooksWithStats: ${error.message}`)
  const rows = (data ?? []) as unknown as WebhookJoinedRow[]
  return rows.map(projectWebhookSummary)
}

type RawDeliveryRow = {
  id: number
  event: string
  status: number | null
  duration_ms: number | null
  response_body_excerpt: string | null
  error: string | null
  created_at: string
  attempt: number | null
}

export function projectDeliveryRow(row: RawDeliveryRow): DeliveryRow {
  return {
    id: row.id,
    event: row.event,
    status: row.status,
    duration_ms: row.duration_ms,
    body_excerpt: row.response_body_excerpt,
    error: row.error,
    created_at: row.created_at,
    attempt: typeof row.attempt === 'number' ? row.attempt : 1,
  }
}

export async function listRecentDeliveries(webhookId: string, limit = 20): Promise<DeliveryRow[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('rge_os_webhook_deliveries')
    .select('id, event, status, duration_ms, response_body_excerpt, error, created_at, attempt')
    .eq('webhook_id', webhookId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`listRecentDeliveries: ${error.message}`)
  const rows = (data ?? []) as unknown as RawDeliveryRow[]
  return rows.map(projectDeliveryRow)
}
