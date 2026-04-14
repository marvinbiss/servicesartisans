/**
 * Priority Pages Configuration — ServicesArtisans
 * Détecte et gère les pages en positions 8-15 (pages "à portée de main")
 * pour optimisation SEO ciblée via Search Console data.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PriorityPage {
  id?: string
  path: string
  position: number
  impressions: number
  clicks: number
  query: string
  enhanced: boolean
  enhanced_at?: string
  created_at?: string
  updated_at?: string
}

export interface PriorityPageInsert {
  path: string
  position: number
  impressions: number
  clicks: number
  query: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Position range pour les pages "à portée de main" */
export const PRIORITY_POSITION_MIN = 8
export const PRIORITY_POSITION_MAX = 15

/** Seuil minimum d'impressions pour considérer une page prioritaire */
export const PRIORITY_IMPRESSIONS_MIN = 10

// ---------------------------------------------------------------------------
// In-memory cache (TTL 5 min)
// ---------------------------------------------------------------------------

let cache: Map<string, PriorityPage> | null = null
let cacheExpiry = 0
const CACHE_TTL_MS = 5 * 60 * 1000

async function loadCache(): Promise<Map<string, PriorityPage>> {
  const now = Date.now()
  if (cache && now < cacheExpiry) return cache

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('seo_priority_pages')
      .select('*')
      .order('position', { ascending: true })

    if (error) throw error

    const map = new Map<string, PriorityPage>()
    for (const row of data || []) {
      map.set(row.path, {
        id: row.id,
        path: row.path,
        position: row.position,
        impressions: row.impressions,
        clicks: row.clicks,
        query: row.query,
        enhanced: row.enhanced,
        enhanced_at: row.enhanced_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })
    }

    cache = map
    cacheExpiry = now + CACHE_TTL_MS
    return map
  } catch (error) {
    logger.error('Failed to load priority pages cache', error)
    // Return empty map on failure — fail-open (no enhancements applied)
    return cache || new Map()
  }
}

/** Invalide le cache (après import/update) */
export function invalidatePriorityCache(): void {
  cache = null
  cacheExpiry = 0
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Vérifie si un pathname est une page prioritaire.
 * Retourne true si la page est en positions 8-15 avec >10 impressions.
 */
export async function isPriorityPage(pathname: string): Promise<boolean> {
  const map = await loadCache()
  return map.has(pathname)
}

/**
 * Récupère les données Search Console d'une page prioritaire.
 * Retourne null si la page n'est pas prioritaire.
 */
export async function getPriorityData(pathname: string): Promise<PriorityPage | null> {
  const map = await loadCache()
  return map.get(pathname) || null
}

/**
 * Récupère toutes les pages prioritaires.
 */
export async function getAllPriorityPages(): Promise<PriorityPage[]> {
  const map = await loadCache()
  return Array.from(map.values())
}

/**
 * Vérifie si une ligne GSC est éligible comme page prioritaire.
 */
export function isEligibleForPriority(position: number, impressions: number): boolean {
  return (
    position >= PRIORITY_POSITION_MIN &&
    position <= PRIORITY_POSITION_MAX &&
    impressions >= PRIORITY_IMPRESSIONS_MIN
  )
}
