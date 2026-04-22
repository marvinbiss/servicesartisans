/**
 * Tests — scripts/audit-external-links.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-external-links.mjs ${flags.join(' ')}`, {
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

describe('audit-external-links', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('files_scanned')
    expect(report).toHaveProperty('http_violations')
    expect(report).toHaveProperty('target_blank_without_noopener')
    expect(report).toHaveProperty('details')
  })

  it('scanne un nombre significatif de fichiers', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.files_scanned).toBeGreaterThanOrEqual(100)
  })

  it('zéro URL http:// en dur', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.http_violations).toBe(0)
    expect(report.details.http).toEqual([])
  })

  it('zéro <a target=_blank sans rel noopener', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.target_blank_without_noopener).toBe(0)
    expect(report.details.unsafe_blank).toEqual([])
  })

  it('--strict exit 0 quand zéro violation', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
