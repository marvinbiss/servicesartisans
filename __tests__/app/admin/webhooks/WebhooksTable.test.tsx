/**
 * Tests — WebhooksTable client component.
 *
 * Static-only rendering via `react-dom/server.renderToStaticMarkup`.
 * We deliberately avoid jsdom + testing-library here — the React
 * state machine is exercised by the API route tests (which prove the
 * server contract). Here we just want a fast sanity check on the
 * pure render output (table headers, row count, pills).
 */
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { WebhooksTable } from '../../../../src/app/admin/(dashboard)/webhooks/WebhooksTable'
import type { WebhookSummary } from '../../../../src/app/admin/(dashboard)/webhooks/_types'

function makeRow(over: Partial<WebhookSummary> = {}): WebhookSummary {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    url: 'https://example.com/h',
    events: ['rge.snapshot.refreshed'],
    active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    delivery_count: 5,
    success_count: 4,
    last_delivery_at: '2026-05-21T10:00:00.000Z',
    last_delivery_status: 200,
    email: 'sub@example.com',
    consecutive_failures: 0,
    ...over,
  }
}

describe('WebhooksTable', () => {
  it('renders empty-state message when rows is empty', () => {
    const html = renderToStaticMarkup(<WebhooksTable rows={[]} />)
    expect(html).toContain('Aucune subscription')
    expect(html).not.toContain('<table')
  })

  it('renders one row per webhook', () => {
    const rows: WebhookSummary[] = [
      makeRow({ id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }),
      makeRow({ id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', active: false }),
      makeRow({ id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', last_delivery_status: 503 }),
    ]
    const html = renderToStaticMarkup(<WebhooksTable rows={rows} />)
    expect(html).toContain('toggle-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
    expect(html).toContain('toggle-bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
    expect(html).toContain('toggle-cccccccc-cccc-cccc-cccc-cccccccccccc')
  })

  it('shows "Active" pill for active=true rows', () => {
    const html = renderToStaticMarkup(<WebhooksTable rows={[makeRow({ active: true })]} />)
    expect(html).toContain('>Active<')
  })

  it('shows "Disabled" pill for active=false rows', () => {
    const html = renderToStaticMarkup(<WebhooksTable rows={[makeRow({ active: false })]} />)
    expect(html).toContain('>Disabled<')
  })

  it('renders 5xx status with red styling', () => {
    const html = renderToStaticMarkup(
      <WebhooksTable rows={[makeRow({ last_delivery_status: 503 })]} />
    )
    expect(html).toMatch(/bg-red-100[^"]*">503</)
  })

  it('renders 3xx status with yellow styling', () => {
    const html = renderToStaticMarkup(
      <WebhooksTable rows={[makeRow({ last_delivery_status: 301 })]} />
    )
    expect(html).toMatch(/bg-yellow-100[^"]*">301</)
  })

  it('shows consecutive_failures badge when > 0', () => {
    const html = renderToStaticMarkup(
      <WebhooksTable rows={[makeRow({ consecutive_failures: 3 })]} />
    )
    expect(html).toContain('!3')
  })

  it('renders em-dash when last_delivery_at is null', () => {
    const html = renderToStaticMarkup(
      <WebhooksTable rows={[makeRow({ last_delivery_at: null, last_delivery_status: null })]} />
    )
    expect(html).toContain('—')
  })
})
