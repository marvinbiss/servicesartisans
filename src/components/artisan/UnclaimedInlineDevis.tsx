'use client'

import { useState, useCallback } from 'react'
import { Loader2, CheckCircle, Phone, Shield } from 'lucide-react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics/tracking'
import { isValidFrenchPhone, cleanPhone } from '@/lib/validation/phone'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UnclaimedInlineDevisProps {
  specialty: string
  specialtySlug: string
  city: string
  citySlug: string
}

// ---------------------------------------------------------------------------
// Service options (same as UnclaimedDevisModal)
// ---------------------------------------------------------------------------

const SERVICE_OPTIONS: Record<string, string[]> = {
  plombier: [
    "Fuite d'eau",
    'Installation sanitaire',
    'Débouchage',
    'Chauffe-eau',
    'Robinetterie',
    'Autre',
  ],
  electricien: [
    'Panne électrique',
    'Installation',
    'Mise aux normes',
    'Éclairage',
    'Tableau électrique',
    'Autre',
  ],
  serrurier: [
    'Porte claquée',
    'Serrure cassée',
    'Changement de serrure',
    'Double de clé',
    'Blindage de porte',
    'Autre',
  ],
  chauffagiste: [
    'Panne chaudière',
    'Entretien chaudière',
    'Radiateur',
    'Plancher chauffant',
    'Pompe à chaleur',
    'Autre',
  ],
  peintre: [
    'Peinture intérieure',
    'Peinture extérieure',
    'Ravalement façade',
    'Papier peint',
    'Plafond',
    'Autre',
  ],
  menuisier: ['Porte intérieure', 'Fenêtre', 'Escalier', 'Placard sur mesure', 'Parquet', 'Autre'],
  carreleur: [
    'Carrelage sol',
    'Carrelage mural',
    'Faïence salle de bain',
    'Terrasse extérieure',
    'Autre',
  ],
  couvreur: [
    'Fuite toiture',
    'Rénovation toiture',
    'Gouttière',
    'Isolation toiture',
    'Démoussage',
    'Autre',
  ],
  macon: ['Mur / Cloison', 'Fondation', 'Terrasse', 'Extension', 'Démolition', 'Autre'],
  jardinier: ['Tonte pelouse', 'Taille haie', 'Élagage', 'Aménagement jardin', 'Clôture', 'Autre'],
}

const DEFAULT_SERVICES = [
  'Réparation',
  'Installation',
  'Entretien',
  'Rénovation',
  'Diagnostic',
  'Autre',
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UnclaimedInlineDevis({
  specialty,
  specialtySlug,
  city,
  citySlug,
}: UnclaimedInlineDevisProps) {
  const [serviceType, setServiceType] = useState('')
  const [telephone, setTelephone] = useState('')
  const [consent, setConsent] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const services = SERVICE_OPTIONS[specialtySlug] || DEFAULT_SERVICES

  const handleSubmit = useCallback(async () => {
    setPhoneError('')
    setSubmitError('')

    if (!serviceType) {
      setSubmitError("Veuillez sélectionner un type d'intervention")
      return
    }

    if (!isValidFrenchPhone(telephone)) {
      setPhoneError('Numéro de téléphone français invalide')
      return
    }

    if (!consent) {
      setSubmitError('Veuillez accepter la mise en relation')
      return
    }

    if (submitting) return
    setSubmitting(true)

    try {
      const payload = {
        service: specialtySlug,
        telephone: cleanPhone(telephone),
        codePostal: '',
        ville: city,
        description: serviceType,
        nom: 'Rappel',
        consentement: true,
        consent_given_at: new Date().toISOString(),
        source: 'unclaimed_inline_devis',
      }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const res = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setSubmitError(body?.error || 'Une erreur est survenue. Veuillez réessayer.')
        return
      }

      trackEvent('unclaimed_inline_devis_submit', {
        source: 'unclaimed_inline_devis',
        specialty: specialtySlug,
        city: citySlug,
      })

      setSubmitted(true)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setSubmitError('La requête a pris trop de temps. Veuillez réessayer.')
      } else {
        setSubmitError('Erreur de connexion. Vérifiez votre réseau et réessayez.')
      }
    } finally {
      setSubmitting(false)
    }
  }, [serviceType, telephone, consent, submitting, specialtySlug, city, citySlug])

  // Success state
  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-card-hover border border-sand-200 p-6 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-green-600" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-2">Demande envoyée !</h3>
        <p className="text-charcoal-600 text-sm">Un conseiller vous rappelle rapidement.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-card-hover border border-sand-200 p-6">
      {/* Header */}
      <div className="mb-5">
        <h2 className="font-heading text-lg font-bold text-charcoal-900 mb-1">
          Trouvez un {specialty.toLowerCase()} disponible à {city}
        </h2>
        <p className="text-sm text-charcoal-500 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5" aria-hidden="true" />
          Un conseiller vous rappelle rapidement · Gratuit
        </p>
      </div>

      {/* Service type select */}
      <div className="mb-4">
        <label
          htmlFor="inline-service-type"
          className="block text-sm font-semibold text-charcoal-700 mb-2"
        >
          Type d&apos;intervention
        </label>
        <select
          id="inline-service-type"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="w-full rounded-xl border border-sand-300 bg-sand-50 px-4 py-3 text-charcoal-900 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all duration-200"
        >
          <option value="">Sélectionnez une intervention</option>
          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      {/* Phone input */}
      <div className="mb-4">
        <label
          htmlFor="inline-phone"
          className="block text-sm font-semibold text-charcoal-700 mb-2"
        >
          Votre téléphone <span className="text-red-500">*</span>
        </label>
        <input
          id="inline-phone"
          type="tel"
          value={telephone}
          onChange={(e) => {
            setTelephone(e.target.value)
            setPhoneError('')
          }}
          placeholder="06 12 34 56 78"
          aria-required="true"
          aria-invalid={!!phoneError}
          className={`w-full rounded-xl border bg-sand-50 px-4 py-3 text-charcoal-900 placeholder:text-charcoal-400 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all duration-200 ${
            phoneError ? 'border-red-400' : 'border-sand-300'
          }`}
        />
        {phoneError && (
          <p className="text-red-500 text-xs mt-1.5" role="alert">
            {phoneError}
          </p>
        )}
      </div>

      {/* RGPD consent */}
      <div className="flex items-start gap-3 mb-4">
        <input
          id="inline-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked)
            setSubmitError('')
          }}
          className="mt-1 h-4 w-4 rounded border-sand-300 text-primary-500 focus:ring-primary-400"
        />
        <label htmlFor="inline-consent" className="text-xs text-charcoal-500 leading-relaxed">
          J&apos;accepte d&apos;être mis en relation avec des artisans partenaires.{' '}
          <Link
            href="/confidentialite"
            className="text-primary-500 underline hover:text-primary-600"
          >
            Politique de confidentialité
          </Link>
        </label>
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
          {submitError}
        </div>
      )}

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-400 hover:bg-primary-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-base shadow-cta transition-all duration-200"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Envoi...
          </>
        ) : (
          'Être rappelé gratuitement'
        )}
      </button>

      {/* Trust line */}
      <p className="text-xs text-charcoal-400 text-center mt-3 flex items-center justify-center gap-1.5">
        <Shield className="w-3.5 h-3.5" aria-hidden="true" />
        Gratuit · Sans engagement · Réponse rapide
      </p>
    </div>
  )
}
