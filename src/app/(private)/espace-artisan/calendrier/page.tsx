import { redirect } from 'next/navigation'

// Gel 2026-06-06 : feature calendrier non utilisée (rodage, dispatch devis
// uniquement). APIs/tables bookings conservées — réactivable en restaurant
// cette page depuis l'historique git.
export default function CalendrierPage() {
  redirect('/espace-artisan')
}
