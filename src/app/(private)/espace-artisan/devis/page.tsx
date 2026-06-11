'use client'

/**
 * « Mes devis » — liste des devis-light rédigés par l'artisan (table
 * provider_quotes, mig 547). Distinct des « demandes » (leads reçus).
 * Le détail / édition vit sur /espace-artisan/devis/[id].
 */

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Loader2, AlertCircle, ChevronRight, FileText } from 'lucide-react'
import { Pagination } from '@/components/dashboard/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { DevisStatusBadge } from '@/components/devis/DevisStatusBadge'
import { FinancingBadge } from '@/components/devis/FinancingBadge'
import { formatEUR, type QuoteStatus, type FinancingRail, type QuoteClientType } from '@/lib/devis'

type QuoteRow = {
  id: string
  numero: string | null
  client_type: QuoteClientType
  client_nom: string | null
  status: QuoteStatus
  total_ttc: number
  financing_rail: FinancingRail
  created_at: string
  valid_until: string | null
}

const TABS = [
  { key: 'all', label: 'Tous' },
  { key: 'brouillon', label: 'Brouillons' },
  { key: 'envoye', label: 'Envoyés' },
  { key: 'accepte', label: 'Acceptés' },
  { key: 'refuse', label: 'Refusés' },
]

const PAGE_SIZE = 20

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  })
}

export default function MesDevisPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchQuotes = useCallback(async (p: number, st: string) => {
    try {
      setError(null)
      setLoading(true)
      const params = new URLSearchParams({ page: String(p), pageSize: String(PAGE_SIZE) })
      if (st !== 'all') params.set('status', st)
      const res = await fetch(`/api/artisan/quotes?${params}`)
      const data = await res.json()
      if (res.ok && data.success) {
        setQuotes(data.quotes ?? [])
        setTotalPages(data.totalPages ?? 1)
      } else if (res.status === 401) {
        window.location.href = '/connexion?redirect=/espace-artisan/devis'
      } else {
        setError(data?.error?.message ?? 'Erreur lors du chargement')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuotes(page, status)
  }, [fetchQuotes, page, status])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 font-heading">Mes devis</h1>
          <p className="text-charcoal-500 text-sm mt-0.5">
            Rédigez, envoyez et suivez vos devis. Le client peut payer en plusieurs fois.
          </p>
        </div>
        <Link
          href="/espace-artisan/devis/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Nouveau devis
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={status === tab.key}
            onClick={() => {
              setStatus(tab.key)
              setPage(1)
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              status === tab.key
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white text-charcoal-600 border border-sand-200 hover:bg-sand-50 hover:border-sand-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" aria-hidden="true" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white rounded-xl border border-sand-200">
          <EmptyState
            variant="inbox"
            title="Aucun devis"
            description="Créez votre premier devis. Vous pourrez l'envoyer à votre client par lien, et lui proposer le paiement en plusieurs fois."
            action={{ label: 'Créer un devis', href: '/espace-artisan/devis/nouveau' }}
          />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {quotes.map((q) => (
              <Link
                key={q.id}
                href={`/espace-artisan/devis/${q.id}`}
                className="block bg-white rounded-xl border border-sand-200 transition-all hover:shadow-md group"
              >
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <FileText className="w-4 h-4 text-charcoal-400 shrink-0" aria-hidden="true" />
                      <h3 className="font-semibold text-charcoal-900 group-hover:text-primary-600 transition-colors">
                        {q.numero ?? 'Brouillon'}
                      </h3>
                      <DevisStatusBadge status={q.status} />
                      <FinancingBadge rail={q.financing_rail} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-charcoal-500">
                      <span>
                        {q.client_nom || (q.client_type === 'pro' ? 'Client pro' : 'Particulier')}
                      </span>
                      <span>Créé le {formatDate(q.created_at)}</span>
                      {q.valid_until && (
                        <span>Valable jusqu&apos;au {formatDate(q.valid_until)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-charcoal-900 tabular-nums">
                      {formatEUR(q.total_ttc)}
                    </span>
                    <ChevronRight className="w-5 h-5 text-charcoal-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
