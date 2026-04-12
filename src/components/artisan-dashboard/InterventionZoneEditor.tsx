'use client'

import React, { memo, useCallback } from 'react'
import { MapPin } from 'lucide-react'

const PRESETS = [10, 25, 50, 100] as const
const MIN_RADIUS = 5
const MAX_RADIUS = 200
const STEP = 5

interface InterventionZoneEditorProps {
  /** Current radius in km */
  value: number
  /** City name from provider data */
  city: string | null
  /** Called when the radius changes */
  onChange: (radius: number) => void
}

/**
 * Editor for the artisan's intervention zone radius.
 * Displays a slider, quick presets, and a summary text.
 */
export const InterventionZoneEditor = memo(function InterventionZoneEditor({
  value,
  city,
  onChange,
}: InterventionZoneEditorProps) {
  const clampedValue = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, value))

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseInt(e.target.value, 10))
    },
    [onChange]
  )

  const handlePreset = useCallback(
    (preset: number) => {
      onChange(preset)
    },
    [onChange]
  )

  const cityLabel = city?.trim() || 'votre adresse'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="w-4 h-4 text-primary-500" aria-hidden="true" />
        <label
          htmlFor="intervention-radius"
          className="block text-sm font-medium text-charcoal-700"
        >
          Zone d&apos;intervention
        </label>
      </div>

      <p className="text-sm text-charcoal-500">
        Définissez la distance maximale à laquelle vous pouvez vous déplacer pour vos interventions.
      </p>

      {/* Summary */}
      <div className="bg-primary-50 border border-primary-100 rounded-lg px-4 py-3 text-center">
        <span className="text-2xl font-bold text-primary-600">{clampedValue} km</span>
        <span className="block text-sm text-primary-500 mt-0.5">autour de {cityLabel}</span>
      </div>

      {/* Slider */}
      <div>
        <input
          id="intervention-radius"
          type="range"
          min={MIN_RADIUS}
          max={MAX_RADIUS}
          step={STEP}
          value={clampedValue}
          onChange={handleSliderChange}
          aria-valuemin={MIN_RADIUS}
          aria-valuemax={MAX_RADIUS}
          aria-valuenow={clampedValue}
          aria-valuetext={`${clampedValue} kilomètres`}
          className="w-full h-2 bg-sand-300 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <div className="flex justify-between text-xs text-charcoal-400 mt-1">
          <span>{MIN_RADIUS} km</span>
          <span>100 km</span>
          <span>{MAX_RADIUS} km</span>
        </div>
      </div>

      {/* Quick presets */}
      <div>
        <span className="text-xs font-medium text-charcoal-500 mb-2 block">Raccourcis</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePreset(preset)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                clampedValue === preset
                  ? 'bg-primary-500 text-white'
                  : 'bg-sand-100 text-charcoal-700 hover:bg-sand-300'
              }`}
            >
              {preset} km
            </button>
          ))}
        </div>
      </div>
    </div>
  )
})
