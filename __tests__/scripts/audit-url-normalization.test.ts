/**
 * Tests — scripts/audit-url-normalization.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-url-normalization.mjs ${flags.join(' ')}`, {
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

describe('audit-url-normalization', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('files_scanned')
    expect(report).toHaveProperty('total_internal_hrefs')
    expect(report).toHaveProperty('violations_count')
    expect(report).toHaveProperty('by_type')
    expect(report).toHaveProperty('violations')
  })

  it('scanne ≥ 100 fichiers et collecte ≥ 500 hrefs internes', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.files_scanned).toBeGreaterThanOrEqual(100)
    expect(report.total_internal_hrefs).toBeGreaterThanOrEqual(500)
  })

  it('zéro violation URL normalisation', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.violations_count).toBe(0)
    expect(report.violations).toEqual([])
  })

  it('--strict exit 0 quand zéro gap', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
