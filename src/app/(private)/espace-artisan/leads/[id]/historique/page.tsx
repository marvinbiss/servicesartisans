import { redirect } from 'next/navigation'

// Cohérence IA 2026-06-07 : l'historique vit désormais sous
// /espace-artisan/demandes/[id]/historique (même namespace que la liste).
export default async function LeadHistoriqueRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/espace-artisan/demandes/${id}/historique`)
}
