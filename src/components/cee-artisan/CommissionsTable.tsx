'use client'

/**
 * CommissionsTable — table des commissions CEE artisan avec export CSV.
 *
 * WCAG 2.1 AA : table avec headers th/scope, aria-live sur état loading/erreur.
 * 8 states : default / hover / focus / active / disabled / loading / error / success.
 * Light-only, zéro dark:*.
 */

import { useState } from 'react'
import { Download, AlertTriangle, Euro } from 'lucide-react'
import type { CeeCommissionRow } from '@/app/(private)/espace-artisan/cee/commissions/page'

interface CommissionsTableProps {
  commissions: CeeCommissionRow[]
  loadError: boolean
}

const STATUS_LABELS: Record<CeeCommissionRow['status'], string> = {
  due: 'En attente',
  batched: 'Préparé',
  sent: 'Envoyé banque',
  confirmed: 'Versé',
  failed: 'Échec',
  cancelled: 'Annulé',
}

const STATUS_CLASSES: Record<CeeCommissionRow['status'], string> = {
  due: 'bg-amber-50 text-amber-700 border-amber-200',
  batched: 'bg-amber-50 text-amber-700 border-amber-200',
  sent: 'bg-blue-50 text-blue-800 border-blue-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-sand-100 text-charcoal-600 border-sand-300',
}

function formatEuros(v: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(v)
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  })
}

function exportCsv(commissions: CeeCommissionRow[]) {
  const header = [
    'ID dossier',
    'Opération',
    'Montant (€)',
    'Statut',
    'Date versement',
    'IBAN (4 derniers)',
  ]
  const rows = commissions.map((c) => [
    c.dossier_id,
    c.operation_code,
    c.montant_eur.toString(),
    STATUS_LABELS[c.status],
    c.versement_date ? formatDate(c.versement_date) : '',
    c.iban_last4 ? `****${c.iban_last4}` : '',
  ])

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `commissions-cee-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function CommissionsTable({ commissions, loadError }: CommissionsTableProps) {
  const [exporting, setExporting] = useState(false)

  function handleExport() {
    setExporting(true)
    try {
      exportCsv(commissions)
    } finally {
      setExporting(false)
    }
  }

  if (loadError) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5"
      >
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
        <p className="text-sm text-red-700">
          Impossible de charger les commissions. Réessayez dans quelques instants.
        </p>
      </div>
    )
  }

  if (commissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-sand-400 bg-white p-10 text-center">
        <Euro className="mx-auto h-10 w-10 text-charcoal-400" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-charcoal-700">
          Aucune commission enregistrée pour le moment.
        </p>
        <p className="mt-1 text-xs text-charcoal-500">
          Vos commissions apparaîtront ici après validation des dossiers CEE.
        </p>
      </div>
    )
  }

  return (
    <section aria-label="Historique des commissions">
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-charcoal-600">
          {commissions.length} versement{commissions.length !== 1 ? 's' : ''}
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting || commissions.length === 0}
          aria-busy={exporting}
          className="inline-flex items-center gap-2 rounded-lg border border-sand-300 bg-white px-4 py-2 text-sm font-medium text-charcoal-700 motion-safe:transition-all hover:bg-sand-50 hover:border-sand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-safe:active:scale-[0.98]"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {exporting ? 'Export…' : 'Exporter CSV'}
        </button>
      </div>

      {/* Table desktop */}
      <div className="hidden overflow-hidden rounded-xl border border-sand-300 bg-white sm:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm" aria-label="Commissions CEE">
            <thead className="bg-sand-50 text-xs uppercase tracking-wide text-charcoal-500">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Dossier
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Fiche CEE
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Montant
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Statut
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Date versement
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  IBAN
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {commissions.map((c) => (
                <tr
                  key={c.id}
                  className="transition-colors hover:bg-sand-50 focus-within:bg-sand-50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-charcoal-600">
                    <a
                      href={`/espace-artisan/cee/${c.dossier_id}`}
                      className="text-primary-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1 rounded"
                    >
                      {c.dossier_id.slice(0, 8)}…
                    </a>
                  </td>
                  <td className="px-4 py-3 font-semibold text-charcoal-900">{c.operation_code}</td>
                  <td className="px-4 py-3 text-right font-semibold text-charcoal-900">
                    {formatEuros(c.montant_eur)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[c.status]}`}
                      role="status"
                      aria-label={`Statut : ${STATUS_LABELS[c.status]}`}
                    >
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal-600">
                    <time dateTime={c.versement_date ?? undefined}>
                      {formatDate(c.versement_date)}
                    </time>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-charcoal-500">
                    {c.iban_last4 ? `****${c.iban_last4}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards mobile */}
      <ul className="space-y-3 sm:hidden" role="list">
        {commissions.map((c) => (
          <li key={c.id} className="rounded-xl border border-sand-300 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-charcoal-900">{c.operation_code}</p>
                <p className="mt-0.5 font-mono text-xs text-charcoal-500">
                  <a
                    href={`/espace-artisan/cee/${c.dossier_id}`}
                    className="text-primary-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
                  >
                    {c.dossier_id.slice(0, 8)}…
                  </a>
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[c.status]}`}
                role="status"
              >
                {STATUS_LABELS[c.status]}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-charcoal-500">Montant</dt>
                <dd className="font-bold text-charcoal-900">{formatEuros(c.montant_eur)}</dd>
              </div>
              <div>
                <dt className="text-xs text-charcoal-500">Date versement</dt>
                <dd className="text-charcoal-700">
                  <time dateTime={c.versement_date ?? undefined}>
                    {formatDate(c.versement_date)}
                  </time>
                </dd>
              </div>
              {c.iban_last4 && (
                <div>
                  <dt className="text-xs text-charcoal-500">IBAN</dt>
                  <dd className="font-mono text-xs text-charcoal-500">****{c.iban_last4}</dd>
                </div>
              )}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  )
}
