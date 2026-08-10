import { describe, it, expect } from 'vitest'
import {
  classifySpend,
  readThresholds,
  computeLlmSpendReport,
  DEFAULT_WARN_USD,
  DEFAULT_CRIT_USD,
} from '@/lib/llm/spend-monitor'
import type { SupabaseClient } from '@supabase/supabase-js'

describe('classifySpend', () => {
  it('is ok below the warn threshold', () => {
    expect(classifySpend(19.99, 20, 50)).toBe('ok')
  })
  it('is warning at the warn threshold (inclusive) and below crit', () => {
    expect(classifySpend(20, 20, 50)).toBe('warning')
    expect(classifySpend(49.99, 20, 50)).toBe('warning')
  })
  it('is critical at the crit threshold (inclusive)', () => {
    expect(classifySpend(50, 20, 50)).toBe('critical')
    expect(classifySpend(1000, 20, 50)).toBe('critical')
  })
})

describe('readThresholds', () => {
  it('falls back to defaults when env is unset or invalid', () => {
    expect(readThresholds({} as NodeJS.ProcessEnv)).toEqual({
      warnThresholdUSD: DEFAULT_WARN_USD,
      critThresholdUSD: DEFAULT_CRIT_USD,
    })
    expect(
      readThresholds({
        LLM_SPEND_DAILY_WARN_USD: 'nope',
        LLM_SPEND_DAILY_CRIT_USD: '-5',
      } as unknown as NodeJS.ProcessEnv)
    ).toEqual({ warnThresholdUSD: DEFAULT_WARN_USD, critThresholdUSD: DEFAULT_CRIT_USD })
  })
  it('honours valid positive overrides', () => {
    expect(
      readThresholds({
        LLM_SPEND_DAILY_WARN_USD: '5',
        LLM_SPEND_DAILY_CRIT_USD: '12',
      } as unknown as NodeJS.ProcessEnv)
    ).toEqual({ warnThresholdUSD: 5, critThresholdUSD: 12 })
  })
})

// Minimal supabase stub: the query chain is .from().select().gte().not() and is
// awaited, resolving to { data, error }.
function stubSupabase(rows: unknown[], error: { message: string } | null = null): SupabaseClient {
  const result = Promise.resolve({ data: rows, error })
  const chain = {
    select: () => chain,
    gte: () => chain,
    not: () => result,
  }
  return { from: () => chain } as unknown as SupabaseClient
}

describe('computeLlmSpendReport', () => {
  const now = new Date('2026-07-17T12:00:00.000Z')
  const iso = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600_000).toISOString()

  it('sums only the last 24h into rolling24h but 30d into monthToDate', async () => {
    const rows = [
      { model: 'claude-opus-4-7', cost_usd: 3, created_at: iso(1) },
      { model: 'claude-opus-4-7', cost_usd: 2, created_at: iso(10) },
      { model: 'gemini-2.5-pro', cost_usd: 1, created_at: iso(23) },
      { model: 'claude-opus-4-7', cost_usd: 40, created_at: iso(100) }, // >24h, <30d
    ]
    const report = await computeLlmSpendReport(stubSupabase(rows), now, {} as NodeJS.ProcessEnv)
    expect(report.rolling24hUSD).toBe(6)
    expect(report.monthToDateUSD).toBe(46)
    expect(report.runCount24h).toBe(3)
    expect(report.status).toBe('ok')
    expect(report.byModel[0]).toEqual({ model: 'claude-opus-4-7', costUSD: 5, runs: 2 })
  })

  it('escalates to warning/critical on the 24h total', async () => {
    const warnRows = [{ model: 'm', cost_usd: 25, created_at: iso(2) }]
    expect((await computeLlmSpendReport(stubSupabase(warnRows), now)).status).toBe('warning')

    const critRows = [{ model: 'm', cost_usd: 60, created_at: iso(2) }]
    expect((await computeLlmSpendReport(stubSupabase(critRows), now)).status).toBe('critical')
  })

  it('throws on query error so the cron surfaces it (not a silent zero)', async () => {
    await expect(computeLlmSpendReport(stubSupabase([], { message: 'boom' }), now)).rejects.toThrow(
      /boom/
    )
  })
})
