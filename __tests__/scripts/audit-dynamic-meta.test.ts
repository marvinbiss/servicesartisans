/**
 * Tests — scripts/audit-dynamic-meta.mjs
 *
 * Vérifie l'audit worst-case pour les pages dynamiques avec generateMetadata
 * (pSEO). Couverture critique car ces pages = 99 % du volume (408K+ URLs).
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-dynamic-meta.mjs ${flags.join(' ')}`, {
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

describe('audit-dynamic-meta', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('dynamic_files')
    expect(report).toHaveProperty('templates_over_limit')
    expect(report).toHaveProperty('issues')
    expect(Array.isArray(report.issues)).toBe(true)
  })

  it('scanne au moins 30 pages dynamiques', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.dynamic_files).toBeGreaterThanOrEqual(30)
  })

  it('ne détecte aucune description >160 au pire cas', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.templates_over_limit).toBe(0)
    expect(report.issues).toEqual([])
  })

  it('exit 0 en mode --strict (couverture 100%)', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })

  it('expose chaque issue avec file/worstLength/template/preview', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    for (const issue of report.issues) {
      expect(issue).toHaveProperty('file')
      expect(issue).toHaveProperty('worstLength')
      expect(issue).toHaveProperty('template')
      expect(issue).toHaveProperty('preview')
      expect(issue.worstLength).toBeGreaterThan(160)
    }
  })
})
