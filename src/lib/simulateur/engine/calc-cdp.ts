/**
 * Calcul Coup de Pouce (CDP).
 *
 * Source : docs/baremes-sources/03-coup-de-pouce-2026.md
 *
 * - CDP Chauffage (parcours geste) : fourchettes indicatives selon équipement
 *   remplacé + catégorie.
 * - CDP Rénov ampleur (parcours accompagné) : plancher × facteur surface,
 *   exige résidence principale depuis 17/01/2026.
 */

import type { BaremeId, CategorieAnah, EquipementActuel, GesteId, TypeLogement } from '../types'
import { asBaremeId } from '../types'
import {
  CDP_CHAUFFAGE_PAC,
  CDP_CHAUFFAGE_BIOMASSE,
  CDP_RENOV_AMPLEUR_PLANCHER,
  CDP_RENOV_AMPLEUR_FACTEURS_SURFACE,
  type CdpFourchette,
} from '../baremes/2026-01'

export interface CdpResult {
  estimation: { bas: number; haut: number }
  baremeId: BaremeId
  conditions: string[]
}

const EQUIP_ELIGIBLES_BOOST: EquipementActuel[] = ['gaz', 'fioul', 'charbon']

export function calcCoupDePouce(
  gestes: GesteId[],
  categorie: CategorieAnah,
  equipementActuel: EquipementActuel
): CdpResult {
  const conditions: string[] = []
  let bas = 0
  let haut = 0
  const catUp = categorie.toUpperCase()
  const parts: string[] = []

  const boostEligible = EQUIP_ELIGIBLES_BOOST.includes(equipementActuel)
  if (!boostEligible) {
    conditions.push(
      "Coup de Pouce Chauffage : boost x5 réservé au remplacement d'une chaudière gaz/fioul/charbon."
    )
  }

  const addGeste = (label: string, table: Record<CategorieAnah, CdpFourchette>, idKey: string) => {
    const fr = table[categorie]
    const factor = boostEligible ? 1 : 0.5
    bas += Math.round(fr.bas * factor)
    haut += Math.round(fr.haut * factor)
    parts.push(idKey)
    conditions.push(
      `${label} : fourchette indicative ${Math.round(fr.bas * factor)}–${Math.round(fr.haut * factor)} €`
    )
  }

  if (gestes.includes('PAC_AIREAU')) {
    addGeste('CDP PAC air/eau', CDP_CHAUFFAGE_PAC, 'PAC')
  }
  if (gestes.includes('BIOMASSE')) {
    addGeste('CDP Biomasse', CDP_CHAUFFAGE_BIOMASSE, 'BIOMASSE')
  }

  const baremeId = asBaremeId(
    `CDP.CHAUFFAGE.${parts.length > 0 ? parts.join('_') : 'NONE'}.${catUp}.2026-01`
  )

  return {
    estimation: { bas, haut },
    baremeId,
    conditions,
  }
}

/**
 * CDP Rénov ampleur : plancher × facteur surface.
 * Exige résidence principale depuis 17/01/2026.
 */
export function calcCdpRenovAmpleur(
  surface: number,
  residencePrincipale: boolean,
  _typeLogement: TypeLogement
): CdpResult {
  const conditions: string[] = []
  if (!residencePrincipale) {
    conditions.push(
      'CDP Rénov ampleur non éligible : exige une résidence principale depuis le 17/01/2026.'
    )
    return {
      estimation: { bas: 0, haut: 0 },
      baremeId: asBaremeId('CDP.RENOV_AMPLEUR.INELIGIBLE.2026-01'),
      conditions,
    }
  }
  let facteur = 1.0
  for (const bucket of CDP_RENOV_AMPLEUR_FACTEURS_SURFACE) {
    if (surface <= bucket.maxSurface) {
      facteur = bucket.facteur
      break
    }
  }
  const valeur = Math.round(CDP_RENOV_AMPLEUR_PLANCHER * facteur)
  conditions.push(
    `CDP Rénov ampleur : ${CDP_RENOV_AMPLEUR_PLANCHER} € × ${facteur} = ${valeur} € (surface ${surface} m²).`
  )
  return {
    estimation: { bas: valeur, haut: valeur },
    baremeId: asBaremeId('CDP.RENOV_AMPLEUR.2026-01'),
    conditions,
  }
}
