/**
 * Schemas Zod v4 pour les API routes simulateur.
 * Regroupe l'input SimulationInput (estimate) et l'input submit (coordonnées + simulation).
 */

import { z } from 'zod'
import { situationSchema, projetSchema, budgetSchema, coordonneesSchema } from './schemas'

// Input pour /api/simulateur/estimate
export const estimateInputSchema = z.object({
  situation: situationSchema,
  projet: projetSchema,
  budget: budgetSchema,
})

export type EstimateInput = z.infer<typeof estimateInputSchema>

// UTM / attribution (optionnel, envoyé par le front depuis les query params)
const utmSchema = z.object({
  utm_source: z.string().max(200).optional(),
  utm_medium: z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
  utm_term: z.string().max(200).optional(),
  utm_content: z.string().max(200).optional(),
  referrer: z.string().max(500).optional(),
}).optional()

// Signaux scoring Phase 2 (optionnels — absents si stepper pre-Phase 2)
const scoringSignalsSchema = z.object({
  urgenceProjet: z.enum(['urgent_panne', 'sous_3_mois', 'sous_6_mois', 'je_me_renseigne']).optional(),
  ageChaudiere: z.enum(['moins_5_ans', '5_10_ans', '10_15_ans', 'plus_15_ans', 'en_panne']).optional(),
}).optional()

// Input pour /api/simulateur/submit : on demande tout (coordonnées + simulation)
export const submitInputSchema = z.object({
  situation: situationSchema,
  projet: projetSchema,
  budget: budgetSchema,
  coordonnees: coordonneesSchema,
  attribution: utmSchema,
  scoring: scoringSignalsSchema,
})

export type SubmitInput = z.infer<typeof submitInputSchema>
