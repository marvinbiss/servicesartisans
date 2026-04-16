'use client'

import { useEffect, useRef } from 'react'
import { Home, Key, Clock, CalendarCheck } from 'lucide-react'
import CardButton from './CardButton'
import ScreenTitle from './ScreenTitle'

interface Props {
  residencePrincipale?: boolean
  anciennetePlus15?: boolean
  onChangeResidence: (v: boolean) => void
  onChangeAnciennete: (v: boolean) => void
  onComplete: () => void
}

export default function ScreenEligibilite({
  residencePrincipale,
  anciennetePlus15,
  onChangeResidence,
  onChangeAnciennete,
  onComplete,
}: Props) {
  const pendingRef = useRef(false)

  useEffect(() => {
    if (residencePrincipale !== undefined && anciennetePlus15 !== undefined && pendingRef.current) {
      const t = setTimeout(() => {
        pendingRef.current = false
        onComplete()
      }, 300)
      return () => clearTimeout(t)
    }
  }, [residencePrincipale, anciennetePlus15, onComplete])

  function selectResidence(v: boolean) {
    pendingRef.current = true
    onChangeResidence(v)
  }

  function selectAnciennete(v: boolean) {
    pendingRef.current = true
    onChangeAnciennete(v)
  }

  return (
    <div>
      <ScreenTitle subtitle="Conditions d'éligibilité aux principales aides">
        Votre situation
      </ScreenTitle>

      {/* Résidence principale */}
      <p className="mb-3 text-center text-sm font-medium text-charcoal-700">
        C&apos;est votre résidence principale ?
      </p>
      <div className="grid grid-cols-2 gap-4">
        <CardButton selected={residencePrincipale === true} onClick={() => selectResidence(true)}>
          <div className="flex flex-col items-center gap-2 py-3">
            <Home className="h-8 w-8 text-emerald-600" />
            <span className="text-base font-semibold text-charcoal-900">Oui</span>
            <span className="text-xs text-charcoal-500">J&apos;y habite</span>
          </div>
        </CardButton>
        <CardButton selected={residencePrincipale === false} onClick={() => selectResidence(false)}>
          <div className="flex flex-col items-center gap-2 py-3">
            <Key className="h-8 w-8 text-slate-500" />
            <span className="text-base font-semibold text-charcoal-900">Non</span>
            <span className="text-xs text-charcoal-500">Investissement locatif</span>
          </div>
        </CardButton>
      </div>

      {/* Ancienneté */}
      <p className="mb-3 mt-5 text-center text-sm font-medium text-charcoal-700">
        Votre logement a plus de 15 ans ?
      </p>
      <div className="grid grid-cols-2 gap-4">
        <CardButton selected={anciennetePlus15 === true} onClick={() => selectAnciennete(true)}>
          <div className="flex flex-col items-center gap-2 py-3">
            <Clock className="h-8 w-8 text-emerald-600" />
            <span className="text-base font-semibold text-charcoal-900">Oui</span>
            <span className="text-xs text-charcoal-500">Construit avant 2011</span>
          </div>
        </CardButton>
        <CardButton selected={anciennetePlus15 === false} onClick={() => selectAnciennete(false)}>
          <div className="flex flex-col items-center gap-2 py-3">
            <CalendarCheck className="h-8 w-8 text-slate-500" />
            <span className="text-base font-semibold text-charcoal-900">Non</span>
            <span className="text-xs text-charcoal-500">Plus récent</span>
          </div>
        </CardButton>
      </div>
    </div>
  )
}
