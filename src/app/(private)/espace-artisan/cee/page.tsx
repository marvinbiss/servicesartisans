import { redirect } from 'next/navigation'

// Gel 2026-06-07 : section « Dossiers CEE » retirée de l'espace artisan
// (dashboard recentré : demandes, fiche, analytics, paramètres). Composants
// cee-artisan/**, tables et back-office admin conservés — réactivable en
// restaurant les pages depuis l'historique git. APIs artisan CEE gelées (501).
export default function CeePage() {
  redirect('/espace-artisan')
}
