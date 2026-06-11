'use client'

/**
 * Détail / édition d'un devis-light.
 * - brouillon : édition complète (DevisForm) + action « Envoyer » + suppression.
 * - envoyé et au-delà : lecture seule + lien client + statut.
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Send,
  Trash2,
  Link as LinkIcon,
  Check,
} from 'lucide-react'
import { DevisForm, type DevisFormInitial } from '@/components/devis/DevisForm'
import { DevisStatusBadge } from '@/components/devis/DevisStatusBadge'
import { FinancingBadge } from '@/components/devis/FinancingBadge'
import { InvoiceAcomptePanel } from '@/components/devis/InvoiceAcomptePanel'
import { getFinancingPartner } from '@/lib/financing/partners'
import { FinancingCta } from '@/components/financing/FinancingCta'
import {
  formatEUR,
  acompteAmount,
  type QuoteStatus,
  type FinancingRail,
  type QuoteClientType,
} from '@/lib/devis'

type QuoteLine = {
  id: string
  designation: string
  quantite: number
  unite: string
  prix_unitaire_ht: number
  tva_rate: number
  total_ligne_ht: number
  ordre: number
}

type Quote = {
  id: string
  numero: string | null
  status: QuoteStatus
  client_type: QuoteClientType
  client_nom: string | null
  client_email: string | null
  client_telephone: string | null
  client_siren: string | null
  acompte_pct: number
  notes: string | null
  valid_until: string | null
  total_ht: number
  total_tva: number
  total_ttc: number
  financing_rail: FinancingRail
  access_token: string | null
  created_at: string
  lines: QuoteLine[]
}

export default function DevisDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acting, setActing] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchQuote = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/artisan/quotes/${id}`)
      const data = await res.json()
      if (res.ok && data.success) {
        setQuote(data.quote)
      } else if (res.status === 401) {
        window.location.href = `/connexion?redirect=/espace-artisan/devis/${id}`
      } else {
        setError(data?.error?.message ?? 'Devis introuvable')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchQuote()
  }, [fetchQuote])

  const transition = async (to: QuoteStatus) => {
    setActing(true)
    setError(null)
    try {
      const res = await fetch(`/api/artisan/quotes/${id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data?.error?.message ?? 'Action impossible')
        return
      }
      await fetchQuote()
    } catch {
      setError('Erreur de connexion')
    } finally {
      setActing(false)
    }
  }

  const remove = async () => {
    if (!confirm('Supprimer ce brouillon ? Cette action est définitive.')) return
    setActing(true)
    try {
      const res = await fetch(`/api/artisan/quotes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/espace-artisan/devis')
        router.refresh()
        return
      }
      const data = await res.json()
      setError(data?.error?.message ?? 'Suppression impossible')
    } catch {
      setError('Erreur de connexion')
    } finally {
      setActing(false)
    }
  }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/mon-devis/${token}`
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" aria-hidden="true" />
      </div>
    )
  }

  if (error && !quote) {
    return (
      <div className="max-w-3xl mx-auto">
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
        <Link
          href="/espace-artisan/devis"
          className="inline-flex items-center gap-1.5 text-sm text-primary-600 mt-4"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Retour à mes devis
        </Link>
      </div>
    )
  }

  if (!quote) return null

  const isDraft = quote.status === 'brouillon'

  if (isDraft) {
    const initial: DevisFormInitial = {
      client_type: quote.client_type,
      client_nom: quote.client_nom,
      client_email: quote.client_email,
      client_telephone: quote.client_telephone,
      client_siren: quote.client_siren,
      acompte_pct: quote.acompte_pct,
      notes: quote.notes,
      valid_until: quote.valid_until,
      lines: [...quote.lines]
        .sort((a, b) => a.ordre - b.ordre)
        .map((l) => ({
          designation: l.designation,
          quantite: l.quantite,
          unite: l.unite,
          prix_unitaire_ht: l.prix_unitaire_ht,
          tva_rate: l.tva_rate,
        })),
    }
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link
              href="/espace-artisan/devis"
              className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-700 mb-2"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Mes devis
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-charcoal-900 font-heading">
                Modifier le devis
              </h1>
              <DevisStatusBadge status={quote.status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={remove}
              disabled={acting}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" /> Supprimer
            </button>
            <button
              type="button"
              onClick={() => transition('envoye')}
              disabled={acting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {acting ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="w-4 h-4" aria-hidden="true" />
              )}
              Envoyer
            </button>
          </div>
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

        <DevisForm mode="edit" quoteId={quote.id} initial={initial} />
      </div>
    )
  }

  // Lecture seule (envoyé et au-delà)
  const sortedLines = [...quote.lines].sort((a, b) => a.ordre - b.ordre)
  const acompte = acompteAmount(quote.total_ttc, quote.acompte_pct)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/espace-artisan/devis"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-700 mb-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Mes devis
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-charcoal-900 font-heading">
            {quote.numero ?? 'Devis'}
          </h1>
          <DevisStatusBadge status={quote.status} />
          <FinancingBadge rail={quote.financing_rail} />
        </div>
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

      {quote.access_token && ['envoye', 'vu'].includes(quote.status) && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-primary-800">
            <LinkIcon className="w-4 h-4" aria-hidden="true" />
            Partagez ce lien avec votre client pour qu&apos;il consulte et accepte le devis.
          </div>
          <button
            type="button"
            onClick={() => copyLink(quote.access_token as string)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-700 bg-white border border-primary-300 rounded-lg hover:bg-primary-100"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" /> Copié
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4" aria-hidden="true" /> Copier le lien
              </>
            )}
          </button>
        </div>
      )}

      <section className="bg-white rounded-xl border border-sand-200 p-5">
        <h2 className="font-semibold text-charcoal-900 mb-3">Client</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex justify-between sm:block">
            <dt className="text-charcoal-500">Nom</dt>
            <dd className="text-charcoal-800 font-medium">{quote.client_nom || '—'}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-charcoal-500">Type</dt>
            <dd className="text-charcoal-800 font-medium">
              {quote.client_type === 'pro' ? 'Professionnel' : 'Particulier'}
            </dd>
          </div>
          {quote.client_email && (
            <div className="flex justify-between sm:block">
              <dt className="text-charcoal-500">Email</dt>
              <dd className="text-charcoal-800">{quote.client_email}</dd>
            </div>
          )}
          {quote.client_siren && (
            <div className="flex justify-between sm:block">
              <dt className="text-charcoal-500">SIREN</dt>
              <dd className="text-charcoal-800 tabular-nums">{quote.client_siren}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="bg-white rounded-xl border border-sand-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sand-50 text-charcoal-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-4 py-2">Désignation</th>
              <th className="text-right font-medium px-4 py-2">Qté</th>
              <th className="text-right font-medium px-4 py-2">Prix u. HT</th>
              <th className="text-right font-medium px-4 py-2">TVA</th>
              <th className="text-right font-medium px-4 py-2">Total HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {sortedLines.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-2.5 text-charcoal-800">{l.designation}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {l.quantite} {l.unite}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {formatEUR(l.prix_unitaire_ht)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{l.tva_rate} %</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                  {formatEUR(l.total_ligne_ht)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-sand-200 p-4 space-y-1.5 max-w-xs ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-charcoal-500">Total HT</span>
            <span className="tabular-nums">{formatEUR(quote.total_ht)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-charcoal-500">TVA</span>
            <span className="tabular-nums">{formatEUR(quote.total_tva)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-sand-200 pt-1.5">
            <span>Total TTC</span>
            <span className="tabular-nums">{formatEUR(quote.total_ttc)}</span>
          </div>
          <div className="flex justify-between text-sm text-charcoal-500">
            <span>Acompte {quote.acompte_pct}%</span>
            <span className="tabular-nums">{formatEUR(acompte)}</span>
          </div>
        </div>
      </section>

      {quote.notes && (
        <section className="bg-white rounded-xl border border-sand-200 p-5">
          <h2 className="font-semibold text-charcoal-900 mb-2">Notes</h2>
          <p className="text-sm text-charcoal-600 whitespace-pre-wrap">{quote.notes}</p>
        </section>
      )}

      {quote.status === 'accepte' && <InvoiceAcomptePanel quoteId={quote.id} />}

      {quote.status === 'accepte' &&
        (() => {
          const partner = getFinancingPartner(quote.financing_rail)
          return partner?.audience === 'artisan' ? <FinancingCta partner={partner} /> : null
        })()}
    </div>
  )
}
