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

/**
 * Audit 2026-04-25 (agent #10 conformité — BLOCKER LCEN art.6, 75 000€ + 1 an).
 *
 * Si `COMPANY_STATUS=launched` (déploiement public B2C), les 4 champs
 * obligatoires LCEN doivent être renseignés (SIRET + legalName + address +
 * directeurPublication) ET valides (SIRET = 14 chiffres, autres > 5 chars).
 * Sinon throw au boot pour empêcher un deploy live avec des mentions
 * légales nulles ou malformées.
 *
 * Pendant la phase pre-launch (SAS pas encore immatriculée) : laisser
 * `COMPANY_STATUS=pre-launch` pour skip ce check.
 *
 * Audit F-bis : le check ne run QU'EN runtime production (lambda live).
 * Pendant `npm run build` (NEXT_PHASE=phase-production-build) ou en dev/test,
 * skip — sinon CI/local crashent quand les vars légales ne sont pas
 * renseignées (cas normal en environnement non-prod).
 */
type LegalCheck = { var: string; validate: (v: string) => boolean; hint: string }

// F-quater : tolérance whitespace pour le SIRET. Le format français standard
// imprime "123 456 789 01234" → on strip avant test regex pour éviter qu'un
// copier-coller d'extrait Kbis dans Vercel env crash le boot.
const REQUIRED_LEGAL_VARS: readonly LegalCheck[] = [
  {
    var: 'COMPANY_SIRET',
    validate: (v) => /^\d{14}$/.test(v.replace(/\s+/g, '')),
    hint: '14 chiffres exactement (NIC inclus, espaces tolérés)',
  },
  {
    var: 'COMPANY_LEGAL_NAME',
    validate: (v) => v.trim().length >= 2,
    hint: 'raison sociale (≥ 2 caractères)',
  },
  {
    var: 'COMPANY_ADDRESS',
    validate: (v) => v.trim().length >= 10,
    hint: 'adresse siège complète (≥ 10 caractères)',
  },
  {
    var: 'COMPANY_DIRECTEUR_PUBLICATION',
    validate: (v) => v.trim().length >= 2,
    hint: 'nom complet du directeur de publication (≥ 2 caractères)',
  },
] as const

// F-quinquies : whitelist explicite plutôt qu'un cast unsafe. Un typo
// (`COMPANY_STATUS=lauched` sans 'n') tombait silencieusement à `launched`
// runtime mais le check `=== 'launched'` était false → throw LCEN skipped
// sans warning → deploy live sans SIRET. On warn et on défaut à `launched`
// pour fail-closed (mieux throw LCEN qu'un deploy non-conforme).
const _statusRaw = process.env.COMPANY_STATUS
const _status: 'pre-launch' | 'launched' =
  _statusRaw === 'pre-launch' || _statusRaw === 'launched' ? _statusRaw : 'launched'

if (_statusRaw && _statusRaw !== 'pre-launch' && _statusRaw !== 'launched') {
  console.warn(
    `[company-identity] COMPANY_STATUS="${_statusRaw}" invalide ` +
      `(attendu: 'pre-launch' | 'launched'). Fallback sur 'launched' (fail-closed LCEN).`
  )
}

const _isRuntimeProd =
  process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build'

if (_status === 'launched' && _isRuntimeProd) {
  const issues = REQUIRED_LEGAL_VARS.flatMap(({ var: name, validate, hint }) => {
    const value = process.env[name]
    if (!value) return [`${name} manquant (${hint})`]
    if (!validate(value)) return [`${name} invalide : ${hint}`]
    return []
  })
  if (issues.length > 0) {
    throw new Error(
      `[company-identity] LCEN art.6 violation :\n  - ${issues.join('\n  - ')}\n` +
        `Soit corriger ces vars en prod, soit passer COMPANY_STATUS=pre-launch ` +
        `pendant la phase d'immatriculation. Sanction LCEN art.6 : 75 000€ + 1 an.`
    )
  }
}

export const companyIdentity = {
  // Brand (Level 5 — UI copy only)
  name: 'ServicesArtisans' as const,
  tagline: 'Trouvez des artisans qualifiés près de chez vous',
  description:
    'Des artisans référencés dans toute la France grâce aux données SIREN officielles. Comparez, contactez et trouvez le bon professionnel en quelques clics.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr',

  // Legal identity (Level 1 — from env vars, null until company registration)
  legalName: process.env.COMPANY_LEGAL_NAME || null,
  formeJuridique: process.env.COMPANY_FORME_JURIDIQUE || null,
  capitalSocial: process.env.COMPANY_CAPITAL_SOCIAL || null,
  siret: process.env.COMPANY_SIRET || null,
  rcs: process.env.COMPANY_RCS || null,
  tvaIntracom: process.env.COMPANY_TVA || null,
  address: process.env.COMPANY_ADDRESS || null,
  phone: process.env.COMPANY_PHONE || '07 56 87 27 87',
  directeurPublication: process.env.COMPANY_DIRECTEUR_PUBLICATION || null,
  foundingDate: process.env.COMPANY_FOUNDING_DATE || null,

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
    twitter: 'https://x.com/servicesartisans',
  },

  // Hosting (Level 1 — verifiable)
  hosting: {
    name: 'Vercel Inc.',
    address: '340 S Lemon Ave #4133, Walnut, CA 91789, USA',
    website: 'https://vercel.com',
  },

  // Platform status
  status: _status,
}

/**
 * Centralized marketing statistics — Single Source of Truth.
 * Import this in any component that displays platform numbers.
 */
export const marketingStats = {
  artisanCount: 'SIREN',
  artisanCountShort: 'SIREN',
  cityCount: '1 000+',
  serviceCount: '46',
  responseTime: 'Variable',
} as const

/**
 * True when SIRET, legal name, and address are all filled AND valid.
 *
 * F-sexies : on valide aussi la forme via REQUIRED_LEGAL_VARS — sinon en
 * pre-launch un `COMPANY_SIRET=abc` (skip throw LCEN) faisait remonter
 * `isCompanyRegistered()=true` et publiait "abc" comme SIRET en
 * mentions-legales/JSON-LD.
 */
export function isCompanyRegistered(): boolean {
  if (
    companyIdentity.siret === null ||
    companyIdentity.legalName === null ||
    companyIdentity.address === null
  ) {
    return false
  }
  const byName = new Map(REQUIRED_LEGAL_VARS.map((v) => [v.var, v.validate]))
  const validateSiret = byName.get('COMPANY_SIRET')
  const validateLegalName = byName.get('COMPANY_LEGAL_NAME')
  const validateAddress = byName.get('COMPANY_ADDRESS')
  return Boolean(
    validateSiret?.(companyIdentity.siret) &&
    validateLegalName?.(companyIdentity.legalName) &&
    validateAddress?.(companyIdentity.address)
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
