/**
 * Tests — scripts/audit-schema-required-fields.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-schema-required-fields.mjs ${flags.join(' ')}`, {
      encoding: 'utf-8',
    })
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string }
    return { exitCode: e.status ?? 1, stdout: String(e.stdout ?? '') }
  }
}

describe('audit-schema-required-fields', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('files_scanned')
    expect(report).toHaveProperty('schema_blocks_checked')
    expect(report).toHaveProperty('hard_gaps')
    expect(report).toHaveProperty('soft_gaps')
    expect(report).toHaveProperty('coverage_pct')
    expect(report).toHaveProperty('hard_findings')
  })

  it('scanne ≥ 500 blocs @type', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.schema_blocks_checked).toBeGreaterThanOrEqual(500)
  })

  it('zéro gap dur (100% coverage champs obligatoires)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.hard_gaps).toBe(0)
    expect(report.coverage_pct).toBe(100)
    expect(report.hard_findings).toEqual([])
  })

  it('--strict exit 0 quand zéro gap dur', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
