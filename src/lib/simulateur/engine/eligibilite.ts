/**
 * Filtrage des gestes éligibles selon la situation + le parcours.
 *
 * Règles clés (doc simulateur-architecture §10, doc 07 §5-§6) :
 * - ancienneté ≤ 2 ans → tous gestes rejetés (logement trop récent)
 * - résidence non principale → CDP Rénov ampleur non éligible (traité ailleurs), gestes MPR ok si RP
 *   (MPR exige résidence principale pour la plupart des gestes ; on applique la règle ici).
 * - BAR-TH-143 (SSC) : maisons individuelles métropole uniquement
 * - BAR-TH-113 (biomasse) : maisons individuelles uniquement
 * - Rose + parcours geste → tous rejetés (non éligible)
 */

import type { GesteId, Situation, Parcours } from '../types'

export interface RejetGeste {
  geste: GesteId
  raison: string
}

export interface FiltrageResult {
  retenus: GesteId[]
  rejets: RejetGeste[]
}

const GESTES_MAISON_UNIQUEMENT: GesteId[] = ['SSC', 'BIOMASSE']

export function filtrerGestesEligibles(
  gestes: GesteId[],
  situation: Situation,
  parcours: Parcours
): FiltrageResult {
  const retenus: GesteId[] = []
  const rejets: RejetGeste[] = []

  // Règle globale : ancienneté < 2 ans → tout rejeté
  if (situation.anciennete === 'moins_2_ans') {
    for (const g of gestes) {
      rejets.push({
        geste: g,
        raison: 'Logement de moins de 2 ans : non éligible aux aides rénovation énergétique.',
      })
    }
    return { retenus, rejets }
  }

  // Règle globale : Rose + parcours geste → tout rejeté
  if (situation.categorie === 'rose' && parcours === 'geste') {
    for (const g of gestes) {
      rejets.push({
        geste: g,
        raison:
          'Catégorie Rose (supérieur) non éligible au parcours par geste. Orientez-vous vers le parcours accompagné.',
      })
    }
    return { retenus, rejets }
  }

  // Règle globale : résidence non principale + parcours accompagné → rejet
  // (le CDP Rénov ampleur exige la résidence principale depuis 17/01/2026)
  if (!situation.residencePrincipale && parcours === 'accompagne') {
    for (const g of gestes) {
      rejets.push({
        geste: g,
        raison:
          'Parcours accompagné (Rénov ampleur) exige une résidence principale depuis le 17/01/2026.',
      })
    }
    return { retenus, rejets }
  }

  for (const g of gestes) {
    // Résidence principale exigée pour MPR (parcours geste inclus)
    if (!situation.residencePrincipale) {
      rejets.push({
        geste: g,
        raison: "MaPrimeRénov' exige une résidence principale.",
      })
      continue
    }

    // Gestes maison uniquement
    if (GESTES_MAISON_UNIQUEMENT.includes(g) && situation.typeLogement !== 'maison') {
      rejets.push({
        geste: g,
        raison: `${g} réservé aux maisons individuelles.`,
      })
      continue
    }

    retenus.push(g)
  }

  return { retenus, rejets }
}
