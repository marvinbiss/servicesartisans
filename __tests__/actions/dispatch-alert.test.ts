/**
 * Tests — dispatchLead → sendLeadAlert wiring
 *
 * Covers :
 *   - alert fired with assigned provider ids + lead context after dispatch
 *   - no alert when dispatch returns 0 assignment
 *   - alert failure does not break dispatch (fire-and-forget)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const PROVIDER_A = '11111111-1111-4111-8111-111111111111'
const PROVIDER_B = '22222222-2222-4222-8222-222222222222'
const LEAD_ID = '33333333-3333-4333-8333-333333333333'

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  sendLeadAlert: vi.fn(),
  geocoder: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ rpc: mocks.rpc }),
}))

vi.mock('@/lib/services/notifications-service', () => ({
  sendLeadAlert: mocks.sendLeadAlert,
}))

vi.mock('@/lib/api/adresse', () => ({
  geocoder: mocks.geocoder,
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

import { dispatchLead } from '@/app/actions/dispatch'

beforeEach(() => {
  vi.clearAllMocks()
  mocks.geocoder.mockResolvedValue(null)
  mocks.sendLeadAlert.mockResolvedValue({ success: true, data: { results: [] } })
})

describe('dispatchLead lead alert wiring', () => {
  it('alerts assigned providers with lead context', async () => {
    mocks.rpc.mockResolvedValue({ data: [PROVIDER_A, PROVIDER_B], error: null })

    const assigned = await dispatchLead(LEAD_ID, {
      serviceName: 'Plomberie',
      city: 'Lyon',
      urgency: 'urgent',
    })

    expect(assigned).toEqual([PROVIDER_A, PROVIDER_B])
    expect(mocks.sendLeadAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        provider_ids: [PROVIDER_A, PROVIDER_B],
        service: 'Plomberie',
        city: 'Lyon',
        urgency: 'urgent',
        claimedOnly: true,
      })
    )
  })

  it('no alert when dispatch returns 0 assignment', async () => {
    mocks.rpc.mockResolvedValue({ data: [], error: null })

    const assigned = await dispatchLead(LEAD_ID, { serviceName: 'Plomberie' })

    expect(assigned).toEqual([])
    expect(mocks.sendLeadAlert).not.toHaveBeenCalled()
  })

  it('no alert when RPC errors', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'boom' } })

    const assigned = await dispatchLead(LEAD_ID, { serviceName: 'Plomberie' })

    expect(assigned).toEqual([])
    expect(mocks.sendLeadAlert).not.toHaveBeenCalled()
  })

  it('alert rejection does not break dispatch', async () => {
    mocks.rpc.mockResolvedValue({ data: [PROVIDER_A], error: null })
    mocks.sendLeadAlert.mockRejectedValue(new Error('smtp down'))

    const assigned = await dispatchLead(LEAD_ID, { serviceName: 'Plomberie' })

    expect(assigned).toEqual([PROVIDER_A])
  })
})
