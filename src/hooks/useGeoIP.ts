import { useState, useEffect } from 'react'

interface GeoIPData {
  city: string | null
  citySlug: string | null
  region?: string | null
  lat?: number | null
  lon?: number | null
}

interface UseGeoIPReturn extends GeoIPData {
  loading: boolean
  error: string | null
}

const STORAGE_KEY = 'sa:geo-ip'

/**
 * IP-based geolocation hook — fallback when GPS is unavailable.
 * Uses Vercel headers on production, ipapi.co on dev.
 * Caches in sessionStorage to avoid repeated API calls.
 */
export function useGeoIP(): UseGeoIPReturn {
  const [data, setData] = useState<GeoIPData>({ city: null, citySlug: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 1. Check sessionStorage cache
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached) as GeoIPData
        setData(parsed)
        setLoading(false)
        return
      }
    } catch {
      // sessionStorage unavailable
    }

    // 2. Fetch from API
    const controller = new AbortController()

    fetch('/api/geo', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('geo fetch failed')
        return res.json()
      })
      .then((json: GeoIPData) => {
        setData(json)
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(json))
        } catch {
          // quota exceeded
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError('Géolocalisation indisponible')
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  return { ...data, loading, error }
}
