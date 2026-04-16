/**
 * Aides complémentaires : MPR Copropriété, Denormandie, Taxe foncière.
 *
 * Ces aides sont informatives dans le simulateur — elles dépendent de
 * conditions que le simulateur ne peut pas toujours vérifier (zone Denormandie,
 * délibération communale pour taxe foncière, vote de copro, etc.).
 *
 * Elles ne sont PAS incluses dans l'écrêtement ni le reste à charge principal.
 */

import type { BaremeId, CategorieAnah } from '../types'
import { asBaremeId } from '../types'
import {
  MPR_COPRO_TAUX,
  MPR_COPRO_PLAFOND_HT_PAR_LOGEMENT,
  MPR_COPRO_BONUS_PASSOIRE_PCT,
  MPR_COPRO_BONUS_FRAGILE_PCT,
  MPR_COPRO_COMPLEMENT_INDIVIDUEL,
  DENORMANDIE_TAUX,
  DENORMANDIE_PLAFOND_INVESTISSEMENT,
  DENORMANDIE_PLAFOND_M2,
  type DenormandieDuree,
  TAXE_FONCIERE_SEUIL_1AN,
  TAXE_FONCIERE_DUREE_ANS,
} from '../baremes/2026-01'

// ---------- MPR Copropriété ----------

export interface MprCoproResult {
  eligible: boolean
  /** Subvention collective estimée par logement. */
  montantCollectifParLogement: number
  /** Complément individuel (bleu/jaune uniquement). */
  complementIndividuel: number
  /** Total estimé pour le copropriétaire (collectif/nb_lots + individuel). */
  totalEstime: number
  tauxBase: number
  bonusPassoire: boolean
  bonusFragile: boolean
  baremeId: BaremeId
}

/**
 * Estimation MPR Copropriété pour un copropriétaire.
 *
 * Conditions minimales :
 * - Copropriété, immeuble ≥ 15 ans
 * - ≥ 65% résidences principales (≤ 20 lots) ou ≥ 75% (> 20 lots)
 * - Gain énergétique ≥ 35%
 * - MAR/AMO obligatoire
 */
export function calcMprCopro(
  budgetHtParLogement: number,
  categorie: CategorieAnah,
  gainEnergetiquePct: number,
  options?: {
    sortiePassoire?: boolean
    coproFragile?: boolean
  }
): MprCoproResult {
  // Déterminer le taux de base selon le gain énergétique
  let tauxBase = 0
  for (const { seuil, taux } of MPR_COPRO_TAUX) {
    if (gainEnergetiquePct >= seuil) {
      tauxBase = taux
      break
    }
  }

  if (tauxBase === 0) {
    return {
      eligible: false,
      montantCollectifParLogement: 0,
      complementIndividuel: 0,
      totalEstime: 0,
      tauxBase: 0,
      bonusPassoire: false,
      bonusFragile: false,
      baremeId: asBaremeId('MPR.COPRO.NON_ELIGIBLE.2026-01'),
    }
  }

  const depensesPlafonnees = Math.min(budgetHtParLogement, MPR_COPRO_PLAFOND_HT_PAR_LOGEMENT)
  let tauxTotal = tauxBase

  const bonusPassoire = options?.sortiePassoire ?? false
  const bonusFragile = options?.coproFragile ?? false

  if (bonusPassoire) tauxTotal += MPR_COPRO_BONUS_PASSOIRE_PCT
  if (bonusFragile) tauxTotal += MPR_COPRO_BONUS_FRAGILE_PCT

  const montantCollectif = Math.round(depensesPlafonnees * tauxTotal)
  const complementIndividuel = MPR_COPRO_COMPLEMENT_INDIVIDUEL[categorie] ?? 0
  const totalEstime = montantCollectif + complementIndividuel

  return {
    eligible: true,
    montantCollectifParLogement: montantCollectif,
    complementIndividuel,
    totalEstime,
    tauxBase,
    bonusPassoire,
    bonusFragile,
    baremeId: asBaremeId(`MPR.COPRO.${Math.round(gainEnergetiquePct)}PCT.2026-01`),
  }
}

// ---------- Denormandie ----------

export interface DenormandieResult {
  eligible: boolean
  /** Réduction d'impôt estimée sur la durée d'engagement. */
  reductionImpotTotale: number
  /** Réduction d'impôt annuelle. */
  reductionImpotAnnuelle: number
  taux: number
  duree: DenormandieDuree
  baremeId: BaremeId
}

/**
 * Estimation Denormandie.
 *
 * Conditions : investisseur locatif, zone éligible (non vérifiable ici),
 * travaux ≥ 25% du coût total, jusqu'au 31/12/2027.
 */
export function calcDenormandie(
  montantInvestissement: number,
  surface: number,
  duree: DenormandieDuree
): DenormandieResult {
  const plafondM2 = surface * DENORMANDIE_PLAFOND_M2
  const assiette = Math.min(montantInvestissement, DENORMANDIE_PLAFOND_INVESTISSEMENT, plafondM2)
  const taux = DENORMANDIE_TAUX[duree]
  const reductionTotale = Math.round(assiette * taux)
  const reductionAnnuelle = Math.round(reductionTotale / duree)

  return {
    eligible: true,
    reductionImpotTotale: reductionTotale,
    reductionImpotAnnuelle: reductionAnnuelle,
    taux,
    duree,
    baremeId: asBaremeId(`DENORMANDIE.${duree}ANS.2026-01`),
  }
}

// ---------- Taxe foncière ----------

export interface TaxeFonciereResult {
  eligible: boolean
  /** Exonération estimée annuelle (nécessite montant TF réel). */
  exonerationEstimeeAnnuelle: number
  dureeAns: number
  tauxExoneration: number
  baremeId: BaremeId
}

/**
 * Estimation exonération taxe foncière.
 *
 * Conditions : logement achevé avant 01/01/1989, dépenses ≥ 10K€ dans l'année
 * (ou ≥ 15K€ sur 3 ans), délibération communale requise.
 *
 * @param depensesEligibles Total des dépenses de rénovation énergétique
 * @param taxeFonciereAnnuelle Montant TF annuel (si connu)
 * @param tauxExoneration 0.5 ou 1.0 selon délibération communale
 */
export function calcTaxeFonciere(
  depensesEligibles: number,
  taxeFonciereAnnuelle?: number,
  tauxExoneration: 0.5 | 1.0 = 0.5
): TaxeFonciereResult {
  const eligible = depensesEligibles >= TAXE_FONCIERE_SEUIL_1AN

  if (!eligible) {
    return {
      eligible: false,
      exonerationEstimeeAnnuelle: 0,
      dureeAns: 0,
      tauxExoneration: 0,
      baremeId: asBaremeId('TAXE_FONCIERE.NON_ELIGIBLE.2026-01'),
    }
  }

  const exonerationAnnuelle = taxeFonciereAnnuelle
    ? Math.round(taxeFonciereAnnuelle * tauxExoneration)
    : 0

  return {
    eligible: true,
    exonerationEstimeeAnnuelle: exonerationAnnuelle,
    dureeAns: TAXE_FONCIERE_DUREE_ANS,
    tauxExoneration,
    baremeId: asBaremeId(`TAXE_FONCIERE.${Math.round(tauxExoneration * 100)}PCT.2026-01`),
  }
}
