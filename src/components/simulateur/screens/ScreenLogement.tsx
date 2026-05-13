'use client'

import { useEffect, useRef } from 'react'
import { Home, Building2, Maximize2 } from 'lucide-react'
import CardButton from './CardButton'
import ScreenTitle from './ScreenTitle'
import type { SurfaceTranche } from '@/lib/simulateur/deduction'

interface Props {
  typeLogement?: 'maison' | 'appartement'
  surfaceTranche?: SurfaceTranche
  onChangeType: (v: 'maison' | 'appartement') => void
  onChangeSurface: (v: SurfaceTranche) => void
  onComplete: () => void
}

const SURFACES: { id: SurfaceTranche; label: string; sub: string }[] = [
  { id: 'lt50', label: '< 50 m\u00B2', sub: 'Studio / T2' },
  { id: '50_100', label: '50 \u2013 100 m\u00B2', sub: 'T3 / T4' },
  { id: '100_150', label: '100 \u2013 150 m\u00B2', sub: 'Grande maison' },
  { id: 'gt150', label: '> 150 m\u00B2', sub: 'Tr\u00E8s grande surface' },
]

export default function ScreenLogement({
  typeLogement,
  surfaceTranche,
  onChangeType,
  onChangeSurface,
  onComplete,
}: Props) {
  const pendingRef = useRef(false)

  // Auto-advance 300ms after both fields are set
  useEffect(() => {
    if (typeLogement && surfaceTranche && pendingRef.current) {
      const t = setTimeout(() => {
        pendingRef.current = false
        onComplete()
      }, 300)
      return () => clearTimeout(t)
    }
  }, [typeLogement, surfaceTranche, onComplete])

  function selectType(v: 'maison' | 'appartement') {
    pendingRef.current = true
    onChangeType(v)
  }

  function selectSurface(v: SurfaceTranche) {
    pendingRef.current = true
    onChangeSurface(v)
  }

  return (
    <div>
      <ScreenTitle subtitle="Commençons par votre logement">Décrivez votre logement</ScreenTitle>

      <div className="grid grid-cols-2 gap-4">
        <CardButton selected={typeLogement === 'maison'} onClick={() => selectType('maison')}>
          <div className="flex flex-col items-center gap-2 py-3">
            <Home className="h-10 w-10 text-accent-600" />
            <span className="text-base font-semibold text-charcoal-900">Maison</span>
          </div>
        </CardButton>
        <CardButton
          selected={typeLogement === 'appartement'}
          onClick={() => selectType('appartement')}
        >
          <div className="flex flex-col items-center gap-2 py-3">
            <Building2 className="h-10 w-10 text-accent-600" />
            <span className="text-base font-semibold text-charcoal-900">Appartement</span>
          </div>
        </CardButton>
      </div>

      <p className="mb-3 mt-5 text-center text-sm font-medium text-charcoal-700">
        Quelle surface approximative ?
      </p>
      <div className="grid grid-cols-2 gap-3">
        {SURFACES.map((o) => (
          <CardButton
            key={o.id}
            selected={surfaceTranche === o.id}
            onClick={() => selectSurface(o.id)}
          >
            <div className="flex flex-col items-center gap-1.5 py-2">
              <Maximize2 className="h-5 w-5 text-accent-600" />
              <span className="text-sm font-bold text-charcoal-900">{o.label}</span>
              <span className="text-xs text-charcoal-500">{o.sub}</span>
            </div>
          </CardButton>
        ))}
      </div>
    </div>
  )
}
