import { getDeptPreposition, getRegionPreposition } from '@/lib/geo-strings'
import { sanitizeUrl } from '@/lib/utils/sanitize-url'

// Defensive : `NEXT_PUBLIC_SITE_URL` had a literal `\n` baked into Vercel env
// (2026-05-22 incident), cascading into JSON-LD `@id` on 45 677 RGE pages.
// `sanitizeUrl` strips ALL whitespace + control chars + trailing slashes, so
// any env pollution cannot leak into canonicals, OG URLs, sitemap entries.
export const SITE_URL = sanitizeUrl(process.env.NEXT_PUBLIC_SITE_URL)
export const SITE_NAME = 'ServicesArtisans'
export const PHONE_NUMBER = '07 56 87 27 87'
export const PHONE_TEL = 'tel:+33756872787'

/**
 * Nombre de conseillers commerciaux disponibles. Source de vérité unique
 * (équipe ServicesArtisans 2026 : 2 commerciales seniores). Utilisé par
 * l'UX trust signals (sticky bar, sidebar CTA, hero, exit-intent…).
 * Met à jour ici uniquement quand l'équipe change.
 */
export const ADVISORS_COUNT: number = 2
export const ADVISORS_LABEL: string =
  ADVISORS_COUNT === 1 ? '1 conseiller disponible' : `${ADVISORS_COUNT} conseillers disponibles`
export const ADVISORS_LABEL_SHORT: string =
  ADVISORS_COUNT === 1 ? '1 conseiller dispo' : `${ADVISORS_COUNT} conseillers dispo`

// SEO configuration object
export const defaultSEOConfig = {
  titleTemplate: '%s | ServicesArtisans',
  defaultTitle: 'ServicesArtisans — Annuaire des artisans RGE certifiés en France',
  description:
    "Annuaire 100% artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) dans 101 départements. Données SIREN vérifiées + certification ADEME. Devis gratuits.",
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
        alt: 'ServicesArtisans — Trouvez des artisans RGE certifiés près de chez vous',
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
    : `${serviceName} RGE en France — Artisans certifiés Qualibat / Qualifelec / QualiPAC`

  const description = location
    ? `Trouvez un ${serviceName.toLowerCase()} RGE certifié à ${location} parmi des milliers d'artisans. Comparez les profils, consultez les coordonnées et demandez un devis gratuit.`
    : `Annuaire des ${serviceName.toLowerCase()}s RGE certifiés en France. Artisans Qualibat, Qualifelec, QualiPAC, Qualit'EnR dans 101 départements. Recherche gratuite, devis sans engagement.`

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
export function getLocationSEO(
  locationType: 'ville' | 'region' | 'departement',
  locationName: string
) {
  const titles: Record<string, string> = {
    ville: `Artisans RGE à ${locationName} — Annuaire certifié`,
    region: `Artisans RGE ${getRegionPreposition(locationName)} — Métiers de la rénovation énergétique`,
    departement: `Artisans RGE ${getDeptPreposition(locationName)} — Annuaire & Devis gratuits`,
  }

  const descriptions: Record<string, string> = {
    ville: `Annuaire complet des artisans RGE certifiés à ${locationName}. Métiers Qualibat, Qualifelec, QualiPAC, Qualit'EnR. 100% gratuit.`,
    region: `Trouvez un artisan RGE certifié ${getRegionPreposition(locationName)} parmi des milliers de professionnels Qualibat, Qualifelec, QualiPAC, Qualit'EnR. Tous les départements.`,
    departement: `Artisans RGE certifiés ${getDeptPreposition(locationName)}. 21 métiers de la rénovation énergétique. Recherche gratuite, devis sans engagement.`,
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

/**
 * Generate alternates metadata with canonical + hreflang for any page.
 * Centralizes hreflang to ensure all pages declare fr-FR + x-default.
 */
export function getAlternates(path: string) {
  const url = `${SITE_URL}${path}`
  return {
    canonical: url,
    languages: {
      'fr-FR': url,
      'x-default': url,
    },
  }
}

/**
 * OpenGraph fields that MUST appear on every indexable page.
 * Ahrefs flags pages as "OG incomplete" when siteName / locale / images
 * fail to cascade from the root layout — this helper injects them
 * defensively so scrapers always see the full tag set.
 *
 * Usage in generateMetadata():
 *   openGraph: { ...getOgDefaults(), title, description, url, type: 'article' }
 */
export function getOgDefaults() {
  return {
    siteName: SITE_NAME,
    locale: 'fr_FR',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Annuaire des artisans RGE certifiés en France`,
      },
    ],
  }
}

// SEO pour les artisans
export function getArtisanSEO(
  artisanName: string,
  service: string,
  location: string,
  rating?: number
) {
  const title = `${artisanName} — ${service} à ${location}`
  const description = rating
    ? `${artisanName}, ${service.toLowerCase()} à ${location}. Note : ${rating}/5. Entreprise vérifiée SIREN + certification RGE ADEME. Consultez le profil et demandez un devis gratuit.`
    : `${artisanName}, ${service.toLowerCase()} à ${location}. Entreprise vérifiée SIREN + certification RGE ADEME. Coordonnées, profil et devis gratuit.`

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
