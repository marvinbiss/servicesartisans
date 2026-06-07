'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { AlertCircle, ArrowLeft, Heart, Info } from 'lucide-react'
import {
  Review,
  getDisplayName,
  ArtisanHero,
  ArtisanAbout,
  ArtisanServices,
  ArtisanSidebar,
  ArtisanMobileCTA,
  ArtisanBreadcrumb,
  ArtisanPhotoGridSkeleton,
} from '@/components/artisan'
import { ArtisanRgeEnrichedSection } from '@/components/artisan/ArtisanRgeEnrichedSection'
import { ShareButton } from '@/components/ui/ShareButton'
import { useFavorites } from '@/hooks/useFavorites'
import { ClaimButton } from '@/components/artisan/ClaimButton'
import { RemovalRequestButton } from '@/components/artisan/RemovalRequestButton'
import { PlatformSidebarCTA } from '@/components/artisan/PlatformSidebarCTA'
import { UnclaimedStickyBar } from '@/components/artisan/UnclaimedStickyBar'
import { ArtisanRgeAdemeCard } from '@/components/artisan/ArtisanRgeAdemeCard'
import { ArtisanCredentialsBlock } from '@/components/artisan/ArtisanCredentialsBlock'
import { hasActiveRgeQualification } from '@/lib/rge/has-active-qualification'
import { buildDevisHref } from '@/lib/utils'
import type { LegacyArtisan } from '@/types/legacy'
import { BookingFunnel } from '@/lib/analytics/tracking'
import { trackProviderView } from '@/lib/storage/recently-viewed'
import { RecentlyViewedCarousel } from '@/components/providers/RecentlyViewedCarousel'

// Loading skeleton for lazy-loaded sections
function SectionSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-soft border border-sand-200 p-6 ${height} animate-pulse`}
    >
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
  () =>
    import('@/components/artisan/ArtisanPhotoGrid').then((mod) => ({
      default: mod.ArtisanPhotoGrid,
    })),
  { loading: () => <ArtisanPhotoGridSkeleton /> }
)

// Reviews section with animations
const ArtisanReviews = dynamic(
  () =>
    import('@/components/artisan/ArtisanReviews').then((mod) => ({ default: mod.ArtisanReviews })),
  { loading: () => <SectionSkeleton height="h-96" /> }
)

// Map component with iframe
const ArtisanMap = dynamic(
  () => import('@/components/artisan/ArtisanMap').then((mod) => ({ default: mod.ArtisanMap })),
  { loading: () => <SectionSkeleton height="h-80" /> }
)

// Similar artisans carousel
const ArtisanSimilar = dynamic(
  () =>
    import('@/components/artisan/ArtisanSimilar').then((mod) => ({ default: mod.ArtisanSimilar })),
  { loading: () => <SectionSkeleton height="h-72" /> }
)

// Inline quote request form
const ArtisanQuoteForm = dynamic(
  () =>
    import('@/components/artisan/ArtisanQuoteForm').then((mod) => ({
      default: mod.ArtisanQuoteForm,
    })),
  { loading: () => <SectionSkeleton height="h-80" /> }
)

// FAQ accordion
const ArtisanFAQ = dynamic(
  () => import('@/components/artisan/ArtisanFAQ').then((mod) => ({ default: mod.ArtisanFAQ })),
  { loading: () => <SectionSkeleton height="h-64" /> }
)

// Business verification card
const ArtisanBusinessCard = dynamic(
  () =>
    import('@/components/artisan/ArtisanBusinessCard').then((mod) => ({
      default: mod.ArtisanBusinessCard,
    })),
  { loading: () => <SectionSkeleton height="h-64" /> }
)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

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

/** Mig 306 déclaratif artisan — hors type Artisan (GUARD types.ts), props dédiées */
interface ArtisanCredentials {
  certifications?: string[] | null
  insurance?: string[] | null
  paymentMethods?: string[] | null
  languages?: string[] | null
}

interface ArtisanPageClientProps {
  initialArtisan: LegacyArtisan | null
  initialReviews: Review[]
  artisanId: string
  similarArtisans?: SimilarArtisan[]
  isClaimed?: boolean
  hasSiret?: boolean
  hasVerifiedDescription?: boolean
  credentials?: ArtisanCredentials | null
}

export default function ArtisanPageClient({
  initialArtisan,
  initialReviews,
  artisanId,
  similarArtisans,
  isClaimed = false,
  hasSiret = false,
  hasVerifiedDescription = false,
  credentials = null,
}: ArtisanPageClientProps) {
  const artisan = initialArtisan
  const reviews = initialReviews
  const { isFavorite, toggleFavorite } = useFavorites()

  // Track profile view
  useEffect(() => {
    if (artisan) {
      BookingFunnel.viewProfile(artisanId, artisan.business_name || '', 'profile_page')
      // LRU history "consultés récemment" (client-only, localStorage)
      trackProviderView({
        id: artisanId,
        name: artisan.business_name || '',
        specialty: artisan.specialty ?? null,
        city: artisan.city ?? null,
        href:
          typeof window !== 'undefined'
            ? window.location.pathname
            : `/services/${artisan.specialty_slug ?? ''}/${artisan.city ?? ''}/${artisanId}`,
      })
    }
  }, [artisan, artisanId])

  // Not found state
  if (!artisan) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="animate-fade-in-scale text-center p-8">
          <AlertCircle className="w-16 h-16 text-charcoal-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-charcoal-900 font-heading mb-2">
            Artisan non trouvé
          </h1>
          <p className="text-charcoal-600 mb-6">
            Cet artisan n&apos;existe pas ou n&apos;est plus disponible.
          </p>
          <Link
            href="/recherche"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors shadow-cta"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à la recherche
          </Link>
        </div>
      </div>
    )
  }

  const displayName = getDisplayName(artisan)

  // Exception "tel public ADEME" : ne s'applique qu'aux fiches RGE actives
  // non revendiquées. Hors RGE, la règle "no phone from DB" reste en place
  // (cf. CLAUDE.md → "Fiches RGE non revendiquées" + memory
  // `servicesartisans-rge-phone-exception-2026-05-07.md`).
  const isRgeActive = hasActiveRgeQualification(artisan.rge_qualifications)
  const isRgeUnclaimed = !isClaimed && isRgeActive

  return (
    <>
      {/* Schema.org JSON-LD is now rendered server-side in page.tsx */}

      {/* Skip links for keyboard navigation */}
      <nav aria-label="Liens rapides" className="sr-only focus-within:not-sr-only">
        <a
          href="#main-content"
          className="absolute top-4 left-4 z-50 bg-primary-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Aller au contenu principal
        </a>
        <a
          href="#contact-sidebar"
          className="absolute top-4 left-4 z-50 bg-primary-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Aller aux informations de contact
        </a>
      </nav>

      {/* pb-44 = space for sticky bar + bottom nav on mobile; lg:pb-8 for desktop where sidebar takes over */}
      <div className="min-h-screen bg-sand-50 pb-44 lg:pb-8">
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
                <button
                  onClick={() => toggleFavorite(artisanId)}
                  className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
                    isFavorite(artisanId)
                      ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                      : 'bg-sand-50 text-charcoal-600 border-sand-200 hover:bg-sand-100'
                  }`}
                  aria-label={isFavorite(artisanId) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  aria-pressed={isFavorite(artisanId)}
                >
                  <Heart
                    className={`w-4.5 h-4.5 ${isFavorite(artisanId) ? 'fill-current' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main
          id="main-content"
          className="max-w-7xl mx-auto px-4 py-6"
          aria-label={`Profil de ${displayName}`}
        >
          {/* Carte ADEME — uniquement sur fiches RGE actives non revendiquées
              (~45 480 fiches). Affiche le tel ADEME public + claim discret. */}
          {isRgeUnclaimed && (
            <ArtisanRgeAdemeCard
              artisanId={artisanId}
              displayName={artisan.business_name || displayName}
              phone={artisan.phone}
              hasSiret={hasSiret}
              rgeQualifications={artisan.rge_qualifications}
            />
          )}

          {/* Bandeau "fiche non revendiquée" — hors RGE uniquement (~925K).
              La règle "no phone from DB" reste en place pour ce périmètre. */}
          {!isClaimed && !isRgeActive && (
            <div
              className="mb-6 flex items-start gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3.5"
              role="status"
            >
              <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-primary-800">
                  Cet artisan n&apos;a pas encore rejoint ServicesArtisans
                </p>
                <p className="text-sm text-primary-600 mt-0.5">
                  Les informations affichées proviennent de sources publiques. Le contact direct
                  n&apos;est pas disponible tant que l&apos;artisan n&apos;a pas revendiqué sa
                  fiche.
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
            {/* Left column - Main content.
                Ordre conversion 2026-06-07 : confiance d'abord (avis, à-propos),
                transaction ensuite (services, formulaire), preuve administrative
                en fin (fiche entreprise). 1 seul bloc devis dans la colonne —
                hero CTA + sidebar/sticky ancrent vers #devis. */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Hero — identity, trust badge, primary CTA */}
              <section aria-label="Informations principales">
                <ArtisanHero artisan={artisan} isClaimed={isClaimed} />
              </section>
              {/* 2. RGE enrichi — cross-links vers guides qualifications + CEE
                     débloquées. No-op pour les fiches non-RGE. */}
              <ArtisanRgeEnrichedSection
                qualifications={artisan.rge_qualifications}
                organismes={artisan.rge_organismes}
                validUntil={artisan.rge_valid_until}
                rgeServiceSlug={artisan.specialty_slug}
                artisanId={artisanId}
                departementSlug={
                  artisan.department
                    ? artisan.department
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[̀-ͯ]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '')
                    : undefined
                }
              />
              {/* 3. Reviews — strongest trust signal, before any form */}
              <section id="reviews" aria-label="Avis clients">
                <ArtisanReviews reviews={reviews} />
              </section>
              {/* 4. About — affiché si : claim, OU description vérifiée (DB-stored LLM
                  ≈50K RGE rubric v1.3, ou rendu ADEME-grounded via generateRgeMinimalDescription).
                  Cachée pour les fiches sans source vérifiée (fallback generateDescription
                  boilerplate = HCU-flaggable). */}
              {(isClaimed || hasVerifiedDescription) && (
                <section aria-label="À propos">
                  <ArtisanAbout artisan={artisan} />
                </section>
              )}
              {/* 5. Services & pricing — transactional detail (hidden for unclaimed) */}
              {isClaimed && (
                <section id="services" aria-label="Services et tarifs">
                  <ArtisanServices artisan={artisan} isClaimed={isClaimed} />
                </section>
              )}
              {/* 6. DEVIS — claimed only: le SEUL formulaire de la page (#devis,
                  cible des ancres hero/sidebar/sticky) */}
              {isClaimed && (
                <section id="devis" aria-label="Demande de devis">
                  <ArtisanQuoteForm artisan={artisan} />
                </section>
              )}
              {/* 7. Garanties & infos pratiques — mig 306 déclaratif, claimed only
                  (contenu auto-déclaré non validé pour les fiches non revendiquées,
                  languages a un DEFAULT base entière) */}
              {isClaimed && credentials && (
                <section aria-label="Garanties et informations pratiques">
                  <ArtisanCredentialsBlock
                    certifications={credentials.certifications}
                    insurance={credentials.insurance}
                    paymentMethods={credentials.paymentMethods}
                    languages={credentials.languages}
                  />
                </section>
              )}
              {/* 8. Business card — verification details (email gated by isClaimed for RGPD) */}
              <section aria-label="Fiche entreprise">
                <ArtisanBusinessCard artisan={artisan} isClaimed={isClaimed} />
              </section>
              {/* Claim button on mobile — non-RGE unclaimed uniquement.
                  Sur RGE unclaimed, la version discrète est déjà inline dans
                  ArtisanRgeAdemeCard en haut de page (pas de double CTA). */}
              {!isClaimed && !isRgeActive && (
                <section className="lg:hidden" aria-label="Revendiquer cette fiche">
                  <ClaimButton
                    providerId={artisanId}
                    providerName={artisan.business_name || displayName}
                    hasSiret={hasSiret}
                  />
                  <div className="text-center mt-2">
                    <RemovalRequestButton
                      providerId={artisanId}
                      providerName={artisan.business_name || displayName}
                      hasSiret={hasSiret}
                    />
                  </div>
                </section>
              )}
              {/* Sur RGE unclaimed : un lien "Demande de retrait" discret reste
                  utile (artisan pas content de figurer dans le registre public). */}
              {isRgeUnclaimed && (
                <section className="lg:hidden" aria-label="Demande de retrait">
                  <div className="text-center">
                    <RemovalRequestButton
                      providerId={artisanId}
                      providerName={artisan.business_name || displayName}
                      hasSiret={hasSiret}
                    />
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
              <RecentlyViewedCarousel
                compact
                heading="Vos consultations récentes"
                excludeId={artisanId}
              />
            </div>

            {/* Right column - Sticky sidebar */}
            <aside
              id="contact-sidebar"
              className="hidden lg:block"
              aria-label="Informations de contact"
            >
              <div className="space-y-6 sticky top-20">
                {isClaimed ? (
                  <ArtisanSidebar artisan={artisan} />
                ) : (
                  <PlatformSidebarCTA
                    providerId={artisanId}
                    providerName={artisan.business_name || displayName}
                    hasSiret={hasSiret}
                  />
                )}
              </div>
            </aside>
          </div>
        </main>

        {/* Mobile/tablet CTA - claimed: devis direct / unclaimed: generic devis métier+ville */}
        {isClaimed ? (
          <ArtisanMobileCTA artisan={artisan} />
        ) : (
          <UnclaimedStickyBar
            specialty={artisan.specialty || 'artisan'}
            city={artisan.city || ''}
            artisanPhone={artisan.phone}
            artisanName={artisan.business_name || displayName}
            isRgeActive={isRgeActive}
            artisanId={artisanId}
            onDevisClick={() => {
              const specialtySlug = slugify(artisan.specialty || 'artisan')
              window.location.href = buildDevisHref(specialtySlug, artisan.city)
            }}
          />
        )}
      </div>
    </>
  )
}
