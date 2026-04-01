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
  Search,
  Inbox,
  Eye,
  Send,
  BarChart3,
  RefreshCw,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import ArtisanSidebar from '@/components/artisan-dashboard/ArtisanSidebar'
import { URGENCY_META, STATUS_META, type Lead, type AssignmentStatusFilter } from '@/types/leads'
import { StatusTabs } from '@/components/dashboard/StatusTabs'
import { Pagination } from '@/components/dashboard/Pagination'
import { StatCard } from '@/components/dashboard/StatCard'
import { LeadsTrendChart } from '@/components/dashboard/LeadsTrendChart'

interface Assignment {
  id: string
  status: string
  assigned_at: string
  viewed_at: string | null
  lead: Lead
}

type StatusFilter = AssignmentStatusFilter

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "À l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `il y a ${diffD}j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

interface PaginationMeta {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}

interface MonthlyData {
  month: string
  count: number
}

interface StatusCounts {
  all: number
  pending: number
  viewed: number
  quoted: number
  declined: number
}

export default function ArtisanLeadsInbox() {
  const [leads, setLeads] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [artisanCity, setArtisanCity] = useState<string | null>(null)
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1, pageSize: 20, totalPages: 1, totalItems: 0,
  })
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    all: 0, pending: 0, viewed: 0, quoted: 0, declined: 0,
  })
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyData[]>([])
  const pageSize = 20

  // Fetch status counts from the dedicated stats endpoint (once + on refresh)
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/artisan/leads/stats')
      if (!res.ok) return
      const data = await res.json()
      if (data.stats) {
        setStatusCounts({
          all: data.stats.total ?? 0,
          pending: data.stats.pending ?? 0,
          viewed: data.stats.viewed ?? 0,
          quoted: data.stats.quoted ?? 0,
          declined: data.stats.declined ?? 0,
        })
      }
      if (data.monthlyTrend) {
        setMonthlyTrend(data.monthlyTrend)
      }
    } catch {
      // Non-blocking — counts will just stay at 0
    }
  }, [])

  const fetchLeads = useCallback(async (p: number, status: StatusFilter) => {
    try {
      setError(null)
      setLoading(true)
      const params = new URLSearchParams({
        page: String(p),
        pageSize: String(pageSize),
      })
      if (status !== 'all') {
        params.set('status', status)
      }
      const response = await fetch(`/api/artisan/leads?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLeads(data.leads || [])
        if (data.pagination) {
          setPaginationMeta(data.pagination)
        }
        if (data.provider_city) {
          setArtisanCity(data.provider_city)
        }
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
  }, [pageSize])

  // Fetch leads when page or status filter changes
  useEffect(() => {
    fetchLeads(page, statusFilter)
  }, [fetchLeads, page, statusFilter])

  // Fetch stats on mount
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleRefresh = useCallback(() => {
    fetchLeads(page, statusFilter)
    fetchStats()
  }, [fetchLeads, fetchStats, page, statusFilter])

  /** Check if a lead city matches the artisan's city (case-insensitive) */
  const isInZone = (leadCity: string | null): boolean => {
    if (!artisanCity || !leadCity) return false
    return leadCity.toLowerCase().trim() === artisanCity.toLowerCase().trim()
  }

  // Client-side search within current page results
  const filtered = searchQuery
    ? leads.filter((a) => {
        const q = searchQuery.toLowerCase()
        const lead = a.lead
        return (
          lead.service_name.toLowerCase().includes(q) ||
          lead.client_name.toLowerCase().includes(q) ||
          (lead.city || '').toLowerCase().includes(q) ||
          (lead.postal_code || '').includes(q)
        )
      })
    : leads

  const totalPages = searchQuery
    ? Math.max(1, Math.ceil(filtered.length / pageSize))
    : paginationMeta.totalPages
  const paginated = searchQuery ? filtered : leads

  const tabs = [
    { key: 'all', label: 'Tous', count: statusCounts.all },
    { key: 'pending', label: 'Nouveaux', count: statusCounts.pending },
    { key: 'viewed', label: 'Consultés', count: statusCounts.viewed },
    { key: 'quoted', label: 'Devis envoyé', count: statusCounts.quoted },
    { key: 'declined', label: 'Déclinés', count: statusCounts.declined },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <ArtisanSidebar activePage="leads" />
            <div className="lg:col-span-3 flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
                <p className="text-sm text-charcoal-500 mt-2">Chargement des leads...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-charcoal-500">
              <Link href="/espace-artisan" className="hover:text-charcoal-900">Espace Artisan</Link>
              <span>/</span>
              <span className="text-charcoal-900 font-medium">Leads reçus</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/espace-artisan/leads/statistiques"
                className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                Statistiques
              </Link>
              <button
                onClick={() => {
                  const params = new URLSearchParams()
                  if (statusFilter !== 'all') params.set('status', statusFilter)
                  window.location.href = `/api/artisan/leads/export${params.toString() ? `?${params}` : ''}`
                }}
                className="flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-700 border border-sand-200 rounded-lg px-3 py-1.5"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter CSV</span>
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-700"
                aria-label="Rafraîchir les leads"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <ArtisanSidebar activePage="leads" />
          <main id="main-content" className="lg:col-span-3">
        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            title="Total reçus"
            value={statusCounts.all}
            icon={<Inbox className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Nouveaux"
            value={statusCounts.pending}
            icon={<Clock className="w-5 h-5" />}
            color="yellow"
          />
          <StatCard
            title="Devis envoyés"
            value={statusCounts.quoted}
            icon={<Send className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            title="Taux réponse"
            value={`${statusCounts.all > 0 ? Math.round(((statusCounts.quoted + statusCounts.viewed) / statusCounts.all) * 100) : 0}%`}
            icon={<Eye className="w-5 h-5" />}
            color="indigo"
          />
        </div>

        {/* Monthly trend chart */}
        <LeadsTrendChart data={monthlyTrend} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <StatusTabs
              tabs={tabs}
              activeTab={statusFilter}
              onTabChange={(k) => { setStatusFilter(k as StatusFilter); setPage(1) }}
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Rechercher..."
              aria-label="Rechercher dans les leads"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              className="pl-9 pr-4 py-2 w-full sm:w-56 text-sm border border-sand-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Lead list */}
        {paginated.length === 0 ? (
          <div className="bg-white rounded-xl border border-sand-200 p-12 text-center">
            <div className="w-14 h-14 bg-sand-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-charcoal-400" />
            </div>
            <p className="text-charcoal-500 font-medium text-lg">Aucun lead</p>
            <p className="text-charcoal-400 text-sm mt-2">
              {searchQuery ? 'Aucun résultat pour cette recherche.' : 'Les demandes de devis vous seront attribuées automatiquement.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginated.map((assignment) => {
                const lead = assignment.lead
                const urg = URGENCY_META[lead.urgency] || URGENCY_META.normal
                const st = STATUS_META[assignment.status] || STATUS_META.pending
                const isNew = assignment.status === 'pending'

                return (
                  <Link
                    key={assignment.id}
                    href={`/espace-artisan/leads/${assignment.id}`}
                    className={`block bg-white rounded-xl border transition-all hover:shadow-md group ${
                      isNew ? 'border-primary-200 ring-1 ring-primary-100' : 'border-sand-200'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {isNew && (
                              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                            )}
                            <h3 className="font-semibold text-charcoal-900 group-hover:text-primary-600 transition-colors">
                              {lead.service_name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urg.cls}`}>
                              {urg.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                              {st.label}
                            </span>
                          </div>

                          <p className="text-charcoal-600 text-sm mb-3 line-clamp-2">
                            {lead.description}
                          </p>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-charcoal-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatRelative(lead.created_at)}
                            </span>
                            {lead.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {lead.city} {lead.postal_code && `(${lead.postal_code})`}
                              </span>
                            )}
                            {/* Zone badge: show if lead matches artisan city or if different */}
                            {lead.city && artisanCity && (
                              isInZone(lead.city) ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  <MapPin className="w-3 h-3" />
                                  Dans votre zone
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                  <MapPin className="w-3 h-3" />
                                  {lead.city}
                                </span>
                              )
                            )}
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {lead.client_name}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-charcoal-300 group-hover:text-primary-500 flex-shrink-0 mt-1 transition-colors" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </main>
        </div>
      </div>
    </div>
  )
}
