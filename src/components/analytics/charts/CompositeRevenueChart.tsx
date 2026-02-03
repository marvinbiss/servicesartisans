'use client'

import { useMemo } from 'react'
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from 'recharts'

interface RevenueDataPoint {
  period: string
  revenue: number
  bookings: number
  avgTicket: number
  target?: number
}

interface CompositeRevenueChartProps {
  data: RevenueDataPoint[]
  showTarget?: boolean
  height?: number
}

export function CompositeRevenueChart({
  data,
  showTarget = true,
  height = 400,
}: CompositeRevenueChartProps) {
  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      revenueFormatted: item.revenue,
      avgTicketFormatted: item.avgTicket,
    }))
  }, [data])

  const maxRevenue = useMemo(() => {
    return Math.max(...data.map((d) => Math.max(d.revenue, d.target || 0)))
  }, [data])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium text-gray-900">
                {entry.name === 'Réservations'
                  ? entry.value
                  : formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="period"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E7EB' }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E7EB' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(value) => formatCurrency(value)}
            domain={[0, maxRevenue * 1.1]}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E7EB' }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            iconType="circle"
          />

          {/* Revenue bars */}
          <Bar
            yAxisId="left"
            dataKey="revenue"
            name="Revenus"
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
            barSize={30}
          />

          {/* Target line */}
          {showTarget && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="target"
              name="Objectif"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          )}

          {/* Average ticket line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avgTicket"
            name="Panier moyen"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
          />

          {/* Bookings area */}
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="bookings"
            name="Réservations"
            fill="#F59E0B"
            fillOpacity={0.2}
            stroke="#F59E0B"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mt-6 px-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">Total revenus</p>
          <p className="text-xl font-bold text-blue-600">
            {formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Réservations</p>
          <p className="text-xl font-bold text-amber-600">
            {data.reduce((sum, d) => sum + d.bookings, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Panier moyen</p>
          <p className="text-xl font-bold text-emerald-600">
            {formatCurrency(
              data.reduce((sum, d) => sum + d.avgTicket, 0) / data.length
            )}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Croissance</p>
          <p className="text-xl font-bold text-purple-600">
            {data.length > 1
              ? `${(
                  ((data[data.length - 1].revenue - data[0].revenue) /
                    data[0].revenue) *
                  100
                ).toFixed(1)}%`
              : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CompositeRevenueChart
