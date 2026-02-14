import { Check } from 'lucide-react'

const TRUST_ITEMS = [
  'Artisans vérifiés',
  'Devis gratuit',
  'Partout en France',
  'Sans engagement',
]

/**
 * Refined trust indicator bar — four key promises with blue check circles.
 * Designed for placement below hero sections. Clean, understated, effective.
 */
export function TrustBar({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-3 ${className}`}>
      {TRUST_ITEMS.map((item) => (
        <div key={item} className="flex items-center gap-2 text-sm text-slate-500">
          <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Check className="w-2.5 h-2.5 text-blue-600" />
          </div>
          {item}
        </div>
      ))}
    </div>
  )
}
