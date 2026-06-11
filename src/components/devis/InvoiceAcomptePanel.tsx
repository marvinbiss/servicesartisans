'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Loader2, AlertCircle, Send, CheckCircle2 } from 'lucide-react'
import { formatEUR } from '@/lib/devis'

type Invoice = {
  id: string
  numero: string | null
  type: string
  montant_ttc: number
  status: string
  transmission_status: string
  iopole_status: string | null
  transmitted_at: string | null
}

const TRANSMISSION_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: 'À transmettre', cls: 'bg-sand-100 text-charcoal-600' },
  submitted: { label: 'Transmise', cls: 'bg-primary-100 text-primary-700' },
  delivered: { label: 'Délivrée', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejetée', cls: 'bg-red-100 text-red-700' },
  error: { label: 'Erreur', cls: 'bg-red-100 text-red-700' },
}

export function InvoiceAcomptePanel({ quoteId }: { quoteId: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/artisan/quotes/${quoteId}/invoices`)
      const data = await res.json()
      if (res.ok && data.success) setInvoice((data.invoices?.[0] as Invoice) ?? null)
    } catch {
      /* non bloquant */
    } finally {
      setLoading(false)
    }
  }, [quoteId])

  useEffect(() => {
    load()
  }, [load])

  const create = async () => {
    setError(null)
    setActing(true)
    try {
      const res = await fetch(`/api/artisan/quotes/${quoteId}/invoices`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data?.error?.message ?? 'Création impossible')
        return
      }
      await load()
    } catch {
      setError('Erreur de connexion')
    } finally {
      setActing(false)
    }
  }

  const transmit = async () => {
    if (!invoice) return
    setError(null)
    setActing(true)
    try {
      const res = await fetch(`/api/artisan/invoices/${invoice.id}/transmit`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data?.error?.message ?? 'Transmission impossible')
        return
      }
      await load()
    } catch {
      setError('Erreur de connexion')
    } finally {
      setActing(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-sand-200 p-5 flex items-center gap-2 text-sm text-charcoal-500">
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Chargement de la
        facturation…
      </div>
    )
  }

  const trans = invoice
    ? (TRANSMISSION_LABEL[invoice.transmission_status] ?? TRANSMISSION_LABEL.pending)
    : null

  return (
    <section className="bg-white rounded-xl border border-sand-200 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-charcoal-400" aria-hidden="true" />
        <h2 className="font-semibold text-charcoal-900">Facture d&apos;acompte</h2>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {!invoice ? (
        <>
          <p className="text-sm text-charcoal-500">
            Le devis est accepté. Émettez la facture d&apos;acompte (e-facture conforme via Iopole).
          </p>
          <button
            type="button"
            onClick={create}
            disabled={acting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {acting ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <FileText className="w-4 h-4" aria-hidden="true" />
            )}
            Émettre la facture d&apos;acompte
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-medium text-charcoal-800">{invoice.numero ?? 'Facture'}</span>
              {trans && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${trans.cls}`}>
                  {trans.label}
                </span>
              )}
              {invoice.status === 'payee' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Payée
                </span>
              )}
            </div>
            <span className="font-bold tabular-nums">{formatEUR(invoice.montant_ttc)}</span>
          </div>

          {invoice.transmission_status === 'pending' || invoice.transmission_status === 'error' ? (
            <button
              type="button"
              onClick={transmit}
              disabled={acting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {acting ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="w-4 h-4" aria-hidden="true" />
              )}
              Transmettre via Iopole
            </button>
          ) : (
            <p className="text-sm text-charcoal-500">
              Facture transmise
              {invoice.iopole_status ? ` · statut Iopole : ${invoice.iopole_status}` : ''}.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
