'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Star,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Wallet,
  Zap,
  Clock,
  FileCheck,
  Leaf,
} from 'lucide-react'
import { hasActiveRgeQualification } from '@/lib/rge/has-active-qualification'
import { Provider } from '@/types'
import { getArtisanUrl } from '@/lib/utils'
import { getDiceBearAvatar } from '@/lib/data/images-faces'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { CompareButton } from '@/components/ui/CompareButton'
import { trackEvent } from '@/lib/analytics/tracking'
import RgeBadge from '@/components/artisan/RgeBadge'
import { formatHourlyRange, resolveProviderPricing } from '@/lib/data/specialty-pricing'

type ProviderCardProvider = Partial<Provider> & Pick<Provider, 'id' | 'name'>

interface ProviderCardProps {
  provider: ProviderCardProvider
  isHovered?: boolean
}

export default function ProviderCard({ provider, isHovered = false }: ProviderCardProps) {
  const [expanded, setExpanded] = useState(false)
  const providerUrl = getArtisanUrl({
    stable_id: provider.stable_id,
    slug: provider.slug,
    specialty: provider.specialty,
    city: provider.address_city,
  })
  const ratingValue = provider.rating_average?.toFixed(1)
  const reviewCount = provider.review_count
  const pricing = resolveProviderPricing({
    hourlyRateMin: provider.hourly_rate_min,
    hourlyRateMax: provider.hourly_rate_max,
    specialty: provider.specialty,
  })
  const pricingLabel = formatHourlyRange(pricing)
  const pricingIsProviderOwn = pricing.kind === 'provider'
  // Concentrer le PageRank sur les 46K fiches RGE visibles (noindex=false).
  // Les 920K fiches non-RGE (noindex=true) restent cliquables pour l'UX mais
  // sont exclues du flux PageRank via rel="nofollow". Source : Google Search
  // Central — rel="nofollow" indique "source douteuse" / "ne pas transmettre
  // d'autorité". Ici : fiches sans signal de qualité RGE vérifiable.
  const shouldNofollow = provider.noindex === true
  const linkRel = shouldNofollow ? 'nofollow' : undefined

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
        providerHref={providerUrl}
        providerSlug={provider.slug ?? null}
        providerCity={provider.address_city ?? null}
        providerSpecialty={provider.specialty ?? null}
        size="sm"
        className="absolute top-3 right-3 z-30"
      />
      {/* Mobile: full-card tappable overlay link */}
      <Link
        href={providerUrl}
        rel={linkRel}
        className="absolute inset-0 z-10 md:hidden"
        aria-label={`Voir le profil de ${provider.name}`}
        onClick={() =>
          trackEvent('artisan_listing_click', {
            artisanId: provider.stable_id || provider.id,
            artisanName: provider.name,
            source: 'card_mobile',
          })
        }
      />
      {/* Mobile: right arrow indicator */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden z-0">
        <ChevronRight className="w-5 h-5 text-charcoal-300" />
      </div>

      {/* Avatar, Nom et verification */}
      <div className="flex items-start gap-4 mb-3">
        {/* Avatar duplicate-link hidden from AT to avoid double-announce
            with the name link. Img alt stays for image-search SEO. */}
        <Link
          href={providerUrl}
          rel={linkRel}
          tabIndex={-1}
          aria-hidden="true"
          className="flex-shrink-0 focus:outline-none"
          onClick={() =>
            trackEvent('artisan_listing_click', {
              artisanId: provider.stable_id || provider.id,
              artisanName: provider.name,
              source: 'card_avatar',
            })
          }
        >
          <div className="w-12 h-12 rounded-full overflow-hidden shadow-soft flex-shrink-0 bg-sand-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getDiceBearAvatar(provider.siret || provider.slug || provider.name, 96)}
              alt={`${provider.name} — artisan à ${provider.address_city || 'France'}`}
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                // DiceBear hiccup → swap to a CSS-only initial bubble so
                // the layout reserves its 48 × 48 footprint and we don't
                // leave a broken-image icon.
                const img = e.currentTarget
                img.style.display = 'none'
                const parent = img.parentElement
                if (parent && !parent.querySelector('[data-avatar-fallback]')) {
                  const fallback = document.createElement('div')
                  fallback.setAttribute('data-avatar-fallback', '')
                  fallback.className =
                    'w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-semibold text-base'
                  fallback.textContent = (provider.name || 'A').charAt(0).toUpperCase()
                  parent.appendChild(fallback)
                }
              }}
              className="w-full h-full"
            />
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={providerUrl}
              rel={linkRel}
              className="font-heading text-lg font-bold text-charcoal-900 hover:text-primary-500 transition-colors duration-200 truncate"
              onClick={() =>
                trackEvent('artisan_listing_click', {
                  artisanId: provider.stable_id || provider.id,
                  artisanName: provider.name,
                  source: 'card_name',
                })
              }
            >
              {provider.name}
            </Link>
            {provider.is_verified && (
              <span className="relative inline-block group/verified">
                <span
                  tabIndex={0}
                  role="img"
                  aria-label="Artisan vérifié"
                  aria-describedby={`${provider.id}-verified-tip`}
                  className="relative inline-flex items-center justify-center w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-accent-400 to-accent-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 cursor-help"
                >
                  <svg
                    className="w-3.5 h-3.5 text-white relative z-10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <span
                    className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                </span>
                <span
                  id={`${provider.id}-verified-tip`}
                  role="tooltip"
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30 whitespace-nowrap rounded-lg bg-charcoal-900 text-white text-xs font-medium px-2.5 py-1.5 shadow-lg pointer-events-none opacity-0 -translate-y-1 transition-all duration-150 group-hover/verified:opacity-100 group-hover/verified:translate-y-0 group-focus-within/verified:opacity-100 group-focus-within/verified:translate-y-0 motion-reduce:transition-none"
                >
                  Identité, SIRET et assurance vérifiés par ServicesArtisans
                </span>
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
              trackingContext={{
                provider_id: provider.stable_id || provider.id,
                surface: 'card',
                service: provider.specialty,
                city: provider.address_city ?? undefined,
              }}
            />
          </div>
        </div>

        {/* Rating */}
        {ratingValue && typeof reviewCount === 'number' && reviewCount > 0 ? (
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1.5 justify-end">
              <Star className="w-5 h-5 text-secondary-400 fill-secondary-400" />
              <span className="text-lg font-bold text-charcoal-900">{ratingValue}</span>
            </div>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <span className="text-xs text-charcoal-500">{reviewCount} avis</span>
              {reviewCount > 10 && (
                <span className="text-2xs font-semibold text-accent-700 bg-accent-50 px-1.5 py-0.5 rounded-full">
                  Top
                </span>
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

      {/* Tarif horaire — vrai si claimed+rempli, sinon moyenne métier labellisée.
          Transparence : ne JAMAIS prétendre que la moyenne est le tarif de l'artisan. */}
      <div className="flex items-center gap-1.5 ml-16 mb-3">
        <Wallet
          className={`w-3.5 h-3.5 flex-shrink-0 ${pricingIsProviderOwn ? 'text-accent-600' : 'text-charcoal-400'}`}
          aria-hidden="true"
        />
        <span
          className={`text-xs font-medium ${pricingIsProviderOwn ? 'text-charcoal-800' : 'text-charcoal-500'}`}
        >
          {pricingIsProviderOwn ? (
            <>
              <span className="font-semibold">{pricingLabel}</span>
              <span className="ml-1 text-charcoal-500">indicatif</span>
            </>
          ) : (
            <>
              Tarif moyen métier : <span className="font-semibold">{pricingLabel}</span>
            </>
          )}
        </span>
      </div>

      {/* Badges trust authentiques (mig 306, renseignés par l'artisan).
          Pas de faux compteurs "X personnes regardent" — uniquement des
          signaux que l'artisan a explicitement validés sur sa fiche. */}
      {(provider.emergency_available ||
        provider.available_24h ||
        provider.free_quote ||
        provider.accepts_new_clients) && (
        <div className="flex flex-wrap gap-1.5 ml-16 mb-3">
          {provider.emergency_available && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-red-50 text-red-700 border border-red-100">
              <Zap className="w-3 h-3" aria-hidden="true" />
              Urgences
            </span>
          )}
          {provider.available_24h && !provider.emergency_available && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-accent-50 text-accent-700 border border-accent-100">
              <Clock className="w-3 h-3" aria-hidden="true" />
              7j/7
            </span>
          )}
          {provider.free_quote && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
              <FileCheck className="w-3 h-3" aria-hidden="true" />
              Devis gratuit
            </span>
          )}
          {provider.accepts_new_clients && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-secondary-50 text-secondary-700 border border-secondary-100">
              Disponible
            </span>
          )}
        </div>
      )}

      {/* Boutons */}
      <div className="flex gap-3 relative z-20 mt-4">
        {provider.user_id ? (
          <>
            <Link
              href={`${providerUrl}#devis`}
              rel={linkRel}
              className="flex-1 py-3 min-h-[48px] flex items-center justify-center text-center bg-primary-400 text-white rounded-xl font-bold shadow-cta hover:bg-primary-500 hover:shadow-cta-hover hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-200"
            >
              Demander un devis
            </Link>
            <Link
              href={providerUrl}
              rel={linkRel}
              className="hidden md:flex items-center justify-center gap-1 px-5 py-3 min-h-[48px] border-2 border-sand-400 text-charcoal-700 rounded-xl font-semibold hover:bg-sand-100 hover:border-primary-200 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-200"
            >
              Voir le profil
            </Link>
          </>
        ) : (
          <Link
            href={providerUrl}
            rel={linkRel}
            className="flex-1 py-3 min-h-[48px] flex items-center justify-center text-center bg-primary-400 text-white rounded-xl font-bold shadow-cta hover:bg-primary-500 hover:shadow-cta-hover hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-200"
          >
            Voir le profil
          </Link>
        )}
      </div>

      {/* Inline details toggle — surfaces info already in listing (no fetch). */}
      <div className="relative z-20 mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
          aria-expanded={expanded}
          aria-controls={`details-${provider.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-charcoal-600 hover:text-primary-600 transition-colors px-2 py-1 -ml-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          {expanded ? 'Masquer les détails' : 'Voir les détails'}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>
      {expanded && (
        <div
          id={`details-${provider.id}`}
          className="relative z-20 mt-2 pt-3 border-t border-sand-200 space-y-2 text-xs text-charcoal-700"
        >
          {provider.address_street && (
            <div className="flex items-start gap-1.5">
              <MapPin
                className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span>
                {provider.address_street}
                {provider.address_postal_code ? `, ${provider.address_postal_code}` : ''}
                {provider.address_city ? ` ${provider.address_city}` : ''}
              </span>
            </div>
          )}
          {(() => {
            const quals = provider.rge_qualifications
            if (!hasActiveRgeQualification(quals) || !quals) return null
            const shown = quals.slice(0, 3)
            return (
              <div className="flex items-start gap-1.5">
                <Leaf
                  className="w-3.5 h-3.5 text-accent-500 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="flex flex-wrap gap-1">
                  <span className="font-semibold text-accent-700">Qualifications RGE :</span>
                  {shown.map((q, i) => (
                    <span key={i} className="text-charcoal-700">
                      {q.code}
                      {i < shown.length - 1 ? ',' : ''}
                    </span>
                  ))}
                  {quals.length > 3 && (
                    <span className="text-charcoal-500">+{quals.length - 3}</span>
                  )}
                </div>
              </div>
            )
          })()}
          {provider.is_verified && (
            <div className="flex items-start gap-1.5">
              <ShieldCheck
                className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span>Identité et SIRET vérifiés par la plateforme</span>
            </div>
          )}
        </div>
      )}

      {/* Compare button — sous CTAs, plus discret. Bascule selection panier comparaison. */}
      <div className="relative z-20 mt-2 flex justify-end">
        <CompareButton
          provider={{
            id: provider.stable_id || provider.id,
            name: provider.name,
            slug: provider.slug ?? '',
            stable_id: provider.stable_id ?? undefined,
            specialty: provider.specialty,
            address_city: provider.address_city,
            address_region: provider.address_region,
            address_postal_code: provider.address_postal_code,
            is_verified: provider.is_verified,
            rating_average: provider.rating_average,
            review_count: provider.review_count,
            siret: provider.siret,
            hourly_rate_min: provider.hourly_rate_min ?? null,
            hourly_rate_max: provider.hourly_rate_max ?? null,
            emergency_available: provider.emergency_available,
            available_24h: provider.available_24h,
            free_quote: provider.free_quote,
            accepts_new_clients: provider.accepts_new_clients,
            rge_qualifications: provider.rge_qualifications ?? null,
            rge_valid_until: provider.rge_valid_until ?? null,
          }}
        />
      </div>
    </div>
  )
}
