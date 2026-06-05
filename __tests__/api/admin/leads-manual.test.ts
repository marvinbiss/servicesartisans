/**
 * Tests — POST /api/admin/leads (manual lead creation + direct assignment)
 *
 * Covers :
 *   - 403 when requirePermission rejects
 *   - 400 invalid body (bad postal code, missing provider)
 *   - 404 provider missing or inactive
 *   - 200 success : lead + assignment created, event logged, admin action
 *     logged, artisan alerted
 *   - notify:false skips the alert
 *   - 500 when createManualLead throws
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const ADMIN_ID = '00000000-0000-0000-0000-000000000099'
const PROVIDER_ID = '11111111-1111-4111-8111-111111111111'
const LEAD_ID = '22222222-2222-4222-8222-222222222222'
const ASSIGNMENT_ID = '33333333-3333-4333-8333-333333333333'

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  logAdminAction: vi.fn(),
  createManualLead: vi.fn(),
  logLeadEvent: vi.fn(),
  sendLeadAlert: vi.fn(),
  providerFetch: vi.fn(),
}))

vi.mock('@/lib/admin-auth', () => ({
  requirePermission: mocks.requirePermission,
  logAdminAction: mocks.logAdminAction,
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/services/leads-service', () => ({
  getAdminLeadCounts: vi.fn(),
  getActiveArtisans: vi.fn(),
  createManualLead: mocks.createManualLead,
  logLeadEvent: mocks.logLeadEvent,
}))

vi.mock('@/lib/services/notifications-service', () => ({
  sendLeadAlert: mocks.sendLeadAlert,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => mocks.providerFetch(),
        }),
      }),
    }),
  }),
}))

import { POST } from '@/app/api/admin/leads/route'

const VALID_BODY = {
  providerId: PROVIDER_ID,
  serviceName: 'Plomberie',
  city: 'Lyon',
  postalCode: '69001',
  description: 'Fuite sous évier à réparer rapidement',
  urgency: 'urgent',
  clientName: 'Jean Dupont',
  clientEmail: 'jean@example.com',
  clientPhone: '0612345678',
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/admin/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.requirePermission.mockResolvedValue({ success: true, admin: { id: ADMIN_ID } })
  mocks.providerFetch.mockResolvedValue({
    data: { id: PROVIDER_ID, name: 'Artisan Test', is_active: true },
  })
  mocks.createManualLead.mockResolvedValue({ leadId: LEAD_ID, assignmentId: ASSIGNMENT_ID })
  mocks.logLeadEvent.mockResolvedValue(undefined)
  mocks.logAdminAction.mockResolvedValue(undefined)
  mocks.sendLeadAlert.mockResolvedValue({ success: true, data: { results: [] } })
})

describe('POST /api/admin/leads', () => {
  it('403 when permission rejected', async () => {
    mocks.requirePermission.mockResolvedValue({
      success: false,
      error: new Response(null, { status: 403 }),
    })
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(403)
    expect(mocks.createManualLead).not.toHaveBeenCalled()
  })

  it('400 on invalid postal code', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, postalCode: 'ABC' }))
    expect(res.status).toBe(400)
    expect(mocks.createManualLead).not.toHaveBeenCalled()
  })

  it('400 on missing providerId', async () => {
    const { providerId: _omit, ...rest } = VALID_BODY
    const res = await POST(makeRequest(rest))
    expect(res.status).toBe(400)
  })

  it('404 when provider inactive', async () => {
    mocks.providerFetch.mockResolvedValue({
      data: { id: PROVIDER_ID, name: 'Artisan Test', is_active: false },
    })
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(404)
    expect(mocks.createManualLead).not.toHaveBeenCalled()
  })

  it('404 when provider missing', async () => {
    mocks.providerFetch.mockResolvedValue({ data: null })
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(404)
  })

  it('200 success : creates lead, logs, alerts artisan', async () => {
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.leadId).toBe(LEAD_ID)
    expect(json.assignmentId).toBe(ASSIGNMENT_ID)

    expect(mocks.createManualLead).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ providerId: PROVIDER_ID, serviceName: 'Plomberie' })
    )
    expect(mocks.logLeadEvent).toHaveBeenCalledWith(
      LEAD_ID,
      'dispatched',
      expect.objectContaining({ providerId: PROVIDER_ID, actorId: ADMIN_ID })
    )
    expect(mocks.logAdminAction).toHaveBeenCalledWith(
      ADMIN_ID,
      'manual_lead_create',
      'devis_request',
      LEAD_ID,
      expect.objectContaining({ providerId: PROVIDER_ID })
    )
    expect(mocks.sendLeadAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        provider_ids: [PROVIDER_ID],
        service: 'Plomberie',
        city: 'Lyon',
        client_name: 'Jean Dupont',
      })
    )
  })

  it('notify:false skips the alert', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, notify: false }))
    expect(res.status).toBe(200)
    expect(mocks.sendLeadAlert).not.toHaveBeenCalled()
  })

  it('500 when createManualLead throws', async () => {
    mocks.createManualLead.mockRejectedValue(new Error('boom'))
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(500)
    expect(mocks.sendLeadAlert).not.toHaveBeenCalled()
  })
})
