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

// Input pour /api/simulateur/submit : on demande tout (coordonnées + simulation)
export const submitInputSchema = z.object({
  situation: situationSchema,
  projet: projetSchema,
  budget: budgetSchema,
  coordonnees: coordonneesSchema,
})

export type SubmitInput = z.infer<typeof submitInputSchema>
