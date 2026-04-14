/**
 * /espace-artisan/cee/nouveau — Formulaire de création de dossier CEE (V3).
 *
 * Server Component shell + Client Component pour le formulaire multi-étapes.
 * Auth obligatoire. Redirige vers le dossier créé après soumission.
 */

import { redirect } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import { createClient } from '@/lib/supabase/server'
import NouveauDossierForm from '@/components/cee-artisan/NouveauDossierForm'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Nouveau dossier CEE — Espace artisan',
  robots: { index: false, follow: false },
}

export default async function NouveauDossierPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/connexion?redirect=/espace-artisan/cee/nouveau')
  }

  // Résolution provider
  const { data: provider } = await supabase
    .from('providers')
    .select('id, name, is_rge, rge_qualifications')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!provider) {
    redirect('/espace-artisan/cee')
  }

  const providerRow = provider as {
    id: string
    name: string | null
    is_rge: boolean | null
    rge_qualifications: Array<{ code?: string; date_fin?: string }> | null
  }

  // Vérification partenaire actif (table cee_artisan_partners)
  const { data: partnerRow } = await supabase
    .from('cee_artisan_partners')
    .select('status, certified_at')
    .eq('provider_id', providerRow.id)
    .maybeSingle()

  const partner = partnerRow as { status?: string; certified_at?: string | null } | null
  const isCertified = partner?.status === 'active' || partner?.status === 'certified'

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Espace Artisan', href: '/espace-artisan' },
              { label: 'Dossiers CEE', href: '/espace-artisan/cee' },
              { label: 'Nouveau dossier' },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Nouveau dossier CEE</h1>
          <p className="mt-1 text-primary-100">
            Renseignez les informations du chantier pour créer un dossier.
          </p>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <NouveauDossierForm
          providerId={providerRow.id}
          providerName={providerRow.name ?? ''}
          rgeQualifications={providerRow.rge_qualifications ?? []}
          isCertified={isCertified}
        />
      </main>
    </div>
  )
}
