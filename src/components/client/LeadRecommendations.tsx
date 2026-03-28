'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, MapPin, ShieldCheck, ArrowRight } from 'lucide-react'
import { getArtisanUrl } from '@/lib/utils'

interface RecommendedProvider {
  id: string
  name: string
  slug: string | null
  stable_id: string | null
  specialty: string | null
  address_city: string | null
  rating_average: number | null
  review_count: number | null
  is_verified: boolean
}

interface LeadRecommendationsProps {
  /** Service name as stored in devis_requests (e.g., "Plombier") */
  serviceName: string
  /** City name */
  city: string
}

/**
 * Displays up to 3 recommended artisans for a given service + city.
 * Used in the client "Mes demandes" page after each devis card.
 */
export default function LeadRecommendations({ serviceName, city }: LeadRecommendationsProps) {
  const [providers, setProviders] = useState<RecommendedProvider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    // Convert service name to slug-like format for matching
    // e.g., "Plombier" -> "plombier", "Peintre en batiment" -> "peintre"
    const serviceSlug = serviceName.toLowerCase().split(' ')[0]

    fetch(`/api/recommendations?service=${encodeURIComponent(serviceSlug)}&city=${encodeURIComponent(city)}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.providers) {
          setProviders(data.providers.slice(0, 3))
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [serviceName, city])

  if (loading || providers.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mt-2">
      <p className="text-sm font-semibold text-gray-700 mb-3">
        Artisans recommand&eacute;s &agrave; {city}
      </p>
      <div className="space-y-2">
        {providers.map((provider) => {
          const profileUrl = getArtisanUrl({
            stable_id: provider.stable_id,
            slug: provider.slug,
            specialty: provider.specialty,
            city: provider.address_city,
          })

          return (
            <div
              key={provider.id}
              className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg"
            >
              {/* Avatar */}
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">
                  {(provider.name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {provider.name}
                  </span>
                  {provider.is_verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {provider.rating_average ? (
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {provider.rating_average.toFixed(1)}
                      {provider.review_count ? ` (${provider.review_count})` : ''}
                    </span>
                  ) : null}
                  {provider.address_city && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {provider.address_city}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA */}
              <Link
                href={profileUrl}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                Voir le profil
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
