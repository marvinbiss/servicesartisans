'use client'

import { useState } from 'react'

const REQUEST_TYPES = [
  { value: 'access', label: 'Accès à mes données' },
  { value: 'rectification', label: 'Rectification de mes données' },
] as const

export default function GdprAccessForm() {
  const [form, setForm] = useState({
    requestType: 'access' as 'access' | 'rectification',
    name: '',
    email: '',
    siret: '',
    description: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/gdpr/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.requestType,
          name: form.name.trim(),
          email: form.email.trim(),
          siret: form.siret.trim() || undefined,
          description: form.description.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMessage(data.error || 'Une erreur est survenue.')
        return
      }

      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMessage('Erreur de connexion. Veuillez réessayer.')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-charcoal-900 mb-2">Demande envoyée</h3>
        <p className="text-charcoal-600">
          Votre demande a bien été enregistrée. Vous recevrez un accusé de réception sous 48h et une
          réponse complète sous 30 jours maximum.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Request type */}
      <div>
        <label htmlFor="requestType" className="block text-sm font-medium text-charcoal-700 mb-1">
          Type de demande <span className="text-red-500">*</span>
        </label>
        <select
          id="requestType"
          value={form.requestType}
          onChange={(e) =>
            setForm({ ...form, requestType: e.target.value as 'access' | 'rectification' })
          }
          className="w-full rounded-lg border border-sand-400 px-4 py-2.5 text-charcoal-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
        >
          {REQUEST_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-charcoal-700 mb-1">
          Nom complet <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-sand-400 px-4 py-2.5 text-charcoal-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
          minLength={2}
          placeholder="Jean Dupont"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-sand-400 px-4 py-2.5 text-charcoal-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
          placeholder="jean.dupont@exemple.fr"
        />
      </div>

      {/* SIRET */}
      <div>
        <label htmlFor="siret" className="block text-sm font-medium text-charcoal-700 mb-1">
          SIRET <span className="text-charcoal-400">(optionnel — si professionnel)</span>
        </label>
        <input
          id="siret"
          type="text"
          value={form.siret}
          onChange={(e) => setForm({ ...form, siret: e.target.value })}
          className="w-full rounded-lg border border-sand-400 px-4 py-2.5 text-charcoal-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="12345678901234"
          maxLength={14}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-charcoal-700 mb-1">
          Description de la demande <span className="text-red-500">*</span>
          {form.requestType === 'rectification' && (
            <span className="text-charcoal-500 font-normal">
              {' '}
              — précisez quelles données corriger
            </span>
          )}
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-sand-400 px-4 py-2.5 text-charcoal-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
          rows={4}
          minLength={10}
          maxLength={2000}
          placeholder={
            form.requestType === 'rectification'
              ? 'Indiquez quelles données sont inexactes et les corrections souhaitées...'
              : 'Décrivez votre demande d’accès à vos données personnelles...'
          }
        />
      </div>

      {/* Error */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Envoi en cours...' : 'Envoyer ma demande'}
      </button>
    </form>
  )
}
