/**
 * /espace-artisan/cee/onboarding — Server Component
 *
 * Auth guard + fetch partner via GET /api/cee/partners/me.
 * Renders OnboardingWizard with initial partner data.
 *
 * Light-only. No dark:* classes.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import OnboardingWizard from './OnboardingWizard'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Devenir partenaire CEE — Espace artisan',
  robots: { index: false, follow: false },
}

export interface CeePartnerData {
  id: string
  provider_id: string
  user_id: string
  status: string
  invited_at: string | null
  onboarding_started_at: string | null
  convention_sent_at: string | null
  convention_signed_at: string | null
  training_completed_at: string | null
  certification_score: number | null
  certified_at: string | null
  activated_at: string | null
  suspended_at: string | null
  revoked_at: string | null
  iban_last4: string | null
  bic: string | null
  titulaire_compte: string | null
  commission_rate_effective: number | null
  operations_allowed: string[] | null
  zones_allowed: string[] | null
  yousign_envelope_id: string | null
  convention_pdf_url: string | null
  created_at: string
  updated_at: string
}

export default async function CeeOnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/connexion?redirect=/espace-artisan/cee/onboarding')
  }

  // Fetch partner record from the API route (uses RLS via cookie session).
  let partner: CeePartnerData | null = null
  let fetchError = false

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
    const res = await fetch(`${siteUrl}/api/cee/partners/me`, {
      headers: {
        Cookie: (await import('next/headers')).cookies().toString(),
      },
      cache: 'no-store',
    })

    if (res.ok) {
      const json = await res.json()
      partner = json.data ?? null
    } else if (res.status === 401 || res.status === 403) {
      redirect('/connexion?redirect=/espace-artisan/cee/onboarding')
    } else {
      fetchError = true
    }
  } catch (err) {
    fetchError = true
    logger.warn('cee-onboarding-page: partner fetch failed', {
      action: 'cee-onboarding-page-fetch',
      userId: user.id,
      error: err instanceof Error ? err.message : 'unknown',
    })
  }

  // If partner is already active, redirect to CEE dashboard.
  if (partner?.status === 'active') {
    redirect('/espace-artisan/cee')
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Page header */}
      <header className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold font-heading">Devenir partenaire CEE</h1>
          <p className="mt-1 text-primary-100 text-sm">
            Certificats d&apos;Économies d&apos;Énergie — SA Energy
          </p>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {fetchError && !partner ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-800">
              Impossible de charger votre dossier partenaire.
            </p>
            <p className="mt-1 text-sm text-red-700">
              Veuillez rafraîchir la page ou contacter le support.
            </p>
          </div>
        ) : (
          <OnboardingWizard initialPartner={partner} />
        )}
      </main>
    </div>
  )
}
