/**
 * « Voir ma fiche publique » — proxy de prévisualisation propriétaire.
 *
 * Au lieu de lier directement la page ISR (l'artisan tombait sur une version
 * cachée et ne voyait pas ses modifs récentes), ce handler :
 *   1. vérifie que l'appelant est bien l'artisan connecté ;
 *   2. force un revalidate on-demand de SA fiche (cache busté à l'instant) ;
 *   3. redirige (302) vers l'URL publique fraîchement régénérée.
 *
 * La page publique reste ISR pour les visiteurs (zéro impact perf). Seul le
 * propriétaire qui clique sur ce lien déclenche le bust + voit du frais.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getArtisanUrl } from '@/lib/utils'
import { resolveProviderCity } from '@/lib/insee-resolver'
import { revalidateArtisanProfile } from '@/lib/revalidate-artisan'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/connexion?redirect=/espace-artisan', request.url))
  }

  let publicPath: string | null = null
  try {
    const { data: provider } = await supabase
      .from('providers')
      .select('stable_id, slug, specialty, address_city, address_region')
      .eq('user_id', user.id)
      .single()

    if (provider) {
      const resolved = resolveProviderCity(provider)
      publicPath =
        getArtisanUrl({
          stable_id: provider.stable_id,
          slug: provider.slug,
          specialty: provider.specialty,
          city: resolved.address_city || provider.address_city,
        }) || null
    }
  } catch (error) {
    logger.error('[voir-fiche] provider lookup failed', error)
  }

  if (!publicPath) {
    // Pas de fiche liée → retour au dashboard profil.
    return NextResponse.redirect(new URL('/espace-artisan/profil', request.url))
  }

  // Bust le cache ISR de la fiche AVANT de rediriger : la prochaine requête
  // (la redirection elle-même) régénère la page avec les données fraîches.
  await revalidateArtisanProfile(supabase, user.id)

  return NextResponse.redirect(new URL(publicPath, request.url))
}
