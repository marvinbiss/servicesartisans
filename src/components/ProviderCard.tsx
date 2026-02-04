import Link from 'next/link'
import { MapPin, Phone, Star, Award, Clock, Users } from 'lucide-react'
import { Provider } from '@/types'

type ProviderCardProvider = Partial<Provider> & Pick<Provider, 'id' | 'name' | 'slug'>

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
  isHovered = false 
}: ProviderCardProps) {
  const providerUrl = `/services/${serviceSlug}/${locationSlug}/${provider.slug}`
  const ratingValue = provider.rating_average?.toFixed(1)
  const reviewCount = provider.review_count
  const responseTime =
    typeof provider.avg_response_time_hours === 'number'
      ? `< ${Math.max(1, Math.ceil(provider.avg_response_time_hours))}h`
      : undefined
  const experienceYears =
    typeof provider.years_on_platform === 'number' && provider.years_on_platform > 0
      ? Math.floor(provider.years_on_platform)
      : undefined
  const employeeCount = provider.employee_count

  const isPremiumLike =
    provider.is_premium ||
    provider.trust_badge === 'gold' ||
    provider.trust_badge === 'platinum'

  return (
    <div
      style={{
        background: isPremiumLike
          ? 'linear-gradient(135deg, #fff7d1 0%, #fffef5 60%)'
          : 'white',
        border: isPremiumLike ? '3px solid #fbbf24' : '2px solid #e5e7eb',
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.2s',
        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
        transform: isHovered ? 'scale(1.01)' : 'scale(1)'
      }}
    >
      {/* Badge Premium */}
      {isPremiumLike && (
        <div 
          className="inline-flex items-center gap-2 text-amber-900 text-xs font-black mb-3 px-3 py-1.5 rounded-full"
          style={{ 
            letterSpacing: '0.5px',
            background: 'linear-gradient(90deg, #fde68a 0%, #fff7d1 100%)',
            border: '1px solid #f59e0b'
          }}
        >
          <Award className="w-4 h-4 text-amber-600" />
          ARTISAN PREMIUM
        </div>
      )}

      {/* Nom et vérification */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link href={providerUrl} className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              {provider.name}
            </Link>
            {provider.is_verified && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full"
                style={{ backgroundColor: '#1877f2' }}
                aria-label="Artisan vérifié"
                title="Artisan vérifié"
              >
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </span>
            )}
          </div>
        </div>
        {ratingValue && typeof reviewCount === 'number' && reviewCount > 0 && (
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-xl font-bold text-gray-900">{ratingValue}</span>
            </div>
            {typeof reviewCount === 'number' && (
              <div className="text-xs text-gray-500">{reviewCount} avis</div>
            )}
          </div>
        )}
      </div>

      {/* Adresse */}
      {provider.address_street && (
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
          <span>
            {provider.address_street}, {provider.address_postal_code} {provider.address_city}
          </span>
        </div>
      )}

      {/* Infos avec icônes colorées - COMME LA CAPTURE */}
      <div className="flex flex-wrap gap-3 mb-5">
        {responseTime && (
          <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-blue-50">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 font-medium">Répond en {responseTime}</span>
          </div>
        )}
        {typeof experienceYears === 'number' && experienceYears > 0 && (
          <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-green-50">
            <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span className="text-green-700 font-medium">{experienceYears} ans d'expérience</span>
          </div>
        )}
        {typeof employeeCount === 'number' && (
          <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-purple-50">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-purple-700 font-medium">{employeeCount} employés</span>
          </div>
        )}
      </div>

      {/* Boutons - EXACTEMENT COMME LA CAPTURE */}
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
