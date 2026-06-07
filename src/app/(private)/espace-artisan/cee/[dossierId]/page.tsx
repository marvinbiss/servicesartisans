import { redirect } from 'next/navigation'

// Gel 2026-06-07 : section « Dossiers CEE » retirée de l'espace artisan.
// Voir src/app/(private)/espace-artisan/cee/page.tsx.
export default function DossierDetailPage() {
  redirect('/espace-artisan')
}
