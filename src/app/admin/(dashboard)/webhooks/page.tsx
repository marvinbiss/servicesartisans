/**
 * RGE-OS pillar 8 — admin webhooks monitoring page.
 *
 * Internal-only surface. Auth is enforced by the `(dashboard)` route
 * layout (redirects non-admin sessions to `/admin/connexion` or `/`).
 * Indexing is forbidden by `/admin/layout.tsx` + this layout's
 * `metadata.robots`.
 *
 * Subscribers manage their own subscriptions via
 * `POST /api/v1/webhooks/subscribe` (Ralph 24). This page exists for
 * the oncall hand : "did event X fire to subscriber Y at time T ?",
 * "are they getting 401s for the last 6h ?", "fire a test event so I
 * can confirm their endpoint logic is sane after deploy".
 *
 * `force-dynamic` + `revalidate = 0` : we want a fresh delivery count
 * every time the operator hits refresh — stale data on a webhooks
 * dashboard would defeat the purpose.
 */

import type { Metadata } from 'next'

import { listWebhooksWithStats } from './_data'
import { WebhooksTable } from './WebhooksTable'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Webhooks — Admin',
  robots: { index: false, follow: false, nocache: true, noarchive: true },
}

export default async function AdminWebhooksPage() {
  const rows = await listWebhooksWithStats()
  const totalDeliveries = rows.reduce((acc, r) => acc + r.delivery_count, 0)
  const totalSuccess = rows.reduce((acc, r) => acc + r.success_count, 0)
  const successRate =
    totalDeliveries > 0 ? Math.round((totalSuccess / totalDeliveries) * 100) : null
  const activeCount = rows.filter((r) => r.active).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
          <p className="mt-2 text-sm text-gray-600">
            {rows.length} subscription{rows.length > 1 ? 's' : ''} · {activeCount} active
            {activeCount > 1 ? 's' : ''} · {totalDeliveries} delivery
            {totalDeliveries > 1 ? 'ies' : ''} total
            {successRate !== null ? ` · ${successRate}% success rate` : ''}.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Monitoring uniquement — les intégrateurs gèrent eux-mêmes leur cycle de vie via{' '}
            <code className="rounded bg-gray-100 px-1">/api/v1/webhooks/subscribe</code> et{' '}
            <code className="rounded bg-gray-100 px-1">/api/v1/webhooks/unsubscribe</code>.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <WebhooksTable rows={rows} />
      </div>
    </div>
  )
}
