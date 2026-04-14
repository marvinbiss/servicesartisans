/**
 * /espace-artisan/cee/formation — Hub formation CEE artisan (V3).
 *
 * Contenu :
 *   - 4 vidéos Wistia (placeholders), statut watched
 *   - Quiz 10 questions, score affiché, CTA "Repasser le quiz"
 *   - Badge "Certifié CEE" si certified_at
 *   - Lien recyclage annuel si certified_at > 11 mois
 *
 * Server Component — charge les données partenaire via Supabase.
 * Client Component FormationHub gère l'interactivité quiz/vidéo.
 */

import { redirect } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import { createClient } from '@/lib/supabase/server'
import FormationHub from '@/components/cee-artisan/FormationHub'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Formation CEE — Espace artisan',
  robots: { index: false, follow: false },
}

export default async function FormationPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/connexion?redirect=/espace-artisan/cee/formation')
  }

  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!provider) redirect('/espace-artisan/cee')

  const providerRow = provider as { id: string }

  // Chargement du statut partenaire (fail-open)
  const { data: partnerRaw } = await supabase
    .from('cee_artisan_partners')
    .select('status, certified_at, certification_score, training_completed_at')
    .eq('provider_id', providerRow.id)
    .maybeSingle()

  const partner = (partnerRaw ?? null) as {
    status?: string
    certified_at?: string | null
    certification_score?: number | null
    training_completed_at?: string | null
  } | null

  // Vérification recyclage annuel (> 11 mois depuis certification)
  const certifiedAt = partner?.certified_at ?? null
  const needsRecycling = certifiedAt
    ? Date.now() - new Date(certifiedAt).getTime() > 11 * 30 * 24 * 60 * 60 * 1000
    : false

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Espace Artisan', href: '/espace-artisan' },
              { label: 'Dossiers CEE', href: '/espace-artisan/cee' },
              { label: 'Formation' },
            ]}
          />
        </div>
      </div>

      <header className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Formation CEE</h1>
          <p className="mt-1 text-primary-100">
            Obtenez votre certification pour créer des dossiers CEE en autonomie.
          </p>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <FormationHub
          providerId={providerRow.id}
          certifiedAt={certifiedAt}
          certificationScore={partner?.certification_score ?? null}
          trainingCompletedAt={partner?.training_completed_at ?? null}
          needsRecycling={needsRecycling}
        />
      </main>
    </div>
  )
}
