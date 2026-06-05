/**
 * Tableau des dossiers CEE récents avec badge coloré par statut.
 */

import type { CeeDossierStatus } from '@/lib/cee/dossier-types'

export interface CeeDossierRow {
  id: string
  operation_code: string
  provider_name: string | null
  status: CeeDossierStatus
  kwhc_estime: number | null
  created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  brouillon: { label: 'Brouillon', bg: 'bg-sand-100', text: 'text-charcoal-600' },
  pre_visite_planifiee: {
    label: 'Pre-visite planifiee',
    bg: 'bg-sand-100',
    text: 'text-charcoal-600',
  },
  pre_visite_effectuee: {
    label: 'Pre-visite effectuee',
    bg: 'bg-sand-100',
    text: 'text-charcoal-600',
  },
  engagement_signe: {
    label: 'Engagement signe',
    bg: 'bg-sand-200',
    text: 'text-charcoal-700',
  },
  travaux_en_cours: {
    label: 'Travaux en cours',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
  },
  travaux_acheves: {
    label: 'Travaux acheves',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
  },
  ah_signee: {
    label: 'AH signee',
    bg: 'bg-sky-100',
    text: 'text-sky-700',
  },
  depose_delegataire: {
    label: 'Depose delegataire',
    bg: 'bg-sky-100',
    text: 'text-sky-700',
  },
  depose_pncee: {
    label: 'Depose PNCEE',
    bg: 'bg-sky-100',
    text: 'text-sky-700',
  },
  valide: {
    label: 'Valide',
    bg: 'bg-accent-100',
    text: 'text-accent-700',
  },
  rejete: { label: 'Rejete', bg: 'bg-red-100', text: 'text-red-700' },
  annule: { label: 'Annule', bg: 'bg-sand-100', text: 'text-charcoal-500' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    bg: 'bg-sand-100',
    text: 'text-charcoal-600',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  )
}

interface CeeStatusTableProps {
  rows: CeeDossierRow[]
}

export function CeeStatusTable({ rows }: CeeStatusTableProps) {
  return (
    <div className="bg-white border border-sand-200 shadow-sm rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-sand-100">
        <h3 className="text-sm font-semibold text-charcoal-700">Dossiers récents</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sand-100 text-left text-xs text-charcoal-500 uppercase tracking-wider">
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Opération</th>
              <th className="px-5 py-3">Artisan</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3 text-right">kWhc est.</th>
              <th className="px-5 py-3">Créé le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-50">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-charcoal-400">
                  Aucun dossier
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-sand-50">
                <td className="px-5 py-3 font-mono text-xs text-charcoal-500">
                  {row.id.slice(0, 8)}
                </td>
                <td className="px-5 py-3 font-medium text-charcoal-900">{row.operation_code}</td>
                <td className="px-5 py-3 text-charcoal-600">{row.provider_name ?? '-'}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-charcoal-700">
                  {row.kwhc_estime != null ? row.kwhc_estime.toLocaleString('fr-FR') : '-'}
                </td>
                <td className="px-5 py-3 text-charcoal-500">
                  {new Date(row.created_at).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
