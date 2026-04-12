/**
 * /espace-artisan/cee — liste des dossiers CEE de l'artisan connecté.
 *
 * Server Component :
 *   - Auth via `createClient` (cookies Supabase)
 *   - Résolution `profiles.user_id → providers.id` avec garde 401/403
 *   - Fetch via `listCeeDossiersForProvider`
 *   - Empty state si 0 dossier
 *
 * UI light-only, aucune classe `dark:*`.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Info, AlertTriangle } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { createClient } from '@/lib/supabase/server'
import { listCeeDossiersForProvider } from '@/lib/cee/dossiers'
import DossierListCard from '@/components/cee-artisan/DossierListCard'
import type { CeeDossier } from '@/lib/cee/dossier-types'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Mes dossiers CEE — Espace artisan',
  robots: { index: false, follow: false },
}

export default async function EspaceArtisanCeePage() {
  const supabase = await createClient()

  // --- Auth ---------------------------------------------------------------
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/connexion?redirect=/espace-artisan/cee')
  }

  // --- Résolution artisan (provider lié au user connecté) ----------------
  const { data: provider } = await supabase
    .from('providers')
    .select('id, name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!provider) {
    return (
      <div className="min-h-screen bg-sand-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <h1 className="text-lg font-semibold text-red-700">Accès réservé</h1>
            <p className="mt-2 text-sm text-red-600">
              Aucun profil artisan n’est associé à votre compte.
            </p>
            <Link
              href="/espace-artisan"
              className="mt-4 inline-block rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
            >
              Retour à l’espace artisan
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const providerRow = provider as { id: string; name: string | null }

  let dossiers: CeeDossier[] = []
  let loadError = false
  try {
    dossiers = await listCeeDossiersForProvider(supabase, providerRow.id)
  } catch (error) {
    loadError = true
    logger.warn('espace-artisan-cee-list failed', {
      action: 'espace-artisan-cee-list',
      providerId: providerRow.id,
      error: error instanceof Error ? error.message : 'unknown',
    })
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Espace Artisan', href: '/espace-artisan' },
              { label: 'Dossiers CEE' },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Mes dossiers CEE</h1>
          <p className="mt-1 text-primary-100">
            Suivi des Certificats d’Économies d’Énergie (loi n°&nbsp;2025-594)
          </p>
        </div>
      </header>

      {/* Main */}
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section aria-label="Liste des dossiers CEE" data-testid="cee-dossier-list-section">
          {loadError ? (
            <div
              role="alert"
              data-testid="cee-dossier-list-error"
              className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
            >
              <AlertTriangle className="mx-auto h-8 w-8 text-red-500" aria-hidden="true" />
              <h2 className="mt-3 text-base font-semibold text-red-800">
                Impossible de charger les dossiers
              </h2>
              <p className="mt-1 text-sm text-red-700">
                Réessayez dans quelques instants. Si le problème persiste, contactez notre support.
              </p>
            </div>
          ) : dossiers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sand-400 bg-white p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                <FileText className="h-7 w-7 text-primary-500" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-charcoal-900">
                Aucun dossier CEE pour le moment
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-charcoal-500">
                Vos dossiers CEE apparaîtront ici dès qu’un devis éligible sera signé. Aucune
                démarche supplémentaire n’est requise de votre part : ServicesArtisans s’occupe du
                montage et de la dépose.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-600">
                <Info className="h-4 w-4" aria-hidden="true" />
                Plus d’infos sur le mandataire CEE
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-sm font-medium text-charcoal-600">
                  {dossiers.length} dossier{dossiers.length > 1 ? 's' : ''}
                </h2>
              </div>
              <ul className="space-y-3" role="list">
                {dossiers.map((dossier) => (
                  <li key={dossier.id}>
                    <DossierListCard dossier={dossier} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
