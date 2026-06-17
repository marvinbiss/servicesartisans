'use client'

import { memo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface MonthlyData {
  month: string
  count: number
}

interface LeadsTrendChartProps {
  data: MonthlyData[]
}

const CHART_COLOR = '#E0723F' // primary-400
const CHART_COLOR_CURRENT = '#A23A1F' // primary-600

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-sand-200 rounded-lg px-3 py-2 shadow-md">
      <p className="text-xs text-charcoal-500">{label}</p>
      <p className="text-sm font-semibold text-charcoal-900">
        {payload[0].value} demande{payload[0].value > 1 ? 's' : ''}
      </p>
    </div>
  )
}

export const LeadsTrendChart = memo(function LeadsTrendChart({ data }: LeadsTrendChartProps) {
  if (!data || data.length === 0) return null

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="bg-white rounded-xl border border-sand-200 p-5 mb-6">
      <h3 className="text-sm font-semibold text-charcoal-900 mb-4">Tendance des demandes</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#706A62' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#918C85' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            domain={[0, Math.ceil(maxCount * 1.15)]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200, 73, 42, 0.06)' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === data.length - 1 ? CHART_COLOR_CURRENT : CHART_COLOR}
                fillOpacity={index === data.length - 1 ? 1 : 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
})
