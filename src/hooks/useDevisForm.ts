'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { villesLight } from '@/lib/data/france-light'
import type { Ville } from '@/lib/data/france-light'
import { trackEvent } from '@/lib/analytics/tracking'
import { isValidFrenchPhone, cleanPhone } from '@/lib/validation/phone'

let _allVilles: Ville[] | null = null
function getAllVilles(): Promise<Ville[]> {
  if (_allVilles) return Promise.resolve(_allVilles)
  return import('@/lib/data/france').then((m) => {
    _allVilles = m.villes
    return m.villes
  })
}

export interface DevisFormData {
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

export const initialDevisFormData: DevisFormData = {
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

export const urgencyOptions = [
  { value: 'flexible', label: 'Pas urgent' },
  { value: 'mois', label: 'Ce mois-ci' },
  { value: 'semaine', label: 'Cette semaine' },
  { value: 'urgent', label: 'Urgent' },
]

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Map des noms de champs serveur (zod schema /api/devis) vers les noms côté
// client (DevisFormData). 'urgency' (API) ↔ 'urgence' (FR client).
const SERVER_FIELD_MAP: Record<string, keyof DevisFormData> = {
  service: 'service',
  ville: 'ville',
  description: 'description',
  urgency: 'urgence',
  budget: 'budget',
  nom: 'nom',
  telephone: 'telephone',
  email: 'email',
}

// À quel step appartient chaque champ. Permet de revenir sur l'étape la plus
// précoce où une erreur de validation serveur a été détectée.
const STEP_FIELD_MAP: Record<keyof DevisFormData, 1 | 2 | 3> = {
  service: 1,
  ville: 1,
  description: 2,
  urgence: 2,
  budget: 2,
  email: 2,
  nom: 3,
  telephone: 3,
  consentement: 3,
}

interface UseDevisFormOptions {
  source: string
  initialData?: Partial<DevisFormData>
  initialStep?: 1 | 2 | 3
  initialVilleQuery?: string
  villeQueryDebounceMs?: number
  onSubmitSuccess?: (response: unknown) => void
}

export function useDevisForm(options: UseDevisFormOptions) {
  const {
    source,
    initialData,
    initialStep = 1,
    initialVilleQuery = '',
    villeQueryDebounceMs = 0,
    onSubmitSuccess,
  } = options

  const [step, setStep] = useState<1 | 2 | 3>(initialStep)
  const [formData, setFormData] = useState<DevisFormData>({
    ...initialDevisFormData,
    ...initialData,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof DevisFormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  // Audit funnel vague 4 (2026-05-04) :
  // - 'duplicate' : 409 du serveur (demande similaire dans l'heure) — affiché
  //   en info (vert), pas en erreur (rouge).
  // - 'pending_dispatch' : 200 mais artisans_notified === 0 — succès partiel,
  //   l'équipe recontacte sous 24h.
  const [submitOutcome, setSubmitOutcome] = useState<'duplicate' | 'pending_dispatch' | null>(null)

  const [villeQuery, setVilleQuery] = useState(initialVilleQuery)
  const [showVilleSuggestions, setShowVilleSuggestions] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [filteredVilles, setFilteredVilles] = useState<Ville[]>([])

  const abandonTrackedRef = useRef(false)

  const updateField = useCallback(
    <K extends keyof DevisFormData>(field: K, value: DevisFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    },
    []
  )

  const resetForm = useCallback((data?: Partial<DevisFormData>, resetStep?: 1 | 2 | 3) => {
    setFormData({ ...initialDevisFormData, ...data })
    setStep(resetStep ?? 1)
    setErrors({})
    setSubmitted(false)
    setSubmitError(null)
    setSubmitOutcome(null)
    abandonTrackedRef.current = false
  }, [])

  const debouncedQuery = useDebouncedValue(villeQuery, villeQueryDebounceMs)
  const effectiveQuery = villeQueryDebounceMs > 0 ? debouncedQuery : villeQuery

  useEffect(() => {
    if (effectiveQuery.length < 2) {
      setFilteredVilles([])
      return
    }
    const q = effectiveQuery.toLowerCase()
    const filterList = (list: Ville[]) => {
      const results: Ville[] = []
      for (const v of list) {
        if (v.name.toLowerCase().startsWith(q) || v.codePostal.startsWith(effectiveQuery)) {
          results.push(v)
          if (results.length >= 8) break
        }
      }
      return results
    }
    setFilteredVilles(filterList(villesLight))
    getAllVilles().then((full) => setFilteredVilles(filterList(full)))
  }, [effectiveQuery])

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
        const feature = data.features[0]
        const cityName = feature.properties.city || feature.properties.name
        const postcode = feature.properties.postcode
        if (cityName) {
          updateField('ville', cityName)
          setVilleQuery(cityName)
          return { cityName, postcode: postcode || '' }
        }
      }
    } catch {
      // Silently fail
    } finally {
      setGeoLoading(false)
    }
    return null
  }, [updateField])

  const trackAbandon = useCallback(
    async (email: string) => {
      if (abandonTrackedRef.current || !email || !EMAIL_REGEX.test(email)) return
      abandonTrackedRef.current = true
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
    },
    [formData.service, formData.ville]
  )

  const isEmailValid = (email: string) => EMAIL_REGEX.test(email.trim())

  const validateStep1 = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof DevisFormData, string>> = {}
    if (!formData.service) newErrors.service = 'Choisissez un service'
    if (!formData.ville) newErrors.ville = 'Indiquez votre ville'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData.service, formData.ville])

  // 7→4 obligatoires : email + urgence sont optionnels. On valide le format
  // uniquement si l'utilisateur a rempli l'email.
  const validateStep2 = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof DevisFormData, string>> = {}
    if (formData.email.trim() && !isEmailValid(formData.email)) {
      newErrors.email = 'E-mail invalide'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData.email])

  const validateStep3 = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof DevisFormData, string>> = {}
    if (!formData.nom.trim()) newErrors.nom = 'Votre nom est requis'
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Votre téléphone est requis'
    } else if (!isValidFrenchPhone(formData.telephone.trim())) {
      newErrors.telephone = 'Numéro invalide'
    }
    if (!formData.consentement) {
      newErrors.consentement = 'Veuillez accepter'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData.nom, formData.telephone, formData.consentement])

  const validateAndNext = useCallback(() => {
    if (step === 1) {
      if (validateStep1()) setStep(2)
    } else if (step === 2) {
      if (validateStep2()) {
        if (formData.email.trim()) trackAbandon(formData.email.trim())
        setStep(3)
      }
    }
  }, [step, validateStep1, validateStep2, trackAbandon, formData.email])

  const handleSubmit = useCallback(
    async (extraPayload?: Record<string, unknown>) => {
      if (submitting) return
      if (!validateStep3()) return

      setSubmitting(true)
      setSubmitError(null)
      setSubmitOutcome(null)

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
            telephone: cleanPhone(formData.telephone),
            email: formData.email,
            ...extraPayload,
          }),
        })

        // Audit funnel vague 4 (2026-05-04) F1 :
        // Parser body.details.fieldErrors (Zod flatten) et mapper aux champs
        // côté client. Avant : "Erreur serveur" générique → ~60% du drop-off.
        if (res.status === 400) {
          const body = await res.json().catch(() => null)
          const fieldErrors = body?.details?.fieldErrors as
            | Record<string, string[] | undefined>
            | undefined
          if (fieldErrors) {
            const newErrors: Partial<Record<keyof DevisFormData, string>> = {}
            let earliestStep: 1 | 2 | 3 = 3
            for (const [serverField, messages] of Object.entries(fieldErrors)) {
              const clientField = SERVER_FIELD_MAP[serverField]
              const message = messages?.[0]
              if (clientField && message) {
                newErrors[clientField] = message
                const fieldStep = STEP_FIELD_MAP[clientField]
                if (fieldStep < earliestStep) earliestStep = fieldStep
              }
            }
            if (Object.keys(newErrors).length > 0) {
              setErrors(newErrors)
              if (earliestStep < step) setStep(earliestStep)
              setSubmitError('Vérifiez les champs surlignés.')
              return
            }
          }
          throw new Error(body?.error || 'Données invalides')
        }

        // Audit funnel vague 4 (2026-05-04) F4 :
        // 409 = demande similaire déjà soumise dans l'heure. Pas une erreur,
        // mais une info pédago. On valide le submit et DevisConfirmation gère
        // le rendu différencié via submitOutcome.
        if (res.status === 409) {
          setSubmitOutcome('duplicate')
          trackEvent('form_completed', {
            service: formData.service,
            source,
            outcome: 'duplicate',
          })
          setSubmitted(true)
          onSubmitSuccess?.(null)
          return null
        }

        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.error || 'Erreur serveur')
        }

        const responseBody = await res.json().catch(() => null)

        if (formData.email.trim()) {
          fetch('/api/devis/abandon-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email.trim() }),
          }).catch(() => {})
        }

        // Audit funnel vague 4 (2026-05-04) F3 :
        // Pipedrive silent failure — si artisans_notified === 0, le lead est
        // créé en DB mais aucun artisan n'a été notifié (pas de match ou
        // dispatch en échec). Surfacer l'info au lieu de afficher succès brut.
        const artisansNotified =
          typeof responseBody?.artisans_notified === 'number' ? responseBody.artisans_notified : 0
        if (artisansNotified === 0) {
          setSubmitOutcome('pending_dispatch')
          trackEvent('form_completed_no_artisans', {
            service: formData.service,
            source,
          })
        }

        trackEvent('form_completed', {
          service: formData.service,
          source,
          artisans_notified: artisansNotified,
        })

        setSubmitted(true)
        onSubmitSuccess?.(responseBody)
        return responseBody
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
    },
    [submitting, validateStep3, formData, source, onSubmitSuccess, step]
  )

  const selectVille = useCallback(
    (name: string, postcode?: string) => {
      updateField('ville', name)
      setVilleQuery(name)
      setShowVilleSuggestions(false)
      return postcode
    },
    [updateField]
  )

  const isStep1Valid = !!formData.service && !!formData.ville
  // Step 2 est toujours valide (champs optionnels) sauf si l'email rempli est invalide.
  const isStep2Valid = !formData.email.trim() || isEmailValid(formData.email)
  const isStep3Valid =
    !!formData.nom.trim() &&
    !!formData.telephone.trim() &&
    isValidFrenchPhone(formData.telephone.trim()) &&
    formData.consentement

  return {
    step,
    setStep,
    formData,
    setFormData,
    errors,
    setErrors,
    submitted,
    setSubmitted,
    submitting,
    submitError,
    setSubmitError,
    submitOutcome,
    setSubmitOutcome,

    villeQuery,
    setVilleQuery,
    showVilleSuggestions,
    setShowVilleSuggestions,
    filteredVilles,
    geoLoading,

    updateField,
    resetForm,
    handleGeolocation,
    trackAbandon,
    validateStep1,
    validateStep2,
    validateStep3,
    validateAndNext,
    handleSubmit,
    selectVille,

    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isEmailValid,
  }
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export type UseDevisFormReturn = ReturnType<typeof useDevisForm>
