'use client'

/**
 * Client Component — Cours de marché CEE
 * Affiche les cours actuels, un formulaire d'ajout, et l'historique.
 */

import { useState } from 'react'
import { TrendingUp, Plus, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

export interface MarketPrice {
  id: string
  price_type: 'classique' | 'precarite'
  eur_per_mwhc: number
  source: string | null
  effective_date: string
  created_at: string
  created_by: string | null
}

interface Props {
  initialData: MarketPrice[]
}

const PRICE_TYPE_LABELS: Record<string, string> = {
  classique: 'Classique',
  precarite: 'Précarité',
}

export function CoursMarketForm({ initialData }: Props) {
  const [prices, setPrices] = useState<MarketPrice[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [priceType, setPriceType] = useState<'classique' | 'precarite'>('classique')
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('')
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10))

  // Derive current prices (first of each type = most recent)
  const currentClassique = prices.find((p) => p.price_type === 'classique')
  const currentPrecarite = prices.find((p) => p.price_type === 'precarite')

  async function refreshData() {
    try {
      const res = await fetch('/api/admin/cee-market-prices')
      const json = await res.json()
      if (json.success && json.data) {
        setPrices(json.data)
      }
    } catch {
      // Silent refresh failure
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      setError('Le montant doit être un nombre positif')
      return
    }
    if (numAmount > 100) {
      setError('Le montant semble anormalement élevé (>100 €/MWhc)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/cee-market-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price_type: priceType,
          eur_per_mwhc: numAmount,
          source: source || undefined,
          effective_date: effectiveDate,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Erreur lors de la création')
        return
      }

      setSuccess(`Cours ${PRICE_TYPE_LABELS[priceType]} mis à jour : ${numAmount} €/MWhc`)
      setAmount('')
      setSource('')
      await refreshData()
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Cours actuels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PriceCard label="Classique" price={currentClassique} color="blue" />
        <PriceCard label="Précarité" price={currentPrecarite} color="amber" />
      </div>

      {/* Formulaire d'ajout */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un nouveau cours</h2>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price_type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="price_type"
                value={priceType}
                onChange={(e) => setPriceType(e.target.value as 'classique' | 'precarite')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="classique">Classique</option>
                <option value="precarite">Précarité</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="eur_per_mwhc"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Montant (€/MWhc)
              </label>
              <input
                id="eur_per_mwhc"
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="ex: 9.50"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <input
                id="source"
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="ex: Emmy PNCEE mars 2026"
                maxLength={200}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="effective_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date d&apos;effet
              </label>
              <input
                id="effective_date"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Ajouter
            </button>
          </div>
        </form>
      </div>

      {/* Historique */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historique des cours</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left font-medium text-gray-500">Type</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Montant</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Source</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Date d&apos;effet</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Ajouté le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {prices.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.price_type === 'classique'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {PRICE_TYPE_LABELS[p.price_type] ?? p.price_type}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-mono font-medium">
                    {Number(p.eur_per_mwhc).toFixed(2)} €/MWhc
                  </td>
                  <td className="px-6 py-3 text-gray-600">{p.source || '—'}</td>
                  <td className="px-6 py-3 text-gray-600">{p.effective_date}</td>
                  <td className="px-6 py-3 text-gray-400">
                    {new Date(p.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
              {prices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Aucun cours enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------- Sub-components ----------

function PriceCard({
  label,
  price,
  color,
}: {
  label: string
  price: MarketPrice | undefined
  color: 'blue' | 'amber'
}) {
  const bgClass = color === 'blue' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'
  const iconClass = color === 'blue' ? 'text-blue-600' : 'text-amber-600'
  const valueClass = color === 'blue' ? 'text-blue-900' : 'text-amber-900'

  return (
    <div className={`rounded-lg border p-5 ${bgClass}`}>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className={`w-5 h-5 ${iconClass}`} />
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      {price ? (
        <>
          <p className={`text-2xl font-bold ${valueClass}`}>
            {Number(price.eur_per_mwhc).toFixed(2)} €/MWhc
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Depuis le {price.effective_date}
            {price.source ? ` — ${price.source}` : ''}
          </p>
        </>
      ) : (
        <p className="text-lg text-gray-400">Aucune donnée</p>
      )}
    </div>
  )
}
