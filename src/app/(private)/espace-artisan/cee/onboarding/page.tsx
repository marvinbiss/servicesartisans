import { redirect } from 'next/navigation'

// Gel 2026-06-07 : section « Dossiers CEE » retirée de l'espace artisan.
// OnboardingWizard + steps/* + ConventionPDF conservés (gel, pas suppression).
// Voir src/app/(private)/espace-artisan/cee/page.tsx.

// Type conservé : consommé par OnboardingWizard et les 5 steps (gelés).
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

export default function OnboardingPage() {
  redirect('/espace-artisan')
}
