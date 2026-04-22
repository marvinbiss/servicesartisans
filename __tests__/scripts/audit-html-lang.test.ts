/**
 * Tests — scripts/audit-html-lang.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-html-lang.mjs ${flags.join(' ')}`, {
      encoding: 'utf-8',
    })
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string }
    return { exitCode: e.status ?? 1, stdout: String(e.stdout ?? '') }
  }
}

describe('audit-html-lang', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('layout_file')
    expect(report).toHaveProperty('lang_found')
    expect(report).toHaveProperty('accepted_values')
    expect(report).toHaveProperty('valid')
  })

  it('détecte lang="fr" ou "fr-FR"', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.lang_found).toBeTruthy()
    expect(['fr', 'fr-FR', 'fr-fr']).toContain(report.lang_found)
  })

  it('valid=true', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.valid).toBe(true)
    expect(report.error).toBeNull()
  })

  it('--strict exit 0 quand lang valide', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
