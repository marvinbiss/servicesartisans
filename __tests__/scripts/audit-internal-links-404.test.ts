/**
 * Tests — scripts/audit-internal-links-404.mjs
 *
 * Vérifie la détection des liens internes href="..." qui ne matchent
 * aucune route existante ni source de redirect.
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-internal-links-404.mjs ${flags.join(' ')}`, {
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

describe('audit-internal-links-404', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('valid_routes_scanned')
    expect(report).toHaveProperty('redirect_sources')
    expect(report).toHaveProperty('source_files_scanned')
    expect(report).toHaveProperty('dead_links')
    expect(report).toHaveProperty('total_broken_occurrences')
    expect(report).toHaveProperty('issues')
  })

  it('scanne au moins 300 routes valides', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.valid_routes_scanned).toBeGreaterThanOrEqual(300)
  })

  it('scanne au moins 1000 fichiers src/', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.source_files_scanned).toBeGreaterThanOrEqual(1000)
  })

  it('aucun lien interne mort détecté', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.dead_links).toBe(0)
    expect(report.issues).toEqual([])
  })

  it('exit 0 en mode --strict', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
