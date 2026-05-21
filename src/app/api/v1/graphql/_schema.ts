/**
 * GraphQL SDL — Pillar 2 RGE-OS (cf. docs/RGE-OS-MANIFESTO.md)
 *
 * Source de vérité de la surface GraphQL. Les resolvers (_resolvers.ts) et
 * l'executor (_executor.ts) consomment exactement ce contrat.
 *
 * Subset volontairement minimal v0.1 :
 *   - Query root only (mutations v0.2)
 *   - Args littéraux (pas de variables)
 *   - Pas de fragments / alias / directives
 *
 * License : CC-BY 4.0 (cohérent avec les REST endpoints Ralph 16/19).
 */

export const SDL = `"""
ServicesArtisans RGE-OS GraphQL Schema v1 (CC-BY 4.0).
Read-only GraphQL-as-RPC subset wrapping the REST endpoints already
exposed under /api/v1/{rge,aides}/* and the deterministic calculators
of @/lib/aides (Ralph 12) + @/lib/cee (Ralph 14).
"""
type Query {
  """Lookup a single RGE provider by SIRET (14 digits)."""
  rgeLookup(siret: String!): RgeProvider

  """Search RGE providers by trade + city. Limit defaults to 20 (max 50)."""
  rgeSearch(metier: String!, ville: String!, limit: Int): RgeSearchResult

  """Deterministic MaPrimeRenov 2026 bareme calculator."""
  mprBareme(input: MprBaremeInput!): MprBaremeResult

  """Deterministic CEE 2026 bareme calculator."""
  ceeBareme(input: CeeBaremeInput!): CeeBaremeResult

  """Cumul rules between aides (MPR + CEE + Eco-PTZ + TVA 5,5%)."""
  cumulRules: CumulRulesResult
}

type RgeProvider {
  siret: String!
  nom: String!
  ville: String
  departement: String
  qualifications: [RgeQualification!]!
}

type RgeQualification {
  code: String
  libelle: String
  date_debut: String
  date_fin: String
}

type RgeSearchResult {
  metier: String!
  ville: String!
  results: [RgeProviderSummary!]!
  total: Int!
}

type RgeProviderSummary {
  siret: String!
  nom: String!
  qualifications_count: Int!
}

input MprBaremeInput {
  geste: String!
  menageCategorie: String!
  zone: String!
  rfr: Int!
  nbPersonnes: Int!
}

type MprBaremeResult {
  result: MprBaremeResultPayload!
  input: MprBaremeInputEcho!
}

type MprBaremeResultPayload {
  eligible: Boolean!
  amountEUR: Int
  sourceRef: String
  reason: String
  notes: String
}

type MprBaremeInputEcho {
  geste: String!
  menageCategorie: String!
  zone: String!
  rfr: Int!
  nbPersonnes: Int!
}

input CeeBaremeInput {
  geste: String!
  zoneClimatique: String!
  typeLogement: String!
  menageCategorie: String!
}

type CeeBaremeResult {
  result: CeeBaremeResultPayload!
  input: CeeBaremeInputEcho!
}

type CeeBaremeResultPayload {
  eligible: Boolean!
  montantTotalEur: Int
  kwhCumacForfait: Int
  kwhCumacAvecBonus: Int
  bonusMultiplicateur: Float
  prixUnitaireEurParMWh: Float
  fiche: String
  reason: String
  notes: String
}

type CeeBaremeInputEcho {
  geste: String!
  zoneClimatique: String!
  typeLogement: String!
  menageCategorie: String!
}

type CumulRulesResult {
  rules: [CumulRule!]!
}

type CumulRule {
  geste: String!
  cumulableMPR: Boolean!
  cumulableEcoPTZ: Boolean!
  cumulableTVA55: Boolean!
  notes: String
}
`.trim()

/**
 * Liste des root fields exposés. Sert à l'introspection minimale
 * (`{ __schema { queryType { fields { name } } } }`).
 */
export const ROOT_QUERY_FIELDS: ReadonlyArray<string> = [
  'rgeLookup',
  'rgeSearch',
  'mprBareme',
  'ceeBareme',
  'cumulRules',
]
