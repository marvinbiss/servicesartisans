/**
 * Admin — Cours de marché CEE
 * ----------------------------------------------------------------------------
 * Affiche et permet la mise à jour des cours CEE (classique / précarité)
 * sans nécessiter de redéploiement.
 *
 * Server Component : fetch la table `cee_market_prices` via service_role,
 * puis passe les données au Client Component pour l'UI interactive.
 *
 * Auth : `requirePermission('settings', 'write')` — seuls les admins
 * avec permission settings write peuvent modifier les cours.
 */

import { redirect } from 'next/navigation'
import { TrendingUp } from 'lucide-react'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { CoursMarketForm, type MarketPrice } from './CoursMarketForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminCeeCoursPage() {
  const auth = await requirePermission('settings', 'write')
  if (!auth.success) {
    redirect('/admin/connexion')
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('cee_market_prices')
    .select('id, price_type, eur_per_mwhc, source, effective_date, created_at, created_by')
    .order('effective_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    logger.error('cee_market_prices fetch error', { message: error.message })
  }

  const prices: MarketPrice[] = (data ?? []).map((row) => ({
    id: row.id as string,
    price_type: row.price_type as MarketPrice['price_type'],
    eur_per_mwhc: Number(row.eur_per_mwhc),
    source: (row.source as string | null) ?? null,
    effective_date: row.effective_date as string,
    created_at: row.created_at as string,
    created_by: (row.created_by as string | null) ?? null,
  }))

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-sand-200 rounded-lg">
            <TrendingUp className="w-6 h-6 text-charcoal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">Cours de marché CEE</h1>
            <p className="text-sm text-charcoal-500 mt-0.5">
              Prix classique et précarité en €/MWhc. Mis à jour sans redéploiement.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Erreur lors du chargement des cours de marché.
          </div>
        )}

        <CoursMarketForm initialData={prices} />
      </div>
    </div>
  )
}
