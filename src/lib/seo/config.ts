export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
export const SITE_NAME = 'ServicesArtisans'
export const PHONE_NUMBER = '01 76 34 00 00'
export const PHONE_TEL = 'tel:+33176340000'

// SEO configuration object
export const defaultSEOConfig = {
  titleTemplate: '%s | ServicesArtisans',
  defaultTitle: 'ServicesArtisans — 350 000+ artisans référencés en France',
  description:
    'Le plus grand annuaire d\'artisans de France. 350 000+ professionnels référencés dans 101 départements. Devis gratuits.',
  canonical: SITE_URL,
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans - Trouvez des artisans qualifiés près de chez vous',
      },
    ],
  },
  twitter: {
    handle: '@servicesartisans',
    site: '@servicesartisans',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'theme-color',
      content: '#2563eb',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'default',
    },
    {
      httpEquiv: 'x-ua-compatible',
      content: 'IE=edge',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
  ],
}

// SEO pour les pages de services
export function getServiceSEO(serviceName: string, location?: string) {
  const title = location
    ? `${serviceName} à ${location} — Annuaire & Devis Gratuit`
    : `${serviceName} en France — 350 000+ artisans référencés`

  const description = location
    ? `Trouvez un ${serviceName.toLowerCase()} à ${location} parmi des milliers de professionnels référencés. Comparez les profils, consultez les coordonnées et demandez un devis gratuit.`
    : `Annuaire des ${serviceName.toLowerCase()}s en France. Professionnels référencés dans 101 départements. Recherche gratuite, devis sans engagement.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

// SEO pour les pages de localisation
export function getLocationSEO(locationType: 'ville' | 'region' | 'departement', locationName: string) {
  const titles: Record<string, string> = {
    ville: `Artisans à ${locationName} — Annuaire référencés`,
    region: `Artisans en ${locationName} — Tous les métiers du bâtiment`,
    departement: `Artisans dans le ${locationName} — Annuaire & Devis gratuits`,
  }

  const descriptions: Record<string, string> = {
    ville: `Annuaire complet des artisans à ${locationName}. Des milliers de professionnels référencés : plombiers, électriciens, menuisiers et plus. 100% gratuit.`,
    region: `Trouvez un artisan en ${locationName} parmi des milliers de professionnels référencés. Tous les corps de métier, tous les départements.`,
    departement: `Artisans référencés dans le ${locationName}. Plus de 50 métiers du bâtiment couverts. Recherche gratuite, devis sans engagement.`,
  }

  return {
    title: titles[locationType],
    description: descriptions[locationType],
    openGraph: {
      title: titles[locationType],
      description: descriptions[locationType],
    },
  }
}

// SEO pour les artisans
export function getArtisanSEO(artisanName: string, service: string, location: string, rating?: number) {
  const title = `${artisanName} — ${service} à ${location}`
  const description = rating
    ? `${artisanName}, ${service.toLowerCase()} à ${location}. Note : ${rating}/5. Entreprise référencée par SIREN. Consultez le profil et demandez un devis gratuit.`
    : `${artisanName}, ${service.toLowerCase()} à ${location}. Entreprise référencée par SIREN. Coordonnées, profil et devis gratuit.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
    },
  }
}
