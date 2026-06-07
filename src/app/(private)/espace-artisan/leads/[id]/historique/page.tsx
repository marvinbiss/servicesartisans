import { redirect } from 'next/navigation'

// Cohérence IA 2026-06-07 : l'historique vit désormais sous
// /espace-artisan/demandes/[id]/historique (même namespace que la liste).
export default function LeadHistoriqueRedirect({ params }: { params: { id: string } }) {
  redirect(`/espace-artisan/demandes/${params.id}/historique`)
}
