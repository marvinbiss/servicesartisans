/**
 * GET /api/admin/webhooks/deliveries?id=<uuid>
 *
 * RGE-OS pillar 8 — return the last 20 delivery attempts for a given
 * subscription. Drives the inline expand on the admin webhooks table.
 *
 * Auth : requirePermission('settings', 'read') — same gate as the
 *        readonly admin endpoints.
 *
 * Why the query lives in this route (not in the page-level `_data.ts`):
 * the alias `@/*` would have to traverse `(dashboard)`, and path
 * aliases with parentheses are awkward across tooling (tsc, ESLint,
 * Sentry source maps). Duplicating ten lines of select+project is
 * cheaper than dealing with that footgun.
 */

import { NextResponse, type NextRequest } from 'next/server'

import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

export type DeliveryView = {
  id: number
  event: string
  status: number | null
  duration_ms: number | null
  body_excerpt: string | null
  error: string | null
  created_at: string
  attempt: number
}

function projectDelivery(row: RawDeliveryRow): DeliveryView {
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

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await requirePermission('settings', 'read')
  if (!auth.success || !auth.admin) return auth.error

  const id = req.nextUrl.searchParams.get('id') ?? ''
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: { code: 'invalid_id' } }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('rge_os_webhook_deliveries')
      .select('id, event, status, duration_ms, response_body_excerpt, error, created_at, attempt')
      .eq('webhook_id', id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) throw new Error(error.message)
    const rows = (data ?? []) as unknown as RawDeliveryRow[]
    const deliveries = rows.map(projectDelivery)
    return NextResponse.json(
      { deliveries, count: deliveries.length },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    logger.error('admin/webhooks/deliveries', err)
    return NextResponse.json({ error: { code: 'internal_error' } }, { status: 500 })
  }
}
