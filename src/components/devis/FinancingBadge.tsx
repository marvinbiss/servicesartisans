import { CreditCard, Landmark } from 'lucide-react'
import type { FinancingRail } from '@/lib/devis'

/**
 * Badge informatif (artisan-facing) indiquant le rail de financement qui
 * s'appliquera côté client. Posture indicateur : aucune simulation / scoring /
 * éligibilité ici — simple affichage. Le CTA financement réel (Younited / Aria)
 * arrivera à l'étape 7, après validation juridique.
 */

const RAIL_META: Record<
  Exclude<FinancingRail, 'none'>,
  { label: string; icon: typeof CreditCard; cls: string }
> = {
  younited: {
    label: 'Paiement en plusieurs fois possible',
    icon: CreditCard,
    cls: 'bg-primary-50 text-primary-700 border-primary-200',
  },
  aria: {
    label: 'Paiement différé pro possible',
    icon: Landmark,
    cls: 'bg-secondary-50 text-secondary-700 border-secondary-200',
  },
}

export function FinancingBadge({ rail }: { rail: FinancingRail }) {
  if (rail === 'none') return null
  const meta = RAIL_META[rail]
  const Icon = meta.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${meta.cls}`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  )
}
