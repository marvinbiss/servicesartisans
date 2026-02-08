/**
 * Company Identity — Single Source of Truth
 *
 * CHARTER.md Source Hierarchy:
 *   Level 1 (Legal docs): siret, legalName, address, phone, rcs, tva
 *   Level 5 (UI copy): description, tagline
 *
 * RULE: Any field that is `null` MUST NOT appear in:
 *   - Structured data (JSON-LD)
 *   - Mentions légales
 *   - Footer contact section
 *
 * When the company is registered, update the null fields here.
 * Every page that imports this file will automatically reflect the change.
 */

export const companyIdentity = {
  // Brand (Level 5 — UI copy only)
  name: 'ServicesArtisans' as const,
  tagline: 'Trouvez des artisans près de chez vous',
  description:
    'Plateforme de mise en relation entre particuliers et artisans qualifiés en France.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr',

  // Legal identity (Level 1 — null until company registration)
  legalName: null as string | null,
  formeJuridique: null as string | null,
  capitalSocial: null as string | null,
  siret: null as string | null,
  rcs: null as string | null,
  tvaIntracom: null as string | null,
  address: null as string | null,
  phone: null as string | null,
  directeurPublication: null as string | null,
  foundingDate: null as string | null,

  // Contact (real and functional)
  email: 'contact@servicesartisans.fr',
  supportEmail: 'support@servicesartisans.fr',
  dpoEmail: 'dpo@servicesartisans.fr',
  presseEmail: 'presse@servicesartisans.fr',
  partenairesEmail: 'partenaires@servicesartisans.fr',
  careersEmail: 'careers@servicesartisans.fr',

  // Social (real profiles)
  social: {
    facebook: 'https://facebook.com/servicesartisans',
    instagram: 'https://instagram.com/servicesartisans',
    linkedin: 'https://linkedin.com/company/servicesartisans',
    twitter: 'https://twitter.com/servicesartisans',
  },

  // Hosting (Level 1 — verifiable)
  hosting: {
    name: 'Vercel Inc.',
    address: '340 S Lemon Ave #4133, Walnut, CA 91789, USA',
    website: 'https://vercel.com',
  },

  // Platform status
  status: 'pre-launch' as 'pre-launch' | 'launched',
} as const

/** True when SIRET, legal name, and address are all filled. */
export function isCompanyRegistered(): boolean {
  return (
    companyIdentity.siret !== null &&
    companyIdentity.legalName !== null &&
    companyIdentity.address !== null
  )
}

/** True once the platform has real artisans / is live. */
export function isPlatformLaunched(): boolean {
  return companyIdentity.status === 'launched'
}

/** Non-null social profile URLs for schema.org sameAs. */
export function getSocialLinks(): string[] {
  return Object.values(companyIdentity.social).filter(Boolean)
}
