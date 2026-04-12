'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, CheckCircle, Loader2 } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import { isValidFrenchPhone, cleanPhone } from '@/lib/validation/phone'

interface CallbackRequestProps {
  serviceSlug?: string
  cityName?: string
}

export default function CallbackRequest({ serviceSlug, cityName }: CallbackRequestProps) {
  const [phone, setPhone] = useState('')
  const [consentRgpd, setConsentRgpd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!phone.trim()) {
      setError('Veuillez entrer votre numéro')
      return
    }
    if (!isValidFrenchPhone(phone.trim())) {
      setError('Numéro de téléphone français invalide')
      return
    }
    if (!consentRgpd) {
      setError('Veuillez accepter la politique de confidentialité')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: serviceSlug || 'general',
          telephone: cleanPhone(phone),
          description: 'Demande de rappel',
          urgency: 'semaine',
          ...(cityName && { ville: cityName }),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || "Erreur lors de l'envoi")
      }

      trackEvent('devis_submitted', {
        source: 'callback_request',
        service: serviceSlug || '',
        city: cityName || '',
        value: 30,
        currency: 'EUR',
      })

      setSuccess(true)
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Erreur de connexion. Vérifiez votre internet.')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-green-900">Demande envoyée !</p>
        <p className="text-xs text-green-700 mt-1">Un conseiller vous rappelle rapidement.</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Phone className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-semibold text-amber-900">Me faire rappeler gratuitement</span>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="06 12 34 56 78"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            setError('')
          }}
          style={{ fontSize: '16px' }}
          className={`flex-1 rounded-lg border ${error ? 'border-red-400' : 'border-amber-300'} bg-white px-3 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500`}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Me faire rappeler'}
        </button>
      </form>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
      <label className="flex items-start gap-2 mt-2 cursor-pointer">
        <input
          type="checkbox"
          checked={consentRgpd}
          onChange={(e) => setConsentRgpd(e.target.checked)}
          className="mt-0.5 accent-amber-600"
        />
        <span className="text-[11px] text-amber-900/70">
          J&apos;accepte que mes données soient utilisées pour traiter ma demande et me mettre en
          relation avec des artisans partenaires. Voir notre{' '}
          <Link href="/confidentialite" className="underline text-primary-500">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>
    </div>
  )
}
