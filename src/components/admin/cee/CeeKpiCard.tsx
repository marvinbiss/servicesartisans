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
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {variation && (
        <p
          className={`text-xs mt-1 font-medium ${
            variation.positive ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
          {variation.text}
        </p>
      )}
    </div>
  )
}
