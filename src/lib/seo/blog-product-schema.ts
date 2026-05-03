import { SITE_URL } from '@/lib/seo/config'

type PriceServiceConfig = {
  serviceName: string
  serviceSlug: string
  priceMin: number
  priceMax: number
  unitDescription: string
  offerCount: number
}

const PRICE_ARTICLE_CONFIG: Record<string, PriceServiceConfig> = {
  'prix-plombier-2026-tarifs-horaires': {
    serviceName: 'Plombier',
    serviceSlug: 'plombier',
    priceMin: 45,
    priceMax: 95,
    unitDescription: 'tarif horaire HT en France 2026',
    offerCount: 14,
  },
  'prix-electricien-2026-tarifs-travaux': {
    serviceName: 'Électricien',
    serviceSlug: 'electricien',
    priceMin: 40,
    priceMax: 85,
    unitDescription: 'tarif horaire HT en France 2026',
    offerCount: 12,
  },
  'prix-installation-electrique-neuve-2026': {
    serviceName: 'Installation électrique neuve',
    serviceSlug: 'electricien',
    priceMin: 80,
    priceMax: 150,
    unitDescription: 'prix au m² (logement 100 m², norme NF C 15-100)',
    offerCount: 8,
  },
  'prix-menuisier-2026-tarifs-travaux': {
    serviceName: 'Menuisier',
    serviceSlug: 'menuisier',
    priceMin: 35,
    priceMax: 70,
    unitDescription: 'tarif horaire HT en France 2026',
    offerCount: 11,
  },
  'prix-macon-2026-gros-oeuvre-renovation': {
    serviceName: 'Maçon',
    serviceSlug: 'macon',
    priceMin: 40,
    priceMax: 85,
    unitDescription: 'tarif horaire HT en France 2026',
    offerCount: 14,
  },
  // Pivot full RGE 2026-05-03 : entrée 'prix-cuisiniste-2026-pose-cuisine'
  // retirée du PRICE_ARTICLE_CONFIG (slug cuisiniste commodity hors RGE).
  // L'article blog reste indexé mais ne génère plus de Schema Product.
  'chauffage-pompe-chaleur-vs-chaudiere-gaz-2026': {
    serviceName: 'Pompe à chaleur air-eau',
    serviceSlug: 'pompe-a-chaleur',
    priceMin: 8000,
    priceMax: 16000,
    unitDescription: 'installation complète (équipement + pose, hors aides)',
    offerCount: 4,
  },
}

export function getServicePriceSchema(slug: string): Record<string, unknown> | null {
  const cfg = PRICE_ARTICLE_CONFIG[slug]
  if (!cfg) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/blog/${slug}#service`,
    name: cfg.serviceName,
    serviceType: cfg.serviceName,
    areaServed: { '@type': 'Country', name: 'France' },
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: 'ServicesArtisans',
    },
    url: `${SITE_URL}/services/${cfg.serviceSlug}`,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: cfg.priceMin,
      highPrice: cfg.priceMax,
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'EUR',
        minPrice: cfg.priceMin,
        maxPrice: cfg.priceMax,
        description: cfg.unitDescription,
      },
      offerCount: cfg.offerCount,
      availability: 'https://schema.org/InStock',
      eligibleRegion: { '@type': 'Country', name: 'France' },
    },
    isRelatedTo: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/services/${cfg.serviceSlug}`,
    },
  }
}

export function isPriceArticle(slug: string): boolean {
  return slug in PRICE_ARTICLE_CONFIG
}
