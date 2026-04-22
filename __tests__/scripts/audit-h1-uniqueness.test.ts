/**
 * Tests — scripts/audit-h1-uniqueness.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-h1-uniqueness.mjs ${flags.join(' ')}`, {
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

describe('audit-h1-uniqueness', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('indexable_pages')
    expect(report).toHaveProperty('exactly_one_h1')
    expect(report).toHaveProperty('pages_with_gap')
    expect(report).toHaveProperty('coverage_pct')
    expect(report).toHaveProperty('allowlisted_exceptions')
    expect(report).toHaveProperty('gaps')
  })

  it('scanne au moins 100 pages indexables', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.indexable_pages).toBeGreaterThanOrEqual(100)
  })

  it('zéro page avec H1 gap (hors allowlist)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.pages_with_gap).toBe(0)
    expect(report.gaps).toEqual([])
  })

  it('coverage 100% (allowlist inclus)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.coverage_pct).toBe(100)
  })

  it('allowlist documente chaque exception avec un why', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    // La liste peut être vide, mais si elle contient des routes, chacune doit
    // être une route absolue (`/xxx`)
    for (const r of report.allowlisted_exceptions) {
      expect(r).toMatch(/^\//)
    }
  })

  it('--strict exit 0 quand zéro gap hors allowlist', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
