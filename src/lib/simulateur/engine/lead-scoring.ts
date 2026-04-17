/**
 * Lead scoring Phase 2 — score commercial /100 + segment hot/warm/cold.
 *
 * Hiérarchie des signaux (doc archi Phase 2) :
 *   1. Probabilité de signature  — urgence projet, catégorie ANAH
 *   2. Vitesse de signature      — urgence projet, âge chaudière
 *   3. Valeur du dossier         — total aides, parcours accompagné
 *
 * Signaux exploités (back-end only, zéro modification UI sauf 2 écrans) :
 *   - urgenceProjet urgent/panne → bonus très fort (lead chaud, signature rapide)
 *   - ageChaudiere en_panne / >15 ans → bonus fort (remplacement imminent)
 *   - equipementActuel fioul → bonus (remplacement urgent, valeur 5x)
 *   - catégorie ANAH bleu/jaune → aides plus élevées = lead plus chaud
 *   - parcours accompagné → projet plus gros
 *   - total_aides_haut → valeur monétaire du lead
 *   - confidenceLevel high → estimation fiable = lead mieux qualifié
 *   - forte incertitude → malus (estimation floue = lead mal qualifié)
 *
 * Le score est un entier 0-100. Les poids sont calibrés empiriquement
 * et destinés à être affinés avec les données de conversion réelles.
 */

import type { CategorieAnah, UrgenceProjet, AgeChaudiere } from '../types'

export type LeadSegment = 'hot' | 'warm' | 'cold'
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface LeadScoringInput {
  equipementActuel: string
  categorieAnah: CategorieAnah
  parcours: 'geste' | 'accompagne'
  totalAidesHaut: number
  confidenceLevel: ConfidenceLevel
  uncertaintyDiscount: number
  urgenceProjet?: UrgenceProjet | null
  ageChaudiere?: AgeChaudiere | null
}

export interface LeadScoringResult {
  leadScore: number
  leadSegment: LeadSegment
}

const FIOUL_BONUS = 15

const CATEGORIE_BONUS: Record<CategorieAnah, number> = {
  bleu: 10,
  jaune: 8,
  violet: 3,
  rose: 0,
}

const PARCOURS_BONUS: Record<string, number> = {
  accompagne: 10,
  geste: 3,
}

const CONFIDENCE_BONUS: Record<ConfidenceLevel, number> = {
  high: 5,
  medium: 0,
  low: -5,
}

const URGENCE_BONUS: Record<UrgenceProjet, number> = {
  urgent_panne: 25,
  sous_3_mois: 15,
  sous_6_mois: 5,
  je_me_renseigne: -10,
}

const AGE_CHAUDIERE_BONUS: Record<AgeChaudiere, number> = {
  en_panne: 20,
  plus_15_ans: 15,
  '10_15_ans': 8,
  '5_10_ans': 0,
  moins_5_ans: -5,
}

const SEGMENT_HOT_THRESHOLD = 70
const SEGMENT_WARM_THRESHOLD = 40

function aidesBonusPoints(totalAidesHaut: number): number {
  if (totalAidesHaut >= 20_000) return 15
  if (totalAidesHaut >= 10_000) return 12
  if (totalAidesHaut >= 5_000) return 8
  if (totalAidesHaut >= 2_000) return 5
  return 2
}

function uncertaintyMalus(discount: number): number {
  if (discount >= 0.30) return -5
  if (discount >= 0.15) return -3
  return 0
}

export function computeLeadScore(input: LeadScoringInput): LeadScoringResult {
  const base = 5

  const fioul = input.equipementActuel === 'fioul' ? FIOUL_BONUS : 0
  const categorie = CATEGORIE_BONUS[input.categorieAnah] ?? 0
  const parcours = PARCOURS_BONUS[input.parcours] ?? 3
  const aides = aidesBonusPoints(input.totalAidesHaut)
  const confidence = CONFIDENCE_BONUS[input.confidenceLevel] ?? 0
  const uncertainty = uncertaintyMalus(input.uncertaintyDiscount)
  const urgence = input.urgenceProjet ? (URGENCE_BONUS[input.urgenceProjet] ?? 0) : 0
  const ageChaudiere = input.ageChaudiere ? (AGE_CHAUDIERE_BONUS[input.ageChaudiere] ?? 0) : 0

  const raw = base + urgence + ageChaudiere + fioul + categorie + parcours + aides + confidence + uncertainty
  const leadScore = Math.max(0, Math.min(100, raw))

  const leadSegment: LeadSegment =
    leadScore >= SEGMENT_HOT_THRESHOLD ? 'hot'
    : leadScore >= SEGMENT_WARM_THRESHOLD ? 'warm'
    : 'cold'

  return { leadScore, leadSegment }
}
