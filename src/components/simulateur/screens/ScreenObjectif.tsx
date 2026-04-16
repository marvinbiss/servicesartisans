'use client'

import { Flame, ShieldCheck, Wrench } from 'lucide-react'
import CardButton from './CardButton'
import ScreenTitle from './ScreenTitle'
import type { Objectif } from '@/lib/simulateur/deduction'

interface Props {
  value?: Objectif
  onSelect: (v: Objectif) => void
}

const OPTIONS: { id: Objectif; label: string; sub: string; Icon: typeof Flame }[] = [
  {
    id: 'chauffage',
    label: 'Changer mon chauffage',
    sub: 'Pompe à chaleur, poêle, chaudière…',
    Icon: Flame,
  },
  {
    id: 'isolation',
    label: 'Mieux isoler',
    sub: 'Murs, toiture, fenêtres…',
    Icon: ShieldCheck,
  },
  {
    id: 'renovation_complete',
    label: 'Rénovation complète',
    sub: 'Chauffage + isolation (aides max)',
    Icon: Wrench,
  },
]

export default function ScreenObjectif({ value, onSelect }: Props) {
  return (
    <div>
      <ScreenTitle subtitle="On adapte les aides à votre projet">
        Quel est votre objectif ?
      </ScreenTitle>
      <div className="space-y-3">
        {OPTIONS.map((o) => (
          <CardButton key={o.id} selected={value === o.id} onClick={() => onSelect(o.id)}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <o.Icon className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-base font-semibold text-charcoal-900">{o.label}</p>
                <p className="text-sm text-charcoal-500">{o.sub}</p>
              </div>
            </div>
          </CardButton>
        ))}
      </div>
    </div>
  )
}
