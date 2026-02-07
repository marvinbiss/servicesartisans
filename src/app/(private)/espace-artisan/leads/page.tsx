'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  Clock,
  MapPin,
  Phone,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import Link from 'next/link'

interface LeadData {
  id: string
  service_name: string
  city: string | null
  postal_code: string | null
  description: string
  urgency: string
  client_name: string
  client_phone: string
  created_at: string
  status: string
}

interface Assignment {
  id: string
  status: string
  assigned_at: string
  viewed_at: string | null
  lead: LeadData
}

type StatusFilter = 'all' | 'pending' | 'viewed' | 'quoted' | 'declined'

export default function ArtisanLeadsInbox() {
  const [leads, setLeads] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const fetchLeads = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const response = await fetch('/api/artisan/leads')
      const data = await response.json()

      if (response.ok) {
        setLeads(data.leads || [])
      } else if (response.status === 401) {
        window.location.href = '/connexion?redirect=/espace-artisan/leads'
        return
      } else {
        setError(data.error || 'Erreur lors du chargement')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const urgencyLabel = (u: string) => {
    if (u === 'urgent') return { text: 'Urgent', cls: 'bg-red-100 text-red-700' }
    if (u === 'tres_urgent') return { text: 'Très urgent', cls: 'bg-red-200 text-red-800' }
    return { text: 'Normal', cls: 'bg-gray-100 text-gray-700' }
  }

  const statusLabel = (s: string) => {
    if (s === 'pending') return { text: 'Nouveau', cls: 'bg-blue-100 text-blue-700' }
    if (s === 'viewed') return { text: 'Vu', cls: 'bg-yellow-100 text-yellow-700' }
    if (s === 'quoted') return { text: 'Devis envoyé', cls: 'bg-green-100 text-green-700' }
    if (s === 'declined') return { text: 'Décliné', cls: 'bg-gray-100 text-gray-600' }
    return { text: s, cls: 'bg-gray-100 text-gray-700' }
  }

  const filtered = statusFilter === 'all'
    ? leads
    : leads.filter((a) => a.status === statusFilter)

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusCounts = {
    all: leads.length,
    pending: leads.filter((a) => a.status === 'pending').length,
    viewed: leads.filter((a) => a.status === 'viewed').length,
    quoted: leads.filter((a) => a.status === 'quoted').length,
    declined: leads.filter((a) => a.status === 'declined').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 text-sm text-gray-500">
          <Link href="/espace-artisan" className="hover:text-gray-900">Espace Artisan</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Leads reçus</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Leads reçus</h1>
          <Link
            href="/espace-artisan/dashboard"
            className="text-blue-600 hover:underline text-sm"
          >
            Tableau de bord
          </Link>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'viewed', 'quoted', 'declined'] as StatusFilter[]).map((s) => {
            const labels: Record<StatusFilter, string> = {
              all: 'Tous',
              pending: 'Nouveaux',
              viewed: 'Vus',
              quoted: 'Devis envoyé',
              declined: 'Déclinés',
            }
            return (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1) }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {labels[s]} ({statusCounts[s]})
              </button>
            )
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {paginated.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun lead pour le moment</p>
            <p className="text-gray-400 text-sm mt-2">
              Les demandes de devis vous seront attribuées automatiquement.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginated.map((assignment) => {
                const lead = assignment.lead
                const urg = urgencyLabel(lead.urgency)
                const st = statusLabel(assignment.status)

                return (
                  <Link
                    key={assignment.id}
                    href={`/espace-artisan/leads/${assignment.id}`}
                    className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {lead.service_name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urg.cls}`}>
                            {urg.text}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                            {st.text}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {lead.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(lead.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                          {lead.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {lead.city} {lead.postal_code && `(${lead.postal_code})`}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {lead.client_name}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
