/**
 * Mapbox API Client
 * Geocoding, directions, and maps
 * Documentation: https://docs.mapbox.com/api/
 */

import { retry } from '../utils/retry'
import { geocodeCache } from '../utils/cache'
import { APIError, ValidationError, ErrorCode } from '../utils/errors'
import { apiLogger } from '../utils/logger'

const MAPBOX_API_BASE = 'https://api.mapbox.com'

// Types
export interface Coordinates {
  longitude: number
  latitude: number
}

export interface GeocodingResult {
  id: string
  type: string
  placeName: string
  text: string
  center: Coordinates
  bbox?: [number, number, number, number]
  context: {
    postcode?: string
    locality?: string
    place?: string
    region?: string
    country?: string
  }
  relevance: number
}

export interface DirectionsResult {
  routes: Array<{
    distance: number // meters
    duration: number // seconds
    geometry: string // encoded polyline
    legs: Array<{
      distance: number
      duration: number
      steps: Array<{
        distance: number
        duration: number
        instruction: string
        maneuver: {
          type: string
          instruction: string
          location: [number, number]
        }
      }>
    }>
  }>
  waypoints: Array<{
    name: string
    location: [number, number]
  }>
}

export interface IsochroneResult {
  features: Array<{
    type: 'Feature'
    properties: {
      contour: number
      color: string
      opacity: number
      fill: string
      'fill-opacity': number
      fillColor: string
      fillOpacity: number
    }
    geometry: {
      type: 'Polygon'
      coordinates: [number, number][][]
    }
  }>
}

// Get access token
function getAccessToken(): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_ACCESS_TOKEN

  if (!token) {
    throw new APIError('Mapbox', 'Access token not configured', {
      code: ErrorCode.API_UNAUTHORIZED,
    })
  }

  return token
}

/**
 * Make Mapbox API request
 */
async function mapboxRequest<T>(
  endpoint: string,
  options: {
    params?: Record<string, string>
    cacheKey?: string
    cacheTtl?: number
  } = {}
): Promise<T> {
  const logger = apiLogger.child({ api: 'mapbox' })
  const start = Date.now()

  // Check cache first
  if (options.cacheKey) {
    const cached = geocodeCache.get(options.cacheKey)
    if (cached !== undefined) {
      logger.debug('Cache hit', { cacheKey: options.cacheKey })
      return cached as T
    }
  }

  try {
    return await retry(
      async () => {
        const token = getAccessToken()
        const url = new URL(`${MAPBOX_API_BASE}${endpoint}`)

        url.searchParams.append('access_token', token)
        if (options.params) {
          Object.entries(options.params).forEach(([key, value]) => {
            url.searchParams.append(key, value)
          })
        }

        const response = await fetch(url.toString())
        const duration = Date.now() - start

        if (!response.ok) {
          if (response.status === 429) {
            throw new APIError('Mapbox', 'Rate limit exceeded', {
              code: ErrorCode.API_RATE_LIMIT,
              statusCode: 429,
              retryable: true,
            })
          }
          throw new APIError('Mapbox', `API error: ${response.status}`, {
            statusCode: response.status,
            retryable: response.status >= 500,
          })
        }

        const data = await response.json()
        logger.api('GET', endpoint, { statusCode: response.status, duration })

        // Cache successful response
        if (options.cacheKey) {
          geocodeCache.set(options.cacheKey, data, options.cacheTtl || 24 * 60 * 60 * 1000)
        }

        return data as T
      },
      {
        maxAttempts: 3,
        initialDelay: 500,
        onRetry: (error, attempt) => {
          logger.warn(`Retry attempt ${attempt}`, { error, endpoint })
        },
      }
    )
  } catch (error) {
    logger.error('Mapbox request failed', error as Error, { endpoint })
    throw error
  }
}

// ============================================
// GEOCODING
// ============================================

/**
 * Forward geocoding - Convert address to coordinates
 */
export async function geocodeAddress(address: string, options: {
  country?: string
  types?: ('country' | 'region' | 'postcode' | 'district' | 'place' | 'locality' | 'neighborhood' | 'address' | 'poi')[]
  limit?: number
  proximity?: Coordinates
  bbox?: [number, number, number, number]
} = {}): Promise<GeocodingResult[]> {
  if (!address || address.trim().length < 2) {
    throw new ValidationError('Adresse trop courte', { field: 'address' })
  }

  const params: Record<string, string> = {
    language: 'fr',
    limit: String(options.limit || 5),
  }

  if (options.country) {
    params.country = options.country
  } else {
    params.country = 'fr' // Default to France
  }

  if (options.types?.length) {
    params.types = options.types.join(',')
  }

  if (options.proximity) {
    params.proximity = `${options.proximity.longitude},${options.proximity.latitude}`
  }

  if (options.bbox) {
    params.bbox = options.bbox.join(',')
  }

  const encodedAddress = encodeURIComponent(address)
  const cacheKey = `geocode:${encodedAddress}:${JSON.stringify(params)}`

  interface MapboxGeocodingResponse {
    features: Array<{
      id: string
      type: string
      place_name: string
      text: string
      center: [number, number]
      bbox?: [number, number, number, number]
      context?: Array<{ id: string; text: string }>
      relevance: number
    }>
  }

  const response = await mapboxRequest<MapboxGeocodingResponse>(
    `/geocoding/v5/mapbox.places/${encodedAddress}.json`,
    { params, cacheKey }
  )

  return response.features.map(feature => {
    const context: GeocodingResult['context'] = {}

    feature.context?.forEach(ctx => {
      const [type] = ctx.id.split('.')
      switch (type) {
        case 'postcode':
          context.postcode = ctx.text
          break
        case 'locality':
          context.locality = ctx.text
          break
        case 'place':
          context.place = ctx.text
          break
        case 'region':
          context.region = ctx.text
          break
        case 'country':
          context.country = ctx.text
          break
      }
    })

    return {
      id: feature.id,
      type: feature.type,
      placeName: feature.place_name,
      text: feature.text,
      center: {
        longitude: feature.center[0],
        latitude: feature.center[1],
      },
      bbox: feature.bbox,
      context,
      relevance: feature.relevance,
    }
  })
}

/**
 * Reverse geocoding - Convert coordinates to address
 */
export async function reverseGeocode(
  coordinates: Coordinates,
  options: { types?: string[] } = {}
): Promise<GeocodingResult | null> {
  const params: Record<string, string> = {
    language: 'fr',
    limit: '1',
  }

  if (options.types?.length) {
    params.types = options.types.join(',')
  }

  const cacheKey = `reverse:${coordinates.longitude}:${coordinates.latitude}`

  interface MapboxGeocodingResponse {
    features: Array<{
      id: string
      type: string
      place_name: string
      text: string
      center: [number, number]
      bbox?: [number, number, number, number]
      context?: Array<{ id: string; text: string }>
      relevance: number
    }>
  }

  const response = await mapboxRequest<MapboxGeocodingResponse>(
    `/geocoding/v5/mapbox.places/${coordinates.longitude},${coordinates.latitude}.json`,
    { params, cacheKey }
  )

  if (!response.features.length) {
    return null
  }

  const feature = response.features[0]
  const context: GeocodingResult['context'] = {}

  feature.context?.forEach(ctx => {
    const [type] = ctx.id.split('.')
    switch (type) {
      case 'postcode':
        context.postcode = ctx.text
        break
      case 'locality':
        context.locality = ctx.text
        break
      case 'place':
        context.place = ctx.text
        break
      case 'region':
        context.region = ctx.text
        break
      case 'country':
        context.country = ctx.text
        break
    }
  })

  return {
    id: feature.id,
    type: feature.type,
    placeName: feature.place_name,
    text: feature.text,
    center: {
      longitude: feature.center[0],
      latitude: feature.center[1],
    },
    bbox: feature.bbox,
    context,
    relevance: feature.relevance,
  }
}

// ============================================
// DIRECTIONS
// ============================================

/**
 * Get driving directions between points
 */
export async function getDirections(
  origin: Coordinates,
  destination: Coordinates,
  options: {
    profile?: 'driving' | 'walking' | 'cycling' | 'driving-traffic'
    waypoints?: Coordinates[]
    alternatives?: boolean
    geometries?: 'geojson' | 'polyline' | 'polyline6'
    steps?: boolean
    overview?: 'full' | 'simplified' | 'false'
  } = {}
): Promise<DirectionsResult> {
  const profile = options.profile || 'driving'
  const coordinates = [
    `${origin.longitude},${origin.latitude}`,
    ...(options.waypoints || []).map(wp => `${wp.longitude},${wp.latitude}`),
    `${destination.longitude},${destination.latitude}`,
  ].join(';')

  const params: Record<string, string> = {
    geometries: options.geometries || 'polyline',
    steps: String(options.steps !== false),
    overview: options.overview || 'full',
    alternatives: String(options.alternatives || false),
    language: 'fr',
  }

  const response = await mapboxRequest<DirectionsResult>(
    `/directions/v5/mapbox/${profile}/${coordinates}`,
    { params }
  )

  return response
}

/**
 * Calculate distance and duration between two points
 */
export async function getDistanceAndDuration(
  origin: Coordinates,
  destination: Coordinates,
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<{ distance: number; duration: number; distanceText: string; durationText: string }> {
  const directions = await getDirections(origin, destination, {
    profile,
    steps: false,
    overview: 'false',
  })

  if (!directions.routes.length) {
    throw new APIError('Mapbox', 'No route found', {
      code: ErrorCode.API_NOT_FOUND,
    })
  }

  const route = directions.routes[0]

  return {
    distance: route.distance,
    duration: route.duration,
    distanceText: formatDistance(route.distance),
    durationText: formatDuration(route.duration),
  }
}

// ============================================
// ISOCHRONES
// ============================================

/**
 * Get isochrone (area reachable within time limit)
 */
export async function getIsochrone(
  center: Coordinates,
  options: {
    profile?: 'driving' | 'walking' | 'cycling'
    contours_minutes?: number[]
    contours_colors?: string[]
    polygons?: boolean
  } = {}
): Promise<IsochroneResult> {
  const profile = options.profile || 'driving'
  const minutes = options.contours_minutes || [15, 30, 45]

  const params: Record<string, string> = {
    contours_minutes: minutes.join(','),
    polygons: String(options.polygons !== false),
  }

  if (options.contours_colors) {
    params.contours_colors = options.contours_colors.join(',')
  }

  const response = await mapboxRequest<IsochroneResult>(
    `/isochrone/v1/mapbox/${profile}/${center.longitude},${center.latitude}`,
    { params }
  )

  return response
}

// ============================================
// STATIC MAPS
// ============================================

/**
 * Get static map URL
 */
export function getStaticMapUrl(options: {
  center: Coordinates
  zoom: number
  width: number
  height: number
  style?: 'streets-v12' | 'outdoors-v12' | 'light-v11' | 'dark-v11' | 'satellite-v9' | 'satellite-streets-v12'
  markers?: Array<{
    coordinates: Coordinates
    color?: string
    size?: 's' | 'l'
    label?: string
  }>
  retina?: boolean
}): string {
  const token = getAccessToken()
  const style = options.style || 'streets-v12'
  const retina = options.retina ? '@2x' : ''

  let url = `${MAPBOX_API_BASE}/styles/v1/mapbox/${style}/static`

  // Add markers
  if (options.markers?.length) {
    const markerStrings = options.markers.map(marker => {
      const color = marker.color || '2563eb'
      const size = marker.size || 's'
      const label = marker.label || ''
      return `pin-${size}-${label}+${color}(${marker.coordinates.longitude},${marker.coordinates.latitude})`
    })
    url += `/${markerStrings.join(',')}`
  }

  url += `/${options.center.longitude},${options.center.latitude},${options.zoom},0`
  url += `/${options.width}x${options.height}${retina}`
  url += `?access_token=${token}`

  return url
}

// ============================================
// HELPERS
// ============================================

/**
 * Format distance in human-readable format
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes} min`
}

/**
 * Calculate distance between two points (Haversine formula)
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = toRad(point2.latitude - point1.latitude)
  const dLon = toRad(point2.longitude - point1.longitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) * Math.cos(toRad(point2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Check if point is within radius of center
 */
export function isWithinRadius(
  center: Coordinates,
  point: Coordinates,
  radiusMeters: number
): boolean {
  return calculateDistance(center, point) <= radiusMeters
}

/**
 * Get bounding box around center point
 */
export function getBoundingBox(
  center: Coordinates,
  radiusKm: number
): [number, number, number, number] {
  const lat = center.latitude
  const lon = center.longitude

  const latDelta = radiusKm / 111 // ~111km per degree of latitude
  const lonDelta = radiusKm / (111 * Math.cos(toRad(lat)))

  return [
    lon - lonDelta, // west
    lat - latDelta, // south
    lon + lonDelta, // east
    lat + latDelta, // north
  ]
}
