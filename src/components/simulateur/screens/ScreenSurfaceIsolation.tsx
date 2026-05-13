'use client'

import { useState, useEffect } from 'react'
import { Home } from 'lucide-react'
import ScreenTitle from './ScreenTitle'

interface Props {
  value?: number
  surfaceLogement: number
  onChange: (v: number) => void
  onNext: () => void
}

const MIN_M2 = 10
const MAX_M2 = 400

export default function ScreenSurfaceIsolation({
  value,
  surfaceLogement,
  onChange,
  onNext,
}: Props) {
  // Prefill = surface logement (approximation toiture rampants ≈ plancher habitable
  // pour une maison 1 niveau + combles aménagés). L'utilisateur peut ajuster.
  const initial = value ?? surfaceLogement
  const [local, setLocal] = useState<number>(initial)

  useEffect(() => {
    if (value === undefined) {
      setLocal(surfaceLogement)
      onChange(surfaceLogement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const valid = local >= MIN_M2 && local <= MAX_M2

  function handleChange(v: number) {
    const clamped = Math.max(MIN_M2, Math.min(MAX_M2, Math.round(v)))
    setLocal(clamped)
    onChange(clamped)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && valid) onNext()
  }

  return (
    <div>
      <ScreenTitle subtitle="Pour calculer votre prime MaPrimeRénov' par m² selon les barèmes 2026">
        Surface de toiture à isoler
      </ScreenTitle>
      <div className="mx-auto max-w-xs">
        <div className="relative">
          <Home className="absolute left-3 top-1/2 h-5 w-5 -trancharcoal-y-1/2 text-charcoal-400" />
          <input
            type="number"
            inputMode="numeric"
            min={MIN_M2}
            max={MAX_M2}
            step={5}
            autoFocus
            value={Number.isFinite(local) ? local : ''}
            onChange={(e) => handleChange(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            aria-label="Surface en mètres carrés"
            className="w-full rounded-xl border-2 border-charcoal-200 py-4 pl-11 pr-16 text-center text-2xl font-bold tracking-wide text-charcoal-900 transition focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-200"
          />
          <span className="absolute right-4 top-1/2 -trancharcoal-y-1/2 text-sm font-semibold text-charcoal-500">
            m²
          </span>
        </div>
        <input
          type="range"
          min={MIN_M2}
          max={MAX_M2}
          step={5}
          value={local}
          onChange={(e) => handleChange(Number(e.target.value))}
          aria-label="Ajustez la surface de toiture"
          className="mt-4 w-full accent-accent-600"
        />
        <p className="mt-2 text-center text-xs text-charcoal-500">
          Estimation pré-remplie à partir de la surface habitable. Ajustez si besoin.
        </p>
        <button
          type="button"
          onClick={onNext}
          disabled={!valid}
          className="mt-5 w-full rounded-xl bg-accent-600 py-3.5 text-base font-semibold text-white transition hover:bg-accent-700 disabled:opacity-40"
        >
          Continuer
        </button>
      </div>
    </div>
  )
}
