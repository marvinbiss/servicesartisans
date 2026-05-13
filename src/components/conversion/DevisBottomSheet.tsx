'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { X, CheckCircle, ArrowRight, ArrowLeft, MapPin, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { services } from '@/lib/data/france-light'
import { trackEvent } from '@/lib/analytics/tracking'
import { useDevisForm, urgencyOptions } from '@/hooks/useDevisForm'
import DevisConfirmation from '@/components/conversion/DevisConfirmation'
import CeePrimeEstimateCard from '@/components/devis/CeePrimeEstimateCard'

interface DevisBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  prefilledService?: string
  prefilledCity?: string
}

export default function DevisBottomSheet({
  isOpen,
  onClose,
  prefilledService,
  prefilledCity,
}: DevisBottomSheetProps) {
  const [ceeEligible, setCeeEligible] = useState(false)
  const [ceeOperationCodes, setCeeOperationCodes] = useState<string[]>([])

  const form = useDevisForm({
    source: 'bottom_sheet',
    initialData: {
      service: prefilledService || '',
      ville: prefilledCity || '',
    },
    initialStep: prefilledService && prefilledCity ? 3 : prefilledService ? 2 : 1,
    initialVilleQuery: prefilledCity || '',
    onSubmitSuccess: (responseBody) => {
      const body = responseBody as {
        cee_eligible?: boolean
        cee_operation_codes?: string[]
      } | null
      if (body?.cee_eligible) {
        setCeeEligible(true)
        setCeeOperationCodes(body.cee_operation_codes || [])
      }
    },
  })

  const [selectedVillePostal, setSelectedVillePostal] = useState('')

  const sheetRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef<number | null>(null)
  const currentTranslateY = useRef(0)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      let startStep: 1 | 2 | 3 = 1
      const newData: Record<string, string> = {}
      if (prefilledService) {
        newData.service = prefilledService
        startStep = 2
      }
      if (prefilledCity) {
        newData.ville = prefilledCity
        form.setVilleQuery(prefilledCity)
        startStep = 3
      }
      form.resetForm(newData, startStep)
      setSelectedVillePostal('')

      trackEvent('form_started', {
        service: prefilledService || '',
        source: 'bottom_sheet',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, prefilledService, prefilledCity])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

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
      if (currentTranslateY.current > 180) {
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

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await form.handleSubmit()
  }

  if (!isOpen) return null

  const stepLabels = ['Projet', 'Détails', 'Contact']

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[55] bg-charcoal-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Obtenir mon devis gratuit"
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
          <div
            className="flex-shrink-0 pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
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

          {!form.submitted && (
            <div className="flex-shrink-0 px-4 pb-3">
              <div
                className="flex items-center gap-1"
                role="progressbar"
                aria-valuenow={form.step}
                aria-valuemin={1}
                aria-valuemax={3}
                aria-label="Progression du formulaire"
              >
                {stepLabels.map((label, i) => (
                  <div key={label} className="flex items-center flex-1">
                    <div className="flex items-center gap-1.5 flex-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          form.step > i + 1
                            ? 'bg-accent-500 text-white'
                            : form.step === i + 1
                              ? 'bg-primary-400 text-white shadow-cta scale-110'
                              : 'bg-sand-200 text-charcoal-400'
                        }`}
                      >
                        {form.step > i + 1 ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <span
                        className={`text-xs hidden min-[380px]:inline ${
                          form.step === i + 1
                            ? 'font-semibold text-primary-500'
                            : 'text-charcoal-400'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < 2 && (
                      <div
                        className={`h-0.5 flex-1 mx-1 rounded-full transition-colors ${
                          form.step > i + 1 ? 'bg-accent-500' : 'bg-sand-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!form.submitted && (
            <div className="sr-only" aria-live="assertive" aria-atomic="true">
              Étape {form.step} sur 3
              {form.step === 1
                ? ' : Votre besoin'
                : form.step === 2
                  ? ' : Vos coordonnées'
                  : ' : Confirmation'}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 pb-4 overscroll-contain" aria-live="polite">
            {form.submitted ? (
              <div>
                <DevisConfirmation
                  service={form.formData.service}
                  city={form.formData.ville}
                  phone={form.formData.telephone}
                  compact
                  ceeEligible={ceeEligible}
                  ceeOperationCodes={ceeOperationCodes}
                  serviceSlug={form.formData.service}
                  postalCode={selectedVillePostal}
                />
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-primary-400 text-white font-semibold rounded-xl shadow-cta active:scale-[0.98] transition-all touch-manipulation"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={onFormSubmit} noValidate>
                {form.step === 1 && (
                  <div className="space-y-4" aria-label="Étape 1 sur 3">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        Quel service recherchez-vous ?
                      </label>
                      <div className="relative">
                        <select
                          value={form.formData.service}
                          onChange={(e) => form.updateField('service', e.target.value)}
                          className={`w-full h-12 px-4 pr-10 bg-sand-50 border rounded-xl text-charcoal-900 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-colors ${
                            form.errors.service ? 'border-red-400' : 'border-sand-300'
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
                      {form.errors.service && (
                        <p className="text-red-500 text-xs mt-1">{form.errors.service}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        Dans quelle ville ?
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={form.villeQuery}
                          onChange={(e) => {
                            form.setVilleQuery(e.target.value)
                            form.setShowVilleSuggestions(true)
                            if (e.target.value.length < 2) {
                              form.updateField('ville', '')
                              setSelectedVillePostal('')
                            }
                          }}
                          onFocus={() => form.setShowVilleSuggestions(true)}
                          placeholder="Ville ou code postal"
                          className={`w-full h-12 px-4 pr-20 bg-sand-50 border rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-colors ${
                            form.errors.ville ? 'border-red-400' : 'border-sand-300'
                          }`}
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const result = await form.handleGeolocation()
                            if (result?.postcode) {
                              setSelectedVillePostal(result.postcode)
                            }
                          }}
                          disabled={form.geoLoading}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-400 hover:text-primary-600 transition-colors touch-manipulation"
                          aria-label="Utiliser ma position"
                        >
                          <MapPin className={`w-5 h-5 ${form.geoLoading ? 'animate-pulse' : ''}`} />
                        </button>
                      </div>
                      {form.errors.ville && (
                        <p className="text-red-500 text-xs mt-1">{form.errors.ville}</p>
                      )}
                      {form.showVilleSuggestions && form.filteredVilles.length > 0 && (
                        <div className="mt-1 bg-white border border-sand-300 rounded-xl shadow-soft overflow-hidden max-h-48 overflow-y-auto">
                          {form.filteredVilles.map((v) => (
                            <button
                              key={`${v.name}-${v.codePostal}`}
                              type="button"
                              onClick={() => {
                                form.selectVille(v.name)
                                setSelectedVillePostal(v.codePostal)
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-sand-50 transition-colors flex items-center gap-2 touch-manipulation"
                            >
                              <MapPin className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0" />
                              <span className="text-charcoal-800">{v.name}</span>
                              <span className="text-charcoal-400 text-xs ml-auto">
                                {v.codePostal}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {form.formData.service && selectedVillePostal && (
                      <CeePrimeEstimateCard
                        serviceSlug={form.formData.service}
                        postalCode={selectedVillePostal}
                      />
                    )}

                    <button
                      type="button"
                      onClick={form.validateAndNext}
                      className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-cta active:scale-[0.98] transition-all flex items-center justify-center gap-2 touch-manipulation"
                    >
                      Continuer
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {form.step === 2 && (
                  <div className="space-y-4" aria-label="Étape 2 sur 3">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        Votre e-mail{' '}
                        <span className="text-charcoal-400 font-normal">
                          — pour recevoir vos devis (optionnel)
                        </span>
                      </label>
                      <input
                        type="email"
                        inputMode="email"
                        value={form.formData.email}
                        onChange={(e) => form.updateField('email', e.target.value)}
                        onBlur={() => {
                          if (form.isEmailValid(form.formData.email.trim())) {
                            form.trackAbandon(form.formData.email.trim())
                          }
                        }}
                        placeholder="votre@email.fr"
                        className={`w-full h-12 px-4 bg-sand-50 border rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-colors ${
                          form.errors.email ? 'border-red-400' : 'border-sand-300'
                        }`}
                        autoComplete="email"
                      />
                      {form.errors.email && (
                        <p className="text-red-500 text-xs mt-1">{form.errors.email}</p>
                      )}
                      {!form.errors.email && (
                        <p className="text-xs text-charcoal-400 mt-1">
                          Confidentiel — seul votre téléphone est transmis aux artisans
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        Quand souhaitez-vous les travaux ?{' '}
                        <span className="text-charcoal-400 font-normal">(optionnel)</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {urgencyOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => form.updateField('urgence', opt.value)}
                            className={`h-11 px-3 rounded-xl text-sm font-medium border transition-all touch-manipulation ${
                              form.formData.urgence === opt.value
                                ? 'border-primary-400 bg-primary-50 text-primary-700 shadow-cta'
                                : 'border-sand-300 bg-sand-50 text-charcoal-600 hover:border-sand-400'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {form.errors.urgence && (
                        <p className="text-red-500 text-xs mt-1">{form.errors.urgence}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        Décrivez votre projet{' '}
                        <span className="text-charcoal-400 font-normal">(optionnel)</span>
                      </label>
                      <textarea
                        value={form.formData.description}
                        onChange={(e) => form.updateField('description', e.target.value)}
                        rows={3}
                        placeholder="Ex: fuite d'eau dans la cuisine, remplacement chauffe-eau..."
                        className="w-full px-4 py-3 bg-sand-50 border border-sand-300 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-colors resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => form.setStep(1)}
                        className="h-12 px-4 border border-sand-300 rounded-xl text-charcoal-600 font-medium hover:bg-sand-50 transition-colors flex items-center gap-1 touch-manipulation"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                      </button>
                      <button
                        type="button"
                        onClick={form.validateAndNext}
                        className="flex-1 h-12 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-cta active:scale-[0.98] transition-all flex items-center justify-center gap-2 touch-manipulation"
                      >
                        Continuer
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {form.step === 3 && (
                  <div className="space-y-3" aria-label="Étape 3 sur 3">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Votre nom
                      </label>
                      <input
                        type="text"
                        value={form.formData.nom}
                        onChange={(e) => form.updateField('nom', e.target.value)}
                        placeholder="Votre nom complet"
                        className={`w-full h-12 px-4 bg-sand-50 border rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-colors ${
                          form.errors.nom ? 'border-red-400' : 'border-sand-300'
                        }`}
                        autoComplete="name"
                      />
                      {form.errors.nom && (
                        <p className="text-red-500 text-xs mt-0.5">{form.errors.nom}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={form.formData.telephone}
                        onChange={(e) => form.updateField('telephone', e.target.value)}
                        inputMode="tel"
                        placeholder="06 12 34 56 78"
                        className={`w-full h-12 px-4 bg-sand-50 border rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-colors ${
                          form.errors.telephone ? 'border-red-400' : 'border-sand-300'
                        }`}
                        autoComplete="tel"
                      />
                      {form.errors.telephone && (
                        <p className="text-red-500 text-xs mt-0.5">{form.errors.telephone}</p>
                      )}
                    </div>

                    <label className="flex items-start gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        checked={form.formData.consentement}
                        onChange={(e) => form.updateField('consentement', e.target.checked)}
                        className="mt-0.5 w-5 h-5 rounded border-sand-400 text-primary-400 focus:ring-primary-400/40 flex-shrink-0"
                      />
                      <span className="text-xs text-charcoal-500 leading-relaxed">
                        J&apos;accepte que mes données soient utilisées pour traiter ma demande et
                        me mettre en relation avec des artisans partenaires. Voir notre{' '}
                        <Link
                          href="/confidentialite"
                          className="underline text-primary-500 hover:text-primary-600"
                        >
                          politique de confidentialité
                        </Link>
                        .
                      </span>
                    </label>
                    {form.errors.consentement && (
                      <p className="text-red-500 text-xs">{form.errors.consentement}</p>
                    )}

                    {form.submitError && (
                      <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                        {form.submitError}
                      </p>
                    )}

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => form.setStep(2)}
                        className="h-12 px-4 border border-sand-300 rounded-xl text-charcoal-600 font-medium hover:bg-sand-50 transition-colors flex items-center gap-1 touch-manipulation"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="submit"
                        disabled={form.submitting}
                        className="flex-1 h-12 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold rounded-xl shadow-cta active:scale-[0.98] transition-all flex items-center justify-center gap-2 touch-manipulation"
                      >
                        {form.submitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>Obtenir mon devis gratuit</>
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

      <noscript>
        <Link
          href="/devis"
          className="fixed bottom-4 left-4 right-4 z-[56] block text-center py-3 bg-primary-400 text-white font-semibold rounded-xl md:hidden"
        >
          Obtenir mon devis gratuit
        </Link>
      </noscript>
    </>
  )
}
