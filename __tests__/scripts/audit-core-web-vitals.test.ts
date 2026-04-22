/**
 * Tests — scripts/audit-core-web-vitals.mjs
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

function runAudit(flags: string[] = []): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(`node scripts/audit-core-web-vitals.mjs ${flags.join(' ')}`, {
      encoding: 'utf-8',
    })
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string }
    return { exitCode: e.status ?? 1, stdout: String(e.stdout ?? '') }
  }
}

describe('audit-core-web-vitals', () => {
  it('retourne un rapport JSON structuré', () => {
    const { exitCode, stdout } = runAudit(['--json'])
    expect(exitCode).toBe(0)
    const report = JSON.parse(stdout)
    expect(report).toHaveProperty('font_gaps')
    expect(report).toHaveProperty('image_gaps')
    expect(report).toHaveProperty('raw_img_gaps')
    expect(report).toHaveProperty('layout_preconnect')
    expect(report).toHaveProperty('preconnect_gaps')
  })

  it('zéro font next/font sans display=swap|optional', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.font_gaps).toEqual([])
  })

  it('zéro <Image> sans fill ni width+height', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.image_gaps).toEqual([])
  })

  it('zéro <img> raw sans width/height', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.raw_img_gaps).toEqual([])
  })

  it('layout expose preconnect Supabase + analytics/GTM', () => {
    const { stdout } = runAudit(['--json'])
    const report = JSON.parse(stdout)
    expect(report.preconnect_gaps).toEqual([])
    expect(report.layout_preconnect.supabase).toBe(true)
  })

  it('--strict exit 0 quand aucun gap', () => {
    const { exitCode } = runAudit(['--strict'])
    expect(exitCode).toBe(0)
  })
})
