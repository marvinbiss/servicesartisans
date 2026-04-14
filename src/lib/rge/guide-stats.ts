/**
 * RGE guide stats — data access for guide RSC blocks.
 *
 * Fournit les stats nationales et par service énergétique pour enrichir les
 * guides éditoriaux (`src/app/(public)/guides/**`) avec un bloc dynamique
 * pointant vers les pSEO `/artisans-rge/[ville]` et `/rge/[service]/[ville]`.
 *
 * Source : table `communes` (colonne `nb_artisans_rge` pré-agrégée par la
 * fonction `rge_backfill_communes()` — migration 381). Pour les stats par
 * service, on utilise `providers` directement (filtrage par `specialty`).
 *
 * Fail-open strict : pendant `IS_BUILD` ou sur erreur Supabase, on retourne
 * des valeurs par défaut vides pour ne JAMAIS casser le rendu des guides.
 */

import { supabase, SERVICE_TO_SPECIALTIES, IS_BUILD } from '@/lib/supabase'
import { getCachedData } from '@/lib/cache'
import { logger } from '@/lib/logger'
import { isRgeAllowedService, type RgeAllowedService } from '@/lib/rge/service-city-listings'

const CACHE_TTL_6H = 6 * 60 * 60 // 6 hours

export interface RgeTopCity {
  slug: string
  name: string
  count: number
}

export interface RgeNationalStats {
  totalActive: number
  topCities: RgeTopCity[]
}

/**
 * Retourne les stats nationales RGE : total d'artisans RGE actifs et top 10
 * villes par nombre d'artisans RGE. Cache 6h. Fail-open pendant le build.
 */
export async function getRgeNationalStats(): Promise<RgeNationalStats> {
  if (IS_BUILD) return { totalActive: 0, topCities: [] }

  return getCachedData<RgeNationalStats>(
    'rge:guide-stats:national:v1',
    async () => {
      try {
        // Top villes via la colonne pré-agrégée `communes.nb_artisans_rge`
        // (refresh via rge_backfill_communes() — migration 381).
        const { data: cityRows, error: cityErr } = await supabase
          .from('communes')
          .select('slug,name,nb_artisans_rge')
          .eq('is_active', true)
          .gt('nb_artisans_rge', 0)
          .order('nb_artisans_rge', { ascending: false })
          .limit(10)

        if (cityErr) throw cityErr

        const topCities: RgeTopCity[] = (cityRows || [])
          .map((row) => ({
            slug: String((row as { slug?: string | null }).slug ?? ''),
            name: String((row as { name?: string | null }).name ?? ''),
            count: Number((row as { nb_artisans_rge?: number | null }).nb_artisans_rge ?? 0),
          }))
          .filter((c) => c.slug && c.name && c.count > 0)

        // Total national : count des providers RGE actifs.
        const today = new Date().toISOString().slice(0, 10)
        const { count, error: countErr } = await supabase
          .from('providers')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .not('rge_qualifications', 'is', null)
          .gte('rge_valid_until', today)

        if (countErr) throw countErr

        return {
          totalActive: count ?? 0,
          topCities,
        }
      } catch (err) {
        logger.error('[getRgeNationalStats] FAILED', {
          error: err instanceof Error ? err.message : err,
        })
        return { totalActive: 0, topCities: [] }
      }
    },
    CACHE_TTL_6H,
    { skipNull: true }
  )
}

export interface RgeServiceStats {
  total: number
  topCities: RgeTopCity[]
}

/**
 * Retourne les stats RGE pour un service énergétique donné : total d'artisans
 * RGE actifs dans ce métier et top villes. Basé sur `providers` (filtrage par
 * `specialty` via SERVICE_TO_SPECIALTIES). Cache 6h. Fail-open pendant le build.
 *
 * Note : pour le top villes on agrège côté JS sur un échantillon de 500
 * providers RGE du service. Suffisant pour extraire les ~10 villes dominantes
 * (les grosses agglos trustent largement le classement) sans requête GROUP BY
 * (non supportée par supabase-js sans RPC dédiée).
 */
export async function getRgeServiceStats(serviceSlug: RgeAllowedService): Promise<RgeServiceStats> {
  if (IS_BUILD) return { total: 0, topCities: [] }

  if (!isRgeAllowedService(serviceSlug)) {
    return { total: 0, topCities: [] }
  }

  const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
  if (!specialties || specialties.length === 0) {
    return { total: 0, topCities: [] }
  }

  return getCachedData<RgeServiceStats>(
    `rge:guide-stats:service:${serviceSlug}:v1`,
    async () => {
      try {
        const today = new Date().toISOString().slice(0, 10)

        // Count total
        const { count, error: countErr } = await supabase
          .from('providers')
          .select('id', { count: 'exact', head: true })
          .in('specialty', specialties)
          .eq('is_active', true)
          .not('rge_qualifications', 'is', null)
          .gte('rge_valid_until', today)

        if (countErr) throw countErr

        // Echantillon pour le top villes (agrégation JS sur code INSEE).
        const { data: sampleRows, error: sampleErr } = await supabase
          .from('providers')
          .select('address_city')
          .in('specialty', specialties)
          .eq('is_active', true)
          .not('rge_qualifications', 'is', null)
          .gte('rge_valid_until', today)
          .limit(500)

        if (sampleErr) throw sampleErr

        const counts = new Map<string, number>()
        for (const row of sampleRows || []) {
          const inseeCode = (row as { address_city?: string | null }).address_city
          if (!inseeCode || !/^\d{5}$/.test(inseeCode)) continue
          counts.set(inseeCode, (counts.get(inseeCode) || 0) + 1)
        }

        const topInseeCodes = Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15)
          .map(([code, cnt]) => ({ code, cnt }))

        if (topInseeCodes.length === 0) {
          return { total: count ?? 0, topCities: [] }
        }

        const { data: communeRows, error: communeErr } = await supabase
          .from('communes')
          .select('code_insee,slug,name')
          .in(
            'code_insee',
            topInseeCodes.map((t) => t.code)
          )
          .eq('is_active', true)

        if (communeErr) throw communeErr

        const inseeToCommune = new Map<string, { slug: string; name: string }>()
        for (const row of communeRows || []) {
          const code = (row as { code_insee?: string | null }).code_insee
          const slug = (row as { slug?: string | null }).slug
          const name = (row as { name?: string | null }).name
          if (code && slug && name) {
            inseeToCommune.set(code, { slug, name })
          }
        }

        const topCities: RgeTopCity[] = topInseeCodes
          .map(({ code, cnt }) => {
            const commune = inseeToCommune.get(code)
            if (!commune) return null
            return { slug: commune.slug, name: commune.name, count: cnt }
          })
          .filter((c): c is RgeTopCity => c !== null)
          .slice(0, 10)

        return { total: count ?? 0, topCities }
      } catch (err) {
        logger.error(`[getRgeServiceStats] FAILED for ${serviceSlug}`, {
          error: err instanceof Error ? err.message : err,
        })
        return { total: 0, topCities: [] }
      }
    },
    CACHE_TTL_6H,
    { skipNull: true }
  )
}
