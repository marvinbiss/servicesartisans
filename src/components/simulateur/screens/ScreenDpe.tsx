'use client'

import { BarChart3, TrendingUp, Zap } from 'lucide-react'
import CardButton from './CardButton'
import ScreenTitle from './ScreenTitle'
import type { SautsDpe } from '@/lib/simulateur/types'

interface Props {
  value?: SautsDpe
  onSelect: (v: SautsDpe) => void
}

const OPTIONS: { id: SautsDpe; label: string; sub: string; Icon: typeof BarChart3 }[] = [
  {
    id: 2,
    label: '2 classes DPE',
    sub: 'Ex : E → C — rénovation ciblée',
    Icon: BarChart3,
  },
  {
    id: 3,
    label: '3 classes DPE',
    sub: 'Ex : F → C — rénovation ambitieuse',
    Icon: TrendingUp,
  },
  {
    id: 4,
    label: '4 classes ou plus',
    sub: 'Ex : G → C — rénovation performante (aides max)',
    Icon: Zap,
  },
]

export default function ScreenDpe({ value, onSelect }: Props) {
  return (
    <div>
      <ScreenTitle subtitle="Le nombre de sauts DPE visés détermine le montant de vos aides">
        Combien de classes DPE souhaitez-vous gagner ?
      </ScreenTitle>
      <div className="space-y-3">
        {OPTIONS.map((o) => (
          <CardButton key={o.id} selected={value === o.id} onClick={() => onSelect(o.id)}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent-100">
                <o.Icon className="h-6 w-6 text-accent-700" />
              </div>
              <div>
                <p className="text-base font-semibold text-charcoal-900">{o.label}</p>
                <p className="text-sm text-charcoal-500">{o.sub}</p>
              </div>
            </div>
          </CardButton>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-charcoal-400">
        Si vous ne connaissez pas votre DPE actuel, choisissez 2 classes (estimation prudente).
      </p>
    </div>
  )
}
