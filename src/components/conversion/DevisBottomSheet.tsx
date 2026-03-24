'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, CheckCircle, ArrowRight, ArrowLeft, MapPin, ChevronDown } from 'lucide-react'
import { services, villes } from '@/lib/data/france'
import { trackEvent } from '@/lib/analytics/tracking'

/* ─── Types ────────────────────────────────────────────────────────── */

interface FormData {
  service: string
  ville: string
  description: string
  urgence: string
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
  nom: '',
  telephone: '',
  email: '',
  consentement: false,
}

const urgencyOptions = [
  { value: 'flexible', label: 'Pas urgent' },
  { value: 'semaine', label: 'Cette semaine' },
  { value: 'urgent', label: 'Urgent (sous 24h)' },
]

/* ─── Helpers ──────────────────────────────────────────────────────── */

function isValidFrenchPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s.\-()]/g, '')
  if (/^0[1-9]\d{8}$/.test(cleaned)) return true
  if (/^\+33[1-9]\d{8}$/.test(cleaned)) return true
  return false
}

/* ─── Component ────────────────────────────────────────────────────── */

interface DevisBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  /** Pre-fill service slug */
  prefilledService?: string
  /** Pre-fill city */
  prefilledCity?: string
}

export default function DevisBottomSheet({
  isOpen,
  onClose,
  prefilledService,
  prefilledCity,
}: DevisBottomSheetProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [villeQuery, setVilleQuery] = useState('')
  const [showVilleSuggestions, setShowVilleSuggestions] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)

  const sheetRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef<number | null>(null)
  const currentTranslateY = useRef(0)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Pre-fill on open
  useEffect(() => {
    if (isOpen) {
      const newData = { ...initialFormData }
      let startStep: 1 | 2 | 3 = 1
      if (prefilledService) {
        newData.service = prefilledService
        startStep = 2
      }
      if (prefilledCity) {
        newData.ville = prefilledCity
        setVilleQuery(prefilledCity)
        startStep = 3
      }
      setFormData(newData)
      setStep(startStep)
      setErrors({})
      setSubmitted(false)
      setSubmitError(null)

      trackEvent('form_started', {
        service: prefilledService || '',
        source: 'bottom_sheet',
      })
    }
  }, [isOpen, prefilledService, prefilledCity])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  // Trap focus inside sheet
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.key === 'Tab' && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  /* ─── Drag-to-dismiss ──────────────────────────────── */

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY
    currentTranslateY.current = 0
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null) return
    const delta = e.touches[0].clientY - dragStartY.current
    if (delta > 0) {
      currentTranslateY.current = delta
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${delta}px)`
        sheetRef.current.style.transition = 'none'
      }
      if (overlayRef.current) {
        overlayRef.current.style.opacity = `${Math.max(0, 1 - delta / 300)}`
      }
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (dragStartY.current === null) return
    dragStartY.current = null
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
      if (currentTranslateY.current > 120) {
        sheetRef.current.style.transform = 'translateY(100%)'
        setTimeout(onClose, 300)
      } else {
        sheetRef.current.style.transform = 'translateY(0)'
      }
    }
    if (overlayRef.current) {
      overlayRef.current.style.opacity = ''
      overlayRef.current.style.transition = 'opacity 0.3s ease'
    }
    currentTranslateY.current = 0
  }, [onClose])

  /* ─── Form logic ───────────────────────────────────── */

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

  const filteredVilles = villeQuery.length >= 2
    ? villes
        .filter((v) =>
          v.name.toLowerCase().includes(villeQuery.toLowerCase()) ||
          v.codePostal.startsWith(villeQuery)
        )
        .slice(0, 6)
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
      if (data.features?.length > 0) {
        const cityName = data.features[0].properties.city || data.features[0].properties.name
        if (cityName) {
          updateField('ville', cityName)
          setVilleQuery(cityName)
        }
      }
    } catch {
      // Silently fail
    } finally {
      setGeoLoading(false)
    }
  }, [updateField])

  const validateAndNext = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (step === 1) {
      if (!formData.service) newErrors.service = 'Choisissez un service'
      if (!formData.ville) newErrors.ville = 'Indiquez votre ville'
      if (Object.keys(newErrors).length === 0) setStep(2)
    } else if (step === 2) {
      if (!formData.urgence) newErrors.urgence = 'Choisissez un delai'
      if (Object.keys(newErrors).length === 0) setStep(3)
    }
    setErrors(newErrors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.nom.trim()) newErrors.nom = 'Votre nom est requis'
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Votre telephone est requis'
    } else if (!isValidFrenchPhone(formData.telephone.trim())) {
      newErrors.telephone = 'Numero invalide'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Votre e-mail est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'E-mail invalide'
    }
    if (!formData.consentement) {
      newErrors.consentement = 'Veuillez accepter'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: formData.service,
          ville: formData.ville,
          description: formData.description,
          urgency: formData.urgence,
          nom: formData.nom,
          telephone: formData.telephone,
          email: formData.email,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Erreur serveur')
      }
      trackEvent('form_completed', {
        service: formData.service,
        source: 'bottom_sheet',
      })
      setSubmitted(true)
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setSubmitError('Erreur de connexion. Vérifiez votre internet.')
      } else if (err instanceof Error) {
        setSubmitError(err.message)
      } else {
        setSubmitError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  /* ─── Render ───────────────────────────────────────── */

  if (!isOpen) return null

  const stepLabels = ['Projet', 'Details', 'Contact']

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[55] bg-charcoal-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Demander un devis gratuit"
        className="fixed bottom-0 left-0 right-0 z-[56] md:hidden"
        style={{
          transform: 'translateY(0)',
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div
          className="bg-white rounded-t-2xl shadow-premium max-h-[85vh] flex flex-col"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* Handle + Header */}
          <div
            className="flex-shrink-0 pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-sand-400 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between px-4">
              <h2 className="font-heading font-semibold text-lg text-charcoal-900">
                Devis gratuit
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full text-charcoal-400 hover:text-charcoal-600 hover:bg-sand-100 transition-colors touch-manipulation"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Step indicator — compact */}
          {!submitted && (
            <div className="flex-shrink-0 px-4 pb-3">
              <div className="flex items-center gap-1">
                {stepLabels.map((label, i) => (
                  <div key={label} className="flex items-center flex-1">
                    <div className="flex items-center gap-1.5 flex-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          step > i + 1
                            ? 'bg-accent-500 text-white'
                            : step === i + 1
                            ? 'bg-primary-400 text-white shadow-cta scale-110'
                            : 'bg-sand-200 text-charcoal-400'
                        }`}
                      >
                        {step > i + 1 ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <span
                        className={`text-xs hidden min-[380px]:inline ${
                          step === i + 1 ? 'font-semibold text-primary-500' : 'text-charcoal-400'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < 2 && (
                      <div
                        className={`h-0.5 flex-1 mx-1 rounded-full transition-colors ${
                          step > i + 1 ? 'bg-accent-500' : 'bg-sand-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content — scrollable */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 overscroll-contain">
            {submitted ? (
              /* ── Success ── */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-accent-500" />
                </div>
                <h3 className="font-heading font-bold text-xl text-charcoal-900 mb-2">
                  Demande envoyee !
                </h3>
                <p className="text-charcoal-500 text-sm mb-6">
                  Vous recevrez jusqu'a 3 devis gratuits sous 24h.
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-primary-400 text-white font-semibold rounded-xl shadow-cta active:scale-[0.98] transition-all touch-manipulation"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* ── Step 1: Service + Ville ── */}
                {step === 1 && (
                  <div className="space-y-4">
                    {/* Service */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        Quel service recherchez-vous ?
                      </label>
                      <div className="relative">
                        <select
                          value={formData.service}
                          onChange={(e) => updateField('service', e.target.value)}
                          className={`w-full h-12 px-4 pr-10 bg-sand-50 border rounded-xl text-charcoal-900 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-colors ${
                            errors.service ? 'border-red-400' : 'border-sand-300'
                          }`}
                        >
                          <option value="">Choisir un service...</option>
                          {services.map((s) => (
                            <option key={s.slug} value={s.slug}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 pointer-events-none" />
                      </div>
                      {errors.service && (
                        <p className="text-red-500 text-xs mt-1">{errors.service}</p>
                      )}
                    </div>

                    {/* Ville */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        Dans quelle ville ?
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={villeQuery}
                          onChange={(e) => {
                            setVilleQuery(e.target.value)
                            setShowVilleSuggestions(true)
                            if (e.target.value.length < 2) updateField('ville', '')
                          }}
                          onFocus={() => setShowVilleSuggestions(true)}
                          placeholder="Ville ou code postal"
                          className={`w-full h-12 px-4 pr-20 bg-sand-50 border rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-colors ${
                            errors.ville ? 'border-red-400' : 'border-sand-300'
                          }`}
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={handleGeolocation}
                          disabled={geoLoading}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-400 hover:text-primary-600 transition-colors touch-manipulation"
                          aria-label="Utiliser ma position"
                        >
                          <MapPin className={`w-5 h-5 ${geoLoading ? 'animate-pulse' : ''}`} />
                        </button>
                      </div>
                      {errors.ville && (
                        <p className="text-red-500 text-xs mt-1">{errors.ville}</p>
                      )}
                      {/* Suggestions */}
                      {showVilleSuggestions && filteredVilles.length > 0 && (
                        <div className="mt-1 bg-white border border-sand-300 rounded-xl shadow-soft overflow-hidden max-h-48 overflow-y-auto">
                          {filteredVilles.map((v) => (
                            <button
                              key={`${v.name}-${v.codePostal}`}
                              type="button"
                              onClick={() => {
                                updateField('ville', v.name)
                                setVilleQuery(v.name)
                                setShowVilleSuggestions(false)
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-sand-50 transition-colors flex items-center gap-2 touch-manipulation"
                            >
                              <MapPin className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0" />
                              <span className="text-charcoal-800">{v.name}</span>
                              <span className="text-charcoal-400 text-xs ml-auto">{v.codePostal}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={validateAndNext}
                      className="w-full h-12 bg-primary-400 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-cta active:scale-[0.98] transition-all flex items-center justify-center gap-2 touch-manipulation"
                    >
                      Continuer
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ── Step 2: Urgence + Description ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        Quand souhaitez-vous les travaux ?
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {urgencyOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateField('urgence', opt.value)}
                            className={`h-11 px-3 rounded-xl text-sm font-medium border transition-all touch-manipulation ${
                              formData.urgence === opt.value
                                ? 'border-primary-400 bg-primary-50 text-primary-700 shadow-cta'
                                : 'border-sand-300 bg-sand-50 text-charcoal-600 hover:border-sand-400'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {errors.urgence && (
                        <p className="text-red-500 text-xs mt-1">{errors.urgence}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        Decrivez votre projet <span className="text-charcoal-400 font-normal">(optionnel)</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        rows={3}
                        placeholder="Ex: Fuite sous l'evier de la cuisine..."
                        className="w-full px-4 py-3 bg-sand-50 border border-sand-300 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-colors resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="h-12 px-4 border border-sand-300 rounded-xl text-charcoal-600 font-medium hover:bg-sand-50 transition-colors flex items-center gap-1 touch-manipulation"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                      </button>
                      <button
                        type="button"
                        onClick={validateAndNext}
                        className="flex-1 h-12 bg-primary-400 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-cta active:scale-[0.98] transition-all flex items-center justify-center gap-2 touch-manipulation"
                      >
                        Continuer
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Step 3: Contact ── */}
                {step === 3 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Votre nom
                      </label>
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => updateField('nom', e.target.value)}
                        placeholder="Prenom Nom"
                        className={`w-full h-12 px-4 bg-sand-50 border rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-colors ${
                          errors.nom ? 'border-red-400' : 'border-sand-300'
                        }`}
                        autoComplete="name"
                      />
                      {errors.nom && <p className="text-red-500 text-xs mt-0.5">{errors.nom}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Telephone
                      </label>
                      <input
                        type="tel"
                        value={formData.telephone}
                        onChange={(e) => updateField('telephone', e.target.value)}
                        placeholder="06 12 34 56 78"
                        className={`w-full h-12 px-4 bg-sand-50 border rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-colors ${
                          errors.telephone ? 'border-red-400' : 'border-sand-300'
                        }`}
                        autoComplete="tel"
                      />
                      {errors.telephone && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.telephone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="votre@email.fr"
                        className={`w-full h-12 px-4 bg-sand-50 border rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-colors ${
                          errors.email ? 'border-red-400' : 'border-sand-300'
                        }`}
                        autoComplete="email"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>
                      )}
                    </div>

                    <label className="flex items-start gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        checked={formData.consentement}
                        onChange={(e) => updateField('consentement', e.target.checked)}
                        className="mt-0.5 w-5 h-5 rounded border-sand-400 text-primary-400 focus:ring-primary-400/40 flex-shrink-0"
                      />
                      <span className="text-xs text-charcoal-500 leading-relaxed">
                        J'accepte d'être contacté par des artisans pour recevoir mes devis gratuits.
                      </span>
                    </label>
                    {errors.consentement && (
                      <p className="text-red-500 text-xs">{errors.consentement}</p>
                    )}

                    {submitError && (
                      <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                        {submitError}
                      </p>
                    )}

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="h-12 px-4 border border-sand-300 rounded-xl text-charcoal-600 font-medium hover:bg-sand-50 transition-colors flex items-center gap-1 touch-manipulation"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 h-12 bg-primary-400 hover:bg-primary-500 disabled:opacity-60 text-white font-semibold rounded-xl shadow-cta active:scale-[0.98] transition-all flex items-center justify-center gap-2 touch-manipulation"
                      >
                        {submitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>Recevoir mes devis</>
                        )}
                      </button>
                    </div>

                    <p className="text-[10px] text-charcoal-400 text-center">
                      Gratuit et sans engagement
                    </p>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Noscript fallback */}
      <noscript>
        <a href="/devis" className="fixed bottom-4 left-4 right-4 z-[56] block text-center py-3 bg-primary-400 text-white font-semibold rounded-xl md:hidden">
          Demander un devis gratuit
        </a>
      </noscript>
    </>
  )
}
