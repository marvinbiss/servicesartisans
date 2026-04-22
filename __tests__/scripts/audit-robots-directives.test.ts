/**
 * Tests — scripts/audit-robots-directives.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-robots-directives.mjs ${flags.join(' ')}`, {
      encoding: 'utf-8',
    })
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string }
    return { exitCode: e.status ?? 1, stdout: String(e.stdout ?? '') }
  }
}

describe('audit-robots-directives', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('critical_private_paths_missing')
    expect(report).toHaveProperty('mandatory_bots_missing')
    expect(report).toHaveProperty('sitemap_declared')
    expect(report).toHaveProperty('dangerous_wildcards')
    expect(report).toHaveProperty('gaps')
  })

  it('0 path privé manquant', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.critical_private_paths_missing).toEqual([])
  })

  it('0 bot spécial manquant (AdsBot, APIs-Google, Mediapartners)', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.mandatory_bots_missing).toEqual([])
  })

  it('sitemap URL déclaré', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.sitemap_declared).toBe(true)
  })

  it('aucun disallow wildcard sur zones indexables', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.dangerous_wildcards).toBe(0)
  })

  it('aucun disallow global suspect', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.suspicious_global_block).toBe(false)
  })

  it('--strict exit 0 quand aucun gap', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
