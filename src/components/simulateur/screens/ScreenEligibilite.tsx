'use client'

import { useEffect, useRef } from 'react'
import { Home, Key, Clock, CalendarCheck, Sparkles } from 'lucide-react'
import CardButton from './CardButton'
import ScreenTitle from './ScreenTitle'
import type { Anciennete } from '@/lib/simulateur/types'

interface Props {
  residencePrincipale?: boolean
  anciennete?: Anciennete
  onChangeResidence: (v: boolean) => void
  onChangeAnciennete: (v: Anciennete) => void
  onComplete: () => void
}

export default function ScreenEligibilite({
  residencePrincipale,
  anciennete,
  onChangeResidence,
  onChangeAnciennete,
  onComplete,
}: Props) {
  const pendingRef = useRef(false)

  useEffect(() => {
    if (residencePrincipale !== undefined && anciennete !== undefined && pendingRef.current) {
      const t = setTimeout(() => {
        pendingRef.current = false
        onComplete()
      }, 300)
      return () => clearTimeout(t)
    }
  }, [residencePrincipale, anciennete, onComplete])

  function selectResidence(v: boolean) {
    pendingRef.current = true
    onChangeResidence(v)
  }

  function selectAnciennete(v: Anciennete) {
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
            <Home className="h-8 w-8 text-accent-600" />
            <span className="text-base font-semibold text-charcoal-900">Oui</span>
            <span className="text-xs text-charcoal-500">J&apos;y habite</span>
          </div>
        </CardButton>
        <CardButton selected={residencePrincipale === false} onClick={() => selectResidence(false)}>
          <div className="flex flex-col items-center gap-2 py-3">
            <Key className="h-8 w-8 text-charcoal-500" />
            <span className="text-base font-semibold text-charcoal-900">Non</span>
            <span className="text-xs text-charcoal-500">Investissement locatif</span>
          </div>
        </CardButton>
      </div>

      {/* Ancienneté — 3 niveaux */}
      <p className="mb-3 mt-5 text-center text-sm font-medium text-charcoal-700">
        Quel âge a votre logement ?
      </p>
      <div className="grid grid-cols-3 gap-3">
        <CardButton
          selected={anciennete === 'plus_15_ans'}
          onClick={() => selectAnciennete('plus_15_ans')}
        >
          <div className="flex flex-col items-center gap-1.5 py-3">
            <Clock className="h-7 w-7 text-accent-600" />
            <span className="text-sm font-semibold text-charcoal-900">+ de 15 ans</span>
            <span className="text-xs text-charcoal-500">Avant 2011</span>
          </div>
        </CardButton>
        <CardButton
          selected={anciennete === '2_a_15_ans'}
          onClick={() => selectAnciennete('2_a_15_ans')}
        >
          <div className="flex flex-col items-center gap-1.5 py-3">
            <CalendarCheck className="h-7 w-7 text-accent-600" />
            <span className="text-sm font-semibold text-charcoal-900">2 à 15 ans</span>
            <span className="text-xs text-charcoal-500">2011–2024</span>
          </div>
        </CardButton>
        <CardButton
          selected={anciennete === 'moins_2_ans'}
          onClick={() => selectAnciennete('moins_2_ans')}
        >
          <div className="flex flex-col items-center gap-1.5 py-3">
            <Sparkles className="h-7 w-7 text-charcoal-400" />
            <span className="text-sm font-semibold text-charcoal-900">- de 2 ans</span>
            <span className="text-xs text-charcoal-500">Neuf / récent</span>
          </div>
        </CardButton>
      </div>
      {anciennete === 'moins_2_ans' && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
          Les logements de moins de 2 ans ne sont pas éligibles à la plupart des aides à la
          rénovation énergétique.
        </p>
      )}
    </div>
  )
}
