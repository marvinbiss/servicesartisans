'use client'

import { useMemo } from 'react'
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface MetricData {
  metric: string
  yourValue: number
  avgValue: number
  topValue: number
  fullMark: number
}

interface RadarChartProps {
  data: MetricData[]
  height?: number
  showComparison?: boolean
}

export function RadarChart({
  data,
  height = 400,
  showComparison = true,
}: RadarChartProps) {
  const normalizedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      yourValueNorm: (item.yourValue / item.fullMark) * 100,
      avgValueNorm: (item.avgValue / item.fullMark) * 100,
      topValueNorm: (item.topValue / item.fullMark) * 100,
    }))
  }, [data])

  const overallScore = useMemo(() => {
    if (data.length === 0) return 0
    return (
      data.reduce((sum, item) => sum + (item.yourValue / item.fullMark) * 100, 0) /
      data.length
    )
  }, [data])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{item.metric}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">Vous:</span>
              <span className="text-sm font-medium">{item.yourValue}</span>
            </div>
            {showComparison && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-sm text-gray-600">Moyenne:</span>
                  <span className="text-sm font-medium">{item.avgValue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-600">Top 10%:</span>
                  <span className="text-sm font-medium">{item.topValue}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsRadarChart data={normalizedData} cx="50%" cy="50%" outerRadius="80%">
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#374151', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Top performers area (green) */}
          {showComparison && (
            <Radar
              name="Top 10%"
              dataKey="topValueNorm"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}

          {/* Average area (gray) */}
          {showComparison && (
            <Radar
              name="Moyenne"
              dataKey="avgValueNorm"
              stroke="#9CA3AF"
              fill="#9CA3AF"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="3 3"
            />
          )}

          {/* Your performance (blue) */}
          <Radar
            name="Vous"
            dataKey="yourValueNorm"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
            strokeWidth={3}
            dot={{
              fill: '#3B82F6',
              stroke: '#fff',
              strokeWidth: 2,
              r: 4,
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>

      {/* Overall score */}
      <div className="mt-4 flex justify-center">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl px-6 py-4 text-white text-center">
          <p className="text-sm opacity-90">Score global</p>
          <p className="text-3xl font-bold">{overallScore.toFixed(0)}%</p>
          <p className="text-xs opacity-75 mt-1">
            {overallScore >= 80
              ? 'Excellent'
              : overallScore >= 60
              ? 'Bon'
              : overallScore >= 40
              ? 'Moyen'
              : 'À améliorer'}
          </p>
        </div>
      </div>

      {/* Metric breakdown */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {data.map((item) => {
          const percentage = (item.yourValue / item.fullMark) * 100
          const isAboveAvg = item.yourValue >= item.avgValue
          const isTop = item.yourValue >= item.topValue

          return (
            <div
              key={item.metric}
              className={`p-3 rounded-lg border ${
                isTop
                  ? 'bg-emerald-50 border-emerald-200'
                  : isAboveAvg
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <p className="text-xs text-gray-600 truncate">{item.metric}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span
                  className={`text-lg font-bold ${
                    isTop
                      ? 'text-emerald-600'
                      : isAboveAvg
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  {item.yourValue}
                </span>
                <span className="text-xs text-gray-400">/ {item.fullMark}</span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isTop
                      ? 'bg-emerald-500'
                      : isAboveAvg
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RadarChart
