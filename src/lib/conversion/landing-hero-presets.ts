/**
 * landing-hero-presets — Presets canoniques pour le composant LandingHero.
 *
 * Centralise les trust badges et les variations standard pour cohérence
 * extrême entre toutes les landing pages pSEO ServicesArtisans.
 *
 * Règle : si tu copies-colles 3 fois les mêmes trust badges dans 3 templates,
 * ajoute un preset ici et utilise-le partout.
 */

import type {
  LandingHeroCta,
  LandingHeroProps,
  LandingHeroTrustBadge,
} from '@/components/conversion/LandingHero'

/** 4 trust badges génériques — convient à toute landing SA hors RGE-spécifique. */
export const STANDARD_TRUST_BADGES: LandingHeroTrustBadge[] = [
  { label: 'Artisans RGE certifiés ADEME', icon: 'shield', href: '/rge' },
  { label: 'Devis gratuit en 2 minutes', icon: 'check' },
  { label: '1 lead = 1 artisan exclusif', icon: 'check' },
  { label: 'Données ADEME data.gouv.fr', icon: 'check', href: '/datasets' },
]

/** Variante orientée rénovation énergétique (MaPrimeRénov', CEE). */
export const RENOVATION_TRUST_BADGES: LandingHeroTrustBadge[] = [
  { label: 'Artisans RGE Qualibat / QualiPAC', icon: 'shield', href: '/rge' },
  { label: 'Éligible MaPrimeRénov’ + CEE', icon: 'check' },
  { label: 'Devis gratuit — sans engagement', icon: 'check' },
  { label: 'Simulateur officiel 2026', icon: 'check', href: '/simulateur-aides-renovation' },
]

/** Variante orientée fiche/listing locale (services par ville). */
export const LOCAL_TRUST_BADGES: LandingHeroTrustBadge[] = [
  { label: 'SIREN vérifié', icon: 'shield' },
  { label: 'Avis vérifiés', icon: 'star' },
  { label: 'Devis gratuit', icon: 'check' },
  { label: '1 lead = 1 artisan', icon: 'check' },
]

export type LandingHeroPresetVariant = 'standard' | 'renovation' | 'local'

export function getTrustBadgesForVariant(
  variant: LandingHeroPresetVariant
): LandingHeroTrustBadge[] {
  switch (variant) {
    case 'renovation':
      return RENOVATION_TRUST_BADGES
    case 'local':
      return LOCAL_TRUST_BADGES
    case 'standard':
    default:
      return STANDARD_TRUST_BADGES
  }
}

/** CTA simulateur par défaut — pré-rempli si on a un service ou une ville. */
export function buildSimulateurCta(opts?: { ville?: string }): LandingHeroCta {
  const base = '/simulateur-aides-renovation'
  const href = opts?.ville ? `${base}?ville=${encodeURIComponent(opts.ville)}` : base
  return {
    label: 'Estimer mes aides',
    href,
    intent: 'simulateur',
  }
}

/** CTA devis générique service+ville. */
export function buildDevisCta(opts: { serviceSlug: string; villeSlug?: string }): LandingHeroCta {
  const { serviceSlug, villeSlug } = opts
  // /devis/[s]/[v] purgé 2026-04-30 (gone-paths 301) — forme query à la place.
  const href = villeSlug
    ? `/devis?service=${encodeURIComponent(serviceSlug)}&ville=${encodeURIComponent(villeSlug)}`
    : `/devis/${serviceSlug}`
  return {
    label: 'Demander un devis gratuit',
    href,
    intent: 'devis',
  }
}

/** CTA "voir les artisans" — utile pour les hubs métier+ville. */
export function buildVoirArtisansCta(opts: {
  serviceSlug: string
  villeSlug: string
}): LandingHeroCta {
  return {
    label: 'Voir les artisans',
    href: `/services/${opts.serviceSlug}/${opts.villeSlug}`,
    intent: 'voir-artisans',
  }
}

/**
 * Helper one-shot pour construire des props LandingHero cohérentes pour une
 * page service+ville. Le caller peut ensuite override n'importe quel champ.
 */
export function getLandingHeroPropsForService(opts: {
  serviceLabel: string
  serviceSlug: string
  ville?: string
  villeSlug?: string
  rating?: { average: number; count: number }
  variant?: LandingHeroPresetVariant
}): LandingHeroProps {
  const { serviceLabel, serviceSlug, ville, villeSlug, rating, variant = 'standard' } = opts
  const villeSuffix = ville ? ` à ${ville}` : ''
  const h1 = `${serviceLabel}${villeSuffix} — artisans RGE certifiés`
  const subtitle = ville
    ? `Comparez des artisans RGE ${serviceLabel.toLowerCase()} à ${ville}. Devis gratuit, données SIREN + ADEME vérifiées.`
    : `Comparez des artisans RGE ${serviceLabel.toLowerCase()} dans toute la France. Devis gratuit, données SIREN + ADEME vérifiées.`

  return {
    h1,
    subtitle,
    primaryCta: buildDevisCta({ serviceSlug, villeSlug }),
    secondaryCta: buildSimulateurCta({ ville }),
    trustBadges: getTrustBadgesForVariant(variant),
    rating,
    accent: variant === 'renovation' ? 'forest' : 'terra',
    stickyMobileCta: true,
  }
}
