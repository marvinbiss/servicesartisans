'use client'

import { useState } from 'react'
import { Bell, BellOff, Trash2, MapPin, Briefcase, Plus, Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SavedSearch {
  id: string
  name: string
  query?: string
  filters: {
    service?: string
    location?: string
    radius?: number
    minRating?: number
    maxPrice?: number
  }
  frequency: 'instant' | 'daily' | 'weekly' | 'never'
  newResultsCount: number
  lastChecked: string
  createdAt: string
}

interface SavedSearchesProps {
  searches: SavedSearch[]
  onSearch: (search: SavedSearch) => void
  onDelete: (id: string) => void
  onUpdateFrequency: (id: string, frequency: SavedSearch['frequency']) => void
  onCreateNew?: () => void
  className?: string
}

const FREQUENCY_OPTIONS: { value: SavedSearch['frequency']; label: string }[] = [
  { value: 'instant', label: 'Instantané' },
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'never', label: 'Jamais' },
]

export function SavedSearches({
  searches,
  onSearch,
  onDelete,
  onUpdateFrequency,
  onCreateNew,
  className,
}: SavedSearchesProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
  }

  const getFrequencyIcon = (frequency: SavedSearch['frequency']) => {
    return frequency === 'never' ? BellOff : Bell
  }

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-sand-300', className)}>
      <div className="flex items-center justify-between p-4 border-b border-sand-300">
        <h3 className="font-semibold text-charcoal-900">Recherches sauvegardées</h3>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600"
          >
            <Plus className="w-4 h-4" />
            Nouvelle alerte
          </button>
        )}
      </div>

      {searches.length === 0 ? (
        <div className="p-8 text-center">
          <Bell className="w-12 h-12 text-sand-500 mx-auto mb-3" />
          <p className="text-charcoal-500 mb-4">Aucune recherche sauvegardée</p>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Créer une alerte
            </button>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-sand-300">
          {searches.map((search) => {
            const FrequencyIcon = getFrequencyIcon(search.frequency)
            const isEditing = editingId === search.id

            return (
              <li key={search.id} className="p-4">
                <div className="flex items-start gap-3">
                  {/* Click to search */}
                  <button onClick={() => onSearch(search)} className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-charcoal-900">{search.name}</span>
                      {search.newResultsCount > 0 && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-primary-100 text-primary-500 rounded-full">
                          +{search.newResultsCount}
                        </span>
                      )}
                    </div>

                    {/* Filters summary */}
                    <div className="flex flex-wrap gap-2 text-sm text-charcoal-500">
                      {search.filters.service && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {search.filters.service}
                        </span>
                      )}
                      {search.filters.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {search.filters.location}
                          {search.filters.radius && ` (${search.filters.radius}km)`}
                        </span>
                      )}
                    </div>

                    {/* Last checked */}
                    <div className="flex items-center gap-1 mt-1 text-xs text-charcoal-400">
                      <Clock className="w-3 h-3" />
                      Vérifié le {formatDate(search.lastChecked)}
                    </div>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Frequency dropdown */}
                    {isEditing ? (
                      <div className="flex flex-col gap-1 bg-sand-50 rounded-lg p-2">
                        {FREQUENCY_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              onUpdateFrequency(search.id, option.value)
                              setEditingId(null)
                            }}
                            className={cn(
                              'flex items-center gap-2 px-2 py-1 rounded text-sm',
                              search.frequency === option.value
                                ? 'bg-primary-100 text-primary-600'
                                : 'hover:bg-sand-100'
                            )}
                          >
                            {search.frequency === option.value && <Check className="w-3 h-3" />}
                            {option.label}
                          </button>
                        ))}
                        <button
                          onClick={() => setEditingId(null)}
                          className="mt-1 text-xs text-charcoal-500 hover:text-charcoal-700"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingId(search.id)}
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            search.frequency !== 'never'
                              ? 'text-primary-500 hover:bg-primary-50'
                              : 'text-charcoal-400 hover:bg-sand-100'
                          )}
                          title="Modifier les alertes"
                        >
                          <FrequencyIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(search.id)}
                          className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default SavedSearches
