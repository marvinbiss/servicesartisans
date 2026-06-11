'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, User, Building2 } from 'lucide-react'
import {
  computeTotals,
  acompteAmount,
  resolveFinancingRail,
  formatEUR,
  type QuoteClientType,
} from '@/lib/devis'
import { DevisLignesEditor, emptyLine, type DraftLine } from './DevisLignesEditor'
import { FinancingBadge } from './FinancingBadge'

export type DevisFormInitial = {
  client_type: QuoteClientType
  client_nom?: string | null
  client_email?: string | null
  client_telephone?: string | null
  client_siren?: string | null
  acompte_pct?: number
  notes?: string | null
  valid_until?: string | null
  lines: DraftLine[]
}

type Props = {
  mode: 'create' | 'edit'
  quoteId?: string
  initial?: DevisFormInitial
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-sand-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'

export function DevisForm({ mode, quoteId, initial }: Props) {
  const router = useRouter()
  const [clientType, setClientType] = useState<QuoteClientType>(
    initial?.client_type ?? 'particulier'
  )
  const [clientNom, setClientNom] = useState(initial?.client_nom ?? '')
  const [clientEmail, setClientEmail] = useState(initial?.client_email ?? '')
  const [clientTel, setClientTel] = useState(initial?.client_telephone ?? '')
  const [clientSiren, setClientSiren] = useState(initial?.client_siren ?? '')
  const [acomptePct, setAcomptePct] = useState(initial?.acompte_pct ?? 30)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [validUntil, setValidUntil] = useState(initial?.valid_until ?? '')
  const [lines, setLines] = useState<DraftLine[]>(
    initial?.lines?.length ? initial.lines : [emptyLine()]
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totals = useMemo(() => computeTotals(lines), [lines])
  const rail = resolveFinancingRail(clientType, totals.total_ttc)
  const acompte = acompteAmount(totals.total_ttc, acomptePct)

  const sirenValid = /^\d{9}$/.test(clientSiren.trim())
  const linesValid = lines.some((l) => l.designation.trim() && l.prix_unitaire_ht > 0)
  const canSubmit = linesValid && (clientType !== 'pro' || sirenValid) && !submitting

  const handleSubmit = async () => {
    setError(null)
    if (!canSubmit) {
      setError(
        clientType === 'pro' && !sirenValid
          ? 'SIREN client requis (9 chiffres) pour un client professionnel.'
          : 'Ajoutez au moins une ligne avec une désignation et un prix.'
      )
      return
    }

    const payload = {
      client_type: clientType,
      client_nom: clientNom.trim() || undefined,
      client_email: clientEmail.trim() || undefined,
      client_telephone: clientTel.trim() || undefined,
      client_siren: clientType === 'pro' ? clientSiren.trim() : undefined,
      acompte_pct: acomptePct,
      notes: notes.trim() || undefined,
      valid_until: validUntil || undefined,
      lines: lines.filter((l) => l.designation.trim()).map((l, i) => ({ ...l, ordre: i })),
    }

    setSubmitting(true)
    try {
      const url = mode === 'create' ? '/api/artisan/quotes' : `/api/artisan/quotes/${quoteId}`
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data?.error?.message ?? 'Enregistrement impossible.')
        return
      }
      const id = data.id ?? quoteId
      router.push(`/espace-artisan/devis/${id}`)
      router.refresh()
    } catch {
      setError('Erreur de connexion.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Type de client */}
      <section className="bg-white rounded-xl border border-sand-200 p-5 space-y-4">
        <h2 className="font-semibold text-charcoal-900">Client</h2>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          {(
            [
              { v: 'particulier', label: 'Particulier', icon: User },
              { v: 'pro', label: 'Professionnel', icon: Building2 },
            ] as const
          ).map(({ v, label, icon: Icon }) => {
            const active = clientType === v
            return (
              <button
                key={v}
                type="button"
                onClick={() => setClientType(v)}
                aria-pressed={active}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  active
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-sand-200 text-charcoal-600 hover:bg-sand-50'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-charcoal-700">Nom / Raison sociale</span>
            <input
              type="text"
              value={clientNom}
              onChange={(e) => setClientNom(e.target.value)}
              className={inputCls}
              placeholder={clientType === 'pro' ? 'SARL Dupont' : 'M. Dupont'}
            />
          </label>
          {clientType === 'pro' && (
            <label className="block">
              <span className="text-sm font-medium text-charcoal-700">
                SIREN <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={clientSiren}
                onChange={(e) => setClientSiren(e.target.value.replace(/\D/g, '').slice(0, 9))}
                className={inputCls}
                placeholder="9 chiffres"
                aria-invalid={clientSiren.length > 0 && !sirenValid}
              />
              <span className="text-xs text-charcoal-400 mt-0.5 block">
                Requis pour le paiement différé pro (Aria).
              </span>
            </label>
          )}
          <label className="block">
            <span className="text-sm font-medium text-charcoal-700">Email</span>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className={inputCls}
              placeholder="client@email.fr"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-charcoal-700">Téléphone</span>
            <input
              type="tel"
              value={clientTel}
              onChange={(e) => setClientTel(e.target.value)}
              className={inputCls}
              placeholder="06 12 34 56 78"
            />
          </label>
        </div>
      </section>

      {/* Lignes */}
      <section className="bg-white rounded-xl border border-sand-200 p-5 space-y-4">
        <h2 className="font-semibold text-charcoal-900">Prestations</h2>
        <DevisLignesEditor lines={lines} onChange={setLines} />
      </section>

      {/* Conditions + totaux */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-sand-200 p-5 space-y-4">
          <h2 className="font-semibold text-charcoal-900">Conditions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-charcoal-700">Acompte (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={acomptePct}
                onChange={(e) =>
                  setAcomptePct(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                }
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-charcoal-700">Valable jusqu&apos;au</span>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className={inputCls}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-charcoal-700">Notes (optionnel)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={5000}
              className={inputCls}
              placeholder="Conditions particulières, délais…"
            />
          </label>
        </div>

        <div className="bg-sand-50 rounded-xl border border-sand-200 p-5 space-y-3 h-fit">
          <div className="flex justify-between text-sm">
            <span className="text-charcoal-500">Total HT</span>
            <span className="font-medium tabular-nums">{formatEUR(totals.total_ht)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-charcoal-500">TVA</span>
            <span className="font-medium tabular-nums">{formatEUR(totals.total_tva)}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-sand-200 pt-3">
            <span>Total TTC</span>
            <span className="tabular-nums">{formatEUR(totals.total_ttc)}</span>
          </div>
          <div className="flex justify-between text-sm text-charcoal-500">
            <span>Acompte {acomptePct}%</span>
            <span className="font-medium tabular-nums">{formatEUR(acompte)}</span>
          </div>
          {rail !== 'none' && (
            <div className="pt-2">
              <FinancingBadge rail={rail} />
            </div>
          )}
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-charcoal-600 hover:text-charcoal-800"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {mode === 'create' ? 'Créer le brouillon' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
