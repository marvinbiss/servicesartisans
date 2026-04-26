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
 * Audit 2026-04-26 (incident GSC "server connectivity" — root cause).
 *
 * Historique :
 *   - F (2026-04-25) : ajoute throw runtime si COMPANY_STATUS=launched et vars
 *     légales manquantes. Intent fail-closed LCEN, mais default `'launched'`
 *     fait throw 500 sur 64% des pages publiques en prod sans vars set →
 *     incident Google Search Console (5xx storm).
 *   - G (2026-04-26) : refactor → fail-closed au BUILD-time uniquement,
 *     fail-OPEN au runtime (log seulement). La conformité LCEN reste assurée
 *     côté composants : mentions-legales/page.tsx affiche conditionnellement
 *     ({companyIdentity.legalName && ...}) et seo/jsonld.ts gate le JSON-LD
 *     via isCompanyRegistered(). Default inversé sur 'pre-launch' (sécurité UX).
 *
 * Comportement final :
 *   - BUILD prod (NEXT_PHASE=phase-production-build) avec COMPANY_STATUS=launched
 *     et vars manquantes → throw, deploy bloqué avant la prod.
 *   - RUNTIME prod avec drift (COMPANY_STATUS changé via dashboard sans rebuild)
 *     → console.error, on continue. Les pages légales affichent les champs
 *     présents (le composant skip ce qui est null).
 *   - DEV / TEST / CI → skip total.
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

// G : default inversé sur 'pre-launch'. La SAS n'est pas immatriculée tant que
// les 4 vars légales ne sont pas posées en env, donc ce default reflète l'état
// réel du projet. Pour publier en mode "launched", il faut explicitement set
// COMPANY_STATUS=launched ET les 4 vars (sinon le build échoue, cf. infra).
const _statusRaw = process.env.COMPANY_STATUS
const _status: 'pre-launch' | 'launched' = _statusRaw === 'launched' ? 'launched' : 'pre-launch'

if (_statusRaw && _statusRaw !== 'pre-launch' && _statusRaw !== 'launched') {
  console.warn(
    `[company-identity] COMPANY_STATUS="${_statusRaw}" invalide ` +
      `(attendu: 'pre-launch' | 'launched'). Fallback sur 'pre-launch'.`
  )
}

const _isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
const _isRuntimeProd = process.env.NODE_ENV === 'production' && !_isBuildTime

if (_status === 'launched' && (_isBuildTime || _isRuntimeProd)) {
  const issues = REQUIRED_LEGAL_VARS.flatMap(({ var: name, validate, hint }) => {
    const value = process.env[name]
    if (!value) return [`${name} manquant (${hint})`]
    if (!validate(value)) return [`${name} invalide : ${hint}`]
    return []
  })
  if (issues.length > 0) {
    const message =
      `[company-identity] LCEN art.6 violation :\n  - ${issues.join('\n  - ')}\n` +
      `Soit corriger ces vars en prod, soit passer COMPANY_STATUS=pre-launch ` +
      `pendant la phase d'immatriculation. Sanction LCEN art.6 : 75 000€ + 1 an.`

    if (_isBuildTime) {
      // Bloque le build prod → impossible de déployer 'launched' sans vars.
      throw new Error(message)
    }
    // Drift runtime (env modifiée via dashboard sans rebuild) : on logue
    // l'erreur pour Sentry mais on ne crash pas les pages publiques.
    // La conformité LCEN reste garantie par les composants (mentions-legales
    // affiche conditionnellement les champs présents, JSON-LD gated par
    // isCompanyRegistered).
    console.error(message)
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
