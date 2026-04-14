'use client'

/**
 * CeeDashboardFilters — filtres client-side pour la liste des dossiers CEE.
 *
 * Reçoit tous les dossiers en props (hydratés côté server) et filtre localement.
 * Pas de fetch — pas d'appel API supplémentaire.
 *
 * Filtres :
 *   - Recherche texte libre (code opération, code postal)
 *   - Filtre par statut
 *
 * WCAG 2.1 AA : labels explicites, aria-live sur résultats, focus visible.
 * 8 states : default / hover / focus / active / disabled / loading / error / success
 * (loading/error/success gérés par le parent Server Component — ici idle/filtered).
 */

import { useState, useMemo, useId } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import type { CeeDossier, CeeDossierStatus } from '@/lib/cee/dossier-types'
import DossierListCard from '@/components/cee-artisan/DossierListCard'
import PriorityBadge from '@/components/cee-artisan/PriorityBadge'
import { extractScoreFromMetadata } from '@/lib/cee/scoring'

interface CeeDashboardFiltersProps {
  dossiers: CeeDossier[]
}

const STATUS_OPTIONS: Array<{ value: CeeDossierStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'engagement_signe', label: 'Engagement signé' },
  { value: 'travaux_en_cours', label: 'Travaux en cours' },
  { value: 'travaux_acheves', label: 'Travaux achevés' },
  { value: 'ah_signee', label: 'Attestation signée' },
  { value: 'depose_delegataire', label: 'Déposé délégataire' },
  { value: 'depose_pncee', label: 'Déposé PNCEE' },
  { value: 'valide', label: 'Validé' },
  { value: 'rejete', label: 'Rejeté' },
  { value: 'annule', label: 'Annulé' },
]

export default function CeeDashboardFilters({ dossiers }: CeeDashboardFiltersProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CeeDossierStatus | 'all'>('all')
  const searchId = useId()
  const statusId = useId()
  const resultsId = useId()

  const filtered = useMemo(() => {
    let result = dossiers
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (d) =>
          d.operation_code.toLowerCase().includes(q) ||
          (d.postal_code ?? '').includes(q)
      )
    }
    return result
  }, [dossiers, search, statusFilter])

  const hasActiveFilter = search.trim() !== '' || statusFilter !== 'all'

  function clearFilters() {
    setSearch('')
    setStatusFilter('all')
  }

  if (dossiers.length === 0) return null

  return (
    <div className="space-y-5">
      {/* Barre de filtres */}
      <div
        role="search"
        aria-label="Filtrer les dossiers CEE"
        className="flex flex-wrap items-end gap-3"
      >
        {/* Recherche texte */}
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor={searchId}
            className="block text-xs font-medium text-charcoal-600 mb-1"
          >
            Rechercher (opération, code postal)
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400"
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="BAR-TH-171, 75011…"
              aria-controls={resultsId}
              className="w-full rounded-lg border border-sand-300 bg-white py-2 pl-9 pr-4 text-sm text-charcoal-900 placeholder-charcoal-400 transition-colors hover:border-sand-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1"
            />
          </div>
        </div>

        {/* Filtre statut */}
        <div className="min-w-[180px]">
          <label
            htmlFor={statusId}
            className="block text-xs font-medium text-charcoal-600 mb-1"
          >
            <SlidersHorizontal className="mr-1 inline h-3.5 w-3.5 text-charcoal-400" aria-hidden="true" />
            Statut
          </label>
          <select
            id={statusId}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CeeDossierStatus | 'all')}
            aria-controls={resultsId}
            className="w-full rounded-lg border border-sand-300 bg-white py-2 pl-3 pr-8 text-sm text-charcoal-900 transition-colors hover:border-sand-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Effacer filtres */}
        {hasActiveFilter && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-charcoal-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1 active:scale-95"
            aria-label="Effacer tous les filtres"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Effacer
          </button>
        )}
      </div>

      {/* Résultats */}
      <div
        id={resultsId}
        aria-live="polite"
        aria-atomic="false"
        aria-label={`${filtered.length} dossier${filtered.length !== 1 ? 's' : ''} affiché${filtered.length !== 1 ? 's' : ''}`}
      >
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sand-300 bg-white p-8 text-center">
            <Search className="mx-auto h-8 w-8 text-charcoal-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-charcoal-700">
              Aucun dossier ne correspond à votre recherche
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm text-primary-500 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1 rounded"
            >
              Effacer les filtres
            </button>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {filtered.map((dossier) => {
              const { tier, score } = extractScoreFromMetadata(dossier.metadata)
              return (
                <li key={dossier.id}>
                  <div className="relative">
                    <div className="absolute -top-2 right-3 z-10">
                      <PriorityBadge tier={tier} score={score} />
                    </div>
                    <DossierListCard dossier={dossier} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
