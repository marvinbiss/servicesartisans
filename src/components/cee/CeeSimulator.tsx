'use client'

/**
 * CeeSimulator — Formulaire interactif d'estimation de prime CEE.
 *
 * - Select service + input code postal → POST /api/cee/estimate
 * - Affichage riche des résultats (fourchette classique + précarité, zone climatique)
 * - CTA vers /devis avec source=simulateur-cee
 * - Loading skeleton, gestion erreur, validation regex CP
 * - Light only, palette emerald, 100 % français
 */

import { useState, useRef, type FormEvent } from 'react'
import Link from 'next/link'
import { Search, Loader2, ArrowRight, MapPin, Info, AlertTriangle } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import type { EstimateResponse } from '@/lib/cee/estimate-types'

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ServiceOption {
  slug: string
  name: string
}

interface CeeSimulatorProps {
  services: ServiceOption[]
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const CP_REGEX = /^\d{5}$/

function formatEuros(value: number): string {
  const rounded = Math.max(0, Math.round(value))
  return `${rounded.toLocaleString('fr-FR').replace(/\s/g, '\u202f')}\u00a0\u20ac`
}

const ZONE_DESCRIPTIONS: Record<string, string> = {
  H1: 'Zone H1 (nord et est de la France, climat froid) : primes plus \u00e9lev\u00e9es car les \u00e9conomies d\u2019\u00e9nergie potentielles sont plus importantes.',
  H2: 'Zone H2 (ouest et sud-ouest, climat temp\u00e9r\u00e9) : primes interm\u00e9diaires.',
  H3: 'Zone H3 (pourtour m\u00e9diterran\u00e9en, climat doux) : primes plus basses car les besoins de chauffage sont moindres.',
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export default function CeeSimulator({ services }: CeeSimulatorProps) {
  const [serviceSlug, setServiceSlug] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [cpError, setCpError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EstimateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  async function handleSubmit(e?: FormEvent) {
    if (e) e.preventDefault()
    setCpError('')
    setError(null)

    if (!serviceSlug) return
    if (!CP_REGEX.test(postalCode)) {
      setCpError('Veuillez entrer un code postal valide (5 chiffres).')
      return
    }

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setResult(null)
    setHasSearched(true)

    trackEvent('cee_simulator_submit', { serviceSlug, postalCode })

    try {
      const res = await fetch('/api/cee/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceSlug, postalCode }),
        signal: controller.signal,
      })

      if (!res.ok) {
        if (!controller.signal.aborted) {
          setError('Une erreur est survenue. Veuillez réessayer.')
          setResult(null)
          setLoading(false)
        }
        return
      }

      const body = (await res.json()) as EstimateResponse
      if (!controller.signal.aborted) {
        setResult(body)
        trackEvent('cee_simulator_result', {
          eligible: body.eligible,
          codesCount: body.codes?.length ?? 0,
        })
      }
    } catch {
      if (!controller.signal.aborted) {
        setError('Une erreur est survenue. Veuillez réessayer.')
        setResult(null)
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }

  const selectedServiceName = services.find((s) => s.slug === serviceSlug)?.name ?? ''

  return (
    <div className="space-y-8">
      {/* ---- Formulaire ------------------------------------------------- */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Select service */}
          <div>
            <label
              htmlFor="cee-service"
              className="block text-sm font-semibold text-charcoal-700 mb-1.5"
            >
              Type de travaux
            </label>
            <select
              id="cee-service"
              aria-label="Sélectionnez un type de travaux"
              value={serviceSlug}
              onChange={(e) => setServiceSlug(e.target.value)}
              required
              className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-charcoal-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition"
            >
              <option value="">S\u00e9lectionnez un service</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Input code postal */}
          <div>
            <label
              htmlFor="cee-cp"
              className="block text-sm font-semibold text-charcoal-700 mb-1.5"
            >
              Code postal
            </label>
            <input
              id="cee-cp"
              type="text"
              inputMode="numeric"
              pattern="\d{5}"
              maxLength={5}
              aria-label="Code postal"
              aria-describedby="cee-cp-help"
              value={postalCode}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 5)
                setPostalCode(v)
                if (cpError) setCpError('')
              }}
              placeholder="ex : 75001"
              required
              className={`w-full rounded-xl border ${cpError ? 'border-red-400' : 'border-sand-300'} bg-white px-4 py-3 text-charcoal-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition`}
            />
            <p id="cee-cp-help" className="mt-1 text-xs text-charcoal-400">
              5 chiffres, ex : 75001
            </p>
            {cpError && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {cpError}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !serviceSlug || postalCode.length !== 5}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Estimation en cours...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" aria-hidden="true" />
              Estimer ma prime
            </>
          )}
        </button>
      </form>

      {/* ---- Loading skeleton ------------------------------------------- */}
      {loading && (
        <div className="space-y-4" aria-busy="true">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-sand-200 bg-white p-6 shadow-soft">
              <div className="space-y-3">
                <div className="h-5 w-2/3 animate-pulse rounded bg-sand-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-sand-100" />
                <div className="h-8 w-1/3 animate-pulse rounded bg-sand-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- Erreur r\u00e9seau ------------------------------------------------ */}
      {!loading && error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-400 mb-3" aria-hidden="true" />
          <p className="font-heading text-lg font-semibold text-red-700 mb-2">{error}</p>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-300 text-red-700 font-semibold text-sm hover:bg-red-100 transition"
          >
            R\u00e9essayer
          </button>
        </div>
      )}

      {/* ---- R\u00e9sultats : \u00e9ligible ---------------------------------------- */}
      {!loading && result?.eligible && result.items.length > 0 && (
        <div className="space-y-6" aria-live="polite">
          {/* Zone climatique */}
          {result.zone_climatique && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <MapPin
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-emerald-900">{result.zone_climatique}</p>
                <p className="text-sm text-emerald-700">
                  {ZONE_DESCRIPTIONS[result.zone_climatique]}
                </p>
              </div>
            </div>
          )}

          {/* Items */}
          {result.items.map((item) => {
            if (!item.prime_estimate) return null
            const est = item.prime_estimate
            return (
              <div
                key={item.code}
                className="rounded-xl border border-emerald-200 bg-white p-6 shadow-soft"
              >
                <div className="mb-1 text-xs font-mono text-charcoal-400">{item.code}</div>
                <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-4">
                  {item.nom}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fourchette classique */}
                  <div className="rounded-lg bg-sand-50 p-4">
                    <p className="text-sm font-medium text-charcoal-600 mb-1">Prime classique</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatEuros(est.euros_classique_min)} \u2013{' '}
                      {formatEuros(est.euros_classique_max)}
                    </p>
                  </div>

                  {/* Fourchette pr\u00e9carit\u00e9 */}
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <p className="text-sm font-medium text-charcoal-600 mb-1">
                      Prime pr\u00e9carit\u00e9 \u00e9nerg\u00e9tique
                    </p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatEuros(est.euros_precarite_min)} \u2013{' '}
                      {formatEuros(est.euros_precarite_max)}
                    </p>
                    <p className="mt-1 text-xs text-emerald-600">
                      M\u00e9nages aux revenus modestes (bar\u00e8me Anah)
                    </p>
                  </div>
                </div>
              </div>
            )
          })}

          {/* CTA devis */}
          <div className="text-center">
            <Link
              href={`/devis?service=${serviceSlug}&source=simulateur-cee`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg hover:bg-emerald-700 transition"
            >
              Demander un devis gratuit
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            {selectedServiceName && (
              <p className="mt-2 text-sm text-charcoal-500">
                Devis gratuit et sans engagement pour vos travaux de{' '}
                {selectedServiceName.toLowerCase()}
              </p>
            )}
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 rounded-lg border border-sand-200 bg-sand-50 p-4">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-charcoal-400" aria-hidden="true" />
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Estimation indicative bas\u00e9e sur les bar\u00e8mes CEE en vigueur (p\u00e9riode
              P6). Le montant final d\u00e9pend des caract\u00e9ristiques pr\u00e9cises de vos
              travaux, de votre logement, de vos revenus fiscaux et du cours du kWhc \u00e0 la date
              de signature. Ces chiffres ne constituent pas une offre contractuelle.
            </p>
          </div>
        </div>
      )}

      {/* ---- R\u00e9sultats : non \u00e9ligible ------------------------------------ */}
      {!loading && hasSearched && result && !result.eligible && (
        <div role="alert" className="rounded-xl border border-sand-200 bg-sand-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-sand-400 mb-3" aria-hidden="true" />
          <p className="font-heading text-lg font-semibold text-charcoal-800 mb-2">
            Ce type de travaux n’est pas \u00e9ligible aux CEE
          </p>
          <p className="text-sm text-charcoal-500 mb-4">
            Tous les services ne donnent pas droit \u00e0 une prime \u00e9nergie. Consultez nos
            autres aides disponibles ou essayez un autre type de travaux.
          </p>
          <Link
            href="/cee"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition"
          >
            Voir toutes les op\u00e9rations CEE
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  )
}
