'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { AlertCircle, ArrowRight, BadgeCheck, CheckCircle2, Loader2, Search } from 'lucide-react'

import { CeePartnerTracking } from '@/lib/analytics/tracking'

type RgeQualification = {
  code: string
  nom: string
  organisme: string
  date_debut?: string | null
  date_fin?: string | null
}

type LookupResult = {
  success: true
  siret: string
  source: 'providers' | 'insee_fallback'
  businessName: string | null
  address: string | null
  postalCode: string | null
  city: string | null
  isActive: boolean
  rge: {
    hasQualifications: boolean
    qualifications: RgeQualification[]
    validUntil: string | null
  }
  providerId?: string
  providerSlug?: string
  claimed: boolean
}

type LookupError = {
  success: false
  error: { code: string; message: string }
}

function formatSiretDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 14)
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9), digits.slice(9, 14)]
  return parts.filter(Boolean).join(' ')
}

export default function PartnerSiretLookup() {
  const [value, setValue] = useState('')
  const [state, setState] = useState<
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'result'; data: LookupResult }
    | { kind: 'error'; message: string; code: string }
  >({ kind: 'idle' })

  const rawSiret = useMemo(() => value.replace(/\D/g, '').slice(0, 14), [value])
  const isComplete = rawSiret.length === 14

  const buildContinueHref = useCallback((data: LookupResult): string => {
    const qs = new URLSearchParams()
    qs.set('siret', data.siret)
    if (data.businessName) qs.set('name', data.businessName)
    if (data.city) qs.set('city', data.city)
    if (data.postalCode) qs.set('postal_code', data.postalCode)
    qs.set('source', 'devenir-partenaire-cee-lookup')
    return `/inscription-artisan?${qs.toString()}`
  }, [])

  const handleLookup = useCallback(async () => {
    if (!isComplete) return
    setState({ kind: 'loading' })
    try {
      const response = await fetch(`/api/artisan/lookup-siret?siret=${rawSiret}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      const json = (await response.json()) as LookupResult | LookupError
      if (json.success) {
        setState({ kind: 'result', data: json })
        CeePartnerTracking.ctaClick({
          surface: 'hero',
          target: '/api/artisan/lookup-siret',
          cta_label: `siret_lookup_${json.source}`,
        })
      } else {
        setState({ kind: 'error', message: json.error.message, code: json.error.code })
      }
    } catch {
      setState({
        kind: 'error',
        message:
          "Impossible de vérifier ce SIRET pour le moment. Vous pouvez continuer l'inscription, on vérifiera manuellement.",
        code: 'NETWORK',
      })
    }
  }, [isComplete, rawSiret])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void handleLookup()
  }

  return (
    <section id="inscription-rapide" className="bg-white border-y border-charcoal-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mb-4">
            <BadgeCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <span className="text-xs font-semibold text-emerald-800">
              Vérification ADEME en 10 secondes
            </span>
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
            Entrez votre SIRET — on récupère automatiquement vos qualifications RGE
          </h2>
          <p className="text-charcoal-600 leading-relaxed mb-6">
            On interroge la base officielle ADEME puis l'annuaire SIRENE. Si votre qualification RGE
            y est active, on pré-remplit votre fiche : raison sociale, adresse, organismes
            certificateurs. Zéro paperasse, aucune saisie en double.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-2xl bg-sand-50 border border-charcoal-200 rounded-2xl p-5 md:p-6"
          aria-describedby="siret-help"
        >
          <label
            htmlFor="siret-input"
            className="block text-sm font-semibold text-charcoal-800 mb-2"
          >
            Numéro SIRET (14 chiffres)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                id="siret-input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="123 456 789 00000"
                value={formatSiretDisplay(value)}
                onChange={(e) => setValue(e.target.value)}
                onBlur={() => {
                  if (isComplete && state.kind === 'idle') void handleLookup()
                }}
                className="w-full px-4 py-3 pr-10 rounded-xl border border-charcoal-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-base tracking-wider"
                aria-invalid={state.kind === 'error'}
                aria-describedby={state.kind === 'error' ? 'siret-error' : 'siret-help'}
              />
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none"
                aria-hidden="true"
              />
            </div>
            <button
              type="submit"
              disabled={!isComplete || state.kind === 'loading'}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition disabled:bg-charcoal-300 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {state.kind === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Vérification…
                </>
              ) : (
                <>
                  Vérifier
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
          <p id="siret-help" className="text-xs text-charcoal-500 mt-2">
            Ce numéro figure sur votre Kbis et vos factures. Nous ne l'utilisons que pour vérifier
            votre statut RGE — aucun e-mail commercial sans votre consentement.
          </p>
        </form>

        {/* Result card ------------------------------------------------- */}
        {state.kind === 'result' && (
          <div
            role="status"
            aria-live="polite"
            className="max-w-2xl mt-5 bg-white border-2 border-emerald-300 rounded-2xl p-5 md:p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle2
                className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-heading font-bold text-charcoal-900 text-lg leading-tight">
                  {state.data.businessName || 'Établissement trouvé'}
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  SIRET&nbsp;: {formatSiretDisplay(state.data.siret)} ·{' '}
                  {state.data.source === 'providers'
                    ? 'Registre RGE ADEME'
                    : 'Registre SIRENE (INSEE)'}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
              {state.data.address && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                    Adresse
                  </dt>
                  <dd className="text-charcoal-800 mt-0.5">{state.data.address}</dd>
                </div>
              )}
              {state.data.city && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                    Commune
                  </dt>
                  <dd className="text-charcoal-800 mt-0.5">
                    {state.data.postalCode ? `${state.data.postalCode} · ` : ''}
                    {state.data.city}
                  </dd>
                </div>
              )}
            </dl>

            {state.data.rge.hasQualifications && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BadgeCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  <p className="text-sm font-semibold text-emerald-900">
                    {state.data.rge.qualifications.length} qualification
                    {state.data.rge.qualifications.length > 1 ? 's' : ''} RGE active
                    {state.data.rge.qualifications.length > 1 ? 's' : ''}
                  </p>
                </div>
                <ul className="space-y-1.5">
                  {state.data.rge.qualifications.slice(0, 5).map((q) => (
                    <li key={`${q.code}-${q.organisme}`} className="text-xs text-emerald-900">
                      <span className="font-mono font-semibold">{q.code}</span> — {q.nom}{' '}
                      <span className="text-emerald-700">({q.organisme})</span>
                    </li>
                  ))}
                  {state.data.rge.qualifications.length > 5 && (
                    <li className="text-xs text-emerald-700 italic">
                      + {state.data.rge.qualifications.length - 5} autre
                      {state.data.rge.qualifications.length - 5 > 1 ? 's' : ''}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {state.data.source === 'insee_fallback' && (
              <p className="text-xs text-charcoal-600 bg-sand-50 border border-charcoal-200 rounded-lg p-3 mb-4">
                SIRET non trouvé dans notre registre ADEME. On vérifie manuellement votre
                qualification RGE sous 24 à 48h après inscription.
              </p>
            )}

            {state.data.claimed ? (
              <div
                role="alert"
                className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-4"
              >
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle
                    className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      Fiche déjà revendiquée
                    </p>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Cette entreprise possède déjà un compte artisan actif sur ServicesArtisans. Si
                      vous êtes le propriétaire légitime, connectez-vous ou réinitialisez votre mot
                      de passe. Sinon, contactez le support.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pl-7">
                  <Link
                    href="/connexion"
                    onClick={() =>
                      CeePartnerTracking.ctaClick({
                        surface: 'hero',
                        target: '/connexion',
                        cta_label: 'claimed_redirect_login',
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition"
                  >
                    Se connecter
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/mot-de-passe-oublie"
                    onClick={() =>
                      CeePartnerTracking.ctaClick({
                        surface: 'hero',
                        target: '/mot-de-passe-oublie',
                        cta_label: 'claimed_redirect_password_reset',
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-700 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition"
                  >
                    Mot de passe oublié
                  </Link>
                  {state.data.providerSlug && (
                    <Link
                      href={`/artisan/${state.data.providerSlug}`}
                      onClick={() =>
                        CeePartnerTracking.ctaClick({
                          surface: 'hero',
                          target: `/artisan/${state.data.providerSlug}`,
                          cta_label: 'claimed_view_public_profile',
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-700 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition"
                    >
                      Voir la fiche publique
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href={buildContinueHref(state.data)}
                onClick={() =>
                  CeePartnerTracking.ctaClick({
                    surface: 'hero',
                    target: '/inscription-artisan',
                    cta_label: 'continuer_inscription_siret',
                  })
                }
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition"
              >
                Continuer l'inscription
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}

        {state.kind === 'error' && (
          <div
            id="siret-error"
            role="alert"
            className="max-w-2xl mt-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4"
          >
            <AlertCircle
              className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="flex-1">
              <p className="text-sm text-amber-900 leading-relaxed">{state.message}</p>
              <Link
                href="/inscription-artisan?source=devenir-partenaire-cee-lookup-fallback"
                className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-amber-900 underline"
              >
                Continuer l'inscription quand même
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
