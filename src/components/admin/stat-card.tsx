interface AdminStatCardProps {
  title: string
  value: number | string
  icon: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function AdminStatCard({ title, value, icon, trend }: AdminStatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-sand-200 p-6">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold text-charcoal-900">{value}</p>
      <p className="text-sm text-charcoal-500">{title}</p>
    </div>
  )
}
