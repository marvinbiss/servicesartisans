/**
 * Tests — scripts/audit-canonicals.mjs
 *
 * On shell out vers le script avec --json et on valide :
 *   1. Il scanne bien tous les page.tsx
 *   2. Les pages noindex sont exclues du strict check
 *   3. Les patterns noindex (robots: index false, NOT_FOUND_METADATA,
 *      (private)/ dossier, force-dynamic redirect pages) sont reconnus
 *   4. --strict exit 0 quand zéro gap indexable dynamique
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-canonicals.mjs ${flags.join(' ')}`, {
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

describe('audit-canonicals — JSON output', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('scanned')
    expect(report).toHaveProperty('missing_total')
    expect(report).toHaveProperty('missing_indexable')
    expect(report).toHaveProperty('missing_indexable_dynamic')
    expect(report).toHaveProperty('gaps')
    expect(report).toHaveProperty('excluded_noindex')
  })

  it('scanne >= 200 pages avec metadata (le site en a ~254)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.scanned).toBeGreaterThanOrEqual(200)
  })

  it('zéro gap indexable dynamique (état prod actuel)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.missing_indexable_dynamic).toBe(0)
  })

  it('exclut correctement les espaces (private)/', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    const privatePaths = report.excluded_noindex.filter((p: string) => p.includes('(private)'))
    // Au moins quelques pages privées ont été reconnues comme noindex
    expect(privatePaths.length).toBeGreaterThan(0)
  })
})

describe('audit-canonicals — mode strict', () => {
  it('--strict exit 0 quand zéro gap indexable dynamique', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })

  it('--strict sans --json affiche le message humain de succès', () => {
    const { stdout } = runAudit(['--strict'])
    expect(stdout).toMatch(/Aucune page indexable sans canonical/)
  })
})

describe('audit-canonicals — détection des patterns noindex', () => {
  it('détecte robots: { index: false } inline', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    // Pages (private) avec robots.index:false inline (les pages CEE artisan,
    // gelées 2026-06-07, sont devenues des stubs redirect sans metadata)
    const privateNoindex = report.excluded_noindex.filter((p: string) => p.includes('(private)/'))
    expect(privateNoindex.length).toBeGreaterThanOrEqual(1)
    expect(report.excluded_noindex).toContain(
      'src/app/(private)/espace-artisan/securite/2fa/page.tsx'
    )
  })

  it('détecte les pages force-dynamic redirect (artisan/[slug])', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    // /artisan/[slug] et invitation-avis/[token] sont noindex
    const tokenPage = report.excluded_noindex.some((p: string) =>
      p.includes('invitation-avis/[token]')
    )
    expect(tokenPage).toBe(true)
  })
})
