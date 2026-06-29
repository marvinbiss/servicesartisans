/**
 * A/B test de la landing d'acquisition, piloté par le param d'URL `?v=a|b`.
 * Le marketeur choisit la variante par annonce ; la variante est ensuite
 * envoyée dans l'event de conversion (Meta + Google) pour mesurer le gagnant.
 */
export type LandingVariant = 'a' | 'b'

export interface VariantContent {
  variant: LandingVariant
  /** Première ligne du H1 (avant l'accent coloré) */
  headlineLead: string
  /** Partie colorée du H1 */
  headlineAccent: string
  /** Libellé du bouton de conversion */
  ctaLabel: string
}

const VARIANTS: Record<LandingVariant, VariantContent> = {
  a: {
    variant: 'a',
    headlineLead: 'Plus de chantiers,',
    headlineAccent: 'moins de prospection.',
    ctaLabel: 'Je veux des clients',
  },
  b: {
    variant: 'b',
    headlineLead: 'Recevez des demandes de devis',
    headlineAccent: 'près de chez vous.',
    ctaLabel: 'Recevoir mes demandes',
  },
}

export function getVariant(v: string | undefined): VariantContent {
  return v === 'b' ? VARIANTS.b : VARIANTS.a
}
