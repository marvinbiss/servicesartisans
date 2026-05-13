'use client'

import { ArrowUpDown } from 'lucide-react'

export type SortOrder = 'default' | 'relevance' | 'name' | 'rating' | 'reviews'

const OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'rating', label: 'Mieux notés' },
  { value: 'reviews', label: "Plus d'avis" },
  { value: 'name', label: 'Nom (A-Z)' },
]

type Props = {
  value: SortOrder
  onChange: (next: SortOrder) => void
  variant?: 'desktop' | 'mobile'
  className?: string
}

export function SortDropdown({ value, onChange, variant = 'desktop', className = '' }: Props) {
  const isDesktop = variant === 'desktop'
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {isDesktop && (
        <ArrowUpDown className="absolute left-3 w-4 h-4 text-charcoal-400 pointer-events-none" />
      )}
      <select
        value={value === 'default' ? 'relevance' : value}
        onChange={(e) => onChange(e.target.value as SortOrder)}
        aria-label="Trier les résultats"
        className={
          isDesktop
            ? 'pl-9 pr-9 py-2 bg-white border border-sand-300 rounded-lg text-sm text-charcoal-800 font-medium focus:ring-2 focus:ring-primary-400 focus:border-primary-400 cursor-pointer hover:border-sand-400 transition-colors appearance-none min-w-[160px]'
            : 'px-3 py-2.5 bg-sand-100 rounded-xl text-sm text-charcoal-700 font-medium min-h-[44px] border-0 focus:ring-2 focus:ring-primary-400'
        }
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
