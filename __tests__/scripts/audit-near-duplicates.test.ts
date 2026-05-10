/**
 * Tests — scripts/audit-near-duplicates.mjs
 *
 * Each `it` spawns the audit script via `execSync` which scans ~300 files
 * and takes ~3s solo. Under full vitest parallelism + CPU contention this
 * can exceed the default 5s vitest timeout (observed flake in CI 2026-05-11
 * — 4/4 fails parallel, 4/4 pass solo). Cache the audit JSON once at module
 * load and reuse across `it`s : 1 process × 4 assertions instead of 4 × 1.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { execSync } from 'node:child_process'

const TIMEOUT_MS = 30_000

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-near-duplicates.mjs ${flags.join(' ')}`, {
      encoding: 'utf-8',
      timeout: TIMEOUT_MS,
    })
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string }
    return { exitCode: e.status ?? 1, stdout: String(e.stdout ?? '') }
  }
}

type Report = {
  threshold: number
  shingle_n: number
  pages_compared: number
  skipped_dynamic: number
  duplicate_pairs: number
  pairs: unknown[]
}

describe('audit-near-duplicates', () => {
  let jsonResult: { exitCode: number; stdout: string }
  let strictResult: { exitCode: number; stdout: string }
  let report: Report

  beforeAll(() => {
    jsonResult = runAudit(['--json'])
    strictResult = runAudit(['--strict'])
    report = JSON.parse(jsonResult.stdout) as Report
  }, TIMEOUT_MS)

  it('retourne un rapport JSON structuré', () => {
    expect(jsonResult.exitCode).toBe(0)
    expect(report).toHaveProperty('threshold')
    expect(report).toHaveProperty('shingle_n')
    expect(report).toHaveProperty('pages_compared')
    expect(report).toHaveProperty('skipped_dynamic')
    expect(report).toHaveProperty('duplicate_pairs')
    expect(report).toHaveProperty('pairs')
  })

  it('compare ≥ 100 pages statiques', () => {
    expect(report.pages_compared).toBeGreaterThanOrEqual(100)
  })

  it('zéro paire near-duplicate au seuil 0.85', () => {
    expect(report.duplicate_pairs).toBe(0)
    expect(report.pairs).toEqual([])
  })

  it('--strict exit 0 quand zéro paire duplicate', () => {
    expect(strictResult.exitCode).toBe(0)
  })
})
