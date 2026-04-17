'use client'

import type { AgeChaudiere } from '@/lib/simulateur/types'
import CardButton from './CardButton'
import ScreenTitle from './ScreenTitle'

interface Props {
  value?: AgeChaudiere
  onSelect: (v: AgeChaudiere) => void
}

const OPTIONS: { id: AgeChaudiere; label: string; emoji: string }[] = [
  { id: 'moins_5_ans', label: 'Moins de 5 ans', emoji: '✨' },
  { id: '5_10_ans', label: '5 à 10 ans', emoji: '👍' },
  { id: '10_15_ans', label: '10 à 15 ans', emoji: '⚠️' },
  { id: 'plus_15_ans', label: 'Plus de 15 ans', emoji: '🔧' },
  { id: 'en_panne', label: 'En panne / quasi HS', emoji: '💀' },
]

export default function ScreenAgeChaudiere({ value, onSelect }: Props) {
  return (
    <div>
      <ScreenTitle subtitle="L'âge influence les primes Coup de Pouce">
        Quel est l&apos;état de votre chaudière actuelle ?
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
