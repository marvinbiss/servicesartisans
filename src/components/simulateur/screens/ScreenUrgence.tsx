'use client'

import type { UrgenceProjet } from '@/lib/simulateur/types'
import CardButton from './CardButton'
import ScreenTitle from './ScreenTitle'

interface Props {
  value?: UrgenceProjet
  onSelect: (v: UrgenceProjet) => void
}

const OPTIONS: { id: UrgenceProjet; label: string; emoji: string }[] = [
  { id: 'urgent_panne', label: 'Urgent / En panne', emoji: '🚨' },
  { id: 'sous_3_mois', label: 'Sous 3 mois', emoji: '📅' },
  { id: 'sous_6_mois', label: 'Sous 6 mois', emoji: '🗓️' },
  { id: 'je_me_renseigne', label: 'Je me renseigne', emoji: '🔍' },
]

export default function ScreenUrgence({ value, onSelect }: Props) {
  return (
    <div>
      <ScreenTitle subtitle="Pour mieux évaluer votre projet">
        Quand souhaitez-vous réaliser vos travaux ?
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
