import { describe, it, expect } from 'vitest'
import { authors, getAuthorByName, type Author } from '@/lib/data/authors'

/**
 * Regression tests — prevent re-introducing fraudulent E-E-A-T signals
 * on editorial staff writers.
 *
 * Context : staff writers at ServicesArtisans produce content that cites
 * RGE-certified artisans ; they are NOT themselves RGE / Qualibat /
 * Qualifelec / OPQTECC / CFAI certified professionals. Claiming these
 * credentials on the Person schema or the public author pages would be :
 *   - Deceptive under Google Quality Rater Guidelines section 2.5
 *   - Detectable via reverse-image search + LinkedIn graph crosscheck
 *   - A YMYL Helpful Content Update vector (our content touches financial
 *     aids — a high-risk topic category).
 *
 * These tests lock the refactor of 2026-04-20 so a future edit cannot
 * silently re-add certifications or fake social links.
 */

const FORBIDDEN_CREDENTIALS = [
  // RGE qualifs : belong to artisans, not writers
  'RGE',
  'QualiPAC',
  'Qualibat',
  'Qualifelec',
  "Qualit'EnR",
  'Qualibois',
  'Qualisol',
  'QualiPV',
  'Eco-Artisan',
  // Sector bodies : writers don't have individual membership
  'OPQTECC',
  'AFNOR',
  'CFAI',
  'ENSAD',
  // Habilitations électriques
  'IRVE',
  'Habilitation électrique',
  // Gaz
  'PG Professionnel du Gaz',
  'Qualigaz',
]

const FORBIDDEN_CREDENTIAL_KEYWORDS_IN_ROLE = ['certifié', 'certifiée', 'habilité', 'habilitée']

describe('authors.ts — honest E-E-A-T posture', () => {
  const allAuthors: Author[] = Object.values(authors)

  it('exposes at least one editorial author', () => {
    expect(allAuthors.length).toBeGreaterThan(0)
  })

  it('no author type field named "certifications" (breaking change lock)', () => {
    for (const a of allAuthors) {
      expect(a).not.toHaveProperty('certifications')
    }
  })

  it('no author carries a "social" field (no fake LinkedIn profiles)', () => {
    for (const a of allAuthors) {
      expect(a).not.toHaveProperty('social')
    }
  })

  it('role never claims the author is "certified" themselves', () => {
    for (const a of allAuthors) {
      const role = a.role.toLowerCase()
      for (const kw of FORBIDDEN_CREDENTIAL_KEYWORDS_IN_ROLE) {
        expect(
          role,
          `author "${a.name}" role claims "${kw}" — staff writers are not certified`
        ).not.toContain(kw)
      }
    }
  })

  it('bio never claims the author holds a sector certification', () => {
    for (const a of allAuthors) {
      for (const credential of FORBIDDEN_CREDENTIALS) {
        const pattern = new RegExp(
          `\\b${credential.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s+(certifié|certifiée)`,
          'i'
        )
        expect(a.bio, `author "${a.name}" bio claims to be "${credential} certifié"`).not.toMatch(
          pattern
        )
      }
    }
  })

  it('credentialsBasis describes verifiable background, not sector certifications', () => {
    for (const a of allAuthors) {
      expect(a.credentialsBasis.length).toBeGreaterThan(40)
      // It MAY mention sector bodies (e.g. "veille sur les publications Qualifelec"),
      // but it must NEVER claim the author holds the credential.
      expect(a.credentialsBasis).not.toMatch(/je (suis|détiens)|diplômé(e)? (d['e]|en)\s+\w+/i)
    }
  })

  it('methodology lists at least 2 verifiable practices per author', () => {
    for (const a of allAuthors) {
      expect(a.methodology.length).toBeGreaterThanOrEqual(2)
      for (const item of a.methodology) {
        expect(item.length).toBeGreaterThan(15)
      }
    }
  })

  it('getAuthorByName resolves every registered author', () => {
    for (const a of allAuthors) {
      expect(getAuthorByName(a.name)).toBeDefined()
      expect(getAuthorByName(a.name)?.slug).toBe(a.slug)
    }
  })

  it('getAuthorByName returns undefined for unknown or organizational authors', () => {
    expect(getAuthorByName('ServicesArtisans')).toBeUndefined()
    expect(getAuthorByName('Équipe éditoriale')).toBeUndefined()
    expect(getAuthorByName('Jean Nobody')).toBeUndefined()
  })
})
