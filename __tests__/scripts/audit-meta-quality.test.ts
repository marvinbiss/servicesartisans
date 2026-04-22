/**
 * Tests — scripts/audit-meta-quality.mjs
 *
 * L'audit détecte 4 classes d'issues :
 *   - missing (title|description) → critique
 *   - duplicates → critique
 *   - too_short / too_long → informationnel (arbitrage éditorial)
 *
 * `--strict` fail uniquement sur missing + duplicates.
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-meta-quality.mjs ${flags.join(' ')}`, {
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

describe('audit-meta-quality', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('pages_scanned_static')
    expect(report).toHaveProperty('pages_skipped_dynamic')
    expect(report).toHaveProperty('pages_with_issues')
    expect(report).toHaveProperty('duplicate_titles')
    expect(report).toHaveProperty('duplicate_descriptions')
    expect(report).toHaveProperty('issues')
    expect(report).toHaveProperty('duplicates')
  })

  it('scanne un nombre significatif de pages statiques', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.pages_scanned_static).toBeGreaterThanOrEqual(100)
  })

  it('résout les consts UPPER_SNAKE et camelCase + interpolation template', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    // Si le resolver marche, zéro title/desc "missing"
    const missing = report.issues.filter((p: { issues: Array<{ issue: string }> }) =>
      p.issues.some((i) => i.issue === 'missing')
    )
    expect(missing).toEqual([])
  })

  it('zéro titre dupliqué', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.duplicate_titles).toBe(0)
  })

  it('zéro description dupliquée', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.duplicate_descriptions).toBe(0)
  })

  it("--strict exit 0 tant qu'aucun critical (missing/dup)", () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
