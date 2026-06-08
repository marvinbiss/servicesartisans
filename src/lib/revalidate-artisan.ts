/**
 * Revalidation de la fiche publique d'un artisan (ISR cache bust on-demand).
 *
 * Source unique de vérité : construit le chemin EXACTEMENT comme l'URL servie
 * (getArtisanUrl) au lieu de slugifier à la main. Sans ça les revalidate
 * frappaient `/services/{spec}/{CODE_INSEE}/{id}` alors que la page est servie
 * sur `/services/{service}/{nom-ville}/{id}` — donc cache jamais busté et les
 * modifs (écritures, photos, avatar) restaient stale jusqu'au revalidate ISR 24h.
 *
 * `providers.address_city` stocke un code INSEE pour ~91% des lignes
 * (cf. insee-resolver) → résolu en nom via cityValueToName avant getArtisanUrl.
 *
 * Best-effort + borné : la lookup DB est plafonnée (AbortSignal) et tout échec
 * renvoie null / no-op — jamais de hang ni d'exception propagée à l'appelant
 * (le revalidate=86400 du route ISR sert de filet).
 */

import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getArtisanUrl } from '@/lib/utils'
import { cityValueToName } from '@/lib/insee-resolver'
import { logger } from '@/lib/logger'

// Plafond sur la lookup provider : la revalidation est appelée sur le chemin
// chaud des PUT (profil/écritures/photos) — une requête DB qui traîne ne doit
// jamais retarder la réponse de l'artisan.
const LOOKUP_TIMEOUT_MS = 3_000

/**
 * Chemin public canonique de la fiche d'un artisan (`/services/{s}/{ville}/{id}`),
 * ou null si introuvable / erreur. Borné et fail-soft (ne throw jamais).
 */
export async function getArtisanPublicPath(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  try {
    const { data: provider } = await supabase
      .from('providers')
      .select('specialty, address_city, slug, stable_id')
      .eq('user_id', userId)
      .abortSignal(AbortSignal.timeout(LOOKUP_TIMEOUT_MS))
      .single()

    if (!provider) return null

    const cityName = cityValueToName(provider.address_city) || provider.address_city

    return (
      getArtisanUrl({
        stable_id: provider.stable_id,
        slug: provider.slug,
        specialty: provider.specialty,
        city: cityName,
      }) || null
    )
  } catch (error) {
    logger.error('getArtisanPublicPath failed:', error)
    return null
  }
}

/**
 * Revalide la fiche détail + le listing parent à partir d'un chemin déjà résolu.
 * Synchrone : à appeler quand on a déjà le chemin (évite un 2e fetch).
 */
export function revalidateArtisanPath(detailPath: string): void {
  revalidatePath(detailPath, 'page')
  // Listing parent (/services/{service}/{ville}) — retire le dernier segment.
  const lastSlash = detailPath.lastIndexOf('/')
  if (lastSlash > 0) revalidatePath(detailPath.slice(0, lastSlash), 'page')
}

/**
 * Revalide la fiche publique d'un artisan depuis son userId (best-effort).
 * Ne bloque ni ne fait échouer l'appelant.
 */
export async function revalidateArtisanProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const detailPath = await getArtisanPublicPath(supabase, userId)
  if (!detailPath) return
  try {
    revalidateArtisanPath(detailPath)
  } catch (error) {
    logger.error('revalidateArtisanProfile failed:', error)
  }
}
