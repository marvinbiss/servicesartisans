/**
 * Tests — scripts/audit-eeat-dom-signals.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-eeat-dom-signals.mjs ${flags.join(' ')}`, {
      encoding: 'utf-8',
    })
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string }
    return { exitCode: e.status ?? 1, stdout: String(e.stdout ?? '') }
  }
}

describe('audit-eeat-dom-signals', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('article_pages_scanned')
    expect(report).toHaveProperty('pages_missing_dom_signals')
    expect(report).toHaveProperty('coverage_pct')
    expect(report).toHaveProperty('gaps')
  })

  it('scanne ≥ 10 pages Article-like', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.article_pages_scanned).toBeGreaterThanOrEqual(10)
  })

  it('100 % des pages Article exposent byline + date dans le DOM', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.pages_missing_dom_signals).toBe(0)
    expect(report.coverage_pct).toBe(100)
    expect(report.gaps).toEqual([])
  })

  it('--strict exit 0 quand tous les signaux sont présents', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
