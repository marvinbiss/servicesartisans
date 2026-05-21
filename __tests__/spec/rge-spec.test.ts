/**
 * Tests for RGE Spec v1.0 — pillar 5 RGE-OS.
 *
 * Verifies the canonical JSON Schema, its enum sidecars, the bundled
 * examples (3 valid + 1 invalid), and the LICENSE / CHANGELOG / README
 * cross-references. These tests are the contract between SA and any
 * future external adopter of `rge.json`.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const SPEC_DIR = 'docs/spec/rge/v1.0'

const loadJson = (rel: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(SPEC_DIR, rel), 'utf8')) as Record<string, unknown>

const loadText = (rel: string): string => readFileSync(join(SPEC_DIR, rel), 'utf8')

describe('RGE Spec v1.0 — schema', () => {
  it('schema is valid JSON Schema draft 2020-12', () => {
    const schema = loadJson('rge.schema.json')
    expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema')
    expect(schema.$id).toMatch(/v1\.0/)
    const defs = schema.$defs as Record<string, unknown>
    expect(defs.RgeArtisan).toBeDefined()
    expect(defs.Address).toBeDefined()
    expect(defs.GeoLocation).toBeDefined()
    expect(defs.Source).toBeDefined()
    expect(defs.RgeQualification).toBeDefined()
  })

  it('schema root references RgeArtisan via $ref', () => {
    const schema = loadJson('rge.schema.json')
    expect(schema.$ref).toBe('#/$defs/RgeArtisan')
  })

  it('RgeArtisan requires siret + siren + name + address + rgeQualifications + sources + canonicalUrl + license + schemaVersion', () => {
    const schema = loadJson('rge.schema.json')
    const defs = schema.$defs as Record<
      string,
      { required?: string[]; additionalProperties?: boolean }
    >
    const required = defs.RgeArtisan.required ?? []
    for (const key of [
      'siret',
      'siren',
      'name',
      'address',
      'rgeQualifications',
      'sources',
      'canonicalUrl',
      'license',
      'schemaVersion',
    ]) {
      expect(required).toContain(key)
    }
  })

  it('RgeArtisan has additionalProperties: false (strict by design)', () => {
    const schema = loadJson('rge.schema.json')
    const defs = schema.$defs as Record<string, { additionalProperties?: boolean }>
    expect(defs.RgeArtisan.additionalProperties).toBe(false)
    expect(defs.Address.additionalProperties).toBe(false)
    expect(defs.GeoLocation.additionalProperties).toBe(false)
    expect(defs.RgeQualification.additionalProperties).toBe(false)
  })
})

describe('RGE Spec v1.0 — enums', () => {
  it('organismes enum is a valid JSON Schema string enum with >= 10 entries', () => {
    const orgs = loadJson('enums/organismes-certificateurs.json') as {
      type: string
      enum: string[]
    }
    expect(orgs.type).toBe('string')
    expect(orgs.enum.length).toBeGreaterThanOrEqual(10)
    expect(orgs.enum).toContain('Qualibat')
    expect(orgs.enum).toContain('Qualifelec')
    expect(orgs.enum).toContain("Qualit'EnR")
    expect(orgs.enum).toContain('OPQIBI')
  })

  it('gestes-rge enum covers the 5 main RGE families', () => {
    const gestes = loadJson('enums/gestes-rge.json') as { type: string; enum: string[] }
    expect(gestes.type).toBe('string')
    expect(gestes.enum).toContain('pac_air_eau')
    expect(gestes.enum).toContain('isolation_combles')
    expect(gestes.enum).toContain('vmc_double_flux')
    expect(gestes.enum).toContain('audit_energetique')
    expect(gestes.enum).toContain('panneaux_solaires_pv')
  })

  it('meta-domaines enum exposes 5 top-level groupings', () => {
    const meta = loadJson('enums/categories-meta-domaines.json') as { type: string; enum: string[] }
    expect(meta.type).toBe('string')
    expect(meta.enum.length).toBe(5)
    expect(meta.enum).toContain('chauffage_eau_chaude')
    expect(meta.enum).toContain('isolation_bati')
    expect(meta.enum).toContain('ventilation')
    expect(meta.enum).toContain('energie_renouvelable')
    expect(meta.enum).toContain('etudes_audits')
  })
})

describe('RGE Spec v1.0 — valid examples', () => {
  const validExamples = readdirSync(join(SPEC_DIR, 'examples')).filter(
    (f) => f.endsWith('.json') && !f.includes('invalid')
  )

  it('there are exactly 3 valid examples (PAC + isolation + audit)', () => {
    expect(validExamples.length).toBe(3)
  })

  it.each(validExamples)('%s satisfies the structural contract', (fname) => {
    const ex = loadJson(`examples/${fname}`) as Record<string, unknown>
    expect(ex.siret).toMatch(/^[0-9]{14}$/)
    expect(ex.siren).toMatch(/^[0-9]{9}$/)
    expect(ex.name).toBeTruthy()
    expect(ex.address).toBeDefined()
    const quals = ex.rgeQualifications as unknown[]
    expect(quals.length).toBeGreaterThanOrEqual(1)
    const sources = ex.sources as unknown[]
    expect(sources.length).toBeGreaterThanOrEqual(1)
    expect(ex.canonicalUrl).toMatch(/^https:\/\//)
    expect(ex.license).toBe('CC-BY-4.0')
    expect(ex.schemaVersion).toBe('1.0.0')
  })

  it('every qualification organisme appears in the enum list', () => {
    const orgs = loadJson('enums/organismes-certificateurs.json') as { enum: string[] }
    for (const fname of validExamples) {
      const ex = loadJson(`examples/${fname}`) as {
        rgeQualifications: Array<{ organisme: string }>
      }
      for (const q of ex.rgeQualifications) {
        expect(orgs.enum).toContain(q.organisme)
      }
    }
  })

  it('every qualification metaDomaine appears in the enum list (when present)', () => {
    const meta = loadJson('enums/categories-meta-domaines.json') as { enum: string[] }
    for (const fname of validExamples) {
      const ex = loadJson(`examples/${fname}`) as {
        rgeQualifications: Array<{ metaDomaine?: string }>
      }
      for (const q of ex.rgeQualifications) {
        if (q.metaDomaine) {
          expect(meta.enum).toContain(q.metaDomaine)
        }
      }
    }
  })

  it('every Source.license is one of Etalab-2.0 | CC-BY-4.0 | Public-Domain', () => {
    const allowed = new Set(['Etalab-2.0', 'CC-BY-4.0', 'Public-Domain'])
    for (const fname of validExamples) {
      const ex = loadJson(`examples/${fname}`) as { sources: Array<{ license: string }> }
      for (const s of ex.sources) {
        expect(allowed.has(s.license)).toBe(true)
      }
    }
  })
})

describe('RGE Spec v1.0 — invalid example', () => {
  it('invalid-missing-siret.json fails siret pattern (missing field)', () => {
    const ex = loadJson('examples/invalid-missing-siret.json') as Record<string, unknown>
    expect(ex.siret).toBeUndefined()
  })
})

describe('RGE Spec v1.0 — companion docs', () => {
  it('CHANGELOG mentions v1.0 release dated 2026-05-21', () => {
    const changelog = loadText('CHANGELOG.md')
    expect(changelog).toMatch(/\[1\.0\.0\][^\n]*2026-05-21/)
  })

  it('CHANGELOG documents SemVer deprecation policy', () => {
    const changelog = loadText('CHANGELOG.md')
    expect(changelog).toMatch(/deprecation/i)
    expect(changelog).toMatch(/MAJOR/)
    expect(changelog).toMatch(/MINOR/)
  })

  it('LICENSE.md is CC-BY 4.0', () => {
    const license = loadText('LICENSE.md')
    expect(license).toMatch(/Creative Commons Attribution 4\.0/i)
    expect(license).toMatch(/CC-BY 4\.0/)
  })

  it('README cross-walks Schema.org LocalBusiness / HomeAndConstructionBusiness', () => {
    const readme = loadText('README.md')
    expect(readme).toMatch(/Schema\.org/i)
    expect(readme).toMatch(/LocalBusiness/i)
    expect(readme).toMatch(/HomeAndConstructionBusiness/i)
  })

  it('README documents Node.js (Ajv) and Python (jsonschema) quick starts', () => {
    const readme = loadText('README.md')
    expect(readme).toMatch(/Ajv/i)
    expect(readme).toMatch(/jsonschema/i)
  })
})
