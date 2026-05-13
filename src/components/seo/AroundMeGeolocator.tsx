'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Loader2 } from 'lucide-react'

type Props = {
  serviceSlug: string
  serviceName: string
  knownCitySlugs: ReadonlySet<string>
}

type FeatureProps = {
  city?: string
  name?: string
  citycode?: string
  postcode?: string
}

type ReverseFeature = {
  properties: FeatureProps
}

type ReverseResponse = {
  features?: ReverseFeature[]
}

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AroundMeGeolocator({ serviceSlug, serviceName, knownCitySlugs }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const locate = async () => {
    setError(null)
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Votre navigateur ne supporte pas la géolocalisation.')
      return
    }
    setLoading(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 60_000,
        })
      })
      const { latitude, longitude } = position.coords
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}&type=municipality`
      )
      if (!res.ok) throw new Error('Reverse geocode failed')
      const data = (await res.json()) as ReverseResponse
      const feature = data.features?.[0]
      const raw = feature?.properties.city || feature?.properties.name
      if (!raw) {
        setError('Impossible de déterminer votre commune. Choisissez ci-dessous.')
        return
      }
      const citySlug = slugify(raw)
      if (knownCitySlugs.has(citySlug)) {
        router.push(`/services/${serviceSlug}/${citySlug}`)
        return
      }
      setError(
        `${serviceName} à ${raw} : pas de page dédiée pour le moment. Choisissez une ville proche ci-dessous.`
      )
    } catch {
      setError('Autorisation refusée ou position indisponible. Choisissez une ville ci-dessous.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border-2 border-primary-200 bg-primary-50 p-5 sm:p-6">
      <button
        type="button"
        onClick={locate}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold px-6 py-4 rounded-xl shadow-cta hover:shadow-cta-hover hover:-trancharcoal-y-0.5 transition-all duration-300 text-base"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Localisation en cours…
          </>
        ) : (
          <>
            <MapPin className="w-5 h-5" />
            Trouver un {serviceName.toLowerCase()} près de moi
          </>
        )}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-charcoal-600 text-center">
          {error}
        </p>
      )}
      {!error && (
        <p className="mt-3 text-xs text-charcoal-500 text-center">
          Nous utilisons votre position pour trouver la page dédiée à votre ville — rien n'est
          stocké.
        </p>
      )}
    </div>
  )
}
