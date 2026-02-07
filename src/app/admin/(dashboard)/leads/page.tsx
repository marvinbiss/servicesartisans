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

interface LeadsData {
  leadsCreated: number
  leadsAssigned: number
  artisans: ArtisanRow[]
  artisanCount: number
  filters: { city: string | null; service: string | null }
}

export default function AdminLeadsPage() {
  const [data, setData] = useState<LeadsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('Paris')
  const [service, setService] = useState('Plombier')

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Leads — Vue admin</h1>
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
              onClick={fetchData}
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

            {/* Artisans table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">
                  Artisans actifs — {data.filters.service || 'Tous'} à {data.filters.city || 'Toutes villes'}
                </h2>
              </div>

              {data.artisans.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>Aucun artisan trouvé pour ce filtre</p>
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
          </>
        ) : null}
      </div>
    </div>
  )
}
