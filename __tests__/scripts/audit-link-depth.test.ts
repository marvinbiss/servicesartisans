/**
 * Tests — scripts/audit-link-depth.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-link-depth.mjs ${flags.join(' ')}`, {
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

describe('audit-link-depth', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('max_depth_threshold')
    expect(report).toHaveProperty('static_indexable_pages')
    expect(report).toHaveProperty('global_footer_links')
    expect(report).toHaveProperty('depth_histogram')
    expect(report).toHaveProperty('pages_too_deep')
    expect(report).toHaveProperty('pages_unreachable')
    expect(report).toHaveProperty('too_deep')
    expect(report).toHaveProperty('unreachable')
  })

  it('scanne ≥ 100 pages statiques indexables', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.static_indexable_pages).toBeGreaterThanOrEqual(100)
  })

  it('la root `/` est à depth 0', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.depth_histogram['0']).toBeGreaterThanOrEqual(1)
  })

  it('zéro page inatteignable', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.pages_unreachable).toBe(0)
    expect(report.unreachable).toEqual([])
  })

  it('zéro page au-delà du seuil MAX_DEPTH (4 par défaut)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.pages_too_deep).toBe(0)
    expect(report.too_deep).toEqual([])
  })

  it('--strict exit 0 quand zéro gap', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
