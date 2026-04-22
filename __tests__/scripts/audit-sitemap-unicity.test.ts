/**
 * Tests — scripts/audit-sitemap-unicity.mjs
 *
 * Vérifie l'unicité des URLs du sitemap + absence de trailing slash /
 * query / fragment / double slash.
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-sitemap-unicity.mjs ${flags.join(' ')}`, {
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

describe('audit-sitemap-unicity', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('literal_urls')
    expect(report).toHaveProperty('duplicates')
    expect(report).toHaveProperty('trailing_slash')
    expect(report).toHaveProperty('with_query')
    expect(report).toHaveProperty('with_fragment')
    expect(report).toHaveProperty('double_slash')
    expect(report).toHaveProperty('details')
  })

  it('extrait au moins 50 URLs littérales distinctes', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.literal_urls).toBeGreaterThanOrEqual(50)
  })

  it('aucun doublon dans sitemap.ts', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.duplicates).toBe(0)
    expect(report.details.duplicates).toEqual([])
  })

  it('aucune URL avec trailing slash (hors root)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.trailing_slash).toBe(0)
  })

  it('aucune URL avec query ? ou fragment # ou double slash', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.with_query).toBe(0)
    expect(report.with_fragment).toBe(0)
    expect(report.double_slash).toBe(0)
  })

  it('exit 0 en mode --strict', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
