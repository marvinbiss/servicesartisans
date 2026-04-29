import { describe, it, expect } from 'vitest'

// Parsers extracted into a pure module (no Supabase/IO/env), testable in isolation.
import {
  parseArgileLevel,
  parseZoneSismique,
  parseRadon,
  parseDvfCsv,
  dvfDept,
  isPriceM2Sane,
  isRevenuSane,
  isPctSane,
  isPositiveCount,
} from '../enrich-communes-parsers'

describe('parseArgileLevel — Géorisques libellés réels (2026-04-29)', () => {
  it('mappe "important" → "fort"', () => {
    expect(parseArgileLevel('Risque Existant - important')).toBe('fort')
  })
  it('mappe "élevé" → "fort"', () => {
    expect(parseArgileLevel('Risque Élevé')).toBe('fort')
  })
  it('mappe "eleve" (sans accent) → "fort"', () => {
    expect(parseArgileLevel('Risque Eleve')).toBe('fort')
  })
  it('mappe "fort" littéral → "fort"', () => {
    expect(parseArgileLevel('Aléa fort')).toBe('fort')
  })
  it('mappe "moyen" → "moyen"', () => {
    expect(parseArgileLevel('Risque Existant - moyen')).toBe('moyen')
  })
  it('mappe "faible" → "faible"', () => {
    expect(parseArgileLevel('Risque Existant - faible')).toBe('faible')
  })
  it('renvoie null sur libellé vide', () => {
    expect(parseArgileLevel(null)).toBeNull()
    expect(parseArgileLevel(undefined)).toBeNull()
    expect(parseArgileLevel('')).toBeNull()
  })
  it('renvoie null sur libellé inconnu', () => {
    expect(parseArgileLevel('Pas de risque détecté')).toBeNull()
  })
})

describe('parseZoneSismique — fallback qualitatif → numérique', () => {
  it('extrait zone numérique "Zone 3" → 3', () => {
    expect(parseZoneSismique('Zone 3 / Modérée')).toBe(3)
    expect(parseZoneSismique('Zone 5')).toBe(5)
  })
  it('mappe "très faible" → 1', () => {
    expect(parseZoneSismique('Risque très faible')).toBe(1)
    expect(parseZoneSismique('Risque tres faible')).toBe(1)
  })
  it('mappe "faible" → 2', () => {
    expect(parseZoneSismique('Risque Existant - faible')).toBe(2)
  })
  it('mappe "moyen" → 3', () => {
    expect(parseZoneSismique('Risque moyen')).toBe(3)
  })
  it('mappe "important/fort" → 4', () => {
    expect(parseZoneSismique('Risque important')).toBe(4)
    expect(parseZoneSismique('Risque fort')).toBe(4)
  })
  it('renvoie null sur libellé inconnu', () => {
    expect(parseZoneSismique('Aucune mention de niveau')).toBeNull()
    expect(parseZoneSismique(null)).toBeNull()
  })
})

describe('parseRadon — classes Géorisques', () => {
  it('extrait "Catégorie 3" → 3', () => {
    expect(parseRadon('Catégorie 3')).toBe(3)
  })
  it('extrait "Classe 2" → 2', () => {
    expect(parseRadon('Classe 2')).toBe(2)
  })
  it('mappe libellé qualitatif → 1-3', () => {
    expect(parseRadon('Risque faible')).toBe(1)
    expect(parseRadon('Risque moyen')).toBe(2)
    expect(parseRadon('Risque important')).toBe(3)
  })
  it('renvoie null sur libellé inconnu', () => {
    expect(parseRadon('aucune info')).toBeNull()
  })
})

describe('dvfDept — gestion Corse 2A/2B', () => {
  it('Corse 2A uppercase', () => {
    expect(dvfDept('2A004')).toBe('2A')
  })
  it('Corse 2A lowercase normalisé en uppercase (canonique geo-dvf)', () => {
    expect(dvfDept('2a004')).toBe('2A')
  })
  it('Corse 2B uppercase', () => {
    expect(dvfDept('2B033')).toBe('2B')
  })
  it('Métropole standard 2 chars', () => {
    expect(dvfDept('75101')).toBe('75')
    expect(dvfDept('13201')).toBe('13')
    expect(dvfDept('69381')).toBe('69')
  })
  it('DOM-TOM 3 chars (slice 0,2 → 97 ou 98)', () => {
    expect(dvfDept('97411')).toBe('97')
  })
})

describe('parseDvfCsv — agrégation prix m² + filtres', () => {
  const HEADER =
    'id_mutation,date_mutation,nature_mutation,valeur_fonciere,type_local,surface_reelle_bati'

  it('médiane prix m² Maison + Appartement séparés', () => {
    const csv = [
      HEADER,
      'm1,2024-01-01,Vente,300000,Maison,100',
      'm2,2024-02-01,Vente,400000,Maison,100',
      'm3,2024-03-01,Vente,500000,Maison,100',
      'm4,2024-04-01,Vente,200000,Appartement,50',
      'm5,2024-05-01,Vente,250000,Appartement,50',
    ].join('\n')
    const r = parseDvfCsv(csv)
    expect(r.prixMaison).toBe(4000) // médiane 400k/100
    expect(r.prixAppart).toBe(5000) // médiane 250k/50
    expect(r.nbMutations).toBe(5)
  })

  it('rejette mutations avec surface aberrante (<9 ou >2000)', () => {
    const csv = [
      HEADER,
      'm1,2024-01-01,Vente,1000000,Maison,5', // surface trop petite
      'm2,2024-02-01,Vente,1000000,Maison,3000', // surface trop grande
    ].join('\n')
    const r = parseDvfCsv(csv)
    expect(r.prixMoyen).toBeNull()
    expect(r.nbMutations).toBe(0)
  })

  it('rejette mutations avec prix m² < 100 ou > 50000', () => {
    const csv = [
      HEADER,
      'm1,2024-01-01,Vente,5000,Maison,100', // 50€/m² (suspect, donation)
      'm2,2024-02-01,Vente,10000000,Appartement,100', // 100K€/m² (luxe extrême ou bug)
    ].join('\n')
    const r = parseDvfCsv(csv)
    expect(r.prixMoyen).toBeNull()
  })

  it('skip non-Vente (Échange, Adjudication...)', () => {
    const csv = [
      HEADER,
      'm1,2024-01-01,Vente,300000,Maison,100',
      'm2,2024-02-01,Echange,500000,Maison,100',
      'm3,2024-03-01,Adjudication,400000,Maison,100',
    ].join('\n')
    const r = parseDvfCsv(csv)
    expect(r.nbMutations).toBe(1)
  })

  it('mutation déduplication par id_mutation', () => {
    const csv = [
      HEADER,
      'm1,2024-01-01,Vente,300000,Maison,100',
      'm1,2024-01-01,Vente,300000,Maison,100', // doublon (multi-lots)
      'm2,2024-02-01,Vente,400000,Maison,100',
    ].join('\n')
    const r = parseDvfCsv(csv)
    expect(r.nbMutations).toBe(2)
  })

  it('renvoie null prix sur CSV vide', () => {
    expect(parseDvfCsv('').prixMoyen).toBeNull()
    expect(parseDvfCsv(HEADER).prixMoyen).toBeNull()
  })
})

describe('Validation guards — Stripe-grade range checks', () => {
  it('isPriceM2Sane : 500-30000 €/m²', () => {
    expect(isPriceM2Sane(2000)).toBe(true)
    expect(isPriceM2Sane(15000)).toBe(true)
    expect(isPriceM2Sane(499)).toBe(false)
    expect(isPriceM2Sane(30001)).toBe(false)
    expect(isPriceM2Sane(null)).toBe(false)
    expect(isPriceM2Sane(NaN)).toBe(false)
  })

  it('isRevenuSane : 8K-80K €/an', () => {
    expect(isRevenuSane(20_000)).toBe(true)
    expect(isRevenuSane(45_000)).toBe(true)
    expect(isRevenuSane(7_999)).toBe(false)
    expect(isRevenuSane(80_001)).toBe(false)
    expect(isRevenuSane(null)).toBe(false)
  })

  it('isPctSane : 0-100', () => {
    expect(isPctSane(0)).toBe(true)
    expect(isPctSane(50.5)).toBe(true)
    expect(isPctSane(100)).toBe(true)
    expect(isPctSane(-1)).toBe(false)
    expect(isPctSane(101)).toBe(false)
    expect(isPctSane(null)).toBe(false)
  })

  it('isPositiveCount : strictement > 0 et borne haute', () => {
    expect(isPositiveCount(1)).toBe(true)
    expect(isPositiveCount(1_000_000)).toBe(true)
    expect(isPositiveCount(0)).toBe(false)
    expect(isPositiveCount(-5)).toBe(false)
    expect(isPositiveCount(10_000_001)).toBe(false)
    expect(isPositiveCount(null)).toBe(false)
  })
})
