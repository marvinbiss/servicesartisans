'use client'

import { useState, useCallback } from 'react'
import {
  FileText,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Mail,
  Download,
  Plus,
  X,
  Clock,
  GripVertical,
} from 'lucide-react'

interface ReportWidget {
  id: string
  type: 'chart' | 'kpi' | 'table' | 'text'
  title: string
  config: Record<string, any>
}

interface ReportConfig {
  id?: string
  name: string
  description?: string
  widgets: ReportWidget[]
  dateRange: {
    type: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom'
    startDate?: string
    endDate?: string
  }
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }
}

interface ReportBuilderProps {
  initialConfig?: Partial<ReportConfig>
  onSave?: (config: ReportConfig) => void
  onExport?: (format: 'pdf' | 'csv' | 'xlsx') => void
}

const widgetTypes = [
  { type: 'chart', icon: BarChart3, label: 'Graphique', description: 'Ligne, barres, aire' },
  { type: 'kpi', icon: TrendingUp, label: 'KPI', description: 'Indicateur clé' },
  { type: 'table', icon: FileText, label: 'Tableau', description: 'Données tabulaires' },
  { type: 'text', icon: FileText, label: 'Texte', description: 'Commentaire ou résumé' },
]

const chartOptions = [
  { value: 'revenue', label: 'Revenus' },
  { value: 'bookings', label: 'Réservations' },
  { value: 'views', label: 'Vues profil' },
  { value: 'conversion', label: 'Taux de conversion' },
  { value: 'rating', label: 'Notes et avis' },
  { value: 'response_time', label: 'Temps de réponse' },
]

const dateRangeOptions = [
  { value: 'last_7_days', label: '7 derniers jours' },
  { value: 'last_30_days', label: '30 derniers jours' },
  { value: 'last_90_days', label: '90 derniers jours' },
  { value: 'custom', label: 'Période personnalisée' },
]

export function ReportBuilder({
  initialConfig,
  onSave,
  onExport,
}: ReportBuilderProps) {
  const [config, setConfig] = useState<ReportConfig>({
    name: initialConfig?.name || 'Nouveau rapport',
    description: initialConfig?.description || '',
    widgets: initialConfig?.widgets || [],
    dateRange: initialConfig?.dateRange || { type: 'last_30_days' },
    schedule: initialConfig?.schedule,
  })

  const [activeSection, setActiveSection] = useState<'widgets' | 'schedule' | 'export'>('widgets')
  const [newRecipient, setNewRecipient] = useState('')

  const addWidget = useCallback((type: string) => {
    const newWidget: ReportWidget = {
      id: `widget-${Date.now()}`,
      type: type as ReportWidget['type'],
      title: 'Nouveau widget',
      config: type === 'chart' ? { chartType: 'line', metric: 'revenue' } : {},
    }

    setConfig((prev) => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
    }))
  }, [])

  const removeWidget = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.id !== id),
    }))
  }, [])

  const updateWidget = useCallback((id: string, updates: Partial<ReportWidget>) => {
    setConfig((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    }))
  }, [])

  const addRecipient = useCallback(() => {
    if (!newRecipient || !newRecipient.includes('@')) return

    setConfig((prev) => ({
      ...prev,
      schedule: {
        frequency: prev.schedule?.frequency || 'weekly',
        recipients: [...(prev.schedule?.recipients || []), newRecipient],
      },
    }))
    setNewRecipient('')
  }, [newRecipient])

  const removeRecipient = useCallback((email: string) => {
    setConfig((prev) => ({
      ...prev,
      schedule: prev.schedule
        ? {
            ...prev.schedule,
            recipients: prev.schedule.recipients.filter((r) => r !== email),
          }
        : undefined,
    }))
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
              className="text-xl font-semibold text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent"
              placeholder="Nom du rapport"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave?.(config)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </div>

        <input
          type="text"
          value={config.description}
          onChange={(e) => setConfig((prev) => ({ ...prev, description: e.target.value }))}
          className="w-full text-sm text-gray-500 border-none focus:outline-none focus:ring-0 bg-transparent"
          placeholder="Description du rapport (optionnel)"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'widgets', label: 'Widgets', icon: BarChart3 },
            { id: 'schedule', label: 'Planification', icon: Clock },
            { id: 'export', label: 'Exporter', icon: Download },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Date range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Période
          </label>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={config.dateRange.type}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, type: e.target.value as any },
                }))
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {config.dateRange.type === 'custom' && (
              <>
                <input
                  type="date"
                  value={config.dateRange.startDate || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, startDate: e.target.value },
                    }))
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <span className="text-gray-400">à</span>
                <input
                  type="date"
                  value={config.dateRange.endDate || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, endDate: e.target.value },
                    }))
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </>
            )}
          </div>
        </div>

        {activeSection === 'widgets' && (
          <>
            {/* Widget palette */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ajouter un widget
              </label>
              <div className="grid grid-cols-4 gap-3">
                {widgetTypes.map((widget) => (
                  <button
                    key={widget.type}
                    onClick={() => addWidget(widget.type)}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <widget.icon className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">{widget.label}</span>
                    <span className="text-xs text-gray-500">{widget.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Widget list */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Widgets du rapport ({config.widgets.length})
              </label>

              {config.widgets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun widget ajouté</p>
                  <p className="text-sm text-gray-400">
                    Cliquez sur un type de widget ci-dessus pour commencer
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {config.widgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />

                      <div className="flex-1">
                        <input
                          type="text"
                          value={widget.title}
                          onChange={(e) =>
                            updateWidget(widget.id, { title: e.target.value })
                          }
                          className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                        />

                        {widget.type === 'chart' && (
                          <div className="flex items-center gap-2 mt-2">
                            <select
                              value={widget.config.metric}
                              onChange={(e) =>
                                updateWidget(widget.id, {
                                  config: { ...widget.config, metric: e.target.value },
                                })
                              }
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              {chartOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>

                            <select
                              value={widget.config.chartType}
                              onChange={(e) =>
                                updateWidget(widget.id, {
                                  config: { ...widget.config, chartType: e.target.value },
                                })
                              }
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="line">Ligne</option>
                              <option value="bar">Barres</option>
                              <option value="area">Aire</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {widget.type}
                      </span>

                      <button
                        onClick={() => removeWidget(widget.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeSection === 'schedule' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fréquence d'envoi
              </label>
              <select
                value={config.schedule?.frequency || 'weekly'}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    schedule: {
                      frequency: e.target.value as any,
                      recipients: prev.schedule?.recipients || [],
                    },
                  }))
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destinataires
              </label>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                  placeholder="email@exemple.com"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={addRecipient}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {config.schedule?.recipients.map((email) => (
                  <span
                    key={email}
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {email}
                    <button
                      onClick={() => removeRecipient(email)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'export' && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { format: 'pdf', label: 'PDF', desc: 'Document formaté' },
              { format: 'csv', label: 'CSV', desc: 'Données brutes' },
              { format: 'xlsx', label: 'Excel', desc: 'Feuille de calcul' },
            ].map((option) => (
              <button
                key={option.format}
                onClick={() => onExport?.(option.format as 'pdf' | 'csv' | 'xlsx')}
                className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Download className="w-8 h-8 text-blue-600 mb-2" />
                <span className="font-medium text-gray-900">{option.label}</span>
                <span className="text-xs text-gray-500">{option.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportBuilder
