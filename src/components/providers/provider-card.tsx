'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, CheckCircle, Clock } from 'lucide-react'
import { BLUR_PLACEHOLDER } from '@/lib/data/images'
import { getArtisanUrl } from '@/lib/utils'

interface ProviderCardProps {
  provider: {
    id: string
    slug: string
    name: string
    description?: string
    address_city: string
    address_region: string
    phone?: string
    rating_average: number
    review_count: number
    is_verified: boolean
    is_available_24h?: boolean
    response_time?: string
    image_url?: string
    service_type?: string
  }
  priority?: boolean
}

export function ProviderCard({ provider, priority = false }: ProviderCardProps) {
  const providerUrl = getArtisanUrl({
    slug: provider.slug,
    specialty: provider.service_type,
    city: provider.address_city,
  })

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : star - 0.5 <= rating
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-sand-500'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-sand-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-sand-100 flex-shrink-0">
            {provider.image_url ? (
              <Image
                src={provider.image_url}
                alt={`${provider.name} - artisan${provider.service_type ? ` ${provider.service_type}` : ''} à ${provider.address_city}`}
                fill
                className="object-cover"
                sizes="64px"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                priority={priority}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-2xl font-bold">
                {provider.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={providerUrl}
                className="font-semibold text-charcoal-900 hover:text-primary-500 transition-colors truncate"
              >
                {provider.name}
              </Link>
              {provider.is_verified && (
                <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
              )}
            </div>

            {provider.service_type && (
              <p className="text-sm text-primary-500 font-medium mt-0.5">{provider.service_type}</p>
            )}

            <div className="flex items-center gap-1 mt-1">
              {renderStars(provider.rating_average)}
              <span className="text-sm font-medium text-charcoal-700 ml-1">
                {provider.rating_average.toFixed(1)}
              </span>
              <span className="text-sm text-charcoal-500">({provider.review_count} avis)</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-charcoal-500 mt-1">
              <MapPin className="w-4 h-4" />
              <span>
                {provider.address_city}, {provider.address_region}
              </span>
            </div>
          </div>
        </div>

        {provider.description && (
          <p className="mt-4 text-charcoal-600 text-sm line-clamp-2">{provider.description}</p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {provider.is_available_24h && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <Clock className="w-3 h-3" />
              24h/24
            </span>
          )}
          {provider.response_time && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium">
              Répond en {provider.response_time}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-sand-200">
          <Link
            href={providerUrl}
            className="flex-1 text-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            Voir le profil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProviderCard
