/**
 * P1.3 (test-architect 2026-04-29) — vérifie que les 20 départements pré-rendus
 * pour /aides/[slug]/maprimerenov sont tous reconnus par getDepartementBySlug.
 *
 * Si un slug est mal écrit ou si france.ts est modifié, on saurait au build
 * (page silencieusement notFound) — ce test attrape la régression au commit.
 */
import { describe, expect, it } from 'vitest'

import { getDepartementBySlug } from '@/lib/data/france'

const PRERENDER_DEPTS: readonly string[] = [
  'paris',
  'nord',
  'bouches-du-rhone',
  'rhone',
  'seine-saint-denis',
  'yvelines',
  'hauts-de-seine',
  'gironde',
  'haute-garonne',
  'val-de-marne',
  'pas-de-calais',
  'isere',
  'essonne',
  'val-doise',
  'seine-et-marne',
  'alpes-maritimes',
  'loire-atlantique',
  'ille-et-vilaine',
  'moselle',
  'finistere',
]

describe('PRERENDER_DEPTS — generateStaticParams maprimerenov dept', () => {
  it('all 20 prerender slugs resolve to a known department', () => {
    for (const slug of PRERENDER_DEPTS) {
      const dept = getDepartementBySlug(slug)
      expect(dept, `${slug} not found in france.ts`).not.toBeNull()
      expect(dept, `${slug} not found in france.ts`).not.toBeUndefined()
      expect(dept?.slug).toBe(slug)
    }
  })

  it('every resolved department has the required fields used by the page', () => {
    for (const slug of PRERENDER_DEPTS) {
      const dept = getDepartementBySlug(slug)
      if (!dept) continue
      expect(dept.code).toBeTruthy()
      expect(dept.name).toBeTruthy()
      expect(dept.region).toBeTruthy()
    }
  })

  it('list has exactly 20 entries (top traffic dept)', () => {
    expect(PRERENDER_DEPTS).toHaveLength(20)
    expect(new Set(PRERENDER_DEPTS).size).toBe(20)
  })
})
