import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import ArtisanShell from '@/components/artisan-dashboard/ArtisanShell'
import { getArtisanUrl } from '@/lib/utils'
import { resolveProviderCity } from '@/lib/insee-resolver'

/**
 * Défense en profondeur (server-side) en complément du middleware.
 * Le middleware enforce déjà auth + role + 2FA, mais si un edge case le
 * court-circuite (timeout, déploiement partiel, bug matcher), ce layout
 * re-vérifie côté serveur que l'utilisateur est bien un artisan avant de
 * rendre la moindre page. Fail-closed : pas d'artisan → redirect.
 *
 * Refonte 2026-06-06 : monte aussi ArtisanShell (sidebar + topbar) une seule
 * fois pour toutes les pages — l'ancienne ArtisanSidebar 13 entrées montée
 * en dur dans chaque page est supprimée. Le chrome public (Header/Footer)
 * est masqué par SiteChrome dans le root layout.
 */
export default async function EspaceArtisanLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion?redirect=/espace-artisan')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'artisan') {
    redirect(profile?.role === 'super_admin' ? '/admin' : '/connexion')
  }

  // Lien « Voir ma fiche publique » — best-effort, le shell le masque si null.
  // resolveProviderCity : address_city stocke un code INSEE sur ~91% des
  // lignes, getArtisanUrl attend un NOM de ville (server-only, 2 MB de data).
  let publicUrl: string | null = null
  try {
    const { data: provider } = await supabase
      .from('providers')
      .select('stable_id, slug, specialty, address_city')
      .eq('user_id', user.id)
      .single()
    if (provider) {
      const resolved = resolveProviderCity(provider)
      publicUrl =
        getArtisanUrl({
          stable_id: provider.stable_id,
          slug: provider.slug,
          specialty: provider.specialty,
          city: resolved.address_city || provider.address_city,
        }) || null
    }
  } catch {
    // Pas de provider lié — le lien fiche publique est simplement masqué
  }

  return (
    <>
      {/* Skip link — visible uniquement au focus clavier */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-skip-link focus:bg-white focus:text-primary-600 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-semibold focus:text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
      >
        Aller au contenu principal
      </a>
      <ErrorBoundary>
        <ArtisanShell userId={user.id} publicUrl={publicUrl}>
          {children}
        </ArtisanShell>
      </ErrorBoundary>
    </>
  )
}
