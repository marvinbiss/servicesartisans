/**
 * Textes de consentement RGPD versionnés — source unique pour UI + DB hash.
 *
 * Le texte affiché au Step 5 du simulateur DOIT correspondre exactement à ce
 * qui est hashé (`consent_text_sha256`) en DB au submit. Toute modification
 * du wording oblige à incrémenter la version (v1 → v2) — ne jamais écraser.
 *
 * Preuve opposable CNIL : lead X a coché un consentement dont le texte SHA-256
 * matche la version Y stockée en DB.
 */

export const CONSENT_TEXTS = {
  v1: {
    rgpd: "J'accepte le traitement de mes données pour recevoir mon estimation et être recontacté(e) par un artisan RGE partenaire (obligatoire).",
    majorite: 'Je certifie être majeur(e) et titulaire ou mandaté(e) pour le logement concerné.',
    demarchage: "J'accepte de recevoir des offres commerciales de ServicesArtisans (optionnel).",
  },
} as const

export const CONSENT_VERSION_CURRENT = 'v1' as const

/**
 * Bloc canonique concaténé qui est hashé en DB. Ordre stable : rgpd | majorite |
 * demarchage. Séparateur `\n---\n` pour éviter les collisions.
 */
export function buildConsentTextCanonical(
  version: keyof typeof CONSENT_TEXTS = CONSENT_VERSION_CURRENT
): string {
  const t = CONSENT_TEXTS[version]
  return [t.rgpd, t.majorite, t.demarchage].join('\n---\n')
}
