'use client'

import React, { useCallback, useMemo } from 'react'
import { Copy } from 'lucide-react'

// ============================================================
// Types
// ============================================================

interface DaySchedule {
  ouvert: boolean
  debut: string
  fin: string
}

interface OpeningHours {
  lundi: DaySchedule
  mardi: DaySchedule
  mercredi: DaySchedule
  jeudi: DaySchedule
  vendredi: DaySchedule
  samedi: DaySchedule
  dimanche: DaySchedule
}

interface OpeningHoursEditorProps {
  value: OpeningHours
  onChange: (value: OpeningHours) => void
  /** Show a hint that defaults are displayed (not yet saved) */
  showDefaultsHint?: boolean
}

// ============================================================
// Constants
// ============================================================

const DAYS: { key: keyof OpeningHours; label: string }[] = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi', label: 'Samedi' },
  { key: 'dimanche', label: 'Dimanche' },
]

const WEEKDAYS: (keyof OpeningHours)[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']

/** Time slots from 06:00 to 22:00 in 30-minute increments */
const TIME_SLOTS: string[] = (() => {
  const slots: string[] = []
  for (let h = 6; h <= 22; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 22) {
      slots.push(`${String(h).padStart(2, '0')}:30`)
    }
  }
  return slots
})()

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  lundi: { ouvert: true, debut: '08:00', fin: '18:00' },
  mardi: { ouvert: true, debut: '08:00', fin: '18:00' },
  mercredi: { ouvert: true, debut: '08:00', fin: '18:00' },
  jeudi: { ouvert: true, debut: '08:00', fin: '18:00' },
  vendredi: { ouvert: true, debut: '08:00', fin: '18:00' },
  samedi: { ouvert: false, debut: '', fin: '' },
  dimanche: { ouvert: false, debut: '', fin: '' },
}

// ============================================================
// Component
// ============================================================

function OpeningHoursEditorInner({ value, onChange, showDefaultsHint }: OpeningHoursEditorProps) {
  const updateDay = useCallback(
    (day: keyof OpeningHours, field: keyof DaySchedule, fieldValue: boolean | string) => {
      const updated: OpeningHours = {
        ...value,
        [day]: { ...value[day], [field]: fieldValue },
      }
      // When toggling a day off, clear times
      if (field === 'ouvert' && fieldValue === false) {
        updated[day] = { ouvert: false, debut: '', fin: '' }
      }
      // When toggling a day on, set sensible defaults if empty
      if (field === 'ouvert' && fieldValue === true && !value[day].debut) {
        updated[day] = { ouvert: true, debut: '08:00', fin: '18:00' }
      }
      onChange(updated)
    },
    [value, onChange]
  )

  const applyToWeekdays = useCallback(() => {
    const monday = value.lundi
    const updated = { ...value }
    for (const day of WEEKDAYS) {
      updated[day] = { ...monday }
    }
    onChange(updated)
  }, [value, onChange])

  /** Returns true when closing time is not strictly after opening time */
  const hasTimeError = useCallback((day: DaySchedule): boolean => {
    return day.ouvert && day.debut !== '' && day.fin !== '' && day.fin <= day.debut
  }, [])

  const hasAnyError = useMemo(() => {
    return DAYS.some(({ key }) => hasTimeError(value[key]))
  }, [value, hasTimeError])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="block text-sm font-medium text-charcoal-700">
          Horaires d&apos;ouverture
        </span>
        <button
          type="button"
          onClick={applyToWeekdays}
          className="inline-flex items-center gap-1.5 text-xs text-primary-500 hover:text-primary-800 font-medium transition-colors"
          title="Copier les horaires du lundi sur mardi-vendredi"
        >
          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
          Appliquer le lundi aux jours ouvrés
        </button>
      </div>

      {showDefaultsHint && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
          Horaires par défaut. Modifiez et enregistrez pour personnaliser.
        </p>
      )}

      <div className="space-y-2">
        {DAYS.map(({ key, label }) => {
          const day = value[key]
          const timeError = hasTimeError(day)

          return (
            <div
              key={key}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                day.ouvert ? 'bg-white' : 'bg-sand-50'
              }`}
            >
              {/* Day label */}
              <span
                className={`w-24 text-sm font-medium shrink-0 ${
                  day.ouvert ? 'text-charcoal-900' : 'text-charcoal-400'
                }`}
              >
                {label}
              </span>

              {/* Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={day.ouvert}
                aria-label={`${label} ouvert`}
                onClick={() => updateDay(key, 'ouvert', !day.ouvert)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  day.ouvert ? 'bg-primary-500' : 'bg-sand-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    day.ouvert ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>

              {/* Time selectors (only when open) */}
              {day.ouvert ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <label htmlFor={`oh-${key}-debut`} className="sr-only">
                    Heure d&apos;ouverture {label}
                  </label>
                  <select
                    id={`oh-${key}-debut`}
                    value={day.debut}
                    onChange={(e) => updateDay(key, 'debut', e.target.value)}
                    className={`px-2 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 ${
                      timeError ? 'border-red-400 bg-red-50' : 'border-sand-400'
                    }`}
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>

                  <span className="text-charcoal-400 text-sm" aria-hidden="true">
                    -
                  </span>

                  <label htmlFor={`oh-${key}-fin`} className="sr-only">
                    Heure de fermeture {label}
                  </label>
                  <select
                    id={`oh-${key}-fin`}
                    value={day.fin}
                    onChange={(e) => updateDay(key, 'fin', e.target.value)}
                    className={`px-2 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 ${
                      timeError ? 'border-red-400 bg-red-50' : 'border-sand-400'
                    }`}
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>

                  {timeError && (
                    <span className="text-xs text-red-500 whitespace-nowrap">
                      Fermeture avant ouverture
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-charcoal-400 italic">Fermé</span>
              )}
            </div>
          )
        })}
      </div>

      {hasAnyError && (
        <p
          className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
          role="alert"
        >
          Corrigez les horaires invalides avant d&apos;enregistrer.
        </p>
      )}
    </div>
  )
}

export const OpeningHoursEditor = React.memo(OpeningHoursEditorInner)
