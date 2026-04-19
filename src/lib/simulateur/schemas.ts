/**
 * Schemas Zod du simulateur d'aides rénovation
 * Source : docs/simulateur-architecture.md §2 (stepper) + §10 (cas limites)
 *
 * Note Zod v4 : l'API `errorMap`/`invalid_type_error` (v3) a été remplacée par
 * `{ error: "msg" }` au niveau du constructeur, et les messages par-validation
 * restent en 2e argument des méthodes (min/max/regex...).
 */

import { z } from 'zod'

const TELEPHONE_FR_E164 = /^(?:\+33|0)[1-9](?:\d{8})$/
const CP_FR = /^\d{5}$/

// ---------- Step 1 — Situation ----------

export const situationSchema = z.object({
  typeLogement: z.enum(['maison', 'appartement'], {
    error: 'Type de logement requis',
  }),
  residencePrincipale: z.boolean(),
  anciennete: z.enum(['moins_2_ans', '2_a_15_ans', 'plus_15_ans'], {
    error: 'Ancienneté du logement requise',
  }),
  surface: z
    .number({ error: 'Surface numérique requise' })
    .int()
    .min(15, 'Surface minimale 15 m²')
    .max(500, 'Surface maximale 500 m²'),
  codePostal: z.string().regex(CP_FR, 'Code postal invalide (5 chiffres)'),
  foyer: z
    .number({ error: 'Taille du foyer requise' })
    .int()
    .min(1, 'Foyer minimum 1 personne')
    .max(10, 'Foyer maximum 10 personnes'),
  rfr: z
    .number({ error: 'Revenu fiscal de référence requis' })
    .int()
    .nonnegative('Le RFR ne peut pas être négatif'),
  copropriete: z.boolean().optional().default(false),
  investisseurLocatif: z.boolean().optional().default(false),
})

export type SituationInput = z.infer<typeof situationSchema>

// ---------- Step 2 — Projet ----------

const GESTE_IDS = [
  'PAC_AIREAU',
  'PAC_GEOTHERMIE',
  'CET',
  'CESI',
  'SSC',
  'BIOMASSE',
  'POELE_GRANULES',
  'POELE_BUCHES',
  'VMC_SF',
  'VMC_2FLUX',
  'AUDIT_ENERGETIQUE',
  'ISOLATION_MURS',
  'ISOLATION_TOITURE',
  'ISOLATION_PLANCHER',
  'ISO_TOITURE_RAMPANTS',
  'ISO_TOITURE_TERRASSE',
  'ISO_PLANCHERS_BAS',
  'ITE',
  'ITI',
  'MENUISERIES',
] as const

const ISOLATION_GESTES = new Set<(typeof GESTE_IDS)[number]>([
  'ISOLATION_MURS',
  'ISOLATION_TOITURE',
  'ISOLATION_PLANCHER',
  'ISO_TOITURE_RAMPANTS',
  'ISO_TOITURE_TERRASSE',
  'ISO_PLANCHERS_BAS',
  'ITE',
  'ITI',
])

// Schéma brut (sans règles cross-field avec la situation)
const projetBaseSchema = z.object({
  parcours: z.enum(['geste', 'accompagne']),
  gestes: z.array(z.enum(GESTE_IDS)).min(1, 'Au moins un geste doit être sélectionné'),
  auditEnergetique: z.enum(['oui', 'non', 'prevu']).optional(),
  sautsDpe: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  coupDePouce: z.boolean(),
  equipementActuel: z.enum(['gaz', 'fioul', 'charbon', 'elec', 'bois', 'autre']),
  /**
   * Surfaces à isoler (m²), indexées par GesteId d'isolation.
   * Saisie par l'utilisateur quand au moins un geste NEEDS_SURFACE est coché.
   * Accepte 1..1000 m² ; en dehors de cette plage on considère l'input invalide.
   */
  surfacesIsolation_m2: z
    .record(
      z.enum(GESTE_IDS),
      z.number().int().min(1, 'Surface minimale 1 m²').max(1000, 'Surface maximale 1 000 m²')
    )
    .optional(),
})

export const projetSchema = projetBaseSchema.superRefine((data, ctx) => {
  // Règle bloquante (doc archi §2.2) : accompagné → min 2 gestes isolation
  if (data.parcours === 'accompagne') {
    const isolationCount = data.gestes.filter((g) => ISOLATION_GESTES.has(g)).length
    if (isolationCount < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['gestes'],
        message: 'Parcours accompagné : au moins 2 gestes d’isolation doivent être sélectionnés',
      })
    }
  }
})

export type ProjetInput = z.infer<typeof projetSchema>

/**
 * Règle cross-step : résidence secondaire + Coup de Pouce Rénovation d’ampleur
 * (parcours accompagné) → bloquant (doc archi §2.2).
 */
export const projetCrossSituationSchema = (residencePrincipale: boolean) =>
  projetBaseSchema.superRefine((data, ctx) => {
    // Règle isolation accompagné
    if (data.parcours === 'accompagne') {
      const isolationCount = data.gestes.filter((g) => ISOLATION_GESTES.has(g)).length
      if (isolationCount < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['gestes'],
          message: 'Parcours accompagné : au moins 2 gestes d’isolation doivent être sélectionnés',
        })
      }
    }

    // Règle CDP Rénov ampleur réservé résidence principale
    if (!residencePrincipale && data.parcours === 'accompagne' && data.coupDePouce) {
      ctx.addIssue({
        code: 'custom',
        path: ['coupDePouce'],
        message:
          'Le Coup de Pouce Rénovation d’ampleur est réservé à la résidence principale depuis le 17/01/2026',
      })
    }
  })

// ---------- Step 3 — Budget ----------

export const budgetSchema = z.object({
  budgetHt: z.number({ error: 'Budget numérique requis' }).min(1000, 'Budget minimum 1 000 € HT'),
  depensesParGeste: z.record(z.string(), z.number().nonnegative()).optional(),
})

export type BudgetInput = z.infer<typeof budgetSchema>

// ---------- Step 4 — Coordonnées ----------

export const coordonneesSchema = z.object({
  prenom: z.string().trim().min(1, 'Prénom requis').max(100),
  nom: z.string().trim().max(100).optional().default(''),
  email: z.string().trim().toLowerCase().email('Adresse email invalide').max(254),
  telephone: z
    .union([
      z.string().trim().regex(TELEPHONE_FR_E164, 'Téléphone invalide (format FR attendu)'),
      z.literal(''),
    ])
    .optional()
    .default(''),
  consentRgpd: z.literal(true, {
    error: 'Le consentement RGPD est obligatoire',
  }),
  consentMajorite: z.literal(true, {
    error: 'Vous devez certifier être majeur(e) et titulaire ou mandaté(e) pour le logement',
  }),
  consentDemarchage: z.boolean().default(false),
})

export type CoordonneesInput = z.infer<typeof coordonneesSchema>

// ---------- Regex exports (testables) ----------

export const __internal = {
  TELEPHONE_FR_E164,
  CP_FR,
  ISOLATION_GESTES,
  GESTE_IDS,
}
