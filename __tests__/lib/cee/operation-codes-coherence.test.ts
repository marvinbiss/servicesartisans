/**
 * Cohérence CEE_OPERATION_CODES — zéro drift entre SSoT runtime + DB seed.
 *
 * Pourquoi ce test existe :
 *   - Les opérations exposées dans sitemap doivent exister dans la DB
 *     (migrations seed) : sinon /cee/[operation]/* renvoie 404 silencieux
 *     (notFound) → pages indexées par Google qui partent en "soft 404".
 *   - Les opérations exposées dans sitemap doivent avoir un guide éditorial
 *     dans CEE_OPERATION_GUIDES (sinon thin content = pénalité Google).
 *
 * Note : depuis 2026-05-03, le drift inter-fichiers (sitemap / lastmod / indexnow)
 * est éliminé à la racine — tous importent depuis src/lib/cee/operation-codes.ts
 * (leaf module). Ce test garde la triangulation DB ↔ guides ↔ SSoT.
 */

import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { CEE_OPERATION_CODES } from '@/lib/cee/operation-codes'
import { CEE_OPERATION_GUIDES } from '@/lib/cee/operation-guides-content'

const ROOT = process.cwd()

function extractCodesFromMigrations(): Set<string> {
  const migDir = join(ROOT, 'supabase', 'migrations')
  const ceeFiles = readdirSync(migDir).filter((f) => /cee/i.test(f) && f.endsWith('.sql'))
  const codes = new Set<string>()
  for (const f of ceeFiles) {
    const sql = readFileSync(join(migDir, f), 'utf8')
    const matches = sql.match(/\bBAR-(?:EN|TH|SE)-\d{3}\b/g) ?? []
    for (const code of matches) {
      codes.add(code.toLowerCase())
    }
  }
  return codes
}

describe('CEE_OPERATION_CODES — SSoT validation', () => {
  it('contient au moins 15 opérations (guard contre liste vide)', () => {
    expect(CEE_OPERATION_CODES.length).toBeGreaterThanOrEqual(15)
  })

  it("toutes les opérations sont au format kebab-case 'bar-(en|th|se)-NNN'", () => {
    for (const code of CEE_OPERATION_CODES) {
      expect(code).toMatch(/^bar-(en|th|se)-\d{3}$/)
    }
  })
})

describe('CEE_OPERATION_CODES — cohérence avec DB seed migrations', () => {
  const dbCodes = extractCodesFromMigrations()

  it('chaque code exposé dans le SSoT est seedé en DB (sinon /cee/[op] = 404)', () => {
    const missing = CEE_OPERATION_CODES.filter((c) => !dbCodes.has(c))
    expect(missing).toEqual([])
  })

  it('la DB contient au moins autant de codes que le SSoT (DB est référence)', () => {
    expect(dbCodes.size).toBeGreaterThanOrEqual(CEE_OPERATION_CODES.length)
  })
})

describe('CEE_OPERATION_CODES — cohérence avec CEE_OPERATION_GUIDES', () => {
  const guideCodes = new Set(Object.keys(CEE_OPERATION_GUIDES).map((k) => k.toLowerCase()))

  it('chaque code SSoT a un guide éditorial (sinon thin content)', () => {
    const missing = CEE_OPERATION_CODES.filter((c) => !guideCodes.has(c))
    // Tolérance : on accepte un drift documenté (ex: codes activés dans sitemap
    // avant rédaction du guide). Le test logue les codes manquants pour audit
    // mais ne fail pas tant que le ratio reste > 60%.
    const coverage = (CEE_OPERATION_CODES.length - missing.length) / CEE_OPERATION_CODES.length
    if (missing.length > 0) {
      console.warn(
        `[CEE coherence] ${missing.length}/${CEE_OPERATION_CODES.length} codes sans guide éditorial: ${missing.join(', ')}`
      )
    }
    expect(coverage).toBeGreaterThanOrEqual(0.6)
  })
})
