import Link from 'next/link'
import { MapPin, Phone, Globe, Star, BadgeCheck, Award } from 'lucide-react'
import { Provider } from '@/types'

interface ProviderCardProps {
  provider: Provider
  serviceSlug: string
  locationSlug: string
}

export default function ProviderCard({ provider, serviceSlug, locationSlug }: ProviderCardProps) {
  const providerUrl = `/services/${serviceSlug}/${locationSlug}/${provider.slug}`

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${provider.is_premium ? 'border-yellow-400 ring-2 ring-yellow-100' : 'border-gray-200'} hover:shadow-md transition-shadow p-4`}>
      {/* Premium Badge */}
      {provider.is_premium && (
        <div className="flex items-center gap-1 text-yellow-600 text-sm font-medium mb-2">
          <Award className="w-4 h-4" />
          <span>Artisan Premium</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Link href={providerUrl}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {provider.name}
            </h3>
          </Link>
          
          {/* Verified Badge */}
          {provider.is_verified && (
            <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
              <BadgeCheck className="w-4 h-4" />
              <span>Vérifié</span>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
          <Star className="w-4 h-4 text-green-600 fill-green-600" />
          <span className="text-green-700 font-semibold">
            {provider.rating_average?.toFixed(1) || 'N/A'}
          </span>
          <span className="text-green-600 text-sm">
            ({provider.review_count || 0})
          </span>
        </div>
      </div>

      {/* Address */}
      {(provider.address_street || provider.address_city) && (
        <div className="flex items-start gap-2 text-gray-600 text-sm mb-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            {provider.address_street && `${provider.address_street}, `}
            {provider.address_postal_code} {provider.address_city}
          </span>
        </div>
      )}

      {/* Contact Info */}
      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100">
        {provider.phone && (
          <a
            href={`tel:${provider.phone}`}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Phone className="w-4 h-4" />
            <span>{formatPhone(provider.phone)}</span>
          </a>
        )}
        
        {provider.website && (
          <a
            href={ensureHttps(provider.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Globe className="w-4 h-4" />
            <span>Site web</span>
          </a>
        )}
      </div>

      {/* CTA */}
      <div className="flex gap-2 mt-4">
        <Link
          href={providerUrl}
          className="flex-1 text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Voir le profil
        </Link>
        <Link
          href={`${providerUrl}#devis`}
          className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Demander un devis
        </Link>
      </div>
    </div>
  )
}

// Helpers
function formatPhone(phone: string): string {
  // Format: 06 12 34 56 78
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }
  if (cleaned.length === 11 && cleaned.startsWith('33')) {
    return '0' + cleaned.slice(2).replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }
  return phone
}

function ensureHttps(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}
