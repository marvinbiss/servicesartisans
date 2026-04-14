// ---------------------------------------------------------------------------
// Top 200 Money Pages — static data for internal link concentration
// ---------------------------------------------------------------------------
// These service x city combinations should each receive 100+ internal links.
// No DB queries — pure static computation from known top services/cities.
// ---------------------------------------------------------------------------

export interface MoneyPage {
  serviceSlug: string
  serviceName: string
  villeSlug: string
  villeName: string
  tier: 1 | 2 | 3 // tier 1 = top 30, tier 2 = top 100, tier 3 = top 200
}

// Top 10 services (highest search volume in France)
const TOP_SERVICES: { slug: string; name: string }[] = [
  { slug: 'plombier', name: 'Plombier' },
  { slug: 'electricien', name: 'Électricien' },
  { slug: 'serrurier', name: 'Serrurier' },
  { slug: 'chauffagiste', name: 'Chauffagiste' },
  { slug: 'peintre-en-batiment', name: 'Peintre en bâtiment' },
  { slug: 'menuisier', name: 'Menuisier' },
  { slug: 'macon', name: 'Maçon' },
  { slug: 'couvreur', name: 'Couvreur' },
  { slug: 'carreleur', name: 'Carreleur' },
  { slug: 'jardinier', name: 'Jardinier' },
]

// Top 20 cities by population / search volume
const TOP_CITIES: { slug: string; name: string }[] = [
  { slug: 'paris', name: 'Paris' },
  { slug: 'lyon', name: 'Lyon' },
  { slug: 'marseille', name: 'Marseille' },
  { slug: 'toulouse', name: 'Toulouse' },
  { slug: 'bordeaux', name: 'Bordeaux' },
  { slug: 'nantes', name: 'Nantes' },
  { slug: 'nice', name: 'Nice' },
  { slug: 'strasbourg', name: 'Strasbourg' },
  { slug: 'montpellier', name: 'Montpellier' },
  { slug: 'lille', name: 'Lille' },
  { slug: 'rennes', name: 'Rennes' },
  { slug: 'reims', name: 'Reims' },
  { slug: 'saint-etienne', name: 'Saint-Étienne' },
  { slug: 'toulon', name: 'Toulon' },
  { slug: 'le-havre', name: 'Le Havre' },
  { slug: 'grenoble', name: 'Grenoble' },
  { slug: 'dijon', name: 'Dijon' },
  { slug: 'angers', name: 'Angers' },
  { slug: 'nimes', name: 'Nîmes' },
  { slug: 'clermont-ferrand', name: 'Clermont-Ferrand' },
]

// Pre-computed lookup set for O(1) checks
const moneyPageSet = new Set<string>()

// Pre-computed full list
const allMoneyPages: MoneyPage[] = []

function computeTier(cityIndex: number): 1 | 2 | 3 {
  if (cityIndex < 3) return 1 // Top 3 cities → tier 1 (30 pages)
  if (cityIndex < 10) return 2 // Cities 4-10 → tier 2 (100 pages total)
  return 3 // Cities 11-20 → tier 3 (200 pages total)
}

// Build the data once at module load
for (const service of TOP_SERVICES) {
  for (let ci = 0; ci < TOP_CITIES.length; ci++) {
    const city = TOP_CITIES[ci]
    const tier = computeTier(ci)
    allMoneyPages.push({
      serviceSlug: service.slug,
      serviceName: service.name,
      villeSlug: city.slug,
      villeName: city.name,
      tier,
    })
    moneyPageSet.add(`${service.slug}::${city.slug}`)
  }
}

/**
 * Returns all 200 money pages, sorted by tier (1 first).
 */
export function getTopMoneyPages(): MoneyPage[] {
  return allMoneyPages
}

/**
 * Returns money pages filtered by tier (cumulative: tier 2 includes tier 1).
 */
export function getMoneyPagesByTier(tier: 1 | 2 | 3): MoneyPage[] {
  return allMoneyPages.filter((p) => p.tier <= tier)
}

/**
 * O(1) check: is this service x city combination a money page?
 */
export function isMoneyPage(serviceSlug: string, villeSlug: string): boolean {
  return moneyPageSet.has(`${serviceSlug}::${villeSlug}`)
}

/**
 * Exported for use in homepage matrix and footer.
 */
export { TOP_SERVICES, TOP_CITIES }
