import { redirect } from 'next/navigation'

// Refonte 2026-06-06 : les métriques vivent dans « Aujourd'hui » (index) —
// StatCards + tendances 30j + réputation + funnel. L'ancienne page
// statistiques était branchée sur bookings (feature calendrier gelée).
export default function StatistiquesPage() {
  redirect('/espace-artisan')
}
