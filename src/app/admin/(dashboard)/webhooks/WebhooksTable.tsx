'use client'

/**
 * RGE-OS pillar 8 — admin webhooks interactive table.
 *
 * The whole grid is one client component so the inline "Deliveries"
 * expand can stay co-located with the toggle/test actions. Each row
 * tracks its own `busy` flag so a click on hook A doesn't block a
 * concurrent click on hook B.
 *
 * Why `window.location.reload()` after toggle : the page is a Server
 * Component and the freshest source of truth lives in Supabase. A
 * full reload re-runs `listWebhooksWithStats()` and re-projects the
 * row, which keeps the success-rate counter honest without a parallel
 * fetcher in the client. Cheap given we expect this page to be opened
 * by ~5 humans/day, not crawled.
 */

import { useState } from 'react'

import type { DeliveryRow, WebhookSummary } from './_types'

function StatusPill({ status }: { status: number | null }) {
  if (status === null) return <span className="text-charcoal-400">—</span>
  if (status >= 200 && status < 300) {
    return (
      <span className="rounded bg-green-100 px-1.5 py-0.5 font-mono text-xs text-green-800">
        {status}
      </span>
    )
  }
  if (status >= 400) {
    return (
      <span className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs text-red-800">
        {status}
      </span>
    )
  }
  return (
    <span className="rounded bg-yellow-100 px-1.5 py-0.5 font-mono text-xs text-yellow-800">
      {status}
    </span>
  )
}

type Props = {
  rows: WebhookSummary[]
}

export function WebhooksTable({ rows }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [deliveries, setDeliveries] = useState<Record<string, DeliveryRow[]>>({})
  const [busy, setBusy] = useState<Record<string, boolean>>({})

  async function toggle(id: string, nextActive: boolean) {
    setBusy((prev) => ({ ...prev, [id]: true }))
    try {
      const res = await fetch('/api/admin/webhooks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: nextActive }),
      })
      if (!res.ok) throw new Error(`toggle: ${res.status}`)
      window.location.reload()
    } catch (err) {
      window.alert(String(err))
    } finally {
      setBusy((prev) => ({ ...prev, [id]: false }))
    }
  }

  async function fireTest(id: string) {
    setBusy((prev) => ({ ...prev, [id]: true }))
    try {
      const res = await fetch('/api/admin/webhooks/fire-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, event: 'rge.snapshot.refreshed' }),
      })
      const body = (await res.json().catch(() => ({}))) as {
        delivered?: boolean
        status?: number | null
        duration_ms?: number | null
      }
      if (res.ok) {
        window.alert(
          `Fired. Delivered=${body.delivered ?? false} status=${body.status ?? 'n/a'} duration=${body.duration_ms ?? 'n/a'}ms`
        )
      } else {
        window.alert(`Failed: ${res.status}`)
      }
    } catch (err) {
      window.alert(String(err))
    } finally {
      setBusy((prev) => ({ ...prev, [id]: false }))
    }
  }

  async function loadDeliveries(id: string) {
    if (deliveries[id]) {
      setOpenId(openId === id ? null : id)
      return
    }
    setBusy((prev) => ({ ...prev, [id]: true }))
    try {
      const res = await fetch(`/api/admin/webhooks/deliveries?id=${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error(`deliveries: ${res.status}`)
      const body = (await res.json().catch(() => ({}))) as { deliveries?: DeliveryRow[] }
      setDeliveries((prev) => ({ ...prev, [id]: body.deliveries ?? [] }))
      setOpenId(id)
    } catch (err) {
      window.alert(String(err))
    } finally {
      setBusy((prev) => ({ ...prev, [id]: false }))
    }
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-charcoal-700">
        Aucune subscription pour le moment. Les intégrateurs en créent via{' '}
        <code className="rounded bg-sand-100 px-1">POST /api/v1/webhooks/subscribe</code>.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-sand-100 bg-white shadow-sm">
      <table className="w-full text-sm" data-testid="admin-webhooks-table">
        <thead>
          <tr className="border-b border-sand-100 bg-sand-50 text-left text-xs uppercase tracking-wide text-charcoal-600">
            <th className="px-3 py-2">URL</th>
            <th className="px-3 py-2">Events</th>
            <th className="px-3 py-2">Created</th>
            <th className="px-3 py-2">Deliv.</th>
            <th className="px-3 py-2">Success</th>
            <th className="px-3 py-2">Last</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Active</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <RowFragment
              key={r.id}
              row={r}
              isOpen={openId === r.id}
              busy={!!busy[r.id]}
              deliveries={deliveries[r.id]}
              onToggle={() => toggle(r.id, !r.active)}
              onFireTest={() => fireTest(r.id)}
              onLoadDeliveries={() => loadDeliveries(r.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

type RowFragmentProps = {
  row: WebhookSummary
  isOpen: boolean
  busy: boolean
  deliveries: DeliveryRow[] | undefined
  onToggle: () => void
  onFireTest: () => void
  onLoadDeliveries: () => void
}

function RowFragment({
  row,
  isOpen,
  busy,
  deliveries,
  onToggle,
  onFireTest,
  onLoadDeliveries,
}: RowFragmentProps) {
  const {
    id,
    url,
    events,
    created_at,
    delivery_count,
    success_count,
    last_delivery_at,
    last_delivery_status,
    active,
    consecutive_failures,
  } = row
  return (
    <>
      <tr className="border-t border-sand-100 align-top">
        <td className="px-3 py-2 font-mono text-xs text-charcoal-900">
          <span className="block max-w-[28ch] truncate" title={url}>
            {url}
          </span>
        </td>
        <td className="px-3 py-2 text-xs text-charcoal-700">{events.join(', ') || '—'}</td>
        <td className="px-3 py-2 text-xs text-charcoal-600">{created_at.slice(0, 10)}</td>
        <td className="px-3 py-2 font-mono text-xs">{delivery_count}</td>
        <td className="px-3 py-2 font-mono text-xs">
          {success_count}/{delivery_count}
          {consecutive_failures > 0 ? (
            <span
              className="ml-2 rounded bg-red-100 px-1 text-red-800"
              title="consecutive failures"
            >
              !{consecutive_failures}
            </span>
          ) : null}
        </td>
        <td className="px-3 py-2 text-xs text-charcoal-600">
          {last_delivery_at ? last_delivery_at.slice(0, 16).replace('T', ' ') : '—'}
        </td>
        <td className="px-3 py-2">
          <StatusPill status={last_delivery_status} />
        </td>
        <td className="px-3 py-2">
          <button
            type="button"
            onClick={onToggle}
            disabled={busy}
            data-testid={`toggle-${id}`}
            className={`rounded px-2 py-0.5 text-xs ${
              active ? 'bg-green-100 text-green-800' : 'bg-sand-200 text-charcoal-700'
            } ${busy ? 'opacity-50' : 'hover:opacity-80'}`}
          >
            {active ? 'Active' : 'Disabled'}
          </button>
        </td>
        <td className="px-3 py-2">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onFireTest}
              disabled={busy}
              data-testid={`fire-test-${id}`}
              className="rounded border border-sand-200 px-2 py-0.5 text-xs hover:border-charcoal-300 disabled:opacity-50"
            >
              Test
            </button>
            <button
              type="button"
              onClick={onLoadDeliveries}
              disabled={busy}
              data-testid={`deliveries-${id}`}
              className="rounded border border-sand-200 px-2 py-0.5 text-xs hover:border-charcoal-300 disabled:opacity-50"
            >
              {isOpen ? 'Hide' : 'Deliveries'}
            </button>
          </div>
        </td>
      </tr>
      {isOpen ? (
        <tr className="bg-sand-50">
          <td colSpan={9} className="px-3 py-3">
            {deliveries && deliveries.length > 0 ? (
              <ul className="space-y-1 text-xs">
                {deliveries.map((d) => (
                  <li key={d.id} className="font-mono">
                    <StatusPill status={d.status} />{' '}
                    <span className="ml-2 text-charcoal-900">{d.event}</span>{' '}
                    <span className="ml-2 text-charcoal-600">
                      attempt {d.attempt} · {d.duration_ms ?? '—'}ms
                    </span>{' '}
                    <span className="ml-2 text-charcoal-500">
                      {d.created_at.slice(0, 19).replace('T', ' ')}
                    </span>
                    {d.error ? <span className="ml-2 text-red-700">err: {d.error}</span> : null}
                    {d.body_excerpt ? (
                      <span className="ml-2 truncate text-charcoal-500" title={d.body_excerpt}>
                        body: {d.body_excerpt.slice(0, 80)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-charcoal-600">Aucune delivery enregistrée.</p>
            )}
          </td>
        </tr>
      ) : null}
    </>
  )
}
