import { type LucideIcon } from 'lucide-react'

interface CeeKpiCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  /** Texte de variation optionnel, ex: "+12% cette semaine" */
  variation?: {
    text: string
    positive: boolean
  }
}

export function CeeKpiCard({ icon: Icon, label, value, variation }: CeeKpiCardProps) {
  return (
    <div className="bg-white border border-sand-200 shadow-sm rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-sand-100 rounded-lg">
          <Icon className="w-5 h-5 text-charcoal-600" />
        </div>
        <span className="text-sm text-charcoal-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-charcoal-900">{value}</p>
      {variation && (
        <p
          className={`text-xs mt-1 font-medium ${
            variation.positive ? 'text-accent-600' : 'text-red-500'
          }`}
        >
          {variation.text}
        </p>
      )}
    </div>
  )
}
