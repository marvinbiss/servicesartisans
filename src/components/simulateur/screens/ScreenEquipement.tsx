'use client'

import CardButton from './CardButton'
import ScreenTitle from './ScreenTitle'

type Equip = 'gaz' | 'fioul' | 'elec' | 'autre'

interface Props {
  value?: Equip
  onSelect: (v: Equip) => void
}

const OPTIONS: { id: Equip; label: string; emoji: string }[] = [
  { id: 'gaz', label: 'Gaz', emoji: '🔵' },
  { id: 'fioul', label: 'Fioul', emoji: '🛢️' },
  { id: 'elec', label: 'Électrique', emoji: '⚡' },
  { id: 'autre', label: 'Autre / Je ne sais pas', emoji: '❓' },
]

export default function ScreenEquipement({ value, onSelect }: Props) {
  return (
    <div>
      <ScreenTitle subtitle="Pour estimer les primes Coup de Pouce">
        Vous vous chauffez actuellement au…
      </ScreenTitle>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((o) => (
          <CardButton key={o.id} selected={value === o.id} onClick={() => onSelect(o.id)}>
            <div className="flex flex-col items-center gap-2 py-3">
              <span className="text-2xl">{o.emoji}</span>
              <span className="text-sm font-semibold text-charcoal-900">{o.label}</span>
            </div>
          </CardButton>
        ))}
      </div>
    </div>
  )
}
