'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, ArrowLeft, Clock, Shield, Send, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { trackEvent } from '@/lib/analytics/tracking'
import { isValidFrenchPhone, cleanPhone } from '@/lib/validation/phone'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UnclaimedQuoteWizardProps {
  specialty: string
  specialtySlug: string
  city: string
  citySlug: string
}

interface FormData {
  serviceType: string
  urgency: string
  description: string
  nom: string
  telephone: string
  email: string
  consentement: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SERVICE_OPTIONS: Record<string, string[]> = {
  plombier: ['Fuite d\'eau', 'Installation sanitaire', 'Débouchage', 'Chauffe-eau', 'Robinetterie', 'Autre'],
  electricien: ['Panne électrique', 'Installation', 'Mise aux normes', 'Éclairage', 'Tableau électrique', 'Autre'],
  serrurier: ['Porte claquée', 'Serrure cassée', 'Changement de serrure', 'Double de clé', 'Blindage de porte', 'Autre'],
  chauffagiste: ['Panne chaudière', 'Entretien chaudière', 'Radiateur', 'Plancher chauffant', 'Pompe à chaleur', 'Autre'],
  peintre: ['Peinture intérieure', 'Peinture extérieure', 'Ravalement façade', 'Papier peint', 'Plafond', 'Autre'],
  menuisier: ['Porte intérieure', 'Fenêtre', 'Escalier', 'Placard sur mesure', 'Parquet', 'Autre'],
  carreleur: ['Carrelage sol', 'Carrelage mural', 'Faïence salle de bain', 'Terrasse extérieure', 'Autre'],
  couvreur: ['Fuite toiture', 'Rénovation toiture', 'Gouttière', 'Isolation toiture', 'Démoussage', 'Autre'],
  macon: ['Mur / Cloison', 'Fondation', 'Terrasse', 'Extension', 'Démolition', 'Autre'],
  jardinier: ['Tonte pelouse', 'Taille haie', 'Élagage', 'Aménagement jardin', 'Clôture', 'Autre'],
}

const DEFAULT_SERVICES = ['Réparation', 'Installation', 'Entretien', 'Rénovation', 'Diagnostic', 'Autre']

const URGENCY_OPTIONS = [
  { value: 'urgent', label: 'Urgent (sous 24h)', icon: '🔴' },
  { value: 'semaine', label: 'Cette semaine', icon: '🟠' },
  { value: 'mois', label: 'Ce mois-ci', icon: '🟡' },
  { value: 'flexible', label: 'Flexible', icon: '🟢' },
]

const STEP_LABELS = ['Travaux', 'Détails', 'Contact']

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const contactSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  telephone: z.string().refine(
    (val) => isValidFrenchPhone(val),
    'Numéro de téléphone français invalide'
  ),
  email: z.string().email('Adresse email invalide'),
  consentement: z.literal(true, 'Vous devez accepter la politique de confidentialité'),
})

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function UnclaimedQuoteWizard({
  specialty,
  specialtySlug,
  city,
  citySlug,
}: UnclaimedQuoteWizardProps) {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<FormData>({
    serviceType: '',
    urgency: '',
    description: '',
    nom: '',
    telephone: '',
    email: '',
    consentement: false,
  })

  const services = SERVICE_OPTIONS[specialtySlug] || DEFAULT_SERVICES
  const progress = (step / 3) * 100

  // ---- Navigation ----

  const goNext = useCallback(() => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, 3))
    setErrors({})
  }, [])

  const goBack = useCallback(() => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1))
    setErrors({})
  }, [])

  // ---- Handlers ----

  const selectService = useCallback((service: string) => {
    setFormData((prev) => ({ ...prev, serviceType: service }))
    trackEvent('unclaimed_quote_service_selected', {
      specialty: specialtySlug,
      city: citySlug,
      service,
    })
    // Auto-advance after selection
    setTimeout(() => {
      setDirection(1)
      setStep(2)
      setErrors({})
    }, 200)
  }, [specialtySlug, citySlug])

  const selectUrgency = useCallback((urgency: string) => {
    setFormData((prev) => ({ ...prev, urgency }))
  }, [])

  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  // ---- Submit ----

  const handleSubmit = useCallback(async () => {
    const result = contactSchema.safeParse({
      nom: formData.nom,
      telephone: formData.telephone,
      email: formData.email,
      consentement: formData.consentement,
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const field = String(issue.path[0])
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        serviceType: formData.serviceType,
        urgency: formData.urgency,
        description: formData.description,
        nom: formData.nom,
        telephone: cleanPhone(formData.telephone),
        email: formData.email,
        specialty: specialtySlug,
        city: citySlug,
        source: 'unclaimed_artisan_page',
      }

      const res = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Erreur serveur')

      trackEvent('unclaimed_quote_submitted', {
        specialty: specialtySlug,
        city: citySlug,
        serviceType: formData.serviceType,
        urgency: formData.urgency,
      })

      setSubmitted(true)
    } catch {
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' })
    } finally {
      setSubmitting(false)
    }
  }, [formData, specialtySlug, citySlug])

  // ---- Success state ----

  if (submitted) {
    return (
      <section id="devis" className="scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-white rounded-2xl shadow-soft border border-sand-200 p-8 md:p-12 text-center max-w-2xl mx-auto"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-charcoal-900 mb-3">
            Demande envoyée !
          </h3>
          <p className="text-charcoal-600 mb-2">
            Vous recevrez jusqu&apos;à 3 devis de {specialty.toLowerCase()}s
            qualifiés à {city} sous 48h.
          </p>
          <p className="text-sm text-charcoal-400">
            Vérifiez votre boîte email ({formData.email}) et votre téléphone.
          </p>
        </motion.div>
      </section>
    )
  }

  // ---- Render ----

  return (
    <section id="devis" className="scroll-mt-24">
      <div className="bg-white rounded-2xl shadow-soft border border-sand-200 p-6 md:p-10 max-w-2xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 mb-1">
            Recevez 3 devis de {specialty.toLowerCase()}s à {city}
          </h2>
          <p className="text-charcoal-500 text-sm flex items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Gratuit
            </span>
            <span>·</span>
            <span>Sans engagement</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Réponse sous 48h
            </span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-heading font-semibold text-charcoal-600">
              Étape {step}/3
            </span>
            <span className="text-sm font-semibold text-primary-500">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="relative h-2 bg-sand-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step > i + 1
                      ? 'bg-accent-500 text-white'
                      : step === i + 1
                        ? 'bg-primary-500 text-white shadow-cta scale-110'
                        : 'bg-sand-300 text-charcoal-500'
                  }`}
                >
                  {step > i + 1 ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span
                  className={`text-xs hidden sm:inline ${
                    step === i + 1
                      ? 'font-heading font-semibold text-primary-500'
                      : step > i + 1
                        ? 'font-medium text-accent-500'
                        : 'font-medium text-charcoal-400'
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <h3 className="font-heading text-lg font-semibold text-charcoal-800 mb-4">
                Quel type de travaux ?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {services.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => selectService(service)}
                    className={`relative rounded-xl border-2 px-4 py-3.5 text-sm font-medium text-left transition-all duration-200 hover:border-primary-400 hover:bg-primary-50 hover:shadow-sm ${
                      formData.serviceType === service
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                        : 'border-sand-200 bg-sand-50 text-charcoal-700'
                    }`}
                  >
                    {formData.serviceType === service && (
                      <span className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-primary-500" />
                      </span>
                    )}
                    {service}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <h3 className="font-heading text-lg font-semibold text-charcoal-800 mb-4">
                Quand avez-vous besoin de ces travaux ?
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {URGENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => selectUrgency(opt.value)}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-medium text-left transition-all duration-200 hover:border-primary-400 hover:bg-primary-50 ${
                      formData.urgency === opt.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                        : 'border-sand-200 bg-sand-50 text-charcoal-700'
                    }`}
                  >
                    <span className="mr-2">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>

              <div>
                <label
                  htmlFor="unclaimed-description"
                  className="block font-heading text-sm font-semibold text-charcoal-800 mb-2"
                >
                  Décrivez votre besoin{' '}
                  <span className="font-normal text-charcoal-400">(optionnel)</span>
                </label>
                <textarea
                  id="unclaimed-description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Ex : fuite sous l'évier depuis hier, besoin d'un diagnostic..."
                  className="w-full rounded-xl border border-sand-300 bg-sand-50 px-4 py-3 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all duration-200 resize-none"
                />
              </div>

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center justify-center gap-2 border-2 border-sand-300 hover:border-sand-400 text-charcoal-700 font-semibold px-6 py-3 rounded-xl hover:bg-sand-50 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!formData.urgency}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-400 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 transition-all duration-300"
                >
                  Continuer
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <h3 className="font-heading text-lg font-semibold text-charcoal-800 mb-4">
                Vos coordonnées
              </h3>

              <div className="space-y-4">
                {/* Nom */}
                <div>
                  <label htmlFor="unclaimed-nom" className="block font-heading text-sm font-semibold text-charcoal-800 mb-2">
                    Nom complet
                  </label>
                  <input
                    id="unclaimed-nom"
                    type="text"
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    placeholder="Jean Dupont"
                    className={`w-full rounded-xl border bg-sand-50 px-4 py-3 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all duration-200 ${
                      errors.nom ? 'border-red-400' : 'border-sand-300'
                    }`}
                  />
                  {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
                </div>

                {/* Telephone */}
                <div>
                  <label htmlFor="unclaimed-telephone" className="block font-heading text-sm font-semibold text-charcoal-800 mb-2">
                    Téléphone
                  </label>
                  <input
                    id="unclaimed-telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                    placeholder="06 12 34 56 78"
                    className={`w-full rounded-xl border bg-sand-50 px-4 py-3 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all duration-200 ${
                      errors.telephone ? 'border-red-400' : 'border-sand-300'
                    }`}
                  />
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="unclaimed-email" className="block font-heading text-sm font-semibold text-charcoal-800 mb-2">
                    Email
                  </label>
                  <input
                    id="unclaimed-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="jean@exemple.fr"
                    className={`w-full rounded-xl border bg-sand-50 px-4 py-3 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all duration-200 ${
                      errors.email ? 'border-red-400' : 'border-sand-300'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* RGPD */}
                <div className="flex items-start gap-3">
                  <input
                    id="unclaimed-consent"
                    type="checkbox"
                    checked={formData.consentement}
                    onChange={(e) => handleInputChange('consentement', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-sand-300 text-primary-500 focus:ring-primary-400"
                  />
                  <label htmlFor="unclaimed-consent" className="text-xs text-charcoal-500 leading-relaxed">
                    J&apos;accepte que mes données soient transmises à des artisans qualifiés pour recevoir des devis, conformément à la{' '}
                    <a href="/confidentialite" target="_blank" rel="noopener noreferrer" className="text-primary-500 underline hover:text-primary-600">
                      politique de confidentialité
                    </a>.
                  </label>
                </div>
                {errors.consentement && <p className="text-red-500 text-xs -mt-2">{errors.consentement}</p>}

                {/* Submit error */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    {errors.submit}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center justify-center gap-2 border-2 border-sand-300 hover:border-sand-400 text-charcoal-700 font-semibold px-6 py-3 rounded-xl hover:bg-sand-50 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-400 hover:bg-primary-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold px-6 py-3.5 rounded-xl shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 transition-all duration-300"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Recevoir mes devis gratuits
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
