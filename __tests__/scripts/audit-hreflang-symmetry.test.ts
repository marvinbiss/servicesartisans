/**
 * Tests — scripts/audit-hreflang-symmetry.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-hreflang-symmetry.mjs ${flags.join(' ')}`, {
      encoding: 'utf-8',
    })
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string }
    return { exitCode: e.status ?? 1, stdout: String(e.stdout ?? '') }
  }
}

describe('audit-hreflang-symmetry', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('pages_checked')
    expect(report).toHaveProperty('mismatch_count')
    expect(report).toHaveProperty('coverage_pct')
    expect(report).toHaveProperty('gaps')
  })

  it('scanne ≥ 100 pages statiques avec alternates', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.pages_checked).toBeGreaterThanOrEqual(100)
  })

  it('zéro mismatch path↔fichier', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.mismatch_count).toBe(0)
    expect(report.coverage_pct).toBe(100)
  })

  it('--strict exit 0 quand aucun mismatch', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
