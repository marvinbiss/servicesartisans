/**
 * Tests — scripts/audit-favicon-viewport.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-favicon-viewport.mjs ${flags.join(' ')}`, {
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

describe('audit-favicon-viewport', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('favicon')
    expect(report).toHaveProperty('manifest')
    expect(report).toHaveProperty('viewport')
    expect(report).toHaveProperty('critical_gaps')
    expect(report).toHaveProperty('soft_gaps')
  })

  it('favicon présent', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.favicon.present).toBe(true)
    expect(report.favicon.files.length).toBeGreaterThan(0)
  })

  it('viewport metadata présente et width=device-width', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.viewport.present).toBe(true)
    expect(report.viewport.valid_device_width).toBe(true)
    expect(report.viewport.width).toBe('device-width')
  })

  it('themeColor présent (soft signal UX)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.viewport.theme_color_present).toBe(true)
  })

  it('manifest présent', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.manifest.present).toBe(true)
  })

  it('zéro gap critique', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.critical_gaps).toEqual([])
  })

  it('--strict exit 0 quand zéro gap critique', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
