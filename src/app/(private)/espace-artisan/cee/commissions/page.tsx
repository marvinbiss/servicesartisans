/**
 * /espace-artisan/cee/commissions — Historique des versements CEE artisan (V3).
 *
 * Server Component :
 *   - Auth obligatoire
 *   - Chargement commissions via cee_commissions
 *   - KPIs : en attente | payé YTD | payé total
 *   - Table commissions avec export CSV (Client Component)
 */

import { redirect } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import { createClient } from '@/lib/supabase/server'
import CommissionsTable from '@/components/cee-artisan/CommissionsTable'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Mes commissions CEE — Espace artisan',
  robots: { index: false, follow: false },
}

export interface CeeCommissionRow {
  id: string
  dossier_id: string
  operation_code: string
  montant_eur: number
  status: 'due' | 'batched' | 'sent' | 'confirmed' | 'failed' | 'cancelled'
  versement_date: string | null
  iban_last4: string | null
  created_at: string
}

function formatEuros(v: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(v)
}

export default async function CommissionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/connexion?redirect=/espace-artisan/cee/commissions')
  }

  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!provider) redirect('/espace-artisan/cee')

  const providerRow = provider as { id: string }

  let commissions: CeeCommissionRow[] = []
  let loadError = false

  try {
    // Jointure : partner!inner pour filtrer par provider_id (RLS-safe)
    //          + dossier pour operation_code (lookup affichage)
    const { data, error } = await supabase
      .from('cee_commissions')
      .select(
        'id, dossier_id, amount_cts, status, sent_at, confirmed_at, created_at, ' +
          'partner:cee_artisan_partners!inner(provider_id, iban_last4), ' +
          'dossier:cee_dossiers(operation_code)'
      )
      .eq('partner.provider_id', providerRow.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (data) {
      commissions = (data as unknown as Array<{
        id: string
        dossier_id: string
        amount_cts: number
        status: string
        sent_at: string | null
        confirmed_at: string | null
        created_at: string
        partner: { provider_id: string; iban_last4: string | null } | null
        dossier: { operation_code: string } | null
      }>).map((row) => ({
        id: row.id,
        dossier_id: row.dossier_id,
        operation_code: row.dossier?.operation_code ?? '—',
        montant_eur: (row.amount_cts ?? 0) / 100,
        status: (row.status ?? 'due') as CeeCommissionRow['status'],
        versement_date: row.confirmed_at ?? row.sent_at,
        iban_last4: row.partner?.iban_last4 ?? null,
        created_at: row.created_at,
      }))
    }
  } catch (err) {
    loadError = true
    logger.warn('espace-artisan-cee-commissions failed', {
      action: 'espace-artisan-cee-commissions',
      providerId: providerRow.id,
      error: err instanceof Error ? err.message : 'unknown',
    })
  }

  // KPIs (statuts cee_commissions migration 432 :
  //   due → batched → sent → confirmed | failed | cancelled)
  const ytdStart = new Date(new Date().getFullYear(), 0, 1)
  const PENDING_STATUSES = ['due', 'batched', 'sent']
  const PAID_STATUSES = ['confirmed']
  const pendingTotal = commissions
    .filter((c) => PENDING_STATUSES.includes(c.status))
    .reduce((s, c) => s + c.montant_eur, 0)
  const paidTotal = commissions
    .filter((c) => PAID_STATUSES.includes(c.status))
    .reduce((s, c) => s + c.montant_eur, 0)
  const paidYtd = commissions
    .filter(
      (c) =>
        PAID_STATUSES.includes(c.status) &&
        c.versement_date &&
        new Date(c.versement_date) >= ytdStart
    )
    .reduce((s, c) => s + c.montant_eur, 0)

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Espace Artisan', href: '/espace-artisan' },
              { label: 'Dossiers CEE', href: '/espace-artisan/cee' },
              { label: 'Commissions' },
            ]}
          />
        </div>
      </div>

      <header className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Mes commissions CEE</h1>
          <p className="mt-1 text-primary-100">
            Historique de vos versements SA Energy.
          </p>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* KPIs */}
        <section aria-label="Totaux commissions" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'En attente', value: formatEuros(pendingTotal), color: 'bg-amber-50 text-amber-800 border-amber-200' },
            { label: `Payé ${new Date().getFullYear()}`, value: formatEuros(paidYtd), color: 'bg-green-50 text-green-800 border-green-200' },
            { label: 'Total versé (cumulé)', value: formatEuros(paidTotal), color: 'bg-primary-50 text-primary-800 border-primary-200' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className={`rounded-xl border ${kpi.color} p-5`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{kpi.label}</p>
              <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
            </div>
          ))}
        </section>

        {/* Table */}
        <CommissionsTable commissions={commissions} loadError={loadError} />
      </main>
    </div>
  )
}
