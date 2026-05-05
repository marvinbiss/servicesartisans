/**
 * InContentLinks — Contextual internal links embedded within natural French paragraphs.
 *
 * Generates 5 contextual links (3 for hub pages) distributed across 2-3 short paragraphs
 * with inline <Link> tags that vary deterministically per page (via hashCode).
 * Replaces both the former InBodyLinks and InContentLinks components.
 *
 * 12 snippet types: tarifs, avis, devis, urgence, nearby city, departement,
 * related service, hub tarifs, hub service, service×ville, money page, nearby money page.
 *
 * Server component — no 'use client'.
 */

import Link from 'next/link'
import { hashCode } from '@/lib/seo/location-content'
import { getNearbyCities, getDepartementByCode, getVilleBySlug } from '@/lib/data/france'
import { relatedServices } from '@/lib/constants/navigation'
import { tradeContent } from '@/lib/data/trade-content'
import { services as staticServicesList } from '@/lib/data/france'
import { isMoneyPage, TOP_CITIES } from '@/lib/seo/top-pages'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface InContentLinksProps {
  serviceSlug: string
  serviceName: string
  villeSlug?: string
  villeName?: string
  currentIntent: 'services' | 'tarifs' | 'avis' | 'devis' | 'urgence' | 'problemes'
  departement?: string
  departementCode?: string
  region?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve a service name from its slug */
function getServiceName(slug: string): string {
  const svc = staticServicesList.find((s) => s.slug === slug)
  return svc?.name ?? slug
}

/** Build a deterministic subset of indices from a pool */
function pickIndices(seed: number, poolSize: number, count: number): number[] {
  const picked: number[] = []
  const used = new Set<number>()
  for (let i = 0; i < count && picked.length < poolSize; i++) {
    let idx = Math.abs((seed + i * 7 + i * i * 3) % poolSize)
    let attempts = 0
    while (used.has(idx) && attempts < poolSize) {
      idx = (idx + 1) % poolSize
      attempts++
    }
    if (!used.has(idx)) {
      used.add(idx)
      picked.push(idx)
    }
  }
  return picked
}

// ---------------------------------------------------------------------------
// Link snippet builders — each returns a React node (paragraph fragment)
// ---------------------------------------------------------------------------

type SnippetFn = (ctx: SnippetContext) => React.ReactNode | null

interface SnippetContext {
  serviceSlug: string
  serviceName: string
  serviceLower: string
  villeSlug?: string
  villeName?: string
  currentIntent: string
  departement?: string
  departementCode?: string
  departementSlug?: string
  region?: string
  trade: (typeof tradeContent)[string] | undefined
  nearbyCity?: { slug: string; name: string }
  nearbyCities?: { slug: string; name: string }[]
  relatedServiceSlug?: string
  relatedServiceName?: string
  variantSeed: number
}

/** Cross-intent: link to avis page */
const snippetAvis: SnippetFn = (ctx) => {
  if (!ctx.villeSlug || !ctx.villeName || ctx.currentIntent === 'avis') return null
  const variants = [
    <>
      Les habitants de {ctx.villeName} partagent leur expérience :{' '}
      <Link
        href={`/avis/${ctx.serviceSlug}/${ctx.villeSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        consultez les avis {ctx.serviceLower} à {ctx.villeName}
      </Link>{' '}
      pour faire votre choix en toute confiance.
    </>,
    <>
      Avant de choisir, découvrez ce que pensent vos voisins. Les{' '}
      <Link
        href={`/avis/${ctx.serviceSlug}/${ctx.villeSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        avis {ctx.serviceLower} à {ctx.villeName}
      </Link>{' '}
      vous aideront à sélectionner le bon professionnel.
    </>,
    <>
      Plus de transparence grâce aux{' '}
      <Link
        href={`/avis/${ctx.serviceSlug}/${ctx.villeSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        avis vérifiés de {ctx.serviceLower}s à {ctx.villeName}
      </Link>
      , laissés par des clients du {ctx.departement ?? 'département'}.
    </>,
  ]
  return variants[ctx.variantSeed % variants.length]
}

/** Cross-intent: link to tarifs page */
const snippetTarifs: SnippetFn = (ctx) => {
  if (!ctx.villeSlug || !ctx.villeName || ctx.currentIntent === 'tarifs') return null
  const min = ctx.trade ? ctx.trade.priceRange.min : 50
  const max = ctx.trade ? ctx.trade.priceRange.max : 90
  const variants = [
    <>
      Si vous cherchez un {ctx.serviceLower} à {ctx.villeName}, sachez que les tarifs varient de{' '}
      {min}&nbsp;€ à {max}&nbsp;€/h.{' '}
      <Link
        href={`/services/${ctx.serviceSlug}/${ctx.villeSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        Consultez notre grille tarifaire complète
      </Link>{' '}
      pour estimer votre budget.
    </>,
    <>
      Le prix d&#39;un {ctx.serviceLower} à {ctx.villeName} se situe entre {min} et {max}&nbsp;€ de
      l&#39;heure. Retrouvez le détail sur notre page{' '}
      <Link
        href={`/services/${ctx.serviceSlug}/${ctx.villeSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        tarifs {ctx.serviceLower} à {ctx.villeName}
      </Link>
      .
    </>,
    <>
      Pour y voir plus clair sur les coûts, notre{' '}
      <Link
        href={`/services/${ctx.serviceSlug}/${ctx.villeSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        guide des tarifs {ctx.serviceLower} à {ctx.villeName}
      </Link>{' '}
      détaille chaque prestation courante, de {min} à {max}&nbsp;€/h.
    </>,
  ]
  return variants[ctx.variantSeed % variants.length]
}

/** Cross-intent: link to devis page */
const snippetDevis: SnippetFn = (ctx) => {
  if (!ctx.villeSlug || !ctx.villeName || ctx.currentIntent === 'devis') return null
  const variants = [
    <>
      Pour un devis gratuit et sans engagement,{' '}
      <Link
        href={`/services/${ctx.serviceSlug}/${ctx.villeSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        demandez un devis {ctx.serviceLower} à {ctx.villeName}
      </Link>
      . Vous recevrez jusqu&#39;à 3 propositions d&#39;artisans RGE certifiés.
    </>,
    <>
      Besoin d&#39;un chiffrage précis ?{' '}
      <Link
        href={`/services/${ctx.serviceSlug}/${ctx.villeSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        Obtenez un devis {ctx.serviceLower} gratuit à {ctx.villeName}
      </Link>{' '}
      en quelques clics, directement auprès d&#39;artisans RGE certifiés.
    </>,
    <>
      Comparez les prix en demandant un{' '}
      <Link
        href={`/services/${ctx.serviceSlug}/${ctx.villeSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        devis {ctx.serviceLower} à {ctx.villeName}
      </Link>{' '}
      : c&#39;est gratuit, rapide et sans engagement.
    </>,
  ]
  return variants[ctx.variantSeed % variants.length]
}

/** Cross-intent: link to urgence page */
const snippetUrgence: SnippetFn = (ctx) => {
  if (!ctx.villeSlug || !ctx.villeName || ctx.currentIntent === 'urgence') return null
  if (!ctx.trade?.emergencyInfo) return null
  const variants = [
    <>
      En cas d&#39;urgence, nos{' '}
      <Link
        href={`/urgence/${ctx.serviceSlug}/${ctx.villeSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        artisans {ctx.serviceLower} disponibles en urgence à {ctx.villeName}
      </Link>{' '}
      interviennent rapidement, y compris le soir et le week-end.
    </>,
    <>
      Une panne soudaine ? Les{' '}
      <Link
        href={`/urgence/${ctx.serviceSlug}/${ctx.villeSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower}s d&#39;urgence à {ctx.villeName}
      </Link>{' '}
      sont joignables 7j/7 pour une intervention rapide.
    </>,
    <>
      Situation urgente à {ctx.villeName} ? Retrouvez un{' '}
      <Link
        href={`/urgence/${ctx.serviceSlug}/${ctx.villeSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower} en urgence à {ctx.villeName}
      </Link>{' '}
      capable d&#39;intervenir dans les meilleurs délais.
    </>,
  ]
  return variants[ctx.variantSeed % variants.length]
}

/** Nearby city comparison link */
const snippetNearbyCity: SnippetFn = (ctx) => {
  if (!ctx.nearbyCity) return null
  const intentPrefix =
    ctx.currentIntent === 'tarifs' ? 'tarifs' : ctx.currentIntent === 'avis' ? 'avis' : 'services'
  const variants = [
    <>
      Comparez également avec les{' '}
      <Link
        href={`/${intentPrefix}/${ctx.serviceSlug}/${ctx.nearbyCity.slug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower}s à {ctx.nearbyCity.name}
      </Link>
      , ville voisine où les prix peuvent varier sensiblement.
    </>,
    <>
      Les professionnels de {ctx.nearbyCity.name} couvrent parfois aussi{' '}
      {ctx.villeName ?? 'votre secteur'}. Consultez les{' '}
      <Link
        href={`/${intentPrefix}/${ctx.serviceSlug}/${ctx.nearbyCity.slug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower}s à {ctx.nearbyCity.name}
      </Link>{' '}
      pour élargir votre recherche.
    </>,
    <>
      À proximité, {ctx.nearbyCity.name} dispose aussi de nombreux professionnels. Retrouvez les{' '}
      <Link
        href={`/${intentPrefix}/${ctx.serviceSlug}/${ctx.nearbyCity.slug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower}s à {ctx.nearbyCity.name}
      </Link>{' '}
      sur notre annuaire.
    </>,
  ]
  return variants[ctx.variantSeed % variants.length]
}

/** Department link */
const snippetDepartement: SnippetFn = (ctx) => {
  if (!ctx.departementSlug || !ctx.departement) return null
  const variants = [
    <>
      Vous êtes dans le département ? Retrouvez tous les{' '}
      <Link
        href={`/departements/${ctx.departementSlug}/${ctx.serviceSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower}s en {ctx.departement}
      </Link>{' '}
      pour trouver un artisan proche de chez vous.
    </>,
    <>
      Notre annuaire couvre l&#39;ensemble du département : parcourez la liste des{' '}
      <Link
        href={`/departements/${ctx.departementSlug}/${ctx.serviceSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower}s en {ctx.departement}
      </Link>{' '}
      et comparez les profils.
    </>,
    <>
      Besoin d&#39;un artisan RGE ailleurs dans le {ctx.departement} ? Tous les{' '}
      <Link
        href={`/departements/${ctx.departementSlug}/${ctx.serviceSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower}s du département
      </Link>{' '}
      sont RGE certifiés sur notre plateforme.
    </>,
  ]
  return variants[ctx.variantSeed % variants.length]
}

/** Related service link */
const snippetRelatedService: SnippetFn = (ctx) => {
  if (!ctx.relatedServiceSlug || !ctx.relatedServiceName) return null
  const relLower = ctx.relatedServiceName.toLowerCase()
  const href = ctx.villeSlug
    ? `/services/${ctx.relatedServiceSlug}/${ctx.villeSlug}`
    : `/services/${ctx.relatedServiceSlug}`
  const locationSuffix = ctx.villeName ? ` à ${ctx.villeName}` : ''
  const variants = [
    <>
      Besoin aussi d&#39;un{' '}
      <Link
        href={href}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {relLower}
        {locationSuffix}
      </Link>{' '}
      ? Ces deux corps de métier sont souvent complémentaires pour vos travaux.
    </>,
    <>
      Votre projet peut nécessiter un{' '}
      <Link
        href={href}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {relLower}
        {locationSuffix}
      </Link>{' '}
      en complément. Consultez les profils disponibles sur notre annuaire.
    </>,
    <>
      Les travaux de {ctx.serviceLower} vont souvent de pair avec ceux d&#39;un{' '}
      <Link
        href={href}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {relLower}
        {locationSuffix}
      </Link>
      . Pensez à comparer les devis.
    </>,
  ]
  return variants[ctx.variantSeed % variants.length]
}

/** Hub page link (tarifs guide for the whole country) */
const snippetHubTarifs: SnippetFn = (ctx) => {
  if (ctx.currentIntent === 'tarifs' && !ctx.villeSlug) return null
  const variants = [
    <>
      Notre{' '}
      <Link
        href={`/tarifs/${ctx.serviceSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        guide des tarifs {ctx.serviceLower}
      </Link>{' '}
      couvre toute la France et détaille les prix par prestation.
    </>,
    <>
      Pour une vue d&#39;ensemble nationale, consultez notre{' '}
      <Link
        href={`/tarifs/${ctx.serviceSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        barème complet {ctx.serviceLower}
      </Link>{' '}
      avec les variations régionales.
    </>,
    <>
      Retrouvez les fourchettes de prix à l&#39;échelle nationale dans notre{' '}
      <Link
        href={`/tarifs/${ctx.serviceSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        guide tarifaire {ctx.serviceLower}
      </Link>
      , mis à jour régulièrement.
    </>,
  ]
  return variants[ctx.variantSeed % variants.length]
}

/** Hub page link (service hub) */
const snippetHubService: SnippetFn = (ctx) => {
  if (ctx.currentIntent === 'services' && !ctx.villeSlug) return null
  const variants = [
    <>
      Découvrez notre{' '}
      <Link
        href={`/services/${ctx.serviceSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        annuaire {ctx.serviceLower} en France
      </Link>{' '}
      pour trouver un professionnel vérifié dans votre ville.
    </>,
    <>
      Besoin d&#39;un {ctx.serviceLower} ailleurs en France ? Notre{' '}
      <Link
        href={`/services/${ctx.serviceSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        page nationale {ctx.serviceLower}
      </Link>{' '}
      recense les artisans dans plus de 2 000 villes.
    </>,
  ]
  return variants[ctx.variantSeed % variants.length]
}

/** Services listing link (for city) */
const snippetServiceVille: SnippetFn = (ctx) => {
  if (!ctx.villeSlug || !ctx.villeName || ctx.currentIntent === 'services') return null
  const variants = [
    <>
      Retrouvez la liste complète des{' '}
      <Link
        href={`/services/${ctx.serviceSlug}/${ctx.villeSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower}s à {ctx.villeName}
      </Link>{' '}
      avec leurs coordonnées et avis clients.
    </>,
    <>
      Tous les{' '}
      <Link
        href={`/services/${ctx.serviceSlug}/${ctx.villeSlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower}s RGE certifiés à {ctx.villeName}
      </Link>{' '}
      sont vérifiés ADEME + SIREN pour votre tranquillité.
    </>,
  ]
  return variants[ctx.variantSeed % variants.length]
}

/** Money page link — targets a top city for the same service (PageRank boost) */
const snippetMoneyPage: SnippetFn = (ctx) => {
  if (!ctx.villeSlug) return null
  const topCitySlugs = TOP_CITIES.map((c) => c.slug).filter((s) => s !== ctx.villeSlug)
  if (topCitySlugs.length === 0) return null
  const citySlug = topCitySlugs[ctx.variantSeed % topCitySlugs.length]
  const cityData = getVilleBySlug(citySlug)
  if (!cityData) return null
  const variants = [
    <>
      Nos clients recherchent également un{' '}
      <Link
        href={`/services/${ctx.serviceSlug}/${citySlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower} à {cityData.name}
      </Link>
      , l&#39;une des villes les plus demandées.
    </>,
    <>
      Vous pouvez aussi consulter les{' '}
      <Link
        href={`/services/${ctx.serviceSlug}/${citySlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower}s à {cityData.name}
      </Link>
      , où de nombreux artisans RGE certifiés sont référencés.
    </>,
    <>
      Parmi les villes les plus recherchées, découvrez les{' '}
      <Link
        href={`/services/${ctx.serviceSlug}/${citySlug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower}s à {cityData.name}
      </Link>{' '}
      sur notre annuaire.
    </>,
  ]
  return variants[ctx.variantSeed % variants.length]
}

/** Nearby money page — boosts a nearby city that is a money page */
const snippetNearbyMoneyPage: SnippetFn = (ctx) => {
  if (!ctx.villeSlug || !ctx.nearbyCities) return null
  const moneyNearby = ctx.nearbyCities.find((v) => isMoneyPage(ctx.serviceSlug, v.slug))
  if (!moneyNearby || moneyNearby.slug === ctx.nearbyCity?.slug) return null
  const variants = [
    <>
      Les habitants des communes voisines font aussi appel à un{' '}
      <Link
        href={`/services/${ctx.serviceSlug}/${moneyNearby.slug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower} à {moneyNearby.name}
      </Link>
      .
    </>,
    <>
      À côté, {moneyNearby.name} est aussi très demandée. Consultez les{' '}
      <Link
        href={`/services/${ctx.serviceSlug}/${moneyNearby.slug}`}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
      >
        {ctx.serviceLower}s à {moneyNearby.name}
      </Link>{' '}
      disponibles.
    </>,
  ]
  return variants[ctx.variantSeed % variants.length]
}

// ---------------------------------------------------------------------------
// Snippet pool
// ---------------------------------------------------------------------------

const ALL_SNIPPETS: SnippetFn[] = [
  snippetTarifs,
  snippetAvis,
  snippetDevis,
  snippetUrgence,
  snippetNearbyCity,
  snippetDepartement,
  snippetRelatedService,
  snippetHubTarifs,
  snippetHubService,
  snippetServiceVille,
  snippetMoneyPage,
  snippetNearbyMoneyPage,
]

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function InContentLinks({
  serviceSlug,
  serviceName,
  villeSlug,
  villeName,
  currentIntent,
  departement,
  departementCode,
  region,
}: InContentLinksProps) {
  const seed = hashCode(`in-content-${serviceSlug}-${villeSlug ?? 'hub'}-${currentIntent}`)
  const serviceLower = serviceName.toLowerCase()
  const trade = tradeContent[serviceSlug]

  // Resolve nearby city
  const nearbyCities = villeSlug ? getNearbyCities(villeSlug, 5) : []
  const nearbyCity = nearbyCities.length > 0 ? nearbyCities[seed % nearbyCities.length] : undefined

  // Resolve related service
  const relatedSlugs = relatedServices[serviceSlug] ?? []
  const relatedServiceSlug =
    relatedSlugs.length > 0 ? relatedSlugs[seed % relatedSlugs.length] : undefined
  const relatedServiceName = relatedServiceSlug ? getServiceName(relatedServiceSlug) : undefined

  // Resolve department slug
  const deptData = departementCode ? getDepartementByCode(departementCode) : undefined
  const departementSlug = deptData?.slug

  // Build context
  const ctx: Omit<SnippetContext, 'variantSeed'> = {
    serviceSlug,
    serviceName,
    serviceLower,
    villeSlug,
    villeName,
    currentIntent,
    departement: departement ?? deptData?.name,
    departementCode,
    departementSlug,
    region,
    trade,
    nearbyCity,
    nearbyCities,
    relatedServiceSlug,
    relatedServiceName,
  }

  // Evaluate all snippets and keep only non-null ones
  const evaluated: { node: React.ReactNode; idx: number }[] = []
  for (let i = 0; i < ALL_SNIPPETS.length; i++) {
    const variantSeed = Math.abs(seed + i * 13)
    const node = ALL_SNIPPETS[i]({ ...ctx, variantSeed })
    if (node) {
      evaluated.push({ node, idx: i })
    }
  }

  // Pick 5 snippets (or 3 for hub pages without a city)
  const targetCount = villeSlug ? 5 : 3
  const selected = pickIndices(seed, evaluated.length, targetCount).map((i) => evaluated[i])

  if (selected.length === 0) return null

  // Split into 2-3 paragraphs (distribute evenly)
  const paragraphs: React.ReactNode[][] = [[], [], []]
  selected.forEach((item, i) => {
    paragraphs[i % (villeSlug ? 3 : 2)].push(item.node)
  })
  const nonEmpty = paragraphs.filter((p) => p.length > 0)

  return (
    <aside
      aria-label={`Liens utiles pour ${serviceName}${villeName ? ` à ${villeName}` : ''}`}
      className="bg-sand-50/60 border-y border-sand-200"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {nonEmpty.map((sentences, pIdx) => (
          <p key={pIdx} className="text-sm text-charcoal-600 leading-relaxed">
            {sentences.map((s, sIdx) => (
              <span key={sIdx}>
                {sIdx > 0 ? ' ' : ''}
                {s}
              </span>
            ))}
          </p>
        ))}
      </div>
    </aside>
  )
}
