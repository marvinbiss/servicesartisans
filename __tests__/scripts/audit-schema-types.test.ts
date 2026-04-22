/**
 * Tests — scripts/audit-schema-types.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-schema-types.mjs ${flags.join(' ')}`, {
      encoding: 'utf-8',
    })
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string }
    return {
      exitCode: e.status ?? 1,
      stdout: String(e.stdout ?? ''),
    }
  }
}

describe('audit-schema-types', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('indexable_pages')
    expect(report).toHaveProperty('categorized_pages')
    expect(report).toHaveProperty('pages_per_rule')
    expect(report).toHaveProperty('pages_with_gap')
    expect(report).toHaveProperty('coverage_pct')
    expect(report).toHaveProperty('gaps')
  })

  it('catégorise les guides et couvre ≥ 100 guides', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.pages_per_rule.guide).toBeGreaterThanOrEqual(100)
  })

  it('zéro page avec Schema.org gap', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.pages_with_gap).toBe(0)
    expect(report.gaps).toEqual([])
  })

  it('coverage 100%', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.coverage_pct).toBe(100)
  })

  it('--strict exit 0 quand zéro gap', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
