'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wrench, Check, ArrowRight, Loader2, Phone } from 'lucide-react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics/tracking'
import { isValidFrenchPhone, cleanPhone } from '@/lib/validation/phone'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UnclaimedDevisModalProps {
  isOpen: boolean
  onClose: () => void
  specialty: string
  specialtySlug: string
  city: string
  citySlug: string
}

// ---------------------------------------------------------------------------
// Service options (same as UnclaimedQuoteWizard)
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

const URGENCY_OPTIONS = [
  { value: 'urgent', label: 'Urgent', icon: '🔴' },
  { value: 'semaine', label: 'Cette semaine', icon: '🟠' },
  { value: 'flexible', label: 'Flexible', icon: '🟢' },
]

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 40, scale: 0.97 },
}

const stepVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UnclaimedDevisModal({
  isOpen,
  onClose,
  specialty,
  specialtySlug,
  city,
  citySlug,
}: UnclaimedDevisModalProps) {
  const [step, setStep] = useState(1)
  const [serviceType, setServiceType] = useState('')
  const [urgency, setUrgency] = useState('')
  const [telephone, setTelephone] = useState('')
  const [consent, setConsent] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const services = SERVICE_OPTIONS[specialtySlug] || DEFAULT_SERVICES

  const canContinue = serviceType !== '' && urgency !== ''

  // Réf pour suivre si le devis a été soumis (évite de tracker un close après un submit)
  const hasSubmittedRef = useRef(false)

  // Tracking ouverture du modal
  useEffect(() => {
    if (isOpen) {
      hasSubmittedRef.current = false
      trackEvent('unclaimed_devis_modal_open', { specialty, city, source: 'modal' })
    }
  }, [isOpen, specialty, city])

  const resetState = useCallback(() => {
    setStep(1)
    setServiceType('')
    setUrgency('')
    setTelephone('')
    setConsent(false)
    setPhoneError('')
    setSubmitError('')
    setSubmitting(false)
    setSubmitted(false)
  }, [])

  const handleClose = useCallback(() => {
    // Tracker la fermeture uniquement si l'utilisateur n'a pas soumis
    if (!hasSubmittedRef.current) {
      trackEvent('unclaimed_devis_modal_close', { specialty, city, step })
    }
    onClose()
    // Reset after animation
    setTimeout(resetState, 300)
  }, [onClose, resetState, specialty, city, step])

  const handleContinue = useCallback(() => {
    trackEvent('unclaimed_devis_modal_step1', {
      specialty,
      city,
      service: serviceType,
      urgency,
    })
    // Garder l'ancien event pour rétrocompatibilité
    trackEvent('unclaimed_modal_step2', {
      specialty: specialtySlug,
      city: citySlug,
      serviceType,
      urgency,
    })
    setStep(2)
  }, [specialty, city, specialtySlug, citySlug, serviceType, urgency])

  const handleSubmit = useCallback(async () => {
    setPhoneError('')
    setSubmitError('')

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
        urgency,
        telephone: cleanPhone(telephone),
        codePostal: '',
        ville: city,
        description: serviceType,
        nom: 'Rappel',
        consentement: true,
        consent_given_at: new Date().toISOString(),
        source: 'unclaimed_devis_modal',
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

      trackEvent('unclaimed_devis_modal_submit', { specialty, city })
      // Garder l'ancien event pour rétrocompatibilité
      trackEvent('unclaimed_modal_submitted', {
        specialty: specialtySlug,
        city: citySlug,
        serviceType,
        urgency,
      })

      hasSubmittedRef.current = true
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telephone, consent, submitting, specialtySlug, urgency, city, serviceType, citySlug])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-over-modal flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <motion.div
            key="modal-content"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Demande de devis gratuit"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-sand-200 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Wrench className="w-4.5 h-4.5 text-primary-500" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-heading font-bold text-sm text-charcoal-900">
                    ServicesArtisans
                  </p>
                  <p className="text-xs text-charcoal-500">
                    Trouvez un {specialty.toLowerCase()} disponible à {city}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-charcoal-400 hover:text-charcoal-600 hover:bg-sand-100 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {/* Success state */}
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7 text-accent-600" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-2">
                    Demande envoyée !
                  </h3>
                  <p className="text-charcoal-600 text-sm mb-4">
                    Un conseiller vous rappelle rapidement.
                  </p>
                  <a
                    href={PHONE_TEL}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-700"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    Ou appelez-nous : {PHONE_NUMBER}
                  </a>
                </motion.div>
              ) : (
                <>
                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-charcoal-500">
                        Étape {step}/2
                      </span>
                      <span className="text-xs font-semibold text-primary-500">
                        {step === 1 ? 'Votre besoin' : 'On vous rappelle'}
                      </span>
                    </div>
                    <div className="relative h-1.5 bg-sand-200 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-primary-500 rounded-full"
                        initial={false}
                        animate={{ width: step === 1 ? '50%' : '100%' }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Steps */}
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="modal-step-1"
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        {/* Service type */}
                        <h3 className="font-heading text-base font-semibold text-charcoal-800 mb-3">
                          Quel type d&apos;intervention ?
                        </h3>
                        <div className="grid grid-cols-2 gap-2.5 mb-6">
                          {services.map((service) => (
                            <button
                              key={service}
                              type="button"
                              onClick={() => setServiceType(service)}
                              className={`relative rounded-xl border-2 px-3.5 py-3 text-sm font-medium text-left transition-all duration-200 hover:border-primary-400 hover:bg-primary-50 ${
                                serviceType === service
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-sand-200 bg-sand-50 text-charcoal-700'
                              }`}
                            >
                              {serviceType === service && (
                                <span className="absolute top-2 right-2">
                                  <Check className="w-3.5 h-3.5 text-primary-500" />
                                </span>
                              )}
                              {service}
                            </button>
                          ))}
                        </div>

                        {/* Urgency */}
                        <h3 className="font-heading text-base font-semibold text-charcoal-800 mb-3">
                          Quand ?
                        </h3>
                        <div className="flex gap-2.5 mb-6">
                          {URGENCY_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setUrgency(opt.value)}
                              className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-medium text-center transition-all duration-200 hover:border-primary-400 hover:bg-primary-50 ${
                                urgency === opt.value
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-sand-200 bg-sand-50 text-charcoal-700'
                              }`}
                            >
                              <span className="mr-1">{opt.icon}</span>
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        {/* Continue button */}
                        <button
                          type="button"
                          onClick={handleContinue}
                          disabled={!canContinue}
                          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base shadow-cta transition-all duration-200"
                        >
                          Continuer
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="modal-step-2"
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        {/* Phone input */}
                        <h3 className="font-heading text-base font-semibold text-charcoal-800 mb-3">
                          Votre téléphone <span className="text-red-500">*</span>
                        </h3>
                        <input
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          maxLength={14}
                          value={telephone}
                          onChange={(e) => {
                            // Live formatting : garde max 10 chiffres, affiche "06 12 34 56 78".
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                            const formatted = digits.replace(
                              /^(\d{2})(\d{2})?(\d{2})?(\d{2})?(\d{2})?$/,
                              (_, a, b, c, d, f) => [a, b, c, d, f].filter(Boolean).join(' ')
                            )
                            setTelephone(formatted)
                            setPhoneError('')
                          }}
                          placeholder="06 12 34 56 78"
                          aria-required="true"
                          aria-invalid={!!phoneError}
                          aria-describedby={phoneError ? 'phone-error' : undefined}
                          className={`w-full rounded-xl border bg-sand-50 px-4 py-3.5 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all duration-200 text-base ${
                            phoneError ? 'border-red-400' : 'border-sand-300'
                          }`}
                        />
                        {phoneError && (
                          <p
                            id="phone-error"
                            className="text-red-700 text-sm mt-1.5 font-medium"
                            role="alert"
                          >
                            {phoneError}
                          </p>
                        )}

                        {/* Consent */}
                        <div className="flex items-start gap-3 mt-4">
                          <input
                            id="modal-consent"
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => {
                              setConsent(e.target.checked)
                              setSubmitError('')
                            }}
                            className="mt-1 h-4 w-4 rounded border-sand-300 text-primary-500 focus:ring-primary-400"
                          />
                          <label
                            htmlFor="modal-consent"
                            className="text-xs text-charcoal-500 leading-relaxed"
                          >
                            J&apos;accepte d&apos;être mis en relation avec des artisans
                            partenaires.{' '}
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
                          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mt-4">
                            {submitError}
                          </div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="px-5 py-3.5 rounded-xl border-2 border-sand-300 text-charcoal-700 font-semibold text-sm hover:border-sand-400 hover:bg-sand-50 transition-all duration-200"
                          >
                            Retour
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-base shadow-cta transition-all duration-200"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                Envoi...
                              </>
                            ) : (
                              <>
                                Recevoir mes devis gratuits
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                              </>
                            )}
                          </button>
                        </div>

                        {/* Trust line */}
                        <p className="text-xs text-charcoal-400 text-center mt-4">
                          Rappel rapide · Gratuit · Sans engagement
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
