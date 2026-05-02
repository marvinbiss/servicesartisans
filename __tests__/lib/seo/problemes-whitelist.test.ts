/**
 * Tests — problemes-whitelist : validation du gate /problemes/[p]/[v].
 *
 * Stratégie 140K vague 2 #12 (2026-05-02) — tier resserré :
 *   - haute   → top 100 villes
 *   - moyenne → top 50 villes
 *   - basse   → top 25 villes
 *
 * Module 100 % pur (Sets en mémoire, lookup O(1), zéro I/O).
 */

import { describe, it, expect } from 'vitest'
import { isProblemeIndexable, getIndexableProblemeCombos } from '@/lib/seo/problemes-whitelist'
import { getProblemSlugs, getProblemBySlug } from '@/lib/data/problems'
import { villes } from '@/lib/data/france'

describe('isProblemeIndexable', () => {
  it('rejette un slug de problème inconnu', () => {
    expect(isProblemeIndexable('probleme-inexistant', 'paris')).toBe(false)
  })

  it('rejette une ville inconnue même pour un problème valide', () => {
    expect(isProblemeIndexable('fuite-eau', 'ville-fantaisie-zzz')).toBe(false)
  })

  it('accepte (haute, top 100) — Paris + fuite-eau', () => {
    const problem = getProblemBySlug('fuite-eau')
    expect(problem?.urgencyLevel).toBe('haute')
    expect(isProblemeIndexable('fuite-eau', 'paris')).toBe(true)
  })

  it('rejette (haute, hors top 100) — petite commune', () => {
    const problem = getProblemBySlug('fuite-eau')
    expect(problem?.urgencyLevel).toBe('haute')
    const smallCity = villes[1500]
    expect(smallCity).toBeDefined()
    expect(isProblemeIndexable('fuite-eau', smallCity!.slug)).toBe(false)
  })

  it('accepte (moyenne, top 50) — Paris + humidite', () => {
    const problem = getProblemBySlug('humidite')
    expect(problem?.urgencyLevel).toBe('moyenne')
    expect(isProblemeIndexable('humidite', 'paris')).toBe(true)
  })

  it('rejette (moyenne, hors top 50, dans top 100) — humidite', () => {
    const problem = getProblemBySlug('humidite')
    expect(problem?.urgencyLevel).toBe('moyenne')
    const villeRang75 = villes[75]
    expect(villeRang75).toBeDefined()
    expect(isProblemeIndexable('humidite', villeRang75!.slug)).toBe(false)
  })

  it('accepte (basse, top 25) — Paris + fissure-mur', () => {
    const problem = getProblemBySlug('fissure-mur')
    expect(problem?.urgencyLevel).toBe('basse')
    expect(isProblemeIndexable('fissure-mur', 'paris')).toBe(true)
  })

  it('rejette (basse, hors top 25, dans top 50) — fissure-mur', () => {
    const problem = getProblemBySlug('fissure-mur')
    expect(problem?.urgencyLevel).toBe('basse')
    const villeRang40 = villes[40]
    expect(villeRang40).toBeDefined()
    expect(isProblemeIndexable('fissure-mur', villeRang40!.slug)).toBe(false)
  })
})

describe('getIndexableProblemeCombos', () => {
  it('retourne ≤ 8 000 combos (tient dans STATIC_BATCH single shard)', () => {
    const combos = getIndexableProblemeCombos(getProblemSlugs())
    expect(combos.length).toBeLessThanOrEqual(8_000)
  })

  it('retourne au moins 2 500 combos (volume utile préservé après tier resserré)', () => {
    const combos = getIndexableProblemeCombos(getProblemSlugs())
    expect(combos.length).toBeGreaterThan(2_500)
  })

  it('chaque combo retourné est isProblemeIndexable() === true (cohérence)', () => {
    const combos = getIndexableProblemeCombos(getProblemSlugs())
    // Sample test : 50 random combos pour ne pas exploser le coût
    const sample = combos.filter((_, i) => i % Math.ceil(combos.length / 50) === 0)
    for (const { problemSlug, villeSlug } of sample) {
      expect(isProblemeIndexable(problemSlug, villeSlug)).toBe(true)
    }
  })

  it('ignore silencieusement les slugs problèmes inconnus', () => {
    const combos = getIndexableProblemeCombos(['probleme-inexistant', 'fuite-eau'])
    // Tous les combos doivent appartenir à fuite-eau (haute → top 100)
    expect(combos.length).toBe(100)
    expect(combos.every((c) => c.problemSlug === 'fuite-eau')).toBe(true)
  })

  it('Paris est inclus pour tous les problèmes (peu importe l’urgence)', () => {
    const combos = getIndexableProblemeCombos(getProblemSlugs())
    const parisCombos = combos.filter((c) => c.villeSlug === 'paris')
    expect(parisCombos.length).toBe(getProblemSlugs().length)
  })
})
