/**
 * Public types for the @servicesartisans/rge-sdk client.
 *
 * Mirrors the server-side Zod validators on the SA v1 endpoints. Closed-set
 * unions are intentional: they help downstream consumers catch typos at
 * compile-time before the network round-trip.
 */

export type Geste =
  | 'pac_air_eau'
  | 'pac_geothermique'
  | 'pac_air_air'
  | 'chauffe_eau_thermo'
  | 'isolation_combles'
  | 'isolation_ite'
  | 'isolation_planchers_bas'
  | 'vmc_double_flux'
  | 'chaudiere_biomasse'
  | 'audit_energetique'

export type MenageCategorie = 'tres_modeste' | 'modeste' | 'intermediaire' | 'superieur'
export type ZoneRGE = 'idf' | 'hors_idf'
export type ZoneClimatique = 'H1' | 'H2' | 'H3'
export type TypeLogement = 'maison_individuelle' | 'appartement'

export type ApiMeta = {
  api_version: 'v1'
  license: 'CC-BY-4.0'
  snapshot_date?: string
  attribution?: string
  docs?: string
  disclosure?: string
}

export type RgeQualification = {
  code: string
  libelle: string
  date_debut: string
  date_fin: string
  valide: boolean
}

export type RgeLookupResult = {
  siret: string
  nom: string
  ville: string
  departement: string
  qualifications: Array<RgeQualification>
  _meta: ApiMeta
}

export type RgeSearchHit = {
  siret: string
  nom: string
  qualifications_count: number
}

export type RgeSearchResult = {
  metier: string
  ville: string
  results: Array<RgeSearchHit>
  total: number
  _meta: ApiMeta
}

export type MprBaremeInput = {
  geste: Geste
  menageCategorie: MenageCategorie
  zone: ZoneRGE
  rfr: number
  nbPersonnes: number
}

export type MprBaremeResult = {
  result: {
    eligible: boolean
    montant_eur?: number
    plafond_eur?: number
    reason?: string
  }
  input: MprBaremeInput
  _meta: ApiMeta
}

export type CeeBaremeInput = {
  geste: Geste
  zoneClimatique: ZoneClimatique
  typeLogement: TypeLogement
  menageCategorie: MenageCategorie
}

export type CeeBaremeResult = {
  result: {
    eligible: boolean
    montant_eur?: number
    reason?: string
  }
  input: CeeBaremeInput
  _meta: ApiMeta
}

export type AskCitedSource = {
  url: string
  title: string
  retrievedAt: string
}

export type AskInput = {
  query: string
  classification?: string
  aidesContext?: {
    geste: Geste
    menageCategorie?: MenageCategorie
    rfr?: number
    nbPersonnes?: number
    zone?: ZoneRGE
  }
  citedSources?: Array<AskCitedSource>
}

export type AskResult = {
  result: {
    ok: boolean
    answer?: string
    citations?: Array<{ url: string; title: string }>
    trace?: { provider: string; classification: string; latency_ms: number }
    reason?: string
  }
  _meta: ApiMeta
}

export type CumulRule = {
  aides: [string, string]
  cumulable: boolean
  reason: string
}

export type CumulRulesResult = {
  rules: Array<CumulRule>
  _meta: ApiMeta
}
