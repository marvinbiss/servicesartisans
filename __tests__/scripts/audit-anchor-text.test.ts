/**
 * Tests — scripts/audit-anchor-text.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-anchor-text.mjs ${flags.join(' ')}`, {
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

describe('audit-anchor-text', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('files_scanned')
    expect(report).toHaveProperty('total_internal_anchors')
    expect(report).toHaveProperty('violations_count')
    expect(report).toHaveProperty('generic_anchor_rate_pct')
    expect(report).toHaveProperty('banned_anchors')
    expect(report).toHaveProperty('violations')
  })

  it('banned list inclut "en savoir plus" et "cliquez ici"', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.banned_anchors).toContain('en savoir plus')
    expect(report.banned_anchors).toContain('cliquez ici')
  })

  it('extrait un nombre significatif de liens internes', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.total_internal_anchors).toBeGreaterThanOrEqual(100)
  })

  it('zéro ancre générique (0 violations)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.violations_count).toBe(0)
    expect(report.violations).toEqual([])
  })

  it('--strict exit 0 quand zéro violation', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
