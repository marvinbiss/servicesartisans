/**
 * INSEE SIRENE API Client
 * Official French business registry
 * Documentation: https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=Sirene&version=V3&provider=insee
 */

import { retry, CircuitBreaker } from '../utils/retry'
import { apiCache, cacheAside } from '../utils/cache'
import { APIError, ValidationError, NotFoundError, ErrorCode } from '../utils/errors'
import { apiLogger } from '../utils/logger'

const INSEE_API_BASE = 'https://api.insee.fr/entreprises/sirene/V3.11'

// Types
export interface EtablissementSirene {
  siren: string
  siret: string
  dateCreationEtablissement: string
  trancheEffectifsEtablissement: string
  activitePrincipaleEtablissement: string
  etablissementSiege: boolean
  etatAdministratifEtablissement: 'A' | 'F' // Actif | Fermé
  adresseEtablissement: {
    complementAdresseEtablissement?: string
    numeroVoieEtablissement?: string
    typeVoieEtablissement?: string
    libelleVoieEtablissement?: string
    codePostalEtablissement: string
    libelleCommuneEtablissement: string
    codeCommuneEtablissement: string
  }
  periodesEtablissement: Array<{
    dateDebut: string
    dateFin?: string
    activitePrincipaleEtablissement: string
    etatAdministratifEtablissement: 'A' | 'F'
  }>
}

export interface UniteLegaleSirene {
  siren: string
  statutDiffusionUniteLegale: 'O' | 'P' // Public | Partiellement diffusible
  dateCreationUniteLegale: string
  sigleUniteLegale?: string
  categorieEntreprise: 'PME' | 'ETI' | 'GE'
  trancheEffectifsUniteLegale: string
  activitePrincipaleUniteLegale: string
  categorieJuridiqueUniteLegale: string
  denominationUniteLegale?: string
  nomUniteLegale?: string
  prenomUsuelUniteLegale?: string
  etatAdministratifUniteLegale: 'A' | 'C' // Actif | Cessé
}

interface SireneResponse<T> {
  header: {
    statut: number
    message: string
    total: number
    debut: number
    nombre: number
  }
  etablissements?: T[]
  unitesLegales?: T[]
  etablissement?: T
  uniteLegale?: T
}

// Circuit breaker for SIRENE API
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000,
  halfOpenRequests: 1,
})

// Token management
let accessToken: string | null = null
let tokenExpiry: number = 0

/**
 * Get OAuth2 access token for INSEE API
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now()

  // Return cached token if valid
  if (accessToken && tokenExpiry > now + 60000) {
    return accessToken
  }

  const consumerKey = process.env.INSEE_CONSUMER_KEY
  const consumerSecret = process.env.INSEE_CONSUMER_SECRET

  if (!consumerKey || !consumerSecret) {
    throw new APIError('INSEE', 'API credentials not configured', {
      code: ErrorCode.API_UNAUTHORIZED,
    })
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

  const response = await fetch('https://api.insee.fr/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new APIError('INSEE', 'Failed to obtain access token', {
      code: ErrorCode.API_UNAUTHORIZED,
      statusCode: response.status,
    })
  }

  const data = await response.json()
  accessToken = data.access_token
  tokenExpiry = now + (data.expires_in * 1000)

  return accessToken!
}

/**
 * Make authenticated request to SIRENE API
 */
async function sireneRequest<T>(
  endpoint: string,
  options: {
    params?: Record<string, string>
    cacheKey?: string
    cacheTtl?: number
  } = {}
): Promise<T> {
  const logger = apiLogger.child({ api: 'sirene' })
  const start = Date.now()

  // Check cache first
  if (options.cacheKey) {
    const cached = apiCache.get(options.cacheKey)
    if (cached !== undefined) {
      logger.debug('Cache hit', { cacheKey: options.cacheKey })
      return cached as T
    }
  }

  try {
    return await circuitBreaker.execute(async () => {
      return await retry(async () => {
        const token = await getAccessToken()

        const url = new URL(`${INSEE_API_BASE}${endpoint}`)
        if (options.params) {
          Object.entries(options.params).forEach(([key, value]) => {
            url.searchParams.append(key, value)
          })
        }

        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })

        const duration = Date.now() - start

        if (!response.ok) {
          if (response.status === 404) {
            throw new NotFoundError('Entreprise')
          }
          if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '60')
            throw new APIError('INSEE', 'Rate limit exceeded', {
              code: ErrorCode.API_RATE_LIMIT,
              statusCode: 429,
              retryable: true,
              context: { retryAfter },
            })
          }
          throw new APIError('INSEE', `API error: ${response.status}`, {
            statusCode: response.status,
            context: { endpoint },
            retryable: response.status >= 500,
          })
        }

        const data = await response.json()
        logger.api('GET', url.toString(), { statusCode: response.status, duration })

        // Cache successful response
        if (options.cacheKey) {
          apiCache.set(options.cacheKey, data, options.cacheTtl || 24 * 60 * 60 * 1000)
        }

        return data as T
      }, {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        onRetry: (error, attempt, delay) => {
          logger.warn(`Retry attempt ${attempt}`, { error, delay })
        },
      })
    })
  } catch (error) {
    logger.error('SIRENE request failed', error as Error, { endpoint })
    throw error
  }
}

// ============================================
// PUBLIC API FUNCTIONS
// ============================================

/**
 * Get establishment by SIRET
 */
export async function getEtablissementBySiret(siret: string): Promise<EtablissementSirene | null> {
  // Validate SIRET
  const siretClean = siret.replace(/\s/g, '')
  if (siretClean.length !== 14 || !/^\d{14}$/.test(siretClean)) {
    throw new ValidationError('SIRET invalide', { field: 'siret', value: siret })
  }

  try {
    const response = await sireneRequest<SireneResponse<EtablissementSirene>>(
      `/siret/${siretClean}`,
      {
        cacheKey: `sirene:siret:${siretClean}`,
        cacheTtl: 24 * 60 * 60 * 1000, // 24h
      }
    )

    return response.etablissement || null
  } catch (error) {
    if (error instanceof NotFoundError) {
      return null
    }
    throw error
  }
}

/**
 * Get legal unit by SIREN
 */
export async function getUniteLegaleBySiren(siren: string): Promise<UniteLegaleSirene | null> {
  // Validate SIREN
  const sirenClean = siren.replace(/\s/g, '')
  if (sirenClean.length !== 9 || !/^\d{9}$/.test(sirenClean)) {
    throw new ValidationError('SIREN invalide', { field: 'siren', value: siren })
  }

  try {
    const response = await sireneRequest<SireneResponse<UniteLegaleSirene>>(
      `/siren/${sirenClean}`,
      {
        cacheKey: `sirene:siren:${sirenClean}`,
        cacheTtl: 24 * 60 * 60 * 1000,
      }
    )

    return response.uniteLegale || null
  } catch (error) {
    if (error instanceof NotFoundError) {
      return null
    }
    throw error
  }
}

/**
 * Search establishments
 */
export async function rechercherEtablissements(options: {
  q?: string
  codePostal?: string
  commune?: string
  activitePrincipale?: string
  etatAdministratif?: 'A' | 'F'
  nombre?: number
  debut?: number
}): Promise<{ etablissements: EtablissementSirene[]; total: number }> {
  const params: Record<string, string> = {}

  // Build query
  const queryParts: string[] = []

  if (options.q) {
    queryParts.push(`denominationUniteLegale:"${options.q}"*`)
  }
  if (options.codePostal) {
    queryParts.push(`codePostalEtablissement:${options.codePostal}`)
  }
  if (options.commune) {
    queryParts.push(`libelleCommuneEtablissement:"${options.commune}"`)
  }
  if (options.activitePrincipale) {
    queryParts.push(`activitePrincipaleEtablissement:${options.activitePrincipale}`)
  }
  if (options.etatAdministratif) {
    queryParts.push(`etatAdministratifEtablissement:${options.etatAdministratif}`)
  }

  if (queryParts.length === 0) {
    throw new ValidationError('Au moins un critère de recherche est requis')
  }

  params.q = queryParts.join(' AND ')
  params.nombre = String(options.nombre || 20)
  params.debut = String(options.debut || 0)

  const response = await sireneRequest<SireneResponse<EtablissementSirene>>(
    '/siret',
    { params }
  )

  return {
    etablissements: response.etablissements || [],
    total: response.header.total,
  }
}

/**
 * Verify SIRET is valid and active
 */
export async function verifierSiret(siret: string): Promise<{
  valide: boolean
  actif: boolean
  message: string
  etablissement?: EtablissementSirene
}> {
  try {
    const etablissement = await getEtablissementBySiret(siret)

    if (!etablissement) {
      return {
        valide: false,
        actif: false,
        message: 'SIRET non trouvé dans le répertoire SIRENE',
      }
    }

    const actif = etablissement.etatAdministratifEtablissement === 'A'

    return {
      valide: true,
      actif,
      message: actif
        ? 'Établissement actif'
        : 'Établissement fermé',
      etablissement,
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        valide: false,
        actif: false,
        message: error.message,
      }
    }
    throw error
  }
}

/**
 * Get formatted address from establishment
 */
export function formatAdresseEtablissement(etablissement: EtablissementSirene): string {
  const addr = etablissement.adresseEtablissement
  const parts: string[] = []

  if (addr.numeroVoieEtablissement) {
    parts.push(addr.numeroVoieEtablissement)
  }
  if (addr.typeVoieEtablissement) {
    parts.push(addr.typeVoieEtablissement)
  }
  if (addr.libelleVoieEtablissement) {
    parts.push(addr.libelleVoieEtablissement)
  }

  const ligne1 = parts.join(' ')
  const ligne2 = `${addr.codePostalEtablissement} ${addr.libelleCommuneEtablissement}`

  return `${ligne1}, ${ligne2}`
}

/**
 * Tranches effectifs INSEE codes
 */
export const TRANCHES_EFFECTIFS: Record<string, string> = {
  'NN': 'Non employeur',
  '00': '0 salarié',
  '01': '1 ou 2 salariés',
  '02': '3 à 5 salariés',
  '03': '6 à 9 salariés',
  '11': '10 à 19 salariés',
  '12': '20 à 49 salariés',
  '21': '50 à 99 salariés',
  '22': '100 à 199 salariés',
  '31': '200 à 249 salariés',
  '32': '250 à 499 salariés',
  '41': '500 à 999 salariés',
  '42': '1 000 à 1 999 salariés',
  '51': '2 000 à 4 999 salariés',
  '52': '5 000 à 9 999 salariés',
  '53': '10 000 salariés et plus',
}

export function getLibelleTrancheEffectifs(code: string): string {
  return TRANCHES_EFFECTIFS[code] || 'Non renseigné'
}
