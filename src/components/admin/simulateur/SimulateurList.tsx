'use client'

/**
 * Liste paginée des estimations simulateur (admin).
 * Filtres : catégorie ANAH, parcours, zone, dates, consent RGPD, search public_id.
 */

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { useAdminFetch } from '@/hooks/admin/useAdminFetch'

interface Estimation {
  id: string
  public_id: string
  created_at: string
  categorie_anah: 'bleu' | 'jaune' | 'violet' | 'rose'
  parcours: 'geste' | 'accompagne'
  zone_climatique: 'H1' | 'H2' | 'H3'
  code_postal: string
  surface_m2: number
  rfr: number
  mpr_total: number | null
  cee_fourchette_bas: number | null
  cee_fourchette_haut: number | null
  reste_a_charge_bas: number | null
  reste_a_charge_haut: number | null
  pipedrive_deal_id: string | null
  consent_rgpd: boolean
  barometre_version: string
}

interface Response {
  success: boolean
  data: Estimation[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

type SortBy = 'created_at' | 'mpr_total' | 'reste_a_charge_bas'
type SortOrder = 'asc' | 'desc'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatEuro(n: number | null): string {
  if (n === null || n === undefined) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

const CATEGORIE_COLORS: Record<Estimation['categorie_anah'], string> = {
  bleu: 'bg-blue-50 text-blue-700',
  jaune: 'bg-yellow-50 text-yellow-800',
  violet: 'bg-purple-50 text-purple-700',
  rose: 'bg-pink-50 text-pink-700',
}

export default function SimulateurList() {
  const [page, setPage] = useState(1)
  const [categorie, setCategorie] = useState<'all' | Estimation['categorie_anah']>('all')
  const [parcours, setParcours] = useState<'all' | Estimation['parcours']>('all')
  const [zone, setZone] = useState<'all' | Estimation['zone_climatique']>('all')
  const [consent, setConsent] = useState<'all' | 'true' | 'false'>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const params = new URLSearchParams({
    page: String(page),
    limit: '20',
    sortBy,
    sortOrder,
    consent,
  })
  if (categorie !== 'all') params.set('categorie', categorie)
  if (parcours !== 'all') params.set('parcours', parcours)
  if (zone !== 'all') params.set('zone', zone)
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  if (search) params.set('search', search)

  const { data, isLoading, error, mutate } = useAdminFetch<Response>(
    `/api/admin/simulateur?${params.toString()}`
  )

  const rows = data?.data ?? []
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const exportUrl = `/api/admin/simulateur/export?${params.toString()}`

  const toggleSort = (key: SortBy) => {
    if (sortBy === key) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    else {
      setSortBy(key)
      setSortOrder('desc')
    }
    setPage(1)
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Simulateur — Estimations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Traçabilité &lt; 30s — liste + export + détail avec formule_debug
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={exportUrl}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#E07040] rounded-lg hover:bg-[#c9603a]"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
          <button
            onClick={() => mutate()}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Rafraîchir
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <select
            value={categorie}
            onChange={(e) => {
              setCategorie(e.target.value as typeof categorie)
              setPage(1)
            }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
          >
            <option value="all">Toutes catégories</option>
            <option value="bleu">Bleu</option>
            <option value="jaune">Jaune</option>
            <option value="violet">Violet</option>
            <option value="rose">Rose</option>
          </select>
          <select
            value={parcours}
            onChange={(e) => {
              setParcours(e.target.value as typeof parcours)
              setPage(1)
            }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
          >
            <option value="all">Tous parcours</option>
            <option value="geste">Geste</option>
            <option value="accompagne">Accompagné</option>
          </select>
          <select
            value={zone}
            onChange={(e) => {
              setZone(e.target.value as typeof zone)
              setPage(1)
            }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
          >
            <option value="all">Toutes zones</option>
            <option value="H1">H1</option>
            <option value="H2">H2</option>
            <option value="H3">H3</option>
          </select>
          <select
            value={consent}
            onChange={(e) => {
              setConsent(e.target.value as typeof consent)
              setPage(1)
            }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
          >
            <option value="all">Consent RGPD</option>
            <option value="true">Avec consent</option>
            <option value="false">Sans consent</option>
          </select>
          <form onSubmit={handleSearch} className="flex gap-1 col-span-2 md:col-span-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="EST-..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg"
              />
            </div>
          </form>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Du</label>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Au</label>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">{error.message}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#E07040]" />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200">
          <p className="font-medium">Aucune estimation</p>
          <p className="text-sm mt-1">Aucun résultat pour ces filtres.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    <button onClick={() => toggleSort('created_at')} className="hover:text-gray-900">
                      Date {sortBy === 'created_at' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Public ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Catégorie</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Parcours</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Zone</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">
                    <button onClick={() => toggleSort('mpr_total')} className="hover:text-gray-900">
                      MPR {sortBy === 'mpr_total' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">CEE haut</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">
                    <button onClick={() => toggleSort('reste_a_charge_bas')} className="hover:text-gray-900">
                      RAC bas {sortBy === 'reste_a_charge_bas' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Pipedrive</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/simulateur/${row.public_id}`}
                        className="text-[#E07040] hover:underline font-mono text-xs"
                      >
                        {row.public_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORIE_COLORS[row.categorie_anah]}`}
                      >
                        {row.categorie_anah}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{row.parcours}</td>
                    <td className="px-4 py-3 text-gray-700">{row.zone_climatique}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                      {formatEuro(row.mpr_total)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {formatEuro(row.cee_fourchette_haut)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                      {formatEuro(row.reste_a_charge_bas)}
                    </td>
                    <td className="px-4 py-3">
                      {row.pipedrive_deal_id ? (
                        <a
                          href={`https://servicesartisans.pipedrive.com/deal/${row.pipedrive_deal_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          #{row.pipedrive_deal_id}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
                {pagination.total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
