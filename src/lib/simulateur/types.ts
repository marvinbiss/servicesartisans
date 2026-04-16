/**
 * Types du simulateur d'aides rénovation
 * Source : docs/simulateur-architecture.md §3, docs/baremes-sources/07-*.md §10
 */

// ---------- Enums / unions ----------

export type TypeLogement = 'maison' | 'appartement'

export type CategorieAnah = 'bleu' | 'jaune' | 'violet' | 'rose'

export type Parcours = 'geste' | 'accompagne'

export type ZoneClimatique = 'H1' | 'H2' | 'H3'

export type Anciennete = 'moins_2_ans' | '2_a_15_ans' | 'plus_15_ans'

export type EquipementActuel = 'gaz' | 'fioul' | 'charbon' | 'elec' | 'bois' | 'autre'

export type AuditStatus = 'oui' | 'non' | 'prevu'

export type SautsDpe = 2 | 3 | 4

export type GesteId =
  | 'PAC_AIREAU'
  | 'PAC_GEOTHERMIE'
  | 'CET'
  | 'CESI'
  | 'SSC'
  | 'BIOMASSE'
  | 'POELE_GRANULES'
  | 'POELE_BUCHES'
  | 'VMC_SF'
  | 'VMC_2FLUX'
  | 'AUDIT_ENERGETIQUE'
  | 'ISOLATION_MURS'
  | 'ISOLATION_TOITURE'
  | 'ISOLATION_PLANCHER'
  | 'ISO_TOITURE_RAMPANTS'
  | 'ISO_TOITURE_TERRASSE'
  | 'ISO_PLANCHERS_BAS'
  | 'ITE'
  | 'ITI'
  | 'MENUISERIES'

// Branded type for ID stables (doc archi §4)
export type BaremeId = string & { readonly __brand: 'BaremeId' }

export const asBaremeId = (raw: string): BaremeId => raw as BaremeId

// ---------- Step 1 — Situation ----------

export interface Situation {
  typeLogement: TypeLogement
  residencePrincipale: boolean
  anciennete: Anciennete
  surface: number // m²
  codePostal: string // 5 chiffres
  zone: ZoneClimatique
  idf: boolean
  foyer: number // 1..6 ; 6 signifie 6+
  rfr: number // euros
  categorie: CategorieAnah
  /** Logement en copropriété (MPR Copro). */
  copropriete?: boolean
  /** Investisseur locatif (Denormandie). */
  investisseurLocatif?: boolean
}

// ---------- Step 2 — Projet ----------

export interface Projet {
  parcours: Parcours
  gestes: GesteId[]
  auditEnergetique?: AuditStatus // si parcours accompagne
  sautsDpe?: SautsDpe // si parcours accompagne
  coupDePouce: boolean
  equipementActuel: EquipementActuel
}

// ---------- Step 3 — Budget ----------

export interface Budget {
  budgetHt: number // euros, ≥ 1000
  depensesParGeste?: Partial<Record<GesteId, number>>
}

// ---------- Step 4 — Coordonnées ----------

export interface Coordonnees {
  prenom: string
  nom: string
  email: string
  telephone: string // E.164 FR
  consentRgpd: boolean
  consentMajorite: boolean
  consentDemarchage: boolean
}

// ---------- Estimation / snapshot ----------

export interface GesteBreakdown {
  id: GesteId
  label: string
  forfait: number
  baremeId: BaremeId
}

export interface FormuleDebug {
  step: string
  inputs: Record<string, unknown>
  outputs: Record<string, unknown>
  baremeIds: BaremeId[]
  notes?: string
}

export interface Estimation {
  publicId: string // EST-YYYY-MM-DD-xxxxxx
  barometreVersion: string // "2026-01-14"

  // Situation snapshot
  typeLogement: TypeLogement
  residencePrincipale: boolean
  anciennete: Anciennete
  surface: number
  codePostal: string
  zoneClimatique: ZoneClimatique
  idf: boolean
  foyerTaille: number
  rfr: number
  categorieAnah: CategorieAnah

  // Projet snapshot
  parcours: Parcours
  gestes: GesteBreakdown[]
  coupDePouce: boolean
  equipementActuel: EquipementActuel
  sautsDpe?: SautsDpe

  // Résultats
  mprTotal: number
  ceeFourchetteBas: number
  ceeFourchetteHaut: number
  coupPouceEstimation: number
  ecretementPct: number
  resteAChargeBas: number
  resteAChargeHaut: number

  // Traçabilité
  baremeIds: BaremeId[]
  formuleDebug: FormuleDebug[]

  // Consentements
  consentRgpd: boolean
  consentDemarchage: boolean

  // Audit
  createdAt: string // ISO timestamp
  ipHash: string
  userAgent: string
}
