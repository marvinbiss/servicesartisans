/**
 * « Voir ma fiche publique » — proxy de prévisualisation propriétaire.
 *
 * Au lieu de lier directement la page ISR (l'artisan tombait sur une version
 * cachée et ne voyait pas ses modifs récentes), ce handler :
 *   1. vérifie que l'appelant est authentifié ;
 *   2. force un revalidate on-demand de SA fiche (cache busté à l'instant) ;
 *   3. redirige vers l'URL publique fraîchement régénérée.
 *
 * La page publique reste ISR pour les visiteurs (zéro impact perf). Seul le
 * propriétaire qui clique sur ce lien déclenche le bust + voit du frais.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getArtisanPublicPath, revalidateArtisanPath } from '@/lib/revalidate-artisan'
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

  const publicPath = await getArtisanPublicPath(supabase, user.id)

  if (!publicPath) {
    // Pas de fiche liée (ou lookup en échec) → retour au dashboard profil.
    return NextResponse.redirect(new URL('/espace-artisan/profil', request.url))
  }

  // Bust le cache ISR AVANT de rediriger : la requête suivante (la redirection
  // elle-même) régénère la page avec les données fraîches. Non bloquant.
  try {
    revalidateArtisanPath(publicPath)
  } catch (error) {
    logger.error('[voir-fiche] revalidate failed', error)
  }

  return NextResponse.redirect(new URL(publicPath, request.url))
}
