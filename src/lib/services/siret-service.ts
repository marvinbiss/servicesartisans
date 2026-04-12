/**
 * SIRET/SIREN Verification Service — Business logic for company lookups
 * Framework-agnostic: no NextRequest/NextResponse
 */

import { logger } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SiretAddress {
  numero: string
  voie: string
  codePostal: string
  commune: string
  departement: string
}

export interface SiretLookupResult {
  found: true
  siret: string
  siren: string
  denomination: string
  formeJuridique: string
  dateCreation: string
  activitePrincipale: string
  libelleActivite: string
  adresse?: SiretAddress
  etatAdministratif: string
  isActive: boolean
  trancheEffectifs: string
  categorieEntreprise: string
}

export interface SiretNotFoundResult {
  found: false
  siret: string
  siren?: string
  message: string
}

export type SiretResult = SiretLookupResult | SiretNotFoundResult

export type SiretValidationError = { valid: false; error: string } | { valid: true }

// ---------------------------------------------------------------------------
// Luhn checksum
// ---------------------------------------------------------------------------

export function validateSiretLuhn(siret: string): boolean {
  let sum = 0
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(siret[i], 10)
    if (i % 2 === 0) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

// ---------------------------------------------------------------------------
// Mapping tables
// ---------------------------------------------------------------------------

const FORMES_JURIDIQUES: Record<string, string> = {
  '1000': 'Entrepreneur individuel',
  '5410': 'SARL',
  '5499': 'SARL unipersonnelle (EURL)',
  '5498': 'SARL unipersonnelle',
  '5505': 'SA',
  '5510': 'SA',
  '5710': 'SAS',
  '5720': 'SASU',
  '6540': 'Micro-entreprise',
  '5485': 'Societe europeenne',
}

function getFormeJuridique(code: string | undefined | null): string {
  if (!code) return 'Non renseigne'
  return FORMES_JURIDIQUES[code] || `Code ${code}`
}

const TRANCHES_EFFECTIFS: Record<string, string> = {
  NN: 'Non renseigne',
  '00': '0 salarie',
  '01': '1 ou 2 salaries',
  '02': '3 a 5 salaries',
  '03': '6 a 9 salaries',
  '11': '10 a 19 salaries',
  '12': '20 a 49 salaries',
  '21': '50 a 99 salaries',
  '22': '100 a 199 salaries',
  '31': '200 a 249 salaries',
  '32': '250 a 499 salaries',
  '41': '500 a 999 salaries',
  '42': '1 000 a 1 999 salaries',
  '51': '2 000 a 4 999 salaries',
  '52': '5 000 a 9 999 salaries',
  '53': '10 000 salaries et plus',
}

function getTrancheEffectifs(code: string | undefined | null): string {
  if (!code) return 'Non renseigne'
  return TRANCHES_EFFECTIFS[code] || 'Non renseigne'
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateSiretInput(siret: string): SiretValidationError {
  if (!/^\d{14}$/.test(siret)) {
    return { valid: false, error: 'Le numero SIRET doit contenir exactement 14 chiffres.' }
  }
  if (!validateSiretLuhn(siret)) {
    return { valid: false, error: 'Ce numero SIRET est invalide (somme de controle incorrecte).' }
  }
  return { valid: true }
}

export function validateSirenInput(siren: string): SiretValidationError {
  if (!/^\d{9}$/.test(siren)) {
    return { valid: false, error: 'Le numero SIREN doit contenir exactement 9 chiffres.' }
  }
  return { valid: true }
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatInseeResult(siren: string, unite: any, etab: any): SiretLookupResult {
  const adresse = etab.adresseEtablissement
  const isActive = etab.periodesEtablissement?.[0]?.etatAdministratifEtablissement === 'A'
  return {
    found: true,
    siret: etab.siret || `${siren}${unite.nicSiegeUniteLegale || '00001'}`,
    siren,
    denomination:
      unite.denominationUniteLegale ||
      `${unite.prenomUsuelUniteLegale || ''} ${unite.nomUniteLegale || ''}`.trim() ||
      'Non renseigne',
    formeJuridique: getFormeJuridique(unite.categorieJuridiqueUniteLegale),
    dateCreation: unite.dateCreationUniteLegale || '',
    activitePrincipale: etab.periodesEtablissement?.[0]?.activitePrincipaleEtablissement || '',
    libelleActivite: '',
    adresse: adresse
      ? {
          numero: adresse.numeroVoieEtablissement || '',
          voie: `${adresse.typeVoieEtablissement || ''} ${adresse.libelleVoieEtablissement || ''}`.trim(),
          codePostal: adresse.codePostalEtablissement || '',
          commune: adresse.libelleCommuneEtablissement || '',
          departement: adresse.codePostalEtablissement?.substring(0, 2) || '',
        }
      : undefined,
    etatAdministratif: isActive ? 'Active' : 'Fermee',
    isActive,
    trancheEffectifs: getTrancheEffectifs(unite.trancheEffectifsUniteLegale),
    categorieEntreprise: unite.categorieEntreprise || '',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatGouvResult(siren: string, unite: any, etab: any): SiretLookupResult {
  return {
    found: true,
    siret: etab.siret || `${siren}00001`,
    siren,
    denomination:
      unite?.denomination ||
      unite?.nom_raison_sociale ||
      `${unite?.prenom_1 || ''} ${unite?.nom || ''}`.trim() ||
      'Non renseigne',
    formeJuridique: getFormeJuridique(unite?.categorie_juridique),
    dateCreation: unite?.date_creation || '',
    activitePrincipale: etab.activite_principale || '',
    libelleActivite: etab.libelle_activite_principale || '',
    adresse: {
      numero: etab.numero_voie || '',
      voie: `${etab.type_voie || ''} ${etab.libelle_voie || ''}`.trim(),
      codePostal: etab.code_postal || '',
      commune: etab.libelle_commune || '',
      departement: etab.code_postal?.substring(0, 2) || '',
    },
    etatAdministratif: etab.etat_administratif === 'A' ? 'Active' : 'Fermee',
    isActive: etab.etat_administratif === 'A',
    trancheEffectifs: getTrancheEffectifs(unite?.tranche_effectifs),
    categorieEntreprise: unite?.categorie_entreprise || '',
  }
}

// ---------------------------------------------------------------------------
// Core lookups
// ---------------------------------------------------------------------------

export async function lookupSiren(siren: string): Promise<SiretResult> {
  const inseeToken = process.env.INSEE_API_TOKEN

  // Try INSEE API first
  if (inseeToken) {
    try {
      const inseeRes = await fetch(`https://api.insee.fr/entreprises/sirene/V3.11/siren/${siren}`, {
        headers: {
          Authorization: `Bearer ${inseeToken}`,
          Accept: 'application/json',
        },
        next: { revalidate: 86400 },
      })

      if (inseeRes.ok) {
        const inseeData = await inseeRes.json()
        const unite = inseeData.uniteLegale
        if (unite) {
          const siegeSiret = `${siren}${unite.nicSiegeUniteLegale || '00001'}`
          const siegeRes = await fetch(
            `https://api.insee.fr/entreprises/sirene/V3.11/siret/${siegeSiret}`,
            {
              headers: {
                Authorization: `Bearer ${inseeToken}`,
                Accept: 'application/json',
              },
              next: { revalidate: 86400 },
            }
          )
          if (siegeRes.ok) {
            const siegeData = await siegeRes.json()
            if (siegeData.etablissement) {
              return formatInseeResult(siren, unite, siegeData.etablissement)
            }
          }
          return formatInseeResult(siren, unite, { siret: siegeSiret })
        }
      }
    } catch {
      logger.warn('INSEE SIREN API failed, falling back to data.gouv.fr')
    }
  }

  // Fallback: data.gouv.fr
  const res = await fetch(`https://entreprise.data.gouv.fr/api/sirene/v3/unites_legales/${siren}`, {
    next: { revalidate: 86400 },
  })

  if (!res.ok) {
    if (res.status === 404) {
      return {
        found: false,
        siret: siren,
        siren,
        message: 'Aucune entreprise trouvee pour ce numero SIREN.',
      }
    }
    throw new Error(`data.gouv.fr SIREN API error: ${res.status}`)
  }

  const data = await res.json()
  const uniteLegale = data.unite_legale

  if (!uniteLegale) {
    return {
      found: false,
      siret: siren,
      siren,
      message: 'Aucune entreprise trouvee pour ce numero SIREN.',
    }
  }

  const siege = uniteLegale.etablissement_siege || uniteLegale.etablissements?.[0] || {}
  return formatGouvResult(siren, uniteLegale, siege)
}

export async function lookupSiret(siret: string): Promise<SiretResult> {
  const siren = siret.substring(0, 9)
  const inseeToken = process.env.INSEE_API_TOKEN

  // Try INSEE API first
  if (inseeToken) {
    try {
      const inseeRes = await fetch(`https://api.insee.fr/entreprises/sirene/V3.11/siret/${siret}`, {
        headers: {
          Authorization: `Bearer ${inseeToken}`,
          Accept: 'application/json',
        },
        next: { revalidate: 86400 },
      })

      if (inseeRes.ok) {
        const inseeData = await inseeRes.json()
        const etab = inseeData.etablissement
        if (etab) {
          return formatInseeResult(siren, etab.uniteLegale, etab)
        }
      }
    } catch {
      logger.warn('INSEE API failed, falling back to data.gouv.fr')
    }
  }

  // Fallback: data.gouv.fr
  const res = await fetch(`https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${siret}`, {
    next: { revalidate: 86400 },
  })

  if (!res.ok) {
    if (res.status === 404) {
      return {
        found: false,
        siret,
        message: 'Aucune entreprise trouvee pour ce numero SIRET.',
      }
    }
    throw new Error(`data.gouv.fr API error: ${res.status}`)
  }

  const data = await res.json()
  const etab = data.etablissement

  if (!etab) {
    return {
      found: false,
      siret,
      message: 'Aucune entreprise trouvee pour ce numero SIRET.',
    }
  }

  return formatGouvResult(siren, etab.unite_legale, etab)
}
