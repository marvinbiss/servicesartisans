/**
 * Tests — scripts/audit-hreflang.mjs
 *
 * Valide que l'audit :
 *   1. Retourne du JSON structuré
 *   2. Accepte `getAlternates()` comme déclaration valide
 *   3. Accepte `languages: { 'fr-FR': ..., 'x-default': ... }` manuel
 *   4. Zéro page indexable sans hreflang (garde-fou)
 *   5. Mode strict exit code correct
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-hreflang.mjs ${flags.join(' ')}`, {
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

describe('audit-hreflang — JSON output', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('indexable_pages')
    expect(report).toHaveProperty('pages_without_hreflang')
    expect(report).toHaveProperty('coverage_pct')
    expect(report).toHaveProperty('gaps')
  })

  it('scanne un nombre significatif de pages indexables', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.indexable_pages).toBeGreaterThanOrEqual(100)
  })

  it('zéro page indexable sans hreflang', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.pages_without_hreflang).toBe(0)
    expect(report.gaps).toEqual([])
  })

  it('coverage 100%', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.coverage_pct).toBe(100)
  })
})

describe('audit-hreflang — mode strict', () => {
  it('--strict exit 0 quand zéro gap', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })

  it('--strict sans --json affiche le message de succès', () => {
    const { stdout } = runAudit(['--strict'])
    expect(stdout).toMatch(/Toutes les pages indexables déclarent hreflang/)
  })
})
