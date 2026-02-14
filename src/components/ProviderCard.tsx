import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Star, Clock, Users, ChevronRight } from 'lucide-react'
import { Provider } from '@/types'
import { getArtisanUrl } from '@/lib/utils'

type ProviderCardProvider = Partial<Provider> & Pick<Provider, 'id' | 'name'> & { stable_id?: string; slug?: string; specialty?: string; address_city?: string; avatar_url?: string }

interface ProviderCardProps {
  provider: ProviderCardProvider
  isHovered?: boolean
}

export default function ProviderCard({
  provider,
  isHovered = false,
}: ProviderCardProps) {
  const providerUrl = getArtisanUrl({ stable_id: provider.stable_id, slug: provider.slug, specialty: provider.specialty, city: provider.address_city })
  const ratingValue = provider.rating_average?.toFixed(1)
  const reviewCount = provider.review_count
  const employeeCount = provider.employee_count

  return (
    <div
      className={`group/card relative overflow-hidden rounded-2xl border p-6 transition-shadow duration-200 ${
        isHovered
          ? 'bg-white border-slate-200/60 shadow-md'
          : 'bg-white border-slate-200/60 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Mobile: full-card tappable overlay link */}
      <Link
        href={providerUrl}
        className="absolute inset-0 z-10 md:hidden"
        aria-label={`Voir le profil de ${provider.name}`}
      />
      {/* Mobile: right arrow indicator */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden z-0">
        <ChevronRight className="w-5 h-5 text-gray-300" />
      </div>
      {/* Avatar, Nom et vérification */}
      <div className="flex items-start gap-4 mb-2">
        {/* Avatar / Initials */}
        <Link href={providerUrl} className="flex-shrink-0">
          {provider.avatar_url ? (
            <Image
              src={provider.avatar_url}
              alt={`Photo de ${provider.name}`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              {provider.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
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
                aria-label="Artisan référencé"
                title="Artisan référencé"
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
          {provider.specialty && (
            <p className="text-sm text-slate-500 font-medium mt-0.5">{provider.specialty}</p>
          )}
        </div>
        {ratingValue && typeof reviewCount === 'number' && reviewCount > 0 && (
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1.5 justify-end">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500 transition-transform duration-300 group-hover/card:scale-110" />
              <span className="text-xl font-bold text-gray-900">
                {ratingValue}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{reviewCount} avis</div>
          </div>
        )}
      </div>

      {/* Adresse + SIREN trust signal */}
      {provider.address_street && (
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-1">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
          <span>
            {provider.address_street}, {provider.address_postal_code}{' '}
            {provider.address_city}
          </span>
        </div>
      )}
      {provider.siret && (
        <p className="text-xs text-gray-400 mb-3 ml-6">
          SIREN {provider.siret.slice(0, 9)}
        </p>
      )}

      {/* Infos */}
      <div className="flex flex-wrap gap-3 mb-5">
        {typeof provider.experience_years === 'number' &&
          provider.experience_years > 0 && (
            <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-green-50 border border-green-100">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">
                {provider.experience_years} ans d'expérience
              </span>
            </div>
          )}
        {typeof employeeCount === 'number' && (
          <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 font-medium">
              {employeeCount} employés
            </span>
          </div>
        )}
      </div>

      {/* Boutons */}
      <div className="flex gap-3 relative z-20">
        <Link
          href={`${providerUrl}#devis`}
          className="flex-1 py-3 min-h-[48px] flex items-center justify-center text-center bg-amber-500 hover:bg-amber-600 text-white rounded-full font-semibold shadow-sm hover:shadow-md transition-all duration-200"
        >
          Demander un devis
        </Link>
        {provider.phone && (
          <a
            href={`tel:${provider.phone}`}
            className="group flex-1 flex items-center justify-center gap-2 py-3 min-h-[48px] border border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-colors duration-200"
          >
            <Phone className="w-5 h-5" />
            Appeler
          </a>
        )}
      </div>
    </div>
  )
}
