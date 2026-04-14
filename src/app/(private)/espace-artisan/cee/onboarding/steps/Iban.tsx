'use client'

/**
 * Iban step — IBAN + BIC + titulaire form with live client-side validation.
 *
 * Validation:
 * - IBAN: FR/SEPA format (2 letters + 2 digits + up to 30 alphanum, no spaces)
 * - BIC: 8 or 11 alphanumeric chars
 * - Titulaire: required, 2-80 chars
 *
 * API: POST /api/cee/partners/onboarding/iban
 * Error handling: 400/401/403/429
 *
 * WCAG 2.1 AA: explicit labels, aria-describedby on error messages,
 *              aria-live on form-level error.
 * 8 states: default, hover, focus, active, disabled, loading, error, success
 */

import { useCallback, useState } from 'react'
import { ChevronRight, CreditCard, CheckCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { CeePartnerData } from '../page'

interface IbanProps {
  partner: CeePartnerData | null
  onNext: () => void
  onPartnerRefresh: () => Promise<void>
}

interface FormState {
  iban: string
  bic: string
  titulaire: string
}

interface FieldErrors {
  iban?: string
  bic?: string
  titulaire?: string
}

/** Strip whitespace and uppercase */
function normaliseIban(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase()
}

/** FR or general SEPA IBAN: 2-letter country + 2 digits + 10-30 alphanum */
function validateIban(iban: string): string | null {
  const normalised = normaliseIban(iban)
  if (!normalised) return 'L\'IBAN est requis.'
  // Basic SEPA format: 2 alpha + 2 digit + 10–30 alphanum = total 14–34
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$/.test(normalised)) {
    return 'Format IBAN invalide. Exemple : FR76 3000 6000 0112 3456 7890 189'
  }
  return null
}

/** BIC: 8 or 11 alphanumeric */
function validateBic(bic: string): string | null {
  const normalised = bic.trim().toUpperCase()
  if (!normalised) return 'Le BIC est requis.'
  if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(normalised)) {
    return 'Format BIC invalide. Exemple : BNPAFRPP ou BNPAFRPPXXX'
  }
  return null
}

function validateTitulaire(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Le nom du titulaire est requis.'
  if (trimmed.length < 2) return 'Le nom doit comporter au moins 2 caractères.'
  if (trimmed.length > 80) return 'Le nom ne peut pas dépasser 80 caractères.'
  return null
}

function validateAll(form: FormState): FieldErrors {
  return {
    iban: validateIban(form.iban) ?? undefined,
    bic: validateBic(form.bic) ?? undefined,
    titulaire: validateTitulaire(form.titulaire) ?? undefined,
  }
}

function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean)
}

export default function Iban({ partner, onNext, onPartnerRefresh }: IbanProps) {
  const isAlreadySaved = Boolean(partner?.iban_last4)
  const [showModifyForm, setShowModifyForm] = useState(false)

  const [form, setForm] = useState<FormState>({
    iban: '',
    bic: partner?.bic ?? '',
    titulaire: partner?.titulaire_compte ?? '',
  })
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    iban: false,
    bic: false,
    titulaire: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)

  const fieldErrors = validateAll(form)

  const handleChange = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
        setApiError('')
      },
    []
  )

  const handleBlur = useCallback(
    (field: keyof FormState) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }))
    },
    []
  )

  // Show error only if field touched
  function visibleError(field: keyof FormState): string | undefined {
    return touched[field] ? fieldErrors[field] : undefined
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Touch all fields to show errors
    setTouched({ iban: true, bic: true, titulaire: true })
    if (hasErrors(fieldErrors)) return

    setIsLoading(true)
    setApiError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/cee/partners/onboarding/iban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iban: normaliseIban(form.iban),
          bic: form.bic.trim().toUpperCase(),
          titulaire: form.titulaire.trim(),
        }),
      })

      const json = await res.json().catch(() => ({}))

      if (res.status === 429) {
        setApiError(
          'Trop de tentatives. Veuillez patienter une minute avant de réessayer.'
        )
        return
      }
      if (res.status === 401 || res.status === 403) {
        setApiError('Session expirée. Veuillez vous reconnecter.')
        return
      }
      if (!res.ok) {
        setApiError(
          json?.error?.message ||
            'Une erreur est survenue. Veuillez réessayer.'
        )
        return
      }

      setSuccess(true)
      await onPartnerRefresh()
      // Short delay to let success state be visible
      setTimeout(() => onNext(), 800)
    } catch {
      setApiError('Erreur réseau. Vérifiez votre connexion et réessayez.')
    } finally {
      setIsLoading(false)
    }
  }

  // If already saved and user hasn't chosen to modify, show recap
  if (isAlreadySaved && !success && !showModifyForm) {
    return (
      <section
        className="p-6 sm:p-8"
        aria-labelledby="iban-heading"
        data-testid="step-iban"
      >
        <header className="mb-6">
          <div className="mb-3 inline-flex items-center rounded-full bg-primary-50 px-3 py-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
              Étape 2 sur 5
            </span>
          </div>
          <h2
            id="iban-heading"
            className="font-heading text-2xl font-bold text-charcoal-900"
          >
            Coordonnées bancaires
          </h2>
        </header>

        <div
          role="status"
          className="mb-6 flex items-center gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4"
        >
          <CheckCircle className="h-5 w-5 shrink-0 text-accent-500" aria-hidden="true" />
          <div>
            <p className="font-semibold text-accent-700">IBAN enregistré</p>
            <p className="text-sm text-accent-600">
              Compte se terminant par{' '}
              <strong>···· {partner?.iban_last4}</strong>
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowModifyForm(true)}
            data-testid="iban-modify-btn"
          >
            Modifier l&apos;IBAN
          </Button>
          <Button
            type="button"
            variant="primary"
            rightIcon={<ChevronRight className="h-5 w-5" aria-hidden="true" />}
            onClick={onNext}
            data-testid="iban-continue-btn"
          >
            Continuer
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section
      className="p-6 sm:p-8"
      aria-labelledby="iban-heading"
      data-testid="step-iban"
    >
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center rounded-full bg-primary-50 px-3 py-1">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
            Étape 2 sur 5
          </span>
        </div>
        <h2
          id="iban-heading"
          className="font-heading text-2xl font-bold text-charcoal-900"
        >
          Coordonnées bancaires
        </h2>
        <p className="mt-2 text-charcoal-500">
          Renseignez votre IBAN pour recevoir vos primes CEE. Ces données sont
          chiffrées (AES-256) et seuls les 4 derniers chiffres sont visibles.
        </p>
      </header>

      {/* Security notice */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-sand-200 bg-sand-50 p-4">
        <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-charcoal-400" aria-hidden="true" />
        <p className="text-sm text-charcoal-500">
          Votre IBAN est stocké de manière sécurisée conformément à la
          directive PSD2 et aux exigences du PNCEE (arrêté 2/11/2023).
        </p>
      </div>

      {/* API-level error */}
      {apiError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {apiError}
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 flex items-center gap-2 rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-accent-700"
        >
          <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          IBAN enregistré avec succès.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Formulaire IBAN"
        className="space-y-5"
        data-testid="iban-form"
      >
        <Input
          id="iban-field"
          name="iban"
          label="IBAN"
          required
          type="text"
          inputMode="text"
          autoComplete="off"
          placeholder="FR76 3000 6000 0112 3456 7890 189"
          value={form.iban}
          onChange={handleChange('iban')}
          onBlur={handleBlur('iban')}
          error={visibleError('iban')}
          disabled={isLoading || success}
          hint="Saisissez l'IBAN complet (avec ou sans espaces)"
          aria-describedby={visibleError('iban') ? 'iban-error' : undefined}
        />

        <Input
          id="bic-field"
          name="bic"
          label="BIC / SWIFT"
          required
          type="text"
          inputMode="text"
          autoComplete="off"
          placeholder="BNPAFRPP"
          value={form.bic}
          onChange={handleChange('bic')}
          onBlur={handleBlur('bic')}
          error={visibleError('bic')}
          disabled={isLoading || success}
          hint="8 ou 11 caractères (code de la banque)"
        />

        <Input
          id="titulaire-field"
          name="titulaire"
          label="Nom du titulaire du compte"
          required
          type="text"
          inputMode="text"
          autoComplete="name"
          placeholder="Dupont Jean"
          value={form.titulaire}
          onChange={handleChange('titulaire')}
          onBlur={handleBlur('titulaire')}
          error={visibleError('titulaire')}
          disabled={isLoading || success}
          hint="Tel qu'il apparaît sur votre relevé bancaire"
        />

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={isLoading || success}
            rightIcon={<ChevronRight className="h-5 w-5" aria-hidden="true" />}
            data-testid="iban-submit-btn"
          >
            Enregistrer et continuer
          </Button>
        </div>
      </form>
    </section>
  )
}
