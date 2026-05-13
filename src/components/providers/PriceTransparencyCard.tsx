'use client'

import { Wallet, Info } from 'lucide-react'
import { useMemo } from 'react'
import { getSpecialtyHourlyRange, formatHourlyRange } from '@/lib/data/specialty-pricing'

type Provider = {
  hourly_rate_min?: number | null
  hourly_rate_max?: number | null
}

type Props = {
  providers: Provider[]
  specialty: string | null | undefined
  serviceName: string
  locationName: string
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

export function PriceTransparencyCard({ providers, specialty, serviceName, locationName }: Props) {
  const computed = useMemo(() => {
    const minVals: number[] = []
    const maxVals: number[] = []
    for (const p of providers) {
      const lo =
        typeof p.hourly_rate_min === 'number' && p.hourly_rate_min > 0 ? p.hourly_rate_min : null
      const hi =
        typeof p.hourly_rate_max === 'number' && p.hourly_rate_max > 0 ? p.hourly_rate_max : null
      if (lo !== null) minVals.push(lo)
      if (hi !== null) maxVals.push(hi)
    }
    if (minVals.length < 3 || maxVals.length < 3) return null
    return {
      min: median(minVals),
      max: median(maxVals),
      sampleSize: Math.min(minVals.length, maxVals.length),
    }
  }, [providers])

  const benchmark = useMemo(() => getSpecialtyHourlyRange(specialty), [specialty])

  const isReal = computed !== null
  const range = isReal ? { min: computed.min, max: computed.max } : benchmark
  const label = isReal
    ? `Tarif observé sur ${computed.sampleSize} artisans à ${locationName}`
    : `Tarif moyen ${serviceName.toLowerCase()} (FFB/Capeb 2026)`

  return (
    <section
      className="mx-4 mb-3 bg-white border border-sand-300 rounded-2xl px-4 py-3"
      aria-labelledby="price-transparency-heading"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Wallet className="w-4 h-4 text-primary-600" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h2
            id="price-transparency-heading"
            className="text-sm font-bold text-charcoal-900 mb-0.5"
          >
            {formatHourlyRange(range)}
          </h2>
          <p className="text-xs text-charcoal-500 leading-tight">{label}</p>
        </div>
      </div>
      <p className="mt-2 text-2xs text-charcoal-400 flex items-start gap-1">
        <Info className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <span>Main d&apos;œuvre HT — hors fournitures et déplacement.</span>
      </p>
    </section>
  )
}
