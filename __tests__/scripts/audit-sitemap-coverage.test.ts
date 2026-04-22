/**
 * Tests — scripts/audit-sitemap-coverage.mjs
 *
 * Valide que l'audit :
 *   1. Retourne du JSON structuré
 *   2. Détecte les URLs littérales ET les préfixes de loop
 *   3. Exclut les pages 301-redirigées (pas de fausse alerte)
 *   4. Signale les URLs 301-redirigées listées dans le sitemap
 *   5. Mode strict exit code correct
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-sitemap-coverage.mjs ${flags.join(' ')}`, {
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

describe('audit-sitemap-coverage — JSON output', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('sitemap_file')
    expect(report).toHaveProperty('sitemap_urls_extracted')
    expect(report).toHaveProperty('sitemap_loop_prefixes')
    expect(report).toHaveProperty('public_static_pages')
    expect(report).toHaveProperty('missing_from_sitemap')
    expect(report).toHaveProperty('gaps')
    expect(report).toHaveProperty('redirected_urls_in_sitemap')
  })

  it('extrait au moins 50 URLs littérales du sitemap.ts', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.sitemap_urls_extracted).toBeGreaterThanOrEqual(50)
  })

  it('détecte les préfixes de loop (.map() générant des URLs dynamiques)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    // Au minimum on doit détecter les préfixes classiques : /guides/, /services/,
    // /blog/, /villes/, etc. (le sitemap.ts en génère 20+)
    expect(report.sitemap_loop_prefixes.length).toBeGreaterThanOrEqual(15)
    expect(report.sitemap_loop_prefixes).toContain('/guides/')
    expect(report.sitemap_loop_prefixes).toContain('/services/')
  })

  it('zéro page statique indexable manquante', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.missing_from_sitemap).toBe(0)
    expect(report.gaps).toEqual([])
  })

  it('zéro URL 301-redirigée listée dans le sitemap', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.redirected_urls_in_sitemap).toEqual([])
  })

  it('rapporte un nombre significatif de pages statiques scannées', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    // On a ~200 pages statiques indexables dans src/app/. Sanity check.
    expect(report.public_static_pages).toBeGreaterThanOrEqual(100)
  })
})

describe('audit-sitemap-coverage — mode strict', () => {
  it('--strict exit 0 quand zéro gap', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })

  it('--strict sans --json affiche le message de succès', () => {
    const { stdout } = runAudit(['--strict'])
    expect(stdout).toMatch(/Toutes les pages statiques indexables sont dans le sitemap/)
  })
})
