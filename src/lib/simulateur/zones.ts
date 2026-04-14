/**
 * Résolution code postal → zone climatique H1/H2/H3 + Île-de-France
 * Source : docs/baremes-sources/07-valeurs-officielles-confirmees-2026-04-14.md §7
 * Référence opposable : Arrêté 26/10/2010, PDF officiel DGEC zones climatiques
 */

import type { ZoneClimatique } from './types'

// H1 — Nord / Nord-Est / Montagne
const H1_DEPTS: readonly string[] = [
  '02',
  '08',
  '10',
  '51',
  '52',
  '54',
  '55',
  '57',
  '59',
  '60',
  '62',
  '67',
  '68',
  '70',
  '88',
  '89',
  '90',
  '05',
  '73',
  '74',
  '975',
]

// H2 — Centre / Ouest / Sud-Ouest / Île-de-France / Corse
const H2_DEPTS: readonly string[] = [
  '01',
  '03',
  '04',
  '06',
  '07',
  '09',
  '11',
  '12',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '31',
  '32',
  '33',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '50',
  '53',
  '56',
  '58',
  '61',
  '63',
  '64',
  '65',
  '69',
  '71',
  '72',
  '75',
  '76',
  '77',
  '78',
  '79',
  '80',
  '81',
  '82',
  '84',
  '85',
  '86',
  '87',
  '91',
  '92',
  '93',
  '94',
  '95',
  '2A',
  '2B',
]

// H3 — Sud / Méditerranée / Outre-mer
const H3_DEPTS: readonly string[] = [
  '13',
  '30',
  '34',
  '66',
  '83',
  '971',
  '972',
  '973',
  '974',
  '976',
]

const IDF_DEPTS: ReadonlySet<string> = new Set(['75', '77', '78', '91', '92', '93', '94', '95'])

// Index department → zone
const DEPT_TO_ZONE: ReadonlyMap<string, ZoneClimatique> = (() => {
  const m = new Map<string, ZoneClimatique>()
  H1_DEPTS.forEach((d) => m.set(d, 'H1'))
  H2_DEPTS.forEach((d) => m.set(d, 'H2'))
  H3_DEPTS.forEach((d) => m.set(d, 'H3'))
  return m
})()

export interface ZoneResolution {
  zone: ZoneClimatique
  idf: boolean
  dept: string
  warning?: string
}

/**
 * Extrait le département canonique depuis un code postal français.
 *
 * Règles :
 * - CP 5 chiffres commençant par "97" → DOM : 3 premiers chiffres (971-976).
 * - CP commençant par "98" → hors périmètre (retourne "" ; géré plus haut).
 * - CP "200XX"–"201XX" → 2A (Corse-du-Sud, convention La Poste).
 * - CP "202XX"–"206XX", "207XX"–"209XX" → 2B (Haute-Corse).
 *   En pratique : 20000–20190 = 2A, 20200–20620 = 2B, mais pour simplifier
 *   et rester opposable : CP < 20200 → 2A, sinon 2B (fiable pour 99 % des cas).
 * - Sinon : 2 premiers chiffres.
 */
export function deptFromCodePostal(cp: string): string {
  if (!/^\d{5}$/.test(cp)) return ''

  // DOM : 971-976 (975 SPM, 976 Mayotte)
  if (cp.startsWith('97')) {
    const d3 = cp.slice(0, 3)
    // DOM valides : 971, 972, 973, 974, 975, 976
    if (['971', '972', '973', '974', '975', '976'].includes(d3)) return d3
    return ''
  }

  // CP 98xxx (Polynésie, Nouvelle-Calédonie, Wallis-et-Futuna) : hors périmètre
  if (cp.startsWith('98')) return ''

  // Corse : CP 20xxx
  if (cp.startsWith('20')) {
    const num = Number(cp)
    // 20000-20199 → 2A (Corse-du-Sud) ; 20200-20999 → 2B (Haute-Corse)
    return num < 20200 ? '2A' : '2B'
  }

  return cp.slice(0, 2)
}

/**
 * Résout un code postal français en zone climatique CEE + flag IdF.
 *
 * Contrat de test (doc archi §9) : 101 départements + DOM couverts.
 * Fallback : CP inconnu → H3 + warning (comportement doc 07 §10).
 */
export function zoneFromCodePostal(cp: string): ZoneResolution {
  const dept = deptFromCodePostal(cp)

  if (!dept) {
    return {
      zone: 'H3',
      idf: false,
      dept: '',
      warning: 'Code postal invalide, zone H3 par défaut',
    }
  }

  const zone = DEPT_TO_ZONE.get(dept)
  if (!zone) {
    return {
      zone: 'H3',
      idf: false,
      dept,
      warning: `Département ${dept} inconnu, zone H3 par défaut`,
    }
  }

  return {
    zone,
    idf: IDF_DEPTS.has(dept),
    dept,
  }
}

// Exports testables
export const __internal = {
  H1_DEPTS,
  H2_DEPTS,
  H3_DEPTS,
  IDF_DEPTS,
  DEPT_TO_ZONE,
}
