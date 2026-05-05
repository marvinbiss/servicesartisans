/**
 * Schema.org enrichment utilities for pSEO pages.
 *
 * Generates FAQPage, HowTo, Speakable, and detailed pricing schemas
 * designed to pass Google Rich Results Test validation.
 *
 * Usage: each function returns a plain JS object — the calling page
 * JSON.stringifies it and injects it in a <script type="application/ld+json"> tag.
 */

import { SITE_URL, SITE_NAME } from './config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FAQItem {
  question: string
  answer: string
}

export interface HowToStepInput {
  name: string
  text: string
  image?: string
  url?: string
}

export interface HowToOptions {
  serviceName: string
  locationName?: string
  url: string
  description?: string
  /** ISO 8601 duration, e.g. "PT10M" */
  totalTime?: string
}

export interface UrgenceHowToOptions {
  serviceName: string
  locationName?: string
  emergencyInfo: string
  url: string
}

export interface PricingTask {
  name: string
  priceRange: {
    min: number
    max: number
  }
  /** e.g. "intervention", "m²", "ml", "heure" */
  unit: string
  description?: string
}

export interface DetailedPricingOptions {
  serviceName: string
  locationName?: string
  url: string
  tasks: PricingTask[]
  /** Regional pricing multiplier (default 1.0) */
  pricingMultiplier?: number
}

export interface SpeakableOptions {
  url: string
  title: string
  cssSelectors?: string[]
}

// ---------------------------------------------------------------------------
// 1. FAQPage schema
// ---------------------------------------------------------------------------

/**
 * Generates a FAQPage schema valid for Google, Bing, and AI Overviews.
 * Should be used on ALL pSEO templates that have FAQ data.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/faqpage
 */
export function generateFAQSchema(faqs: FAQItem[]): Record<string, unknown> | null {
  if (!faqs || faqs.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      inLanguage: 'fr-FR',
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
        inLanguage: 'fr-FR',
      },
    })),
  }
}

// ---------------------------------------------------------------------------
// 2. HowTo schema — /devis pages
// ---------------------------------------------------------------------------

/**
 * Generates a HowTo schema for /devis pages:
 * "Comment décrire son projet de {service}"
 *
 * 5 fixed steps adapted to the quote request flow.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/how-to
 */
export function generateHowToSchema(options: HowToOptions): Record<string, unknown> {
  const { serviceName, locationName, url, description, totalTime } = options
  const svcLower = serviceName.toLowerCase()
  const locationSuffix = locationName ? ` à ${locationName}` : ''

  const steps: Array<{ name: string; text: string }> = [
    {
      name: 'Décrivez votre besoin',
      text: `Expliquez en quelques phrases votre projet de ${svcLower}${locationSuffix}. Plus votre description est précise (type de travaux, surface, matériaux souhaités), plus les devis seront adaptés.`,
    },
    {
      name: 'Précisez votre localisation',
      text: `Indiquez votre adresse ou votre ville${locationName ? ` (${locationName})` : ''} pour que nous vous mettions en relation avec des ${svcLower}s à proximité. La distance influe sur le tarif de déplacement.`,
    },
    {
      name: 'Ajoutez des photos si possible',
      text: `Prenez des photos de la zone concernée par les travaux de ${svcLower}. Les artisans pourront ainsi évaluer plus précisément l'ampleur du chantier et vous fournir un devis plus juste.`,
    },
    {
      name: 'Indiquez vos disponibilités',
      text: `Précisez vos créneaux préférés pour la visite technique ou le début des travaux. Cela permet aux artisans de s'organiser et d'accélérer le processus.`,
    },
    {
      name: 'Recevez vos devis gratuits',
      text: `Recevez gratuitement les devis de ${svcLower}s vérifiés SIREN${locationSuffix}. Comparez les prix, les délais et les avis avant de faire votre choix. Aucun engagement de votre part.`,
    },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${url}#howto-devis`,
    name: `Comment décrire son projet de ${svcLower}${locationSuffix}`,
    description:
      description ||
      `Guide en 5 étapes pour obtenir des devis gratuits de ${svcLower}s RGE certifiés${locationSuffix} sur ${SITE_NAME}.`,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    ...(totalTime ? { totalTime } : { totalTime: 'PT10M' }),
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'EUR',
      value: '0',
    },
    supply: [],
    tool: [],
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      inLanguage: 'fr-FR',
      url: `${url}#etape-${index + 1}`,
    })),
  }
}

// ---------------------------------------------------------------------------
// 3. HowTo schema — /urgence pages
// ---------------------------------------------------------------------------

/**
 * Generates a HowTo schema for /urgence pages:
 * "Que faire en cas d'urgence {service}"
 *
 * Steps are dynamically built from the trade's emergencyInfo.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/how-to
 */
export function generateHowToSchemaUrgence(options: UrgenceHowToOptions): Record<string, unknown> {
  const { serviceName, locationName, emergencyInfo, url } = options
  const svcLower = serviceName.toLowerCase()
  const locationSuffix = locationName ? ` à ${locationName}` : ''

  // Build contextual emergency steps based on trade emergency info
  const steps: Array<{ name: string; text: string }> = [
    {
      name: 'Sécurisez la zone',
      text: `En cas d'urgence ${svcLower}${locationSuffix}, commencez par sécuriser la zone. ${emergencyInfo.split('.')[0]}.`,
    },
    {
      name: 'Coupez les alimentations',
      text: `Coupez l'alimentation principale (eau, électricité, gaz selon le cas) pour éviter d'aggraver la situation. Repérez à l'avance l'emplacement de vos compteurs et disjoncteurs.`,
    },
    {
      name: 'Évaluez la gravité',
      text: `Prenez des photos des dégâts pour votre assurance et évaluez si la situation nécessite une intervention immédiate ou peut attendre les heures ouvrées (tarifs moins élevés).`,
    },
    {
      name: "Contactez un professionnel d'urgence",
      text: `Faites appel à un ${svcLower} d'urgence disponible 7j/7${locationSuffix}. ${emergencyInfo.includes('majoration') || emergencyInfo.includes('majoré') ? "Attention : les tarifs d'urgence sont majorés de 50 à 100 % en dehors des heures ouvrées." : 'Demandez systématiquement un devis avant toute intervention, même en urgence.'}`,
    },
    {
      name: 'Exigez un devis avant intervention',
      text: `Même en urgence, un artisan sérieux fournit un devis écrit avant de commencer les travaux. Refusez toute intervention sans accord écrit sur le prix. Sur ${SITE_NAME}, les ${svcLower}s sont vérifiés SIREN.`,
    },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${url}#howto-urgence`,
    name: `Que faire en cas d'urgence ${svcLower}${locationSuffix}`,
    description: `Les étapes à suivre en cas d'urgence ${svcLower}${locationSuffix} : sécurisation, diagnostic et intervention rapide.`,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    totalTime: 'PT15M',
    supply: [],
    tool: [],
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      inLanguage: 'fr-FR',
      url: `${url}#etape-urgence-${index + 1}`,
    })),
  }
}

// ---------------------------------------------------------------------------
// 4. Detailed pricing schema — /tarifs pages
// ---------------------------------------------------------------------------

/**
 * Generates a Service schema with UnitPriceSpecification for each task/intervention.
 * Designed for /tarifs/[service]/[ville] pages.
 *
 * Uses min/max prices with optional regional multiplier.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/product#pricespecification
 */
export function generateDetailedPricingSchema(
  options: DetailedPricingOptions
): Record<string, unknown> | null {
  const { serviceName, locationName, url, tasks, pricingMultiplier = 1.0 } = options

  if (!tasks || tasks.length === 0) return null

  const svcLower = serviceName.toLowerCase()
  const locationSuffix = locationName ? ` à ${locationName}` : ' en France'

  // Compute overall min/max from tasks
  const allMins = tasks.map((t) => Math.round(t.priceRange.min * pricingMultiplier))
  const allMaxs = tasks.map((t) => Math.round(t.priceRange.max * pricingMultiplier))
  const overallMin = Math.min(...allMins)
  const overallMax = Math.max(...allMaxs)

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#detailed-pricing-svc`,
    name: `Tarifs ${svcLower}${locationSuffix}`,
    description: `Grille tarifaire détaillée des prestations de ${svcLower}${locationSuffix}. Prix indicatifs TTC, devis gratuit sur ${SITE_NAME}.`,
    url,
    serviceType: serviceName,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    areaServed: locationName
      ? { '@type': 'City', name: locationName }
      : { '@type': 'Country', name: 'France' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Tarifs ${svcLower}${locationSuffix}`,
      itemListElement: tasks.map((task) => ({
        '@type': 'OfferCatalog',
        name: task.name,
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: task.name,
              ...(task.description && { description: task.description }),
            },
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              minPrice: Math.round(task.priceRange.min * pricingMultiplier),
              maxPrice: Math.round(task.priceRange.max * pricingMultiplier),
              priceCurrency: 'EUR',
              unitText: task.unit,
            },
          },
        ],
      })),
    },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: overallMin,
      highPrice: overallMax,
      priceCurrency: 'EUR',
    },
  }
}

// ---------------------------------------------------------------------------
// 5. Speakable schema
// ---------------------------------------------------------------------------

/**
 * Generates a SpeakableSpecification targeting the page summary and FAQ section.
 * Optimized for voice assistants and Google AI Overviews.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/speakable
 */
export function generateSpeakableSchema(options: SpeakableOptions): Record<string, unknown> {
  const { url, title, cssSelectors } = options

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#speakable-enrichment`,
    name: title,
    url,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors || ['.speakable-summary', '.speakable-faq'],
    },
  }
}

// ---------------------------------------------------------------------------
// Helper: parse commonTasks strings into PricingTask[]
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 6. AggregateRating schema (LocalBusiness)
// ---------------------------------------------------------------------------

/**
 * Generates a LocalBusiness schema with AggregateRating for service×city pages.
 * Returns null if avgRating or reviewCount are invalid.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/review-snippet
 */
export function generateAggregateRatingSchema(options: {
  serviceName: string
  villeName: string
  avgRating: number
  reviewCount: number
  serviceSlug: string
  villeSlug: string
}): Record<string, unknown> | null {
  const { serviceName, villeName, avgRating, reviewCount, serviceSlug, villeSlug } = options

  if (avgRating <= 0 || reviewCount <= 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/services/${serviceSlug}/${villeSlug}#localbusiness`,
    name: `${serviceName} à ${villeName} — ${SITE_NAME}`,
    url: `${SITE_URL}/services/${serviceSlug}/${villeSlug}`,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    address: {
      '@type': 'PostalAddress',
      addressLocality: villeName,
      addressCountry: 'FR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avgRating,
      bestRating: 5,
      worstRating: 1,
      reviewCount,
    },
  }
}

// ---------------------------------------------------------------------------
// 7. ItemList schema (top providers)
// ---------------------------------------------------------------------------

/**
 * Generates an ItemList schema with ListItem entries for top providers on a
 * service×city page. Returns null if providers is empty.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/carousel
 */
export function generateItemListSchema(options: {
  serviceName: string
  villeName: string
  providers: Array<{
    name: string
    slug: string
    rating_average?: number | null
    review_count?: number | null
  }>
  serviceSlug: string
  villeSlug: string
}): Record<string, unknown> | null {
  const { serviceName, villeName, providers } = options

  if (!providers || providers.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_URL}/services/${options.serviceSlug}/${options.villeSlug}#itemlist-providers`,
    name: `${serviceName} à ${villeName} — artisans vérifiés`,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    numberOfItems: providers.length,
    itemListElement: providers.map((provider, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LocalBusiness',
        name: provider.name,
        url: `${SITE_URL}/artisan/${provider.slug}`,
        ...(provider.rating_average != null &&
          provider.rating_average > 0 &&
          provider.review_count != null &&
          provider.review_count > 0 && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: provider.rating_average,
              bestRating: 5,
              worstRating: 1,
              reviewCount: provider.review_count,
            },
          }),
      },
    })),
  }
}

// ---------------------------------------------------------------------------
// 8. Enhanced BreadcrumbList schema
// ---------------------------------------------------------------------------

/**
 * Generates a BreadcrumbList schema with proper position numbers.
 * Items should always start with "Accueil" and include service → location.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */
export function generateEnhancedBreadcrumbSchema(options: {
  items: Array<{ name: string; url: string }>
}): Record<string, unknown> {
  const { items } = options

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const isLast = index === items.length - 1
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        ...(!isLast && {
          item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
        }),
      }
    }),
  }
}

// ---------------------------------------------------------------------------
// Helper: parse commonTasks strings into PricingTask[]
// ---------------------------------------------------------------------------

/**
 * Parses the `commonTasks` strings from TradeContent into structured PricingTask objects.
 *
 * Input format: "Débouchage de canalisation : 80 à 250 € selon la complexité"
 * Extracts task name, min price, max price. Falls back to unit "intervention" if
 * no unit is detected.
 */
export function parseCommonTasksToPricingTasks(
  commonTasks: string[],
  defaultUnit: string = 'intervention'
): PricingTask[] {
  const results: PricingTask[] = []

  for (const task of commonTasks) {
    // Split on " : " to separate name from price description
    const colonIndex = task.indexOf(' : ')
    if (colonIndex === -1) continue

    const name = task.substring(0, colonIndex).trim()
    const priceStr = task.substring(colonIndex + 3).trim()

    // Extract numeric values — handles "80 à 250 €", "800 à 2 500 €", "1 500 à 4 000 €"
    // Remove spaces inside numbers (e.g. "2 500" → "2500") then extract
    const cleaned = priceStr.replace(/(\d)\s+(\d)/g, '$1$2')
    const numbers = cleaned.match(/(\d+)/g)

    if (!numbers || numbers.length < 2) continue

    const min = parseInt(numbers[0], 10)
    const max = parseInt(numbers[1], 10)

    if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0) continue

    // Detect unit from price string
    let unit = defaultUnit
    if (/\/m²/i.test(priceStr) || /par m²/i.test(priceStr)) {
      unit = 'm²'
    } else if (
      /\/ml/i.test(priceStr) ||
      /par ml/i.test(priceStr) ||
      /mètre linéaire/i.test(priceStr)
    ) {
      unit = 'ml'
    } else if (/\/h/i.test(priceStr) || /par heure/i.test(priceStr) || /€\/h/i.test(priceStr)) {
      unit = 'heure'
    } else if (/\/m³/i.test(priceStr) || /par m³/i.test(priceStr)) {
      unit = 'm³'
    }

    results.push({
      name,
      priceRange: { min, max },
      unit,
    })
  }

  return results
}
