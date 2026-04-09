'use client'

import Link from 'next/link'
import { MapPin, Star, ChevronRight, ShieldCheck } from 'lucide-react'
import { Provider } from '@/types'
import { getArtisanUrl, getAvatarColor } from '@/lib/utils'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { trackEvent } from '@/lib/analytics/tracking'
import RgeBadge from '@/components/artisan/RgeBadge'

type ProviderCardProvider = Partial<Provider> & Pick<Provider, 'id' | 'name'>

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

  return (
    <div
      className={`group/card relative overflow-hidden rounded-2xl border bg-white p-5 sm:p-6 transition-all duration-300 ease-premium ${
        isHovered
          ? '-translate-y-1 border-primary-200 shadow-card-hover'
          : 'border-sand-300 shadow-soft hover:-translate-y-1 hover:border-primary-200 hover:shadow-card-hover'
      }`}
    >
      {/* Bouton favori — top-right */}
      <FavoriteButton
        providerId={provider.stable_id || provider.id}
        providerName={provider.name}
        size="sm"
        className="absolute top-3 right-3 z-30"
      />
      {/* Mobile: full-card tappable overlay link */}
      <Link
        href={providerUrl}
        className="absolute inset-0 z-10 md:hidden"
        aria-label={`Voir le profil de ${provider.name}`}
        onClick={() => trackEvent('artisan_listing_click', {
          artisanId: provider.stable_id || provider.id,
          artisanName: provider.name,
          source: 'card_mobile',
        })}
      />
      {/* Mobile: right arrow indicator */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden z-0">
        <ChevronRight className="w-5 h-5 text-charcoal-300" />
      </div>

      {/* Avatar, Nom et verification */}
      <div className="flex items-start gap-4 mb-3">
        {/* Avatar / Initials */}
        <Link
          href={providerUrl}
          className="flex-shrink-0"
          onClick={() => trackEvent('artisan_listing_click', {
            artisanId: provider.stable_id || provider.id,
            artisanName: provider.name,
            source: 'card_avatar',
          })}
        >
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(provider.name)} flex items-center justify-center text-white text-lg font-bold shadow-soft`}>
            {provider.name.charAt(0).toUpperCase()}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={providerUrl}
              className="font-heading text-lg font-bold text-charcoal-900 hover:text-primary-500 transition-colors duration-200 truncate"
              onClick={() => trackEvent('artisan_listing_click', {
                artisanId: provider.stable_id || provider.id,
                artisanName: provider.name,
                source: 'card_name',
              })}
            >
              {provider.name}
            </Link>
            {provider.is_verified && (
              <span
                className="relative inline-flex items-center justify-center w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-accent-400 to-accent-600"
                aria-label="Artisan verifie"
                title="Artisan verifie"
              >
                <svg
                  className="w-3.5 h-3.5 text-white relative z-10"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <span className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {provider.specialty && (
              <span className="inline-block text-xs font-medium text-charcoal-600 bg-sand-200 px-2.5 py-0.5 rounded-full">
                {provider.specialty}
              </span>
            )}
            <RgeBadge
              qualifications={provider.rge_qualifications}
              validUntil={provider.rge_valid_until}
              organismes={provider.rge_organismes}
              sourceUrl={provider.rge_source_url}
              compact
            />
          </div>
        </div>

        {/* Rating */}
        {ratingValue && typeof reviewCount === 'number' && reviewCount > 0 ? (
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1.5 justify-end">
              <Star className="w-5 h-5 text-secondary-400 fill-secondary-400" />
              <span className="text-lg font-bold text-charcoal-900">
                {ratingValue}
              </span>
            </div>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <span className="text-xs text-charcoal-500">{reviewCount} avis</span>
              {reviewCount > 10 && (
                <span className="text-2xs font-semibold text-accent-700 bg-accent-50 px-1.5 py-0.5 rounded-full">Top</span>
              )}
            </div>
          </div>
        ) : (
          <span className="flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-sand-100 text-charcoal-500 text-xs font-semibold">
            Nouveau
          </span>
        )}
      </div>

      {/* Adresse + SIREN trust signal */}
      {provider.address_street && (
        <div className="flex items-start gap-2 text-sm text-charcoal-600 mb-1 ml-16">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-charcoal-400" />
          <span>
            {provider.address_street}
            {provider.address_postal_code &&
             !provider.address_street.includes(provider.address_postal_code) &&
             `, ${provider.address_postal_code}${provider.address_city ? ` ${provider.address_city}` : ''}`}
          </span>
        </div>
      )}
      {provider.siret && (
        <p className="flex items-center gap-1 text-xs text-charcoal-400 mb-3 ml-16">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-accent-500" aria-hidden="true" />
          SIREN {provider.siret.slice(0, 9)}
        </p>
      )}

      {/* Boutons */}
      <div className="flex gap-3 relative z-20 mt-4">
        {provider.user_id ? (
          <>
            <Link
              href={`${providerUrl}#devis`}
              className="flex-1 py-3 min-h-[48px] flex items-center justify-center text-center bg-primary-400 text-white rounded-xl font-bold shadow-cta hover:bg-primary-500 hover:shadow-cta-hover hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-200"
            >
              Demander un devis
            </Link>
            <Link
              href={providerUrl}
              className="hidden md:flex items-center justify-center gap-1 px-5 py-3 min-h-[48px] border-2 border-sand-400 text-charcoal-700 rounded-xl font-semibold hover:bg-sand-100 hover:border-primary-200 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-200"
            >
              Voir le profil
            </Link>
          </>
        ) : (
          <Link
            href={providerUrl}
            className="flex-1 py-3 min-h-[48px] flex items-center justify-center text-center bg-primary-400 text-white rounded-xl font-bold shadow-cta hover:bg-primary-500 hover:shadow-cta-hover hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-200"
          >
            Voir le profil
          </Link>
        )}
      </div>
    </div>
  )
}
