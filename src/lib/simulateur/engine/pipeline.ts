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
  calcBarTh143,
  calcVMCSimpleFlux,
  computeBarTh171,
  calcBarEn101,
  calcBarEn102,
  calcBarEn103,
  equipToEnergie,
  fourchettePrime,
  calcCeeAmpleur,
  calcMarPriseEnCharge,
} from './calc-cee'
import { SURFACE_ISOLEE_RATIOS } from '../baremes/2026-01'
import { calcCoupDePouce, calcCdpRenovAmpleur } from './calc-cdp'
import { calcEcoPtz, calcPar } from './calc-prets'
import { calcMprCopro, calcDenormandie, calcTaxeFonciere } from './calc-complementaires'
import type { MprCoproResult, DenormandieResult, TaxeFonciereResult } from './calc-complementaires'
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
  /** Inputs optionnels pour aides complémentaires (Denormandie, taxe foncière, copro). */
  complementaires?: {
    /** Gain énergétique estimé en % (copropriété). */
    gainEnergetiquePct?: number
    /** Sortie passoire énergétique F/G (copropriété). */
    sortiePassoire?: boolean
    /** Copropriété fragile (copropriété). */
    coproFragile?: boolean
    /** Durée d'engagement locatif Denormandie. */
    denormandieDuree?: 6 | 9 | 12
    /** Montant total investissement Denormandie (achat + travaux). */
    denormandieInvestissement?: number
    /** Taxe foncière annuelle actuelle (pour estimer l'exonération). */
    taxeFonciereAnnuelle?: number
    /** Taux d'exonération taxe foncière (50% ou 100%, selon commune). */
    taxeFonciereTaux?: 0.5 | 1.0
  }
}

export interface SimulationResult {
  categorieAnah: CategorieAnah
  gestesRetenus: GesteId[]
  gestesRejetes: { geste: GesteId; raison: string }[]

  mprTotal: number
  /** Budget HT plafonné (parcours accompagné uniquement). */
  mprBudgetPlafonne?: number
  /** Plafond HT applicable (parcours accompagné uniquement). */
  mprPlafondHt?: number
  ceeFourchetteBas: number
  ceeFourchetteHaut: number
  /** CEE rénovation d'ampleur (parcours accompagné uniquement). */
  ceeAmpleur: number
  cdpEstimationBas: number
  cdpEstimationHaut: number
  /** Prise en charge MAR par l'État (parcours accompagné uniquement). */
  marPriseEnCharge: number

  totalAidesBas: number
  totalAidesHaut: number

  ecretementPct: number
  ecretementAtteint: boolean

  resteAChargeBas: number
  resteAChargeHaut: number

  /** Éco-PTZ — prêt à taux zéro (non inclus dans écrêtement). */
  ecoPtz: {
    eligible: boolean
    montantMax: number
    dureeMaxAns: number
  }
  /** PAR+ — Prêt Avance Rénovation, bleu/jaune uniquement (non inclus dans écrêtement). */
  par: {
    eligible: boolean
    montantMax: number
  }

  /** Aides complémentaires informatives (hors écrêtement). */
  complementaires: {
    mprCopro?: MprCoproResult
    denormandie?: DenormandieResult
    taxeFonciere?: TaxeFonciereResult
  }

  baremeIds: BaremeId[]
  formuleDebug: FormuleDebug[]

  /** Message d'erreur utilisateur si exclusion totale (Rose + geste, tous gestes rejetés). */
  exclusion?: string

  /** Lead fioul = high priority (remplacement chaudière fioul, valeur 5x). */
  leadPriority: 'high' | 'normal'
  /** Parcours accompagné avec MPR > 0 → nécessite un Mon Accompagnateur Rénov'. */
  necessiteMAR: boolean
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
      ceeAmpleur: 0,
      cdpEstimationBas: 0,
      cdpEstimationHaut: 0,
      marPriseEnCharge: 0,
      totalAidesBas: 0,
      totalAidesHaut: 0,
      ecretementPct: 0,
      ecretementAtteint: true,
      resteAChargeBas: budgetTTC,
      resteAChargeHaut: budgetTTC,
      ecoPtz: { eligible: false, montantMax: 0, dureeMaxAns: 0 },
      par: { eligible: false, montantMax: 0 },
      complementaires: {},
      baremeIds,
      formuleDebug: debug,
      exclusion,
      leadPriority: projet.equipementActuel === 'fioul' ? 'high' : 'normal',
      necessiteMAR: false, // no aids → no MAR needed
    }
  }

  // --- 3. MPR ---
  let mprTotal = 0
  let mprBaremeIds: BaremeId[] = []
  let mprAccompagneRes: ReturnType<typeof calcMPRAccompagne> | undefined
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
    mprAccompagneRes = calcMPRAccompagne(budget.budgetHt, categorie, sautsDpe)
    mprTotal = mprAccompagneRes.total
    mprBaremeIds = [mprAccompagneRes.baremeId]
    debug.push({
      step: 'calcMPRAccompagne',
      inputs: { budgetHt: budget.budgetHt, categorie, sautsDpe },
      outputs: {
        total: mprAccompagneRes.total,
        taux: mprAccompagneRes.taux,
        budgetPlafonne: mprAccompagneRes.budgetPlafonne,
        plafondHt: mprAccompagneRes.plafondHt,
      },
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
      } else if (g === 'SSC' && situation.typeLogement === 'maison') {
        const r = calcBarTh143(situation.zone)
        const fr = fourchettePrime(r.kwhCumac)
        aidesCee.push({
          code: 'BAR-TH-143',
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
      } else if (
        g === 'ISOLATION_MURS' || g === 'ISOLATION_TOITURE' || g === 'ISOLATION_PLANCHER' ||
        g === 'ISO_TOITURE_RAMPANTS' || g === 'ISO_TOITURE_TERRASSE' || g === 'ISO_PLANCHERS_BAS' ||
        g === 'ITE' || g === 'ITI'
      ) {
        // BAR-EN-101/102/103 : surface isolée estimée via ratio sur surface habitable
        const ratio = SURFACE_ISOLEE_RATIOS[g] ?? 1.0
        const surfaceEstimee = Math.round(situation.surface * ratio)
        const energie = equipToEnergie(projet.equipementActuel)

        let rIso: { kwhCumac: number; baremeId: BaremeId }
        let ficheIso: string
        if (g === 'ISOLATION_MURS' || g === 'ITE' || g === 'ITI') {
          rIso = calcBarEn102(situation.zone, surfaceEstimee, energie)
          ficheIso = 'BAR-EN-102'
        } else if (g === 'ISOLATION_TOITURE' || g === 'ISO_TOITURE_RAMPANTS') {
          rIso = calcBarEn101(situation.zone, surfaceEstimee, energie)
          ficheIso = 'BAR-EN-101'
        } else {
          // plancher bas, toiture terrasse
          rIso = calcBarEn103(situation.zone, surfaceEstimee)
          ficheIso = 'BAR-EN-103'
        }

        const frIso = fourchettePrime(rIso.kwhCumac)
        aidesCee.push({
          code: ficheIso,
          montant: Math.round((frIso.bas + frIso.haut) / 2),
          meta: { kwhc: rIso.kwhCumac, baremeId: rIso.baremeId, fourchette: frIso, geste: g, surfaceEstimee, ratio },
        })
        baremeIds.push(rIso.baremeId)
      } else if (g === 'VMC_2FLUX' || g === 'POELE_GRANULES' || g === 'POELE_BUCHES' || g === 'CESI' || g === 'PAC_GEOTHERMIE') {
        // STUB: fiches CEE non encore implémentées. Montant CEE = 0€ avec trace.
        const ficheMap: Record<string, string> = {
          VMC_2FLUX: 'BAR-TH-125', POELE_GRANULES: 'BAR-TH-112', POELE_BUCHES: 'BAR-TH-112',
          CESI: 'BAR-TH-101', PAC_GEOTHERMIE: 'BAR-TH-104',
        }
        const fiche = ficheMap[g] ?? 'BAR-TH-UNKNOWN'
        const stubBaremeId = asBaremeId(`CEE.${fiche}.STUB.NON_IMPLEMENTE.2026-01`)
        aidesCee.push({
          code: fiche,
          montant: 0,
          meta: { kwhc: 0, baremeId: stubBaremeId, fourchette: { bas: 0, haut: 0 }, geste: g, stub: true },
        })
        baremeIds.push(stubBaremeId)
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

  // --- 5b. CEE rénovation d'ampleur (parcours accompagné uniquement) ---
  let ceeAmpleurMontant = 0
  if (projet.parcours === 'accompagne') {
    const sautsDpe = projet.sautsDpe ?? 2
    const ceeAmp = calcCeeAmpleur(sautsDpe, situation.surface)
    ceeAmpleurMontant = ceeAmp.montant
    baremeIds.push(ceeAmp.baremeId)
    debug.push({
      step: 'calcCeeAmpleur',
      inputs: { sautsDpe, surface: situation.surface },
      outputs: { montant: ceeAmp.montant, base: ceeAmp.base, facteurSurface: ceeAmp.facteurSurface },
      baremeIds: [ceeAmp.baremeId],
    })
  }

  // --- 5c. Prise en charge MAR (parcours accompagné uniquement) ---
  let marMontant = 0
  if (projet.parcours === 'accompagne') {
    const marRes = calcMarPriseEnCharge(categorie)
    marMontant = marRes.montant
    baremeIds.push(marRes.baremeId)
    debug.push({
      step: 'calcMarPriseEnCharge',
      inputs: { categorie },
      outputs: { montant: marRes.montant, taux: marRes.taux },
      baremeIds: [marRes.baremeId],
    })
  }

  // --- 5d. Prêts (éco-PTZ + PAR) — informatifs, hors écrêtement ---
  const ecoPtzRes = calcEcoPtz(projet.parcours, retenus.length)
  baremeIds.push(ecoPtzRes.baremeId)
  debug.push({
    step: 'calcEcoPtz',
    inputs: { parcours: projet.parcours, nbGestes: retenus.length, sautsDpe: projet.sautsDpe },
    outputs: { eligible: ecoPtzRes.eligible, montantMax: ecoPtzRes.montantMax, workType: ecoPtzRes.workType },
    baremeIds: [ecoPtzRes.baremeId],
  })

  const parRes = calcPar(categorie, projet.parcours, retenus.length)
  baremeIds.push(parRes.baremeId)
  debug.push({
    step: 'calcPar',
    inputs: { categorie, parcours: projet.parcours, nbGestes: retenus.length },
    outputs: { eligible: parRes.eligible, montantMax: parRes.montantMax },
    baremeIds: [parRes.baremeId],
  })

  // --- 6. Agrégation pré-écrêtement ---
  const ceeTotal = projet.parcours === 'geste'
    ? Math.round((ceeBas + ceeHaut) / 2)
    : ceeAmpleurMontant
  const toutesAides: AideCalculee[] = [
    { code: 'MPR', montant: mprTotal, label: "MaPrimeRénov'" },
    { code: 'CEE_TOTAL', montant: ceeTotal, label: 'CEE' },
    { code: 'CDP', montant: Math.round((cdpBas + cdpHaut) / 2), label: 'Coup de Pouce' },
    { code: 'MAR', montant: marMontant, label: 'Prise en charge MAR' },
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
  const ceeAmpleurFinal = Math.round(ceeAmpleurMontant * ratio)
  const cdpBasFinal = Math.round(cdpBas * ratio)
  const cdpHautFinal = Math.round(cdpHaut * ratio)
  const marFinal = Math.round(marMontant * ratio)

  // --- 8. Reste à charge ---
  // En parcours accompagné : CEE ampleur remplace la fourchette CEE fiches
  const ceeBasEffectif = projet.parcours === 'geste' ? ceeBasFinal : ceeAmpleurFinal
  const ceeHautEffectif = projet.parcours === 'geste' ? ceeHautFinal : ceeAmpleurFinal
  const totalBas = mprFinal + ceeBasEffectif + cdpBasFinal + marFinal
  const totalHaut = mprFinal + ceeHautEffectif + cdpHautFinal + marFinal
  const rac = calcResteACharge(budgetTTC, { bas: totalBas, haut: totalHaut })
  debug.push({
    step: 'calcResteACharge',
    inputs: { budgetTTC, totalBas, totalHaut },
    outputs: rac,
    baremeIds: [],
  })

  // --- 9. Aides complémentaires (informatives, hors écrêtement) ---
  const comp = input.complementaires ?? {}
  const complementaires: SimulationResult['complementaires'] = {}

  // MPR Copropriété
  if (situation.copropriete && comp.gainEnergetiquePct) {
    const nbLogements = 1 // simulateur individuel : quote-part d'un copropriétaire
    const budgetHtParLogement = budget.budgetHt / nbLogements
    const coproRes = calcMprCopro(budgetHtParLogement, categorie, comp.gainEnergetiquePct, {
      sortiePassoire: comp.sortiePassoire,
      coproFragile: comp.coproFragile,
    })
    complementaires.mprCopro = coproRes
    baremeIds.push(coproRes.baremeId)
    debug.push({
      step: 'calcMprCopro',
      inputs: { budgetHtParLogement, categorie, gainPct: comp.gainEnergetiquePct },
      outputs: { totalEstime: coproRes.totalEstime, tauxBase: coproRes.tauxBase },
      baremeIds: [coproRes.baremeId],
    })
  }

  // Denormandie (investisseur locatif uniquement)
  if (situation.investisseurLocatif && comp.denormandieInvestissement && comp.denormandieDuree) {
    const denoRes = calcDenormandie(
      comp.denormandieInvestissement,
      situation.surface,
      comp.denormandieDuree
    )
    complementaires.denormandie = denoRes
    baremeIds.push(denoRes.baremeId)
    debug.push({
      step: 'calcDenormandie',
      inputs: { investissement: comp.denormandieInvestissement, surface: situation.surface, duree: comp.denormandieDuree },
      outputs: { reductionTotale: denoRes.reductionImpotTotale, reductionAnnuelle: denoRes.reductionImpotAnnuelle },
      baremeIds: [denoRes.baremeId],
    })
  }

  // Taxe foncière (si dépenses suffisantes)
  const tfRes = calcTaxeFonciere(
    budgetTTC,
    comp.taxeFonciereAnnuelle,
    comp.taxeFonciereTaux ?? 0.5
  )
  if (tfRes.eligible) {
    complementaires.taxeFonciere = tfRes
    baremeIds.push(tfRes.baremeId)
    debug.push({
      step: 'calcTaxeFonciere',
      inputs: { depenses: budgetTTC, tfAnnuelle: comp.taxeFonciereAnnuelle },
      outputs: { eligible: true, exonerationAnnuelle: tfRes.exonerationEstimeeAnnuelle },
      baremeIds: [tfRes.baremeId],
    })
  }

  return {
    categorieAnah: categorie,
    gestesRetenus: retenus,
    gestesRejetes: rejets,
    mprTotal: mprFinal,
    mprBudgetPlafonne: mprAccompagneRes?.budgetPlafonne,
    mprPlafondHt: mprAccompagneRes?.plafondHt,
    ceeFourchetteBas: ceeBasFinal,
    ceeFourchetteHaut: ceeHautFinal,
    ceeAmpleur: ceeAmpleurFinal,
    cdpEstimationBas: cdpBasFinal,
    cdpEstimationHaut: cdpHautFinal,
    marPriseEnCharge: marFinal,
    totalAidesBas: totalBas,
    totalAidesHaut: totalHaut,
    ecretementPct: ec.plafondPct,
    ecretementAtteint: ec.plafondAtteint,
    resteAChargeBas: rac.bas,
    resteAChargeHaut: rac.haut,
    ecoPtz: {
      eligible: ecoPtzRes.eligible,
      montantMax: ecoPtzRes.montantMax,
      dureeMaxAns: ecoPtzRes.dureeMaxAns,
    },
    par: {
      eligible: parRes.eligible,
      montantMax: parRes.montantMax,
    },
    complementaires,
    baremeIds,
    formuleDebug: debug,
    exclusion: ec.exclusionMessage,
    leadPriority: projet.equipementActuel === 'fioul' ? 'high' : 'normal',
    necessiteMAR: projet.parcours === 'accompagne' && mprFinal > 0,
  }
}
