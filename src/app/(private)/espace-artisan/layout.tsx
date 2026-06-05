import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ErrorBoundary } from '@/components/ErrorBoundary'

/**
 * Défense en profondeur (server-side) en complément du middleware.
 * Le middleware enforce déjà auth + role + 2FA, mais si un edge case le
 * court-circuite (timeout, déploiement partiel, bug matcher), ce layout
 * re-vérifie côté serveur que l'utilisateur est bien un artisan avant de
 * rendre la moindre page. Fail-closed : pas d'artisan → redirect.
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

  return (
    <>
      {/* Skip link — visible uniquement au focus clavier */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-skip-link focus:bg-white focus:text-primary-600 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-semibold focus:text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
      >
        Aller au contenu principal
      </a>
      <ErrorBoundary>{children}</ErrorBoundary>
    </>
  )
}
