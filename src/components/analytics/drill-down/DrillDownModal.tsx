'use client'

import { useState, useMemo } from 'react'
import { X, ChevronRight, TrendingUp, TrendingDown, Download, Calendar } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DrillDownData {
  label: string
  value: number
  change?: number
  children?: DrillDownData[]
}

interface DrillDownModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  metric: string
  data: DrillDownData[]
  timeSeriesData?: { date: string; value: number }[]
  currentPeriod?: string
}

export function DrillDownModal({
  isOpen,
  onClose,
  title,
  metric,
  data,
  timeSeriesData,
  currentPeriod = 'Derniers 30 jours',
}: DrillDownModalProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])
  const [selectedView, setSelectedView] = useState<'breakdown' | 'timeline'>('breakdown')
  const [sortBy, setSortBy] = useState<'value' | 'change'>('value')

  const currentData = useMemo(() => {
    let result = data

    for (const crumb of breadcrumbs) {
      const found = result.find((d) => d.label === crumb)
      if (found?.children) {
        result = found.children
      }
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'value') return b.value - a.value
      return (b.change || 0) - (a.change || 0)
    })
  }, [data, breadcrumbs, sortBy])

  const total = useMemo(() => {
    return currentData.reduce((sum, d) => sum + d.value, 0)
  }, [currentData])

  const handleDrillDown = (label: string) => {
    const item = currentData.find((d) => d.label === label)
    if (item?.children && item.children.length > 0) {
      setBreadcrumbs((prev) => [...prev, label])
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index))
  }

  const formatValue = (value: number) => {
    if (metric.includes('EUR') || metric.includes('Revenu')) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(value)
    }
    if (metric.includes('%')) {
      return `${value.toFixed(1)}%`
    }
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {currentPeriod}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 mt-4 text-sm">
            <button
              onClick={() => setBreadcrumbs([])}
              className="text-blue-600 hover:underline"
            >
              Aperçu
            </button>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb} className="flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => handleBreadcrumbClick(index + 1)}
                  className="text-blue-600 hover:underline"
                >
                  {crumb}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedView('breakdown')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                selectedView === 'breakdown'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              Répartition
            </button>
            {timeSeriesData && (
              <button
                onClick={() => setSelectedView('timeline')}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  selectedView === 'timeline'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300'
                }`}
              >
                Évolution
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'value' | 'change')}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
            >
              <option value="value">Trier par valeur</option>
              <option value="change">Trier par variation</option>
            </select>

            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {selectedView === 'breakdown' && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600">Total</p>
                  <p className="text-2xl font-bold text-blue-700">{formatValue(total)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Éléments</p>
                  <p className="text-2xl font-bold text-gray-700">{currentData.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600">Moyenne</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatValue(total / Math.max(currentData.length, 1))}
                  </p>
                </div>
              </div>

              {/* Bar chart */}
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={currentData.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => formatValue(v)} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => formatValue(value as number)}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#3B82F6"
                      radius={[0, 4, 4, 0]}
                      cursor="pointer"
                      onClick={(data: any) => handleDrillDown(data.label)}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Data table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                        Élément
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                        Valeur
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                        Part
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                        Variation
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((item) => {
                      const percentage = total > 0 ? (item.value / total) * 100 : 0
                      const hasChildren = item.children && item.children.length > 0

                      return (
                        <tr
                          key={item.label}
                          className={`border-t border-gray-100 ${
                            hasChildren ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => hasChildren && handleDrillDown(item.label)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {item.label}
                              </span>
                              {hasChildren && (
                                <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                                  +{item.children!.length}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-medium text-gray-900">
                              {formatValue(item.value)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {item.change !== undefined && (
                              <div
                                className={`flex items-center justify-end gap-1 ${
                                  item.change >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {item.change >= 0 ? (
                                  <TrendingUp className="w-4 h-4" />
                                ) : (
                                  <TrendingDown className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium">
                                  {item.change >= 0 ? '+' : ''}
                                  {item.change.toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-2">
                            {hasChildren && (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {selectedView === 'timeline' && timeSeriesData && (
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => formatValue(v)} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => formatValue(value as number)}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default DrillDownModal
