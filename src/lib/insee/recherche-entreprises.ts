/**
 * Client for recherche-entreprises.api.gouv.fr — powered by INSEE Sirene.
 *
 * No auth, no quota, no key. Public API maintained by Direction Interministérielle
 * du Numérique (DINUM). Official docs : https://recherche-entreprises.api.gouv.fr/
 *
 * Used by the RGE description pipeline to feed E-E-A-T signals (date_creation,
 * effectif, NAF, etat administratif) into the prompt v1.1 and noindex sweep.
 *
 * Rate limit : 7 req/s observed in practice. We hard-cap at 5 req/s to stay
 * safe under burst spikes.
 */

export type RechercheEntreprisesHit = {
  siren: string
  nom_complet: string
  nom_raison_sociale: string | null
  sigle: string | null
  nombre_etablissements: number
  nombre_etablissements_ouverts: number
  date_creation: string | null
  etat_administratif: string
  tranche_effectif_salarie: string | null
  annee_tranche_effectif_salarie: number | null
  siege: {
    siret: string
    activite_principale: string
    adresse: string | null
    code_postal: string | null
    libelle_commune: string | null
    region: string | null
    date_creation: string | null
    etat_administratif: string
    liste_rge: string[] | null
    tranche_effectif_salarie: string | null
    date_mise_a_jour_insee: string | null
  }
}

type RechercheEntreprisesResponse = {
  results: RechercheEntreprisesHit[]
  total_results: number
}

export const TRANCHE_EFFECTIF_LABELS: Record<string, string> = {
  NN: 'unités non employeuses',
  '00': '0 salarié',
  '01': '1 ou 2 salariés',
  '02': '3 à 5 salariés',
  '03': '6 à 9 salariés',
  '11': '10 à 19 salariés',
  '12': '20 à 49 salariés',
  '21': '50 à 99 salariés',
  '22': '100 à 199 salariés',
  '31': '200 à 249 salariés',
  '32': '250 à 499 salariés',
  '41': '500 à 999 salariés',
  '42': '1 000 à 1 999 salariés',
  '51': '2 000 à 4 999 salariés',
  '52': '5 000 à 9 999 salariés',
  '53': '10 000 salariés et plus',
}

const BASE_URL = 'https://recherche-entreprises.api.gouv.fr/search'

/**
 * Fetch one entry by SIREN (9 digits) or SIRET (14 digits).
 * The API accepts both and matches the head of the identifier.
 * Returns null if no hit, throws on transport or parsing errors.
 */
export async function fetchBySiren(
  identifier: string,
  fetchImpl: typeof fetch = fetch
): Promise<RechercheEntreprisesHit | null> {
  const cleaned = identifier.replace(/\s+/g, '')
  if (!/^\d{9,14}$/.test(cleaned)) {
    throw new Error(`fetchBySiren: invalid identifier ${identifier}`)
  }
  const url = `${BASE_URL}?q=${encodeURIComponent(cleaned)}&page=1&per_page=1`
  const res = await fetchImpl(url, {
    headers: { Accept: 'application/json' },
  })
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`fetchBySiren: HTTP ${res.status} for ${identifier}`)
  }
  const body = (await res.json()) as RechercheEntreprisesResponse
  return body.results?.[0] ?? null
}

/**
 * Age in full years from an ISO date string. Returns null if undefined.
 * Uses January reference (approximation) — good enough for copywriting.
 */
export const yearsSinceIso = (iso: string | null): number | null => {
  if (!iso) return null
  const y = Number(iso.slice(0, 4))
  if (!Number.isFinite(y)) return null
  const current = new Date().getFullYear()
  return Math.max(0, current - y)
}

/**
 * Human-friendly effectif label : looks up TRANCHE_EFFECTIF_LABELS with
 * fallback to the raw code or a neutral string.
 */
export const formatTrancheEffectif = (code: string | null): string | null => {
  if (!code) return null
  return TRANCHE_EFFECTIF_LABELS[code] ?? `code INSEE ${code}`
}

/**
 * Shape distilled for the description pipeline — opinionated subset of the
 * API payload that's safe to feed into the prompt without hallucination risk.
 */
export type InseeEnrichment = {
  siren: string
  siret_siege: string
  nom_complet: string
  date_creation: string | null
  age_years: number | null
  tranche_effectif_code: string | null
  tranche_effectif_label: string | null
  activite_principale_naf: string | null
  etat_administratif: string
  nombre_etablissements: number
  nombre_etablissements_ouverts: number
  liste_rge_codes: string[]
  last_api_update: string | null
  raw: unknown
}

export const hitToEnrichment = (hit: RechercheEntreprisesHit): InseeEnrichment => {
  const tranche = hit.tranche_effectif_salarie ?? hit.siege?.tranche_effectif_salarie ?? null
  return {
    siren: hit.siren,
    siret_siege: hit.siege?.siret ?? '',
    nom_complet: hit.nom_complet,
    date_creation: hit.date_creation,
    age_years: yearsSinceIso(hit.date_creation),
    tranche_effectif_code: tranche,
    tranche_effectif_label: formatTrancheEffectif(tranche),
    activite_principale_naf: hit.siege?.activite_principale ?? null,
    etat_administratif: hit.etat_administratif,
    nombre_etablissements: hit.nombre_etablissements,
    nombre_etablissements_ouverts: hit.nombre_etablissements_ouverts,
    liste_rge_codes: hit.siege?.liste_rge ?? [],
    last_api_update: hit.siege?.date_mise_a_jour_insee ?? null,
    raw: hit,
  }
}
