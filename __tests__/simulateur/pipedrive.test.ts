/**
 * Tests — src/lib/simulateur/pipedrive.ts
 * Coverage:
 *   - createSimulateurDeal field mapping (Person + Deal + Note)
 *   - Idempotence Person (existing email → reuse id, no create POST)
 *   - computeNextSimRetryAt exponential backoff capped at 24h
 *   - Error thrown when Pipedrive returns failure
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  createSimulateurDeal,
  computeNextSimRetryAt,
  isSimulateurPipedriveConfigured,
  MAX_SIM_SYNC_ATTEMPTS,
  type SimulateurLeadInput,
} from '@/lib/simulateur/pipedrive'
import type { BaremeId } from '@/lib/simulateur/types'

// ── Helpers ────────────────────────────────────────────────────────

const asBareme = (s: string) => s as BaremeId

function mockLead(): SimulateurLeadInput {
  return {
    publicId: 'EST-2026-04-14-abc123',
    prenom: 'Jean',
    nom: 'Dupont',
    email: 'jean.dupont@example.fr',
    telephone: '+33612345678',
    estimation: {
      publicId: 'EST-2026-04-14-abc123',
      categorieAnah: 'jaune',
      zoneClimatique: 'H1',
      parcours: 'geste',
      gestes: [
        {
          id: 'PAC_AIREAU',
          label: 'PAC air/eau',
          forfait: 4000,
          baremeId: asBareme('MPR.PAC_AIREAU.JAUNE.2026-01'),
        },
      ],
      baremeIds: [asBareme('MPR.PAC_AIREAU.JAUNE.2026-01'), asBareme('CEE.BAR-TH-171.H1.2026-01')],
      mprTotal: 4000,
      ceeFourchetteBas: 3200,
      ceeFourchetteHaut: 5400,
      coupPouceEstimation: 2000,
      resteAChargeBas: 6200,
      resteAChargeHaut: 8400,
      barometreVersion: '2026-01-14',
      codePostal: '75001',
      surface: 80,
      rfr: 28000,
    },
  }
}

type FetchCall = { url: string; init?: RequestInit }
type FetchHandler = (
  url: string,
  init?: RequestInit
) => { ok: boolean; status?: number; body: unknown }

function installFetchMock(handler: FetchHandler): { calls: FetchCall[] } {
  const calls: FetchCall[] = []
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url, init })
    const res = handler(url, init)
    return {
      ok: res.ok,
      status: res.status ?? (res.ok ? 200 : 500),
      statusText: res.ok ? 'OK' : 'Error',
      json: async () => res.body,
    } as unknown as Response
  })
  ;(globalThis as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch
  return { calls }
}

// ── Setup env ──────────────────────────────────────────────────────

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  process.env.PIPEDRIVE_API_TOKEN = 'test-token'
  process.env.PIPEDRIVE_COMPANY_DOMAIN = 'testco'
  process.env.PIPEDRIVE_PIPELINE_SIMULATEUR = '42'
  process.env.PIPEDRIVE_STAGE_SIMULATEUR = '7'
})

afterEach(() => {
  vi.restoreAllMocks()
  process.env = { ...ORIGINAL_ENV }
})

// ── Tests: backoff ─────────────────────────────────────────────────

describe('computeNextSimRetryAt', () => {
  const NOW = new Date('2026-04-14T12:00:00Z')

  it('1 attempt → +2h', () => {
    const next = computeNextSimRetryAt(1, NOW)
    expect(next.getTime() - NOW.getTime()).toBe(2 * 60 * 60 * 1000)
  })

  it('2 attempts → +4h', () => {
    expect(computeNextSimRetryAt(2, NOW).getTime() - NOW.getTime()).toBe(4 * 60 * 60 * 1000)
  })

  it('3 attempts → +8h', () => {
    expect(computeNextSimRetryAt(3, NOW).getTime() - NOW.getTime()).toBe(8 * 60 * 60 * 1000)
  })

  it('4 attempts → +16h', () => {
    expect(computeNextSimRetryAt(4, NOW).getTime() - NOW.getTime()).toBe(16 * 60 * 60 * 1000)
  })

  it('5 attempts → capped at 24h (2^5 = 32h would exceed)', () => {
    expect(computeNextSimRetryAt(5, NOW).getTime() - NOW.getTime()).toBe(24 * 60 * 60 * 1000)
  })

  it('10 attempts → still capped at 24h', () => {
    expect(computeNextSimRetryAt(10, NOW).getTime() - NOW.getTime()).toBe(24 * 60 * 60 * 1000)
  })

  it('MAX_SIM_SYNC_ATTEMPTS is 5', () => {
    expect(MAX_SIM_SYNC_ATTEMPTS).toBe(5)
  })
})

// ── Tests: configuration ───────────────────────────────────────────

describe('isSimulateurPipedriveConfigured', () => {
  it('true when all 3 env vars present', () => {
    expect(isSimulateurPipedriveConfigured()).toBe(true)
  })

  it('false when token missing', () => {
    delete process.env.PIPEDRIVE_API_TOKEN
    expect(isSimulateurPipedriveConfigured()).toBe(false)
  })

  it('false when pipeline id missing', () => {
    delete process.env.PIPEDRIVE_PIPELINE_SIMULATEUR
    expect(isSimulateurPipedriveConfigured()).toBe(false)
  })

  it('false when pipeline id is non-numeric', () => {
    process.env.PIPEDRIVE_PIPELINE_SIMULATEUR = 'not-a-number'
    expect(isSimulateurPipedriveConfigured()).toBe(false)
  })
})

// ── Tests: createSimulateurDeal ────────────────────────────────────

describe('createSimulateurDeal — field mapping & flow', () => {
  it('creates Person + Deal + Note with expected payload', async () => {
    const { calls } = installFetchMock((url) => {
      if (url.includes('/persons/search')) {
        return { ok: true, body: { success: true, data: { items: [] } } }
      }
      if (url.includes('/persons') && !url.includes('search')) {
        return { ok: true, body: { success: true, data: { id: 1001 } } }
      }
      if (url.includes('/deals')) {
        return { ok: true, body: { success: true, data: { id: 2002 } } }
      }
      if (url.includes('/notes')) {
        return { ok: true, body: { success: true, data: { id: 3003 } } }
      }
      return { ok: false, body: { success: false, error: 'unknown path' } }
    })

    const result = await createSimulateurDeal(mockLead())
    expect(result).toEqual({ personId: 1001, dealId: 2002 })

    // Verify call sequence: search → create person → create deal → note
    expect(calls[0].url).toContain('/persons/search')
    expect(calls[0].url).toContain('jean.dupont%40example.fr')

    const personCreate = calls.find((c) => c.url.endsWith('/persons') && c.init?.method === 'POST')
    expect(personCreate).toBeDefined()
    const personBody = JSON.parse(personCreate!.init!.body as string)
    expect(personBody.name).toBe('Jean Dupont')
    expect(personBody.email[0].value).toBe('jean.dupont@example.fr')
    expect(personBody.phone[0].value).toBe('+33612345678')

    const dealCreate = calls.find((c) => c.url.endsWith('/deals') && c.init?.method === 'POST')
    expect(dealCreate).toBeDefined()
    const dealBody = JSON.parse(dealCreate!.init!.body as string)
    expect(dealBody.person_id).toBe(1001)
    expect(dealBody.pipeline_id).toBe(42)
    expect(dealBody.stage_id).toBe(7)
    expect(dealBody.currency).toBe('EUR')
    // value = mpr + ceeHaut + cdp = 4000 + 5400 + 2000 = 11400
    expect(dealBody.value).toBe(11400)
    expect(dealBody.title).toContain('Jean Dupont')
    expect(dealBody.title).toContain('75001')

    const noteCreate = calls.find((c) => c.url.endsWith('/notes') && c.init?.method === 'POST')
    expect(noteCreate).toBeDefined()
    const noteBody = JSON.parse(noteCreate!.init!.body as string)
    expect(noteBody.deal_id).toBe(2002)
    expect(noteBody.content).toContain('EST-2026-04-14-abc123')
    expect(noteBody.content).toContain('2026-01-14')
    expect(noteBody.content).toContain('MPR.PAC_AIREAU.JAUNE.2026-01')
    expect(noteBody.content).toContain('jaune')
  })

  it('idempotent Person: existing email → reuse id, no Person create POST', async () => {
    const { calls } = installFetchMock((url, init) => {
      if (url.includes('/persons/search')) {
        return {
          ok: true,
          body: { success: true, data: { items: [{ item: { id: 9999 } }] } },
        }
      }
      if (url.includes('/persons') && init?.method === 'POST') {
        throw new Error('Person POST should not happen when email exists')
      }
      if (url.includes('/deals')) {
        return { ok: true, body: { success: true, data: { id: 2002 } } }
      }
      if (url.includes('/notes')) {
        return { ok: true, body: { success: true, data: { id: 3003 } } }
      }
      return { ok: false, body: { success: false, error: 'unknown' } }
    })

    const result = await createSimulateurDeal(mockLead())
    expect(result.personId).toBe(9999)
    expect(result.dealId).toBe(2002)

    const personPosts = calls.filter((c) => c.url.endsWith('/persons') && c.init?.method === 'POST')
    expect(personPosts).toHaveLength(0)
  })

  it('throws when Pipedrive Deal creation fails — DLQ insert is caller responsibility', async () => {
    installFetchMock((url) => {
      if (url.includes('/persons/search')) {
        return { ok: true, body: { success: true, data: { items: [] } } }
      }
      if (url.includes('/persons')) {
        return { ok: true, body: { success: true, data: { id: 1001 } } }
      }
      if (url.includes('/deals')) {
        return { ok: false, status: 500, body: { success: false, error: 'Pipedrive 500' } }
      }
      return { ok: true, body: { success: true, data: {} } }
    })

    await expect(createSimulateurDeal(mockLead())).rejects.toThrow(/Pipedrive .*deals.* failed/)
  })

  it('note failure does NOT fail the whole sync (deal is what matters)', async () => {
    installFetchMock((url) => {
      if (url.includes('/persons/search')) {
        return { ok: true, body: { success: true, data: { items: [] } } }
      }
      if (url.includes('/persons')) {
        return { ok: true, body: { success: true, data: { id: 1001 } } }
      }
      if (url.includes('/deals')) {
        return { ok: true, body: { success: true, data: { id: 2002 } } }
      }
      if (url.includes('/notes')) {
        return { ok: false, status: 500, body: { success: false, error: 'note failed' } }
      }
      return { ok: false, body: { success: false } }
    })

    const result = await createSimulateurDeal(mockLead())
    expect(result).toEqual({ personId: 1001, dealId: 2002 })
  })

  it('throws when not configured', async () => {
    delete process.env.PIPEDRIVE_PIPELINE_SIMULATEUR
    await expect(createSimulateurDeal(mockLead())).rejects.toThrow(/not configured/)
  })
})

// ── Tests: custom fields (source + postal_code) ────────────────────

describe('createSimulateurDeal — custom fields', () => {
  it('injects source="simulateur-aides" when PIPEDRIVE_FIELD_SOURCE is set', async () => {
    process.env.PIPEDRIVE_FIELD_SOURCE = 'cf_source_key'
    const { calls } = installFetchMock((url) => {
      if (url.includes('/persons/search'))
        return { ok: true, body: { success: true, data: { items: [] } } }
      if (url.includes('/persons')) return { ok: true, body: { success: true, data: { id: 1 } } }
      if (url.includes('/deals')) return { ok: true, body: { success: true, data: { id: 2 } } }
      if (url.includes('/notes')) return { ok: true, body: { success: true, data: { id: 3 } } }
      return { ok: false, body: { success: false } }
    })
    await createSimulateurDeal(mockLead())
    const dealCreate = calls.find((c) => c.url.endsWith('/deals') && c.init?.method === 'POST')
    const dealBody = JSON.parse(dealCreate!.init!.body as string)
    expect(dealBody.cf_source_key).toBe('simulateur-aides')
  })

  it('injects postal_code from estimation.codePostal when PIPEDRIVE_FIELD_POSTAL_CODE is set', async () => {
    process.env.PIPEDRIVE_FIELD_POSTAL_CODE = 'cf_cp_key'
    const { calls } = installFetchMock((url) => {
      if (url.includes('/persons/search'))
        return { ok: true, body: { success: true, data: { items: [] } } }
      if (url.includes('/persons')) return { ok: true, body: { success: true, data: { id: 1 } } }
      if (url.includes('/deals')) return { ok: true, body: { success: true, data: { id: 2 } } }
      if (url.includes('/notes')) return { ok: true, body: { success: true, data: { id: 3 } } }
      return { ok: false, body: { success: false } }
    })
    await createSimulateurDeal(mockLead())
    const dealCreate = calls.find((c) => c.url.endsWith('/deals') && c.init?.method === 'POST')
    const dealBody = JSON.parse(dealCreate!.init!.body as string)
    expect(dealBody.cf_cp_key).toBe('75001')
  })

  it('omits custom fields when env vars not configured (opt-in)', async () => {
    const { calls } = installFetchMock((url) => {
      if (url.includes('/persons/search'))
        return { ok: true, body: { success: true, data: { items: [] } } }
      if (url.includes('/persons')) return { ok: true, body: { success: true, data: { id: 1 } } }
      if (url.includes('/deals')) return { ok: true, body: { success: true, data: { id: 2 } } }
      if (url.includes('/notes')) return { ok: true, body: { success: true, data: { id: 3 } } }
      return { ok: false, body: { success: false } }
    })
    await createSimulateurDeal(mockLead())
    const dealCreate = calls.find((c) => c.url.endsWith('/deals') && c.init?.method === 'POST')
    const dealBody = JSON.parse(dealCreate!.init!.body as string)
    // Only base keys — no arbitrary custom field keys
    expect(Object.keys(dealBody).sort()).toEqual(
      ['currency', 'person_id', 'pipeline_id', 'stage_id', 'status', 'title', 'value'].sort()
    )
  })
})

// ── Tests: Person search phone fallback ────────────────────────────

describe('upsertPerson — phone fallback for cross-canal dedup', () => {
  it('falls back to phone search when email search returns no match', async () => {
    const { calls } = installFetchMock((url) => {
      if (url.includes('/persons/search') && url.includes('fields=email')) {
        return { ok: true, body: { success: true, data: { items: [] } } }
      }
      if (url.includes('/persons/search') && url.includes('fields=phone')) {
        return { ok: true, body: { success: true, data: { items: [{ item: { id: 7777 } }] } } }
      }
      if (url.includes('/persons') && !url.includes('search')) {
        throw new Error('Should NOT create Person when phone matches')
      }
      if (url.includes('/deals')) return { ok: true, body: { success: true, data: { id: 2 } } }
      if (url.includes('/notes')) return { ok: true, body: { success: true, data: { id: 3 } } }
      return { ok: false, body: { success: false } }
    })
    const result = await createSimulateurDeal(mockLead())
    expect(result.personId).toBe(7777)
    const searches = calls.filter((c) => c.url.includes('/persons/search'))
    expect(searches).toHaveLength(2)
    expect(searches[0].url).toContain('fields=email')
    expect(searches[1].url).toContain('fields=phone')
  })

  it('creates new Person when neither email nor phone matches', async () => {
    const { calls } = installFetchMock((url) => {
      if (url.includes('/persons/search')) {
        return { ok: true, body: { success: true, data: { items: [] } } }
      }
      if (url.includes('/persons')) return { ok: true, body: { success: true, data: { id: 5555 } } }
      if (url.includes('/deals')) return { ok: true, body: { success: true, data: { id: 2 } } }
      if (url.includes('/notes')) return { ok: true, body: { success: true, data: { id: 3 } } }
      return { ok: false, body: { success: false } }
    })
    const result = await createSimulateurDeal(mockLead())
    expect(result.personId).toBe(5555)
    const searches = calls.filter((c) => c.url.includes('/persons/search'))
    expect(searches).toHaveLength(2)
    const personCreate = calls.find((c) => c.url.endsWith('/persons') && c.init?.method === 'POST')
    expect(personCreate).toBeDefined()
  })
})
