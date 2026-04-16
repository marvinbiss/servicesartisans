'use client'

import CardButton from './CardButton'
import ScreenTitle from './ScreenTitle'

interface Props {
  value?: number
  onSelect: (v: number) => void
}

const OPTIONS = [
  { n: 1, label: '1', sub: 'Seul(e)' },
  { n: 2, label: '2', sub: 'Couple' },
  { n: 3, label: '3', sub: 'Avec 1 enfant' },
  { n: 4, label: '4', sub: 'Avec 2 enfants' },
  { n: 5, label: '5+', sub: 'Famille nombreuse' },
]

export default function ScreenFoyer({ value, onSelect }: Props) {
  return (
    <div>
      <ScreenTitle subtitle="Nombre de personnes dans le foyer fiscal">
        Combien êtes-vous ?
      </ScreenTitle>
      <div className="flex flex-wrap justify-center gap-3">
        {OPTIONS.map((o) => (
          <CardButton
            key={o.n}
            selected={value === o.n}
            onClick={() => onSelect(o.n)}
            className="w-[calc(33%-0.5rem)] min-w-[5.5rem]"
          >
            <div className="flex flex-col items-center gap-1 py-2">
              <span className="text-2xl font-bold text-charcoal-900">{o.label}</span>
              <span className="text-xs text-charcoal-500">{o.sub}</span>
            </div>
          </CardButton>
        ))}
      </div>
    </div>
  )
}
