/**
 * Pipeline orchestrateur du simulateur d'aides rénovation.
 *
 * Enchaîne : classifier → eligibilite → calcMPR → calcCEE → calcCDP
 *          → applyNonCumul → applyEcretement → calcResteACharge
 *
 * Produit une trace FormuleDebug par étape pour traçabilité <30 s.
 */

import type {
  BaremeId,
  Budget,
  CategorieAnah,
  FormuleDebug,
  GesteId,
  Projet,
  Situation,
} from '../types'
import { asBaremeId } from '../types'
import { classifierCategorieAnah } from './classifier'
import { filtrerGestesEligibles } from './eligibilite'
import { calcMPRGeste, calcMPRAccompagne } from './calc-mpr'
import {
  calcBarTh148,
  calcBarTh113,
  calcVMCSimpleFlux,
  computeBarTh171,
  fourchettePrime,
} from './calc-cee'
import { calcCoupDePouce, calcCdpRenovAmpleur } from './calc-cdp'
import { applyNonCumul, type AideCalculee } from './non-cumul'
import { applyEcretement } from './ecretement'
import { calcResteACharge } from './reste-a-charge'

// ---------- Input / Output ----------
// (BUDGET_GESTE_FALLBACK réservé pour refactor futur — non utilisé)

export interface SimulationInput {
  situation: Situation
  projet: Projet
  budget: Budget
  /** TVA supposée pour conversion HT→TTC si non fournie. Default 5.5 %. */
  tvaRate?: number
}

export interface SimulationResult {
  categorieAnah: CategorieAnah
  gestesRetenus: GesteId[]
  gestesRejetes: { geste: GesteId; raison: string }[]

  mprTotal: number
  ceeFourchetteBas: number
  ceeFourchetteHaut: number
  cdpEstimationBas: number
  cdpEstimationHaut: number

  totalAidesBas: number
  totalAidesHaut: number

  ecretementPct: number
  ecretementAtteint: boolean

  resteAChargeBas: number
  resteAChargeHaut: number

  baremeIds: BaremeId[]
  formuleDebug: FormuleDebug[]

  /** Message d'erreur utilisateur si exclusion totale (Rose + geste, tous gestes rejetés). */
  exclusion?: string
}

export function runSimulation(input: SimulationInput): SimulationResult {
  const { situation, projet, budget } = input
  const tvaRate = input.tvaRate ?? 0.055
  const budgetTTC = Math.round(budget.budgetHt * (1 + tvaRate))

  const debug: FormuleDebug[] = []
  const baremeIds: BaremeId[] = []

  // --- 1. Classifier ---
  const categorie = classifierCategorieAnah(situation.rfr, situation.foyer, situation.idf)
  debug.push({
    step: 'classifier',
    inputs: { rfr: situation.rfr, foyer: situation.foyer, idf: situation.idf },
    outputs: { categorie },
    baremeIds: [],
  })

  // --- 2. Éligibilité ---
  const { retenus, rejets } = filtrerGestesEligibles(
    projet.gestes,
    { ...situation, categorie },
    projet.parcours
  )
  debug.push({
    step: 'eligibilite',
    inputs: { gestesDemandes: projet.gestes, parcours: projet.parcours },
    outputs: { retenus, rejets },
    baremeIds: [],
  })

  // Sortie anticipée : tous rejetés
  if (retenus.length === 0) {
    const exclusion =
      categorie === 'rose' && projet.parcours === 'geste'
        ? 'Catégorie Rose non éligible au parcours par geste. Orientez-vous vers le parcours accompagné.'
        : (rejets[0]?.raison ?? 'Aucun geste éligible selon votre situation.')
    return {
      categorieAnah: categorie,
      gestesRetenus: [],
      gestesRejetes: rejets,
      mprTotal: 0,
      ceeFourchetteBas: 0,
      ceeFourchetteHaut: 0,
      cdpEstimationBas: 0,
      cdpEstimationHaut: 0,
      totalAidesBas: 0,
      totalAidesHaut: 0,
      ecretementPct: 0,
      ecretementAtteint: true,
      resteAChargeBas: budgetTTC,
      resteAChargeHaut: budgetTTC,
      baremeIds,
      formuleDebug: debug,
      exclusion,
    }
  }

  // --- 3. MPR ---
  let mprTotal = 0
  let mprBaremeIds: BaremeId[] = []
  if (projet.parcours === 'geste') {
    const mprRes = calcMPRGeste(retenus, categorie)
    mprTotal = mprRes.total
    mprBaremeIds = mprRes.breakdown.map((b) => b.baremeId)
    debug.push({
      step: 'calcMPRGeste',
      inputs: { retenus, categorie },
      outputs: { total: mprRes.total, breakdown: mprRes.breakdown },
      baremeIds: mprBaremeIds,
    })
  } else {
    const sautsDpe = projet.sautsDpe ?? 2
    const mprRes = calcMPRAccompagne(budget.budgetHt, categorie, sautsDpe)
    mprTotal = mprRes.total
    mprBaremeIds = [mprRes.baremeId]
    debug.push({
      step: 'calcMPRAccompagne',
      inputs: { budgetHt: budget.budgetHt, categorie, sautsDpe },
      outputs: { total: mprRes.total, taux: mprRes.taux },
      baremeIds: mprBaremeIds,
    })
  }
  baremeIds.push(...mprBaremeIds)

  // --- 4. CEE (parcours geste uniquement) ---
  const aidesCee: AideCalculee[] = []
  let ceeBas = 0
  let ceeHaut = 0
  if (projet.parcours === 'geste') {
    for (const g of retenus) {
      if (g === 'CET') {
        const r = calcBarTh148(situation.typeLogement)
        const fr = fourchettePrime(r.kwhCumac)
        aidesCee.push({
          code: 'BAR-TH-148',
          montant: Math.round((fr.bas + fr.haut) / 2),
          meta: { kwhc: r.kwhCumac, baremeId: r.baremeId, fourchette: fr, geste: g },
        })
        baremeIds.push(r.baremeId)
      } else if (g === 'BIOMASSE' && situation.typeLogement === 'maison') {
        const r = calcBarTh113(situation.zone)
        const fr = fourchettePrime(r.kwhCumac)
        aidesCee.push({
          code: 'BAR-TH-113',
          montant: Math.round((fr.bas + fr.haut) / 2),
          meta: { kwhc: r.kwhCumac, baremeId: r.baremeId, fourchette: fr, geste: g },
        })
        baremeIds.push(r.baremeId)
      } else if (g === 'VMC_SF') {
        const r = calcVMCSimpleFlux(situation.zone, situation.surface, 'B_caisson_BC')
        const fr = fourchettePrime(r.kwhCumac)
        aidesCee.push({
          code: 'BAR-TH-127',
          montant: Math.round((fr.bas + fr.haut) / 2),
          meta: { kwhc: r.kwhCumac, baremeId: r.baremeId, fourchette: fr, geste: g },
        })
        baremeIds.push(r.baremeId)
      } else if (g === 'PAC_AIREAU') {
        // Utilise BAR-TH-171 (formule variable, placeholder)
        const r = computeBarTh171(situation.zone, 2, situation.surface, situation.typeLogement)
        const fr = fourchettePrime(r.kwhCumac)
        aidesCee.push({
          code: 'BAR-TH-171',
          montant: Math.round((fr.bas + fr.haut) / 2),
          meta: { kwhc: r.kwhCumac, baremeId: r.baremeId, fourchette: fr, geste: g },
        })
        baremeIds.push(r.baremeId)
      }
    }
    const nc = applyNonCumul(aidesCee)
    debug.push({
      step: 'applyNonCumul',
      inputs: { aides: aidesCee.map((a) => ({ code: a.code, montant: a.montant })) },
      outputs: { retenues: nc.retenues.map((r) => r.code), exclusions: nc.exclusions },
      baremeIds: [],
    })
    // Recalcul fourchette sur aides retenues
    for (const aide of nc.retenues) {
      const fr = (aide.meta?.fourchette as { bas: number; haut: number }) ?? {
        bas: aide.montant,
        haut: aide.montant,
      }
      ceeBas += fr.bas
      ceeHaut += fr.haut
    }
  }

  // --- 5. Coup de Pouce ---
  let cdpBas = 0
  let cdpHaut = 0
  if (projet.coupDePouce) {
    if (projet.parcours === 'geste') {
      const cdp = calcCoupDePouce(retenus, categorie, projet.equipementActuel)
      cdpBas = cdp.estimation.bas
      cdpHaut = cdp.estimation.haut
      baremeIds.push(cdp.baremeId)
      debug.push({
        step: 'calcCoupDePouce',
        inputs: { retenus, categorie, equipementActuel: projet.equipementActuel },
        outputs: { estimation: cdp.estimation, conditions: cdp.conditions },
        baremeIds: [cdp.baremeId],
      })
    } else {
      const cdp = calcCdpRenovAmpleur(
        situation.surface,
        situation.residencePrincipale,
        situation.typeLogement
      )
      cdpBas = cdp.estimation.bas
      cdpHaut = cdp.estimation.haut
      baremeIds.push(cdp.baremeId)
      debug.push({
        step: 'calcCdpRenovAmpleur',
        inputs: {
          surface: situation.surface,
          residencePrincipale: situation.residencePrincipale,
        },
        outputs: { estimation: cdp.estimation, conditions: cdp.conditions },
        baremeIds: [cdp.baremeId],
      })
    }
  }

  // --- 6. Agrégation pré-écrêtement ---
  const toutesAides: AideCalculee[] = [
    { code: 'MPR', montant: mprTotal, label: "MaPrimeRénov'" },
    { code: 'CEE_TOTAL', montant: Math.round((ceeBas + ceeHaut) / 2), label: 'CEE' },
    { code: 'CDP', montant: Math.round((cdpBas + cdpHaut) / 2), label: 'Coup de Pouce' },
  ]

  // --- 7. Écrêtement ---
  const ec = applyEcretement(toutesAides, budgetTTC, categorie, projet.parcours)
  debug.push({
    step: 'applyEcretement',
    inputs: { budgetTTC, categorie, parcours: projet.parcours, plafondPct: ec.plafondPct },
    outputs: {
      plafondAtteint: ec.plafondAtteint,
      totalAvant: ec.totalAvantPlafond,
      totalApres: ec.totalApresPlafond,
      exclusion: ec.exclusionMessage,
    },
    baremeIds: [
      asBaremeId(`ECRETEMENT.${projet.parcours.toUpperCase()}.${categorie.toUpperCase()}.2026-01`),
    ],
  })

  // Appliquer le ratio d'écrêtement aux fourchettes
  const ratio =
    ec.totalAvantPlafond > 0 && ec.plafondAtteint ? ec.totalApresPlafond / ec.totalAvantPlafond : 1

  const mprFinal = Math.round(mprTotal * ratio)
  const ceeBasFinal = Math.round(ceeBas * ratio)
  const ceeHautFinal = Math.round(ceeHaut * ratio)
  const cdpBasFinal = Math.round(cdpBas * ratio)
  const cdpHautFinal = Math.round(cdpHaut * ratio)

  // --- 8. Reste à charge ---
  const totalBas = mprFinal + ceeBasFinal + cdpBasFinal
  const totalHaut = mprFinal + ceeHautFinal + cdpHautFinal
  const rac = calcResteACharge(budgetTTC, { bas: totalBas, haut: totalHaut })
  debug.push({
    step: 'calcResteACharge',
    inputs: { budgetTTC, totalBas, totalHaut },
    outputs: rac,
    baremeIds: [],
  })

  return {
    categorieAnah: categorie,
    gestesRetenus: retenus,
    gestesRejetes: rejets,
    mprTotal: mprFinal,
    ceeFourchetteBas: ceeBasFinal,
    ceeFourchetteHaut: ceeHautFinal,
    cdpEstimationBas: cdpBasFinal,
    cdpEstimationHaut: cdpHautFinal,
    totalAidesBas: totalBas,
    totalAidesHaut: totalHaut,
    ecretementPct: ec.plafondPct,
    ecretementAtteint: ec.plafondAtteint,
    resteAChargeBas: rac.bas,
    resteAChargeHaut: rac.haut,
    baremeIds,
    formuleDebug: debug,
    exclusion: ec.exclusionMessage,
  }
}
