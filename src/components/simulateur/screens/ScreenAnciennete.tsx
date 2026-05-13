'use client'

import { Clock, CalendarCheck } from 'lucide-react'
import CardButton from './CardButton'
import ScreenTitle from './ScreenTitle'

interface Props {
  value?: boolean
  onSelect: (avantRegle: boolean) => void
}

export default function ScreenAnciennete({ value, onSelect }: Props) {
  return (
    <div>
      <ScreenTitle subtitle="Condition d'éligibilité aux principales aides">
        Votre logement a plus de 15 ans ?
      </ScreenTitle>
      <div className="grid grid-cols-2 gap-4">
        <CardButton selected={value === true} onClick={() => onSelect(true)}>
          <div className="flex flex-col items-center gap-3 py-4">
            <Clock className="h-10 w-10 text-accent-600" />
            <span className="text-base font-semibold text-charcoal-900">Oui</span>
            <span className="text-xs text-charcoal-500">Construit avant 2011</span>
          </div>
        </CardButton>
        <CardButton selected={value === false} onClick={() => onSelect(false)}>
          <div className="flex flex-col items-center gap-3 py-4">
            <CalendarCheck className="h-10 w-10 text-charcoal-500" />
            <span className="text-base font-semibold text-charcoal-900">Non</span>
            <span className="text-xs text-charcoal-500">Plus récent</span>
          </div>
        </CardButton>
      </div>
    </div>
  )
}
