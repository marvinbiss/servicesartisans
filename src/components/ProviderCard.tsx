import Link from 'next/link'
import { MapPin, Phone, Globe, Star, BadgeCheck, Award } from 'lucide-react'
import { Provider } from '@/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface ProviderCardProps {
  provider: Provider
  serviceSlug: string
  locationSlug: string
}

export default function ProviderCard({ provider, serviceSlug, locationSlug }: ProviderCardProps) {
  const providerUrl = `/services/${serviceSlug}/${locationSlug}/${provider.slug}`
  const ratingValue = provider.rating_average?.toFixed(1) || 'N/A'
  const reviewCount = provider.review_count || 0

  return (
    <Card
      variant={provider.is_premium ? 'premium' : 'default'}
      padding="sm"
      hover
      className="group"
      role="article"
      aria-label={`${provider.name} - ${provider.is_verified ? 'Artisan vérifié' : 'Artisan'}`}
    >
      {/* Premium Badge */}
      {provider.is_premium && (
        <Badge variant="warning" icon={<Award className="w-3.5 h-3.5" aria-hidden="true" />} className="mb-3">
          Artisan Premium
        </Badge>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <Link
            href={providerUrl}
            aria-label={`Voir le profil de ${provider.name}`}
          >
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 truncate">
              {provider.name}
            </h3>
          </Link>

          {/* Verified Badge */}
          {provider.is_verified && (
            <Badge
              variant="success"
              size="sm"
              icon={<BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />}
              className="mt-1.5"
            >
              Vérifié
            </Badge>
          )}
        </div>

        {/* Rating */}
        <div
          className="flex items-center gap-1 ml-3 flex-shrink-0"
          role="img"
          aria-label={`Note: ${ratingValue} sur 5, basé sur ${reviewCount} avis`}
        >
          <Badge variant="success" size="sm">
            <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            <span className="font-semibold">{ratingValue}</span>
            <span className="opacity-75">({reviewCount})</span>
          </Badge>
        </div>
      </div>

      {/* Address */}
      {(provider.address_street || provider.address_city) && (
        <address className="flex items-start gap-2 text-gray-600 text-sm mb-2 not-italic">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>
            {provider.address_street && `${provider.address_street}, `}
            {provider.address_postal_code} {provider.address_city}
          </span>
        </address>
      )}

      {/* Contact Info */}
      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100">
        {provider.phone && (
          <a
            href={`tel:${provider.phone}`}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
            aria-label={`Appeler ${provider.name} au ${formatPhone(provider.phone)}`}
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            <span>{formatPhone(provider.phone)}</span>
          </a>
        )}

        {provider.website && (
          <a
            href={ensureHttps(provider.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
            aria-label={`Visiter le site web de ${provider.name} (s'ouvre dans un nouvel onglet)`}
          >
            <Globe className="w-4 h-4" aria-hidden="true" />
            <span>Site web</span>
          </a>
        )}
      </div>

      {/* CTA */}
      <div className="flex gap-2 mt-4" role="group" aria-label="Actions">
        <Link
          href={providerUrl}
          className="flex-1 text-center bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
        >
          Voir le profil
        </Link>
        <Link
          href={`${providerUrl}#devis`}
          className="flex-1 text-center bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-[0_4px_14px_0_rgba(37,99,235,0.25)] hover:shadow-[0_8px_25px_0_rgba(37,99,235,0.35)] hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Demander un devis
        </Link>
      </div>
    </Card>
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
