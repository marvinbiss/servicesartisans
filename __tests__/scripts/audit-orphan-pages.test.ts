/**
 * Tests — scripts/audit-orphan-pages.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-orphan-pages.mjs ${flags.join(' ')}`, {
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

describe('audit-orphan-pages', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('static_indexable_pages')
    expect(report).toHaveProperty('link_references_extracted')
    expect(report).toHaveProperty('link_prefixes_extracted')
    expect(report).toHaveProperty('orphans_count')
    expect(report).toHaveProperty('orphans')
  })

  it('scanne un nombre significatif de pages indexables statiques', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.static_indexable_pages).toBeGreaterThanOrEqual(100)
  })

  it('extrait un nombre significatif de liens internes', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.link_references_extracted).toBeGreaterThanOrEqual(100)
  })

  it('détecte les patterns navigation + Link + redirect + router.push', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    // Sanity : préfixes de loop détectés (services, villes, guides, etc.)
    expect(report.link_prefixes_extracted).toBeGreaterThanOrEqual(10)
  })

  it('zéro page orpheline', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.orphans_count).toBe(0)
    expect(report.orphans).toEqual([])
  })

  it('--strict exit 0 quand zéro orphan', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
