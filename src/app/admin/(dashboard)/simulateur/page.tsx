/**
 * Admin — Simulateur aides rénovation (liste)
 * Voir docs/simulateur-architecture.md §7 — traçabilité < 30s
 */

import { redirect } from 'next/navigation'
import { requirePermission } from '@/lib/admin-auth'
import SimulateurList from '@/components/admin/simulateur/SimulateurList'

export const dynamic = 'force-dynamic'

export default async function AdminSimulateurPage() {
  const auth = await requirePermission('simulateur', 'read')
  if (!auth.success) {
    redirect('/admin/connexion')
  }
  return <SimulateurList />
}
