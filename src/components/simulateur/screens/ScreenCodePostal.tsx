'use client'

import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import ScreenTitle from './ScreenTitle'

interface Props {
  value: string
  onChange: (v: string) => void
  onNext: () => void
  detectedCity?: string
}

const CP_RE = /^\d{5}$/

export default function ScreenCodePostal({ value, onChange, onNext, detectedCity }: Props) {
  const [valid, setValid] = useState(false)

  useEffect(() => {
    setValid(CP_RE.test(value))
  }, [value])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && valid) onNext()
  }

  return (
    <div>
      <ScreenTitle subtitle="Pour déterminer votre zone climatique et les aides locales">
        Votre code postal ?
      </ScreenTitle>
      <div className="mx-auto max-w-xs">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={5}
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
            onKeyDown={handleKeyDown}
            placeholder="ex : 75001"
            className="w-full rounded-xl border-2 border-slate-200 py-4 pl-11 pr-4 text-center text-2xl font-bold tracking-widest text-charcoal-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        {detectedCity && valid && (
          <p className="mt-3 text-center text-sm font-medium text-emerald-700">
            {detectedCity}
          </p>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!valid}
          className="mt-5 w-full rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
        >
          Continuer
        </button>
      </div>
    </div>
  )
}
