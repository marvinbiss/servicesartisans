'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Heart, Info } from 'lucide-react'
import {
  Review,
  getDisplayName,
  ArtisanHero,
  ArtisanStats,
  ArtisanAbout,
  ArtisanServices,
  ArtisanSidebar,
  ArtisanMobileCTA,
  ArtisanBreadcrumb,
  ArtisanPhotoGridSkeleton,
} from '@/components/artisan'
import { ArtisanUrgencyBanner } from '@/components/artisan/ArtisanUrgencyBanner'

import { ArtisanProfileStrength } from '@/components/artisan/ArtisanProfileStrength'
import { ArtisanQuickQuote } from '@/components/artisan/ArtisanQuickQuote'
import { ShareButton } from '@/components/ui/ShareButton'
import { useFavorites } from '@/hooks/useFavorites'
import { ClaimButton } from '@/components/artisan/ClaimButton'
import { RemovalRequestButton } from '@/components/artisan/RemovalRequestButton'
import { SocialProofBadge, useWeeklyDevisCount } from '@/components/artisan/SocialProofBadge'
import { UnclaimedSidebarCTA } from '@/components/artisan/UnclaimedSidebarCTA'
import { UnclaimedMobileCTA } from '@/components/artisan/UnclaimedMobileCTA'
import type { LegacyArtisan } from '@/types/legacy'
import { BookingFunnel } from '@/lib/analytics/tracking'

// Dynamic import for exit intent (not needed on first paint)
const ArtisanExitIntent = dynamic(
  () => import('@/components/artisan/ArtisanExitIntent').then(mod => ({ default: mod.ArtisanExitIntent })),
  { ssr: false }
)

// Dynamic import for unclaimed quote wizard (heavy, not needed on first paint for claimed)
const UnclaimedQuoteWizard = dynamic(
  () => import('@/components/artisan/UnclaimedQuoteWizard'),
  { loading: () => <SectionSkeleton height="h-96" /> }
)

// Loading skeleton for lazy-loaded sections
function SectionSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-soft border border-sand-200 p-6 ${height} animate-pulse`}>
      <div className="h-6 w-40 bg-sand-200 rounded-lg mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-sand-200 rounded-lg w-full" />
        <div className="h-4 bg-sand-200 rounded-lg w-3/4" />
        <div className="h-4 bg-sand-200 rounded-lg w-1/2" />
      </div>
    </div>
  )
}

// Dynamic imports for heavy components - reduces initial bundle
// These components load lazily to reduce initial page bundle size

// Photo grid with lightbox (heavy - includes next/image + lightbox)
const ArtisanPhotoGrid = dynamic(
  () => import('@/components/artisan/ArtisanPhotoGrid').then(mod => ({ default: mod.ArtisanPhotoGrid })),
  { loading: () => <ArtisanPhotoGridSkeleton /> }
)

// Reviews section with animations
const ArtisanReviews = dynamic(
  () => import('@/components/artisan/ArtisanReviews').then(mod => ({ default: mod.ArtisanReviews })),
  { loading: () => <SectionSkeleton height="h-96" /> }
)

// Map component with iframe
const ArtisanMap = dynamic(
  () => import('@/components/artisan/ArtisanMap').then(mod => ({ default: mod.ArtisanMap })),
  { loading: () => <SectionSkeleton height="h-80" /> }
)

// Similar artisans carousel
const ArtisanSimilar = dynamic(
  () => import('@/components/artisan/ArtisanSimilar').then(mod => ({ default: mod.ArtisanSimilar })),
  { loading: () => <SectionSkeleton height="h-72" /> }
)

// Inline quote request form
const ArtisanQuoteForm = dynamic(
  () => import('@/components/artisan/ArtisanQuoteForm').then(mod => ({ default: mod.ArtisanQuoteForm })),
  { loading: () => <SectionSkeleton height="h-80" /> }
)

// FAQ accordion
const ArtisanFAQ = dynamic(
  () => import('@/components/artisan/ArtisanFAQ').then(mod => ({ default: mod.ArtisanFAQ })),
  { loading: () => <SectionSkeleton height="h-64" /> }
)

// Business verification card
const ArtisanBusinessCard = dynamic(
  () => import('@/components/artisan/ArtisanBusinessCard').then(mod => ({ default: mod.ArtisanBusinessCard })),
  { loading: () => <SectionSkeleton height="h-64" /> }
)

// Contact card (sticky sidebar on desktop, section on mobile)
const ArtisanContactCard = dynamic(
  () => import('@/components/artisan/ArtisanContactCard').then(mod => ({ default: mod.ArtisanContactCard })),
  { loading: () => <SectionSkeleton height="h-72" /> }
)

interface SimilarArtisan {
  id: string
  stable_id?: string
  slug?: string
  name: string
  specialty: string
  rating: number
  reviews: number
  city: string
  is_verified?: boolean
}

interface ArtisanPageClientProps {
  initialArtisan: LegacyArtisan | null
  initialReviews: Review[]
  artisanId: string
  similarArtisans?: SimilarArtisan[]
  isClaimed?: boolean
  hasSiret?: boolean
}

export default function ArtisanPageClient({
  initialArtisan,
  initialReviews,
  artisanId,
  similarArtisans,
  isClaimed = false,
  hasSiret = false,
}: ArtisanPageClientProps) {
  const artisan = initialArtisan
  const reviews = initialReviews
  const { isFavorite, toggleFavorite } = useFavorites()

  // Derive specialty/city info for unclaimed CTAs
  const specialty = artisan?.specialty || 'Artisan'
  const specialtySlug = artisan?.specialty_slug || 'artisan'
  const city = artisan?.city || ''
  const citySlug = artisan?.city_slug || ''
  const weeklyDevisCount = useWeeklyDevisCount(specialtySlug, citySlug)

  // Track profile view
  useEffect(() => {
    if (artisan) {
      BookingFunnel.viewProfile(artisanId, artisan.business_name || '', 'profile_page')
    }
  }, [artisan, artisanId])

  // Not found state
  if (!artisan) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <AlertCircle className="w-16 h-16 text-charcoal-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-charcoal-900 font-heading mb-2">Artisan non trouvé</h1>
          <p className="text-charcoal-600 mb-6">Cet artisan n&apos;existe pas ou n&apos;est plus disponible.</p>
          <Link
            href="/recherche"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-400 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors shadow-cta"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à la recherche
          </Link>
        </motion.div>
      </div>
    )
  }

  const displayName = getDisplayName(artisan)

  return (
    <>
      {/* Schema.org JSON-LD is now rendered server-side in page.tsx */}

      {/* Skip links for keyboard navigation */}
      <nav aria-label="Liens rapides" className="sr-only focus-within:not-sr-only">
        <a
          href="#main-content"
          className="absolute top-4 left-4 z-50 bg-primary-400 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Aller au contenu principal
        </a>
        <a
          href="#contact-sidebar"
          className="absolute top-4 left-4 z-50 bg-primary-400 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Aller aux informations de contact
        </a>
      </nav>

      {/* pb-44 on mobile = CTA bar (~72px at bottom-16) + bottom nav (64px) + margin */}
      <div className="min-h-screen bg-sand-50 pb-44 md:pb-8">
        {/* Header - sticky navigation */}
        <header className="bg-white/95 backdrop-blur-lg border-b border-sand-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3.5">
            <div className="flex items-center justify-between">
              <Link
                href="/recherche"
                className="inline-flex items-center gap-2 text-charcoal-600 hover:text-charcoal-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 rounded-lg px-2 py-1.5 -ml-2 hover:bg-sand-100"
                aria-label="Retour à la recherche"
              >
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                <span className="hidden sm:inline font-medium text-sm">Retour</span>
              </Link>

              <div className="flex items-center gap-2">
                <ShareButton
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                  title={`Découvrez ${displayName}, artisan sur ServicesArtisans`}
                  description={`${displayName} — ${artisan.specialty} à ${artisan.city}. Consultez son profil sur ServicesArtisans.`}
                  variant="icon"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFavorite(artisanId)}
                  className={`p-2.5 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
                    isFavorite(artisanId)
                      ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                      : 'bg-sand-50 text-charcoal-600 border-sand-200 hover:bg-sand-100'
                  }`}
                  aria-label={isFavorite(artisanId) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  aria-pressed={isFavorite(artisanId)}
                >
                  <Heart className={`w-4.5 h-4.5 ${isFavorite(artisanId) ? 'fill-current' : ''}`} aria-hidden="true" />
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main id="main-content" className="max-w-7xl mx-auto px-4 py-6" aria-label={`Profil de ${displayName}`}>
          {/* Bandeau fiche non-revendiquee */}
          {!isClaimed && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5" role="status">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  Cet artisan n&apos;a pas encore rejoint ServicesArtisans
                </p>
                <p className="text-sm text-blue-700 mt-0.5">
                  Les informations affichées proviennent de sources publiques. Le contact direct n&apos;est pas disponible tant que l&apos;artisan n&apos;a pas revendiqué sa fiche.
                </p>
              </div>
            </div>
          )}

          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Fil d'Ariane">
            <ArtisanBreadcrumb artisan={artisan} />
          </nav>

          {/* Photo Grid - Airbnb style (full width, only if portfolio exists) */}
          {artisan.portfolio && artisan.portfolio.length > 0 && (
            <section className="mb-8" aria-label="Galerie photos">
              <ArtisanPhotoGrid artisan={artisan} />
            </section>
          )}

          {/* Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Main content (ordered for conversion) */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Hero — first impression, identity, trust signals */}
              <section aria-label="Informations principales">
                <ArtisanHero artisan={artisan} isClaimed={isClaimed} />
              </section>
              {/* 1b. Quick Quote CTA — only if claimed */}
              {isClaimed && (
                <section aria-label="Demande de devis rapide">
                  <ArtisanQuickQuote artisan={artisan} />
                </section>
              )}
              {/* 2. Urgency — only if claimed */}
              {isClaimed && (
                <section aria-label="Disponibilité et avantages">
                  <ArtisanUrgencyBanner artisan={artisan} />
                </section>
              )}

              {/* 3. DEVIS — claimed: direct form / unclaimed: social proof + wizard */}
              {isClaimed ? (
                <section id="devis" aria-label="Demande de devis">
                  <ArtisanQuoteForm artisan={artisan} />
                </section>
              ) : (
                <>
                  {/* Social proof badge */}
                  <SocialProofBadge
                    specialty={specialty}
                    specialtySlug={specialtySlug}
                    city={city}
                    citySlug={citySlug}
                  />
                  {/* Inline multi-step quote wizard */}
                  <UnclaimedQuoteWizard
                    specialty={specialty}
                    specialtySlug={specialtySlug}
                    city={city}
                    citySlug={citySlug}
                  />
                </>
              )}

              {/* 4. Stats — social proof reinforces after form view */}
              <section aria-label="Statistiques">
                <ArtisanStats artisan={artisan} />
              </section>
              {/* 5. Reviews — strongest trust signal */}
              <section id="reviews" aria-label="Avis clients">
                <ArtisanReviews artisan={artisan} reviews={reviews} />
              </section>
              {/* 6. About — details for those doing due diligence */}
              <section aria-label="À propos">
                <ArtisanAbout artisan={artisan} />
              </section>

              {/* 6b. Similar artisans — boosted for unclaimed (moved up from position 10) */}
              {!isClaimed && (
                <section aria-label="Professionnels disponibles">
                  <ArtisanSimilar artisan={artisan} similarArtisans={similarArtisans} isClaimed={false} />
                </section>
              )}

              {/* 7. Services & pricing — transactional detail (hidden for unclaimed) */}
              {isClaimed && (
                <section id="services" aria-label="Services et tarifs">
                  <ArtisanServices artisan={artisan} isClaimed={isClaimed} />
                </section>
              )}
              {/* 8. Business card — verification details */}
              <section aria-label="Fiche entreprise">
                <ArtisanBusinessCard artisan={artisan} />
              </section>
              {/* Mobile-only contact section — only if claimed */}
              {isClaimed && (
                <section className="lg:hidden" aria-label="Contacter cet artisan">
                  <ArtisanContactCard artisan={artisan} />
                </section>
              )}
              {/* Claim button on mobile — only if NOT claimed */}
              {!isClaimed && (
                <section className="lg:hidden" aria-label="Revendiquer cette fiche">
                  <ClaimButton providerId={artisanId} providerName={artisan.business_name || displayName} hasSiret={hasSiret} />
                  <div className="text-center mt-2">
                    <RemovalRequestButton providerId={artisanId} providerName={artisan.business_name || displayName} hasSiret={hasSiret} />
                  </div>
                </section>
              )}
              {/* 9. FAQ — address remaining objections */}
              <section aria-label="Questions fréquentes">
                <ArtisanFAQ artisan={artisan} />
              </section>
              {/* 10. Map + similar (claimed only here, unclaimed is above) */}
              <section aria-label="Localisation">
                <ArtisanMap artisan={artisan} />
              </section>
              {isClaimed && (
                <section aria-label="Artisans similaires">
                  <ArtisanSimilar artisan={artisan} similarArtisans={similarArtisans} />
                </section>
              )}
            </div>

            {/* Right column - Sticky sidebar */}
            <aside id="contact-sidebar" className="hidden lg:block" aria-label="Informations de contact">
              <div className="space-y-6 sticky top-20">
                {isClaimed ? (
                  <>
                    <ArtisanSidebar artisan={artisan} />
                    <ArtisanProfileStrength artisan={artisan} />
                  </>
                ) : (
                  <>
                    <UnclaimedSidebarCTA
                      specialty={specialty}
                      specialtySlug={specialtySlug}
                      city={city}
                      citySlug={citySlug}
                      weeklyDevisCount={weeklyDevisCount}
                      providerId={artisanId}
                      providerName={artisan.business_name || displayName}
                      hasSiret={hasSiret}
                    />
                    <ArtisanProfileStrength artisan={artisan} />
                  </>
                )}
              </div>
            </aside>
          </div>
        </main>

        {/* Mobile CTA - claimed: direct / unclaimed: generic */}
        {isClaimed ? (
          <ArtisanMobileCTA artisan={artisan} />
        ) : (
          <UnclaimedMobileCTA
            specialty={specialty}
            specialtySlug={specialtySlug}
            city={city}
            citySlug={citySlug}
            weeklyDevisCount={weeklyDevisCount}
          />
        )}
      </div>

      {/* Exit intent — now works for both claimed and unclaimed */}
      <ArtisanExitIntent
        artisan={artisan}
        onOpenEstimation={() => {}}
        isClaimed={isClaimed}
        specialty={specialty}
        city={city}
        specialtySlug={specialtySlug}
        citySlug={citySlug}
      />
    </>
  )
}
