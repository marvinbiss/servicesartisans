'use client'

import { Home, Building2 } from 'lucide-react'
import CardButton from './CardButton'
import ScreenTitle from './ScreenTitle'

interface Props {
  value?: 'maison' | 'appartement'
  onSelect: (v: 'maison' | 'appartement') => void
}

export default function ScreenTypeLogement({ value, onSelect }: Props) {
  return (
    <div>
      <ScreenTitle subtitle="Commençons par votre logement">
        Maison ou appartement ?
      </ScreenTitle>
      <div className="grid grid-cols-2 gap-4">
        <CardButton selected={value === 'maison'} onClick={() => onSelect('maison')}>
          <div className="flex flex-col items-center gap-3 py-4">
            <Home className="h-12 w-12 text-emerald-600" />
            <span className="text-base font-semibold text-charcoal-900">Maison</span>
          </div>
        </CardButton>
        <CardButton selected={value === 'appartement'} onClick={() => onSelect('appartement')}>
          <div className="flex flex-col items-center gap-3 py-4">
            <Building2 className="h-12 w-12 text-emerald-600" />
            <span className="text-base font-semibold text-charcoal-900">Appartement</span>
          </div>
        </CardButton>
      </div>
    </div>
  )
}
