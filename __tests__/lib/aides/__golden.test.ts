/**
 * Golden symmetry test — calculator ↔ Ralph 7 evals/gold/mpr-bareme-2026.jsonl.
 *
 * Pour chaque cas gold catégorie `bareme_amount` avec metadata.verified=true,
 * appelle `computeMprAmount` avec les params correspondants et assert le
 * montant. Cela garantit que :
 *   - Le calculator deterministe et le YMYL eval gold ne divergent pas
 *   - Toute modification du barème déclenche un échec ici (filet anti-régression)
 *   - Les cas Ralph 7 `verified: false` sont sautés (symétrie volontaire avec
 *     `evals/scripts` — pas de fail CI sur des valeurs non confirmées)
 *
 * Les gestes de Ralph 7 (`chauffe_eau_thermodynamique`, `isolation_combles_
 * perdus`, `isolation_murs_exterieur`, `chaudiere_biomasse_manuelle`) sont
 * traduits vers les Geste internes du calculator via `GOLD_GESTE_MAP`. Les
 * cas qui réfèrent à `mpr-015` (plafond surface m²) et au-delà (eligibilité,
 * cumul, délais, plafonds RFR) sortent du périmètre v0 du calculator et
 * sont également skippés.
 */

import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { computeMprAmount } from '@/lib/aides/calculator'
import type { Geste, MenageCategorie, Zone } from '@/lib/aides/types'

type GoldCase = {
  id: string
  category: string
  expected_answer: string
  expected_currency: string
  metadata: {
    geste?: string
    menage_categorie?: string
    zone?: string
    annee_bareme?: number
    verified?: boolean
    unite?: string
  }
}

const GOLD_FILE = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'evals',
  'gold',
  'mpr-bareme-2026.jsonl'
)

const GOLD_GESTE_MAP: Record<string, Geste> = {
  pac_air_eau: 'pac_air_eau',
  pac_geothermique: 'pac_geothermique',
  pac_air_air: 'pac_air_air',
  chauffe_eau_thermodynamique: 'chauffe_eau_thermo',
  isolation_combles_perdus: 'isolation_combles',
  isolation_murs_exterieur: 'isolation_ite',
  isolation_planchers_bas: 'isolation_planchers_bas',
  vmc_double_flux: 'vmc_double_flux',
  chaudiere_biomasse_manuelle: 'chaudiere_biomasse',
  audit_energetique: 'audit_energetique',
}

const ZONE_MAP: Record<string, Zone> = {
  ile_de_france: 'idf',
  hors_ile_de_france: 'hors_idf',
}

function rfrForCategory(cat: MenageCategorie, zone: Zone): number {
  // Sentinel RFR chosen well within each bracket to deterministically derive cat.
  if (zone === 'idf') {
    if (cat === 'tres_modeste') return 1000
    if (cat === 'modeste') return 25000
    if (cat === 'intermediaire') return 35000
    return 200000
  }
  if (cat === 'tres_modeste') return 1000
  if (cat === 'modeste') return 18000
  if (cat === 'intermediaire') return 25000
  return 200000
}

function loadGoldCases(): GoldCase[] {
  const raw = fs.readFileSync(GOLD_FILE, 'utf8')
  return raw
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as GoldCase)
}

describe('aides/__golden — symmetry with Ralph 7 evals/gold/mpr-bareme-2026.jsonl', () => {
  const cases = loadGoldCases()

  it('gold file loads and contains the expected case count', () => {
    expect(cases.length).toBeGreaterThanOrEqual(40)
  })

  const baremeCases = cases.filter(
    (c) =>
      c.category === 'bareme_amount' &&
      c.metadata.verified === true &&
      c.metadata.geste !== undefined &&
      c.metadata.menage_categorie !== undefined &&
      // Skip the EUR-per-m2 surface-plafond meta-case (mpr-015 — about plafond surface, not unit price)
      c.metadata.unite !== 'm2' &&
      c.expected_currency !== 'M2' &&
      // Skip cases where expected_currency is non-numeric for amount (PERCENT, COUNT, etc.)
      (c.expected_currency === 'EUR' || c.expected_currency === 'EUR_PER_M2')
  )

  it('finds at least 5 verified bareme_amount cases to check (matches >=5 golden gate)', () => {
    expect(baremeCases.length).toBeGreaterThanOrEqual(5)
  })

  for (const c of baremeCases) {
    const goldGeste = c.metadata.geste as string
    const goldCat = c.metadata.menage_categorie as string

    const geste = GOLD_GESTE_MAP[goldGeste]
    const menageCategorie: MenageCategorie | undefined = (
      ['tres_modeste', 'modeste', 'intermediaire', 'superieur'] as const
    ).includes(goldCat as MenageCategorie)
      ? (goldCat as MenageCategorie)
      : undefined
    const zone: Zone = c.metadata.zone ? (ZONE_MAP[c.metadata.zone] ?? 'hors_idf') : 'hors_idf'

    if (!geste || !menageCategorie) {
      it.skip(`${c.id} — unmapped geste (${goldGeste}) or catégorie (${goldCat})`, () => {})
      continue
    }

    const rfr = rfrForCategory(menageCategorie, zone)
    const expected = Number(c.expected_answer)

    it(`${c.id} — ${geste} / ${menageCategorie} / ${zone} → ${expected} ${c.expected_currency}`, () => {
      const result = computeMprAmount({
        rfr,
        nbPersonnes: 1,
        zone,
        geste,
      })
      if (expected === 0) {
        // Ralph 7 expected_answer = "0" means non-eligible (Rose) or non-éligible MPR (pac_air_air).
        expect(result.eligible).toBe(false)
      } else {
        expect(result.eligible).toBe(true)
        if (result.eligible) {
          expect(result.amountEUR).toBe(expected)
        }
      }
    })
  }
})
