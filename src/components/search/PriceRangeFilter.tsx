'use client'

import { useState, useEffect } from 'react'
import { Euro } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriceRangeFilterProps {
  minValue?: number
  maxValue?: number
  onChange: (min: number | undefined, max: number | undefined) => void
  minLimit?: number
  maxLimit?: number
  className?: string
}

const PRICE_PRESETS = [
  { label: 'Tous', min: undefined, max: undefined },
  { label: '< 30EUR/h', min: undefined, max: 30 },
  { label: '30-50EUR/h', min: 30, max: 50 },
  { label: '50-80EUR/h', min: 50, max: 80 },
  { label: '> 80EUR/h', min: 80, max: undefined },
]

export function PriceRangeFilter({
  minValue,
  maxValue,
  onChange,
  minLimit = 0,
  maxLimit = 200,
  className,
}: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = useState<string>(minValue?.toString() || '')
  const [localMax, setLocalMax] = useState<string>(maxValue?.toString() || '')

  useEffect(() => {
    setLocalMin(minValue?.toString() || '')
    setLocalMax(maxValue?.toString() || '')
  }, [minValue, maxValue])

  const handleMinChange = (value: string) => {
    setLocalMin(value)
    const num = value ? parseInt(value, 10) : undefined
    if (num === undefined || (!isNaN(num) && num >= minLimit && num <= maxLimit)) {
      onChange(num, maxValue)
    }
  }

  const handleMaxChange = (value: string) => {
    setLocalMax(value)
    const num = value ? parseInt(value, 10) : undefined
    if (num === undefined || (!isNaN(num) && num >= minLimit && num <= maxLimit)) {
      onChange(minValue, num)
    }
  }

  const handlePresetClick = (preset: typeof PRICE_PRESETS[0]) => {
    setLocalMin(preset.min?.toString() || '')
    setLocalMax(preset.max?.toString() || '')
    onChange(preset.min, preset.max)
  }

  const isPresetActive = (preset: typeof PRICE_PRESETS[0]) => {
    return minValue === preset.min && maxValue === preset.max
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRICE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              isPresetActive(preset)
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom range inputs */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
            Min (EUR/h)
          </label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={localMin}
              onChange={(e) => handleMinChange(e.target.value)}
              placeholder="0"
              min={minLimit}
              max={maxLimit}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>

        <span className="text-gray-400 mt-6">—</span>

        <div className="flex-1">
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
            Max (EUR/h)
          </label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={localMax}
              onChange={(e) => handleMaxChange(e.target.value)}
              placeholder="200"
              min={minLimit}
              max={maxLimit}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Visual indicator */}
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full"
          style={{
            marginLeft: `${((minValue || 0) / maxLimit) * 100}%`,
            width: `${(((maxValue || maxLimit) - (minValue || 0)) / maxLimit) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}

export default PriceRangeFilter
