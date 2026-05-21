/**
 * RGE-OS pillar 8 — admin webhooks page row types.
 *
 * Kept in a dedicated module (vs inlined in page.tsx) so the data
 * helpers, the API routes, and the client component all agree on
 * the same shape without a circular dep through the page.
 *
 * The `active` flag matches the schema column name (migration 521).
 * We deliberately do NOT call it `enabled` here so a future refactor
 * cannot silently break the toggle endpoint via a type-blind rename.
 */

export type WebhookSummary = {
  id: string
  url: string
  events: string[]
  active: boolean
  created_at: string
  delivery_count: number
  success_count: number
  last_delivery_at: string | null
  last_delivery_status: number | null
  email: string | null
  consecutive_failures: number
}

export type DeliveryRow = {
  id: number
  event: string
  status: number | null
  duration_ms: number | null
  body_excerpt: string | null
  error: string | null
  created_at: string
  attempt: number
}
