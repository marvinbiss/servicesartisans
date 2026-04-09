/**
 * RGE last sync — retourne la date de la dernière sync ADEME réussie.
 *
 * Source : `MAX(providers.rge_last_synced_at)` (migration 380). Cette colonne
 * est mise à jour par le cron hebdo de sync ADEME sur chaque provider rafraîchi.
 * Le MAX reflète donc fidèlement la date de la dernière synchro réussie.
 *
 * Usage : pages hub RGE (`/rge`, `/rge/[service]`, etc.) pour afficher un
 * signal de fraîcheur honnête via `<LastUpdated date={...} />`.
 *
 * Fail-open strict :
 *   - Pendant le build (`IS_BUILD`) → retourne `null`
 *   - Si Supabase indisponible ou erreur → retourne `null`
 *   - Si aucune ligne (DB vide) → retourne `null`
 * L'appelant doit fournir son propre fallback (ex : STATIC_DATE).
 */

import { supabase, IS_BUILD } from '@/lib/supabase'
import { getCachedData } from '@/lib/cache'
import { logger } from '@/lib/logger'

const CACHE_KEY = 'rge:last-sync:national:v1'
const CACHE_TTL_6H = 6 * 60 * 60

/**
 * Retourne la date ISO (string) de la dernière sync ADEME réussie, ou `null`
 * si indisponible. Cache 6h. Safe pendant le build.
 */
export async function getRgeLastSyncDate(): Promise<string | null> {
  if (IS_BUILD) return null

  return getCachedData<string | null>(
    CACHE_KEY,
    async () => {
      try {
        const { data, error } = await supabase
          .from('providers')
          .select('rge_last_synced_at')
          .not('rge_last_synced_at', 'is', null)
          .order('rge_last_synced_at', { ascending: false })
          .limit(1)

        if (error) throw error
        if (!data || data.length === 0) return null

        const raw = (data[0] as { rge_last_synced_at?: string | null }).rge_last_synced_at
        if (!raw) return null

        // Validation stricte : si la chaîne ne parse pas en Date valide, on
        // retourne null pour que l'appelant tombe sur son fallback statique.
        const parsed = new Date(raw)
        if (Number.isNaN(parsed.getTime())) return null

        return parsed.toISOString()
      } catch (err) {
        logger.error('[getRgeLastSyncDate] FAILED', {
          error: err instanceof Error ? err.message : err,
        })
        return null
      }
    },
    CACHE_TTL_6H,
    { skipNull: false }
  )
}
