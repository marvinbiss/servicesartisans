/**
 * Tests plan 20/20 — traçabilité submit
 *
 * Scope :
 *  - buildConsentTextCanonical : ordre stable + séparateur \n---\n + hash déterministe
 *  - canonicalJson : clés triées, undefined skippé, nested stable
 *  - computeInputsHash : idempotence (mêmes inputs → même hash), ordre clés indifférent
 */

import { createHash } from 'node:crypto'
import { describe, it, expect } from 'vitest'
import {
  CONSENT_TEXTS,
  CONSENT_VERSION_CURRENT,
  buildConsentTextCanonical,
} from '@/lib/simulateur/consent-texts'
import { canonicalJson, computeInputsHash } from '@/lib/simulateur/hash'

describe('buildConsentTextCanonical', () => {
  it('produit un bloc déterministe avec ordre rgpd|majorite|demarchage', () => {
    const canonical = buildConsentTextCanonical('v1')
    const t = CONSENT_TEXTS.v1
    expect(canonical).toBe([t.rgpd, t.majorite, t.demarchage].join('\n---\n'))
  })

  it('utilise la version courante par défaut', () => {
    expect(buildConsentTextCanonical()).toBe(buildConsentTextCanonical(CONSENT_VERSION_CURRENT))
  })

  it('produit un hash SHA-256 stable (preuve CNIL)', () => {
    const h1 = createHash('sha256').update(buildConsentTextCanonical('v1'), 'utf8').digest('hex')
    const h2 = createHash('sha256').update(buildConsentTextCanonical('v1'), 'utf8').digest('hex')
    expect(h1).toBe(h2)
    expect(h1).toMatch(/^[a-f0-9]{64}$/)
  })
})

describe('canonicalJson', () => {
  it('trie les clés par ordre lexicographique', () => {
    expect(canonicalJson({ b: 1, a: 2 })).toBe('{"a":2,"b":1}')
  })

  it('ignore les valeurs undefined mais garde null', () => {
    expect(canonicalJson({ a: undefined, b: null, c: 1 })).toBe('{"b":null,"c":1}')
  })

  it('est récursif sur objets imbriqués', () => {
    expect(canonicalJson({ z: { b: 1, a: 2 }, y: [3, 2, 1] })).toBe(
      '{"y":[3,2,1],"z":{"a":2,"b":1}}'
    )
  })

  it('produit le même JSON pour deux objets équivalents avec clés en ordre différent', () => {
    const a = { x: 1, y: { m: 1, n: 2 } }
    const b = { y: { n: 2, m: 1 }, x: 1 }
    expect(canonicalJson(a)).toBe(canonicalJson(b))
  })
})

describe('computeInputsHash', () => {
  const situation = { codePostal: '75001', rfr: 30000, foyer: 3, surface: 80 }
  const projet = { parcours: 'geste', coupDePouce: true }
  const budget = { budgetHt: 10000 }

  it('est idempotent : mêmes inputs → même hash', () => {
    expect(computeInputsHash(situation, projet, budget)).toBe(
      computeInputsHash(situation, projet, budget)
    )
  })

  it("est indépendant de l'ordre des clés dans les inputs", () => {
    const situationReordered = { surface: 80, rfr: 30000, foyer: 3, codePostal: '75001' }
    expect(computeInputsHash(situation, projet, budget)).toBe(
      computeInputsHash(situationReordered, projet, budget)
    )
  })

  it('change quand un champ change (avalanche SHA-256)', () => {
    const h1 = computeInputsHash(situation, projet, budget)
    const h2 = computeInputsHash({ ...situation, rfr: 30001 }, projet, budget)
    expect(h1).not.toBe(h2)
  })

  it('produit un hash SHA-256 64-hex', () => {
    expect(computeInputsHash(situation, projet, budget)).toMatch(/^[a-f0-9]{64}$/)
  })

  it('roundtrip submit → recompute : hash identique pour inputs strictement égaux', () => {
    // Simule le flux plan 20/20 : submit stocke le hash, puis l'admin recompute
    // avec les mêmes valeurs (rehydratées depuis la DB) — le hash doit matcher
    // à l'octet près, sinon la preuve CNIL de reconstruction < 30s est cassée.
    const stored = computeInputsHash(situation, projet, budget)
    const rehydratedSituation = JSON.parse(JSON.stringify(situation))
    const rehydratedProjet = JSON.parse(JSON.stringify(projet))
    const rehydratedBudget = JSON.parse(JSON.stringify(budget))
    const recomputed = computeInputsHash(rehydratedSituation, rehydratedProjet, rehydratedBudget)
    expect(recomputed).toBe(stored)
  })
})

describe('consent_text_sha256 format (plan 20/20)', () => {
  // Le CHECK constraint DB (migration 444) impose le préfixe de version
  // v{N}:{64-hex}. Sans ce format, l'insert remonte une erreur 500.
  it('matche la regex DB v{N}:{64-hex}', () => {
    const canonical = buildConsentTextCanonical('v1')
    const sha = createHash('sha256').update(canonical, 'utf8').digest('hex')
    const full = `v1:${sha}`
    expect(full).toMatch(/^v\d+:[a-f0-9]{64}$/)
  })
})
