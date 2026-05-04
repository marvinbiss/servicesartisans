import { describe, expect, it } from 'vitest'

import {
  AIDES_CALENDAR_2026,
  AIDES_CALENDAR_CATEGORIES,
  getAidesCalendarEventsByMonth,
  getAidesCalendarLastDate,
  getAidesCalendarMonthsSummary,
} from '../calendar-2026'
import { aidesSlugs } from '../aides-catalog'

/**
 * Sprint O 2026-05-03 — verrou data calendrier aides 2026.
 *
 * Garantit l'intégrité du calendrier (E-E-A-T YMYL) :
 *   - dates ISO YYYY-MM-DD valides
 *   - sources https officielles
 *   - relatedAids ⊂ aidesCatalog (pas d'orphelin)
 *   - mois cohérent avec startDate (anti-drift typo)
 *   - slugs uniques (anti-collision anchor URL)
 */

describe('Sprint O — calendar-2026', () => {
  it('AIDES_CALENDAR_2026 non vide (au moins 5 événements)', () => {
    expect(AIDES_CALENDAR_2026.length).toBeGreaterThanOrEqual(5)
  })

  it('chaque événement a date ISO YYYY-MM-DD valide en 2026', () => {
    const isoDateRe = /^2026-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
    for (const e of AIDES_CALENDAR_2026) {
      expect(e.startDate).toMatch(isoDateRe)
      if (e.endDate) {
        expect(e.endDate).toMatch(isoDateRe)
        expect(e.endDate >= e.startDate).toBe(true)
      }
    }
  })

  it('month coïncide avec le mois de startDate (anti-drift typo)', () => {
    for (const e of AIDES_CALENDAR_2026) {
      const monthFromDate = parseInt(e.startDate.split('-')[1], 10)
      expect(e.month).toBe(monthFromDate)
    }
  })

  it('chaque sourceUrl est https valide (E-E-A-T)', () => {
    for (const e of AIDES_CALENDAR_2026) {
      expect(e.sourceUrl).toMatch(/^https:\/\//)
    }
  })

  it('chaque description ≥ 80 caractères (anti-thin)', () => {
    for (const e of AIDES_CALENDAR_2026) {
      expect(e.description.length).toBeGreaterThanOrEqual(80)
    }
  })

  it('relatedAids ⊂ aidesCatalog (anti-orphelin cross-link)', () => {
    const validSlugs = new Set(aidesSlugs)
    for (const e of AIDES_CALENDAR_2026) {
      for (const slug of e.relatedAids) {
        expect(validSlugs.has(slug)).toBe(true)
      }
    }
  })

  it('slugs uniques (anti-collision anchor URL)', () => {
    const slugs = AIDES_CALENDAR_2026.map((e) => e.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('chaque slug est URL-safe (a-z0-9-)', () => {
    for (const e of AIDES_CALENDAR_2026) {
      expect(e.slug).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('chaque category ∈ AIDES_CALENDAR_CATEGORIES', () => {
    const validCategories = new Set(AIDES_CALENDAR_CATEGORIES.map((c) => c.category))
    for (const e of AIDES_CALENDAR_2026) {
      expect(validCategories.has(e.category)).toBe(true)
    }
  })

  it('AIDES_CALENDAR_CATEGORIES couvre les 5 types attendus', () => {
    const cats = AIDES_CALENDAR_CATEGORIES.map((c) => c.category).sort()
    expect(cats).toEqual(['bareme', 'campagne', 'echeance', 'fiscal', 'saisonnalite'])
  })

  it('getAidesCalendarEventsByMonth retourne sous-ensemble cohérent', () => {
    for (let m = 1; m <= 12; m++) {
      const events = getAidesCalendarEventsByMonth(m)
      for (const e of events) {
        expect(e.month).toBe(m)
      }
    }
  })

  it('getAidesCalendarMonthsSummary retourne 12 mois exacts', () => {
    const summary = getAidesCalendarMonthsSummary()
    expect(summary.length).toBe(12)
    expect(summary.map((m) => m.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    // Total events sur 12 mois = AIDES_CALENDAR_2026.length
    const total = summary.reduce((acc, m) => acc + m.events.length, 0)
    expect(total).toBe(AIDES_CALENDAR_2026.length)
  })

  it('getAidesCalendarLastDate retourne date YYYY-MM-DD valide', () => {
    const date = getAidesCalendarLastDate()
    expect(date).toMatch(/^2026-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
  })
})
