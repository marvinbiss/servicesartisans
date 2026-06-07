import { redirect } from 'next/navigation'

// Gel 2026-06-07 : section « Dossiers CEE » retirée de l'espace artisan.
// Voir src/app/(private)/espace-artisan/cee/page.tsx.

// Type conservé : consommé par components/cee-artisan/CommissionsTable.tsx
// (composant gelé) et son test.
export interface CeeCommissionRow {
  id: string
  dossier_id: string
  operation_code: string
  montant_eur: number
  status: 'due' | 'batched' | 'sent' | 'confirmed' | 'failed' | 'cancelled'
  versement_date: string | null
  iban_last4: string | null
  created_at: string
}

export default function CommissionsPage() {
  redirect('/espace-artisan')
}
