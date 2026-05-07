/**
 * Tests /api/simulateur/submit
 * - consentRgpd = false bloque (422)
 * - insert OK → 201 { publicId }
 * - idempotence baremes_versions upsert (pas d'erreur si déjà présent)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

process.env.RGPD_IP_SALT = 'test-salt'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'

const upsertMock = vi.fn(async (..._args: unknown[]) => ({ error: null }))
const insertCaptured: Array<Record<string, unknown>> = []
let insertShouldFail = false
const insertMock = vi.fn((payload: Record<string, unknown>) => {
  insertCaptured.push(payload)
  return {
    select: (_col: string) => ({
      single: async () =>
        insertShouldFail
          ? { data: null, error: { message: 'insert failed' } }
          : { data: { id: 'est-uuid-1' }, error: null },
    }),
  }
})

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (_table: string) => ({
      upsert: (...args: unknown[]) => upsertMock(...args),
      insert: (payload: Record<string, unknown>) => insertMock(payload),
    }),
  }),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: () => ({ success: true, remaining: 99, resetAt: Date.now() + 60_000 }),
  getRateLimitHeaders: () => ({}),
}))

const runPipedriveHookMock = vi.fn(async (..._args: unknown[]) => {})
vi.mock('@/lib/simulateur/submit-hooks', () => ({
  runPipedriveHook: (...args: unknown[]) => runPipedriveHookMock(...args),
}))

import { POST } from '@/app/api/simulateur/submit/route'

function buildReq(body: unknown) {
  return new Request('http://localhost/api/simulateur/submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '81.64.12.5' },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0]
}

const baseBody = {
  situation: {
    typeLogement: 'maison',
    residencePrincipale: true,
    anciennete: 'plus_15_ans',
    surface: 100,
    codePostal: '75001',
    foyer: 3,
    rfr: 28_000,
  },
  projet: {
    parcours: 'geste',
    gestes: ['PAC_AIREAU'],
    coupDePouce: false,
    equipementActuel: 'gaz',
  },
  budget: { budgetHt: 15_000 },
  coordonnees: {
    prenom: 'Alice',
    nom: 'Durand',
    email: 'alice@example.com',
    telephone: '0612345678',
    consentRgpd: true,
    consentMajorite: true,
    consentDemarchage: false,
  },
}

describe('POST /api/simulateur/submit', () => {
  beforeEach(() => {
    upsertMock.mockClear()
    insertMock.mockClear()
    runPipedriveHookMock.mockClear()
    insertCaptured.length = 0
    insertShouldFail = false
  })

  it('consentRgpd = false → 422', async () => {
    const body = {
      ...baseBody,
      coordonnees: { ...baseBody.coordonnees, consentRgpd: false },
    }
    const res = await POST(buildReq(body))
    expect(res.status).toBe(422)
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('happy path → 201 + publicId + insert appelé', async () => {
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(201)
    const json = (await (res as Response).json()) as { publicId: string }
    expect(json.publicId).toMatch(/^EST-\d{4}-\d{2}-\d{2}-[a-z0-9]{6,12}$/)
    expect(insertMock).toHaveBeenCalledTimes(1)
    expect(upsertMock).toHaveBeenCalledTimes(1)
  })

  it('idempotence baremes_versions : upsert ignoreDuplicates (pas de retry DB)', async () => {
    upsertMock.mockResolvedValueOnce({ error: null })
    const res1 = await POST(buildReq(baseBody))
    const res2 = await POST(buildReq(baseBody))
    expect(res1.status).toBe(201)
    expect(res2.status).toBe(201)
    expect(upsertMock).toHaveBeenCalledTimes(2)
  })

  it('insert payload inclut budget_ht', async () => {
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(201)
    expect(insertCaptured).toHaveLength(1)
    expect(insertCaptured[0]?.budget_ht).toBe(baseBody.budget.budgetHt)
  })

  it('runPipedriveHook est appelé après insert réussi', async () => {
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(201)
    // Attendre la microtask du fire-and-forget
    await new Promise((r) => setTimeout(r, 0))
    expect(runPipedriveHookMock).toHaveBeenCalledTimes(1)
    const callArg = runPipedriveHookMock.mock.calls[0]?.[0] as {
      estimationId: string
      input: { email: string; publicId: string }
    }
    expect(callArg.estimationId).toBe('est-uuid-1')
    expect(callArg.input.email).toBe('alice@example.com')
    expect(callArg.input.publicId).toMatch(/^EST-/)
  })

  it("runPipedriveHook n'est pas appelé si INSERT échoue", async () => {
    insertShouldFail = true
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(500)
    await new Promise((r) => setTimeout(r, 0))
    expect(runPipedriveHookMock).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Schema contract — chaque colonne référencée par le payload doit exister
  // en DB. Ce test n'attrape PAS le drift code↔DB (responsabilité de
  // scripts/audit-schema-drift.mjs) — il sert de garde-fou contre une
  // suppression silencieuse d'un champ depuis le payload (qui passerait
  // sinon l'insert mock sans rien casser).
  //
  // Contexte : 2026-05-07 — bug "form rénovation énergétique ne fonctionne pas"
  // POST 500 car migrations 452+453 jamais appliquées, 12 colonnes manquantes
  // (urgence_projet, age_chaudiere, lead_score, lead_segment, confidence_*,
  // utm_*, referrer). Le test happy path ci-dessus passait quand même.
  // -------------------------------------------------------------------------
  it('payload insert contient toutes les colonnes lead scoring + UTM + Phase 2', async () => {
    const res = await POST(
      buildReq({
        ...baseBody,
        attribution: {
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'primes-cee-2026',
          utm_term: 'pompe chaleur prix',
          utm_content: 'banner-v2',
          referrer: 'https://google.com/search',
        },
        scoring: {
          urgenceProjet: 'sous_3_mois',
          ageChaudiere: '10_15_ans',
        },
      })
    )
    expect(res.status).toBe(201)
    expect(insertCaptured).toHaveLength(1)
    const payload = insertCaptured[0] as Record<string, unknown>

    // Mig 452 — confidence persistence
    expect(payload).toHaveProperty('confidence_level')
    expect(payload).toHaveProperty('confidence_breakdown')

    // Mig 452 — UTM attribution (chaque clé doit être ajoutée même si null)
    for (const k of [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'referrer',
    ]) {
      expect(payload, `missing ${k}`).toHaveProperty(k)
    }

    // Mig 452 — scoring commercial
    expect(payload).toHaveProperty('lead_score')
    expect(payload).toHaveProperty('lead_segment')

    // Mig 453 — Phase 2 signals
    expect(payload).toHaveProperty('urgence_projet')
    expect(payload).toHaveProperty('age_chaudiere')
    expect(payload.urgence_projet).toBe('sous_3_mois')
    expect(payload.age_chaudiere).toBe('10_15_ans')

    // Mig 444 — traçabilité
    expect(payload).toHaveProperty('request_id')
    expect(payload).toHaveProperty('inputs_hash')
    expect(payload).toHaveProperty('consent_text_sha256')

    // Mig 450 — aides enrichment
    expect(payload).toHaveProperty('mar_prise_en_charge')
    expect(payload).toHaveProperty('cee_ampleur')
    expect(payload).toHaveProperty('eco_ptz_eligible')
    expect(payload).toHaveProperty('par_eligible')
    expect(payload).toHaveProperty('complementaires')
    expect(payload).toHaveProperty('total_aides_bas')
    expect(payload).toHaveProperty('total_aides_haut')

    // Mig 451 — lead routing
    expect(payload).toHaveProperty('lead_priority')
    expect(payload).toHaveProperty('necessite_mar')
  })
})
