/**
 * Tests — scripts/audit-aria-landmarks.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-aria-landmarks.mjs ${flags.join(' ')}`, {
      encoding: 'utf-8',
    })
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string }
    return { exitCode: e.status ?? 1, stdout: String(e.stdout ?? '') }
  }
}

describe('audit-aria-landmarks', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('layout')
    expect(report).toHaveProperty('layout_gaps')
    expect(report).toHaveProperty('indexable_pages')
    expect(report).toHaveProperty('pages_without_main')
    expect(report).toHaveProperty('coverage_main_pct')
    expect(report).toHaveProperty('main_gaps')
  })

  it('layout root expose nav + banner + contentinfo', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.layout.nav).toBe(true)
    expect(report.layout.banner).toBe(true)
    expect(report.layout.contentinfo).toBe(true)
    expect(report.layout_gaps).toEqual([])
  })

  it('scanne ≥ 100 pages indexables', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.indexable_pages).toBeGreaterThanOrEqual(100)
  })

  it('100 % des pages indexables exposent un <main>', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.pages_without_main).toBe(0)
    expect(report.coverage_main_pct).toBe(100)
    expect(report.main_gaps).toEqual([])
  })

  it('--strict exit 0 quand tous les landmarks sont présents', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
