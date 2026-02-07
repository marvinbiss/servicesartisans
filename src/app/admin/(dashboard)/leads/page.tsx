'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  Users,
  ArrowRight,
  Loader2,
  MapPin,
  Wrench,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface ArtisanRow {
  id: string
  stable_id: string | null
  name: string
  slug: string
  specialty: string
  address_city: string | null
  is_verified: boolean
  last_lead_assigned_at: string | null
}

interface LeadRow {
  id: string
  service_name: string
  city: string | null
  urgency: string
  status: string
  created_at: string
  assignment_count: number
}

interface LeadsData {
  leadsCreated: number
  leadsAssigned: number
  artisans: ArtisanRow[]
  artisanCount: number
  leads: LeadRow[]
  filters: { city: string | null; service: string | null }
}

type ViewTab = 'artisans' | 'leads'

export default function AdminLeadsPage() {
  const [data, setData] = useState<LeadsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('Paris')
  const [service, setService] = useState('Plombier')
  const [tab, setTab] = useState<ViewTab>('leads')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (city) params.set('city', city)
      if (service) params.set('service', service)

      const res = await fetch(`/api/admin/leads?${params}`)
      if (res.ok) {
        setData(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch admin leads:', err)
    } finally {
      setLoading(false)
    }
  }, [city, service])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const urgencyBadge = (u: string) => {
    if (u === 'urgent') return 'bg-red-100 text-red-700'
    if (u === 'tres_urgent') return 'bg-red-200 text-red-800'
    return 'bg-gray-100 text-gray-600'
  }

  const statusBadge = (s: string) => {
    if (s === 'pending') return { text: 'En attente', cls: 'bg-yellow-100 text-yellow-700' }
    if (s === 'sent') return { text: 'Envoyé', cls: 'bg-blue-100 text-blue-700' }
    if (s === 'accepted') return { text: 'Accepté', cls: 'bg-green-100 text-green-700' }
    if (s === 'completed') return { text: 'Terminé', cls: 'bg-green-200 text-green-800' }
    return { text: s, cls: 'bg-gray-100 text-gray-600' }
  }

  // Paginate leads locally
  const allLeads = data?.leads || []
  const totalPages = Math.max(1, Math.ceil(allLeads.length / pageSize))
  const paginatedLeads = allLeads.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Leads — Vue globale</h1>
        <p className="text-gray-500 mb-8">Suivi des leads par ville × métier</p>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paris"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Métier</label>
              <div className="relative">
                <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Plombier"
                />
              </div>
            </div>
            <button
              onClick={() => { fetchData(); setPage(1) }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Search className="w-4 h-4" />
              Filtrer
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : data ? (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Leads créés</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{data.leadsCreated}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ArrowRight className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Leads assignés</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{data.leadsAssigned}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <Users className="w-5 h-5 text-violet-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Artisans actifs</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{data.artisanCount}</p>
              </div>
            </div>

            {/* Tab toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setTab('leads'); setPage(1) }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'leads' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Leads ({allLeads.length})
              </button>
              <button
                onClick={() => setTab('artisans')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'artisans' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Artisans ({data.artisans.length})
              </button>
            </div>

            {/* Leads table */}
            {tab === 'leads' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">
                    Leads — {data.filters.service || 'Tous'} à {data.filters.city || 'Toutes villes'}
                  </h2>
                </div>
                {paginatedLeads.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>Aucun lead trouvé</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-left text-gray-500">
                            <th className="px-6 py-3 font-medium">Service</th>
                            <th className="px-6 py-3 font-medium">Ville</th>
                            <th className="px-6 py-3 font-medium">Urgence</th>
                            <th className="px-6 py-3 font-medium">Statut</th>
                            <th className="px-6 py-3 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {paginatedLeads.map((l) => {
                            const st = statusBadge(l.status)
                            return (
                              <tr key={l.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-900">{l.service_name}</td>
                                <td className="px-6 py-3 text-gray-600">{l.city || '—'}</td>
                                <td className="px-6 py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urgencyBadge(l.urgency)}`}>
                                    {l.urgency}
                                  </span>
                                </td>
                                <td className="px-6 py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                                    {st.text}
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-gray-500">
                                  {new Date(l.created_at).toLocaleDateString('fr-FR')}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-100">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded border disabled:opacity-40"
                        >
                          <ChevronLeft className="w-4 h-4" /> Préc.
                        </button>
                        <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded border disabled:opacity-40"
                        >
                          Suiv. <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Artisans table */}
            {tab === 'artisans' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">
                    Artisans — {data.filters.service || 'Tous'} à {data.filters.city || 'Toutes villes'}
                  </h2>
                </div>
                {data.artisans.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>Aucun artisan trouvé</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-left text-gray-500">
                          <th className="px-6 py-3 font-medium">Nom</th>
                          <th className="px-6 py-3 font-medium">Métier</th>
                          <th className="px-6 py-3 font-medium">Ville</th>
                          <th className="px-6 py-3 font-medium">Vérifié</th>
                          <th className="px-6 py-3 font-medium">Dernier lead</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.artisans.map((a) => (
                          <tr key={a.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3 font-medium text-gray-900">{a.name}</td>
                            <td className="px-6 py-3 text-gray-600">{a.specialty}</td>
                            <td className="px-6 py-3 text-gray-600">{a.address_city || '—'}</td>
                            <td className="px-6 py-3">
                              {a.is_verified ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-3 text-gray-500">
                              {a.last_lead_assigned_at
                                ? new Date(a.last_lead_assigned_at).toLocaleDateString('fr-FR')
                                : 'Jamais'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
