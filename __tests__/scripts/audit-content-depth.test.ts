/**
 * Tests — scripts/audit-content-depth.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-content-depth.mjs ${flags.join(' ')}`, {
      encoding: 'utf-8',
    })
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string }
    return { exitCode: e.status ?? 1, stdout: String(e.stdout ?? '') }
  }
}

describe('audit-content-depth', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('min_words_threshold')
    expect(report).toHaveProperty('static_pages_scanned')
    expect(report).toHaveProperty('skipped_dynamic')
    expect(report).toHaveProperty('skipped_runtime_content')
    expect(report).toHaveProperty('median_word_count')
    expect(report).toHaveProperty('thin_pages_count')
    expect(report).toHaveProperty('coverage_pct')
    expect(report).toHaveProperty('thin_pages')
  })

  it('scanne ≥ 100 pages statiques', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.static_pages_scanned).toBeGreaterThanOrEqual(100)
  })

  it('médiane ≥ 300 mots (signal qualité globale)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.median_word_count).toBeGreaterThanOrEqual(300)
  })

  it('zéro page thin (< 150 mots)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.thin_pages_count).toBe(0)
    expect(report.thin_pages).toEqual([])
  })

  it('--strict exit 0 quand zéro page thin', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
