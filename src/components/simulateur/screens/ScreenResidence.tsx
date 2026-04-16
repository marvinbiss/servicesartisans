'use client'

import { Home, Key } from 'lucide-react'
import CardButton from './CardButton'
import ScreenTitle from './ScreenTitle'

interface Props {
  value?: boolean
  onSelect: (v: boolean) => void
}

export default function ScreenResidence({ value, onSelect }: Props) {
  return (
    <div>
      <ScreenTitle subtitle="Les aides diffèrent selon l'usage du logement">
        C&apos;est votre résidence principale ?
      </ScreenTitle>
      <div className="grid grid-cols-2 gap-4">
        <CardButton selected={value === true} onClick={() => onSelect(true)}>
          <div className="flex flex-col items-center gap-3 py-4">
            <Home className="h-10 w-10 text-emerald-600" />
            <span className="text-base font-semibold text-charcoal-900">Oui</span>
            <span className="text-xs text-charcoal-500">J&apos;y habite</span>
          </div>
        </CardButton>
        <CardButton selected={value === false} onClick={() => onSelect(false)}>
          <div className="flex flex-col items-center gap-3 py-4">
            <Key className="h-10 w-10 text-slate-500" />
            <span className="text-base font-semibold text-charcoal-900">Non</span>
            <span className="text-xs text-charcoal-500">Investissement locatif</span>
          </div>
        </CardButton>
      </div>
    </div>
  )
}
