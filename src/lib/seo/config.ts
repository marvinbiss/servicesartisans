export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
export const SITE_NAME = 'ServicesArtisans'

// SEO configuration object
export const defaultSEOConfig = {
  titleTemplate: '%s | ServicesArtisans',
  defaultTitle: 'ServicesArtisans - Trouvez les meilleurs artisans près de chez vous',
  description:
    'Trouvez et comparez les meilleurs artisans de votre région. Plombiers, électriciens, serruriers et plus. Devis gratuits et avis vérifiés.',
  canonical: SITE_URL,
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans - Trouvez les meilleurs artisans',
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
    ? `${serviceName} à ${location} - Devis Gratuit`
    : `${serviceName} - Trouvez un professionnel près de chez vous`

  const description = location
    ? `Trouvez les meilleurs ${serviceName.toLowerCase()}s à ${location}. Comparez les avis, obtenez des devis gratuits et contactez des professionnels vérifiés.`
    : `Trouvez un ${serviceName.toLowerCase()} qualifié près de chez vous. Devis gratuits, avis vérifiés, intervention rapide.`

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
    ville: `Artisans à ${locationName} - Tous les métiers`,
    region: `Artisans en ${locationName} - Trouvez un professionnel`,
    departement: `Artisans dans le ${locationName} - Devis gratuits`,
  }

  const descriptions: Record<string, string> = {
    ville: `Trouvez les meilleurs artisans à ${locationName}. Plombiers, électriciens, serruriers et plus. Devis gratuits et avis vérifiés.`,
    region: `Découvrez tous les artisans en ${locationName}. Comparez les professionnels par ville et métier.`,
    departement: `Artisans qualifiés dans le ${locationName}. Tous les métiers du bâtiment, devis gratuits.`,
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
  const title = `${artisanName} - ${service} à ${location}`
  const description = rating
    ? `${artisanName}, ${service.toLowerCase()} à ${location}. Note : ${rating}/5. Consultez les avis et demandez un devis gratuit.`
    : `${artisanName}, ${service.toLowerCase()} professionnel à ${location}. Devis gratuit, intervention rapide.`

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
