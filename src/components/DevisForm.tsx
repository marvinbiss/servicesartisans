'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { services, villes } from '@/lib/data/france'
import { ArrowRight, ArrowLeft, ChevronDown, Check, MapPin, Users, Shield, Clock } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import DevisConfirmation from '@/components/conversion/DevisConfirmation'

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
  { title: 'De quel artisan avez-vous besoin ?', subtitle: 'Choisissez le métier et indiquez votre ville.' },
  { title: 'Parlez-nous de votre projet', subtitle: 'Plus on en sait, meilleurs seront les devis.' },
  { title: 'Dernière étape \u2014 comment vous joindre ?', subtitle: 'Les artisans vous contacteront avec leurs devis.' },
]

const stepLabels = ['Projet', 'Détails', 'Contact']

// --- Progress Bar (Typeform-style) ---
function ProgressBar({ currentStep }: { currentStep: number }) {
  const progress = ((currentStep - 1) / 2) * 100

  return (
    <div className="mb-8">
      {/* Step label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-heading font-semibold text-charcoal-600">
          Étape {currentStep} sur 3
        </span>
        <span className="text-sm font-semibold text-primary-500">
          {Math.round(progress)}%
        </span>
      </div>
      {/* Bar */}
      <div
        className="relative h-2 bg-sand-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-label="Progression du formulaire"
      >
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
      if (!saved) return null
      const parsed = JSON.parse(saved)
      // Migrate old 4-step saves to 3-step
      if (parsed.step === 4) parsed.step = 3
      if (parsed.step > 3) parsed.step = 1
      return parsed
    } catch { return null }
  })() : null

  // If there's a saved state beyond step 1, start at step 1 and show resume banner
  // The user can click "Reprendre" to restore or "Recommencer" to clear
  const hasSavedProgress = !isPrefilled && savedState?.step && savedState.step > 1
  const [step, setStep] = useState<1 | 2 | 3>(
    isPrefilled ? 2 : hasSavedProgress ? 1 : (savedState?.step || 1) as 1 | 2 | 3
  )
  const [formData, setFormData] = useState<FormData>(
    isPrefilled
      ? { ...initialFormData, service: prefilledService || '', ville: prefilledCity || '' }
      : hasSavedProgress ? initialFormData : (savedState?.formData || initialFormData)
  )
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [villeQuery, setVilleQuery] = useState(prefilledCity || (hasSavedProgress ? '' : (savedState?.villeQuery || '')))
  const [showVilleSuggestions, setShowVilleSuggestions] = useState(false)
  const [selectedVillePostal, setSelectedVillePostal] = useState(prefilledCityPostal || (hasSavedProgress ? '' : (savedState?.selectedVillePostal || '')))
  const [geoLoading, setGeoLoading] = useState(false)
  const [debouncedVilleQuery, setDebouncedVilleQuery] = useState(villeQuery)
  const [abandonTracked, setAbandonTracked] = useState(false)
  const [monthlyCount, setMonthlyCount] = useState<string>('1 200+')

  // Resume banner: show if saved state exists at step > 1 and not prefilled
  const [showResumeBanner, setShowResumeBanner] = useState(false)
  const [savedService, setSavedService] = useState('')
  const [savedVille, setSavedVille] = useState('')

  useEffect(() => {
    if (isPrefilled) return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const parsed = JSON.parse(saved)
      if (parsed.step && parsed.step > 1 && parsed.formData) {
        setSavedService(parsed.formData.service || '')
        setSavedVille(parsed.formData.ville || '')
        setShowResumeBanner(true)
      }
    } catch {}
  }, [isPrefilled])

  const handleResume = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const parsed = JSON.parse(saved)
      if (parsed.step) {
        const targetStep = (parsed.step === 4 ? 3 : parsed.step > 3 ? 1 : parsed.step) as 1 | 2 | 3
        setStep(targetStep)
        if (parsed.formData) setFormData(parsed.formData)
        if (parsed.villeQuery) setVilleQuery(parsed.villeQuery)
        if (parsed.selectedVillePostal) setSelectedVillePostal(parsed.selectedVillePostal)
      }
    } catch {}
    setShowResumeBanner(false)
  }, [])

  const handleDismiss = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setStep(1)
    setFormData(initialFormData)
    setVilleQuery('')
    setSelectedVillePostal('')
    setShowResumeBanner(false)
  }, [])

  // Fetch monthly demand count (social proof)
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('sa:devis-monthly-count')
      if (cached) {
        const { count, ts } = JSON.parse(cached)
        if (Date.now() - ts < 300_000) { setMonthlyCount(count.toLocaleString('fr-FR')); return }
      }
    } catch {}
    fetch('/api/stats/demand')
      .then(r => r.json())
      .then(d => {
        const count = d.requests_this_month || 0
        if (count > 0) {
          setMonthlyCount(count.toLocaleString('fr-FR'))
          try { sessionStorage.setItem('sa:devis-monthly-count', JSON.stringify({ count, ts: Date.now() })) } catch {}
        }
      })
      .catch(() => {})
  }, [])

  // Debounce ville search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedVilleQuery(villeQuery), 300)
    return () => clearTimeout(timer)
  }, [villeQuery])

  // Transition state
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
    }, 450)
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
          else if (!isValidFrenchPhone(formData.telephone.trim())) next.telephone = 'Le numéro de téléphone doit contenir 10 chiffres (ex : 06 12 34 56 78)'
          else delete next.telephone
          break
        case 'email':
          if (!formData.email.trim()) next.email = 'Veuillez entrer votre adresse e-mail'
          else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) next.email = 'Veuillez entrer une adresse e-mail valide (ex : nom@exemple.fr)'
          else delete next.email
          break
        default:
          break
      }
      return next
    })
  }, [formData])

  // Persist form progress to localStorage (skip while resume banner is shown to avoid overwriting saved data)
  useEffect(() => {
    if (submitted || showResumeBanner) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, step, villeQuery, selectedVillePostal }))
    } catch {}
  }, [formData, step, villeQuery, selectedVillePostal, submitted, showResumeBanner])

  const filteredVilles = useMemo(() => {
    if (debouncedVilleQuery.length < 2) return []
    const q = debouncedVilleQuery.toLowerCase()
    const results: typeof villes = []
    for (const v of villes) {
      if (v.name.toLowerCase().startsWith(q) || v.codePostal.startsWith(debouncedVilleQuery)) {
        results.push(v)
        if (results.length >= 8) break
      }
    }
    return results
  }, [debouncedVilleQuery])

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
      // Silently fail - user can still type manually
    } finally {
      setGeoLoading(false)
    }
  }, [updateField])

  // --- Abandon tracking: fire when email is filled at step 2 ---
  const trackAbandon = useCallback(async (email: string) => {
    if (abandonTracked || !email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) return
    setAbandonTracked(true)
    try {
      await fetch('/api/devis/abandon-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          service: formData.service || null,
          city: formData.ville || null,
          step: 2,
        }),
      })
    } catch {
      // Non-blocking
    }
  }, [abandonTracked, formData.service, formData.ville])

  // --- Validation per step ---
  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.service) newErrors.service = 'Veuillez sélectionner un service'
    if (!formData.ville) newErrors.ville = 'Veuillez indiquer votre ville'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Veuillez entrer votre adresse e-mail'
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      newErrors.email = 'Veuillez entrer une adresse e-mail valide (ex : nom@exemple.fr)'
    }
    if (!formData.urgence) newErrors.urgence = 'Veuillez indiquer le délai souhaité'
    if (formData.description.trim().length > 0 && formData.description.trim().length < 5) {
      newErrors.description = 'Veuillez détailler davantage votre projet (5 caractères minimum) ou laisser le champ vide'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.nom.trim()) newErrors.nom = 'Veuillez entrer votre nom'
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Veuillez entrer votre numéro de téléphone'
    } else if (!isValidFrenchPhone(formData.telephone.trim())) {
      newErrors.telephone = 'Le numéro de téléphone doit contenir 10 chiffres (ex : 06 12 34 56 78)'
    }
    if (!formData.consentement) {
      newErrors.consentement = "Veuillez accepter d'être contacté par des artisans"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Animated step transition
  const animateToStep = useCallback((targetStep: 1 | 2 | 3, direction: 'forward' | 'backward') => {
    const outDirection = direction === 'forward' ? 'slide-out-left' : 'slide-out-right'
    const inDirection = direction === 'forward' ? 'slide-in-right' : 'slide-in-left'

    setTransition(outDirection)
    setTimeout(() => {
      setStep(targetStep)
      setTransition(inDirection)
      setTimeout(() => {
        setTransition('idle')
      }, 400)
    }, 200)
  }, [])

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      trackEvent('form_started', {
        service: formData.service || '',
        source: 'devis_form',
      })
      animateToStep(2, 'forward')
    } else if (step === 2 && validateStep2()) {
      // Track abandon with email captured at step 2
      trackAbandon(formData.email.trim())
      animateToStep(3, 'forward')
    }
  }

  const handlePrev = () => {
    if (step === 2) {
      if (isPrefilled) return
      animateToStep(1, 'backward')
    } else if (step === 3) {
      animateToStep(2, 'backward')
    }
  }

  // Enter = Next (Typeform pattern)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step < 3) {
      e.preventDefault()
      handleNext()
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!validateStep3()) return

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
          telephone: formData.telephone.replace(/[\s.\-()]/g, ''),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || "Erreur lors de l'envoi")
      }

      // Mark abandon as completed
      if (formData.email.trim()) {
        fetch('/api/devis/abandon-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email.trim() }),
        }).catch(() => {})
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
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setSubmitError('Erreur de connexion. Vérifiez votre internet.')
      } else {
        setSubmitError(
          err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.'
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  // --- Step validation checks for smart button ---
  const isStep1Valid = !!formData.service && !!formData.ville
  const isStep2Valid = !!formData.email.trim() && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim()) && !!formData.urgence && (formData.description.trim().length === 0 || formData.description.trim().length >= 5)
  const isStep3Valid = !!formData.nom.trim() && !!formData.telephone.trim() && isValidFrenchPhone(formData.telephone.trim()) && formData.consentement

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
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim()) ? 'valid' : 'idle'
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
      <div className="bg-white rounded-3xl shadow-premium border border-sand-200 p-8 md:p-12 max-w-2xl mx-auto">
        <DevisConfirmation
          service={formData.service}
          city={formData.ville}
          phone={formData.telephone}
          budget={formData.budget || undefined}
        />

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-4">
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

      {showResumeBanner && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-800">Vous aviez commencé une demande</p>
            <p className="text-xs text-primary-600">
              {savedService && <>Service : {services.find(s => s.slug === savedService)?.name || savedService}</>}
              {savedService && savedVille && <> — </>}
              {savedVille && <>Ville : {savedVille}</>}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleResume} className="text-sm font-medium text-primary-600 hover:text-primary-800">
              Reprendre
            </button>
            <button type="button" onClick={handleDismiss} className="text-sm text-charcoal-400 hover:text-charcoal-600">
              Recommencer
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-3xl shadow-premium border border-sand-200 p-6 md:p-10 overflow-hidden"
      >
        <ProgressBar currentStep={step} />

        {/* SR-only step announcer */}
        <div className="sr-only" aria-live="assertive" aria-atomic="true">
          Étape {step} sur 3{step === 1 ? ' : Votre besoin' : step === 2 ? ' : Vos coordonnées' : ' : Confirmation'}
        </div>

        {/* Step container with transitions */}
        <div
          ref={stepContainerRef}
          className={`min-h-[320px] ${getTransitionClass()}`}
          onKeyDown={handleKeyDown}
          aria-live="polite"
        >
          {/* --- Step 1: Service + Ville (merged) --- */}
          {step === 1 && (
            <div className="space-y-6" aria-label="Étape 1 sur 3">
              <div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 mb-1">
                  {stepTitles[0].title}
                </h3>
                <p className="text-charcoal-500 text-sm">
                  {stepTitles[0].subtitle}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-charcoal-500">
                <span className="text-amber-500">&#9733;</span>
                <span>4.8/5 basé sur <strong>23 000+</strong> demandes traitées</span>
              </div>

              {/* Service */}
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

              {/* Ville */}
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

          {/* --- Step 2: Email (early capture) + Urgence + Description + Budget --- */}
          {step === 2 && (
            <div className="space-y-6" aria-label="Étape 2 sur 3">
              <div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 mb-1">
                  {stepTitles[1].title}
                </h3>
                <p className="text-charcoal-500 text-sm">
                  {stepTitles[1].subtitle}
                </p>
              </div>

              {/* Email — early capture */}
              <div>
                <label htmlFor="email" className={labelClass}>
                  Votre e-mail <span className="text-charcoal-400 font-normal">— pour recevoir vos devis</span> <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="jean.dupont@email.fr"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    onBlur={() => {
                      validateField('email')
                      // Track abandon on email blur if valid
                      if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
                        trackAbandon(formData.email.trim())
                      }
                    }}
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
                {!errors.email && (
                  <p className="text-xs text-charcoal-400 mt-1">
                    Confidentiel — seul votre téléphone est transmis aux artisans
                  </p>
                )}
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
                      className={`relative flex items-center justify-center px-2 sm:px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-sm font-medium ${
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
                    : "Ex: fuite d'eau dans la cuisine, remplacement chauffe-eau..."}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  aria-describedby={errors.description ? 'description-error' : undefined}
                  aria-invalid={!!errors.description}
                  style={{ fontSize: '16px' }}
                  className={`${inputBase} resize-none ${
                    errors.description ? 'border-red-400 ring-2 ring-red-50' : formData.description.trim().length >= 5 ? 'border-accent-400 ring-1 ring-accent-100' : 'border-sand-300'
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
                        formData.description.trim().length >= 5 ? 'text-accent-600' : 'text-charcoal-400'
                      }`}
                    >
                      {formData.description.length}/5 caract.
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
                    className="inline-flex items-center justify-center gap-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100 font-medium px-5 py-4 rounded-xl transition-all duration-300"
                  >
                    <ArrowLeft className="w-4 h-4" /> Précédent
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep2Valid}
                  className={`${isPrefilled ? 'w-full' : 'flex-1'} inline-flex items-center justify-center gap-2 font-semibold px-6 py-4 rounded-xl transition-all duration-300 text-base ${
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

          {/* --- Step 3: Nom + Téléphone + Consentement --- */}
          {step === 3 && (
            <div className="space-y-6" aria-label="Étape 3 sur 3">
              <div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 mb-1">
                  {stepTitles[2].title}
                </h3>
                <p className="text-charcoal-500 text-sm">
                  {stepTitles[2].subtitle}
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
                    placeholder="Votre nom complet"
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
                    inputMode="tel"
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
                    J&apos;accepte d&apos;être contacté par des artisans vérifiés pour cette demande.{' '}
                    <Link href="/confidentialite" className="text-primary-500 hover:text-primary-700 underline underline-offset-2">Politique de confidentialité</Link>
                  </span>
                </label>
                {errors.consentement && (
                  <p role="alert" className="mt-1.5 text-sm text-red-600 animate-fade-in-down">{errors.consentement}</p>
                )}
              </div>

              {submitError && (
                <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-center animate-fade-in-down">
                  <p className="text-sm text-red-700">{submitError}</p>
                  <p className="text-xs text-red-500 mt-1">Vos données sont conservées.</p>
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {/* Trust line before submit */}
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

              <div className="flex gap-3 items-center">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100 font-medium px-5 py-4 rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Précédent
                </button>
                <button
                  type="submit"
                  disabled={submitting || !isStep3Valid}
                  className={`flex-1 inline-flex items-center justify-center gap-2 font-semibold px-6 py-5 rounded-xl transition-all duration-300 text-lg ${
                    isStep3Valid && !submitting
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
                    <>Obtenir mes 3 devis gratuits <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Social proof counter (persistent across all steps) */}
        <div className="mt-6 pt-5 border-t border-sand-100 flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5 text-charcoal-300" />
          <p className="text-xs text-charcoal-400">
            Rejoint les <span className="font-semibold text-charcoal-500">{monthlyCount}</span> demandes ce mois
          </p>
        </div>
      </form>
    </div>
  )
}
