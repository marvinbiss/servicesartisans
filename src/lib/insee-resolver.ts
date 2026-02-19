/**
 * INSEE commune code resolver
 *
 * 91% of providers have INSEE codes (e.g., "69123") instead of city names
 * (e.g., "Lyon") in address_city. This module provides:
 *
 * 1. resolveProviderCity() — post-process a provider to fix address_city
 * 2. getInseeCodesForCity() — get INSEE codes matching a city name (for queries)
 */

import communeData from '@/lib/data/insee-communes.json'

type CommuneEntry = { n: string; r: string; d: string }
const communes = communeData as Record<string, CommuneEntry>

const INSEE_CODE_RE = /^\d{4,5}$/
const CORSE_CODE_RE = /^[0-9][A-Z0-9]\d{3}$/

function isInseeCode(city: string): boolean {
  return INSEE_CODE_RE.test(city) || CORSE_CODE_RE.test(city)
}

// ─── Forward map: INSEE code → city name (for display) ──────────────

/**
 * If provider.address_city is an INSEE code, replace it with the real city name.
 * Also fills in address_region if missing.
 * Returns the same object reference if no change needed (no copy).
 */
export function resolveProviderCity<T extends { address_city?: string | null; address_region?: string | null }>(
  provider: T,
): T {
  const city = provider.address_city
  if (!city || !isInseeCode(city)) return provider

  const commune = communes[city]
  if (!commune) return provider

  return {
    ...provider,
    address_city: commune.n,
    ...((!provider.address_region && commune.r) ? { address_region: commune.r } : {}),
  }
}

/**
 * Resolve INSEE codes for an array of providers (batch).
 */
export function resolveProviderCities<T extends { address_city?: string | null; address_region?: string | null }>(
  providers: T[],
): T[] {
  return providers.map(resolveProviderCity)
}

// ─── Reverse map: city name → INSEE codes (for queries) ─────────────

const _normalize = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

// Build reverse map lazily (only on first use)
let _reverseMap: Map<string, string[]> | null = null

function getReverseMap(): Map<string, string[]> {
  if (_reverseMap) return _reverseMap

  _reverseMap = new Map()
  for (const [code, info] of Object.entries(communes)) {
    const key = _normalize(info.n)
    const existing = _reverseMap.get(key)
    if (existing) {
      existing.push(code)
    } else {
      _reverseMap.set(key, [code])
    }
  }
  return _reverseMap
}

/**
 * Get all INSEE codes that match a given city name.
 * Returns empty array if no match.
 */
export function getInseeCodesForCity(cityName: string): string[] {
  return getReverseMap().get(_normalize(cityName)) || []
}

/**
 * Build a PostgREST OR filter that matches BOTH the city name AND its INSEE codes.
 */
export function buildCityFilter(cityName: string): string {
  const codes = getInseeCodesForCity(cityName)
  if (codes.length === 0) {
    return `address_city.ilike.${cityName}`
  }
  return `address_city.ilike.${cityName},address_city.in.(${codes.join(',')})`
}
