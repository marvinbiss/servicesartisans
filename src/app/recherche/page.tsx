'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search, MapPin, ChevronLeft, ChevronRight, X,
  Star, Calendar, Sliders, Shield, Sparkles, Users, TrendingUp
} from 'lucide-react'
import ArtisanResultCard from '@/components/ArtisanResultCard'
import { PopularServicesLinks, PopularCitiesLinks, popularServices } from '@/components/InternalLinks'

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
      {/* Premium Search Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white/90">Artisans vérifiés</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white/90">4.8/5 satisfaction</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/90">Réponse en 2h</span>
            </div>
          </div>

          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-2">
                <div className="flex items-center gap-2">
                  <Link href="/" className="p-2 text-white/70 hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="q"
                      defaultValue={query || service}
                      placeholder="Spécialité, nom du professionnel..."
                      className="w-full pl-10 pr-4 py-3 bg-transparent text-white placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                  <div className="hidden md:block w-px h-8 bg-white/20" />
                  <div className="hidden md:block relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="location"
                      defaultValue={location}
                      placeholder="Où ? (ville, adresse...)"
                      className="w-full pl-10 pr-4 py-3 bg-transparent text-white placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25"
                  >
                    Rechercher
                  </button>
                  {/* Mobile filter button */}
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(true)}
                    className="md:hidden relative p-3 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    <Sliders className="w-5 h-5" />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Filtres</h3>
              </div>

              {/* Availability Filter */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Disponibilité
                </h4>
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
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        availability_filter === option.value
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-gray-400" />
                  Note minimum
                </h4>
                <div className="space-y-2">
                  {[5, 4, 3].map((rating) => (
                    <button
                      key={rating}
                      onClick={() =>
                        updateFilter(
                          'minRating',
                          minRating === rating.toString() ? null : rating.toString()
                        )
                      }
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                        minRating === rating.toString()
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-lg shadow-amber-500/25'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating
                                ? minRating === rating.toString()
                                  ? 'text-white fill-white'
                                  : 'text-amber-400 fill-amber-400'
                                : minRating === rating.toString()
                                  ? 'text-white/40'
                                  : 'text-gray-300'
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
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Villes proches
                  </h4>
                  <div className="space-y-2">
                    {results.facets.cities.slice(0, 5).map(({ city, count }) => (
                      <button
                        key={city}
                        onClick={() => updateFilter('location', city)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                          location === city
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="font-medium">{city}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          location === city ? 'bg-white/20' : 'bg-gray-200'
                        }`}>
                          {count}
                        </span>
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
                  className="w-full py-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  Effacer les filtres
                </button>
              )}

              {/* Liens rapides - Maillage interne */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Parcourir</h4>
                <div className="space-y-2 text-sm">
                  <Link href="/services" className="block text-gray-600 hover:text-blue-600 py-1">
                    Tous les services
                  </Link>
                  <Link href="/villes" className="block text-gray-600 hover:text-blue-600 py-1">
                    Toutes les villes
                  </Link>
                  <Link href="/regions" className="block text-gray-600 hover:text-blue-600 py-1">
                    Par région
                  </Link>
                  <Link href="/departements" className="block text-gray-600 hover:text-blue-600 py-1">
                    Par département
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            {/* Results Count & Description */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {results?.pagination.total || 0} résultat{(results?.pagination.total || 0) > 1 ? 's' : ''}
                </h1>
              </div>
              <p className="text-gray-600">
                Prenez rendez-vous en ligne avec{' '}
                <strong className="text-gray-900">{getServiceLabel()}</strong> ou des professionnels proposant des
                services de {getServiceLabel()} à <strong className="text-gray-900">{getLocationLabel()}</strong> ou
                dans les environs
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="flex gap-2">
                          {[...Array(5)].map((_, j) => (
                            <div key={j} className="w-[72px] h-24 bg-gray-100 rounded-xl"></div>
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

                {/* Empty State avec Maillage Interne */}
                {results.results.length === 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8">
                    <div className="text-center mb-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-blue-500" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Aucun résultat trouvé
                      </h2>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Essayez de modifier vos critères de recherche ou parcourez nos services et villes
                      </p>
                      <button
                        onClick={() => router.push('/recherche')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
                      >
                        <Sparkles className="w-5 h-5" />
                        Voir tous les professionnels
                      </button>
                    </div>

                    {/* Suggestions - Maillage interne */}
                    <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                      <PopularServicesLinks showTitle={true} limit={6} />
                      <PopularCitiesLinks showTitle={true} limit={8} />
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {results.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 inline mr-1" />
                      Précédent
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
                            className={`w-11 h-11 rounded-xl font-medium transition-all ${
                              page === pageNum
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                                : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
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
                      className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 transition-colors"
                    >
                      Suivant
                      <ChevronRight className="w-5 h-5 inline ml-1" />
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto"
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-blue-900">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                Filtres
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {/* Same filters as sidebar */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Disponibilité
                </h4>
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
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        availability_filter === option.value
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-gray-400" />
                  Note minimum
                </h4>
                <div className="space-y-2">
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                        minRating === rating.toString()
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex">
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${
                            minRating === rating.toString()
                              ? 'text-white fill-white'
                              : 'text-amber-400 fill-amber-400'
                          }`} />
                        ))}
                      </div>
                      <span>et plus</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25"
              >
                Voir les résultats
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
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-500 font-medium">Chargement...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
