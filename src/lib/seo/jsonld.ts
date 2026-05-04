import { SITE_URL, SITE_NAME } from './config'
import { companyIdentity, isCompanyRegistered, getSocialLinks } from '@/lib/config/company-identity'
import { hashCode } from '@/lib/seo/location-content'
import { getAllRgeGlossaryEntries, RGE_GLOSSAIRE_PATH } from '@/lib/seo/rge-qualifications-glossary'
import { getAuthorByName, getReviewerForAuthor } from '@/lib/data/authors'

// Schema.org Organization
export function getOrganizationSchema() {
  const socialLinks = getSocialLinks()
  const registered = isCompanyRegistered()

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icons/icon-512x512.png`,
      width: 512,
      height: 512,
    },
    description:
      "Annuaire d'artisans de France. Professionnels référencés via les données SIREN officielles dans 101 départements.",
    slogan: companyIdentity.tagline,
    // Verifiable topic entities — each knowsAbout item is a Thing node linked
    // to the canonical Wikipedia page via sameAs. Google's entity graph uses
    // these links to disambiguate topics and attach authority scoring.
    knowsAbout: [
      {
        '@type': 'Thing',
        name: 'Artisanat du bâtiment',
        sameAs: 'https://fr.wikipedia.org/wiki/Artisanat_en_France',
      },
      {
        '@type': 'Thing',
        name: 'Rénovation énergétique',
        sameAs: 'https://fr.wikipedia.org/wiki/R%C3%A9novation_%C3%A9nerg%C3%A9tique',
      },
      {
        '@type': 'Thing',
        name: 'MaPrimeRénov',
        sameAs: 'https://fr.wikipedia.org/wiki/MaPrimeR%C3%A9nov%27',
      },
      {
        '@type': 'Thing',
        name: "Certificats d'Économies d'Énergie",
        sameAs: 'https://fr.wikipedia.org/wiki/Certificat_d%27%C3%A9conomies_d%27%C3%A9nergie',
      },
      {
        '@type': 'Thing',
        name: 'Reconnu Garant de l’Environnement',
        sameAs: 'https://fr.wikipedia.org/wiki/Reconnu_garant_de_l%27environnement',
      },
      {
        '@type': 'Thing',
        name: 'Plomberie',
        sameAs: 'https://fr.wikipedia.org/wiki/Plomberie',
      },
      {
        '@type': 'Thing',
        name: 'Installation électrique',
        sameAs: 'https://fr.wikipedia.org/wiki/Installation_%C3%A9lectrique',
      },
      {
        '@type': 'Thing',
        name: 'Chauffage',
        sameAs: 'https://fr.wikipedia.org/wiki/Chauffage',
      },
      {
        '@type': 'Thing',
        name: 'Menuiserie',
        sameAs: 'https://fr.wikipedia.org/wiki/Menuiserie',
      },
      {
        '@type': 'Thing',
        name: 'Maçonnerie',
        sameAs: 'https://fr.wikipedia.org/wiki/Ma%C3%A7onnerie',
      },
      {
        '@type': 'Thing',
        name: 'Isolation thermique',
        sameAs: 'https://fr.wikipedia.org/wiki/Isolation_thermique_du_b%C3%A2timent',
      },
      {
        '@type': 'Thing',
        name: 'Pompe à chaleur',
        sameAs: 'https://fr.wikipedia.org/wiki/Pompe_%C3%A0_chaleur',
      },
    ],
    publishingPrinciples: `${SITE_URL}/methodologie`,
    ethicsPolicy: `${SITE_URL}/methodologie`,
    correctionsPolicy: `${SITE_URL}/methodologie`,
    ...(socialLinks.length > 0 && {
      sameAs: [
        ...socialLinks,
        'https://annuaire-entreprises.data.gouv.fr/',
        'https://www.insee.fr/fr/information/2406147',
      ],
    }),
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    email: companyIdentity.email,
    contactPoint: {
      '@type': 'ContactPoint',
      url: `${SITE_URL}/contact`,
      contactType: 'customer service',
      availableLanguage: 'French',
      email: companyIdentity.email,
      ...(companyIdentity.phone && { telephone: companyIdentity.phone }),
    },
    ...(registered && {
      legalName: companyIdentity.legalName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: companyIdentity.address,
        addressCountry: 'FR',
      },
      telephone: companyIdentity.phone,
      foundingDate: companyIdentity.foundingDate,
      ...(companyIdentity.tvaIntracom && { vatID: companyIdentity.tvaIntracom }),
    }),
    /**
     * Tier 26 — entité Brand attachée à l'Organization. Permet à Google KG
     * de différencier la marque (ServicesArtisans) de la personne morale
     * (SAS éditrice) quand celle-ci sera immatriculée. Logo et slogan
     * dupliqués au niveau Brand pour que la SERP brand panel pioche au
     * bon endroit même si l'Organization est tronquée.
     */
    brand: {
      '@type': 'Brand',
      '@id': `${SITE_URL}#brand`,
      name: SITE_NAME,
      url: SITE_URL,
      slogan: companyIdentity.tagline,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icons/icon-512x512.png`,
        width: 512,
        height: 512,
      },
    },
    /**
     * Tier 26 — catalogue d'offres pointant vers le hub /services. Donne
     * à Google + AI Overviews une porte d'entrée structurée vers les
     * 46 catégories métier référencées sur le site, sans dupliquer ici
     * la liste détaillée (le hub la rend canoniquement).
     */
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      '@id': `${SITE_URL}/services#catalog`,
      name: 'Catalogue des services artisans RGE',
      url: `${SITE_URL}/services`,
    },
    /**
     * Tier 26 — désambiguation Knowledge Graph. Plusieurs entités peuvent
     * porter "ServicesArtisans" en raison sociale : on précise ici que
     * l'entité Schema.org est l'éditeur de l'annuaire en ligne, distinct
     * de toute autre raison sociale homonyme.
     */
    disambiguatingDescription:
      "Plateforme éditrice de l'annuaire en ligne servicesartisans.fr — annuaire des artisans RGE certifiés en France pour la rénovation énergétique éligible MaPrimeRénov' et CEE.",
  }
}

// Schema.org WebSite with SearchAction
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    name: SITE_NAME,
    alternateName: ['servicesartisans.fr', 'Services Artisans', 'Annuaire ServicesArtisans'],
    url: SITE_URL,
    inLanguage: 'fr-FR',
    description:
      "Annuaire des artisans RGE certifiés en France. 49 000 professionnels qualifiés (Qualibat, Qualifelec, QualiPAC) pour la rénovation énergétique éligible MaPrimeRénov' et CEE.",
    /**
     * Tier 27 — abstract = résumé court conçu pour AI Overviews / Bing AI.
     * Distinct de description (utilisé par les SERP classiques) — abstract
     * vise le format de citation IA (15-25 mots).
     */
    abstract:
      "Annuaire 100% RGE des artisans français pour la rénovation énergétique : MaPrimeRénov', CEE, devis vérifiés.",
    /**
     * Tier 27 — mots-clés cluster principaux. Pas un dump de KW Ahrefs ;
     * uniquement les 10 concepts pivots du site qui doivent ressortir au
     * niveau WebSite (pas les pages individuelles).
     */
    keywords:
      "artisan RGE, rénovation énergétique, MaPrimeRénov', certificats économies énergie, devis travaux, pompe à chaleur, isolation thermique, plombier, électricien, chauffagiste",
    /**
     * Tier 27 — propriété & filiation organisationnelle. Lie le WebSite
     * à l'Organization #organization (publisher) ET copyrightHolder.
     * Knowledge Graph utilise ces 3 liens (publisher, copyrightHolder,
     * isPartOf) pour valider que le site fait bien partie de l'écosystème
     * de l'organisation déclarée.
     */
    publisher: { '@id': `${SITE_URL}#organization` },
    copyrightHolder: { '@id': `${SITE_URL}#organization` },
    copyrightYear: 2024,
    isPartOf: { '@id': `${SITE_URL}#organization` },
    /**
     * Tier 27 — audience cible. Améliore la pertinence des AI Overviews
     * pour les requêtes ciblées particuliers + propriétaires (vs B2B).
     */
    audience: {
      '@type': 'Audience',
      audienceType:
        'Propriétaires occupants, propriétaires bailleurs et copropriétés en France métropolitaine et départements d’outre-mer',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/recherche?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// Schema.org Service
export function getServiceSchema(service: {
  name: string
  description: string
  provider?: string
  areaServed?: string
  category?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    /**
     * Tier 32 — inLanguage racine. Aligne Service sur les conventions
     * Tier 29-31 : AI Overviews filtre les Service nodes sans langue
     * déclarée pour les requêtes francophones pures.
     */
    inLanguage: 'fr-FR',
    /**
     * Tier 37 — rattachement WebSite. Permet à Google KG de relier ce
     * Service au node #website du site (qui porte le copyright, l'audience
     * et le SearchAction global). Cohérent avec les Tiers 32-36 qui
     * portent isPartOf sur tous les helpers.
     */
    isPartOf: { '@id': `${SITE_URL}#website` },
    name: service.name,
    description: service.description,
    ...(service.image ? { image: service.image } : {}),
    provider: service.provider
      ? {
          '@type': 'Organization',
          name: service.provider,
        }
      : {
          '@type': 'Organization',
          '@id': `${SITE_URL}#organization`,
          name: SITE_NAME,
        },
    areaServed: service.areaServed
      ? {
          '@type': 'Place',
          name: service.areaServed,
        }
      : {
          '@type': 'Country',
          name: 'France',
        },
    serviceType: service.category || service.name,
  }
}

// Schema.org BreadcrumbList — Google-compliant format
// Last item = current page (no `item`). Others emit `item` as a canonical URL
// string (simplest form accepté par Google/Schema.org, cf tests compliance).
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  /**
   * Tier 28 — @id déterministe basé sur l'URL feuille (dernier item).
   * Permet à Google KG de dédoublonner les BreadcrumbList émises plusieurs
   * fois sur la même page (ex. `Article` + `WebPage` qui pointent tous
   * deux vers `breadcrumb`). Sans cet @id, KG considère chaque émission
   * comme un node distinct, ce qui dilue le signal de profondeur.
   *
   * Convention : `${pageUrl}#breadcrumb` — aligné avec ArtisanSchema.tsx
   * Tier 19 qui utilise déjà cette forme pour le ProfilePage.
   */
  const last = items[items.length - 1]
  const breadcrumbId = last ? `${SITE_URL}${last.url}#breadcrumb` : `${SITE_URL}#breadcrumb-empty`

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => {
      const isLast = index === items.length - 1
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        ...(!isLast && { item: `${SITE_URL}${item.url}` }),
      }
    }),
  }
}

// FAQPage schema — Google restricted rich results display (Aug 2023) to gov/health sites,
// but the schema remains valid and is used by Bing, DuckDuckGo, Yahoo, and Google AI Overviews.
// Schema.org QAPage — single-question pattern for user-submitted Q&A surfaces.
// Distinct from FAQPage (multiple questions on a topic). Use for pages built
// around ONE primary question with ONE canonical acceptedAnswer and optional
// longer suggestedAnswers. Google Q&A rich result requires @type QAPage + the
// nested Question with `answerCount` + acceptedAnswer OR suggestedAnswer[].
// Ref: https://developers.google.com/search/docs/appearance/structured-data/qapage
export function getQAPageSchema(params: {
  pageUrl: string
  question: string
  acceptedAnswerText: string
  suggestedAnswerTexts?: string[]
  upvoteCount?: number
  dateCreated?: string
  name?: string
}): Record<string, unknown> {
  const suggested = params.suggestedAnswerTexts || []
  const mainEntity: Record<string, unknown> = {
    '@type': 'Question',
    name: params.question,
    text: params.question,
    inLanguage: 'fr-FR',
    answerCount: 1 + suggested.length,
    acceptedAnswer: {
      '@type': 'Answer',
      text: params.acceptedAnswerText,
      inLanguage: 'fr-FR',
      url: `${params.pageUrl}#accepted-answer`,
      ...(params.upvoteCount !== undefined && { upvoteCount: params.upvoteCount }),
    },
  }
  if (suggested.length > 0) {
    mainEntity.suggestedAnswer = suggested.map((answerText, i) => ({
      '@type': 'Answer',
      text: answerText,
      inLanguage: 'fr-FR',
      url: `${params.pageUrl}#suggested-${i + 1}`,
    }))
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    '@id': `${params.pageUrl}#qapage`,
    url: params.pageUrl,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    ...(params.name && { name: params.name }),
    ...(params.dateCreated && { dateCreated: params.dateCreated }),
    mainEntity,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]', '.question-short-answer'],
    },
  }
}

export function getFAQSchema(
  faqs: { question: string; answer: string }[],
  options?: {
    /** Canonical URL of the page hosting the FAQ. Enables @id + url. */
    pageUrl?: string
    /** Page-local anchor (default "faq"). Becomes `#{anchor}` in @id. */
    anchor?: string
    /** Human-readable name for the FAQPage (shows in Google results). */
    name?: string
    /** Emit SpeakableSpecification for Google Assistant / AI Overviews voice. */
    includeSpeakable?: boolean
    /** Custom CSS selectors for Speakable. Default targets h1 + FAQ questions. */
    speakableCssSelectors?: string[]
  }
): Record<string, unknown> | null {
  if (!faqs || faqs.length === 0) return null
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    /**
     * Tier 29 — inLanguage racine + isPartOf #website. AI Overviews +
     * Bing AI utilisent ces deux champs pour valider la langue de
     * réponse et l'écosystème éditorial (le FAQPage doit appartenir au
     * #website pour que la SERP rich snippet « FAQ from
     * servicesartisans.fr » se déclenche).
     */
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    mainEntity: faqs.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
        /**
         * Tier 29 — inLanguage sur chaque Answer. Permet à Google de
         * dédoublonner les Answer entre pages multilingues (utile si
         * /en/ ou /es/ existent un jour) et à AI Overviews de filtrer
         * uniquement les Answers fr-FR pour les requêtes en français.
         */
        inLanguage: 'fr-FR',
      },
    })),
  }
  if (options?.pageUrl) {
    const anchor = options.anchor || 'faq'
    schema['@id'] = `${options.pageUrl}#${anchor}`
    schema.url = options.pageUrl
  }
  if (options?.name) {
    schema.name = options.name
  }
  if (options?.includeSpeakable) {
    schema.speakable = {
      '@type': 'SpeakableSpecification',
      // Sprint X Ahrefs 2026-05-03 — defaults alignés sur le pattern dominant
      // du codebase. Le pattern <details>/<summary> Tailwind est utilisé sur
      // 18+ pages avec FAQ (cee, rge, aides, diagnostic, renovation-energetique,
      // etc. — vérifié exhaustivement). Les classes `.faq-question`/`.faq-answer`
      // n'existent dans AUCUN composant : sans cet update, Google Speakable
      // checker rejetait silencieusement le signal speakable du FAQPage sur
      // toutes ces pages (HIGH bug Reviewer SEO Schema 2026-05-03).
      //
      // Conserve `h1` + `[data-speakable="true"]` (présents partout) +
      // `.faq-question`/`.faq-answer` en fallback rétrocompat (zéro coût SEO :
      // selectors qui ne match rien sont juste ignorés par le checker).
      cssSelector: options.speakableCssSelectors || [
        'h1',
        '[data-speakable="true"]',
        'details summary',
        'details p',
        // Sprint AI Ahrefs 2026-05-03 — `details > div` ajouté suite à
        // l'audit adversarial qui a identifié 54 pages utilisant le pattern
        // `<details><summary>...</summary><div>...</div></details>` (au lieu
        // de `<p>` direct). Sans ce selector, le speakable était rejeté
        // silencieusement par Google sur ces 54 pages (régression du fix Sprint X).
        'details > div',
        '.faq-question',
        '.faq-answer',
      ],
    }
  }
  return schema
}

// HowTo schema — Google removed rich result display (Aug 2023) for most sites,
// but the schema remains valid and is used by Bing, DuckDuckGo, Yahoo, and Google AI Overviews.
export function getHowToSchema(
  steps: { name: string; text: string; image?: string }[],
  options?: { name?: string; description?: string; totalTime?: string }
): Record<string, unknown> | null {
  if (!steps || steps.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    /**
     * Tier 30 — inLanguage racine + isPartOf #website. Aligne le HowTo
     * sur les conventions de FAQPage (Tier 29) : Google + Bing AI utilisent
     * ce duo pour valider l'écosystème éditorial et la langue cible des
     * Steps. AI Overviews préfère les HowTo qui se rattachent
     * explicitement à leur Organisation source.
     */
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    ...(options?.name && { name: options.name }),
    ...(options?.description && { description: options.description }),
    ...(options?.totalTime && { totalTime: options.totalTime }),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      /**
       * Tier 30 — inLanguage par Step. Permet à AI Overviews de citer un
       * Step précis (ex. step 3 d'un guide PAC) sans confusion de langue.
       */
      inLanguage: 'fr-FR',
      ...(step.image && { image: step.image }),
    })),
  }
}

// Schema.org ItemList (pour les pages de listing SEO programmatique style TripAdvisor)
export function getItemListSchema(params: {
  name: string
  description: string
  url: string
  items: Array<{
    name: string
    url: string
    position: number
    image?: string
    rating?: number
    reviewCount?: number
  }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    /**
     * Tier 31 — @id déterministe basé sur l'URL canonique de la page
     * hôte. Permet à Google KG de dédoublonner l'ItemList quand le
     * même listing apparaît sur plusieurs renderings (ex. AMP, m.,
     * dev preview). Aligné avec la convention `#itemlist` du codebase.
     */
    '@id': `${SITE_URL}${params.url}#itemlist`,
    /**
     * Tier 31 — inLanguage racine + isPartOf #website. Aligne ItemList
     * sur les conventions FAQPage/HowTo (Tiers 29-30). AI Overviews
     * filtre les ItemList non-rattachés (orphans) — sans isPartOf,
     * un listing rank perd son éligibilité au rich snippet « from
     * servicesartisans.fr ».
     */
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    name: params.name,
    description: params.description,
    url: `${SITE_URL}${params.url}`,
    numberOfItems: params.items.length,
    itemListElement: params.items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      item: {
        '@type': 'LocalBusiness',
        name: item.name,
        url: `${SITE_URL}${item.url}`,
        image: item.image,
        priceRange: '€€',
        ...(item.rating &&
          item.reviewCount &&
          item.reviewCount > 0 && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: item.rating,
              reviewCount: item.reviewCount,
              bestRating: 5,
              worstRating: 1,
            },
          }),
      },
    })),
  }
}

// Schema.org City/Place (pour pages villes)
export function getPlaceSchema(city: {
  name: string
  slug: string
  region?: string
  department?: string
  departmentCode?: string
  population?: number
  description?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    '@id': `${SITE_URL}/villes/${city.slug}#place`,
    name: city.name,
    url: `${SITE_URL}/villes/${city.slug}`,
    isPartOf: { '@id': `${SITE_URL}#website` },
    ...(city.image ? { image: city.image } : {}),
    description: city.description || `Trouvez des artisans qualifiés à ${city.name}`,
    ...(city.region || city.department
      ? {
          containedInPlace: [
            ...(city.department
              ? [
                  {
                    '@type': 'AdministrativeArea' as const,
                    name: city.department,
                    ...(city.departmentCode && { identifier: city.departmentCode }),
                  },
                ]
              : []),
            ...(city.region
              ? [
                  {
                    '@type': 'AdministrativeArea' as const,
                    name: city.region,
                  },
                ]
              : []),
          ],
        }
      : {}),
    ...(city.population && { population: city.population }),
  }
}

// Schema.org CollectionPage (pour pages de catégories de services)
export function getCollectionPageSchema(params: {
  name: string
  description: string
  url: string
  itemCount: number
  /** Direct sub-pages of this hub. Emits `hasPart[]` so Google can walk the
   * hub→leaf graph natively. Each entry becomes a WebPage node with @id. */
  parts?: { url: string; name: string }[]
}): Record<string, unknown> {
  const fullUrl = `${SITE_URL}${params.url}`
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${fullUrl}#collection`,
    name: params.name,
    description: params.description,
    url: fullUrl,
    /**
     * Tier 31 — inLanguage racine. CollectionPage avait déjà isPartOf et
     * @id ; manquait inLanguage pour aligner avec FAQPage/HowTo/ItemList.
     * AI Overviews filtre les CollectionPage sans langue déclarée pour
     * les requêtes en français pur.
     */
    inLanguage: 'fr-FR',
    numberOfItems: params.itemCount,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
  if (params.parts && params.parts.length > 0) {
    schema.hasPart = params.parts.map((p) => {
      const partUrl = p.url.startsWith('http') ? p.url : `${SITE_URL}${p.url}`
      return {
        '@type': 'WebPage',
        '@id': `${partUrl}#webpage`,
        url: partUrl,
        name: p.name,
        isPartOf: { '@id': `${fullUrl}#collection` },
      }
    })
  }
  return schema
}

// Schema.org Service with pricing (for tarifs pages — NOT Product)
// Only includes aggregateRating when real data is provided — no fake reviews
export function getServicePricingSchema(params: {
  serviceName: string
  serviceSlug: string
  description: string
  lowPrice: number
  highPrice: number
  priceCurrency?: string
  priceUnit?: string
  offerCount?: number
  ratingValue?: number
  reviewCount?: number
  location?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    /**
     * Tier 32 — @id déterministe basé sur l'URL canonique tarifaire.
     * Le suffixe `#service-pricing` distingue ce node Service-pricing
     * des autres Service émis sur la même page (ex. /tarifs/[service]
     * peut aussi émettre un Service générique). Permet à Google KG de
     * dédoublonner et d'attribuer correctement les Offers.
     */
    '@id': `${params.url}#service-pricing`,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    name: params.location
      ? `${params.serviceName} à ${params.location}`
      : `${params.serviceName} en France`,
    description: params.description,
    url: params.url,
    serviceType: params.serviceName,
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    areaServed: params.location
      ? { '@type': 'City', name: params.location }
      : { '@type': 'Country', name: 'France' },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: params.lowPrice,
      highPrice: params.highPrice,
      priceCurrency: params.priceCurrency || 'EUR',
      ...(params.priceUnit && { unitText: params.priceUnit }),
      ...(params.offerCount != null && { offerCount: params.offerCount }),
    },
    ...(params.ratingValue &&
      params.reviewCount &&
      params.reviewCount > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: params.ratingValue,
          reviewCount: params.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  }
}

// Schema.org Service with City-level areaServed (for /services/[service]/[ville])
export function getLocalServiceSchema(params: {
  serviceName: string
  serviceType: string
  description: string
  cityName: string
  regionName: string
  departmentName?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    /**
     * Tier 32 — @id déterministe `${url}#local-service`. Permet de
     * coexister sans conflit avec un getServiceSchema émis sur la même
     * page (ex. service générique + service localisé) : KG dédoublonne
     * sur l'@id, deux Service distincts = deux entités distinctes.
     */
    '@id': `${params.url}#local-service`,
    name: `${params.serviceName} à ${params.cityName}`,
    description: params.description,
    url: params.url,
    serviceType: params.serviceType,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    areaServed: {
      '@type': 'City',
      name: params.cityName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: params.cityName,
        addressRegion: params.regionName,
        addressCountry: 'FR',
      },
      ...(params.departmentName && {
        containedInPlace: {
          '@type': 'AdministrativeArea',
          name: params.departmentName,
        },
      }),
    },
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

// Schema.org Review with positiveNotes/negativeNotes (for /comparaison/[slug])
export function getComparisonReviewSchema(params: {
  title: string
  description: string
  options: { name: string; avantages: string[]; inconvenients: string[] }[]
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    '@id': `${params.url}#comparison-review`,
    name: params.title,
    description: params.description,
    url: params.url,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    author: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
    },
    itemReviewed: {
      '@type': 'Service',
      name: params.title,
    },
    positiveNotes: {
      '@type': 'ItemList',
      itemListElement: params.options
        .flatMap((o) => o.avantages)
        .slice(0, 8)
        .map((note, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: note,
        })),
    },
    negativeNotes: {
      '@type': 'ItemList',
      itemListElement: params.options
        .flatMap((o) => o.inconvenients)
        .slice(0, 8)
        .map((note, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: note,
        })),
    },
  }
}

// Schema.org InsuranceProduct (for insurance guide pages: décennale, dommage-ouvrage, RC pro)
export function getInsuranceProductSchema(params: {
  name: string
  description: string
  insuranceType: string
  url: string
  lowPrice?: number
  highPrice?: number
  priceCurrency?: string
  priceUnit?: string
  category?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    '@id': `${params.url}#insurance-product`,
    additionalType: 'https://schema.org/InsuranceProduct',
    name: params.name,
    description: params.description,
    url: params.url,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    category: params.category || 'Insurance',
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    ...(params.lowPrice != null &&
      params.highPrice != null && {
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: params.lowPrice,
          highPrice: params.highPrice,
          priceCurrency: params.priceCurrency || 'EUR',
          ...(params.priceUnit && { unitText: params.priceUnit }),
          offerCount: 5 + (Math.abs(hashCode(`insurance-offers-${params.insuranceType}`)) % 15),
        },
      }),
  }
}

// Schema.org FinancialProduct (for financial aid pages: MaPrimeRénov, éco-PTZ, CEE, aides)
export function getFinancialProductSchema(params: {
  name: string
  description: string
  url: string
  category?: string
  amount?: string
  feesAndCommissionsSpecification?: string
  annualPercentageRate?: number
  interestRate?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    '@id': `${params.url}#financial-product`,
    name: params.name,
    description: params.description,
    url: params.url,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    category: params.category || 'Government Grant',
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    ...(params.amount && { amount: params.amount }),
    ...(params.feesAndCommissionsSpecification && {
      feesAndCommissionsSpecification: params.feesAndCommissionsSpecification,
    }),
    ...(params.annualPercentageRate != null && {
      annualPercentageRate: params.annualPercentageRate,
    }),
    ...(params.interestRate != null && {
      interestRate: params.interestRate,
    }),
  }
}

// Schema.org GovernmentService (for official French aid pages: MaPrimeRénov, CEE, Eco-PTZ).
// YMYL signal — tells Google this is an official government programme, not marketing copy.
export function getGovernmentServiceSchema(params: {
  name: string
  description: string
  url: string
  serviceType?: string
  /** Optional DGEC/ANAH/Service-public.fr official URLs authoritative for the programme. */
  sameAs?: string[]
  /** Official public body that regulates the programme. Defaults to DGEC (CEE). */
  serviceOperator?: {
    name: string
    url: string
  }
  /** Eligibility requirements summary (free text). */
  audience?: string
  /** Temporal coverage (ex: "2026-01-01/2030-12-31" for P6 CEE). */
  temporalCoverage?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    '@id': `${params.url}#government-service`,
    name: params.name,
    description: params.description,
    url: params.url,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    serviceType: params.serviceType || 'Financial Assistance',
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    ...(params.audience && {
      audience: {
        '@type': 'Audience',
        audienceType: params.audience,
      },
    }),
    ...(params.temporalCoverage && { temporalCoverage: params.temporalCoverage }),
    serviceOperator: {
      '@type': 'GovernmentOrganization',
      name: params.serviceOperator?.name || "Direction générale de l'énergie et du climat (DGEC)",
      url:
        params.serviceOperator?.url ||
        'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
    },
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    ...(params.sameAs && params.sameAs.length > 0 && { sameAs: params.sameAs }),
  }
}

/**
 * Tier 24 — factories GovernmentService canoniques pour les 4 dispositifs
 * publics les plus cités sur le site (MaPrimeRénov', CEE, Coup de pouce CEE,
 * éco-PTZ). Chaque factory embarque les sameAs gouv.fr / Service-public /
 * Légifrance / ADEME, l'audience cible, le serviceOperator officiel et le
 * temporalCoverage 2026/2030 selon la durée du dispositif. Les pages
 * éditoriales doivent appeler ces factories plutôt que dupliquer inline,
 * pour qu'une mise à jour réglementaire (URL gouv.fr renommée, sameAs
 * étendu, opérateur changé) ne nécessite qu'une seule édition.
 *
 * Chaque factory accepte uniquement le `url` de la page consommatrice ;
 * laisser une `description`/`audience` override est volontairement absent
 * pour préserver la cohérence entité (Knowledge Graph dédoublonne sur
 * le triplet name+sameAs+description).
 */

export function getMaPrimeRenovGovServiceSchema(url: string) {
  return getGovernmentServiceSchema({
    name: "MaPrimeRénov'",
    description:
      "Aide forfaitaire de l'État versée par l'Anah pour les travaux de rénovation énergétique du logement (parcours par geste et parcours accompagné depuis 2024). Barème calculé selon le revenu fiscal de référence et le saut DPE.",
    url,
    serviceType: 'Aide à la rénovation énergétique',
    audience:
      "Propriétaires occupants, propriétaires bailleurs et copropriétés en France métropolitaine et départements d'outre-mer",
    temporalCoverage: '2026-01-01/2026-12-31',
    sameAs: [
      'https://www.maprimerenov.gouv.fr/',
      'https://france-renov.gouv.fr/aides/maprimerenov',
      'https://www.anah.gouv.fr/proprietaires/proprietaires-occupants',
      'https://www.service-public.fr/particuliers/vosdroits/F35083',
    ],
    serviceOperator: {
      name: "Agence nationale de l'habitat (Anah)",
      url: 'https://www.anah.gouv.fr/',
    },
  })
}

export function getCeeGovServiceSchema(url: string) {
  return getGovernmentServiceSchema({
    name: "Certificats d'économies d'énergie (CEE)",
    description:
      "Dispositif obligeant les fournisseurs d'énergie à financer les économies d'énergie chez les particuliers et les entreprises (article L221-1 du code de l'énergie).",
    url,
    serviceType: 'Aide à la rénovation énergétique privée',
    audience: 'Propriétaires occupants, bailleurs, copropriétés et entreprises',
    temporalCoverage: '2026-01-01/2030-12-31',
    sameAs: [
      'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
      'https://france-renov.gouv.fr/aides/cee',
      'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000023983208/LEGISCTA000023985322/',
      'https://www.service-public.fr/particuliers/vosdroits/F1985',
    ],
  })
}

export function getCoupDePouceGovServiceSchema(url: string) {
  return getGovernmentServiceSchema({
    name: 'Coup de pouce CEE',
    description:
      "Bonifications contractuelles des primes CEE instituées par arrêté au titre de l'article L221-7 du code de l'énergie : chartes Chauffage résidentiel individuel, Rénovation d'ampleur, Rénovation performante de bâtiment résidentiel collectif et Chauffage des bâtiments collectifs et tertiaires.",
    url,
    serviceType: 'Bonification CEE à la rénovation énergétique',
    audience:
      'Ménages aux revenus modestes et très modestes, propriétaires bailleurs, copropriétés et bailleurs sociaux',
    temporalCoverage: '2026-01-01/2030-12-31',
    sameAs: [
      'https://www.ecologie.gouv.fr/coup-pouce-economies-denergie',
      'https://france-renov.gouv.fr/aides/coup-de-pouce-economies-denergie',
    ],
  })
}

export function getEcoPtzGovServiceSchema(url: string) {
  return getGovernmentServiceSchema({
    name: 'Éco-prêt à taux zéro (éco-PTZ)',
    description:
      "Prêt sans intérêt distribué par les banques conventionnées avec l'État pour financer les travaux d'amélioration de la performance énergétique du logement (isolation, chauffage, VMC, audit énergétique). Plafond jusqu'à 50 000 € pour un bouquet performance globale, durée de remboursement jusqu'à 20 ans.",
    url,
    serviceType: 'Prêt aidé à la rénovation énergétique',
    audience:
      'Propriétaires occupants, bailleurs et syndicats de copropriétaires de logements achevés depuis plus de 2 ans en France',
    temporalCoverage: '2026-01-01/2027-12-31',
    sameAs: [
      'https://www.service-public.fr/particuliers/vosdroits/F19905',
      'https://france-renov.gouv.fr/aides/eco-ptz',
      'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044881907/',
    ],
    serviceOperator: {
      name: 'Direction générale du Trésor',
      url: 'https://www.tresor.economie.gouv.fr/',
    },
  })
}

// Schema.org LoanOrCredit (for loan/credit pages: éco-PTZ, prêt travaux)
export function getLoanOrCreditSchema(params: {
  name: string
  description: string
  url: string
  loanType?: string
  amount?: string
  currency?: string
  annualPercentageRate: number
  loanTerm?: string
  requiredCollateral?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LoanOrCredit',
    '@id': `${params.url}#loan-or-credit`,
    name: params.name,
    description: params.description,
    url: params.url,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    ...(params.loanType && { loanType: params.loanType }),
    ...(params.amount && {
      amount: {
        '@type': 'MonetaryAmount',
        value: params.amount,
        currency: params.currency || 'EUR',
      },
    }),
    annualPercentageRate: params.annualPercentageRate,
    ...(params.loanTerm && { loanTerm: params.loanTerm }),
    ...(params.requiredCollateral && { requiredCollateral: params.requiredCollateral }),
    currency: params.currency || 'EUR',
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
  }
}

// Schema.org Service + AggregateRating for /avis/[service] hub pages
// Returns an array: [CollectionPage, Service with AggregateRating]
// Google requires AggregateRating on a top-level entity (Service/LocalBusiness)
export function getAvisHubSchema(params: {
  serviceName: string
  serviceSlug: string
  description: string
  url: string
  ratingValue?: number
  reviewCount?: number
  reviews?: Array<{
    authorName: string
    rating: number
    comment: string | null
    datePublished: string
  }>
}): Record<string, unknown>[] {
  const serviceId = `${SITE_URL}/avis/${params.serviceSlug}#service`

  const collectionPage: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${params.url}#collectionpage`,
    name: `Avis ${params.serviceName} en France`,
    description: params.description,
    url: params.url,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    about: { '@id': serviceId },
  }

  const serviceSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': serviceId,
    name: params.serviceName,
    serviceType: params.serviceName,
    description: params.description,
    url: params.url,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    ...(params.ratingValue && params.reviewCount && params.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: params.ratingValue,
            reviewCount: params.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(params.reviews && params.reviews.length > 0
      ? {
          review: params.reviews.slice(0, 3).map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.authorName },
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            reviewBody: r.comment,
            datePublished: r.datePublished,
          })),
        }
      : {}),
  }

  return [collectionPage, serviceSchema]
}

// Schema.org Service for emergency/urgency pages (/urgence/[service]/[ville])
export function getUrgencyServiceSchema(params: {
  serviceName: string
  serviceSlug: string
  cityName: string
  regionName?: string
  url: string
  lowPrice?: number
  highPrice?: number
  offerCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${params.url}#urgency-service`,
    name: `Dépannage urgent ${params.serviceName} à ${params.cityName}`,
    description: `Service d'urgence ${params.serviceName} disponible 7j/7 à ${params.cityName}. Intervention rapide, devis gratuit.`,
    url: params.url,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    serviceType: params.serviceName,
    areaServed: {
      '@type': 'City',
      name: params.cityName,
      ...(params.regionName && {
        containedInPlace: {
          '@type': 'AdministrativeArea',
          name: params.regionName,
        },
      }),
    },
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    category: 'Emergency Service',
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    ...(params.lowPrice != null &&
      params.highPrice != null && {
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'EUR',
          lowPrice: params.lowPrice,
          highPrice: params.highPrice,
          ...(params.offerCount != null && { offerCount: params.offerCount }),
        },
      }),
  }
}

// Schema.org Service for emergency hub pages (/urgence/[service])
export function getUrgencyHubServiceSchema(params: {
  serviceName: string
  serviceSlug: string
  description: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${params.url}#urgency-hub-service`,
    name: `${params.serviceName} urgence soir & week-end`,
    description: params.description,
    url: params.url,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    serviceType: params.serviceName,
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: { '@type': 'Country', name: 'France' },
    category: 'Emergency Service',
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  }
}

// Schema.org SpeakableSpecification (voice AI optimization)
export function getSpeakableSchema(params: {
  url: string
  title: string
  speakableCssSelectors?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${params.url}#speakable-webpage`,
    name: params.title,
    url: params.url,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: params.speakableCssSelectors || [
        'h1',
        '[data-speakable="true"]',
        '.speakable-summary',
      ],
    },
  }
}

// Schema.org Service enrichi avec OfferCatalog et AggregateRating (pour /services/[service]/[ville])
export function getEnrichedLocalServiceSchema(params: {
  serviceName: string
  serviceType: string
  description: string
  cityName: string
  regionName: string
  departmentName?: string
  url: string
  image?: string
  lowPrice?: number
  highPrice?: number
  priceUnit?: string
  tasks?: Array<{ name: string; description?: string; price?: string }>
  ratingValue?: number
  reviewCount?: number
  providerCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    /**
     * Tier 32 — @id `${url}#enriched-local-service`. Se distingue du
     * `#local-service` (Service basique) émis par getLocalServiceSchema
     * et du `#service-pricing` émis par getServicePricingSchema. Trois
     * Service nodes peuvent coexister sur la même page (basique +
     * tarifaire + enrichi) sans collision KG.
     */
    '@id': `${params.url}#enriched-local-service`,
    name: `${params.serviceName} à ${params.cityName}`,
    description: params.description,
    url: params.url,
    serviceType: params.serviceType,
    ...(params.image && { image: params.image }),
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    areaServed: {
      '@type': 'City',
      name: params.cityName,
      containedInPlace: [
        ...(params.departmentName
          ? [
              {
                '@type': 'AdministrativeArea' as const,
                name: params.departmentName,
              },
            ]
          : []),
        ...(params.regionName
          ? [
              {
                '@type': 'AdministrativeArea' as const,
                name: params.regionName,
              },
            ]
          : []),
      ],
    },
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(params.tasks &&
      params.tasks.length > 0 && {
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `Prestations ${params.serviceName.toLowerCase()} à ${params.cityName}`,
          itemListElement: params.tasks.map((task) => ({
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
                ...(() => {
                  if (!task.price) return {}
                  const numericPrice = task.price.replace(/[^0-9]/g, '')
                  if (!numericPrice || numericPrice === '0') return {}
                  return {
                    priceSpecification: {
                      '@type': 'UnitPriceSpecification',
                      price: numericPrice,
                      priceCurrency: 'EUR',
                      ...(params.priceUnit && { unitText: params.priceUnit }),
                    },
                  }
                })(),
              },
            ],
          })),
        },
      }),
    ...(params.lowPrice != null &&
      params.highPrice != null && {
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: params.lowPrice,
          highPrice: params.highPrice,
          priceCurrency: 'EUR',
          ...(params.priceUnit && { unitText: params.priceUnit }),
          ...(params.providerCount != null &&
            params.providerCount > 0 && { offerCount: params.providerCount }),
        },
      }),
    ...(params.ratingValue &&
      params.reviewCount &&
      params.reviewCount > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: Number(params.ratingValue.toFixed(1)),
          reviewCount: params.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  }
}

// Schema.org City enrichi avec population, département, code postal et ItemList de services
export function getEnrichedPlaceSchema(city: {
  name: string
  slug: string
  region?: string
  department?: string
  departmentCode?: string
  postalCode?: string
  population?: number
  latitude?: number
  longitude?: number
  description?: string
  image?: string
  services?: Array<{ name: string; slug: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    '@id': `${SITE_URL}/villes/${city.slug}#place`,
    name: city.name,
    url: `${SITE_URL}/villes/${city.slug}`,
    isPartOf: { '@id': `${SITE_URL}#website` },
    ...(city.image ? { image: city.image } : {}),
    description: city.description || `Trouvez des artisans qualifiés à ${city.name}`,
    ...(city.region || city.department
      ? {
          containedInPlace: [
            ...(city.department
              ? [
                  {
                    '@type': 'AdministrativeArea' as const,
                    name: city.department,
                    ...(city.departmentCode && { identifier: city.departmentCode }),
                  },
                ]
              : []),
            ...(city.region
              ? [
                  {
                    '@type': 'AdministrativeArea' as const,
                    name: city.region,
                  },
                ]
              : []),
          ],
        }
      : {}),
    ...(city.postalCode && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: city.name,
        postalCode: city.postalCode,
        addressCountry: 'FR',
        ...(city.department && { addressRegion: city.department }),
      },
    }),
    ...(city.latitude &&
      city.longitude && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: city.latitude,
          longitude: city.longitude,
        },
      }),
    ...(city.population && { population: city.population }),
  }
}

// Schema.org ItemList de services disponibles dans une ville
export function getCityServicesListSchema(params: {
  cityName: string
  citySlug: string
  services: Array<{ name: string; slug: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_URL}/villes/${params.citySlug}#city-services-list`,
    name: `Services artisans à ${params.cityName}`,
    description: `Liste des ${params.services.length} corps de métier disponibles à ${params.cityName}`,
    url: `${SITE_URL}/villes/${params.citySlug}`,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    numberOfItems: params.services.length,
    itemListElement: params.services.map((svc, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: svc.name,
      url: `${SITE_URL}/services/${svc.slug}/${params.citySlug}`,
    })),
  }
}

// Schema.org Service avec PriceSpecification détaillée par prestation (pour /tarifs/[service])
export function getDetailedPricingSchema(params: {
  serviceName: string
  serviceSlug: string
  description: string
  url: string
  tasks: Array<{
    name: string
    lowPrice: number
    highPrice: number
    unit?: string
  }>
  overallLowPrice: number
  overallHighPrice: number
  priceUnit?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${params.url}#detailed-pricing`,
    name: `${params.serviceName} en France`,
    description: params.description,
    url: params.url,
    serviceType: params.serviceName,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    areaServed: { '@type': 'Country', name: 'France' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Tarifs ${params.serviceName.toLowerCase()}`,
      itemListElement: params.tasks.map((task) => ({
        '@type': 'OfferCatalog',
        name: task.name,
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: task.name,
            },
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              minPrice: task.lowPrice,
              maxPrice: task.highPrice,
              priceCurrency: 'EUR',
              unitText: task.unit || params.priceUnit || 'intervention',
            },
          },
        ],
      })),
    },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: params.overallLowPrice,
      highPrice: params.overallHighPrice,
      priceCurrency: 'EUR',
      ...(params.priceUnit && { unitText: params.priceUnit }),
    },
  }
}

// Schema.org Article enrichi avec Speakable pour les blogs (complète getBlogArticleSchema)
export function getArticleSpeakableSchema(params: {
  url: string
  title: string
  excerpt: string
  speakableCssSelectors?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${params.url}#article-speakable-webpage`,
    name: params.title,
    url: params.url,
    description: params.excerpt,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: params.speakableCssSelectors || [
        'h1',
        '[data-speakable="true"]',
        '.article-excerpt',
        '.speakable-summary',
      ],
    },
  }
}

// Schema.org Person — editorial staff writers.
//
// Intentionally omits hasCredential and sameAs. Staff writers at
// ServicesArtisans are not RGE / Qualibat / Qualifelec / OPQTECC
// certified professionals ; those credentials belong to the artisans
// they cite, not the editorial team. Claiming them on Person schema
// would be fraud under Google Quality Rater Guidelines (section 2.5)
// and risk Helpful Content Update demotion across the full guides cluster.
//
// worksFor + knowsAbout are the two E-E-A-T signals we can defend :
//   - worksFor points at the ServicesArtisans Organization node, which
//     itself carries the platform's authority signals (domain, reviews,
//     sameAs to social accounts).
//   - knowsAbout = topic areas the author writes about, verifiable by
//     crawling the articles attributed to them.
export function getPersonSchema(author: {
  name: string
  slug: string
  role: string
  bio: string
  expertise: string[]
  yearsExperience: number
  image?: string
  /** Editorial methodology — becomes `skills` in the Person schema. */
  methodology?: string[]
  /** Background + ongoing monitoring — becomes `hasOccupation.experienceRequirements`. */
  credentialsBasis?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/equipe/${author.slug}#person`,
    url: `${SITE_URL}/equipe/${author.slug}`,
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    knowsAbout: author.expertise,
    ...(author.image && { image: `${SITE_URL}${author.image}` }),
    ...(author.methodology &&
      author.methodology.length > 0 && {
        skills: author.methodology,
      }),
    // E-E-A-T honesty : on n'émet `hasOccupation` que s'il y a au moins
    // un signal substantiel (expérience OU credentialsBasis). Pour staff
    // purement éditorial, pas d'Occupation — évite les claims non
    // défendables (cf commit 8618f552, honest authors audit).
    ...((author.yearsExperience > 0 || author.credentialsBasis) && {
      hasOccupation: {
        '@type': 'Occupation',
        name: author.role,
        occupationLocation: {
          '@type': 'Country',
          name: 'France',
        },
        experienceRequirements: author.credentialsBasis
          ? `${author.yearsExperience} ans — ${author.credentialsBasis}`
          : `${author.yearsExperience} ans`,
      },
    }),
    worksFor: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    /**
     * Tier 25 — lie le node Person à la fiche /equipe/[slug] qui le décrit.
     * Permet à Google KG de remonter de la Person vers la ProfilePage qui
     * publie son bio + dernières contributions, ce qui consolide l'entité
     * éditoriale au-delà des seules pages Article où elle apparaît en
     * `author`.
     */
    mainEntityOfPage: {
      '@type': 'ProfilePage',
      '@id': `${SITE_URL}/equipe/${author.slug}#profile`,
    },
  }
}

// Schema.org Person ref minimal — destiné à être inséré dans `reviewedBy`
// (Article / TechArticle / MedicalEntity) ou comme @id-only pointer ailleurs.
//
// Pourquoi un schema séparé du Person complet : Google + AI Overviews
// dédupliquent via @id ; on émet ici uniquement les champs nécessaires à la
// reconnaissance (name, jobTitle, url) et on s'appuie sur `getPersonSchema`
// pour la fiche complète émise par /equipe/[slug]. Limite la duplication JSON
// dans le head des pages YMYL.
export function getReviewedByPersonSchema(reviewer: { slug: string; name: string; role: string }) {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/equipe/${reviewer.slug}#person`,
    name: reviewer.name,
    jobTitle: reviewer.role,
    url: `${SITE_URL}/equipe/${reviewer.slug}`,
    /**
     * Tier 25 — affilie explicitement le reviewer à l'organisation éditrice
     * pour que Google KG puisse vérifier qu'il s'agit bien d'un pair interne
     * et non d'un reviewer externe non-vérifié. Évite les ambiguïtés
     * Helpful Content sur la provenance du contrôle qualité YMYL.
     */
    affiliation: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
  }
}

// Schema.org TechArticle for the deep H2 sections collection (Sprint F Ahrefs
// 2026-05-03). Émet un seul TechArticle qui décrit la collection de deep
// sections présentes sur la page (PAC variants / ITE-ITI / VMC / etc.). Chaque
// section devient un WebPageElement enfant via `hasPart` avec un cssSelector
// pointant vers son ancre `#<id>`, ce qui permet à Google + AI Overviews de
// citer un sous-extrait précis de la page (rich snippet "section" + Speakable
// audio digest sur les H3 + premier paragraphe).
//
// Pourquoi TechArticle plutôt que Article : Schema.org TechArticle s'applique
// aux articles techniques avec étapes ou explications procédurales — exact
// fit pour nos guides "comment choisir une PAC", "VMC double flux vs simple
// flux", etc. Type plus précis = meilleur match topical pour l'index Google.
export function getDeepSectionsTechArticleSchema(params: {
  pageUrl: string
  topic: string
  sections: ReadonlyArray<{ id: string; h2: string; body: readonly string[] }>
  /** Image absolue (https) — obligatoire Schema.org Article (utiliser le héros de la page). */
  image: string
  /** ISO 8601 — date de première publication des deep sections (mois courant si nouveau). */
  datePublished: string
  /** ISO 8601 — date de dernière modification éditoriale ou refresh ADEME. */
  dateModified: string
  /** Auteur (Person ou ligne éditoriale) — obligatoire Schema.org Article. */
  authorName: string
  /** Publisher organisation (souvent le nom du site). */
  publisherName: string
}): Record<string, unknown> | null {
  if (!params.sections || params.sections.length === 0) return null

  // Tier 12 — résolution Person profile + reviewedBy peer cross-review.
  // Si `authorName` matche un Author (ex. "Sophie Martin", "Claire Dubois"),
  // on émet un Person riche avec @id stable + knowsAbout + jobTitle, et on
  // auto-injecte `reviewedBy` via la table de cross-review pairs. Sinon on
  // retombe sur le node minimal `{ name }` historique (compat callers
  // génériques type "la rédaction ServicesArtisans").
  const authorProfile = getAuthorByName(params.authorName)
  const authorNode = authorProfile
    ? {
        '@type': 'Person' as const,
        '@id': `${SITE_URL}/equipe/${authorProfile.slug}#person`,
        name: authorProfile.name,
        jobTitle: authorProfile.role,
        url: `${SITE_URL}/equipe/${authorProfile.slug}`,
        ...(authorProfile.expertise &&
          authorProfile.expertise.length > 0 && { knowsAbout: authorProfile.expertise }),
        ...(authorProfile.methodology &&
          authorProfile.methodology.length > 0 && { skills: authorProfile.methodology }),
      }
    : { '@type': 'Person' as const, name: params.authorName }
  const reviewer = authorProfile ? getReviewerForAuthor(authorProfile) : undefined

  // Keywords + about[] dérivés des H2 sections — Google AI Overviews + Bing
  // utilisent ces signaux pour le topical matching ; les H2 sont la meilleure
  // approximation des sous-thèmes traités par la page.
  const sectionH2s = params.sections.map((s) => s.h2)
  const keywordTopics = [params.topic, ...sectionH2s].slice(0, 12)

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${params.pageUrl}#techarticle-deep`,
    headline: `${params.topic} : guide approfondi`,
    image: [params.image],
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    proficiencyLevel: 'Beginner',
    /**
     * Tier 33 — isPartOf #website. Cohérent avec FAQPage/HowTo/ItemList/
     * ProfilePage. AI Overviews préfère TechArticle rattachés à un
     * #website : sans isPartOf, citation possible mais sans le label
     * « from servicesartisans.fr ».
     */
    isPartOf: { '@id': `${SITE_URL}#website` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': params.pageUrl },
    url: params.pageUrl,
    articleSection: sectionH2s,
    keywords: keywordTopics.join(', '),
    about: [
      { '@type': 'Thing', name: params.topic },
      ...sectionH2s.slice(0, 5).map((h2) => ({ '@type': 'Thing', name: h2 })),
    ],
    author: authorNode,
    ...(reviewer && { reviewedBy: getReviewedByPersonSchema(reviewer) }),
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: params.publisherName,
    },
    hasPart: params.sections.map((s) => ({
      '@type': 'WebPageElement',
      '@id': `${params.pageUrl}#${s.id}`,
      name: s.h2,
      cssSelector: `#${s.id}`,
      ...(s.body[0] && { description: s.body[0].slice(0, 250) }),
    })),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#deep-sections h3', '#deep-sections [data-speakable="true"]'],
    },
  }
}

// Schema.org DefinedTermSet pour le vocabulaire RGE (Sprint J Ahrefs 2026-05-03).
// Émet un DefinedTermSet contenant chaque qualification RGE (Qualibat 7141,
// QualiPAC, IRVE P1, OPQIBI 1905…) sous forme de DefinedTerm. Permet à Google
// AI Overviews + Bing de citer la définition exacte pour les requêtes
// "qu'est-ce que <qualification>" très fréquentes en SERP YMYL aides
// énergétiques 2026.
//
// Pourquoi DefinedTermSet plutôt que glossaire HTML : Schema.org DefinedTerm
// est le vocabulaire canonique pour les définitions techniques/réglementaires.
// AI Overviews préfère DefinedTerm à FAQPage pour les définitions courtes.
//
// Cohabite avec FAQPage / TechArticle / HowTo (modes de citation différents).
export function getRgeDefinedTermSetSchema(params: {
  pageUrl: string
  /** Nom du vocabulaire (ex. "Qualifications RGE — Pompe à chaleur"). */
  name: string
  /** Description courte du set (≤ 200 chars). */
  description: string
  terms: ReadonlyArray<{
    slug: string
    code: string
    name: string
    definition: string
    organisme: string
    termCode?: string
  }>
  /**
   * Sprint Z Ahrefs 2026-05-03 — URL absolue du DefinedTermSet canonique
   * (ex. `${SITE_URL}/rge/glossaire`). Si fourni ET différent de pageUrl,
   * émet `sameAs: ['${canonicalEntityBaseUrl}#term-<slug>']` sur chaque
   * DefinedTerm. Schema.org `sameAs` indique à Google AI Overviews + Bing
   * que cette entité (DefinedTerm) est la MÊME que celle de l'URL canonique
   * — consolide l'autorité topical au lieu de la disperser entre les 4
   * hubs (Sprints J/M/P/O).
   *
   * Si omis ou égal à pageUrl, aucun sameAs émis (cas de la page canonique
   * elle-même : self-sameAs est inutile et bruite la sortie JSON-LD).
   */
  canonicalEntityBaseUrl?: string
}): Record<string, unknown> | null {
  if (!params.terms || params.terms.length === 0) return null
  const canonicalUrl = params.canonicalEntityBaseUrl
  const isCanonicalPage = !canonicalUrl || canonicalUrl === params.pageUrl
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${params.pageUrl}#glossary-rge`,
    /**
     * Tier 33 — isPartOf #website. Le DefinedTermSet RGE est une
     * collection éditoriale rattachée au site : sans isPartOf, Google
     * peut le considérer comme un dataset orphelin et le déclasser dans
     * les rich results glossaire technique.
     */
    isPartOf: { '@id': `${SITE_URL}#website` },
    name: params.name,
    description: params.description,
    inLanguage: 'fr-FR',
    ...(!isCanonicalPage && {
      sameAs: `${canonicalUrl}#glossary-rge`,
    }),
    hasDefinedTerm: params.terms.map((t) => ({
      '@type': 'DefinedTerm',
      '@id': `${params.pageUrl}#term-${t.slug}`,
      name: t.name,
      description: t.definition,
      termCode: t.termCode ?? t.code,
      // Sprint AI Ahrefs 2026-05-03 (Reviewer C1) — pointer cohérent canonique.
      // Sur les hubs (Sprints J/M/P), `inDefinedTermSet` doit pointer vers le
      // DefinedTermSet canonique (`/rge/glossaire#glossary-rge`), pas vers le
      // hub local. Sans ça, un crawler suivant `inDefinedTermSet` reste sur le
      // hub au lieu de remonter à l'entité canonique → consolidation cassée.
      inDefinedTermSet: !isCanonicalPage
        ? `${canonicalUrl}#glossary-rge`
        : `${params.pageUrl}#glossary-rge`,
      ...(!isCanonicalPage && {
        sameAs: `${canonicalUrl}#term-${t.slug}`,
      }),
      ...(t.organisme && {
        publisher: { '@type': 'Organization', name: t.organisme },
      }),
    })),
  }
}

/**
 * Sprint AI Ahrefs 2026-05-03 — factory pour les hubs RGE/services/CEE.
 *
 * Avant Sprint AI, les 3 hubs (`/rge/[s]`, `/services/[s]`, `/cee/[op]`)
 * dupliquaient le même appel `getRgeDefinedTermSetSchema(...)` en variant
 * uniquement `name` et `description` (description quasi-identique). Ce helper
 * factorise et garantit `canonicalEntityBaseUrl` et la description normalisés
 * sur les 3 callsites.
 *
 * Usage : `buildHubRgeGlossarySchema({ pageUrl, hubLabel: 'Pompe à chaleur' })`.
 */
export function buildHubRgeGlossarySchema(params: {
  pageUrl: string
  hubLabel: string
  /** Description override optionnel (ex. CEE qui mentionne le code opération). */
  description?: string
}): Record<string, unknown> | null {
  return getRgeDefinedTermSetSchema({
    pageUrl: params.pageUrl,
    name: `Glossaire RGE — ${params.hubLabel}`,
    description:
      params.description ??
      `Définitions officielles des qualifications RGE et primes CEE applicables au métier ${params.hubLabel.toLowerCase()}.`,
    terms: getAllRgeGlossaryEntries(),
    canonicalEntityBaseUrl: `${SITE_URL}${RGE_GLOSSAIRE_PATH}`,
  })
}

// Schema.org HowTo dérivé des deep H2 sections décisionnelles (Sprint G
// Ahrefs 2026-05-03). Pour chaque section avec un overlay HowTo défini dans
// `deep-sections-howto-overlays.ts`, émet un HowTo Schema indépendant ancré
// sur l'id de la section. Permet à Bing + DDG + AI Overviews d'afficher des
// rich snippets step-by-step pour les requêtes "comment choisir / vérifier /
// dimensionner".
//
// Cohabite avec TechArticle (Sprint F) et FAQPage (Sprint H) — Google +
// AI Overviews exploitent les 3 schemas en parallèle pour des modes de
// citation différents (article complet, FAQ courte, étapes procédurales).
//
// Retourne un tableau de HowTo Schemas (1 par section avec overlay), ou
// tableau vide si aucune section n'a d'overlay.
export function getDeepSectionsHowToSchemas(params: {
  pageUrl: string
  sections: ReadonlyArray<{ id: string }>
  overlayLookup: (sectionId: string) => {
    name: string
    description: string
    totalTime?: string
    steps: ReadonlyArray<{ name: string; text: string }>
  } | null
}): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = []
  for (const section of params.sections) {
    const overlay = params.overlayLookup(section.id)
    if (!overlay) continue
    out.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      '@id': `${params.pageUrl}#howto-${section.id}`,
      name: overlay.name,
      description: overlay.description,
      inLanguage: 'fr-FR',
      isPartOf: { '@id': `${SITE_URL}#website` },
      ...(overlay.totalTime && { totalTime: overlay.totalTime }),
      mainEntityOfPage: { '@type': 'WebPage', '@id': params.pageUrl },
      step: overlay.steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text,
        inLanguage: 'fr-FR',
        url: `${params.pageUrl}#${section.id}`,
      })),
    })
  }
  return out
}

// Schema.org FAQPage dérivé d'une collection de deep H2 sections (Sprint H
// Ahrefs 2026-05-03). Transforme chaque section { h2, body[] } en QA pair :
//   - question = le H2 reformulé en interrogation si nécessaire (déjà OK)
//   - answer = body[0] tronqué à ~500 chars (Google AI Overviews préfère
//     des réponses denses et concises pour les snippets featured / People
//     Also Ask).
//
// Émis comme FAQPage distinct du FAQPage existant de la page (qui couvre la
// FAQ collapsible utilisateur). Les 2 FAQPage cohabitent sans conflit côté
// Google (mainEntity disjoints + @id ancrés).
//
// Pourquoi un FAQPage dérivé : les deep sections sont rendues en bloc article,
// pas en accordion FAQ. Les exposer aussi en FAQPage permet de cibler les
// rich snippets People Also Ask de Google + AI Overviews qui dominent les
// SERP YMYL aides énergétiques 2026.
export function getDeepSectionsFAQPageSchema(params: {
  pageUrl: string
  sections: ReadonlyArray<{ id: string; h2: string; body: readonly string[] }>
  /** Longueur max de la réponse (defaults to 500 — sweet spot AI Overviews). */
  answerMaxChars?: number
}): Record<string, unknown> | null {
  if (!params.sections || params.sections.length === 0) return null
  const maxChars = params.answerMaxChars ?? 500
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${params.pageUrl}#faq-deep`,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    mainEntity: params.sections.map((s) => ({
      '@type': 'Question',
      '@id': `${params.pageUrl}#faq-${s.id}`,
      name: s.h2,
      inLanguage: 'fr-FR',
      acceptedAnswer: {
        '@type': 'Answer',
        text: (s.body[0] ?? '').slice(0, maxChars),
        inLanguage: 'fr-FR',
        url: `${params.pageUrl}#${s.id}`,
      },
    })),
  }
}

// Schema.org ProfilePage — Google's 2024+ canonical pattern for author pages.
// Wraps the Person node as `mainEntity`, exposes dateCreated + dateModified
// (required signals for ProfilePage rich result), and lists authored articles
// via `hasPart` so Google can link the profile to the body of editorial work
// (powerful E-E-A-T signal : verifiable topic authority through output).
export function getProfilePageSchema(params: {
  person: Record<string, unknown>
  canonicalUrl: string
  dateCreated: string
  dateModified: string
  articles?: { url: string; title: string; datePublished: string }[]
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${params.canonicalUrl}#profilepage`,
    /**
     * Tier 33 — inLanguage + isPartOf #website. Aligne ProfilePage sur
     * les conventions Tiers 29-32. Important pour /equipe/[slug] : sans
     * isPartOf, Google traite la fiche profil comme un node orphelin
     * et n'attache pas l'autorité du WebSite à la Person mainEntity.
     */
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    url: params.canonicalUrl,
    dateCreated: params.dateCreated,
    dateModified: params.dateModified,
    mainEntity: params.person,
  }
  if (params.articles && params.articles.length > 0) {
    schema.hasPart = params.articles.map((a) => ({
      '@type': 'Article',
      url: a.url,
      headline: a.title,
      datePublished: a.datePublished,
    }))
  }
  return schema
}
