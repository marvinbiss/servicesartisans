/**
 * Admin — CEE Délégataires
 * ----------------------------------------------------------------------------
 * Liste et édition des délégataires CEE (P6 2026-2030).
 * Server Component : fetch la table `cee_delegataires` via service_role,
 * puis passe les données à un Client Component pour l'UI.
 *
 * Auth : `requirePermission('settings', 'read')` (pas de scope dédié CEE).
 * Brique 1 bis du pivot mandataire (décision 2026-04-09).
 */

import { redirect } from 'next/navigation'
import { Layers } from 'lucide-react'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { DelegatairesTable, type Delegataire } from './DelegatairesTable'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminCeeDelegatairesPage() {
  const auth = await requirePermission('settings', 'read')
  if (!auth.success) {
    redirect('/admin/connexion')
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('cee_delegataires')
    .select(
      'id, slug, nom_commercial, raison_sociale, siret, type, vague_priorite, statut, url_site, operations_supportees, notes, updated_at'
    )
    .order('vague_priorite', { ascending: true })
    .order('nom_commercial', { ascending: true })

  if (error) {
    logger.error('cee_delegataires fetch error', { message: error.message })
  }

  const delegataires: Delegataire[] = (data ?? []).map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    nom_commercial: row.nom_commercial as string,
    raison_sociale: row.raison_sociale as string,
    siret: (row.siret as string | null) ?? null,
    type: row.type as Delegataire['type'],
    vague_priorite: row.vague_priorite as number,
    statut: row.statut as Delegataire['statut'],
    url_site: (row.url_site as string | null) ?? null,
    operations_supportees: (row.operations_supportees as string[] | null) ?? [],
    notes: (row.notes as string | null) ?? null,
    updated_at: (row.updated_at as string | null) ?? null,
  }))

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-sand-200 rounded-lg">
            <Layers className="w-6 h-6 text-charcoal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">Délégataires CEE</h1>
            <p className="text-sm text-charcoal-500 mt-0.5">
              Obligés, délégataires et mandataires période P6 (2026-2030).
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Erreur lors du chargement des délégataires.
          </div>
        )}

        <DelegatairesTable initialData={delegataires} />
      </div>
    </div>
  )
}
