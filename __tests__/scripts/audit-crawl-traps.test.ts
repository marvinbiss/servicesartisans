/**
 * Tests — scripts/audit-crawl-traps.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-crawl-traps.mjs ${flags.join(' ')}`, {
      encoding: 'utf-8',
    })
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string }
    return { exitCode: e.status ?? 1, stdout: String(e.stdout ?? '') }
  }
}

describe('audit-crawl-traps', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('pages_with_empty_state_copy')
    expect(report).toHaveProperty('crawl_trap_gaps')
    expect(report).toHaveProperty('gaps')
  })

  it('zéro crawl trap (page dynamique empty-state sans notFound/noindex)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.crawl_trap_gaps).toBe(0)
    expect(report.gaps).toEqual([])
  })

  it('--strict exit 0 quand aucun crawl trap', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
