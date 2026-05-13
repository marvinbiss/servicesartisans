'use client'

import { Maximize2 } from 'lucide-react'
import CardButton from './CardButton'
import ScreenTitle from './ScreenTitle'
import type { SurfaceTranche } from '@/lib/simulateur/deduction'

interface Props {
  value?: SurfaceTranche
  onSelect: (v: SurfaceTranche) => void
}

const OPTIONS: { id: SurfaceTranche; label: string; sub: string }[] = [
  { id: 'lt50', label: '< 50 m²', sub: 'Studio / T2' },
  { id: '50_100', label: '50 – 100 m²', sub: 'T3 / T4' },
  { id: '100_150', label: '100 – 150 m²', sub: 'Grande maison' },
  { id: 'gt150', label: '> 150 m²', sub: 'Très grande surface' },
]

export default function ScreenSurface({ value, onSelect }: Props) {
  return (
    <div>
      <ScreenTitle subtitle="Une estimation suffit">
        Quelle surface fait votre logement ?
      </ScreenTitle>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((o) => (
          <CardButton key={o.id} selected={value === o.id} onClick={() => onSelect(o.id)}>
            <div className="flex flex-col items-center gap-2 py-3">
              <Maximize2 className="h-6 w-6 text-accent-600" />
              <span className="text-base font-bold text-charcoal-900">{o.label}</span>
              <span className="text-xs text-charcoal-500">{o.sub}</span>
            </div>
          </CardButton>
        ))}
      </div>
    </div>
  )
}
