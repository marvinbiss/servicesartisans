/**
 * Admin — Détail estimation simulateur
 * Affiche situation, projet, résultats, bareme_ids, formule_debug, recompute.
 */

import { redirect } from 'next/navigation'
import { requirePermission } from '@/lib/admin-auth'
import SimulateurDetail from '@/components/admin/simulateur/SimulateurDetail'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ publicId: string }>
}

export default async function AdminSimulateurDetailPage({ params }: Props) {
  const auth = await requirePermission('simulateur', 'read')
  if (!auth.success) {
    redirect('/admin/connexion')
  }
  const { publicId } = await params
  return <SimulateurDetail publicId={publicId} />
}
