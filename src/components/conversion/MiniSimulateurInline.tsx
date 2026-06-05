'use client'

/**
 * MiniSimulateurInline — 1-champ CP capture inline pour pages SEO.
 *
 * Conversion play : transformer le trafic SEO long-tail (services, tarifs, avis,
 * pages géo) en entrée funnel simulateur sans imposer les 5 steps d'un coup.
 *
 * Mécanique :
 *  - User saisit son code postal (1 seul champ, 30s engagement)
 *  - On hydrate localStorage avec la même clé que `Stepper.tsx` (`simulateur-draft-v1`)
 *  - On redirige vers /simulateur-aides-renovation
 *  - Le Stepper hydrate au mount → CP pré-rempli sur Step1
 *
 * Si la clé localStorage / forme `PersistedShape` change dans Stepper.tsx,
 * mettre à jour `LS_KEY`, `TTL_MS` et `INITIAL_SKELETON` ci-dessous EN MIROIR.
 */

import { useState, useId } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, MapPin, ShieldCheck, Clock } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'

// MUST stay in sync with src/components/simulateur/Stepper.tsx
const LS_KEY = 'simulateur-draft-v1'
const TTL_MS = 24 * 60 * 60_000

// Minimum viable StepperState shape — Stepper hydrates this and resumes Step 1
// with codePostal pre-filled.
const INITIAL_SKELETON = {
  step: 1 as const,
  situation: {} as Record<string, unknown>,
  revenus: {},
  projet: { gestes: [] as string[], coupDePouce: false },
  budget: {},
  contact: {
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    consentRgpd: false,
    consentMajorite: false,
    consentDemarchage: false,
  },
  submitting: false,
}

const CP_REGEX = /^[0-9]{5}$/

interface MiniSimulateurInlineProps {
  /** Service slug (e.g. "isolation") — used for analytics + headline tailoring */
  service?: string
  /** City label — displayed in headline if provided */
  ville?: string
  /** Visual variant — `card` for hero zones, `inline` for in-content blocks */
  variant?: 'card' | 'inline'
  /** Source label for tracking (e.g. "service_hub", "tarifs_pseo") */
  source?: string
  /** Override headline */
  headline?: string
}

export default function MiniSimulateurInline({
  service,
  ville,
  variant = 'card',
  source = 'mini_simulateur_inline',
  headline,
}: MiniSimulateurInlineProps) {
  const router = useRouter()
  const inputId = useId()
  const errorId = useId()
  const [cp, setCp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    const trimmed = cp.trim()
    if (!CP_REGEX.test(trimmed)) {
      setError('Code postal invalide (5 chiffres)')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const state = {
        ...INITIAL_SKELETON,
        situation: { ...INITIAL_SKELETON.situation, codePostal: trimmed },
      }
      const payload = { savedAt: Date.now(), state }
      window.localStorage.setItem(LS_KEY, JSON.stringify(payload))
    } catch {
      // quota / privacy mode — best-effort, the simulateur page will still load
    }

    trackEvent('form_started', {
      source: `mini_simulateur:${source}`,
      service: service || '',
      ville: ville || '',
    })

    // Use replace so the back button doesn't loop the user through the mini-form
    router.push('/simulateur-aides-renovation')
  }

  // TTL hint — strip stale drafts older than TTL on mount so we don't visually
  // suggest a stale resume in unrelated pages. Cheap and side-effect free.
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { savedAt?: number }
        if (parsed?.savedAt && Date.now() - parsed.savedAt > TTL_MS) {
          window.localStorage.removeItem(LS_KEY)
        }
      }
    } catch {
      // ignore
    }
  }

  const computedHeadline =
    headline ??
    (service && ville
      ? `Combien d'aides pour vos travaux ${service} à ${ville} ?`
      : service
        ? `Combien d'aides pour vos travaux ${service} ?`
        : 'Combien d\u2019aides pouvez-vous toucher pour vos travaux ?')

  if (variant === 'inline') {
    return (
      <form
        onSubmit={handleSubmit}
        className="not-prose my-8 rounded-2xl border border-primary-200 bg-primary-50/60 p-5 sm:p-6"
        aria-label="Estimation rapide des aides rénovation"
      >
        <p className="text-sm font-bold text-primary-700 uppercase tracking-wide mb-1">
          Estimation gratuite — 30 secondes
        </p>
        <p className="text-base sm:text-lg font-heading font-bold text-charcoal-900 mb-4">
          {computedHeadline}
        </p>
        <Body
          cp={cp}
          setCp={setCp}
          error={error}
          submitting={submitting}
          inputId={inputId}
          errorId={errorId}
        />
      </form>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-sand-200 bg-white shadow-card p-6 sm:p-8"
      aria-label="Estimation rapide des aides rénovation"
    >
      <div className="flex items-center gap-2 text-xs font-bold text-primary-500 uppercase tracking-[.12em] mb-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100">
          <MapPin className="w-3.5 h-3.5" />
        </span>
        Estimation gratuite — 30 secondes
      </div>
      <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-charcoal-900 leading-tight mb-2">
        {computedHeadline}
      </h3>
      <p className="text-sm text-charcoal-500 mb-5">
        MaPrimeRénov&apos;, CEE, Coup de Pouce — barèmes officiels 2026.
      </p>
      <Body
        cp={cp}
        setCp={setCp}
        error={error}
        submitting={submitting}
        inputId={inputId}
        errorId={errorId}
      />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs sm:text-xs text-charcoal-500 mt-4">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-500" />
          100% gratuit
        </span>
        <span className="text-charcoal-200">·</span>
        <span>Sans engagement</span>
        <span className="text-charcoal-200">·</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-primary-400" />5 étapes — 2 min
        </span>
      </div>
    </form>
  )
}

interface BodyProps {
  cp: string
  setCp: (v: string) => void
  error: string | null
  submitting: boolean
  inputId: string
  errorId: string
}

function Body({ cp, setCp, error, submitting, inputId, errorId }: BodyProps) {
  return (
    <>
      <label htmlFor={inputId} className="block text-sm font-semibold text-charcoal-700 mb-2">
        Code postal du logement
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id={inputId}
          name="codePostal"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          pattern="[0-9]{5}"
          maxLength={5}
          required
          value={cp}
          onChange={(e) => setCp(e.target.value.replace(/\D/g, '').slice(0, 5))}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          placeholder="75001"
          className="flex-1 h-12 rounded-xl border border-sand-300 bg-white px-4 text-base text-charcoal-900 placeholder:text-charcoal-500 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-heading font-bold text-base shadow-cta hover:shadow-cta-hover transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Chargement...' : 'Estimer mes aides'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </>
  )
}
