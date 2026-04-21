'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { services } from '@/lib/data/france-light'
import {
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Check,
  MapPin,
  Users,
  Shield,
  Clock,
} from 'lucide-react'
import { isValidFrenchPhone } from '@/lib/validation/phone'
import { trackEvent } from '@/lib/analytics/tracking'
import { capture, EVENT } from '@/lib/analytics/posthog'
import { useDevisForm, urgencyOptions, initialDevisFormData } from '@/hooks/useDevisForm'
import type { DevisFormData } from '@/hooks/useDevisForm'
import DevisConfirmation from '@/components/conversion/DevisConfirmation'
import CeePrimeEstimateCard from '@/components/devis/CeePrimeEstimateCard'

const budgetOptions = [
  { value: 'moins-500', label: 'Moins de 500 €' },
  { value: '500-2000', label: '500‑2 000 €' },
  { value: '2000-5000', label: '2 000‑5 000 €' },
  { value: 'plus-5000', label: 'Plus de 5 000 €' },
  { value: 'ne-sais-pas', label: 'Je ne sais pas' },
]

const serviceSubcategories: Record<string, string[]> = {
  plombier: [
    "Fuite d'eau",
    'Débouchage',
    'Chauffe-eau',
    'Robinetterie',
    'WC / Sanitaires',
    'Tuyauterie',
  ],
  electricien: [
    'Panne électrique',
    'Installation prise/interrupteur',
    'Tableau électrique',
    'Éclairage',
    'Mise aux normes',
    'Domotique',
  ],
  serrurier: [
    'Porte claquée',
    'Serrure cassée',
    'Changement de serrure',
    'Double de clé',
    'Blindage de porte',
  ],
  chauffagiste: [
    'Panne chaudière',
    'Entretien chaudière',
    'Radiateur',
    'Plancher chauffant',
    'Pompe à chaleur',
  ],
  peintre: [
    'Peinture intérieure',
    'Peinture extérieure',
    'Ravalement façade',
    'Papier peint',
    'Plafond',
  ],
  menuisier: ['Porte intérieure', 'Fenêtre', 'Escalier', 'Placard sur mesure', 'Parquet'],
  carreleur: ['Carrelage sol', 'Carrelage mural', 'Faïence salle de bain', 'Terrasse extérieure'],
  couvreur: ['Fuite toiture', 'Rénovation toiture', 'Gouttière', 'Isolation toiture', 'Démoussage'],
  macon: ['Mur / Cloison', 'Fondation', 'Terrasse', 'Extension', 'Démolition'],
  jardinier: ['Tonte pelouse', 'Taille haie', 'Élagage', 'Aménagement jardin', 'Clôture'],
}

const STORAGE_KEY = 'sa:devis-draft'

const stepTitles = [
  {
    title: 'De quel artisan avez-vous besoin ?',
    subtitle: 'Choisissez le métier et indiquez votre ville.',
  },
  {
    title: 'Parlez-nous de votre projet (optionnel)',
    subtitle: 'Ces infos aident les artisans à préparer un meilleur devis — vous pouvez passer.',
  },
  {
    title: 'Dernière étape — comment vous joindre ?',
    subtitle: 'Les artisans vous contacteront avec leurs devis.',
  },
]

const stepLabels = ['Projet', 'Détails', 'Contact']

function ProgressBar({ currentStep }: { currentStep: number }) {
  const progress = ((currentStep - 1) / 2) * 100

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-heading font-semibold text-charcoal-600">
          Étape {currentStep} sur 3
        </span>
        <span className="text-sm font-semibold text-primary-500">{Math.round(progress)}%</span>
      </div>
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
                <span
                  className={`text-2xs font-bold ${currentStep === i + 1 ? 'text-white' : 'text-charcoal-500'}`}
                >
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
  prefilledOperation?: string
  /**
   * CRO lever Pilier 2.D — skip the optional step 2 when the service/city are
   * already prefilled, so the user reaches the contact step in one click.
   * They can still expand the optional questions via the "plus de détails" toggle.
   */
  minimalMode?: boolean
}

export default function DevisForm({
  prefilledService,
  prefilledCity,
  prefilledCityPostal,
  prefilledOperation,
  minimalMode = false,
}: DevisFormProps = {}) {
  const isPrefilled = !!(prefilledService && prefilledCity)
  const isMinimal = minimalMode && isPrefilled
  const validPrefilledService =
    prefilledService && services.some((s) => s.slug === prefilledService)
      ? prefilledService
      : undefined

  const savedState =
    typeof window !== 'undefined'
      ? (() => {
          try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (!saved) return null
            const parsed = JSON.parse(saved)
            if (parsed.step === 4) parsed.step = 3
            if (parsed.step > 3) parsed.step = 1
            return parsed
          } catch {
            return null
          }
        })()
      : null

  const hasSavedProgress = !isPrefilled && savedState?.step && savedState.step > 1

  const resolvedInitialData = isPrefilled
    ? { service: validPrefilledService || '', ville: prefilledCity || '' }
    : hasSavedProgress
      ? {}
      : validPrefilledService
        ? { ...(savedState?.formData || {}), service: validPrefilledService }
        : savedState?.formData || {}

  const resolvedInitialStep: 1 | 2 | 3 = isMinimal
    ? 3
    : isPrefilled
      ? 2
      : hasSavedProgress
        ? 1
        : ((savedState?.step || 1) as 1 | 2 | 3)

  const [ceeEligible, setCeeEligible] = useState(false)
  const [ceeOperationCodes, setCeeOperationCodes] = useState<string[]>([])
  const [selectedVillePostal, setSelectedVillePostal] = useState(
    prefilledCityPostal || (hasSavedProgress ? '' : savedState?.selectedVillePostal || '')
  )
  const [monthlyCount, setMonthlyCount] = useState<string>('1 200+')

  const form = useDevisForm({
    source: 'devis_form',
    initialData: resolvedInitialData,
    initialStep: resolvedInitialStep,
    initialVilleQuery: prefilledCity || (hasSavedProgress ? '' : savedState?.villeQuery || ''),
    villeQueryDebounceMs: 300,
    onSubmitSuccess: (responseBody) => {
      const body = responseBody as {
        cee_eligible?: boolean
        cee_operation_codes?: string[]
      } | null
      if (body?.cee_eligible) {
        setCeeEligible(true)
        setCeeOperationCodes(body.cee_operation_codes || [])
      }
      localStorage.removeItem(STORAGE_KEY)
    },
  })

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
    } catch {
      // ignore
    }
  }, [isPrefilled])

  const handleResume = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const parsed = JSON.parse(saved)
      if (parsed.step) {
        const targetStep = (parsed.step === 4 ? 3 : parsed.step > 3 ? 1 : parsed.step) as 1 | 2 | 3
        form.setStep(targetStep)
        if (parsed.formData) form.setFormData({ ...initialDevisFormData, ...parsed.formData })
        if (parsed.villeQuery) form.setVilleQuery(parsed.villeQuery)
        if (parsed.selectedVillePostal) setSelectedVillePostal(parsed.selectedVillePostal)
      }
    } catch {
      // ignore
    }
    setShowResumeBanner(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track funnel entry once per mount
  useEffect(() => {
    capture(EVENT.DEVIS_STARTED, {
      prefilled: isPrefilled,
      service: form.formData.service || '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDismiss = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    form.resetForm()
    form.setVilleQuery('')
    setSelectedVillePostal('')
    setShowResumeBanner(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('sa:devis-monthly-count')
      if (cached) {
        const { count, ts } = JSON.parse(cached)
        if (Date.now() - ts < 300_000) {
          setMonthlyCount(count.toLocaleString('fr-FR'))
          return
        }
      }
    } catch {
      // ignore
    }
    fetch('/api/stats/demand')
      .then((r) => r.json())
      .then((d) => {
        const count = d.requests_this_month || 0
        if (count > 0) {
          setMonthlyCount(count.toLocaleString('fr-FR'))
          try {
            sessionStorage.setItem(
              'sa:devis-monthly-count',
              JSON.stringify({ count, ts: Date.now() })
            )
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {})
  }, [])

  const [transition, setTransition] = useState<
    'idle' | 'slide-out-left' | 'slide-out-right' | 'slide-in-left' | 'slide-in-right'
  >('idle')

  const stepContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (transition !== 'idle') return
    // Scroll the form into view immediately so users don't land at the bottom
    if (typeof window !== 'undefined' && stepContainerRef.current) {
      const top = stepContainerRef.current.getBoundingClientRect().top + window.scrollY - 16
      window.scrollTo({ top, behavior: 'smooth' })
    }
    const timer = setTimeout(() => {
      if (!stepContainerRef.current) return
      const firstInput = stepContainerRef.current.querySelector<HTMLElement>(
        'input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), select, textarea'
      )
      if (firstInput) {
        // preventScroll avoids the browser jumping to the input and overriding
        // our scrollTo above.
        firstInput.focus({ preventScroll: true })
      }
    }, 450)
    return () => clearTimeout(timer)
  }, [form.step, transition])

  const validateField = useCallback(
    (field: keyof DevisFormData) => {
      form.setErrors((prev) => {
        const next = { ...prev }
        switch (field) {
          case 'nom':
            if (!form.formData.nom.trim()) next.nom = 'Veuillez entrer votre nom'
            else delete next.nom
            break
          case 'telephone':
            if (!form.formData.telephone.trim())
              next.telephone = 'Veuillez entrer votre numéro de téléphone'
            else if (!isValidFrenchPhone(form.formData.telephone.trim()))
              next.telephone =
                'Le numéro de téléphone doit contenir 10 chiffres (ex : 06 12 34 56 78)'
            else delete next.telephone
            break
          case 'email':
            if (!form.formData.email.trim()) next.email = 'Veuillez entrer votre adresse e-mail'
            else if (!form.isEmailValid(form.formData.email.trim()))
              next.email = 'Veuillez entrer une adresse e-mail valide (ex : nom@exemple.fr)'
            else delete next.email
            break
          default:
            break
        }
        return next
      })
    },
    [form]
  )

  useEffect(() => {
    if (form.submitted || showResumeBanner) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          formData: form.formData,
          step: form.step,
          villeQuery: form.villeQuery,
          selectedVillePostal,
        })
      )
    } catch {
      // ignore
    }
  }, [
    form.formData,
    form.step,
    form.villeQuery,
    selectedVillePostal,
    form.submitted,
    showResumeBanner,
  ])

  const handleGeo = useCallback(async () => {
    const result = await form.handleGeolocation()
    if (result?.postcode) {
      setSelectedVillePostal(result.postcode)
    }
  }, [form])

  const validateStep1Extended = (): boolean => {
    const newErrors: Partial<Record<keyof DevisFormData, string>> = {}
    if (!form.formData.service) newErrors.service = 'Veuillez sélectionner un service'
    if (!form.formData.ville) newErrors.ville = 'Veuillez indiquer votre ville'
    form.setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 7→4 obligatoires : email + urgence sont optionnels sur cette étape. On
  // valide seulement le format si l'utilisateur a rempli l'email.
  const validateStep2Extended = (): boolean => {
    const newErrors: Partial<Record<keyof DevisFormData, string>> = {}
    if (form.formData.email.trim() && !form.isEmailValid(form.formData.email.trim())) {
      newErrors.email = 'Veuillez entrer une adresse e-mail valide (ex : nom@exemple.fr)'
    }
    if (
      form.formData.description.trim().length > 0 &&
      form.formData.description.trim().length < 5
    ) {
      newErrors.description =
        'Veuillez détailler davantage votre projet (5 caractères minimum) ou laisser le champ vide'
    }
    form.setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3Extended = (): boolean => {
    const newErrors: Partial<Record<keyof DevisFormData, string>> = {}
    if (!form.formData.nom.trim()) newErrors.nom = 'Veuillez entrer votre nom'
    if (!form.formData.telephone.trim()) {
      newErrors.telephone = 'Veuillez entrer votre numéro de téléphone'
    } else if (!isValidFrenchPhone(form.formData.telephone.trim())) {
      newErrors.telephone = 'Le numéro de téléphone doit contenir 10 chiffres (ex : 06 12 34 56 78)'
    }
    if (!form.formData.consentement) {
      newErrors.consentement = "Veuillez accepter d'être contacté par des artisans"
    }
    form.setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const animateToStep = useCallback((targetStep: 1 | 2 | 3, direction: 'forward' | 'backward') => {
    const outDirection = direction === 'forward' ? 'slide-out-left' : 'slide-out-right'
    const inDirection = direction === 'forward' ? 'slide-in-right' : 'slide-in-left'

    setTransition(outDirection)
    setTimeout(() => {
      form.setStep(targetStep)
      setTransition(inDirection)
      setTimeout(() => {
        setTransition('idle')
      }, 400)
    }, 200)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNext = () => {
    if (form.step === 1 && validateStep1Extended()) {
      trackEvent('form_started', {
        service: form.formData.service || '',
        source: 'devis_form',
      })
      capture(EVENT.DEVIS_STEP_COMPLETED, {
        step: 1,
        service: form.formData.service || '',
        ville: form.formData.ville || '',
      })
      animateToStep(2, 'forward')
    } else if (form.step === 2 && validateStep2Extended()) {
      form.trackAbandon(form.formData.email.trim())
      capture(EVENT.DEVIS_STEP_COMPLETED, {
        step: 2,
        service: form.formData.service || '',
      })
      animateToStep(3, 'forward')
    }
  }

  const handlePrev = () => {
    if (form.step === 2) {
      if (isMinimal) {
        animateToStep(3, 'forward')
        return
      }
      if (isPrefilled) return
      animateToStep(1, 'backward')
    } else if (form.step === 3) {
      if (isMinimal) return
      animateToStep(2, 'backward')
    }
  }

  const toggleDetails = () => {
    if (form.step === 3) animateToStep(2, 'backward')
    else animateToStep(3, 'forward')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && form.step < 3) {
      e.preventDefault()
      handleNext()
    }
  }

  const onFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (form.submitting) return
    if (!validateStep3Extended()) return

    await form.handleSubmit({
      budget: form.formData.budget,
      codePostal: selectedVillePostal,
      ...(prefilledOperation ? { sourceOperation: prefilledOperation } : {}),
    })

    if (!form.submitError) {
      trackEvent('devis_submitted', {
        service: form.formData.service || '',
        city: form.formData.ville || '',
        postalCode: selectedVillePostal || '',
        urgency: form.formData.urgence || '',
        source: 'devis_form',
        value: 45,
        currency: 'EUR',
      })
      capture(EVENT.DEVIS_SUBMITTED, {
        service: form.formData.service || '',
        ville: form.formData.ville || '',
        urgence: form.formData.urgence || '',
      })
    } else {
      capture(EVENT.DEVIS_FAILED, {
        service: form.formData.service || '',
        error: form.submitError,
      })
    }
  }

  // Step 2 = optionnelle. Toujours valide sauf email rempli et invalide, ou
  // description < 5 caractères si saisie.
  const isStep2Valid =
    (!form.formData.email.trim() || form.isEmailValid(form.formData.email)) &&
    (form.formData.description.trim().length === 0 || form.formData.description.trim().length >= 5)

  const getFieldState = (field: keyof DevisFormData): 'idle' | 'valid' | 'error' => {
    if (form.errors[field]) return 'error'
    switch (field) {
      case 'service':
        return form.formData.service ? 'valid' : 'idle'
      case 'ville':
        return form.formData.ville ? 'valid' : 'idle'
      case 'urgence':
        return form.formData.urgence ? 'valid' : 'idle'
      case 'nom':
        return form.formData.nom.trim() ? 'valid' : 'idle'
      case 'telephone':
        if (!form.formData.telephone.trim()) return 'idle'
        return isValidFrenchPhone(form.formData.telephone.trim()) ? 'valid' : 'idle'
      case 'email':
        if (!form.formData.email.trim()) return 'idle'
        return form.isEmailValid(form.formData.email.trim()) ? 'valid' : 'idle'
      default:
        return 'idle'
    }
  }

  const inputBorderClass = (field: keyof DevisFormData) => {
    const state = getFieldState(field)
    if (state === 'error') return 'border-red-400 ring-2 ring-red-50'
    if (state === 'valid') return 'border-accent-400 ring-1 ring-accent-100'
    return 'border-sand-300'
  }

  const labelClass = 'block font-heading text-sm font-semibold text-charcoal-800 mb-2'
  const inputBase =
    'w-full rounded-xl border bg-sand-50 px-4 py-3 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all duration-200'

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

  if (form.submitted) {
    return (
      <div className="bg-white rounded-3xl shadow-premium border border-sand-200 p-8 md:p-12 max-w-2xl mx-auto">
        <DevisConfirmation
          service={form.formData.service}
          city={form.formData.ville}
          phone={form.formData.telephone}
          budget={form.formData.budget || undefined}
          ceeEligible={ceeEligible}
          ceeOperationCodes={ceeOperationCodes}
          serviceSlug={form.formData.service}
          postalCode={selectedVillePostal}
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
    <div className="max-w-2xl mx-auto" data-devis-form>
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-sm font-medium">
          <Shield className="w-3.5 h-3.5" />
          100% Gratuit
        </span>
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-sm font-medium">
          <Clock className="w-3.5 h-3.5" />
          Réponse rapide
        </span>
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-sm font-medium">
          <Check className="w-3.5 h-3.5" />
          Sans engagement
        </span>
      </div>

      {showResumeBanner && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-800">Vous aviez commencé une demande</p>
            <p className="text-xs text-primary-600">
              {savedService && (
                <>Service : {services.find((s) => s.slug === savedService)?.name || savedService}</>
              )}
              {savedService && savedVille && <> — </>}
              {savedVille && <>Ville : {savedVille}</>}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleResume}
              className="text-sm font-medium text-primary-600 hover:text-primary-800"
            >
              Reprendre
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-sm text-charcoal-400 hover:text-charcoal-600"
            >
              Recommencer
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={onFormSubmit}
        noValidate
        className="bg-white rounded-3xl shadow-premium border border-sand-200 p-6 md:p-10 overflow-hidden"
      >
        {prefilledOperation && (
          <input type="hidden" name="sourceOperation" value={prefilledOperation} />
        )}
        {!isMinimal && <ProgressBar currentStep={form.step} />}

        <div className="sr-only" aria-live="assertive" aria-atomic="true">
          Étape {form.step} sur 3
          {form.step === 1
            ? ' : Votre besoin'
            : form.step === 2
              ? ' : Vos coordonnées'
              : ' : Confirmation'}
        </div>

        <div
          ref={stepContainerRef}
          className={`min-h-[320px] ${getTransitionClass()}`}
          onKeyDown={handleKeyDown}
          aria-live="polite"
        >
          {form.step === 1 && (
            <div className="space-y-6" aria-label="Étape 1 sur 3">
              <div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 mb-1">
                  {stepTitles[0].title}
                </h3>
                <p className="text-charcoal-500 text-sm">{stepTitles[0].subtitle}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-charcoal-500">
                <span className="text-amber-500">&#9733;</span>
                <span>4.8/5 basé sur des milliers de demandes traitées</span>
              </div>

              <div>
                <label htmlFor="service" className={labelClass}>
                  Type de service <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="service"
                    value={form.formData.service}
                    onChange={(e) => form.updateField('service', e.target.value)}
                    aria-describedby={form.errors.service ? 'service-error' : undefined}
                    aria-invalid={!!form.errors.service}
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
                {form.errors.service && (
                  <p
                    id="service-error"
                    role="alert"
                    className="mt-1.5 text-sm text-red-600 animate-fade-in-down"
                  >
                    {form.errors.service}
                  </p>
                )}
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
                    value={form.villeQuery}
                    onChange={(e) => {
                      const newValue = e.target.value
                      form.setVilleQuery(newValue)
                      form.setShowVilleSuggestions(true)
                      if (form.formData.ville && newValue !== form.formData.ville) {
                        form.updateField('ville', '')
                        setSelectedVillePostal('')
                      }
                    }}
                    onFocus={() => form.setShowVilleSuggestions(true)}
                    onBlur={() => {
                      setTimeout(() => form.setShowVilleSuggestions(false), 200)
                    }}
                    aria-describedby={form.errors.ville ? 'ville-error' : undefined}
                    aria-invalid={!!form.errors.ville}
                    style={{ fontSize: '16px' }}
                    className={`${inputBase} pr-10 ${inputBorderClass('ville')}`}
                  />
                  {getFieldState('ville') === 'valid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-500 animate-scale-in">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                  {form.showVilleSuggestions && form.filteredVilles.length > 0 && (
                    <ul className="absolute z-20 mt-1 w-full bg-white border border-sand-200 rounded-xl shadow-premium max-h-60 overflow-auto">
                      {form.filteredVilles.map((v) => (
                        <li key={v.slug}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors text-sm first:rounded-t-xl last:rounded-b-xl"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              form.selectVille(v.name)
                              setSelectedVillePostal(v.codePostal)
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
                  onClick={handleGeo}
                  disabled={form.geoLoading}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-700 font-medium transition-colors disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4" />
                  {form.geoLoading ? 'Localisation en cours…' : 'Utiliser ma position'}
                </button>
                {form.errors.ville && (
                  <p
                    id="ville-error"
                    role="alert"
                    className="mt-1.5 text-sm text-red-600 animate-fade-in-down"
                  >
                    {form.errors.ville}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-charcoal-400">
                <Users className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">Des artisans qualifiés référencés sur notre plateforme</p>
              </div>

              <CeePrimeEstimateCard
                serviceSlug={form.formData.service}
                postalCode={selectedVillePostal}
              />

              <button
                type="button"
                onClick={handleNext}
                disabled={!form.isStep1Valid}
                className={`w-full inline-flex items-center justify-center gap-2 font-semibold px-6 py-4 rounded-xl transition-all duration-300 text-base ${
                  form.isStep1Valid
                    ? 'bg-primary-400 hover:bg-primary-500 text-white shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 hover:scale-[1.01]'
                    : 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
                }`}
              >
                Suivant <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {form.step === 2 && (
            <div className="space-y-6" aria-label="Étape 2 sur 3">
              <div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 mb-1">
                  {stepTitles[1].title}
                </h3>
                <p className="text-charcoal-500 text-sm">{stepTitles[1].subtitle}</p>
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Votre e-mail{' '}
                  <span className="text-charcoal-400 font-normal">
                    — pour recevoir vos devis (optionnel)
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="jean.dupont@email.fr"
                    value={form.formData.email}
                    onChange={(e) => form.updateField('email', e.target.value)}
                    onBlur={() => {
                      validateField('email')
                      if (form.isEmailValid(form.formData.email.trim())) {
                        form.trackAbandon(form.formData.email.trim())
                      }
                    }}
                    aria-describedby={form.errors.email ? 'email-error' : undefined}
                    aria-invalid={!!form.errors.email}
                    style={{ fontSize: '16px' }}
                    className={`${inputBase} pr-10 ${inputBorderClass('email')}`}
                  />
                  {getFieldState('email') === 'valid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-500 animate-scale-in">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {form.errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="mt-1.5 text-sm text-red-600 animate-fade-in-down"
                  >
                    {form.errors.email}
                  </p>
                )}
                {!form.errors.email && (
                  <p className="text-xs text-charcoal-400 mt-1">
                    Confidentiel — seul votre téléphone est transmis aux artisans
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  Délai souhaité <span className="text-charcoal-400 font-normal">(optionnel)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {urgencyOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`relative flex items-center justify-center px-2 sm:px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-sm font-medium ${
                        form.formData.urgence === opt.value
                          ? 'border-primary-400 bg-primary-50 text-primary-700 ring-1 ring-primary-200 scale-[1.02]'
                          : 'border-sand-300 bg-sand-50 hover:border-sand-400 text-charcoal-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgence"
                        value={opt.value}
                        checked={form.formData.urgence === opt.value}
                        onChange={(e) => form.updateField('urgence', e.target.value)}
                        className="sr-only"
                      />
                      {form.formData.urgence === opt.value && (
                        <Check className="w-3.5 h-3.5 mr-1.5 text-primary-500" />
                      )}
                      {opt.label}
                    </label>
                  ))}
                </div>
                {form.errors.urgence && (
                  <p role="alert" className="mt-1.5 text-sm text-red-600 animate-fade-in-down">
                    {form.errors.urgence}
                  </p>
                )}
              </div>

              {form.formData.service && serviceSubcategories[form.formData.service] && (
                <div>
                  <label className={labelClass}>
                    Type de projet{' '}
                    <span className="text-charcoal-400 font-normal">
                      (cliquez pour sélectionner)
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {serviceSubcategories[form.formData.service].map((cat) => {
                      const isSelected = form.formData.description.includes(cat)
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              form.updateField(
                                'description',
                                form.formData.description
                                  .replace(cat, '')
                                  .replace(/,\s*,/g, ',')
                                  .replace(/^,\s*|,\s*$/g, '')
                                  .trim()
                              )
                            } else {
                              form.updateField(
                                'description',
                                form.formData.description
                                  ? `${form.formData.description}, ${cat}`
                                  : cat
                              )
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

              <div>
                <label htmlFor="description" className={labelClass}>
                  Décrivez votre projet{' '}
                  <span className="text-charcoal-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder={
                    form.formData.service && serviceSubcategories[form.formData.service]
                      ? 'Précisions supplémentaires (optionnel)...'
                      : "Ex: fuite d'eau dans la cuisine, remplacement chauffe-eau..."
                  }
                  value={form.formData.description}
                  onChange={(e) => form.updateField('description', e.target.value)}
                  aria-describedby={form.errors.description ? 'description-error' : undefined}
                  aria-invalid={!!form.errors.description}
                  style={{ fontSize: '16px' }}
                  className={`${inputBase} resize-none ${
                    form.errors.description
                      ? 'border-red-400 ring-2 ring-red-50'
                      : form.formData.description.trim().length >= 5
                        ? 'border-accent-400 ring-1 ring-accent-100'
                        : 'border-sand-300'
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {form.errors.description ? (
                    <p
                      id="description-error"
                      role="alert"
                      className="text-sm text-red-600 animate-fade-in-down"
                    >
                      {form.errors.description}
                    </p>
                  ) : (
                    <span />
                  )}
                  {form.formData.description.length > 0 && (
                    <span
                      className={`text-xs ${
                        form.formData.description.trim().length >= 5
                          ? 'text-accent-600'
                          : 'text-charcoal-400'
                      }`}
                    >
                      {form.formData.description.length}/5 caract.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Budget estimé <span className="text-charcoal-400 font-normal">(optionnel)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {budgetOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`relative flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-sm font-medium text-center ${
                        form.formData.budget === opt.value
                          ? 'border-primary-400 bg-primary-50 text-primary-700 ring-1 ring-primary-200 scale-[1.02]'
                          : 'border-sand-300 bg-sand-50 hover:border-sand-400 text-charcoal-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="budget"
                        value={opt.value}
                        checked={form.formData.budget === opt.value}
                        onChange={(e) => form.updateField('budget', e.target.value)}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                {(!isPrefilled || isMinimal) && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center justify-center gap-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100 font-medium px-5 py-4 rounded-xl transition-all duration-300"
                  >
                    <ArrowLeft className="w-4 h-4" /> {isMinimal ? 'Retour' : 'Précédent'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep2Valid}
                  className={`${isPrefilled && !isMinimal ? 'w-full' : 'flex-1'} inline-flex items-center justify-center gap-2 font-semibold px-6 py-4 rounded-xl transition-all duration-300 text-base ${
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

          {form.step === 3 && (
            <div className="space-y-6" aria-label="Étape 3 sur 3">
              <div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 mb-1">
                  {stepTitles[2].title}
                </h3>
                <p className="text-charcoal-500 text-sm">{stepTitles[2].subtitle}</p>
              </div>

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
                    value={form.formData.nom}
                    onChange={(e) => form.updateField('nom', e.target.value)}
                    onBlur={() => validateField('nom')}
                    aria-describedby={form.errors.nom ? 'nom-error' : undefined}
                    aria-invalid={!!form.errors.nom}
                    style={{ fontSize: '16px' }}
                    className={`${inputBase} pr-10 ${inputBorderClass('nom')}`}
                  />
                  {getFieldState('nom') === 'valid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-500 animate-scale-in">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {form.errors.nom && (
                  <p
                    id="nom-error"
                    role="alert"
                    className="mt-1.5 text-sm text-red-600 animate-fade-in-down"
                  >
                    {form.errors.nom}
                  </p>
                )}
              </div>

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
                    value={form.formData.telephone}
                    onChange={(e) => form.updateField('telephone', e.target.value)}
                    onBlur={() => validateField('telephone')}
                    aria-describedby={form.errors.telephone ? 'telephone-error' : undefined}
                    aria-invalid={!!form.errors.telephone}
                    style={{ fontSize: '16px' }}
                    className={`${inputBase} pr-10 ${inputBorderClass('telephone')}`}
                  />
                  {getFieldState('telephone') === 'valid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-500 animate-scale-in">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {form.errors.telephone && (
                  <p
                    id="telephone-error"
                    role="alert"
                    className="mt-1.5 text-sm text-red-600 animate-fade-in-down"
                  >
                    {form.errors.telephone}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      form.formData.consentement
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-sand-400 group-hover:border-primary-300'
                    }`}
                  >
                    {form.formData.consentement && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={form.formData.consentement}
                    onChange={(e) => form.updateField('consentement', e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-sm text-charcoal-600 leading-relaxed">
                    J&apos;accepte que mes données soient utilisées pour traiter ma demande et me
                    mettre en relation avec des artisans partenaires. Voir notre{' '}
                    <Link
                      href="/confidentialite"
                      className="text-primary-500 hover:text-primary-700 underline underline-offset-2"
                    >
                      politique de confidentialité
                    </Link>
                    .
                  </span>
                </label>
                {form.errors.consentement && (
                  <p role="alert" className="mt-1.5 text-sm text-red-600 animate-fade-in-down">
                    {form.errors.consentement}
                  </p>
                )}
              </div>

              {form.submitError && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 rounded-xl p-4 text-center animate-fade-in-down"
                >
                  <p className="text-sm text-red-700">{form.submitError}</p>
                  <p className="text-xs text-red-500 mt-1">Vos données sont conservées.</p>
                  <button
                    type="button"
                    onClick={() => onFormSubmit()}
                    className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-accent-600 font-medium">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Gratuit
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Sans engagement
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Artisans vérifiés SIREN
                </span>
              </div>

              <div className="flex gap-3 items-center">
                {isMinimal ? (
                  <button
                    type="button"
                    onClick={toggleDetails}
                    disabled={form.submitting}
                    className="hidden sm:inline-flex items-center justify-center gap-2 text-charcoal-500 hover:text-primary-600 hover:bg-sand-100 font-medium px-4 py-4 rounded-xl transition-all duration-300 disabled:opacity-50 text-sm whitespace-nowrap"
                  >
                    + de détails
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={form.submitting}
                    className="inline-flex items-center justify-center gap-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100 font-medium px-5 py-4 rounded-xl transition-all duration-300 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" /> Précédent
                  </button>
                )}
                <button
                  type="submit"
                  disabled={form.submitting || !form.isStep3Valid}
                  className={`flex-1 inline-flex items-center justify-center gap-2 font-semibold px-6 py-5 rounded-xl transition-all duration-300 text-lg ${
                    form.isStep3Valid && !form.submitting
                      ? 'bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 text-white shadow-cta hover:shadow-cta-hover hover:scale-[1.02] hover:-translate-y-1'
                      : 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
                  }`}
                >
                  {form.submitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      Obtenir mon devis gratuit <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-sand-100 flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5 text-charcoal-300" />
          <p className="text-xs text-charcoal-400">
            Rejoignez les <span className="font-semibold text-charcoal-500">{monthlyCount}</span>{' '}
            demandes de devis ce mois-ci
          </p>
        </div>
      </form>
    </div>
  )
}
