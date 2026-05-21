import { execSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

const SCRIPT = 'scripts/audit-cluster-ahrefs-source.mjs'

describe('audit-cluster-ahrefs-source', () => {
  it('runs cleanly on current taxonomy (--strict exit 0)', () => {
    const out = execSync(`node ${SCRIPT} --strict`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    expect(out).toContain('Tous les seeds OK.')
  })

  it('emits valid JSON in --json mode', () => {
    const out = execSync(`node ${SCRIPT} --json`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    const parsed = JSON.parse(out)
    expect(parsed.totalSeeds).toBeGreaterThanOrEqual(30)
    expect(parsed.failCount).toBe(0)
    expect(Array.isArray(parsed.issues)).toBe(true)
  })
})
