/**
 * Tests — scripts/audit-noindex-sitemap.mjs
 *
 * Vérifie la cohérence sitemap ↔ robots (pages noindex dans sitemap,
 * sources redirect présentes dans sitemap).
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-noindex-sitemap.mjs ${flags.join(' ')}`, {
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

describe('audit-noindex-sitemap', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('sitemap_literal_urls')
    expect(report).toHaveProperty('redirect_sources')
    expect(report).toHaveProperty('noindex_in_sitemap')
    expect(report).toHaveProperty('redirected_in_sitemap')
    expect(report).toHaveProperty('details')
  })

  it('extrait au moins 50 URLs du sitemap', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.sitemap_literal_urls).toBeGreaterThanOrEqual(50)
  })

  it('aucune page noindex présente dans le sitemap', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.noindex_in_sitemap).toBe(0)
    expect(report.details.noindexInSitemap).toEqual([])
  })

  it('aucune source de redirect 301 présente dans le sitemap', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.redirected_in_sitemap).toBe(0)
    expect(report.details.redirectedInSitemap).toEqual([])
  })

  it('exit 0 en mode --strict', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
