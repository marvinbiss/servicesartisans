/**
 * POST /api/admin/webhooks/fire-test
 *
 * RGE-OS pillar 8 — fire a mock event payload at any subscription
 * without the subscriber having to present their secret (unlike
 * `/api/v1/webhooks/test` which is integrator-facing). Used by oncall
 * after a subscriber complains "we are not receiving X events anymore"
 * to confirm round-trip in <2s.
 *
 * Body : { id: uuid, event: WebhookEvent }
 * Auth : requirePermission('settings', 'write').
 *
 * Side effects :
 *   - Inserts a row in `rge_os_webhook_deliveries` regardless of HTTP
 *     outcome — keeps the audit trail honest.
 *   - Bumps `last_delivery_*` on the hook row.
 *   - Logs an `audit_logs` row so we can answer "who fired what,
 *     when ?" after the fact.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { logAdminAction, requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import { deliverWebhook, isValidEvent, mockPayloadFor, type WebhookEvent } from '@/lib/webhooks'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const fireTestSchema = z
  .object({ id: z.string().optional(), event: z.string().optional() })
  .passthrough()

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await requirePermission('settings', 'write')
  if (!auth.success || !auth.admin) return auth.error

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: { code: 'invalid_body' } }, { status: 400 })
  }
  const parsed = fireTestSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'invalid_body' } }, { status: 400 })
  }

  const body = parsed.data
  const id = typeof body.id === 'string' ? body.id : ''
  const event = typeof body.event === 'string' ? body.event : ''
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: { code: 'invalid_id' } }, { status: 400 })
  }
  if (!isValidEvent(event)) {
    return NextResponse.json({ error: { code: 'invalid_event' } }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const { data: hook, error: fetchError } = await supabase
      .from('rge_os_webhooks')
      .select('id, url, secret, active')
      .eq('id', id)
      .maybeSingle()
    if (fetchError) throw new Error(fetchError.message)
    if (!hook) {
      return NextResponse.json({ error: { code: 'not_found' } }, { status: 404 })
    }

    const typedEvent = event as WebhookEvent
    const payload = {
      ...mockPayloadFor(typedEvent),
      _admin_test: true,
      _fired_at: new Date().toISOString(),
    }
    const result = await deliverWebhook(hook.url, hook.secret, typedEvent, payload)

    const isOk = typeof result.status === 'number' && result.status >= 200 && result.status < 300
    const insertRes = await supabase.from('rge_os_webhook_deliveries').insert({
      webhook_id: id,
      event: typedEvent,
      payload: payload as Record<string, unknown>,
      attempt: 1,
      status: result.status,
      response_body_excerpt: result.body_excerpt,
      duration_ms: result.duration_ms,
      error: result.error,
      final_status_at: new Date().toISOString(),
    })
    if (insertRes.error) {
      logger.warn('admin/webhooks/fire-test: delivery insert failed', {
        id,
        err: insertRes.error.message,
      })
    }
    const updateRes = await supabase
      .from('rge_os_webhooks')
      .update({
        last_delivery_at: new Date().toISOString(),
        last_delivery_status: result.status,
      })
      .eq('id', id)
    if (updateRes.error) {
      logger.warn('admin/webhooks/fire-test: hook update failed', {
        id,
        err: updateRes.error.message,
      })
    }

    await logAdminAction(auth.admin.id, 'webhook_test_fired', 'settings', id, {
      webhook_id: id,
      event: typedEvent,
      status: result.status,
      duration_ms: result.duration_ms,
    })

    return NextResponse.json(
      {
        ok: true,
        delivered: isOk,
        status: result.status,
        duration_ms: result.duration_ms,
        error: result.error,
      },
      { status: 200 }
    )
  } catch (err) {
    logger.error('admin/webhooks/fire-test', err)
    return NextResponse.json({ error: { code: 'internal_error' } }, { status: 500 })
  }
}
