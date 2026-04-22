/**
 * Tests — scripts/audit-robots-sitemaps.mjs
 *
 * Valide que l'audit :
 *   1. Retourne du JSON structuré
 *   2. Détecte bien les 7 sitemaps/feeds déclarés dans robots.ts
 *   3. Résout chaque URL vers un fichier route existant
 *   4. Mode strict exit code correct
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-robots-sitemaps.mjs ${flags.join(' ')}`, {
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

describe('audit-robots-sitemaps — JSON output', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('total_sitemaps_declared')
    expect(report).toHaveProperty('resolved')
    expect(report).toHaveProperty('missing')
    expect(report).toHaveProperty('details')
  })

  it('au moins 5 sitemaps/feeds déclarés', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.total_sitemaps_declared).toBeGreaterThanOrEqual(5)
  })

  it('zéro sitemap manquant (tous résolus vers un fichier route)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.missing).toBe(0)
    expect(report.resolved).toBe(report.total_sitemaps_declared)
  })

  it('les détails contiennent pour chaque URL un resolved_file non-null', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    for (const r of report.details) {
      expect(r.resolved_file).toBeTruthy()
    }
  })

  it('/sitemap.xml est bien résolu vers src/app/sitemap.ts', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    const sitemap = report.details.find((r: { url_path: string }) => r.url_path === '/sitemap.xml')
    expect(sitemap).toBeDefined()
    expect(sitemap.resolved_file).toBe('src/app/sitemap.ts')
  })

  it('/api/sitemap-recent est résolu', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    const recent = report.details.find(
      (r: { url_path: string }) => r.url_path === '/api/sitemap-recent'
    )
    expect(recent).toBeDefined()
    expect(recent.resolved_file).toContain('sitemap-recent/route.ts')
  })
})

describe('audit-robots-sitemaps — mode strict', () => {
  it('--strict exit 0 quand zéro gap', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })

  it('--strict sans --json affiche le message de succès', () => {
    const { stdout } = runAudit(['--strict'])
    expect(stdout).toMatch(/Tous les sitemaps déclarés dans robots\.ts existent/)
  })
})
