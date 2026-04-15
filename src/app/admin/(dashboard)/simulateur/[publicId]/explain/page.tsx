/**
 * Admin — Simulateur estimation /explain
 *
 * Route dédiée reconstruction < 30s exigée par le plan 20/20. Alias stricte
 * sur la vue détail qui affiche déjà situation, projet, résultats, bareme_ids,
 * formule_debug, request_id, inputs_hash, consent_text_sha256.
 *
 * URL : /admin/simulateur/[publicId]/explain
 */

import { redirect } from 'next/navigation'
import { requirePermission } from '@/lib/admin-auth'
import SimulateurDetail from '@/components/admin/simulateur/SimulateurDetail'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ publicId: string }>
}

export default async function AdminSimulateurExplainPage({ params }: Props) {
  const auth = await requirePermission('simulateur', 'read')
  if (!auth.success) {
    redirect('/admin/connexion')
  }
  const { publicId } = await params
  return <SimulateurDetail publicId={publicId} />
}
