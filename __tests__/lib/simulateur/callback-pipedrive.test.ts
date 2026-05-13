/**
 * Tests — src/lib/simulateur/callback-pipedrive.ts
 *
 * Coverage:
 *   - isCallbackPipedriveConfigured: true/false based on env vars
 *   - buildNote HTML escaping (via createCallbackRequest flow)
 *   - pdFetch: AbortSignal.timeout, non-ok response throws, success:false throws
 *   - createCallbackRequest: full happy path, person create path, deal create path
 *   - Note failure → throws; Activity failure → warn + still returns
 *   - Missing config → throws "not configured"
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mock logger ─────────────────────────────────────────────────────
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

import { logger } from '@/lib/logger'
import {
  isCallbackPipedriveConfigured,
  createCallbackRequest,
  type CallbackPayload,
} from '@/lib/simulateur/callback-pipedrive'

// ── Env helpers ─────────────────────────────────────────────────────

function setEnv() {
  process.env.PIPEDRIVE_API_TOKEN = 'test-token'
  process.env.PIPEDRIVE_COMPANY_DOMAIN = 'testco'
  process.env.PIPEDRIVE_PIPELINE_SIMULATEUR = '42'
  process.env.PIPEDRIVE_STAGE_SIMULATEUR = '7'
}

function clearEnv() {
  delete process.env.PIPEDRIVE_API_TOKEN
  delete process.env.PIPEDRIVE_COMPANY_DOMAIN
  delete process.env.PIPEDRIVE_PIPELINE_SIMULATEUR
  delete process.env.PIPEDRIVE_STAGE_SIMULATEUR
}

// ── Fetch mock helpers ───────────────────────────────────────────────

type FetchHandler = (
  url: string,
  init?: RequestInit
) => {
  ok: boolean
  status?: number
  statusText?: string
  body: unknown
}

function installFetchMock(handler: FetchHandler): {
  calls: Array<{ url: string; init?: RequestInit }>
} {
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const mock = vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url, init })
    const res = handler(url, init)
    return {
      ok: res.ok,
      status: res.status ?? (res.ok ? 200 : 400),
      statusText: res.statusText ?? (res.ok ? 'OK' : 'Bad Request'),
      json: async () => res.body,
    } as unknown as Response
  })
  ;(globalThis as Record<string, unknown>).fetch = mock
  return { calls }
}

// ── Standard payload ─────────────────────────────────────────────────

function makePayload(overrides: Partial<CallbackPayload> = {}): CallbackPayload {
  return {
    publicId: 'EST-2026-ABC',
    prenom: 'Marie',
    nom: 'Curie',
    email: 'marie.curie@example.fr',
    telephone: '+33612345678',
    preferredSlot: 'Mardi 14h-16h',
    remarquesClient: 'Je suis disponible en semaine',
    ...overrides,
  }
}

// Standard fetch handler: person exists, deal exists
function happyHandler(url: string) {
  if (url.includes('/persons/search')) {
    return { ok: true, body: { success: true, data: { items: [{ item: { id: 101 } }] } } }
  }
  if (url.includes('/deals/search')) {
    return {
      ok: true,
      body: { success: true, data: { items: [{ item: { id: 202, pipeline_id: 42 } }] } },
    }
  }
  if (url.includes('/notes')) {
    return { ok: true, body: { success: true, data: { id: 303 } } }
  }
  if (url.includes('/activities')) {
    return { ok: true, body: { success: true, data: { id: 404 } } }
  }
  return { ok: false, body: { success: false, error: 'unmatched url' } }
}

beforeEach(() => {
  setEnv()
  vi.clearAllMocks()
})

afterEach(() => {
  clearEnv()
  vi.restoreAllMocks()
})

// ======================================================================
// isCallbackPipedriveConfigured
// ======================================================================

describe('isCallbackPipedriveConfigured', () => {
  it('returns true when all required env vars are set', () => {
    expect(isCallbackPipedriveConfigured()).toBe(true)
  })

  it('returns false when PIPEDRIVE_API_TOKEN missing', () => {
    delete process.env.PIPEDRIVE_API_TOKEN
    expect(isCallbackPipedriveConfigured()).toBe(false)
  })

  it('returns false when PIPEDRIVE_COMPANY_DOMAIN missing', () => {
    delete process.env.PIPEDRIVE_COMPANY_DOMAIN
    expect(isCallbackPipedriveConfigured()).toBe(false)
  })

  it('returns false when PIPEDRIVE_PIPELINE_SIMULATEUR missing', () => {
    delete process.env.PIPEDRIVE_PIPELINE_SIMULATEUR
    expect(isCallbackPipedriveConfigured()).toBe(false)
  })

  it('returns false when PIPEDRIVE_PIPELINE_SIMULATEUR is non-numeric', () => {
    process.env.PIPEDRIVE_PIPELINE_SIMULATEUR = 'bad-value'
    expect(isCallbackPipedriveConfigured()).toBe(false)
  })

  it('returns false when PIPEDRIVE_PIPELINE_SIMULATEUR is zero', () => {
    process.env.PIPEDRIVE_PIPELINE_SIMULATEUR = '0'
    expect(isCallbackPipedriveConfigured()).toBe(false)
  })
})

// ======================================================================
// buildNote — HTML escaping via note content verification
// ======================================================================

describe('buildNote HTML escaping (via note POST body)', () => {
  it('escapes < and > in publicId', async () => {
    const { calls } = installFetchMock(happyHandler)
    await createCallbackRequest(makePayload({ publicId: '<script>xss</script>' }))

    const noteCall = calls.find((c) => c.url.includes('/notes'))
    expect(noteCall).toBeDefined()
    const body = JSON.parse(noteCall!.init!.body as string)
    expect(body.content).toContain('&lt;script&gt;')
    expect(body.content).not.toContain('<script>')
  })

  it('escapes & in fields', async () => {
    const { calls } = installFetchMock(happyHandler)
    await createCallbackRequest(makePayload({ publicId: 'EST&2026' }))

    const noteCall = calls.find((c) => c.url.includes('/notes'))
    const body = JSON.parse(noteCall!.init!.body as string)
    expect(body.content).toContain('EST&amp;2026')
    expect(body.content).not.toContain('EST&2026')
  })

  it('escapes double quotes in preferredSlot', async () => {
    const { calls } = installFetchMock(happyHandler)
    await createCallbackRequest(makePayload({ preferredSlot: '"Lundi matin"' }))

    const noteCall = calls.find((c) => c.url.includes('/notes'))
    const body = JSON.parse(noteCall!.init!.body as string)
    expect(body.content).toContain('&quot;Lundi matin&quot;')
  })

  it('escapes single quotes in remarquesClient', async () => {
    const { calls } = installFetchMock(happyHandler)
    await createCallbackRequest(makePayload({ remarquesClient: "L'après-midi c'est bien" }))

    const noteCall = calls.find((c) => c.url.includes('/notes'))
    const body = JSON.parse(noteCall!.init!.body as string)
    expect(body.content).toContain('&#39;')
  })

  it('escapes > in telephone', async () => {
    const { calls } = installFetchMock(happyHandler)
    await createCallbackRequest(makePayload({ telephone: '+33>6123' }))

    const noteCall = calls.find((c) => c.url.includes('/notes'))
    const body = JSON.parse(noteCall!.init!.body as string)
    expect(body.content).toContain('&gt;')
  })

  it('note includes preferredSlot when provided', async () => {
    const { calls } = installFetchMock(happyHandler)
    await createCallbackRequest(makePayload({ preferredSlot: 'Vendredi 9h-11h' }))

    const noteCall = calls.find((c) => c.url.includes('/notes'))
    const body = JSON.parse(noteCall!.init!.body as string)
    expect(body.content).toContain('Vendredi 9h-11h')
  })

  it('note omits preferredSlot line when null', async () => {
    const { calls } = installFetchMock(happyHandler)
    await createCallbackRequest(makePayload({ preferredSlot: null, remarquesClient: null }))

    const noteCall = calls.find((c) => c.url.includes('/notes'))
    const body = JSON.parse(noteCall!.init!.body as string)
    expect(body.content).not.toContain('Créneau')
    expect(body.content).not.toContain('Remarques')
  })
})

// ======================================================================
// pdFetch — network error handling
// ======================================================================

describe('pdFetch HTTP error handling', () => {
  it('non-ok HTTP response → throws with status', async () => {
    installFetchMock((url) => {
      if (url.includes('/persons/search')) {
        return {
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          body: { success: false, error: 'rate limited' },
        }
      }
      return { ok: true, body: { success: true, data: null } }
    })

    await expect(createCallbackRequest(makePayload())).rejects.toThrow('429')
  })

  it('success:false in response body → throws', async () => {
    installFetchMock((url) => {
      if (url.includes('/persons/search')) {
        return { ok: true, status: 200, body: { success: false, error: 'API error' } }
      }
      return { ok: true, body: { success: true, data: null } }
    })

    await expect(createCallbackRequest(makePayload())).rejects.toThrow()
  })

  it('fetch includes AbortSignal on calls', async () => {
    const { calls } = installFetchMock(happyHandler)
    await createCallbackRequest(makePayload())

    // Every fetch call should carry a signal
    for (const call of calls) {
      expect(call.init?.signal).toBeDefined()
    }
  })
})

// ======================================================================
// createCallbackRequest — happy path
// ======================================================================

describe('createCallbackRequest — happy path', () => {
  it('findPerson returns id → findDeal returns id → note+activity called → returns {personId, dealId}', async () => {
    const { calls } = installFetchMock(happyHandler)

    const result = await createCallbackRequest(makePayload())

    expect(result).toEqual({ personId: 101, dealId: 202 })

    const noteCall = calls.find((c) => c.url.includes('/notes'))
    expect(noteCall).toBeDefined()

    const activityCall = calls.find((c) => c.url.includes('/activities'))
    expect(activityCall).toBeDefined()
  })

  it('note POST body includes deal_id', async () => {
    const { calls } = installFetchMock(happyHandler)
    await createCallbackRequest(makePayload())

    const noteCall = calls.find((c) => c.url.includes('/notes'))
    const body = JSON.parse(noteCall!.init!.body as string)
    expect(body.deal_id).toBe(202)
  })

  it('activity POST body includes deal_id, person_id, type=call', async () => {
    const { calls } = installFetchMock(happyHandler)
    await createCallbackRequest(makePayload())

    const actCall = calls.find((c) => c.url.includes('/activities'))
    const body = JSON.parse(actCall!.init!.body as string)
    expect(body.deal_id).toBe(202)
    expect(body.person_id).toBe(101)
    expect(body.type).toBe('call')
  })
})

// ======================================================================
// createCallbackRequest — person creation
// ======================================================================

describe('createCallbackRequest — person creation when not found', () => {
  it('findPerson returns null → createPerson called → proceeds normally', async () => {
    const { calls } = installFetchMock((url, init) => {
      if (url.includes('/persons/search')) {
        return { ok: true, body: { success: true, data: { items: [] } } }
      }
      if (url.includes('/persons') && init?.method === 'POST') {
        return { ok: true, body: { success: true, data: { id: 555 } } }
      }
      if (url.includes('/deals/search')) {
        return {
          ok: true,
          body: { success: true, data: { items: [{ item: { id: 666, pipeline_id: 42 } }] } },
        }
      }
      if (url.includes('/notes')) {
        return { ok: true, body: { success: true, data: { id: 777 } } }
      }
      if (url.includes('/activities')) {
        return { ok: true, body: { success: true, data: { id: 888 } } }
      }
      return { ok: false, body: { success: false } }
    })

    const result = await createCallbackRequest(makePayload())

    expect(result.personId).toBe(555)
    const personPost = calls.find((c) => c.url.endsWith('/persons') && c.init?.method === 'POST')
    expect(personPost).toBeDefined()
  })

  it('person create body includes name, email, phone', async () => {
    const { calls } = installFetchMock((url, init) => {
      if (url.includes('/persons/search')) {
        return { ok: true, body: { success: true, data: { items: [] } } }
      }
      if (url.includes('/persons') && init?.method === 'POST') {
        return { ok: true, body: { success: true, data: { id: 555 } } }
      }
      if (url.includes('/deals/search')) {
        return {
          ok: true,
          body: { success: true, data: { items: [{ item: { id: 666, pipeline_id: 42 } }] } },
        }
      }
      if (url.includes('/notes') || url.includes('/activities')) {
        return { ok: true, body: { success: true, data: { id: 1 } } }
      }
      return { ok: false, body: { success: false } }
    })

    await createCallbackRequest(makePayload({ prenom: 'Jean', nom: 'Dupont', telephone: '+33699' }))

    const personPost = calls.find((c) => c.url.endsWith('/persons') && c.init?.method === 'POST')
    const body = JSON.parse(personPost!.init!.body as string)
    expect(body.name).toContain('Jean')
    expect(body.email[0].value).toBe('marie.curie@example.fr')
    expect(body.phone[0].value).toBe('+33699')
  })
})

// ======================================================================
// createCallbackRequest — deal creation
// ======================================================================

describe('createCallbackRequest — deal creation when not found', () => {
  it('findDeal returns null → createCallbackDeal called', async () => {
    const { calls } = installFetchMock((url, init) => {
      if (url.includes('/persons/search')) {
        return { ok: true, body: { success: true, data: { items: [{ item: { id: 101 } }] } } }
      }
      if (url.includes('/deals/search')) {
        return { ok: true, body: { success: true, data: { items: [] } } }
      }
      if (url.includes('/deals') && init?.method === 'POST') {
        return { ok: true, body: { success: true, data: { id: 999 } } }
      }
      if (url.includes('/notes') || url.includes('/activities')) {
        return { ok: true, body: { success: true, data: { id: 1 } } }
      }
      return { ok: false, body: { success: false } }
    })

    const result = await createCallbackRequest(makePayload())

    expect(result.dealId).toBe(999)
    const dealPost = calls.find((c) => c.url.endsWith('/deals') && c.init?.method === 'POST')
    expect(dealPost).toBeDefined()
  })

  it('createCallbackDeal body includes [RAPPEL] in title', async () => {
    const { calls } = installFetchMock((url, init) => {
      if (url.includes('/persons/search')) {
        return { ok: true, body: { success: true, data: { items: [{ item: { id: 101 } }] } } }
      }
      if (url.includes('/deals/search')) {
        return { ok: true, body: { success: true, data: { items: [] } } }
      }
      if (url.includes('/deals') && init?.method === 'POST') {
        return { ok: true, body: { success: true, data: { id: 999 } } }
      }
      if (url.includes('/notes') || url.includes('/activities')) {
        return { ok: true, body: { success: true, data: { id: 1 } } }
      }
      return { ok: false, body: { success: false } }
    })

    await createCallbackRequest(makePayload())

    const dealPost = calls.find((c) => c.url.endsWith('/deals') && c.init?.method === 'POST')
    const body = JSON.parse(dealPost!.init!.body as string)
    expect(body.title).toContain('[RAPPEL]')
    expect(body.pipeline_id).toBe(42)
    expect(body.currency).toBe('EUR')
  })
})

// ======================================================================
// createCallbackRequest — failure modes
// ======================================================================

describe('createCallbackRequest — note failure is hard error', () => {
  it('note fails → throws (note is critical)', async () => {
    installFetchMock((url) => {
      if (url.includes('/persons/search')) {
        return { ok: true, body: { success: true, data: { items: [{ item: { id: 101 } }] } } }
      }
      if (url.includes('/deals/search')) {
        return {
          ok: true,
          body: { success: true, data: { items: [{ item: { id: 202, pipeline_id: 42 } }] } },
        }
      }
      if (url.includes('/notes')) {
        return { ok: false, status: 500, body: { success: false, error: 'note failed' } }
      }
      if (url.includes('/activities')) {
        return { ok: true, body: { success: true, data: { id: 1 } } }
      }
      return { ok: false, body: { success: false } }
    })

    await expect(createCallbackRequest(makePayload())).rejects.toThrow()
  })
})

describe('createCallbackRequest — activity failure is soft warning', () => {
  it('activity fails → warn logged, still returns {personId, dealId} successfully', async () => {
    installFetchMock((url) => {
      if (url.includes('/persons/search')) {
        return { ok: true, body: { success: true, data: { items: [{ item: { id: 101 } }] } } }
      }
      if (url.includes('/deals/search')) {
        return {
          ok: true,
          body: { success: true, data: { items: [{ item: { id: 202, pipeline_id: 42 } }] } },
        }
      }
      if (url.includes('/notes')) {
        return { ok: true, body: { success: true, data: { id: 303 } } }
      }
      if (url.includes('/activities')) {
        return { ok: false, status: 422, body: { success: false, error: 'activity error' } }
      }
      return { ok: false, body: { success: false } }
    })

    const result = await createCallbackRequest(makePayload())

    expect(result).toEqual({ personId: 101, dealId: 202 })
    expect(logger.warn).toHaveBeenCalled()
  })
})

describe('createCallbackRequest — missing config', () => {
  it('missing env config → throws "not configured"', async () => {
    clearEnv()

    await expect(createCallbackRequest(makePayload())).rejects.toThrow(/not configured/i)
  })
})

describe('createCallbackRequest — custom fields & phone fallback', () => {
  it('injects source="callback-simulateur" on NEW deal when PIPEDRIVE_FIELD_SOURCE is set', async () => {
    process.env.PIPEDRIVE_FIELD_SOURCE = 'cf_source_key'
    const { calls } = installFetchMock((url) => {
      if (url.includes('/persons/search')) {
        return { ok: true, body: { success: true, data: { items: [{ item: { id: 101 } }] } } }
      }
      // No existing deal → forces createCallbackDeal path
      if (url.includes('/deals/search')) {
        return { ok: true, body: { success: true, data: { items: [] } } }
      }
      if (url.includes('/deals') && !url.includes('search')) {
        return { ok: true, body: { success: true, data: { id: 999 } } }
      }
      if (url.includes('/notes')) return { ok: true, body: { success: true, data: { id: 303 } } }
      if (url.includes('/activities'))
        return { ok: true, body: { success: true, data: { id: 404 } } }
      return { ok: false, body: { success: false } }
    })
    await createCallbackRequest(makePayload())
    const dealCreate = calls.find((c) => c.url.endsWith('/deals') && c.init?.method === 'POST')
    expect(dealCreate).toBeDefined()
    const body = JSON.parse(dealCreate!.init!.body as string)
    expect(body.cf_source_key).toBe('callback-simulateur')
    delete process.env.PIPEDRIVE_FIELD_SOURCE
  })

  it('falls back to phone search when email search returns no match', async () => {
    const { calls } = installFetchMock((url) => {
      if (url.includes('/persons/search') && url.includes('fields=email')) {
        return { ok: true, body: { success: true, data: { items: [] } } }
      }
      if (url.includes('/persons/search') && url.includes('fields=phone')) {
        return { ok: true, body: { success: true, data: { items: [{ item: { id: 8888 } }] } } }
      }
      if (url.includes('/persons') && !url.includes('search')) {
        throw new Error('Should NOT create Person when phone matches')
      }
      if (url.includes('/deals/search')) {
        return {
          ok: true,
          body: { success: true, data: { items: [{ item: { id: 202, pipeline_id: 42 } }] } },
        }
      }
      if (url.includes('/notes')) return { ok: true, body: { success: true, data: { id: 303 } } }
      if (url.includes('/activities'))
        return { ok: true, body: { success: true, data: { id: 404 } } }
      return { ok: false, body: { success: false } }
    })
    const result = await createCallbackRequest(makePayload())
    expect(result.personId).toBe(8888)
    const searches = calls.filter((c) => c.url.includes('/persons/search'))
    expect(searches).toHaveLength(2)
    expect(searches[0].url).toContain('fields=email')
    expect(searches[1].url).toContain('fields=phone')
  })
})
