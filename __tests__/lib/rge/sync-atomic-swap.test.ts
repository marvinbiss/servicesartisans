/**
 * Tests unitaires — RGE atomic swap (migration 413)
 * ---------------------------------------------------
 * Couvre les nouveaux helpers introduits par le refactor staging + atomic swap :
 *   - stageAggregated       : truncate + batched insert via rge_stage_rows
 *   - applyStagingAtomic    : passage par la RPC rge_apply_staging_atomic
 *
 * On mocke le client Supabase au niveau RPC pour vérifier que la shape du
 * payload et les paramètres de la RPC sont conformes au contrat SQL de la
 * migration 413 — pas de vrai appel DB.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { stageAggregated, applyStagingAtomic, type AggregatedProvider } from '@/lib/rge/sync'

const mockLog: Pick<Console, 'log' | 'warn' | 'error'> = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

function makeAgg(siret: string, overrides: Partial<AggregatedProvider> = {}): AggregatedProvider {
  return {
    siret,
    qualifications: [
      {
        code: 'QB-1234',
        nom: 'Qualibat RGE',
        organisme: 'Qualibat',
        domaine: 'Enveloppe',
        meta_domaine: 'Isolation',
        date_debut: '2024-01-01',
        date_fin: '2099-12-31',
        url: null,
      },
    ],
    valid_until: '2099-12-31',
    organismes: ['Qualibat'],
    source_url: `https://france-renov.gouv.fr/annuaire-rge?siret=${siret}`,
    telephone: null,
    email: null,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// stageAggregated
// ---------------------------------------------------------------------------

describe('stageAggregated', () => {
  it('calls rge_truncate_staging then rge_stage_rows with the expected payload shape', async () => {
    const rpc = vi.fn().mockImplementation((name: string, args?: unknown) => {
      if (name === 'rge_truncate_staging') {
        return Promise.resolve({ data: null, error: null })
      }
      if (name === 'rge_stage_rows') {
        const payload = (args as { payload: unknown[] }).payload
        return Promise.resolve({ data: payload.length, error: null })
      }
      return Promise.resolve({ data: null, error: { message: `unexpected rpc ${name}` } })
    })

    const supabase = { rpc } as unknown as SupabaseClient

    const aggregated = new Map<string, AggregatedProvider>()
    aggregated.set('11111111111111', makeAgg('11111111111111'))
    aggregated.set('22222222222222', makeAgg('22222222222222', { telephone: '0612345678' }))
    aggregated.set('33333333333333', makeAgg('33333333333333', { email: 'hello@example.fr' }))

    const result = await stageAggregated(aggregated, supabase, false, mockLog)

    expect(result.staged).toBe(3)
    // truncate called first, then exactly 1 stage_rows call (slice fits in STAGE_BATCH)
    expect(rpc).toHaveBeenNthCalledWith(1, 'rge_truncate_staging')
    expect(rpc).toHaveBeenNthCalledWith(2, 'rge_stage_rows', {
      payload: expect.any(Array),
    })

    // Shape check — every row has the 7 columns the SQL recordset expects
    const payload = rpc.mock.calls[1][1].payload as Array<Record<string, unknown>>
    expect(payload).toHaveLength(3)
    for (const row of payload) {
      expect(row).toHaveProperty('siret')
      expect(row).toHaveProperty('rge_qualifications')
      expect(row).toHaveProperty('rge_valid_until')
      expect(row).toHaveProperty('rge_organismes')
      expect(row).toHaveProperty('rge_source_url')
      expect(row).toHaveProperty('ademe_telephone')
      expect(row).toHaveProperty('ademe_email')
    }
    const withPhone = payload.find((r) => r.siret === '22222222222222')
    expect(withPhone?.ademe_telephone).toBe('0612345678')
    const withEmail = payload.find((r) => r.siret === '33333333333333')
    expect(withEmail?.ademe_email).toBe('hello@example.fr')
  })

  it('skips DB calls in dry-run mode', async () => {
    const rpc = vi.fn()
    const supabase = { rpc } as unknown as SupabaseClient

    const aggregated = new Map<string, AggregatedProvider>()
    aggregated.set('11111111111111', makeAgg('11111111111111'))

    const result = await stageAggregated(aggregated, supabase, true, mockLog)

    expect(result.staged).toBe(0)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('throws if rge_truncate_staging fails', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } })
    const supabase = { rpc } as unknown as SupabaseClient

    const aggregated = new Map<string, AggregatedProvider>()
    aggregated.set('11111111111111', makeAgg('11111111111111'))

    await expect(stageAggregated(aggregated, supabase, false, mockLog)).rejects.toThrow(
      /rge_truncate_staging failed/
    )
  })

  it('throws if rge_stage_rows fails and stops after first error', async () => {
    const rpc = vi.fn().mockImplementation((name: string) => {
      if (name === 'rge_truncate_staging') return Promise.resolve({ data: null, error: null })
      return Promise.resolve({ data: null, error: { message: 'payload invalid' } })
    })
    const supabase = { rpc } as unknown as SupabaseClient

    const aggregated = new Map<string, AggregatedProvider>()
    aggregated.set('11111111111111', makeAgg('11111111111111'))

    await expect(stageAggregated(aggregated, supabase, false, mockLog)).rejects.toThrow(
      /rge_stage_rows failed/
    )
  })
})

// ---------------------------------------------------------------------------
// applyStagingAtomic
// ---------------------------------------------------------------------------

describe('applyStagingAtomic', () => {
  it('calls rge_apply_staging_atomic with the correct parameters and returns counts', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        staging_rows: 60000,
        providers_matched: 42000,
        providers_updated: 42000,
        contacts_enriched: 12000,
        stale_cleared: 8,
      },
      error: null,
    })
    const rpc = vi.fn().mockReturnValue({ single })
    const supabase = { rpc } as unknown as SupabaseClient

    const result = await applyStagingAtomic(supabase, {
      lastSyncedAt: '2026-04-12T12:00:00.000Z',
      allowClearStale: true,
      minStagingRows: 30000,
      dryRun: false,
      log: mockLog,
    })

    expect(rpc).toHaveBeenCalledWith('rge_apply_staging_atomic', {
      p_last_synced_at: '2026-04-12T12:00:00.000Z',
      p_allow_clear_stale: true,
      p_min_staging_rows: 30000,
    })
    expect(result.providers_matched).toBe(42000)
    expect(result.providers_updated).toBe(42000)
    expect(result.contacts_enriched).toBe(12000)
    expect(result.stale_cleared).toBe(8)
  })

  it('passes p_allow_clear_stale=false for partial syncs', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        staging_rows: 5000,
        providers_matched: 3000,
        providers_updated: 3000,
        contacts_enriched: 100,
        stale_cleared: 0,
      },
      error: null,
    })
    const rpc = vi.fn().mockReturnValue({ single })
    const supabase = { rpc } as unknown as SupabaseClient

    const result = await applyStagingAtomic(supabase, {
      lastSyncedAt: '2026-04-12T12:00:00.000Z',
      allowClearStale: false,
      minStagingRows: 30000,
      dryRun: false,
      log: mockLog,
    })

    expect(rpc.mock.calls[0][1].p_allow_clear_stale).toBe(false)
    expect(result.stale_cleared).toBe(0)
  })

  it('throws on RPC error (staging too small, permission, etc.)', async () => {
    const single = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'staging has 42 rows (< 30000 threshold)' },
    })
    const rpc = vi.fn().mockReturnValue({ single })
    const supabase = { rpc } as unknown as SupabaseClient

    await expect(
      applyStagingAtomic(supabase, {
        lastSyncedAt: '2026-04-12T12:00:00.000Z',
        allowClearStale: true,
        minStagingRows: 30000,
        dryRun: false,
        log: mockLog,
      })
    ).rejects.toThrow(/rge_apply_staging_atomic failed.*threshold/)
  })

  it('skips the RPC call in dry-run mode and returns zeros', async () => {
    const rpc = vi.fn()
    const supabase = { rpc } as unknown as SupabaseClient

    const result = await applyStagingAtomic(supabase, {
      lastSyncedAt: '2026-04-12T12:00:00.000Z',
      allowClearStale: true,
      minStagingRows: 30000,
      dryRun: true,
      log: mockLog,
    })

    expect(rpc).not.toHaveBeenCalled()
    expect(result).toEqual({
      staging_rows: 0,
      providers_matched: 0,
      providers_updated: 0,
      contacts_enriched: 0,
      stale_cleared: 0,
    })
  })
})
