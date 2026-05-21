/**
 * POST /api/admin/webhooks/toggle
 *
 * RGE-OS pillar 8 — flip a webhook subscription's `active` flag from
 * the admin console without going through the v1 subscriber API
 * (which requires the subscriber's api_key). Used when oncall needs
 * to silence a noisy hook fast.
 *
 * Body : { id: uuid, active: boolean }
 * Auth : requirePermission('settings', 'write') — same gate as
 *        /api/admin/admins (super-admin or admin role).
 *
 * Audit : every toggle writes an `audit_logs` row so we can answer
 *        "who silenced subscriber X yesterday ?". The row goes through
 *        `logAdminAction()` so it lands with the canonical schema.
 */

import { NextResponse, type NextRequest } from 'next/server'

import { logAdminAction, requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await requirePermission('settings', 'write')
  if (!auth.success || !auth.admin) return auth.error

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: { code: 'invalid_body' } }, { status: 400 })
  }
  if (raw === null || typeof raw !== 'object') {
    return NextResponse.json({ error: { code: 'invalid_body' } }, { status: 400 })
  }

  const body = raw as Record<string, unknown>
  const id = typeof body.id === 'string' ? body.id : ''
  const active = body.active === true
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: { code: 'invalid_id' } }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('rge_os_webhooks').update({ active }).eq('id', id)
    if (error) throw new Error(error.message)

    await logAdminAction(
      auth.admin.id,
      active ? 'webhook_enabled' : 'webhook_disabled',
      'settings',
      id,
      {
        webhook_id: id,
        active,
      }
    )

    return NextResponse.json({ ok: true, active }, { status: 200 })
  } catch (err) {
    logger.error('admin/webhooks/toggle', err)
    return NextResponse.json({ error: { code: 'internal_error' } }, { status: 500 })
  }
}
