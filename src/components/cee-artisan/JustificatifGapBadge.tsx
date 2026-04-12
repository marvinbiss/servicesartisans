/**
 * JustificatifGapBadge — indicateur de complétude des pièces CEE obligatoires.
 *
 * Consomme le résultat de `getJustificatifsGap` et affiche :
 *   - "Complet" en vert si toutes les pièces obligatoires sont présentes
 *   - "N pièce(s) manquante(s)" en orange sinon
 *   - "Aucune pièce requise" en gris si la liste requise est vide
 */

import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type { JustificatifsGap } from '@/lib/cee/justificatifs'

interface JustificatifGapBadgeProps {
  gap: JustificatifsGap
}

export default function JustificatifGapBadge({ gap }: JustificatifGapBadgeProps) {
  const base =
    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold'

  if (gap.requis.length === 0) {
    return (
      <span className={`${base} border-sand-300 bg-sand-50 text-charcoal-600`} role="status">
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
        Aucune pièce requise
      </span>
    )
  }

  if (gap.complete) {
    return (
      <span className={`${base} border-green-200 bg-green-50 text-green-700`} role="status">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Dossier complet
      </span>
    )
  }

  const missingCount = gap.missing.length
  return (
    <span
      className={`${base} border-amber-200 bg-amber-50 text-amber-800`}
      role="status"
      aria-label={`${missingCount} pièce${missingCount > 1 ? 's' : ''} manquante${
        missingCount > 1 ? 's' : ''
      }`}
    >
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
      {missingCount} pièce{missingCount > 1 ? 's' : ''} manquante
      {missingCount > 1 ? 's' : ''}
    </span>
  )
}
