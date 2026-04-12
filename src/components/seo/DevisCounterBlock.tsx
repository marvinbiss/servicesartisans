import { TrendingUp } from 'lucide-react'

interface DevisCounterBlockProps {
  count: number
  serviceName: string
  departmentName: string
}

/**
 * Compact inline banner showing anonymized devis request volume as social proof.
 * Server component — no 'use client'.
 * Shows only if count > 0. Displays demand badges at thresholds.
 */
export default function DevisCounterBlock({
  count,
  serviceName,
  departmentName,
}: DevisCounterBlockProps) {
  if (count <= 0) return null

  const badge = count >= 50 ? 'Très forte demande' : count >= 10 ? 'Forte demande' : null

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-emerald-800">
      <TrendingUp className="h-4 w-4 flex-shrink-0 text-emerald-600" />
      <span>
        <strong>{count}</strong> demande{count > 1 ? 's' : ''} de devis {serviceName} dans le{' '}
        {departmentName} ces 30 derniers jours
      </span>
      {badge && (
        <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold whitespace-nowrap">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          {badge}
        </span>
      )}
    </div>
  )
}
