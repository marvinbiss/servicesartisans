'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import {
  MapPin,
  CheckCircle,
  Users,
  CalendarCheck,
  ShieldCheck,
  FileText,
  Phone,
} from 'lucide-react'
import { getDisplayName } from './types'
import RgeBadge from './RgeBadge'
import type { LegacyArtisan } from '@/types/legacy'
import { trackEvent } from '@/lib/analytics/tracking'
import { hasActiveRgeQualification } from '@/lib/rge/has-active-qualification'
import { ADVISORS_LABEL_SHORT } from '@/lib/seo/config'

const DevisBottomSheet = dynamic(() => import('@/components/conversion/DevisBottomSheet'), {
  ssr: false,
})

interface ArtisanHeroProps {
  artisan: LegacyArtisan
  isClaimed?: boolean
}

export function ArtisanHero({ artisan, isClaimed = false }: ArtisanHeroProps) {
  const displayName = getDisplayName(artisan)
  const [isDevisOpen, setIsDevisOpen] = useState(false)

  const hasPortfolioImage =
    artisan.portfolio && artisan.portfolio.length > 0 && artisan.portfolio[0].imageUrl

  // Phone CTA — n'est rendu que si `artisan.phone` est défini. Le gate amont
  // (convertToArtisan dans page.tsx) garantit que `phone` n'est exposé que pour
  // les fiches claimed OU RGE actives (cf. CLAUDE.md "Fiches RGE non
  // revendiquées — exception tel public" 2026-05-07). Hors RGE actif et
  // hors claim, `artisan.phone` reste undefined → le bloc ne s'affiche pas.
  const isRgeActive = hasActiveRgeQualification(artisan.rge_qualifications)
  const cleanPhone = artisan.phone?.replace(/[^\d+]/g, '') ?? ''
  const showPhoneCta = cleanPhone.length >= 10 && (isClaimed || isRgeActive)

  return (
    <>
      <div
        className="animate-fade-in-up bg-white rounded-2xl shadow-card-hover border border-sand-200 overflow-hidden"
        role="banner"
        aria-label={`Profil de ${displayName}`}
      >
        <div className="h-1.5 bg-primary-500" />

        <div className="p-5 md:p-8">
          <div className="flex flex-col sm:flex-row gap-5 md:gap-6">
            {/* Avatar - GRANDE 120px */}
            <div className="flex-shrink-0">
              <div className="relative">
                {/* Pulsing ring for artisans accepting new clients */}
                {artisan.accepts_new_clients && (
                  <div
                    className="absolute -inset-1.5 rounded-2xl border-2 border-primary-400/40 animate-pulse-ring"
                    aria-hidden="true"
                  />
                )}
                <div className="w-[120px] h-[120px] rounded-2xl bg-primary-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden ring-4 ring-white relative">
                  {hasPortfolioImage ? (
                    <Image
                      src={artisan.portfolio?.[0]?.imageUrl ?? ''}
                      alt={`Photo de profil de ${displayName}, ${artisan.specialty} à ${artisan.city}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                      priority
                    />
                  ) : (
                    <span aria-hidden="true">{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                {/* Verified badge on avatar */}
                {artisan.is_verified && (
                  <Link
                    href="/notre-processus-de-verification"
                    className="absolute -bottom-1.5 -right-1.5 bg-accent-500 text-white p-1.5 rounded-full shadow-lg ring-2 ring-white hover:ring-accent-100 transition-all"
                    aria-label="Artisan vérifié - voir le processus de vérification"
                    title="Voir notre processus de vérification"
                  >
                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                  </Link>
                )}
                {/* Team size badge */}
                {artisan.team_size && artisan.team_size > 1 && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full shadow-md border border-sand-200 text-xs font-medium text-charcoal-700 whitespace-nowrap">
                    <Users className="w-3 h-3 text-primary-400" aria-hidden="true" />
                    Équipe de {artisan.team_size}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Name - font-heading text-2xl font-bold */}
              <h1
                data-speakable="true"
                className="text-2xl md:text-3xl font-bold text-charcoal-900 font-heading mb-1 tracking-tight"
              >
                {displayName}
                <span className="sr-only">
                  {' '}
                  — {artisan.specialty} à {artisan.city}
                </span>
              </h1>

              {/* Specialty */}
              <p className="text-lg text-charcoal-600 mb-2 font-medium">{artisan.specialty}</p>

              {/* Verified SIREN badge */}
              {artisan.is_verified && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 text-accent-700 text-sm font-semibold border border-accent-200 mb-3 mr-2">
                  <ShieldCheck className="w-4 h-4 text-accent-500" aria-hidden="true" />
                  Vérifié SIREN
                </div>
              )}

              {/* Certifié RGE (ADEME) — affiché sur toutes les fiches : les données
                viennent de data.gouv.fr (source officielle), indépendantes de la
                revendication de fiche. Le badge se self-guard si RGE absent/expiré. */}
              <RgeBadge
                qualifications={artisan.rge_qualifications}
                validUntil={artisan.rge_valid_until}
                organismes={artisan.rge_organismes}
                sourceUrl={artisan.rge_source_url}
                trackingContext={{
                  provider_id: artisan.stable_id || artisan.id,
                  surface: 'fiche',
                  service: artisan.specialty,
                  city: artisan.city,
                }}
              />

              {/* Location */}
              <div className="flex items-center gap-2 text-charcoal-600 mb-3">
                <MapPin className="w-4 h-4 flex-shrink-0 text-charcoal-400" />
                <span className="font-medium">
                  {artisan.city} ({artisan.postal_code})
                </span>
                {artisan.intervention_radius_km && (
                  <>
                    <span className="text-charcoal-300" aria-hidden="true">
                      -
                    </span>
                    <span className="text-charcoal-500">
                      Rayon : {artisan.intervention_radius_km} km
                    </span>
                  </>
                )}
              </div>

              {/* Member since */}
              {artisan.member_since && (
                <div className="flex items-center gap-1.5 text-sm text-charcoal-600">
                  <CalendarCheck className="w-4 h-4 text-charcoal-400" aria-hidden="true" />
                  <span>Inscrit depuis {artisan.member_since}</span>
                </div>
              )}

              {/* Prominent CTA — above the fold (only for claimed profiles) */}
              {isClaimed && (
                <div className="mt-5">
                  <button
                    onClick={() => {
                      trackEvent('artisan_devis_click', {
                        artisanId: artisan.id,
                        artisanName: artisan.business_name || displayName,
                        source: 'hero_cta',
                      })
                      const isDesktop = window.matchMedia('(min-width: 768px)').matches
                      if (isDesktop) {
                        const devisSection = document.getElementById('devis')
                        if (devisSection) {
                          devisSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        } else {
                          const slug = artisan.specialty_slug || ''
                          const city = artisan.city?.toLowerCase().replace(/\s+/g, '-') || ''
                          window.location.href =
                            slug && city
                              ? `/services/${slug}/${encodeURIComponent(city)}`
                              : slug
                                ? `/devis/${slug}`
                                : '/devis'
                        }
                      } else {
                        setIsDevisOpen(true)
                      }
                    }}
                    className="w-full sm:w-auto py-3.5 px-8 bg-primary-500 hover:bg-primary-600 shadow-cta hover:shadow-cta-hover text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5 text-base touch-manipulation"
                    aria-label="Devis gratuit en 2 min"
                  >
                    <FileText className="w-5 h-5" aria-hidden="true" />
                    Devis gratuit en 2 min
                  </button>
                  <p className="text-xs text-charcoal-500 mt-2 flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-accent-500" aria-hidden="true" />
                    <span>{ADVISORS_LABEL_SHORT}</span>
                    <span className="text-charcoal-300" aria-hidden="true">
                      ·
                    </span>
                    <span>Gratuit</span>
                    <span className="text-charcoal-300" aria-hidden="true">
                      ·
                    </span>
                    <span>Sans engagement</span>
                  </p>
                </div>
              )}

              {/* Tel CTA — digits masques. tel: href ouvre dialer mais UI affiche
                  label = capture intent click sans pre-afficher numero. */}
              {showPhoneCta && (
                <div className={isClaimed ? 'mt-3' : 'mt-5'}>
                  <a
                    href={`tel:${cleanPhone}`}
                    onClick={() => {
                      trackEvent('phone_click', {
                        artisanId: artisan.id,
                        artisanName: artisan.business_name || displayName,
                        source: 'hero_cta',
                        target: 'artisan',
                      })
                    }}
                    className="w-full sm:w-auto py-3.5 px-8 bg-accent-600 hover:bg-accent-700 shadow-lg shadow-accent-600/20 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5 text-base touch-manipulation focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
                    aria-label={`Appeler ${displayName}`}
                  >
                    <Phone className="w-5 h-5" aria-hidden="true" />
                    Contacter l&apos;artisan
                  </a>
                  {!isClaimed && (
                    <p className="text-xs text-charcoal-500 mt-2">
                      Source&nbsp;: Registre RGE ADEME (data.gouv.fr — Licence Etalab&nbsp;2.0)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DevisBottomSheet — pre-filled with artisan data */}
      <DevisBottomSheet
        isOpen={isDevisOpen}
        onClose={() => setIsDevisOpen(false)}
        prefilledService={artisan.specialty_slug || ''}
        prefilledCity={artisan.city || ''}
      />
    </>
  )
}
