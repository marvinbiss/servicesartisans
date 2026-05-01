/**
 * Featured Snippet bait — descriptions structurées pour pSEO templates.
 *
 * Pourquoi : descriptions plates ("Artisans X à Y. Devis gratuit. Aides…")
 * loupent le Featured Snippet + People Also Ask. Google extrait beaucoup mieux
 * des descriptions qui :
 *   - Répondent à une question implicite ("Combien ça coûte ?", "Combien d'artisans ?")
 *   - Listent un chiffre concret en début de phrase (price range, count)
 *   - Mentionnent un cap aide (€) en fin (signal financial schema)
 *
 * Pattern : `${chiffre} ${noun} • Prix ${min}-${max} ${unit} • ${aide}`.
 * Sépareur middot "•" car Google le préserve dans le SERP snippet (vs "—" parfois remplacé).
 *
 * Limite stricte : 158 chars (160 = SERP cutoff desktop, 158 marge ellipsis).
 *
 * Pure module — testable, importable côté SSR + tests.
 */

export type FsBaitContext = {
  /** Nombre d'artisans listés (0 = fallback "Artisans vérifiés"). */
  providerCount: number
  /** Nom du service (ex: "Plombier", "Pompe à chaleur"). */
  serviceName: string
  /** Nom ville/location pour territorialisation. */
  locationName: string
  /** Année courante pour signal fraîcheur. */
  year: number
  /** Optionnel : fourchette prix locale (€/h ou € forfait). */
  priceRange?: {
    min: number
    max: number
    unit: string
  } | null
  /** Optionnel : moyenne avis (4.7) si ≥ 5 avis vérifiés. */
  reviewSnippet?: string
  /**
   * Optionnel : pluriel correct pour les noms composés (ex: "pompes à chaleur"
   * et non "pompe à chaleurs"). Si absent, le helper appose un `s` au
   * `serviceName.toLowerCase()` — OK pour les noms simples (plombier→plombiers).
   */
  pluralTerm?: string
}

/** Pluralise correctement le service. Préfère `pluralTerm` si fourni. */
function pluralizeService(serviceName: string, pluralTerm?: string): string {
  return pluralTerm ?? `${serviceName.toLowerCase()}s`
}

const MAX_DESCRIPTION_LENGTH = 158

/** Tronque sur frontière de mot avec ellipsis si dépasse 158c. */
function clipDescription(desc: string): string {
  if (desc.length <= MAX_DESCRIPTION_LENGTH) return desc
  return desc.slice(0, MAX_DESCRIPTION_LENGTH - 3).replace(/\s+\S*$/, '') + '…'
}

/**
 * URGENCE — réponse immédiate prix + délai.
 * Cible PAA "Combien coûte un plombier en urgence" + FS budget.
 */
export function buildUrgenceFsBait(ctx: FsBaitContext): string {
  const { providerCount, serviceName, locationName, year, priceRange, reviewSnippet, pluralTerm } =
    ctx
  const plural = pluralizeService(serviceName, pluralTerm)
  const countStr = providerCount > 0 ? `${providerCount} ${plural}` : `${plural} vérifiés`
  const priceStr = priceRange ? ` • ${priceRange.min}-${priceRange.max} ${priceRange.unit}` : ''
  const review = reviewSnippet ? ` ${reviewSnippet}` : ''
  return clipDescription(
    `${countStr} 24h/24 à ${locationName}${priceStr} • Intervention soir & week-end ${year}.${review} SIRET vérifié, devis gratuit.`
  )
}

/**
 * RÉNOVATION — montants aides en evidence (cap MaPrimeRénov' 11 000 €).
 * Cible PAA "Combien d'aides MaPrimeRénov'" + FS financial.
 */
export function buildRenovationFsBait(ctx: FsBaitContext): string {
  const { providerCount, serviceName, locationName, year, priceRange, reviewSnippet, pluralTerm } =
    ctx
  const plural = pluralizeService(serviceName, pluralTerm)
  const countStr = providerCount > 0 ? `${providerCount} ${plural} RGE` : `${plural} RGE certifiés`
  const priceStr = priceRange
    ? ` • Prix ${priceRange.min}-${priceRange.max} ${priceRange.unit}`
    : ''
  const review = reviewSnippet ? ` ${reviewSnippet}` : ''
  return clipDescription(
    `${countStr} à ${locationName}${priceStr} • Aides ${year} : MaPrimeRénov’ jusqu’à 11 000 €, CEE et TVA 5,5 %.${review} Devis gratuit 24h.`
  )
}

/**
 * TRAVAUX — neutre, prix + count + devis (pas de "24h" ni "RGE").
 * Cible FS budget + comparison.
 */
export function buildTravauxFsBait(ctx: FsBaitContext): string {
  const { providerCount, serviceName, locationName, year, priceRange, reviewSnippet, pluralTerm } =
    ctx
  const plural = pluralizeService(serviceName, pluralTerm)
  const countStr = providerCount > 0 ? `${providerCount} ${plural} vérifiés` : `${plural} vérifiés`
  const priceStr = priceRange
    ? ` • Prix ${priceRange.min}-${priceRange.max} ${priceRange.unit}`
    : ''
  const review = reviewSnippet ? ` ${reviewSnippet}` : ''
  return clipDescription(
    `${countStr} à ${locationName}${priceStr} • Devis gratuit ${year}, comparez avis et tarifs.${review} Artisans SIREN, garantie décennale.`
  )
}

/**
 * AVIS — review proof + price ladder. Cible PAA "Quel est le meilleur X à Y".
 */
export function buildAvisFsBait(ctx: FsBaitContext): string {
  const { providerCount, serviceName, locationName, year, priceRange, reviewSnippet, pluralTerm } =
    ctx
  const plural = pluralizeService(serviceName, pluralTerm)
  const countStr = providerCount > 0 ? `${providerCount} ${plural}` : `${plural} vérifiés`
  const priceStr = priceRange
    ? ` • Prix ${priceRange.min}-${priceRange.max} ${priceRange.unit}`
    : ''
  const review = reviewSnippet ? ` ${reviewSnippet}` : ''
  return clipDescription(
    `Avis ${countStr} à ${locationName}${priceStr} • Comparez les meilleurs pros vérifiés ${year}.${review} Devis gratuit, sans engagement.`
  )
}

/**
 * VILLE hub — orienté éventail métiers + count global.
 */
export function buildVilleHubFsBait(ctx: {
  providerCount: number
  servicesCount: number
  villeName: string
  departementCode: string
  year: number
  reviewSnippet?: string
}): string {
  const { providerCount, servicesCount, villeName, departementCode, year, reviewSnippet } = ctx
  const countStr = providerCount > 0 ? `${providerCount} artisans` : 'Artisans vérifiés'
  const review = reviewSnippet ? ` ${reviewSnippet}` : ''
  return clipDescription(
    `${countStr} à ${villeName} (${departementCode}) • ${servicesCount} métiers ${year} • Devis gratuit 24h.${review} SIRET vérifié, garantie décennale.`
  )
}

/** Max length export pour tests + autres helpers. */
export const FS_BAIT_MAX_LENGTH = MAX_DESCRIPTION_LENGTH
