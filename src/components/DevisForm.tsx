'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { services, villes } from '@/lib/data/france'
import { CheckCircle, ArrowRight, ArrowLeft, ChevronDown, Check, MapPin, Users, Shield, Clock } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'

interface FormData {
  service: string
  ville: string
  description: string
  urgence: string
  budget: string
  nom: string
  telephone: string
  email: string
  consentement: boolean
}

const initialFormData: FormData = {
  service: '',
  ville: '',
  description: '',
  urgence: '',
  budget: '',
  nom: '',
  telephone: '',
  email: '',
  consentement: false,
}

const urgencyOptions = [
  { value: 'flexible', label: 'Pas urgent' },
  { value: 'mois', label: 'Ce mois-ci' },
  { value: 'semaine', label: 'Cette semaine' },
  { value: 'urgent', label: 'Urgent (sous 24h)' },
]

const budgetOptions = [
  { value: 'moins-500', label: 'Moins de 500 \u20ac' },
  { value: '500-2000', label: '500\u20112 000 \u20ac' },
  { value: '2000-5000', label: '2 000\u20115 000 \u20ac' },
  { value: 'plus-5000', label: 'Plus de 5 000 \u20ac' },
  { value: 'ne-sais-pas', label: 'Je ne sais pas' },
]

/** Common project types per service for quick selection */
const serviceSubcategories: Record<string, string[]> = {
  plombier: ['Fuite d\'eau', 'Débouchage', 'Chauffe-eau', 'Robinetterie', 'WC / Sanitaires', 'Tuyauterie'],
  electricien: ['Panne électrique', 'Installation prise/interrupteur', 'Tableau électrique', 'Éclairage', 'Mise aux normes', 'Domotique'],
  serrurier: ['Porte claquée', 'Serrure cassée', 'Changement de serrure', 'Double de clé', 'Blindage de porte'],
  chauffagiste: ['Panne chaudière', 'Entretien chaudière', 'Radiateur', 'Plancher chauffant', 'Pompe à chaleur'],
  peintre: ['Peinture intérieure', 'Peinture extérieure', 'Ravalement façade', 'Papier peint', 'Plafond'],
  menuisier: ['Porte intérieure', 'Fenêtre', 'Escalier', 'Placard sur mesure', 'Parquet'],
  carreleur: ['Carrelage sol', 'Carrelage mural', 'Faïence salle de bain', 'Terrasse extérieure'],
  couvreur: ['Fuite toiture', 'Rénovation toiture', 'Gouttière', 'Isolation toiture', 'Démoussage'],
  macon: ['Mur / Cloison', 'Fondation', 'Terrasse', 'Extension', 'Démolition'],
  jardinier: ['Tonte pelouse', 'Taille haie', 'Élagage', 'Aménagement jardin', 'Clôture'],
}

function isValidFrenchPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s.\-()]/g, '')
  if (/^0[1-9]\d{8}$/.test(cleaned)) return true
  if (/^\+33[1-9]\d{8}$/.test(cleaned)) return true
  if (/^0033[1-9]\d{8}$/.test(cleaned)) return true
  return false
}

const STORAGE_KEY = 'sa:devis-draft'

const stepTitles = [
  { title: 'De quel artisan avez-vous besoin ?', subtitle: 'Choisissez le métier qui correspond à votre besoin.' },
  { title: 'Où habitez-vous ?', subtitle: 'Pour trouver les artisans les plus proches de chez vous.' },
  { title: 'Parlez-nous de votre projet', subtitle: 'Plus on en sait, meilleurs seront les devis.' },
  { title: 'Dernière étape \u2014 comment vous joindre ?', subtitle: 'Les artisans vous contacteront avec leurs devis.' },
]

const stepLabels = ['Service', 'Ville', 'Projet', 'Contact']

// --- Progress Bar (Typeform-style) ---
function ProgressBar({ currentStep }: { currentStep: number }) {
  const progress = ((currentStep - 1) / 3) * 100

  return (
    <div className="mb-8">
      {/* Step label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-heading font-semibold text-charcoal-600">
          Étape {currentStep} sur 4
        </span>
        <span className="text-sm font-semibold text-primary-500">
          {Math.round(progress)}%
        </span>
      </div>
      {/* Bar */}
      <div className="relative h-2 bg-sand-200 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500 ease-premium"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Step dots underneath */}
      <div className="flex justify-between mt-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-400 ${
                currentStep > i + 1
                  ? 'bg-accent-500'
                  : currentStep === i + 1
                  ? 'bg-primary-500 shadow-cta scale-110'
                  : 'bg-sand-300'
              }`}
            >
              {currentStep > i + 1 ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <span className={`text-2xs font-bold ${currentStep === i + 1 ? 'text-white' : 'text-charcoal-500'}`}>
                  {i + 1}
                </span>
              )}
            </div>
            <span
              className={`mt-1 text-2xs transition-colors duration-300 hidden sm:block ${
                currentStep === i + 1
                  ? 'font-heading font-semibold text-primary-500'
                  : currentStep > i + 1
                  ? 'font-medium text-accent-600'
                  : 'font-medium text-charcoal-400'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface DevisFormProps {
  prefilledService?: string
  prefilledCity?: string
  prefilledCityPostal?: string
}

export default function DevisForm({
  prefilledService,
  prefilledCity,
  prefilledCityPostal,
}: DevisFormProps = {}) {
  const isPrefilled = !!(prefilledService && prefilledCity)

  // Restore saved form progress from localStorage
  const savedState = typeof window !== 'undefined' ? (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })() : null

  const [step, setStep] = useState<1 | 2 | 3 | 4>(
    isPrefilled ? 3 : (savedState?.step || 1) as 1 | 2 | 3 | 4
  )
  const [formData, setFormData] = useState<FormData>(
    isPrefilled
      ? { ...initialFormData, service: prefilledService || '', ville: prefilledCity || '' }
      : (savedState?.formData || initialFormData)
  )
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [villeQuery, setVilleQuery] = useState(prefilledCity || savedState?.villeQuery || '')
  const [showVilleSuggestions, setShowVilleSuggestions] = useState(false)
  const [selectedVillePostal, setSelectedVillePostal] = useState(prefilledCityPostal || savedState?.selectedVillePostal || '')
  const [geoLoading, setGeoLoading] = useState(false)

  // Transition state: 'idle' | 'slide-out' | 'slide-in'
  const [transition, setTransition] = useState<'idle' | 'slide-out-left' | 'slide-out-right' | 'slide-in-left' | 'slide-in-right'>('idle')

  // Ref for auto-focus
  const stepContainerRef = useRef<HTMLDivElement>(null)

  // Auto-focus first input when step changes
  useEffect(() => {
    if (transition !== 'idle') return
    const timer = setTimeout(() => {
      if (!stepContainerRef.current) return
      const firstInput = stepContainerRef.current.querySelector<HTMLElement>(
        'input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), select, textarea'
      )
      if (firstInput) {
        firstInput.focus()
      }
    }, 450) // After transition animation completes
    return () => clearTimeout(timer)
  }, [step, transition])

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    },
    []
  )

  const validateField = useCallback((field: keyof FormData) => {
    setErrors((prev) => {
      const next = { ...prev }
      switch (field) {
        case 'nom':
          if (!formData.nom.trim()) next.nom = 'Veuillez entrer votre nom'
          else delete next.nom
          break
        case 'telephone':
          if (!formData.telephone.trim()) next.telephone = 'Veuillez entrer votre numéro de téléphone'
          else if (!isValidFrenchPhone(formData.telephone.trim())) next.telephone = 'Veuillez entrer un numéro de téléphone français valide'
          else delete next.telephone
          break
        case 'email':
          if (!formData.email.trim()) next.email = 'Veuillez entrer votre adresse e-mail'
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) next.email = 'Veuillez entrer une adresse e-mail valide'
          else delete next.email
          break
        default:
          break
      }
      return next
    })
  }, [formData])

  // Persist form progress to localStorage
  useEffect(() => {
    if (submitted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, step, villeQuery, selectedVillePostal }))
    } catch {}
  }, [formData, step, villeQuery, selectedVillePostal, submitted])

  const filteredVilles = villeQuery.length >= 2
    ? villes
        .filter((v) =>
          v.name.toLowerCase().includes(villeQuery.toLowerCase()) ||
          v.codePostal.startsWith(villeQuery)
        )
        .slice(0, 8)
    : []

  const handleGeolocation = useCallback(async () => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      })
      const { latitude, longitude } = position.coords
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}&type=municipality`
      )
      const data = await res.json()
      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        const cityName = feature.properties.city || feature.properties.name
        const postcode = feature.properties.postcode
        if (cityName) {
          updateField('ville', cityName)
          setVilleQuery(cityName)
          if (postcode) setSelectedVillePostal(postcode)
        }
      }
    } catch {
      // Silently fail — user can still type manually
    } finally {
      setGeoLoading(false)
    }
  }, [updateField])

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.service) newErrors.service = 'Veuillez choisir un service'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.ville) newErrors.ville = 'Veuillez indiquer votre ville'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.urgence) newErrors.urgence = 'Veuillez indiquer le délai souhaité'
    if (formData.description.trim().length > 0 && formData.description.trim().length < 10) {
      newErrors.description = 'Veuillez détailler davantage (10 caractères minimum) ou laisser le champ vide'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep4 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.nom.trim()) newErrors.nom = 'Veuillez entrer votre nom'
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Veuillez entrer votre numéro de téléphone'
    } else if (!isValidFrenchPhone(formData.telephone.trim())) {
      newErrors.telephone = 'Veuillez entrer un numéro de téléphone français valide'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Veuillez entrer votre adresse e-mail'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Veuillez entrer une adresse e-mail valide'
    }
    if (!formData.consentement) {
      newErrors.consentement = "Veuillez accepter d'être contacté par des artisans"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Animated step transition (slide-out left, slide-in right for forward; reverse for backward)
  const animateToStep = useCallback((targetStep: 1 | 2 | 3 | 4, direction: 'forward' | 'backward') => {
    const outDirection = direction === 'forward' ? 'slide-out-left' : 'slide-out-right'
    const inDirection = direction === 'forward' ? 'slide-in-right' : 'slide-in-left'

    setTransition(outDirection)
    setTimeout(() => {
      setStep(targetStep)
      setTransition(inDirection)
      setTimeout(() => {
        setTransition('idle')
      }, 400)
    }, 200) // Slide out takes 200ms, then switch + slide in
  }, [])

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      trackEvent('form_started', {
        service: formData.service || '',
        source: 'devis_form',
      })
      animateToStep(2, 'forward')
    } else if (step === 2 && validateStep2()) {
      animateToStep(3, 'forward')
    } else if (step === 3 && validateStep3()) {
      animateToStep(4, 'forward')
    }
  }

  const handlePrev = () => {
    if (step === 2) animateToStep(1, 'backward')
    else if (step === 3) {
      if (isPrefilled) return // Can't go back past step 3 when prefilled
      animateToStep(2, 'backward')
    }
    else if (step === 4) animateToStep(3, 'backward')
  }

  // Enter = Next (Typeform pattern)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step < 4) {
      e.preventDefault()
      handleNext()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep4()) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: formData.service,
          urgency: formData.urgence,
          budget: formData.budget,
          description: formData.description,
          codePostal: selectedVillePostal,
          ville: formData.ville,
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || "Erreur lors de l'envoi")
      }

      trackEvent('devis_submitted', {
        service: formData.service || '',
        city: formData.ville || '',
        postalCode: selectedVillePostal || '',
        urgency: formData.urgence || '',
        source: 'devis_form',
        value: 45,
        currency: 'EUR',
      })
      setSubmitted(true)
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // --- Step validation checks for smart button ---
  const isStep1Valid = !!formData.service
  const isStep2Valid = !!formData.ville
  const isStep3Valid = !!formData.urgence && (formData.description.trim().length === 0 || formData.description.trim().length >= 10)
  const isStep4Valid = !!formData.nom.trim() && !!formData.telephone.trim() && isValidFrenchPhone(formData.telephone.trim()) && !!formData.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) && formData.consentement

  // --- Validation state for inline feedback ---
  const getFieldState = (field: keyof FormData): 'idle' | 'valid' | 'error' => {
    if (errors[field]) return 'error'
    switch (field) {
      case 'service': return formData.service ? 'valid' : 'idle'
      case 'ville': return formData.ville ? 'valid' : 'idle'
      case 'urgence': return formData.urgence ? 'valid' : 'idle'
      case 'nom': return formData.nom.trim() ? 'valid' : 'idle'
      case 'telephone':
        if (!formData.telephone.trim()) return 'idle'
        return isValidFrenchPhone(formData.telephone.trim()) ? 'valid' : 'idle'
      case 'email':
        if (!formData.email.trim()) return 'idle'
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) ? 'valid' : 'idle'
      default: return 'idle'
    }
  }

  const inputBorderClass = (field: keyof FormData) => {
    const state = getFieldState(field)
    if (state === 'error') return 'border-red-400 ring-2 ring-red-50'
    if (state === 'valid') return 'border-accent-400 ring-1 ring-accent-100'
    return 'border-sand-300'
  }

  // --- Premium label + input classes ---
  const labelClass = 'block font-heading text-sm font-semibold text-charcoal-800 mb-2'
  const inputBase = 'w-full rounded-xl border bg-sand-50 px-4 py-3 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all duration-200'

  // Transition CSS classes
  const getTransitionClass = () => {
    switch (transition) {
      case 'slide-out-left':
        return 'translate-x-[-30px] opacity-0 transition-all duration-200 ease-out'
      case 'slide-out-right':
        return 'translate-x-[30px] opacity-0 transition-all duration-200 ease-out'
      case 'slide-in-right':
        return 'animate-slide-in-right'
      case 'slide-in-left':
        return 'animate-fade-in-up'
      default:
        return ''
    }
  }

  // --- CONFIRMATION PAGE ---
  if (submitted) {
    return (
      <div className="bg-white rounded-3xl shadow-premium border border-sand-200 p-8 md:p-12 max-w-2xl mx-auto text-center">
        {/* Animated check icon */}
        <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in-bounce">
          <CheckCircle className="w-10 h-10 text-accent-500" />
        </div>

        <h3 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 mb-3">
          Votre demande a bien été envoyée !
        </h3>
        <p className="text-charcoal-500 mb-8 max-w-md mx-auto">
          Des artisans qualifiés près de chez vous vont étudier votre projet et vous contacter rapidement.
        </p>

        {/* Premium timeline next steps */}
        <div className="text-left max-w-sm mx-auto mt-6 mb-10 relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-accent-200" />

          <div className="space-y-6">
            {[
              { num: '1', title: 'Analyse de votre demande', desc: 'Nous recherchons les artisans les plus adaptés à votre projet' },
              { num: '2', title: 'Réception des devis sous 24h', desc: "Jusqu'à 3 artisans qualifiés vous contactent par email ou téléphone" },
              { num: '3', title: 'Comparez et choisissez', desc: 'Comparez les devis, consultez les avis et choisissez librement' },
            ].map((item) => (
              <div key={item.num} className="flex items-start gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 z-10">
                  <span className="text-sm font-bold text-primary-600">{item.num}</span>
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-semibold text-charcoal-800">{item.title}</p>
                  <p className="text-xs text-charcoal-600 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Link
            href="/services"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-400 hover:bg-primary-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 transition-all duration-300"
          >
            Trouver d'autres artisans
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-sand-300 hover:border-sand-400 text-charcoal-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-sand-50 transition-all duration-300"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Trust micro-banner */}
      <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2.5 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl border border-primary-200/50">
        <Shield className="w-4 h-4 text-primary-500 flex-shrink-0" />
        <p className="text-sm font-medium text-primary-700">
          Gratuit · Sans engagement · Données confidentielles
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-3xl shadow-premium border border-sand-200 p-6 md:p-10 overflow-hidden"
      >
        <ProgressBar currentStep={step} />

        {/* Step container with transitions */}
        <div
          ref={stepContainerRef}
          className={`min-h-[320px] ${getTransitionClass()}`}
          onKeyDown={handleKeyDown}
        >
          {/* --- Step 1: Service --- */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 mb-1">
                  {stepTitles[0].title}
                </h3>
                <p className="text-charcoal-500 text-sm">
                  {stepTitles[0].subtitle}
                </p>
              </div>

              <div>
                <label htmlFor="service" className={labelClass}>
                  Type de service <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="service"
                    value={formData.service}
                    onChange={(e) => updateField('service', e.target.value)}
                    aria-describedby={errors.service ? 'service-error' : undefined}
                    aria-invalid={!!errors.service}
                    style={{ fontSize: '16px' }}
                    className={`${inputBase} appearance-none pr-10 ${inputBorderClass('service')}`}
                  >
                    <option value="">Choisissez un service...</option>
                    {services.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
                  {getFieldState('service') === 'valid' && (
                    <span className="absolute right-9 top-1/2 -translate-y-1/2 text-accent-500 animate-scale-in">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {errors.service && (
                  <p id="service-error" role="alert" className="mt-1.5 text-sm text-red-600 animate-fade-in-down">{errors.service}</p>
                )}
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-2 text-charcoal-400">
                <Users className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">14 500+ artisans référencés sur notre plateforme</p>
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={!isStep1Valid}
                className={`w-full inline-flex items-center justify-center gap-2 font-semibold px-6 py-4 rounded-xl transition-all duration-300 text-base ${
                  isStep1Valid
                    ? 'bg-primary-400 hover:bg-primary-500 text-white shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 hover:scale-[1.01]'
                    : 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
                }`}
              >
                Suivant <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* --- Step 2: Ville --- */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 mb-1">
                  {stepTitles[1].title}
                </h3>
                <p className="text-charcoal-500 text-sm">
                  {stepTitles[1].subtitle}
                </p>
              </div>

              <div>
                <label htmlFor="ville" className={labelClass}>
                  Ville <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="ville"
                    type="text"
                    autoComplete="address-level2"
                    placeholder="Ex : Paris, Lyon, Marseille..."
                    value={villeQuery}
                    onChange={(e) => {
                      const newValue = e.target.value
                      setVilleQuery(newValue)
                      setShowVilleSuggestions(true)
                      if (formData.ville && newValue !== formData.ville) {
                        updateField('ville', '')
                        setSelectedVillePostal('')
                      }
                    }}
                    onFocus={() => setShowVilleSuggestions(true)}
                    onBlur={() => {
                      setTimeout(() => setShowVilleSuggestions(false), 200)
                    }}
                    aria-describedby={errors.ville ? 'ville-error' : undefined}
                    aria-invalid={!!errors.ville}
                    style={{ fontSize: '16px' }}
                    className={`${inputBase} pr-10 ${inputBorderClass('ville')}`}
                  />
                  {getFieldState('ville') === 'valid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-500 animate-scale-in">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                  {showVilleSuggestions && filteredVilles.length > 0 && (
                    <ul className="absolute z-20 mt-1 w-full bg-white border border-sand-200 rounded-xl shadow-premium max-h-60 overflow-auto">
                      {filteredVilles.map((v) => (
                        <li key={v.slug}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors text-sm first:rounded-t-xl last:rounded-b-xl"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              updateField('ville', v.name)
                              setVilleQuery(v.name)
                              setSelectedVillePostal(v.codePostal)
                              setShowVilleSuggestions(false)
                            }}
                          >
                            <span className="font-medium text-charcoal-900">{v.name}</span>
                            <span className="text-charcoal-400 ml-2">
                              ({v.departement}, {v.codePostal})
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleGeolocation}
                  disabled={geoLoading}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-700 font-medium transition-colors disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4" />
                  {geoLoading ? 'Localisation en cours\u2026' : 'Utiliser ma position'}
                </button>
                {errors.ville && (
                  <p id="ville-error" role="alert" className="mt-1.5 text-sm text-red-600 animate-fade-in-down">{errors.ville}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center justify-center gap-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100 font-medium px-5 py-3 rounded-xl transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" /> Précédent
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep2Valid}
                  className={`flex-1 inline-flex items-center justify-center gap-2 font-semibold px-6 py-4 rounded-xl transition-all duration-300 text-base ${
                    isStep2Valid
                      ? 'bg-primary-400 hover:bg-primary-500 text-white shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 hover:scale-[1.01]'
                      : 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
                  }`}
                >
                  Suivant <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* --- Step 3: Urgence + Description + Budget --- */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 mb-1">
                  {stepTitles[2].title}
                </h3>
                <p className="text-charcoal-500 text-sm">
                  {stepTitles[2].subtitle}
                </p>
              </div>

              {/* Urgency chips */}
              <div>
                <label className={labelClass}>
                  Délai souhaité <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {urgencyOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`relative flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-sm font-medium ${
                        formData.urgence === opt.value
                          ? 'border-primary-400 bg-primary-50 text-primary-700 ring-1 ring-primary-200 scale-[1.02]'
                          : 'border-sand-300 bg-sand-50 hover:border-sand-400 text-charcoal-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgence"
                        value={opt.value}
                        checked={formData.urgence === opt.value}
                        onChange={(e) => updateField('urgence', e.target.value)}
                        className="sr-only"
                      />
                      {formData.urgence === opt.value && (
                        <Check className="w-3.5 h-3.5 mr-1.5 text-primary-500" />
                      )}
                      {opt.label}
                    </label>
                  ))}
                </div>
                {errors.urgence && (
                  <p role="alert" className="mt-1.5 text-sm text-red-600 animate-fade-in-down">{errors.urgence}</p>
                )}
              </div>

              {/* Quick project type selection */}
              {formData.service && serviceSubcategories[formData.service] && (
                <div>
                  <label className={labelClass}>
                    Type de projet <span className="text-charcoal-400 font-normal">(cliquez pour sélectionner)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {serviceSubcategories[formData.service].map((cat) => {
                      const isSelected = formData.description.includes(cat)
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              updateField('description', formData.description.replace(cat, '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim())
                            } else {
                              updateField('description', formData.description ? `${formData.description}, ${cat}` : cat)
                            }
                          }}
                          className={`px-3.5 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-primary-400 bg-primary-50 text-primary-700 ring-1 ring-primary-200 scale-[1.02]'
                              : 'border-sand-300 bg-sand-50 text-charcoal-700 hover:border-sand-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label htmlFor="description" className={labelClass}>
                  Décrivez votre projet <span className="text-charcoal-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder={formData.service && serviceSubcategories[formData.service]
                    ? "Précisions supplémentaires (optionnel)..."
                    : "Ex : fuite robinet cuisine, remplacement chaudière..."}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  aria-describedby={errors.description ? 'description-error' : undefined}
                  aria-invalid={!!errors.description}
                  style={{ fontSize: '16px' }}
                  className={`${inputBase} resize-none ${
                    errors.description ? 'border-red-400 ring-2 ring-red-50' : formData.description.trim().length >= 10 ? 'border-accent-400 ring-1 ring-accent-100' : 'border-sand-300'
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.description ? (
                    <p id="description-error" role="alert" className="text-sm text-red-600 animate-fade-in-down">{errors.description}</p>
                  ) : (
                    <span />
                  )}
                  {formData.description.length > 0 && (
                    <span
                      className={`text-xs ${
                        formData.description.trim().length >= 10 ? 'text-accent-600' : 'text-charcoal-400'
                      }`}
                    >
                      {formData.description.length}/10 caract.
                    </span>
                  )}
                </div>
              </div>

              {/* Budget chips */}
              <div>
                <label className={labelClass}>
                  Budget estimé <span className="text-charcoal-400 font-normal">(optionnel)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {budgetOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`relative flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-sm font-medium text-center ${
                        formData.budget === opt.value
                          ? 'border-primary-400 bg-primary-50 text-primary-700 ring-1 ring-primary-200 scale-[1.02]'
                          : 'border-sand-300 bg-sand-50 hover:border-sand-400 text-charcoal-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="budget"
                        value={opt.value}
                        checked={formData.budget === opt.value}
                        onChange={(e) => updateField('budget', e.target.value)}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                {!isPrefilled && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center justify-center gap-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100 font-medium px-5 py-3 rounded-xl transition-all duration-300"
                  >
                    <ArrowLeft className="w-4 h-4" /> Précédent
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep3Valid}
                  className={`${isPrefilled ? 'w-full' : 'flex-1'} inline-flex items-center justify-center gap-2 font-semibold px-6 py-4 rounded-xl transition-all duration-300 text-base ${
                    isStep3Valid
                      ? 'bg-primary-400 hover:bg-primary-500 text-white shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 hover:scale-[1.01]'
                      : 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
                  }`}
                >
                  Suivant <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* --- Step 4: Contact info --- */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 mb-1">
                  {stepTitles[3].title}
                </h3>
                <p className="text-charcoal-500 text-sm">
                  {stepTitles[3].subtitle}
                </p>
              </div>

              {/* Nom */}
              <div>
                <label htmlFor="nom" className={labelClass}>
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="nom"
                    type="text"
                    autoComplete="name"
                    placeholder="Jean Dupont"
                    value={formData.nom}
                    onChange={(e) => updateField('nom', e.target.value)}
                    onBlur={() => validateField('nom')}
                    aria-describedby={errors.nom ? 'nom-error' : undefined}
                    aria-invalid={!!errors.nom}
                    style={{ fontSize: '16px' }}
                    className={`${inputBase} pr-10 ${inputBorderClass('nom')}`}
                  />
                  {getFieldState('nom') === 'valid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-500 animate-scale-in">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {errors.nom && (
                  <p id="nom-error" role="alert" className="mt-1.5 text-sm text-red-600 animate-fade-in-down">{errors.nom}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="telephone" className={labelClass}>
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="telephone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="06 12 34 56 78"
                    value={formData.telephone}
                    onChange={(e) => updateField('telephone', e.target.value)}
                    onBlur={() => validateField('telephone')}
                    aria-describedby={errors.telephone ? 'telephone-error' : undefined}
                    aria-invalid={!!errors.telephone}
                    style={{ fontSize: '16px' }}
                    className={`${inputBase} pr-10 ${inputBorderClass('telephone')}`}
                  />
                  {getFieldState('telephone') === 'valid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-500 animate-scale-in">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {errors.telephone && (
                  <p id="telephone-error" role="alert" className="mt-1.5 text-sm text-red-600 animate-fade-in-down">{errors.telephone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className={labelClass}>
                  Adresse e-mail <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="jean.dupont@email.fr"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    onBlur={() => validateField('email')}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    aria-invalid={!!errors.email}
                    style={{ fontSize: '16px' }}
                    className={`${inputBase} pr-10 ${inputBorderClass('email')}`}
                  />
                  {getFieldState('email') === 'valid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-500 animate-scale-in">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {errors.email && (
                  <p id="email-error" role="alert" className="mt-1.5 text-sm text-red-600 animate-fade-in-down">{errors.email}</p>
                )}
              </div>

              {/* Consent checkbox */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    formData.consentement
                      ? 'bg-primary-500 border-primary-500'
                      : 'border-sand-400 group-hover:border-primary-300'
                  }`}>
                    {formData.consentement && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.consentement}
                    onChange={(e) => updateField('consentement', e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-sm text-charcoal-600 leading-relaxed">
                    J'accepte d'être contacté par des artisans pour recevoir des devis
                    en lien avec ma demande.{' '}
                    <span className="text-charcoal-400">Seuls votre nom, téléphone et description du projet sont transmis aux artisans contactés.</span>
                  </span>
                </label>
                {errors.consentement && (
                  <p role="alert" className="mt-1.5 text-sm text-red-600 animate-fade-in-down">{errors.consentement}</p>
                )}
              </div>

              {submitError && (
                <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in-down">
                  {submitError}
                </div>
              )}

              <div className="flex gap-3 items-center">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100 font-medium px-5 py-3 rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Précédent
                </button>
                <button
                  type="submit"
                  disabled={submitting || !isStep4Valid}
                  className={`flex-1 inline-flex items-center justify-center gap-2 font-semibold px-6 py-5 rounded-xl transition-all duration-300 text-lg ${
                    isStep4Valid && !submitting
                      ? 'bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 text-white shadow-cta hover:shadow-cta-hover hover:scale-[1.02] hover:-translate-y-1'
                      : 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi en cours&hellip;
                    </>
                  ) : (
                    <>Recevoir mes devis gratuits <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>

              {/* Trust line under submit */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-accent-600 font-medium">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Gratuit
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 3 devis max
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Artisans vérifiés SIREN
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Social proof counter (persistent across all steps) */}
        <div className="mt-6 pt-5 border-t border-sand-100 flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5 text-charcoal-300" />
          <p className="text-xs text-charcoal-400">
            Rejoint les <span className="font-semibold text-charcoal-500">1 247</span> demandes ce mois
          </p>
        </div>
      </form>
    </div>
  )
}
