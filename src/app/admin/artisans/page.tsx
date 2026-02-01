'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit2,
  Ban,
  CheckCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Briefcase,
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

export default function AdminProvidersPage() {
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'suspended'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProviders()
  }, [page, filter, search])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        filter,
        search,
      })
      const response = await fetch(`/api/admin/providers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (providerId: string, action: 'verify' | 'suspend' | 'activate') => {
    try {
      const updates: Record<string, unknown> = {}
      if (action === 'verify') updates.is_verified = true
      if (action === 'suspend') updates.is_active = false
      if (action === 'activate') updates.is_active = true

      const response = await fetch(`/api/admin/providers/${providerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Refresh the list to show updated status
        await fetchProviders()
      } else {
        console.error('Action failed:', data.error || data.message)
        alert(`Erreur: ${data.error || data.message || 'Action échouée'}`)
      }
    } catch (error) {
      console.error('Action failed:', error)
      alert('Erreur de connexion')
    }
  }

  // Mock data for demo
  const mockProviders: Provider[] = [
    {
      id: '1',
      company_name: 'Plomberie Pro Paris',
      slug: 'plomberie-pro-paris',
      email: 'contact@plomberiepro.fr',
      phone: '01 23 45 67 89',
      city: 'Paris',
      region: 'Île-de-France',
      service_type: 'Plombier',
      is_verified: true,
      is_active: true,
      subscription_type: 'premium',
      rating_average: 4.8,
      review_count: 156,
      created_at: '2024-01-15',
    },
    {
      id: '2',
      company_name: 'Électricité Express',
      slug: 'electricite-express',
      email: 'info@elecexpress.fr',
      phone: '01 98 76 54 32',
      city: 'Lyon',
      region: 'Auvergne-Rhône-Alpes',
      service_type: 'Électricien',
      is_verified: true,
      is_active: true,
      subscription_type: 'basic',
      rating_average: 4.5,
      review_count: 89,
      created_at: '2024-02-20',
    },
    {
      id: '3',
      company_name: 'Serrurerie 24/7',
      slug: 'serrurerie-247',
      email: 'urgence@serrurerie247.fr',
      phone: '06 12 34 56 78',
      city: 'Marseille',
      region: "Provence-Alpes-Côte d'Azur",
      service_type: 'Serrurier',
      is_verified: false,
      is_active: true,
      subscription_type: 'free',
      rating_average: 0,
      review_count: 0,
      created_at: '2024-03-01',
    },
  ]

  // Afficher les vrais providers, pas les mock data
  const displayProviders = providers

  const getStatusBadge = (provider: Provider) => {
    if (!provider.is_active) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Suspendu</span>
    }
    if (!provider.is_verified) {
      return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">En attente</span>
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Vérifié</span>
  }

  const getSubscriptionBadge = (type: string) => {
    const colors: Record<string, string> = {
      premium: 'bg-violet-100 text-violet-700',
      basic: 'bg-blue-100 text-blue-700',
      free: 'bg-gray-100 text-gray-700',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[type] || colors.free}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Artisans</h1>
          <p className="text-gray-500 mt-1">Gérez les profils et vérifications des artisans</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, ville..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'verified', 'pending', 'suspended'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
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
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : displayProviders.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun artisan</h3>
              <p className="text-gray-500 mb-4">Commencez par importer des artisans depuis SIRENE</p>
              <a
                href="/admin/import"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Importer des artisans
              </a>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
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
                    {displayProviders.map((provider) => (
                      <tr key={provider.id} className="hover:bg-gray-50">
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
                              <div className="mt-1 text-sm text-gray-400">
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
                            <span className="text-gray-900">{provider.city}</span>
                          </div>
                          <p className="text-sm text-gray-500">{provider.region}</p>
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
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/artisans/${provider.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Voir le profil"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => router.push(`/admin/artisans/${provider.id}/edit`)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              title="Modifier"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            {!provider.is_verified && (
                              <button
                                onClick={() => handleAction(provider.id, 'verify')}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                title="Vérifier"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                            {provider.is_active ? (
                              <button
                                onClick={() => handleAction(provider.id, 'suspend')}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Suspendre"
                              >
                                <Ban className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(provider.id, 'activate')}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                title="Réactiver"
                              >
                                <CheckCircle className="w-5 h-5" />
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
                  Page {page} sur {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
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
