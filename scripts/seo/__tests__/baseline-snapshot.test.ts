/**
 * Tests for scripts/seo/baseline-snapshot.ts
 *
 * The script is a CLI main() with no exported functions, so we test it E2E:
 * - write a fixture CSV to a temp file
 * - run the script via tsx
 * - assert output files exist with correct content
 *
 * Pure logic tests (parseCsv, inScope, aggregate, SHA-256) are validated
 * indirectly via the E2E output.
 */

import { describe, it, expect, afterAll } from 'vitest'
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'node:crypto'
import * as os from 'node:os'

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..')
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'seo', 'baseline-snapshot.ts')
const SNAPSHOT_DATE = '2099-01-01'

const TMP_DIR = path.join(os.tmpdir(), `baseline-snapshot-test-${Date.now()}`)

const FIXTURE_CSV = `path,clicks,impressions,ctr,position,date_start,date_end
/rge/pompe-a-chaleur/lyon,42,1850,0.0227,12.4,2026-04-01,2026-04-28
/villes/lyon,10,500,0.02,18.0,2026-04-01,2026-04-28
/services/plombier/paris,5,200,0.025,22.0,2026-04-01,2026-04-28
/aides/cee,3,150,0.02,30.0,2026-04-01,2026-04-28
/api/some-route,1,10,0.1,5.0,2026-04-01,2026-04-28
/admin/dashboard,0,5,0,3.0,2026-04-01,2026-04-28
/espace-client/profile,0,2,0,1.0,2026-04-01,2026-04-28
`

let fixtureCsvPath: string
let outCsvPath: string
let outShaPath: string

afterAll(() => {
  // Clean up temp dir and any generated baseline outputs in data/seo
  try {
    rmSync(TMP_DIR, { recursive: true, force: true })
  } catch {
    /* no-op */
  }
  const outDir = path.join(REPO_ROOT, 'data', 'seo')
  for (const ext of ['.csv', '.summary.md', '.sha256']) {
    const f = path.join(outDir, `baseline-${SNAPSHOT_DATE}${ext}`)
    if (existsSync(f)) {
      try {
        rmSync(f)
      } catch {
        /* no-op */
      }
    }
  }
})

function setupFixture(): void {
  mkdirSync(TMP_DIR, { recursive: true })
  fixtureCsvPath = path.join(TMP_DIR, 'test-input.csv')
  writeFileSync(fixtureCsvPath, FIXTURE_CSV, 'utf-8')
  outCsvPath = path.join(REPO_ROOT, 'data', 'seo', `baseline-${SNAPSHOT_DATE}.csv`)
  outShaPath = path.join(REPO_ROOT, 'data', 'seo', `baseline-${SNAPSHOT_DATE}.sha256`)
}

function runScript(): void {
  execSync(`npx tsx "${SCRIPT}" "${fixtureCsvPath}" "${SNAPSHOT_DATE}"`, {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
    timeout: 30_000,
    stdio: 'pipe',
  })
}

describe('baseline-snapshot E2E', () => {
  it('runs without error and produces output CSV', () => {
    setupFixture()
    expect(() => runScript()).not.toThrow()
    expect(existsSync(outCsvPath)).toBe(true)
  })

  it('output CSV contains the expected header columns', () => {
    const content = readFileSync(outCsvPath, 'utf-8')
    const headerLine = content.split('\n')[0]
    expect(headerLine).toContain('path')
    expect(headerLine).toContain('clicks')
    expect(headerLine).toContain('impressions')
    expect(headerLine).toContain('ctr')
    expect(headerLine).toContain('position')
    expect(headerLine).toContain('date_start')
    expect(headerLine).toContain('date_end')
  })

  it('SHA-256 file is stable for identical input', () => {
    const sha1 = readFileSync(outShaPath, 'utf-8').trim().split(/\s+/)[0]
    // Re-run with same input — output should be byte-identical CSV → same hash
    runScript()
    const sha2 = readFileSync(outShaPath, 'utf-8').trim().split(/\s+/)[0]
    expect(sha1).toBe(sha2)
  })

  it('SHA-256 in file matches actual SHA-256 of the output CSV', () => {
    const csvContent = readFileSync(outCsvPath, 'utf-8')
    const computedSha = crypto.createHash('sha256').update(csvContent).digest('hex')
    const recordedSha = readFileSync(outShaPath, 'utf-8').trim().split(/\s+/)[0]
    expect(computedSha).toBe(recordedSha)
  })

  it('filters: /rge/ paths are kept in output', () => {
    const content = readFileSync(outCsvPath, 'utf-8')
    expect(content).toContain('/rge/pompe-a-chaleur/lyon')
  })

  it('filters: /villes/ paths are kept in output', () => {
    const content = readFileSync(outCsvPath, 'utf-8')
    expect(content).toContain('/villes/lyon')
  })

  it('filters: /services/ paths are kept in output', () => {
    const content = readFileSync(outCsvPath, 'utf-8')
    expect(content).toContain('/services/plombier/paris')
  })

  it('filters: /aides/ paths are kept in output', () => {
    const content = readFileSync(outCsvPath, 'utf-8')
    expect(content).toContain('/aides/cee')
  })

  it('filters: /api/ paths are excluded from output', () => {
    const content = readFileSync(outCsvPath, 'utf-8')
    expect(content).not.toContain('/api/some-route')
  })

  it('filters: /admin paths are excluded from output', () => {
    const content = readFileSync(outCsvPath, 'utf-8')
    expect(content).not.toContain('/admin/dashboard')
  })

  it('filters: /espace-client paths are excluded from output', () => {
    const content = readFileSync(outCsvPath, 'utf-8')
    expect(content).not.toContain('/espace-client/')
  })

  it('summary markdown file is produced', () => {
    const outSummary = path.join(REPO_ROOT, 'data', 'seo', `baseline-${SNAPSHOT_DATE}.summary.md`)
    expect(existsSync(outSummary)).toBe(true)
  })

  it('summary contains KPI section', () => {
    const outSummary = path.join(REPO_ROOT, 'data', 'seo', `baseline-${SNAPSHOT_DATE}.summary.md`)
    const content = readFileSync(outSummary, 'utf-8')
    expect(content).toContain('KPI')
    expect(content).toContain('Total clicks')
    expect(content).toContain('Total impressions')
  })
})
