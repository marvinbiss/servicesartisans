'use client'

/**
 * CeePrimeEstimateCard — Carte "Prime CEE jusqu'à X €" affichée dans le
 * tunnel devis dès que service + code postal sont saisis.
 *
 * - Client Component (fetch dynamique à chaque (service, CP))
 * - Fail-open : si l'API renvoie non éligible ou erreurs → return null
 *   (pas de bruit visuel pour les cas hors CEE)
 * - Textes 100% français, accents critiques, ton rassurant
 * - Zéro promesse de montant : toujours "jusqu'à X €" + disclaimer
 * - Light only : aucune classe `dark:*`
 */

import { useEffect, useRef, useState } from 'react'
import { Sparkles, Info } from 'lucide-react'

interface PublicEstimateItem {
  code: string
  nom: string
  prime_estimate: {
    euros_classique_min: number
    euros_classique_max: number
    euros_precarite_min: number
    euros_precarite_max: number
  } | null
}

interface PublicEstimateResponse {
  eligible: boolean
  codes: string[]
  zone_climatique: 'H1' | 'H2' | 'H3' | null
  items: PublicEstimateItem[]
}

export interface CeePrimeEstimateCardProps {
  /** Slug du service sélectionné (ex: "chauffagiste"). Vide → carte cachée. */
  serviceSlug: string
  /** Code postal 5 chiffres. Vide → carte cachée. */
  postalCode: string
}

/** Formatage "1 200 €" (séparateur fine espace insécable français). */
function formatEuros(value: number): string {
  const rounded = Math.max(0, Math.round(value))
  return `${rounded.toLocaleString('fr-FR').replace(/\s/g, '\u202f')}\u00a0€`
}

/**
 * Calcule le plafond d'affichage : max des `euros_precarite_max` (vague
 * précarité = enveloppe la plus généreuse — c'est l'ordre de grandeur
 * honnête pour un "jusqu'à").
 */
function getMaxPrime(items: PublicEstimateItem[]): number {
  let max = 0
  for (const item of items) {
    if (!item.prime_estimate) continue
    if (item.prime_estimate.euros_precarite_max > max) {
      max = item.prime_estimate.euros_precarite_max
    }
  }
  return max
}

export function CeePrimeEstimateCard({ serviceSlug, postalCode }: CeePrimeEstimateCardProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PublicEstimateResponse | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Garde — on ne requête que si les deux champs sont plausibles
    const trimmedSlug = serviceSlug?.trim() ?? ''
    const trimmedCp = postalCode?.trim() ?? ''
    if (!trimmedSlug || !/^\d{5}$/.test(trimmedCp)) {
      setData(null)
      setLoading(false)
      return
    }

    // Annule la requête précédente si en cours
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    fetch('/api/cee/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceSlug: trimmedSlug, postalCode: trimmedCp }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? (res.json() as Promise<unknown>) : null))
      .then((body) => {
        if (controller.signal.aborted) return
        // Fail-open silencieux : shape API inattendue → on masque la carte
        // plutôt que d'exposer une erreur à l'utilisateur.
        if (
          !body ||
          typeof body !== 'object' ||
          typeof (body as { eligible?: unknown }).eligible !== 'boolean'
        ) {
          setData(null)
          setLoading(false)
          return
        }
        setData(body as PublicEstimateResponse)
        setLoading(false)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setData(null)
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [serviceSlug, postalCode])

  // ---- Loading skeleton ------------------------------------------------
  if (loading) {
    // sand-*, shadow-soft, font-heading définis dans tailwind.config.js (custom theme)
    return (
      <div
        data-testid="cee-prime-card-loading"
        aria-busy="true"
        className="mt-4 rounded-xl border border-sand-200 bg-white p-4 shadow-soft"
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-lg bg-sand-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-sand-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-sand-100" />
          </div>
        </div>
      </div>
    )
  }

  // ---- Non éligible : carte invisible ----------------------------------
  if (!data || !data.eligible) return null

  const maxPrime = getMaxPrime(data.items)
  if (maxPrime <= 0) return null

  // ---- Carte éligible ---------------------------------------------------
  return (
    <div
      data-testid="cee-prime-card"
      role="status"
      className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-soft"
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100"
        >
          <Sparkles className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="font-heading text-base font-semibold text-emerald-900">
            Prime CEE&nbsp;: jusqu’à {formatEuros(maxPrime)} récupérables
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            Grâce à notre partenariat mandataire, vos travaux peuvent être éligibles à une prime
            Certificats d’Économies d’Énergie. Aucune démarche supplémentaire pour vous&nbsp;: nous
            vous accompagnons de bout en bout.
          </p>
          <p className="mt-2 flex items-start gap-1.5 text-xs text-emerald-700">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>
              Estimation indicative&nbsp;: le montant final dépend des caractéristiques précises de
              vos travaux, de votre logement et du barème en vigueur à la date de la facture.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default CeePrimeEstimateCard
