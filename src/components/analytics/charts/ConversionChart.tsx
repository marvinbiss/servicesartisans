'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface ConversionDataPoint {
  period: string
  conversionRate: number
  views: number
  contacts: number
  bookings: number
}

interface ConversionChartProps {
  data: ConversionDataPoint[]
  targetRate?: number
  height?: number
}

export function ConversionChart({
  data,
  targetRate = 10,
  height = 350,
}: ConversionChartProps) {
  const stats = useMemo(() => {
    if (data.length === 0) return { avg: 0, min: 0, max: 0, trend: 0 }

    const rates = data.map((d) => d.conversionRate)
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length
    const min = Math.min(...rates)
    const max = Math.max(...rates)

    // Calculate trend (last 3 periods vs previous 3)
    let trend = 0
    if (data.length >= 6) {
      const recent = rates.slice(-3).reduce((a, b) => a + b, 0) / 3
      const previous = rates.slice(-6, -3).reduce((a, b) => a + b, 0) / 3
      trend = ((recent - previous) / previous) * 100
    }

    return { avg, min, max, trend }
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-3">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Taux de conversion</span>
              <span className="font-bold text-blue-600">
                {item.conversionRate.toFixed(1)}%
              </span>
            </div>
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Vues profil</span>
                <span className="text-gray-700">{item.views}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Contacts</span>
                <span className="text-gray-700">{item.contacts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Réservations</span>
                <span className="text-gray-700">{item.bookings}</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const gradientOffset = useMemo(() => {
    if (data.length === 0) return 0.5

    const rates = data.map((d) => d.conversionRate)
    const max = Math.max(...rates)
    const min = Math.min(...rates)

    if (max <= targetRate) return 0
    if (min >= targetRate) return 1

    return (max - targetRate) / (max - min)
  }, [data, targetRate])

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="conversionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset={gradientOffset} stopColor="#10B981" stopOpacity={0.8} />
              <stop offset={gradientOffset} stopColor="#EF4444" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="period"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E7EB' }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E7EB' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Target reference line */}
          <ReferenceLine
            y={targetRate}
            stroke="#EF4444"
            strokeDasharray="5 5"
            label={{
              value: `Objectif: ${targetRate}%`,
              position: 'right',
              fill: '#EF4444',
              fontSize: 12,
            }}
          />

          {/* Conversion rate area */}
          <Area
            type="monotone"
            dataKey="conversionRate"
            name="Taux de conversion"
            stroke="#3B82F6"
            strokeWidth={3}
            fill="url(#areaFill)"
            dot={{
              fill: '#3B82F6',
              strokeWidth: 2,
              r: 4,
              stroke: '#fff',
            }}
            activeDot={{
              fill: '#3B82F6',
              strokeWidth: 2,
              r: 6,
              stroke: '#fff',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 font-medium">Moyenne</p>
          <p className="text-lg font-bold text-blue-700">
            {stats.avg.toFixed(1)}%
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-green-600 font-medium">Maximum</p>
          <p className="text-lg font-bold text-green-700">
            {stats.max.toFixed(1)}%
          </p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <p className="text-xs text-amber-600 font-medium">Minimum</p>
          <p className="text-lg font-bold text-amber-700">
            {stats.min.toFixed(1)}%
          </p>
        </div>
        <div
          className={`rounded-lg p-3 text-center ${
            stats.trend >= 0 ? 'bg-emerald-50' : 'bg-red-50'
          }`}
        >
          <p
            className={`text-xs font-medium ${
              stats.trend >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            Tendance
          </p>
          <p
            className={`text-lg font-bold ${
              stats.trend >= 0 ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            {stats.trend >= 0 ? '+' : ''}
            {stats.trend.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  )
}

export default ConversionChart
