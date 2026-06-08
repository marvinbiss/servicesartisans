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
 * Best-effort : l'échec ne bloque jamais l'appelant (le revalidate=86400 du
 * route ISR sert de filet).
 */

import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getArtisanUrl } from '@/lib/utils'
import { cityValueToName } from '@/lib/insee-resolver'
import { getProviderForRevalidation } from '@/lib/services/artisan-profile-service'
import { logger } from '@/lib/logger'

export async function revalidateArtisanProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  try {
    const { data: provider } = await getProviderForRevalidation(supabase, userId)
    if (!provider) return

    const cityName = cityValueToName(provider.address_city) || provider.address_city

    // Chemin détail identique à l'URL publique réelle.
    const detailPath = getArtisanUrl({
      stable_id: provider.stable_id,
      slug: provider.slug,
      specialty: provider.specialty,
      city: cityName,
    })
    if (!detailPath) return

    revalidatePath(detailPath, 'page')

    // Page listing parente (/services/{service}/{ville}) — retire le dernier segment.
    const lastSlash = detailPath.lastIndexOf('/')
    const listingPath = lastSlash > 0 ? detailPath.slice(0, lastSlash) : ''
    if (listingPath) revalidatePath(listingPath, 'page')
  } catch (revalidateError) {
    logger.error('Revalidation error for artisan profile:', revalidateError)
  }
}
