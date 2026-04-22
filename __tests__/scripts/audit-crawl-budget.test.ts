/**
 * Tests — scripts/audit-crawl-budget.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-crawl-budget.mjs ${flags.join(' ')}`, {
      encoding: 'utf-8',
    })
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string }
    return { exitCode: e.status ?? 1, stdout: String(e.stdout ?? '') }
  }
}

describe('audit-crawl-budget', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('today')
    expect(report).toHaveProperty('lastmod_entries_scanned')
    expect(report).toHaveProperty('stale_hard_count')
    expect(report).toHaveProperty('template_stale')
    expect(report).toHaveProperty('xml_routes_scanned')
    expect(report).toHaveProperty('missing_cache')
  })

  it('scanne ≥ 50 entrées lastModified', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.lastmod_entries_scanned).toBeGreaterThanOrEqual(50)
  })

  it('zéro lastmod > 180 jours (hard gap)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.stale_hard_count).toBe(0)
  })

  it('zéro template stale (date statique > 50 % des entrées, âge > 90 j)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.template_stale).toEqual([])
  })

  it('zéro endpoint XML sans Cache-Control s-maxage', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.missing_cache).toEqual([])
  })

  it('--strict exit 0 quand aucun gap dur', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
