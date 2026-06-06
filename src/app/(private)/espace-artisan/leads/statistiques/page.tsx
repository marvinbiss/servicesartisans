import { redirect } from 'next/navigation'

// Refonte 2026-06-06 : les statistiques leads vivent dans « Aujourd'hui »
// (StatCards + tendances + funnel sur l'index).
export default function LeadsStatistiquesPage() {
  redirect('/espace-artisan')
}
