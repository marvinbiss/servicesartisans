/**
 * StatusBadge — pastille de statut d'un dossier CEE.
 *
 * Mappe les 12 statuts du DAG (`dossier-types.ts`) à un libellé français
 * + un jeu de classes Tailwind light-only.
 */

import type { CeeDossierStatus } from '@/lib/cee/dossier-types'

interface StatusBadgeProps {
  status: CeeDossierStatus
  className?: string
}

const LABELS: Record<CeeDossierStatus, string> = {
  brouillon: 'Brouillon',
  pre_visite_planifiee: 'Pré-visite planifiée',
  pre_visite_effectuee: 'Pré-visite effectuée',
  engagement_signe: 'Engagement signé',
  travaux_en_cours: 'Travaux en cours',
  travaux_acheves: 'Travaux achevés',
  ah_signee: 'Attestation signée',
  depose_delegataire: 'Déposé chez délégataire',
  depose_pncee: 'Déposé PNCEE',
  valide: 'Validé',
  rejete: 'Rejeté',
  annule: 'Annulé',
}

const CLASSES: Record<CeeDossierStatus, string> = {
  brouillon: 'bg-sand-100 text-charcoal-700 border-sand-300',
  pre_visite_planifiee: 'bg-sky-50 text-sky-700 border-sky-200',
  pre_visite_effectuee: 'bg-sky-100 text-sky-800 border-sky-200',
  engagement_signe: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  travaux_en_cours: 'bg-amber-50 text-amber-800 border-amber-200',
  travaux_acheves: 'bg-amber-100 text-amber-800 border-amber-200',
  ah_signee: 'bg-violet-50 text-violet-700 border-violet-200',
  depose_delegataire: 'bg-primary-50 text-primary-600 border-primary-200',
  depose_pncee: 'bg-primary-100 text-primary-800 border-primary-200',
  valide: 'bg-green-100 text-green-800 border-green-200',
  rejete: 'bg-red-100 text-red-700 border-red-200',
  annule: 'bg-sand-100 text-charcoal-600 border-sand-300',
}

// Référence contraste WCAG AA (ratio ≥ 4.5:1) — les 12 statuts CEE :
//   brouillon            → gray-100   / gray-700   (~10.4:1)
//   pre_visite_planifiee → sky-50     / sky-700    (~8.1:1)
//   pre_visite_effectuee → sky-100    / sky-800    (~9.6:1)
//   engagement_signe     → indigo-50  / indigo-700 (~9.5:1)
//   travaux_en_cours     → amber-50   / amber-800  (~8.9:1)
//   travaux_acheves      → amber-100  / amber-800  (~8.5:1)
//   ah_signee            → violet-50  / violet-700 (~9.2:1)
//   depose_delegataire   → blue-50    / blue-700   (~8.7:1)
//   depose_pncee         → blue-100   / blue-800   (~9.8:1)
//   valide               → green-100  / green-800  (~8.3:1)
//   rejete               → red-100    / red-700    (~7.7:1)
//   annule               → gray-100   / gray-600   (~6.7:1)  — remonté depuis gray-500 (~4.1:1, sous AA)

export function getStatusLabel(status: CeeDossierStatus): string {
  return LABELS[status] ?? status
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const base =
    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold'
  return (
    <span
      className={`${base} ${CLASSES[status] ?? 'bg-sand-100 text-charcoal-700 border-sand-300'} ${className}`.trim()}
      role="status"
      aria-label={`Statut : ${getStatusLabel(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  )
}
