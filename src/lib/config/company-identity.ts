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
import { sanitizeUrl } from '@/lib/utils/sanitize-url'

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
  // Pivot full RGE 2026-05-03 : repositionnement « 100% artisans RGE certifiés ».
  // 49 228 fiches RGE indexées via mig 306 (Qualibat / Qualifelec / QualiPAC /
  // Qualit'EnR), filiation france-renov.gouv.fr. Avantage différenciant :
  // chaque artisan est éligible MaPrimeRénov' + CEE pour le client final.
  name: 'ServicesArtisans' as const,
  tagline: 'Le premier annuaire 100% artisans RGE certifiés',
  description:
    "Le premier annuaire 100% artisans RGE certifiés en France. 49 000 professionnels qualifiés (Qualibat, Qualifelec, QualiPAC) pour vos travaux de rénovation énergétique éligibles MaPrimeRénov' et CEE. SIREN vérifié, devis gratuits.",
  // Defensive sanitization : strip `\n` / whitespace / control chars + trailing
  // slash. Root cause incident 2026-05-22 — literal `\n` in Vercel env baked
  // into JSON-LD `@id` of 45 677 RGE pages. `sanitizeUrl` falls back to the
  // canonical apex if the env is unusable.
  url: sanitizeUrl(process.env.NEXT_PUBLIC_SITE_URL),

  // Legal identity (Level 1)
  //
  // 2026-06-29 : entité légale = GROUPE MARGUERITE SAS (holding, SIREN
  // 104 644 620), utilisée à titre PROVISOIRE comme éditeur du site en attendant
  // la constitution de la filiale « ServicesArtisans France » SAS qui exploitera
  // la plateforme. Données publiques (annuaire-entreprises.data.gouv.fr).
  // Source : https://annuaire-entreprises.data.gouv.fr/entreprise/groupe-marguerite-104644620
  // Les env vars restent prioritaires : poser COMPANY_* en prod bascule
  // automatiquement vers ServicesArtisans France dès son immatriculation.
  legalName: process.env.COMPANY_LEGAL_NAME || 'GROUPE MARGUERITE',
  formeJuridique: process.env.COMPANY_FORME_JURIDIQUE || 'SAS (Société par Actions Simplifiée)',
  capitalSocial: process.env.COMPANY_CAPITAL_SOCIAL || '1 000 €',
  siret: process.env.COMPANY_SIRET || '104 644 620 00015',
  rcs: process.env.COMPANY_RCS || 'RCS Paris 104 644 620',
  // Pas de TVA intracommunautaire valide à ce jour (unité non employeuse,
  // holding récente) → champ masqué tant que null.
  tvaIntracom: process.env.COMPANY_TVA || null,
  address: process.env.COMPANY_ADDRESS || '16 rue du Buisson Saint-Louis, 75010 Paris',
  phone: process.env.COMPANY_PHONE || '07 56 87 27 87',
  directeurPublication: process.env.COMPANY_DIRECTEUR_PUBLICATION || 'Marvin Bissohong',
  foundingDate: process.env.COMPANY_FOUNDING_DATE || '2026-04-27',

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
