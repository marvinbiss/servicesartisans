/**
 * Tests — scripts/audit-jsonld-integrity.mjs
 *
 * Vérifie l'intégrité des JSON-LD générés : @context, @type, dates ISO,
 * absence de domain hardcodé, URLs absolues.
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-jsonld-integrity.mjs ${flags.join(' ')}`, {
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

describe('audit-jsonld-integrity', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('files_scanned')
    expect(report).toHaveProperty('types_distinct')
    expect(report).toHaveProperty('issues_total')
    expect(report).toHaveProperty('issues_by_kind')
    expect(report).toHaveProperty('issues')
  })

  it('scanne au moins 3 fichiers avec @context/@type', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.files_scanned).toBeGreaterThanOrEqual(3)
  })

  it('détecte au moins 30 @type distincts', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.types_distinct).toBeGreaterThanOrEqual(30)
  })

  it('aucune issue bad_context / bad_iso_date / relative_url', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.issues_by_kind.bad_context).toBe(0)
    expect(report.issues_by_kind.bad_iso_date).toBe(0)
    expect(report.issues_by_kind.relative_url).toBe(0)
  })

  it('aucun unknown_type (tous dans allowlist)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.issues_by_kind.unknown_type).toBe(0)
  })

  it('aucun hardcoded_domain hors config.ts', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.issues_by_kind.hardcoded_domain).toBe(0)
  })

  it('exit 0 en mode --strict', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
