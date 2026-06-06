/**
 * Smart Defaults — Amazon-style intelligent form pre-filling.
 *
 * Pure functions that extract context from URL, referrer, and geolocation
 * to pre-fill the DevisForm. No side effects, no DOM manipulation.
 */

import { services } from '@/lib/data/france'

export interface SmartDefaults {
  service: string | null
  ville: string | null
  urgence: string | null
}

/**
 * Extract service slug from the current URL path.
 * Matches patterns like /services/plombier, /services/plombier/paris, /devis?service=plombier
 */
export function detectServiceFromURL(
  pathname: string,
  searchParams?: URLSearchParams
): string | null {
  // Check query params first (?service=plombier)
  const fromQuery = searchParams?.get('service')
  if (fromQuery) {
    const match = services.find((s) => s.slug === fromQuery.toLowerCase())
    if (match) return match.slug
  }

  // Check URL path: /services/{service} or /services/{service}/{ville}
  const servicePathMatch = pathname.match(/\/services\/([a-z-]+)/i)
  if (servicePathMatch) {
    const candidate = servicePathMatch[1].toLowerCase()
    const match = services.find((s) => s.slug === candidate)
    if (match) return match.slug
  }

  return null
}

/**
 * Extract city name from the current URL path.
 * Matches patterns like /services/plombier/paris, /devis?ville=paris
 */
export function detectVilleFromURL(
  pathname: string,
  searchParams?: URLSearchParams
): string | null {
  // Check query params first (?ville=paris)
  const fromQuery = searchParams?.get('ville')
  if (fromQuery) {
    return capitalize(fromQuery)
  }

  // Check URL path: /services/{service}/{ville}
  const villePathMatch = pathname.match(/\/services\/[a-z-]+\/([a-z-]+)/i)
  if (villePathMatch) {
    const raw = villePathMatch[1]
    // Convert URL slug to display name: "saint-etienne" → "Saint-Étienne"
    return raw
      .split('-')
      .map((part) => capitalize(part))
      .join('-')
  }

  return null
}

/**
 * Detect urgency from referrer or URL context.
 * If user comes from /urgence or URL contains urgence/emergency → pre-select "Urgent"
 */
export function detectUrgenceFromContext(
  pathname: string,
  referrer?: string,
  searchParams?: URLSearchParams
): string | null {
  // Query param ?urgence=urgent
  const fromQuery = searchParams?.get('urgence')
  if (fromQuery) return fromQuery

  // If current path or referrer contains /urgence
  if (pathname.includes('/urgence')) return 'urgent'
  if (referrer && referrer.includes('/urgence')) return 'urgent'

  return null
}

/**
 * Get all smart defaults for the current page context.
 * Call this once when the DevisForm mounts.
 */
export function getSmartDefaults(): SmartDefaults {
  if (typeof window === 'undefined') {
    return { service: null, ville: null, urgence: null }
  }

  const pathname = window.location.pathname
  const searchParams = new URLSearchParams(window.location.search)
  const referrer = document.referrer

  return {
    service: detectServiceFromURL(pathname, searchParams),
    ville: detectVilleFromURL(pathname, searchParams),
    urgence: detectUrgenceFromContext(pathname, referrer, searchParams),
  }
}

/**
 * Request geolocation and reverse-geocode via French government API.
 * Returns city name and postal code, or null if unavailable/denied.
 *
 * This is a PROPOSAL — the UI should ask the user to confirm before applying.
 */
export async function detectGeoLocation(): Promise<{
  ville: string
  codePostal: string
} | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 8000,
        maximumAge: 300_000, // Cache for 5 minutes
        enableHighAccuracy: false, // Faster, good enough for city-level
      })
    })

    const { latitude, longitude } = position.coords
    // 2026-06-06 : `type=municipality` renvoie `features: []` depuis la
    // migration BAN → Géoplateforme — reverse sans filtre, city/postcode
    // sont présents sur la housenumber la plus proche.
    const res = await fetch(
      `https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`
    )

    if (!res.ok) return null

    const data = await res.json()
    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const ville = feature.properties.city || feature.properties.name
      const codePostal = feature.properties.postcode
      if (ville) {
        return { ville, codePostal: codePostal || '' }
      }
    }
  } catch {
    // Permission denied, timeout, or network error — silent fail
  }

  return null
}

/**
 * Format a service slug for display: "plombier" → "Plombier"
 */
export function formatServiceName(slug: string): string {
  const match = services.find((s) => s.slug === slug)
  return match?.name || capitalize(slug)
}

// ─── Internal helpers ───

function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
