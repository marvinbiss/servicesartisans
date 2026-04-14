/**
 * Tests unitaires RGE city listings — garantit que la liste des colonnes
 * sélectionnées inclut toujours les 4 colonnes RGE critiques.
 *
 * `RGE_LIST_SELECT` n'est PAS exporté du module (par choix du code actuel),
 * donc on vérifie directement le texte source comme garde-fou contre une
 * régression qui dropperait silencieusement une colonne RGE.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const SOURCE_PATH = path.resolve(__dirname, '../../../src/lib/rge/city-listings.ts')

describe('RGE_LIST_SELECT (source-level guard)', () => {
  const source = readFileSync(SOURCE_PATH, 'utf8')

  it('inclut rge_qualifications', () => {
    expect(source).toContain("'rge_qualifications'")
  })

  it('inclut rge_valid_until', () => {
    expect(source).toContain("'rge_valid_until'")
  })

  it('inclut rge_organismes', () => {
    expect(source).toContain("'rge_organismes'")
  })

  it('inclut rge_source_url', () => {
    expect(source).toContain("'rge_source_url'")
  })

  it('définit une constante RGE_LIST_SELECT', () => {
    expect(source).toMatch(/RGE_LIST_SELECT\s*=/)
  })

  it('exporte getRgeProvidersByCity et getRgeProviderCountByCity', () => {
    expect(source).toMatch(/export\s+async\s+function\s+getRgeProvidersByCity/)
    expect(source).toMatch(/export\s+async\s+function\s+getRgeProviderCountByCity/)
  })
})
