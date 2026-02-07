import Link from 'next/link'
import { MapPin, Phone, Star, Clock, Users } from 'lucide-react'
import { Provider } from '@/types'

type ProviderCardProvider = Partial<Provider> & Pick<Provider, 'id' | 'name'> & { slug?: string }

interface ProviderCardProps {
  provider: ProviderCardProvider
  serviceSlug: string
  locationSlug: string
  isHovered?: boolean
}

export default function ProviderCard({
  provider,
  serviceSlug,
  locationSlug,
  isHovered = false,
}: ProviderCardProps) {
  const providerIdentifier = provider.slug
  const providerUrl = `/services/${serviceSlug}/${locationSlug}/${providerIdentifier}`
  const ratingValue = provider.rating_average?.toFixed(1)
  const reviewCount = provider.review_count
  const employeeCount = provider.employee_count

  return (
    <div
      style={{
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.2s',
        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
        transform: isHovered ? 'scale(1.01)' : 'scale(1)',
      }}
    >
      {/* Nom et vérification */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={providerUrl}
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {provider.name}
            </Link>
            {provider.is_verified && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full"
                style={{ backgroundColor: '#1877f2' }}
                aria-label="Artisan vérifié"
                title="Artisan vérifié"
              >
                <svg
                  className="w-3.5 h-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </span>
            )}
          </div>
        </div>
        {ratingValue && typeof reviewCount === 'number' && reviewCount > 0 && (
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-xl font-bold text-gray-900">
                {ratingValue}
              </span>
            </div>
            <div className="text-xs text-gray-500">{reviewCount} avis</div>
          </div>
        )}
      </div>

      {/* Adresse */}
      {provider.address_street && (
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
          <span>
            {provider.address_street}, {provider.address_postal_code}{' '}
            {provider.address_city}
          </span>
        </div>
      )}

      {/* Infos */}
      <div className="flex flex-wrap gap-3 mb-5">
        {typeof provider.experience_years === 'number' &&
          provider.experience_years > 0 && (
            <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-green-50">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">
                {provider.experience_years} ans d'expérience
              </span>
            </div>
          )}
        {typeof employeeCount === 'number' && (
          <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-purple-50">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-purple-700 font-medium">
              {employeeCount} employés
            </span>
          </div>
        )}
      </div>

      {/* Boutons */}
      <div className="flex gap-3">
        {provider.phone && (
          <a
            href={`tel:${provider.phone}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            <Phone className="w-5 h-5" />
            Appeler
          </a>
        )}
        <Link
          href={`${providerUrl}#devis`}
          className="flex-1 py-3 text-center border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Demander un devis
        </Link>
      </div>
    </div>
  )
}
