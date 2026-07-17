import { redirect } from 'next/navigation'

// Cohérence IA 2026-06-07 : le détail d'une demande vit désormais sous
// /espace-artisan/demandes/[id] (même namespace que la liste « Mes demandes »).
export default async function LeadDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/espace-artisan/demandes/${id}`)
}
