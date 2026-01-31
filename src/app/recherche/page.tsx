'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search, MapPin, ChevronLeft, ChevronRight, Filter, X,
  Star, Clock, CheckCircle, Calendar, Sliders
} from 'lucide-react'
import ArtisanResultCard from '@/components/ArtisanResultCard'

interface TimeSlot {
  time: string
  available: boolean
}

interface DayAvailability {
  date: string
  dayName: string
  dayNumber: number
  month: string
  slots: TimeSlot[]
}

interface Artisan {
  id: string
  business_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  city: string
  postal_code: string
  address?: string
  specialty: string
  description?: string
  average_rating: number
  review_count: number
  hourly_rate?: number
  is_verified: boolean
  is_premium: boolean
  is_center?: boolean
  team_size?: number
  distance?: number
  accepts_new_clients?: boolean
  intervention_zone?: string
}

interface SearchResult {
  results: Artisan[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  facets?: {
    cities: Array<{ city: string; count: number }>
    ratings: Record<string, number>
  }
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [results, setResults] = useState<SearchResult | null>(null)
  const [availability, setAvailability] = useState<Record<string, DayAvailability[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Search params
  const query = searchParams.get('q') || ''
  const location = searchParams.get('location') || ''
  const service = searchParams.get('service') || ''
  const minRating = searchParams.get('minRating')
  const availability_filter = searchParams.get('availability')
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    fetchResults()
  }, [searchParams])

  const fetchResults = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?${searchParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)

        // Fetch availability for all results
        if (data.results.length > 0) {
          fetchAvailability(data.results.map((a: Artisan) => a.id))
        }
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailability = async (artisanIds: string[]) => {
    try {
      const response = await fetch(
        `/api/availability/slots?artisanIds=${artisanIds.join(',')}&days=5`
      )
      if (response.ok) {
        const data = await response.json()
        setAvailability(data.availability || {})
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error)
    }
  }

  const updateFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to page 1
    router.push(`/recherche?${params.toString()}`)
  }, [searchParams, router])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/recherche?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    const q = formData.get('q') as string
    const loc = formData.get('location') as string
    if (q) params.set('q', q)
    if (loc) params.set('location', loc)
    router.push(`/recherche?${params.toString()}`)
  }

  const getServiceLabel = () => {
    if (service) return service
    if (query) return query
    return 'Artisan'
  }

  const getLocationLabel = () => {
    if (location) return location
    return 'France'
  }

  const activeFiltersCount = [minRating, availability_filter].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={query || service}
                  placeholder="Specialite, nom du professionnel..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="hidden md:block relative w-64">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  defaultValue={location}
                  placeholder="Ou ? (ville, adresse...)"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Rechercher
              </button>
            </div>
            {/* Mobile filter button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden relative p-2.5 border border-gray-300 rounded-lg"
            >
              <Sliders className="w-5 h-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Filtres</h3>

              {/* Availability Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Disponibilite</h4>
                <div className="space-y-2">
                  {[
                    { value: 'today', label: 'Aujourd\'hui' },
                    { value: 'tomorrow', label: 'Demain' },
                    { value: 'week', label: 'Cette semaine' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        updateFilter(
                          'availability',
                          availability_filter === option.value ? null : option.value
                        )
                      }
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        availability_filter === option.value
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Calendar className="w-4 h-4 inline mr-2" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Note minimum</h4>
                <div className="space-y-1">
                  {[5, 4, 3].map((rating) => (
                    <button
                      key={rating}
                      onClick={() =>
                        updateFilter(
                          'minRating',
                          minRating === rating.toString() ? null : rating.toString()
                        )
                      }
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        minRating === rating.toString()
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span>et plus</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cities from facets */}
              {results?.facets?.cities && results.facets.cities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Villes proches</h4>
                  <div className="space-y-1">
                    {results.facets.cities.slice(0, 5).map(({ city, count }) => (
                      <button
                        key={city}
                        onClick={() => updateFilter('location', city)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          location === city
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span>{city}</span>
                        <span className="text-gray-400">({count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams()
                    if (query) params.set('q', query)
                    if (location) params.set('location', location)
                    router.push(`/recherche?${params.toString()}`)
                  }}
                  className="w-full text-sm text-blue-600 hover:underline"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            {/* Results Count & Description */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {results?.pagination.total || 0} resultat{(results?.pagination.total || 0) > 1 ? 's' : ''}
              </h1>
              <p className="text-gray-600">
                Prenez rendez-vous en ligne avec{' '}
                <strong>{getServiceLabel()}</strong> ou des professionnels proposant des
                services de {getServiceLabel()} a <strong>{getLocationLabel()}</strong> ou
                dans les environs
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="flex gap-2">
                          {[...Array(5)].map((_, j) => (
                            <div key={j} className="w-[72px] h-24 bg-gray-100 rounded"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results List */}
            {!isLoading && results && (
              <div className="space-y-4">
                {results.results.map((artisan, index) => (
                  <motion.div
                    key={artisan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <ArtisanResultCard
                      artisan={artisan}
                      availability={availability[artisan.id]}
                    />
                  </motion.div>
                ))}

                {/* Empty State */}
                {results.results.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Aucun resultat trouve
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Essayez de modifier vos criteres de recherche ou elargissez la zone
                      geographique
                    </p>
                    <button
                      onClick={() => router.push('/recherche')}
                      className="text-blue-600 hover:underline"
                    >
                      Voir tous les professionnels
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {results.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5 inline" />
                      Precedent
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, results.pagination.totalPages))].map((_, i) => {
                        let pageNum: number
                        if (results.pagination.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= results.pagination.totalPages - 2) {
                          pageNum = results.pagination.totalPages - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium ${
                              page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === results.pagination.totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                      <ChevronRight className="w-5 h-5 inline" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filtres</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {/* Same filters as sidebar */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Disponibilite</h4>
                <div className="space-y-2">
                  {[
                    { value: 'today', label: 'Aujourd\'hui' },
                    { value: 'tomorrow', label: 'Demain' },
                    { value: 'week', label: 'Cette semaine' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        updateFilter(
                          'availability',
                          availability_filter === option.value ? null : option.value
                        )
                        setShowMobileFilters(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        availability_filter === option.value
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Note minimum</h4>
                <div className="space-y-1">
                  {[5, 4, 3].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => {
                        updateFilter(
                          'minRating',
                          minRating === rating.toString() ? null : rating.toString()
                        )
                        setShowMobileFilters(false)
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        minRating === rating.toString()
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex">
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <span>et plus</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
              >
                Voir les resultats
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
