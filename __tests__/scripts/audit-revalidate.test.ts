/**
 * Tests — scripts/audit-revalidate.mjs
 *
 * Valide que l'audit :
 *   1. Retourne du JSON structuré
 *   2. Scanne bien toutes les pages
 *   3. Reconnaît les patterns revalidate numérique ET identifiant (REVALIDATE.xxx)
 *   4. Reconnaît les patterns dynamic (force-dynamic, force-static, auto, error)
 *   5. Exclut les pages noindex (cohérent avec audit-canonicals)
 *   6. Mode strict exit code
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-revalidate.mjs ${flags.join(' ')}`, {
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

describe('audit-revalidate — JSON output', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('scanned')
    expect(report).toHaveProperty('indexable')
    expect(report).toHaveProperty('declared_behavior')
    expect(report).toHaveProperty('implicit_static_total')
    expect(report).toHaveProperty('implicit_static_dynamic')
    expect(report).toHaveProperty('gaps')
    expect(report).toHaveProperty('by_mode')
  })

  it('scanne >= 200 pages avec metadata', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.scanned).toBeGreaterThanOrEqual(200)
  })

  it('indexables <= scanned (les noindex sont exclues)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.indexable).toBeLessThan(report.scanned)
    expect(report.indexable).toBeGreaterThan(200)
  })

  it('zéro page indexable dynamique sans revalidate/dynamic (état prod)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.implicit_static_dynamic).toBe(0)
  })

  it('zéro page indexable static implicit (état prod après fix widget-prix)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.implicit_static_total).toBe(0)
  })

  it('la grande majorité des pages utilisent revalidate (>= 200)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.by_mode.revalidate).toBeGreaterThanOrEqual(200)
  })
})

describe('audit-revalidate — mode strict', () => {
  it('--strict exit 0 quand zéro gap', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })

  it('--strict sans --json affiche le message de succès', () => {
    const { stdout } = runAudit(['--strict'])
    expect(stdout).toMatch(/Toutes les pages indexables ont un comportement de rendu déclaré/)
  })
})

describe('audit-revalidate — détection patterns', () => {
  it('détecte revalidate avec identifiant (REVALIDATE.xxx, pas juste littéral numérique)', () => {
    // Les pages qui utilisent `export const revalidate = REVALIDATE.services`
    // (identifiant depuis @/lib/cache) doivent être détectées comme déclarées.
    // Si la détection ne fonctionnait qu'avec des littéraux numériques, le
    // compteur 'revalidate' serait bas (<50). Ici on doit voir une couverture
    // massive.
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.by_mode.revalidate).toBeGreaterThanOrEqual(
      report.declared_behavior - 10 // tolérance pour quelques force-dynamic/force-static
    )
  })
})
