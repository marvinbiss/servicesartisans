import { redirect } from 'next/navigation'

// Refonte 2026-06-06 : /demandes-recues fusionnée dans « Mes demandes »
// (doublon de /leads — même table lead_assignments, même endpoint).
export default function DemandesRecuesPage() {
  redirect('/espace-artisan/demandes')
}
