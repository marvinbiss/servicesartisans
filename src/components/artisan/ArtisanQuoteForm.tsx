'use client'

import { useState, useEffect, useRef, useCallback, FormEvent } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  CheckCircle,
  AlertCircle,
  Shield,
  FileText,
  Users,
  Phone,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react'
import { Artisan, getDisplayName } from './types'
import { isValidFrenchPhone, cleanPhone } from '@/lib/validation/phone'
import { trackEvent } from '@/lib/analytics/tracking'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'

interface ArtisanQuoteFormProps {
  artisan: Artisan
}

interface FormData {
  description: string
  urgence: string
  nom: string
  telephone: string
  email: string
}

interface FormErrors {
  description?: string
  nom?: string
  telephone?: string
  email?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DRAFT_KEY = 'sa:inline-devis-draft'

export function ArtisanQuoteForm({ artisan }: ArtisanQuoteFormProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState<FormData>({
    description: '',
    urgence: 'mois',
    nom: '',
    telephone: '',
    email: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [consentRgpd, setConsentRgpd] = useState(false)

  const hasTrackedStart = useRef(false)
  const draftTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const displayName = getDisplayName(artisan)

  const trackingProps = useCallback(
    () => ({
      artisanId: artisan.id,
      artisanName: displayName,
      specialty: artisan.specialty,
      city: artisan.city,
      source: 'inline_form' as const,
    }),
    [artisan.id, artisan.specialty, artisan.city, displayName]
  )

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const draft = JSON.parse(raw) as Partial<FormData>
        setFormData((prev) => ({ ...prev, ...draft }))
      }
    } catch {
      // ignore corrupt draft
    }
  }, [])

  // Save draft to localStorage (debounced)
  const saveDraft = useCallback((data: FormData) => {
    if (draftTimeoutRef.current) clearTimeout(draftTimeoutRef.current)
    draftTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
      } catch {
        // ignore quota errors
      }
    }, 500)
  }, [])

  // Abandon tracking: beforeunload when user has email filled at step 2
  useEffect(() => {
    function handleBeforeUnload() {
      if (
        step === 2 &&
        formData.email.trim() &&
        EMAIL_REGEX.test(formData.email.trim()) &&
        !success
      ) {
        trackEvent('inline_form_abandoned', {
          ...trackingProps(),
          email: formData.email.trim(),
          step_reached: 2,
        })

        // Fire abandon tracking endpoint
        const payload = {
          email: formData.email.trim(),
          service_slug: artisan.specialty_slug || artisan.specialty,
          city_slug: artisan.city_slug || artisan.city,
          step_reached: 2,
        }
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/devis/abandon-tracking', JSON.stringify(payload))
        }
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [
    step,
    formData.email,
    success,
    artisan.specialty_slug,
    artisan.specialty,
    artisan.city_slug,
    artisan.city,
    trackingProps,
  ])

  // Cleanup draft timeout on unmount
  useEffect(() => {
    return () => {
      if (draftTimeoutRef.current) clearTimeout(draftTimeoutRef.current)
    }
  }, [])

  function validateStep1(): boolean {
    const errs: FormErrors = {}
    if (!formData.description.trim()) {
      errs.description = 'Veuillez décrire votre projet'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateStep2(): FormErrors {
    const errs: FormErrors = {}
    if (!formData.nom.trim()) {
      errs.nom = 'Veuillez indiquer votre nom'
    }
    const cleaned = cleanPhone(formData.telephone)
    if (!cleaned) {
      errs.telephone = 'Veuillez indiquer votre téléphone'
    } else if (!isValidFrenchPhone(formData.telephone)) {
      errs.telephone = 'Numéro de téléphone invalide'
    }
    if (!formData.email.trim()) {
      errs.email = 'Veuillez indiquer votre email'
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errs.email = 'Adresse email invalide'
    }
    return errs
  }

  function handleContinue() {
    if (!validateStep1()) return

    trackEvent('inline_form_step1', trackingProps())
    setStep(2)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    const validationErrors = validateStep2()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    if (!consentRgpd) {
      setSubmitError(
        'Veuillez accepter la politique de confidentialité pour envoyer votre demande.'
      )
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: artisan.specialty || 'artisan',
          urgency: formData.urgence,
          description: formData.description.trim(),
          nom: formData.nom.trim(),
          email: formData.email.trim(),
          telephone: cleanPhone(formData.telephone),
          ville: artisan.city || '',
          artisan_id: artisan.id || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Une erreur est survenue')
      }

      trackEvent('inline_form_submitted', trackingProps())

      // Clear draft on success
      try {
        localStorage.removeItem(DRAFT_KEY)
      } catch {
        /* ignore */
      }

      setSuccess(true)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.'
      )
    } finally {
      setLoading(false)
    }
  }

  function updateField(field: keyof FormData, value: string) {
    // Track form_started on first interaction with description
    if (field === 'description' && !hasTrackedStart.current) {
      hasTrackedStart.current = true
      trackEvent('inline_form_started', trackingProps())
    }

    const updated = { ...formData, [field]: value }
    setFormData(updated)
    saveDraft(updated)

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const inputClasses = (field: keyof FormErrors) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 ${
      errors[field]
        ? 'border-red-400 bg-red-50'
        : 'border-sand-200 bg-white hover:border-primary-300'
    }`

  const specialtySlug = artisan.specialty_slug || artisan.specialty
  const citySlug = artisan.city_slug || artisan.city

  return (
    <div className="bg-white rounded-2xl shadow-soft border-2 border-primary-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-400 to-primary-600 px-6 py-5">
        <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5" aria-hidden="true" />
          Devis gratuit en 2 min
        </h2>
        <p className="text-primary-100 text-sm mt-1">Réponse rapide de professionnels qualifiés</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-600" aria-hidden="true" />
              </motion.div>
              <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-2">
                Votre demande a été envoyée !
              </h3>
              <p className="text-charcoal-600 text-sm mb-4">Un conseiller vous rappelle sous 2h</p>

              {/* Phone CTA */}
              <div className="bg-accent-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-charcoal-700 mb-2">
                  Besoin d&apos;une réponse immédiate ?
                </p>
                <a
                  href={PHONE_TEL}
                  className="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  Appelez un conseiller · {PHONE_NUMBER}
                </a>
              </div>

              {/* Cross-sell link */}
              <Link
                href={`/services/${specialtySlug}/${citySlug}`}
                className="text-sm text-primary-600 hover:text-primary-700 underline underline-offset-2"
              >
                Voir d&apos;autres artisans à {artisan.city}
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Social proof */}
              <p className="text-sm text-charcoal-600 mb-4 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-accent-700 flex-shrink-0" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-accent-700">2 conseillers disponibles</span> ·
                  Devis gratuit sans engagement
                </span>
              </p>

              {/* Progress indicator */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-charcoal-500">Étape {step}/2</span>
                </div>
                <div className="h-1 bg-sand-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-500 rounded-full"
                    initial={false}
                    animate={{ width: step === 1 ? '50%' : '100%' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Description */}
                    <div>
                      <label
                        htmlFor="devis-description"
                        className="block text-sm font-medium text-charcoal-700 mb-1"
                      >
                        Description du projet
                      </label>
                      <textarea
                        id="devis-description"
                        rows={3}
                        placeholder="Décrivez votre besoin..."
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        className={inputClasses('description')}
                      />
                      {errors.description && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" aria-hidden="true" />
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Urgence */}
                    <div>
                      <label
                        htmlFor="devis-urgence"
                        className="block text-sm font-medium text-charcoal-700 mb-1"
                      >
                        Urgence
                      </label>
                      <select
                        id="devis-urgence"
                        value={formData.urgence}
                        onChange={(e) => updateField('urgence', e.target.value)}
                        className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2.5 text-sm text-charcoal-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 hover:border-primary-300"
                      >
                        <option value="flexible">Pas urgent</option>
                        <option value="mois">Ce mois-ci</option>
                        <option value="semaine">Cette semaine</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    {/* Continue button */}
                    <motion.button
                      type="button"
                      onClick={handleContinue}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-600/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                    >
                      Continuer
                      <ChevronRight className="w-5 h-5" aria-hidden="true" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="step2"
                    onSubmit={handleSubmit}
                    noValidate
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Back button */}
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors mb-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                      Retour
                    </button>

                    {/* Nom + Téléphone on same row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="devis-nom"
                          className="block text-sm font-medium text-charcoal-700 mb-1"
                        >
                          Nom complet
                        </label>
                        <input
                          id="devis-nom"
                          type="text"
                          placeholder="Votre nom"
                          value={formData.nom}
                          onChange={(e) => updateField('nom', e.target.value)}
                          className={inputClasses('nom')}
                        />
                        {errors.nom && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" aria-hidden="true" />
                            {errors.nom}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="devis-telephone"
                          className="block text-sm font-medium text-charcoal-700 mb-1"
                        >
                          Téléphone
                        </label>
                        <input
                          id="devis-telephone"
                          type="tel"
                          inputMode="tel"
                          placeholder="06 XX XX XX XX"
                          value={formData.telephone}
                          onChange={(e) => updateField('telephone', e.target.value)}
                          className={inputClasses('telephone')}
                        />
                        {errors.telephone && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" aria-hidden="true" />
                            {errors.telephone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="devis-email"
                        className="block text-sm font-medium text-charcoal-700 mb-1"
                      >
                        Email
                      </label>
                      <input
                        id="devis-email"
                        type="email"
                        inputMode="email"
                        placeholder="votre@email.fr"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={inputClasses('email')}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" aria-hidden="true" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Consentement RGPD */}
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={consentRgpd}
                        onChange={(e) => setConsentRgpd(e.target.checked)}
                        className="mt-1 rounded border-sand-200 text-primary-400 focus:ring-primary-400"
                      />
                      <span className="text-xs text-charcoal-500">
                        J&apos;accepte que mes données soient utilisées pour traiter ma demande et
                        me mettre en relation avec des artisans partenaires. Voir notre{' '}
                        <Link href="/confidentialite" className="underline hover:text-primary-500">
                          politique de confidentialité
                        </Link>
                        .
                      </span>
                    </label>

                    {/* Submit error */}
                    {submitError && (
                      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        {submitError}
                      </div>
                    )}

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={loading ? {} : { scale: 1.02 }}
                      whileTap={loading ? {} : { scale: 0.98 }}
                      className="w-full py-3.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-primary-600/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      aria-label={`Envoyer ma demande de devis à ${displayName}`}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Envoi en cours...
                        </span>
                      ) : (
                        <>
                          <Send className="w-5 h-5" aria-hidden="true" />
                          Envoyer ma demande
                        </>
                      )}
                    </motion.button>

                    {/* Trust footer */}
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Shield
                        className="w-3.5 h-3.5 text-accent-500 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <p className="text-xs text-charcoal-500">
                        Gratuit · Sans engagement · Réponse sous 2h
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
