/**
 * Tests — scripts/audit-near-duplicates.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-near-duplicates.mjs ${flags.join(' ')}`, {
      encoding: 'utf-8',
    })
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string }
    return { exitCode: e.status ?? 1, stdout: String(e.stdout ?? '') }
  }
}

describe('audit-near-duplicates', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('threshold')
    expect(report).toHaveProperty('shingle_n')
    expect(report).toHaveProperty('pages_compared')
    expect(report).toHaveProperty('skipped_dynamic')
    expect(report).toHaveProperty('duplicate_pairs')
    expect(report).toHaveProperty('pairs')
  })

  it('compare ≥ 100 pages statiques', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.pages_compared).toBeGreaterThanOrEqual(100)
  })

  it('zéro paire near-duplicate au seuil 0.85', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.duplicate_pairs).toBe(0)
    expect(report.pairs).toEqual([])
  })

  it('--strict exit 0 quand zéro paire duplicate', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
