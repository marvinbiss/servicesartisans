/**
 * API Adresse data.gouv.fr
 * Documentation: https://adresse.data.gouv.fr/api-doc/adresse
 *
 * API officielle du gouvernement français
 * 100% GRATUIT - Pas de limite - Pas de clé API
 */

export interface AdresseSuggestion {
  id: string
  label: string
  name: string
  city: string
  postcode: string
  citycode: string
  context: string // "75, Paris, Île-de-France"
  type: 'housenumber' | 'street' | 'locality' | 'municipality'
  coordinates: [number, number] // [longitude, latitude]
  importance: number
  score: number
}

export interface GeocodageResult {
  coordinates: [number, number] // [longitude, latitude]
  label: string
  city: string
  postcode: string
  context: string
  confidence: number
}

// ============================================
// AUTOCOMPLETE ADRESSES
// ============================================

/**
 * Autocomplete pour recherche d'adresses complètes
 * @param query - Texte de recherche (ex: "12 rue de la")
 * @param options - Options de filtrage
 */
export async function autocompleteAdresse(
  query: string,
  options?: {
    limit?: number
    type?: 'housenumber' | 'street' | 'locality' | 'municipality'
    postcode?: string
    citycode?: string
    lat?: number
    lon?: number
  }
): Promise<AdresseSuggestion[]> {
  if (!query || query.length < 2) return []

  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(options?.limit || 5),
      autocomplete: '1'
    })

    if (options?.type) params.append('type', options.type)
    if (options?.postcode) params.append('postcode', options.postcode)
    if (options?.citycode) params.append('citycode', options.citycode)
    if (options?.lat && options?.lon) {
      params.append('lat', String(options.lat))
      params.append('lon', String(options.lon))
    }

    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?${params.toString()}`
    )

    if (!response.ok) {
      console.error('API Adresse error:', response.status)
      return []
    }

    const data = await response.json()

    return data.features.map((f: any) => ({
      id: f.properties.id,
      label: f.properties.label,
      name: f.properties.name,
      city: f.properties.city,
      postcode: f.properties.postcode,
      citycode: f.properties.citycode,
      context: f.properties.context,
      type: f.properties.type,
      coordinates: f.geometry.coordinates,
      importance: f.properties.importance,
      score: f.properties.score
    }))
  } catch (error) {
    console.error('Erreur autocomplete adresse:', error)
    return []
  }
}

// ============================================
// AUTOCOMPLETE VILLES UNIQUEMENT
// ============================================

/**
 * Autocomplete pour recherche de villes uniquement
 * @param query - Nom de ville ou code postal
 */
export async function autocompleteVille(
  query: string,
  limit = 10
): Promise<AdresseSuggestion[]> {
  if (!query || query.length < 2) return []

  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      type: 'municipality',
      autocomplete: '1'
    })

    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?${params.toString()}`
    )

    if (!response.ok) return []

    const data = await response.json()

    return data.features.map((f: any) => ({
      id: f.properties.id,
      label: f.properties.city || f.properties.label,
      name: f.properties.name,
      city: f.properties.city,
      postcode: f.properties.postcode,
      citycode: f.properties.citycode,
      context: f.properties.context,
      type: f.properties.type,
      coordinates: f.geometry.coordinates,
      importance: f.properties.importance,
      score: f.properties.score
    }))
  } catch (error) {
    console.error('Erreur autocomplete ville:', error)
    return []
  }
}

// ============================================
// GEOCODAGE (Adresse → Coordonnées GPS)
// ============================================

/**
 * Convertit une adresse en coordonnées GPS
 * @param adresse - Adresse complète (ex: "12 rue de Rivoli, Paris")
 */
export async function geocoder(adresse: string): Promise<GeocodageResult | null> {
  if (!adresse || adresse.length < 3) return null

  try {
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=1`
    )

    if (!response.ok) return null

    const data = await response.json()

    if (!data.features || data.features.length === 0) return null

    const feature = data.features[0]
    return {
      coordinates: feature.geometry.coordinates,
      label: feature.properties.label,
      city: feature.properties.city,
      postcode: feature.properties.postcode,
      context: feature.properties.context,
      confidence: feature.properties.score
    }
  } catch (error) {
    console.error('Erreur géocodage:', error)
    return null
  }
}

// ============================================
// REVERSE GEOCODING (GPS → Adresse)
// ============================================

/**
 * Convertit des coordonnées GPS en adresse
 * @param lon - Longitude
 * @param lat - Latitude
 */
export async function reverseGeocode(
  lon: number,
  lat: number
): Promise<GeocodageResult | null> {
  try {
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}`
    )

    if (!response.ok) return null

    const data = await response.json()

    if (!data.features || data.features.length === 0) return null

    const feature = data.features[0]
    return {
      coordinates: feature.geometry.coordinates,
      label: feature.properties.label,
      city: feature.properties.city,
      postcode: feature.properties.postcode,
      context: feature.properties.context,
      confidence: feature.properties.score
    }
  } catch (error) {
    console.error('Erreur reverse geocoding:', error)
    return null
  }
}

// ============================================
// RECHERCHE PAR CODE POSTAL
// ============================================

/**
 * Récupère toutes les communes d'un code postal
 * @param codePostal - Code postal (ex: "75001")
 */
export async function getCommunesByCodePostal(
  codePostal: string
): Promise<AdresseSuggestion[]> {
  if (!codePostal || codePostal.length !== 5) return []

  try {
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${codePostal}&type=municipality&limit=20`
    )

    if (!response.ok) return []

    const data = await response.json()

    return data.features
      .filter((f: any) => f.properties.postcode === codePostal)
      .map((f: any) => ({
        id: f.properties.id,
        label: f.properties.city,
        name: f.properties.name,
        city: f.properties.city,
        postcode: f.properties.postcode,
        citycode: f.properties.citycode,
        context: f.properties.context,
        type: f.properties.type,
        coordinates: f.geometry.coordinates,
        importance: f.properties.importance,
        score: f.properties.score
      }))
  } catch (error) {
    console.error('Erreur recherche code postal:', error)
    return []
  }
}

// ============================================
// CALCUL DE DISTANCE
// ============================================

/**
 * Calcule la distance entre deux points GPS (formule Haversine)
 * @returns Distance en kilomètres
 */
export function calculerDistance(
  coord1: [number, number], // [lon, lat]
  coord2: [number, number]  // [lon, lat]
): number {
  const R = 6371 // Rayon de la Terre en km
  const dLat = toRad(coord2[1] - coord1[1])
  const dLon = toRad(coord2[0] - coord1[0])
  const lat1 = toRad(coord1[1])
  const lat2 = toRad(coord2[1])

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(R * c * 10) / 10 // Arrondi à 0.1 km
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

// ============================================
// VALIDATION CODE POSTAL
// ============================================

/**
 * Valide un code postal français
 */
export function isValidCodePostal(codePostal: string): boolean {
  if (!codePostal || typeof codePostal !== 'string') return false

  // 5 chiffres, commence par 01-95 ou 97 (DOM) ou 98 (Monaco, etc.)
  const regex = /^(?:0[1-9]|[1-8]\d|9[0-5]|97[1-6]|98[4-9])\d{3}$/
  return regex.test(codePostal)
}

// ============================================
// FORMATTAGE ADRESSE
// ============================================

/**
 * Formate une adresse proprement
 */
export function formaterAdresse(components: {
  numero?: string
  rue?: string
  codePostal?: string
  ville?: string
}): string {
  const parts: string[] = []

  if (components.numero && components.rue) {
    parts.push(`${components.numero} ${components.rue}`)
  } else if (components.rue) {
    parts.push(components.rue)
  }

  if (components.codePostal && components.ville) {
    parts.push(`${components.codePostal} ${components.ville}`)
  } else if (components.ville) {
    parts.push(components.ville)
  }

  return parts.join(', ')
}
