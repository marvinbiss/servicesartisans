/**
 * StatusBadge — pastille de statut d'un dossier CEE.
 *
 * Accepte DEUX familles de statuts :
 *   - V2 (legacy, `CeeDossierStatus` — libellés FR du schéma 402)
 *   - V3 (`CeeDossierV3Status` — enum public.cee_dossier_status, schéma 431)
 *
 * Mappe chaque statut à un libellé français + un jeu de classes Tailwind
 * light-only. Les pages V3 (`/espace-artisan/cee`) passent l'enum V3 ; les
 * usages legacy continuent de fonctionner via l'union de types.
 */

import type { CeeDossierStatus } from '@/lib/cee/dossier-types'
import type { CeeDossierV3Status } from '@/lib/cee/dossier-transitions'

type AnyDossierStatus = CeeDossierStatus | CeeDossierV3Status

interface StatusBadgeProps {
  status: AnyDossierStatus
  className?: string
}

const LABELS: Record<AnyDossierStatus, string> = {
  // --- V2 (schéma 402) ---
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
  // --- V3 (enum cee_dossier_status, schéma 431) ---
  draft: 'Brouillon',
  submitted_by_artisan: 'Soumis',
  qa_pending: 'Contrôle qualité',
  qa_approved: 'QA validé',
  qa_rejected: 'QA rejeté',
  deposited: 'Déposé',
  validated_pncee: 'Validé PNCEE',
  rejected_pncee: 'Rejeté PNCEE',
  paid_client: 'Payé client',
  commission_due: 'Commission due',
  commission_paid: 'Commission versée',
  archived: 'Archivé',
}

const CLASSES: Record<AnyDossierStatus, string> = {
  // --- V2 ---
  brouillon: 'bg-sand-100 text-charcoal-700 border-sand-300',
  pre_visite_planifiee: 'bg-sky-50 text-sky-700 border-sky-200',
  pre_visite_effectuee: 'bg-sky-100 text-sky-800 border-sky-200',
  engagement_signe: 'bg-primary-50 text-primary-700 border-primary-200',
  travaux_en_cours: 'bg-amber-50 text-amber-800 border-amber-200',
  travaux_acheves: 'bg-amber-100 text-amber-800 border-amber-200',
  ah_signee: 'bg-primary-50 text-primary-700 border-primary-200',
  depose_delegataire: 'bg-primary-50 text-primary-600 border-primary-200',
  depose_pncee: 'bg-primary-100 text-primary-800 border-primary-200',
  valide: 'bg-green-100 text-green-800 border-green-200',
  rejete: 'bg-red-100 text-red-700 border-red-200',
  annule: 'bg-sand-100 text-charcoal-600 border-sand-300',
  // --- V3 ---
  draft: 'bg-sand-100 text-charcoal-700 border-sand-300',
  submitted_by_artisan: 'bg-sky-50 text-sky-700 border-sky-200',
  qa_pending: 'bg-amber-50 text-amber-800 border-amber-200',
  qa_approved: 'bg-primary-50 text-primary-700 border-primary-200',
  qa_rejected: 'bg-red-100 text-red-700 border-red-200',
  deposited: 'bg-primary-50 text-primary-600 border-primary-200',
  validated_pncee: 'bg-primary-100 text-primary-800 border-primary-200',
  rejected_pncee: 'bg-red-100 text-red-700 border-red-200',
  paid_client: 'bg-green-100 text-green-800 border-green-200',
  commission_due: 'bg-secondary-50 text-charcoal-800 border-secondary-200',
  commission_paid: 'bg-green-100 text-green-800 border-green-200',
  archived: 'bg-sand-100 text-charcoal-600 border-sand-300',
}

// Référence contraste WCAG AA (ratio ≥ 4.5:1) — les paires couleur/fond ci-dessus
// reprennent les teintes V2 déjà auditées (sand/sky/amber/primary/green/red).

export function getStatusLabel(status: AnyDossierStatus): string {
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
