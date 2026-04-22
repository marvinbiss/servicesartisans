/**
 * Tests — scripts/audit-opengraph.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-opengraph.mjs ${flags.join(' ')}`, {
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

describe('audit-opengraph', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('indexable_pages')
    expect(report).toHaveProperty('pages_with_og_block')
    expect(report).toHaveProperty('pages_with_gaps')
    expect(report).toHaveProperty('root_opengraph_image')
    expect(report).toHaveProperty('coverage_pct')
    expect(report).toHaveProperty('gaps')
  })

  it('scanne au moins 100 pages indexables', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.indexable_pages).toBeGreaterThanOrEqual(100)
  })

  it('zéro gap OpenGraph', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.pages_with_gaps).toBe(0)
    expect(report.gaps).toEqual([])
  })

  it('coverage 100%', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.coverage_pct).toBe(100)
  })

  it('image OG root-level présente', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.root_opengraph_image).toBe(true)
  })

  it('--strict exit 0 quand zéro gap', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
