'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Eye,
  Edit2,
  Ban,
  CheckCircle,
  Star,
  MapPin,
  Mail,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Loader2,
  RefreshCw,
  AlertCircle,
  Check,
} from 'lucide-react'

interface Provider {
  id: string
  company_name: string
  slug: string
  email: string
  phone: string
  city: string
  region: string
  service_type: string
  is_verified: boolean
  is_active: boolean
  subscription_type: string
  rating_average: number
  review_count: number
  created_at: string
  source?: string
  siret?: string
}

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">&times;</button>
    </div>
  )
}

export default function AdminProvidersPage() {
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'suspended'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Debounce search
  const [searchDebounce, setSearchDebounce] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounce(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchProviders = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)

      // Clear providers immediately when force refreshing for better UX feedback
      if (forceRefresh) {
        setProviders([])
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        filter,
        search: searchDebounce,
        _t: String(Date.now()), // Cache buster - ensures fresh data from server
      })

      // Disable cache to always get fresh data
      const response = await fetch(`/api/admin/providers?${params}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        cache: 'no-store',
        next: { revalidate: 0 },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProviders(data.providers || [])
          setTotalPages(data.totalPages || 1)
          setTotal(data.total || 0)
        } else {
          console.error('API returned error:', data.error)
          setToast({ message: data.error || 'Erreur lors du chargement', type: 'error' })
        }
      } else {
        console.error('Failed to fetch providers:', response.status)
        setToast({ message: 'Erreur de connexion au serveur', type: 'error' })
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
      setToast({ message: 'Erreur de connexion', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [page, filter, searchDebounce])

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  const handleAction = async (providerId: string, action: 'verify' | 'suspend' | 'activate') => {
    // Prevent double-click
    if (actionLoading) return

    try {
      setActionLoading(providerId)

      const updates: Record<string, unknown> = {}
      if (action === 'verify') updates.is_verified = true
      if (action === 'suspend') updates.is_active = false
      if (action === 'activate') updates.is_active = true

      const response = await fetch(`/api/admin/providers/${providerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(updates),
        cache: 'no-store',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Show success toast
        const actionText = action === 'verify' ? 'référencé' : action === 'suspend' ? 'suspendu' : 'réactivé'
        setToast({ message: `Artisan ${actionText} avec succès!`, type: 'success' })

        // Update local state immediately for better UX
        setProviders(prev => prev.map(p => {
          if (p.id === providerId) {
            return {
              ...p,
              is_verified: action === 'verify' ? true : p.is_verified,
              is_active: action === 'suspend' ? false : action === 'activate' ? true : p.is_active,
            }
          }
          return p
        }))

        // Small delay to ensure database consistency, then force refresh
        await new Promise(resolve => setTimeout(resolve, 300))
        await fetchProviders(true)
      } else {
        console.error('Action failed:', data.error || data.message)
        setToast({ message: `Erreur: ${data.error || data.message || 'Action échouée'}`, type: 'error' })
      }
    } catch (error) {
      console.error('Action failed:', error)
      setToast({ message: 'Erreur de connexion au serveur', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRefresh = () => {
    fetchProviders(true)
  }

  const getStatusBadge = (provider: Provider) => {
    if (!provider.is_active) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Suspendu</span>
    }
    if (!provider.is_verified) {
      return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">En attente</span>
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Vérifié</span>
  }

  const getSubscriptionBadge = (type: string) => {
    const colors: Record<string, string> = {
      premium: 'bg-violet-100 text-violet-700',
      basic: 'bg-blue-100 text-blue-700',
      free: 'bg-gray-100 text-gray-700',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || colors.free}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Artisans</h1>
            <p className="text-gray-500 mt-1">
              {total > 0 ? `${total} artisan${total > 1 ? 's' : ''} au total` : 'Gérez les profils et vérifications des artisans'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, ville, SIRET..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'verified', 'pending', 'suspended'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    if (filter !== f) {
                      // Clear current data to force visual refresh
                      setProviders([])
                      setFilter(f)
                      setPage(1) // Reset to first page on filter change
                    }
                  }}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {f === 'all' ? 'Tous' :
                   f === 'verified' ? 'Vérifiés' :
                   f === 'pending' ? 'En attente' : 'Suspendus'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Providers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading && providers.length === 0 ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
              <p className="text-gray-500 mt-4">Chargement des artisans...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun artisan trouvé</h3>
              <p className="text-gray-500 mb-4">
                {filter !== 'all' || search
                  ? 'Aucun résultat pour cette recherche. Essayez de modifier vos filtres.'
                  : 'Commencez par importer des artisans depuis SIRENE'}
              </p>
              {filter === 'all' && !search && (
                <a
                  href="/admin/import"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Importer des artisans
                </a>
              )}
            </div>
          ) : (
            <>
              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              )}

              <div className="overflow-x-auto relative">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artisan
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Localisation
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avis
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Abonnement
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {providers.map((provider) => (
                      <tr
                        key={provider.id}
                        className={`hover:bg-gray-50 transition-colors ${actionLoading === provider.id ? 'opacity-50' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{provider.company_name}</p>
                              {provider.source === 'sirene-open' && (
                                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">SIRENE</span>
                              )}
                            </div>
                            {provider.email ? (
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                <Mail className="w-3 h-3" />
                                {provider.email}
                              </div>
                            ) : provider.siret ? (
                              <div className="mt-1 text-sm text-gray-400 font-mono">
                                SIRET: {provider.siret}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{provider.service_type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{provider.city || 'Non renseigné'}</span>
                          </div>
                          {provider.region && (
                            <p className="text-sm text-gray-500">{provider.region}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(provider)}</td>
                        <td className="px-6 py-4">
                          {provider.review_count > 0 ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="font-medium">{provider.rating_average}</span>
                              <span className="text-gray-500 text-sm">({provider.review_count})</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Aucun avis</span>
                          )}
                        </td>
                        <td className="px-6 py-4">{getSubscriptionBadge(provider.subscription_type)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {/* View button */}
                            <button
                              onClick={() => router.push(`/admin/artisans/${provider.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Voir le profil"
                            >
                              <Eye className="w-5 h-5" />
                            </button>

                            {/* Edit button */}
                            <button
                              onClick={() => router.push(`/admin/artisans/${provider.id}/edit`)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>

                            {/* Verify button - only show if not verified */}
                            {!provider.is_verified && (
                              <button
                                onClick={() => handleAction(provider.id, 'verify')}
                                disabled={actionLoading === provider.id}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Vérifier cet artisan"
                              >
                                {actionLoading === provider.id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-5 h-5" />
                                )}
                              </button>
                            )}

                            {/* Suspend/Activate button */}
                            {provider.is_active ? (
                              <button
                                onClick={() => handleAction(provider.id, 'suspend')}
                                disabled={actionLoading === provider.id}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Suspendre"
                              >
                                {actionLoading === provider.id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Ban className="w-5 h-5" />
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(provider.id, 'activate')}
                                disabled={actionLoading === provider.id}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Réactiver"
                              >
                                {actionLoading === provider.id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-5 h-5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {page} sur {totalPages} ({total} résultat{total > 1 ? 's' : ''})
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1 || loading}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages || loading}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
