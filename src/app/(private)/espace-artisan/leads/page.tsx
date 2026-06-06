import { redirect } from 'next/navigation'

// Refonte 2026-06-06 : /leads et /demandes-recues étaient un doublon (même
// table lead_assignments, même endpoint) — fusionnés dans « Mes demandes ».
// Le détail /leads/[id] reste une route physique (workflow devis/décliner).
export default function LeadsPage() {
  redirect('/espace-artisan/demandes')
}
