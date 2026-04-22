/**
 * Tests — scripts/audit-redirects.mjs
 *
 * Vérifie la détection des chaînes (A→B→C), conflits redirect ↔ page.tsx,
 * self-redirects et 302 non permanents dans next.config.js.
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-redirects.mjs ${flags.join(' ')}`, {
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

describe('audit-redirects', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('total_redirects')
    expect(report).toHaveProperty('chains')
    expect(report).toHaveProperty('conflicts_with_page_file')
    expect(report).toHaveProperty('self_redirects')
    expect(report).toHaveProperty('temp_redirects')
    expect(report).toHaveProperty('details')
  })

  it('extrait au moins 40 redirects littéraux', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.total_redirects).toBeGreaterThanOrEqual(40)
  })

  it('aucune chaîne A→B→C', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.chains).toBe(0)
  })

  it('aucun conflit redirect ↔ page.tsx existant', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.conflicts_with_page_file).toBe(0)
    expect(report.details.conflicts).toEqual([])
  })

  it('aucun self-redirect A→A', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.self_redirects).toBe(0)
  })

  it('exit 0 en mode --strict', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
