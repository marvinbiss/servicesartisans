/**
 * LandingHero — Hero canonique pour landing pages pSEO ServicesArtisans.
 *
 * Pattern conversion (Booking.com / Airbnb / Effy) :
 *  - H1 + sub-titre + 1 CTA primaire visible above-fold (≤ 600px)
 *  - Mini-rating early : ★★★★☆ 4.6/5 (X avis) — quand fourni
 *  - Trust signals row (RGE, devis 2 min, lead exclusif, ADEME)
 *  - Background gradient subtle (pas d'image lourde — LCP friendly)
 *  - Mobile : 1 colonne, sticky CTA bottom (pattern marketplace)
 *  - CTAs ≥ 44 px tactiles (WCAG AA)
 *
 * Server component pur — aucune dépendance state ni effet.
 *
 * Palette ServicesArtisans :
 *  - terra = primary terracotta (CTA principal SA)
 *  - forest = accent forest green (trust / RGE / ADEME)
 *  - sand = warm neutrals (variant warm/sand background)
 *
 * Analytics :
 *  - chaque CTA expose `data-intent="<intent>"` puis suffixé `-sticky-mobile`
 *    pour permettre un branchement futur (GTM / posthog / trackEvent).
 */

import Link from 'next/link'
import { CheckCircle2, ShieldCheck, Star } from 'lucide-react'

export type LandingHeroTrustBadge = {
  label: string
  icon?: 'check' | 'shield' | 'star'
  href?: string
}

export type LandingHeroRating = {
  /** 0-5, sera clampé et arrondi à 1 décimale pour l'affichage */
  average: number
  count: number
  /** Default : 'avis vérifiés' */
  label?: string
}

export type LandingHeroIntent = 'devis' | 'simulateur' | 'tel' | 'voir-artisans'

export type LandingHeroCta = {
  label: string
  href: string
  intent: LandingHeroIntent
}

export type LandingHeroAccent = 'terra' | 'forest' | 'sand'

export type LandingHeroProps = {
  h1: string
  subtitle: string
  primaryCta: LandingHeroCta
  secondaryCta?: {
    label: string
    href: string
  }
  trustBadges?: LandingHeroTrustBadge[]
  rating?: LandingHeroRating
  /** Couleur d'accent (selon vertical). Default = terra (terracotta SA) */
  accent?: LandingHeroAccent
  /** Si true (default) : sticky CTA bar mobile en bas */
  stickyMobileCta?: boolean
  /** Optionnel : eyebrow micro-texte au-dessus du H1 (ex: "Rénovation énergétique") */
  eyebrow?: string
}

const ACCENT_GRADIENT: Record<LandingHeroAccent, string> = {
  terra: 'from-primary-50 via-sand-50 to-white border-primary-100',
  forest: 'from-accent-50 via-sand-50 to-white border-accent-100',
  sand: 'from-sand-100 via-sand-50 to-white border-sand-200',
}

const CTA_PRIMARY_CLASS: Record<LandingHeroAccent, string> = {
  terra: 'bg-primary-500 hover:bg-primary-600 text-white shadow-cta hover:shadow-cta-hover',
  forest: 'bg-accent-600 hover:bg-accent-700 text-white shadow-soft hover:shadow-soft-lg',
  sand: 'bg-primary-500 hover:bg-primary-600 text-white shadow-cta hover:shadow-cta-hover',
}

const EYEBROW_CLASS: Record<LandingHeroAccent, string> = {
  terra: 'text-primary-700',
  forest: 'text-accent-700',
  sand: 'text-charcoal-600',
}

function clampRating(v: number): number {
  if (!Number.isFinite(v)) return 0
  return Math.min(5, Math.max(0, v))
}

function pickIcon(name?: LandingHeroTrustBadge['icon']) {
  if (name === 'shield') return ShieldCheck
  if (name === 'star') return Star
  return CheckCircle2
}

export function LandingHero({
  h1,
  subtitle,
  primaryCta,
  secondaryCta,
  trustBadges = [],
  rating,
  accent = 'terra',
  stickyMobileCta = true,
  eyebrow,
}: LandingHeroProps) {
  const safeRating = rating ? clampRating(rating.average) : 0
  const showRating = rating && rating.count > 0 && safeRating > 0
  const ratingLabel = rating?.label ?? 'avis vérifiés'
  const fullStars = Math.round(safeRating)

  return (
    <>
      <section
        className={`relative bg-gradient-to-br ${ACCENT_GRADIENT[accent]} border-b py-10 md:py-16`}
        aria-labelledby="landing-hero-title"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {eyebrow && (
            <p
              className={`text-xs sm:text-sm font-bold uppercase tracking-[.12em] mb-2 ${EYEBROW_CLASS[accent]}`}
            >
              {eyebrow}
            </p>
          )}

          {showRating && rating && (
            <div className="flex items-center gap-2 mb-3 text-sm">
              <span
                className="inline-flex items-center"
                aria-label={`Note moyenne ${safeRating.toFixed(1)} sur 5`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    aria-hidden="true"
                    className={
                      i < fullStars ? 'fill-secondary-400 text-secondary-400' : 'text-sand-300'
                    }
                  />
                ))}
              </span>
              <span className="font-semibold text-charcoal-900">{safeRating.toFixed(1)}/5</span>
              <span className="text-charcoal-600">
                — {rating.count.toLocaleString('fr-FR')} {ratingLabel}
              </span>
            </div>
          )}

          <h1
            id="landing-hero-title"
            className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-charcoal-900 mb-3"
          >
            {h1}
          </h1>
          <p className="text-base sm:text-lg text-charcoal-700 mb-6 max-w-3xl">{subtitle}</p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Link
              href={primaryCta.href}
              data-intent={primaryCta.intent}
              className={`inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-xl font-heading font-bold text-base transition-all duration-200 ${CTA_PRIMARY_CLASS[accent]}`}
            >
              {primaryCta.label}
            </Link>
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-xl font-heading font-semibold text-base border border-sand-400 hover:border-charcoal-400 hover:bg-white text-charcoal-800 transition-all duration-200"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>

          {trustBadges.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-charcoal-700">
              {trustBadges.map((b) => {
                const Icon = pickIcon(b.icon)
                return (
                  <li key={b.label} className="flex items-center gap-1.5">
                    <Icon size={14} className="text-accent-600 flex-shrink-0" aria-hidden="true" />
                    {b.href ? (
                      <Link
                        href={b.href}
                        className="underline underline-offset-2 decoration-sand-400 hover:decoration-charcoal-600"
                      >
                        {b.label}
                      </Link>
                    ) : (
                      <span>{b.label}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      {stickyMobileCta && (
        <div
          className="md:hidden fixed bottom-0 inset-x-0 z-sticky-cta bg-white/95 backdrop-blur-sm border-t border-sand-300 p-3 shadow-sticky-bar"
          role="region"
          aria-label="Action principale (mobile)"
        >
          <Link
            href={primaryCta.href}
            data-intent={`${primaryCta.intent}-sticky-mobile`}
            className={`flex items-center justify-center min-h-[44px] px-6 py-3 rounded-xl font-heading font-bold text-base ${CTA_PRIMARY_CLASS[accent]}`}
          >
            {primaryCta.label}
          </Link>
        </div>
      )}
    </>
  )
}

export default LandingHero
