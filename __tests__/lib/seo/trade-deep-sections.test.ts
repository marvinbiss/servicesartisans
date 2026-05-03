import { describe, expect, it } from 'vitest'

import { CANONICAL_SERVICE_SLUGS_SET } from '@/lib/services/canonical-slugs'
import {
  getDeepSections,
  getDeepSectionsTradeSlugs,
  type TradeDeepSection,
} from '@/lib/seo/trade-deep-sections'

const TRADE_SLUGS = getDeepSectionsTradeSlugs()

describe('trade-deep-sections — Action #3 Ahrefs 2026-05-03', () => {
  it('expose au minimum les 2 trades pillars haute volume (PAC + isolation)', () => {
    expect(TRADE_SLUGS).toContain('pompe-a-chaleur')
    expect(TRADE_SLUGS).toContain('isolation-thermique')
  })

  it('chaque trade slug est dans le SSoT canonical-slugs (pas de drift)', () => {
    for (const slug of TRADE_SLUGS) {
      expect(
        CANONICAL_SERVICE_SLUGS_SET.has(slug),
        `Trade "${slug}" présent dans deep-sections mais absent du SSoT canonical-slugs`
      ).toBe(true)
    }
  })

  it('chaque trade a au moins 2 sections H2 distinctes', () => {
    for (const slug of TRADE_SLUGS) {
      const sections = getDeepSections(slug)
      expect(
        sections.length,
        `Trade "${slug}" doit avoir ≥ 2 deep sections`
      ).toBeGreaterThanOrEqual(2)
      const ids = sections.map((s) => s.id)
      expect(new Set(ids).size, `Trade "${slug}" : ids dupliqués`).toBe(ids.length)
    }
  })

  it('chaque section a un H2 ≤ 70 chars (snippet Google) et 2-4 paragraphes', () => {
    for (const slug of TRADE_SLUGS) {
      for (const section of getDeepSections(slug)) {
        expect(
          section.h2.length,
          `Trade "${slug}" section "${section.id}" : H2 trop long (${section.h2.length} > 70)`
        ).toBeLessThanOrEqual(70)
        expect(
          section.body.length,
          `Trade "${slug}" section "${section.id}" : doit avoir 2 à 4 paragraphes`
        ).toBeGreaterThanOrEqual(2)
        expect(section.body.length).toBeLessThanOrEqual(4)
      }
    }
  })

  it('chaque paragraphe est entre 200 et 1200 chars (densité éditoriale)', () => {
    for (const slug of TRADE_SLUGS) {
      for (const section of getDeepSections(slug)) {
        section.body.forEach((paragraph: string, i: number) => {
          expect(
            paragraph.length,
            `Trade "${slug}" section "${section.id}" §${i + 1} : trop court (${paragraph.length} < 200)`
          ).toBeGreaterThanOrEqual(200)
          expect(
            paragraph.length,
            `Trade "${slug}" section "${section.id}" §${i + 1} : trop long (${paragraph.length} > 1200)`
          ).toBeLessThanOrEqual(1200)
        })
      }
    }
  })

  it('id est en kebab-case (a-z, 0-9, tirets uniquement)', () => {
    const kebabRe = /^[a-z0-9]+(-[a-z0-9]+)*$/
    for (const slug of TRADE_SLUGS) {
      for (const section of getDeepSections(slug)) {
        expect(
          kebabRe.test(section.id),
          `Trade "${slug}" : id "${section.id}" n'est pas en kebab-case`
        ).toBe(true)
      }
    }
  })

  it('getDeepSections renvoie [] pour un slug inconnu (safe par défaut)', () => {
    const result = getDeepSections('slug-qui-existe-pas')
    expect(result).toEqual([])
  })

  it('PAC cible explicitement les variants air/eau, géothermique, air/eau vs air/air', () => {
    const ids = getDeepSections('pompe-a-chaleur').map((s: TradeDeepSection) => s.id)
    expect(ids).toContain('pompe-a-chaleur-air-eau')
    expect(ids).toContain('pompe-a-chaleur-geothermique')
    expect(ids).toContain('pompe-a-chaleur-air-eau-vs-air-air')
  })

  it('isolation cible ITE, ITI et choix isolant', () => {
    const ids = getDeepSections('isolation-thermique').map((s: TradeDeepSection) => s.id)
    expect(ids).toContain('isolation-par-exterieur-ite')
    expect(ids).toContain('isolation-interieur-iti')
    expect(ids).toContain('choisir-isolant-thermique')
  })
})
