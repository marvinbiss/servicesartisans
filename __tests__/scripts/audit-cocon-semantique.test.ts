/**
 * Tests — scripts/audit-cocon-semantique.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-cocon-semantique.mjs ${flags.join(' ')}`, {
      encoding: 'utf-8',
    })
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string }
    return { exitCode: e.status ?? 1, stdout: String(e.stdout ?? '') }
  }
}

describe('audit-cocon-semantique', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('min_links_threshold')
    expect(report).toHaveProperty('baseline_layout_links')
    expect(report).toHaveProperty('indexable_pages_scanned')
    expect(report).toHaveProperty('pages_below_threshold')
    expect(report).toHaveProperty('coverage_pct')
  })

  it('baseline layout ≥ 10 liens (Header+Footer global)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.baseline_layout_links).toBeGreaterThanOrEqual(10)
  })

  it('scanne ≥ 100 pages indexables', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.indexable_pages_scanned).toBeGreaterThanOrEqual(100)
  })

  it('100 % pages ≥ 3 liens internes', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.pages_below_threshold).toBe(0)
    expect(report.coverage_pct).toBe(100)
  })

  it('--strict exit 0 quand toutes les pages ont assez de liens', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
