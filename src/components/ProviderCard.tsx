import Link from 'next/link'
import { MapPin, Phone, Star, Clock, Users } from 'lucide-react'
import { Provider } from '@/types'
import { getArtisanUrl } from '@/lib/utils'

type ProviderCardProvider = Partial<Provider> & Pick<Provider, 'id' | 'name'> & { stable_id?: string; slug?: string; specialty?: string; address_city?: string }

interface ProviderCardProps {
  provider: ProviderCardProvider
  serviceSlug: string
  locationSlug: string
  isHovered?: boolean
}

export default function ProviderCard({
  provider,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  serviceSlug: _serviceSlug,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locationSlug: _locationSlug,
  isHovered = false,
}: ProviderCardProps) {
  const providerUrl = getArtisanUrl({ stable_id: provider.stable_id, slug: provider.slug, specialty: provider.specialty, city: provider.address_city })
  const ratingValue = provider.rating_average?.toFixed(1)
  const reviewCount = provider.review_count
  const employeeCount = provider.employee_count

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-gray-100/80 bg-[#FEFDFB] p-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-gradient-to-r before:from-blue-500 before:via-blue-400 before:to-indigo-500 before:opacity-0 before:transition-opacity before:duration-300 ${
        isHovered
          ? '-translate-y-1.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] before:opacity-100'
          : 'shadow-sm hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] hover:before:opacity-100'
      }`}
    >
      {/* Nom et vérification */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={providerUrl}
              className="text-xl font-bold text-gray-900 hover:text-blue-700 transition-colors duration-200"
            >
              {provider.name}
            </Link>
            {provider.is_verified && (
              <span
                className="relative inline-flex items-center justify-center w-5 h-5 rounded-full overflow-hidden"
                style={{ backgroundColor: '#1877f2' }}
                aria-label="Artisan vérifié"
                title="Artisan vérifié"
              >
                <svg
                  className="w-3.5 h-3.5 text-white relative z-10"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                {/* Shimmer effect */}
                <span className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </span>
            )}
          </div>
        </div>
        {ratingValue && typeof reviewCount === 'number' && reviewCount > 0 && (
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1.5 justify-end">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span className="text-xl font-bold text-gray-900">
                {ratingValue}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{reviewCount} avis</div>
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
            <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-green-50 border border-green-100 transition-all duration-200 hover:bg-green-100">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">
                {provider.experience_years} ans d'expérience
              </span>
            </div>
          )}
        {typeof employeeCount === 'number' && (
          <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 transition-all duration-200 hover:bg-purple-100">
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
            className="group flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <Phone className="w-5 h-5 transition-transform group-hover:scale-110" />
            Appeler
          </a>
        )}
        <Link
          href={`${providerUrl}#devis`}
          className="flex-1 py-3 text-center border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          Demander un devis
        </Link>
      </div>
    </div>
  )
}
