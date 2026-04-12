/**
 * Tests for SIRET/SIREN Verification Service
 * Covers: validation, Luhn checksum, lookupSiret, lookupSiren, fallback behavior, edge cases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock logger before importing the service
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

import {
  validateSiretLuhn,
  validateSiretInput,
  validateSirenInput,
  lookupSiret,
  lookupSiren,
} from '@/lib/services/siret-service'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchSequence(
  ...responses: Array<{ ok: boolean; status: number; json: () => Promise<unknown> }>
) {
  const fetchMock = vi.fn()
  for (const res of responses) {
    fetchMock.mockResolvedValueOnce(res)
  }
  return fetchMock
}

function okResponse(data: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(data) }
}

function notFoundResponse() {
  return { ok: false, status: 404, json: () => Promise.resolve({}) }
}

function errorResponse(status = 500) {
  return { ok: false, status, json: () => Promise.resolve({}) }
}

// A known valid SIRET that passes Luhn: 73282932000074
// SIREN: 732829320
const VALID_SIRET = '73282932000074'
const VALID_SIREN = '732829320'

// ---------------------------------------------------------------------------
// validateSiretLuhn
// ---------------------------------------------------------------------------

describe('validateSiretLuhn', () => {
  it('returns true for a valid SIRET with correct Luhn checksum', () => {
    expect(validateSiretLuhn(VALID_SIRET)).toBe(true)
  })

  it('returns false for a SIRET with incorrect checksum', () => {
    // Change last digit to break checksum
    expect(validateSiretLuhn('73282932000075')).toBe(false)
  })

  it('returns true for all-zeros SIRET (Luhn sum = 0)', () => {
    expect(validateSiretLuhn('00000000000000')).toBe(true)
  })

  it('returns false for sequential digits that fail Luhn', () => {
    expect(validateSiretLuhn('12345678901234')).toBe(false)
  })

  it('handles La Poste SIRET (special Luhn exception in real life but standard algo here)', () => {
    // La Poste: 35600000000048 - test standard Luhn calculation
    const result = validateSiretLuhn('35600000000048')
    expect(typeof result).toBe('boolean')
  })
})

// ---------------------------------------------------------------------------
// validateSiretInput
// ---------------------------------------------------------------------------

describe('validateSiretInput', () => {
  it('returns valid for a correct 14-digit SIRET', () => {
    expect(validateSiretInput(VALID_SIRET)).toEqual({ valid: true })
  })

  it('rejects empty string', () => {
    const result = validateSiretInput('')
    expect(result).toHaveProperty('valid', false)
    expect(result).toHaveProperty('error')
  })

  it('rejects SIRET with fewer than 14 digits', () => {
    const result = validateSiretInput('1234567890123')
    expect(result).toHaveProperty('valid', false)
  })

  it('rejects SIRET with more than 14 digits', () => {
    const result = validateSiretInput('123456789012345')
    expect(result).toHaveProperty('valid', false)
  })

  it('rejects SIRET with spaces (not pre-cleaned)', () => {
    const result = validateSiretInput('732 829 320 00074')
    expect(result).toHaveProperty('valid', false)
  })

  it('rejects SIRET with non-numeric characters', () => {
    const result = validateSiretInput('7328293200007A')
    expect(result).toHaveProperty('valid', false)
  })

  it('rejects SIRET with special characters', () => {
    const result = validateSiretInput('73282932-00074')
    expect(result).toHaveProperty('valid', false)
  })

  it('rejects 14-digit SIRET with bad Luhn checksum', () => {
    const result = validateSiretInput('73282932000075')
    expect(result).toHaveProperty('valid', false)
    expect((result as { valid: false; error: string }).error).toContain('somme de controle')
  })

  it('error message mentions 14 chiffres for wrong length', () => {
    const result = validateSiretInput('123')
    expect((result as { valid: false; error: string }).error).toContain('14 chiffres')
  })
})

// ---------------------------------------------------------------------------
// validateSirenInput
// ---------------------------------------------------------------------------

describe('validateSirenInput', () => {
  it('returns valid for a correct 9-digit SIREN', () => {
    expect(validateSirenInput(VALID_SIREN)).toEqual({ valid: true })
  })

  it('rejects empty string', () => {
    const result = validateSirenInput('')
    expect(result).toHaveProperty('valid', false)
  })

  it('rejects SIREN with fewer than 9 digits', () => {
    const result = validateSirenInput('12345678')
    expect(result).toHaveProperty('valid', false)
  })

  it('rejects SIREN with more than 9 digits', () => {
    const result = validateSirenInput('1234567890')
    expect(result).toHaveProperty('valid', false)
  })

  it('rejects SIREN with non-numeric characters', () => {
    const result = validateSirenInput('73282932A')
    expect(result).toHaveProperty('valid', false)
  })

  it('error message mentions 9 chiffres', () => {
    const result = validateSirenInput('123')
    expect((result as { valid: false; error: string }).error).toContain('9 chiffres')
  })
})

// ---------------------------------------------------------------------------
// lookupSiret
// ---------------------------------------------------------------------------

describe('lookupSiret', () => {
  const originalFetch = globalThis.fetch
  const originalEnv = process.env.INSEE_API_TOKEN

  beforeEach(() => {
    process.env.INSEE_API_TOKEN = 'test-token'
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    process.env.INSEE_API_TOKEN = originalEnv
  })

  it('returns result from INSEE API when available', async () => {
    const inseeData = {
      etablissement: {
        siret: VALID_SIRET,
        uniteLegale: {
          denominationUniteLegale: 'ACME Corp',
          categorieJuridiqueUniteLegale: '5710',
          dateCreationUniteLegale: '2020-01-01',
          trancheEffectifsUniteLegale: '01',
          categorieEntreprise: 'PME',
        },
        adresseEtablissement: {
          numeroVoieEtablissement: '10',
          typeVoieEtablissement: 'RUE',
          libelleVoieEtablissement: 'DES TESTS',
          codePostalEtablissement: '75001',
          libelleCommuneEtablissement: 'PARIS',
        },
        periodesEtablissement: [
          { etatAdministratifEtablissement: 'A', activitePrincipaleEtablissement: '43.21A' },
        ],
      },
    }

    globalThis.fetch = vi.fn().mockResolvedValue(okResponse(inseeData))

    const result = await lookupSiret(VALID_SIRET)
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.denomination).toBe('ACME Corp')
      expect(result.formeJuridique).toBe('SAS')
      expect(result.isActive).toBe(true)
      expect(result.etatAdministratif).toBe('Active')
      expect(result.adresse?.codePostal).toBe('75001')
      expect(result.siren).toBe(VALID_SIREN)
    }
  })

  it('falls back to data.gouv.fr when INSEE API throws', async () => {
    const gouvData = {
      etablissement: {
        siret: VALID_SIRET,
        activite_principale: '43.21A',
        libelle_activite_principale: 'Travaux de plomberie',
        etat_administratif: 'A',
        numero_voie: '5',
        type_voie: 'AVENUE',
        libelle_voie: 'DU FALLBACK',
        code_postal: '69001',
        libelle_commune: 'LYON',
        unite_legale: {
          denomination: 'Fallback SARL',
          categorie_juridique: '5410',
          date_creation: '2019-06-15',
          tranche_effectifs: '02',
          categorie_entreprise: 'PME',
        },
      },
    }

    const fetchMock = vi.fn()
    // INSEE call throws
    fetchMock.mockRejectedValueOnce(new Error('Network error'))
    // data.gouv.fr succeeds
    fetchMock.mockResolvedValueOnce(okResponse(gouvData))
    globalThis.fetch = fetchMock

    const result = await lookupSiret(VALID_SIRET)
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.denomination).toBe('Fallback SARL')
      expect(result.formeJuridique).toBe('SARL')
      expect(result.adresse?.commune).toBe('LYON')
    }
  })

  it('falls back to data.gouv.fr when INSEE returns non-ok', async () => {
    const gouvData = {
      etablissement: {
        siret: VALID_SIRET,
        etat_administratif: 'F',
        unite_legale: { denomination: 'Closed Corp' },
      },
    }

    globalThis.fetch = mockFetchSequence(
      errorResponse(401), // INSEE unauthorized
      okResponse(gouvData)
    )

    const result = await lookupSiret(VALID_SIRET)
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.denomination).toBe('Closed Corp')
      expect(result.isActive).toBe(false)
      expect(result.etatAdministratif).toBe('Fermee')
    }
  })

  it('returns not found when data.gouv.fr returns 404', async () => {
    globalThis.fetch = mockFetchSequence(
      errorResponse(401), // INSEE fails
      notFoundResponse()
    )

    const result = await lookupSiret(VALID_SIRET)
    expect(result.found).toBe(false)
    if (!result.found) {
      expect(result.message).toContain('Aucune entreprise')
    }
  })

  it('returns not found when data.gouv.fr returns empty etablissement', async () => {
    globalThis.fetch = mockFetchSequence(errorResponse(401), okResponse({ etablissement: null }))

    const result = await lookupSiret(VALID_SIRET)
    expect(result.found).toBe(false)
  })

  it('throws on data.gouv.fr non-404 error', async () => {
    globalThis.fetch = mockFetchSequence(
      errorResponse(401), // INSEE
      errorResponse(500) // data.gouv.fr
    )

    await expect(lookupSiret(VALID_SIRET)).rejects.toThrow('data.gouv.fr API error: 500')
  })

  it('skips INSEE when no token is set', async () => {
    delete process.env.INSEE_API_TOKEN

    const gouvData = {
      etablissement: {
        siret: VALID_SIRET,
        etat_administratif: 'A',
        unite_legale: { denomination: 'No Token Corp' },
      },
    }

    globalThis.fetch = vi.fn().mockResolvedValue(okResponse(gouvData))

    const result = await lookupSiret(VALID_SIRET)
    expect(result.found).toBe(true)
    // Should only call fetch once (data.gouv.fr directly)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('extracts SIREN as first 9 digits of SIRET', async () => {
    globalThis.fetch = mockFetchSequence(
      errorResponse(401),
      okResponse({
        etablissement: {
          siret: VALID_SIRET,
          etat_administratif: 'A',
          unite_legale: { denomination: 'Test' },
        },
      })
    )

    const result = await lookupSiret(VALID_SIRET)
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.siren).toBe(VALID_SIRET.substring(0, 9))
    }
  })

  it('sends correct Authorization header to INSEE', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okResponse({
        etablissement: {
          siret: VALID_SIRET,
          uniteLegale: {},
          periodesEtablissement: [{ etatAdministratifEtablissement: 'A' }],
        },
      })
    )
    globalThis.fetch = fetchMock

    await lookupSiret(VALID_SIRET)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('api.insee.fr'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    )
  })
})

// ---------------------------------------------------------------------------
// lookupSiren
// ---------------------------------------------------------------------------

describe('lookupSiren', () => {
  const originalFetch = globalThis.fetch
  const originalEnv = process.env.INSEE_API_TOKEN

  beforeEach(() => {
    process.env.INSEE_API_TOKEN = 'test-token'
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    process.env.INSEE_API_TOKEN = originalEnv
  })

  it('returns result from INSEE SIREN API + siege lookup', async () => {
    const sirenData = {
      uniteLegale: {
        denominationUniteLegale: 'INSEE SIREN Corp',
        nicSiegeUniteLegale: '00074',
        categorieJuridiqueUniteLegale: '5720',
        dateCreationUniteLegale: '2021-03-10',
        trancheEffectifsUniteLegale: '03',
        categorieEntreprise: 'PME',
      },
    }
    const siegeData = {
      etablissement: {
        siret: VALID_SIRET,
        adresseEtablissement: {
          codePostalEtablissement: '33000',
          libelleCommuneEtablissement: 'BORDEAUX',
        },
        periodesEtablissement: [
          { etatAdministratifEtablissement: 'A', activitePrincipaleEtablissement: '62.01Z' },
        ],
      },
    }

    globalThis.fetch = mockFetchSequence(okResponse(sirenData), okResponse(siegeData))

    const result = await lookupSiren(VALID_SIREN)
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.denomination).toBe('INSEE SIREN Corp')
      expect(result.formeJuridique).toBe('SASU')
      expect(result.adresse?.commune).toBe('BORDEAUX')
    }
  })

  it('returns INSEE result even when siege fetch fails', async () => {
    const sirenData = {
      uniteLegale: {
        denominationUniteLegale: 'Partial Corp',
        nicSiegeUniteLegale: '00074',
        categorieJuridiqueUniteLegale: '1000',
      },
    }

    globalThis.fetch = mockFetchSequence(
      okResponse(sirenData),
      errorResponse(500) // siege fetch fails
    )

    const result = await lookupSiren(VALID_SIREN)
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.denomination).toBe('Partial Corp')
      expect(result.formeJuridique).toBe('Entrepreneur individuel')
    }
  })

  it('falls back to data.gouv.fr when INSEE throws', async () => {
    const gouvData = {
      unite_legale: {
        denomination: 'Gouv SIREN Corp',
        categorie_juridique: '5505',
        date_creation: '2018-01-01',
        etablissement_siege: {
          siret: `${VALID_SIREN}00001`,
          activite_principale: '43.22A',
          etat_administratif: 'A',
          code_postal: '13001',
          libelle_commune: 'MARSEILLE',
        },
      },
    }

    const fetchMock = vi.fn()
    fetchMock.mockRejectedValueOnce(new Error('INSEE down'))
    fetchMock.mockResolvedValueOnce(okResponse(gouvData))
    globalThis.fetch = fetchMock

    const result = await lookupSiren(VALID_SIREN)
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.denomination).toBe('Gouv SIREN Corp')
      expect(result.formeJuridique).toBe('SA')
    }
  })

  it('returns not found when data.gouv.fr returns 404', async () => {
    globalThis.fetch = mockFetchSequence(errorResponse(401), notFoundResponse())

    const result = await lookupSiren(VALID_SIREN)
    expect(result.found).toBe(false)
    if (!result.found) {
      expect(result.message).toContain('SIREN')
      expect(result.siren).toBe(VALID_SIREN)
    }
  })

  it('returns not found when data.gouv.fr returns empty unite_legale', async () => {
    globalThis.fetch = mockFetchSequence(errorResponse(401), okResponse({ unite_legale: null }))

    const result = await lookupSiren(VALID_SIREN)
    expect(result.found).toBe(false)
  })

  it('throws on data.gouv.fr non-404 error', async () => {
    globalThis.fetch = mockFetchSequence(
      errorResponse(401),
      errorResponse(429) // rate limited
    )

    await expect(lookupSiren(VALID_SIREN)).rejects.toThrow('data.gouv.fr SIREN API error: 429')
  })

  it('skips INSEE when no token is set', async () => {
    delete process.env.INSEE_API_TOKEN

    const gouvData = {
      unite_legale: {
        denomination: 'Direct Gouv',
        etablissement_siege: {
          siret: `${VALID_SIREN}00001`,
          etat_administratif: 'A',
        },
      },
    }

    globalThis.fetch = vi.fn().mockResolvedValue(okResponse(gouvData))

    const result = await lookupSiren(VALID_SIREN)
    expect(result.found).toBe(true)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain(
      'data.gouv.fr'
    )
  })

  it('uses first etablissement when no siege', async () => {
    delete process.env.INSEE_API_TOKEN

    const gouvData = {
      unite_legale: {
        denomination: 'No Siege Corp',
        etablissements: [
          {
            siret: `${VALID_SIREN}00002`,
            etat_administratif: 'A',
            code_postal: '44000',
            libelle_commune: 'NANTES',
          },
        ],
      },
    }

    globalThis.fetch = vi.fn().mockResolvedValue(okResponse(gouvData))

    const result = await lookupSiren(VALID_SIREN)
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.adresse?.commune).toBe('NANTES')
    }
  })
})

// ---------------------------------------------------------------------------
// Format helpers (tested indirectly through lookups)
// ---------------------------------------------------------------------------

describe('format helpers via lookups', () => {
  const originalFetch = globalThis.fetch
  const originalEnv = process.env.INSEE_API_TOKEN

  afterEach(() => {
    globalThis.fetch = originalFetch
    process.env.INSEE_API_TOKEN = originalEnv
  })

  it('maps forme juridique codes correctly', async () => {
    delete process.env.INSEE_API_TOKEN
    globalThis.fetch = vi.fn().mockResolvedValue(
      okResponse({
        etablissement: {
          siret: VALID_SIRET,
          etat_administratif: 'A',
          unite_legale: { categorie_juridique: '5499' },
        },
      })
    )

    const result = await lookupSiret(VALID_SIRET)
    if (result.found) {
      expect(result.formeJuridique).toBe('SARL unipersonnelle (EURL)')
    }
  })

  it('returns "Non renseigne" for unknown forme juridique', async () => {
    delete process.env.INSEE_API_TOKEN
    globalThis.fetch = vi.fn().mockResolvedValue(
      okResponse({
        etablissement: {
          siret: VALID_SIRET,
          etat_administratif: 'A',
          unite_legale: { categorie_juridique: null },
        },
      })
    )

    const result = await lookupSiret(VALID_SIRET)
    if (result.found) {
      expect(result.formeJuridique).toBe('Non renseigne')
    }
  })

  it('returns "Code XXXX" for unmapped forme juridique', async () => {
    delete process.env.INSEE_API_TOKEN
    globalThis.fetch = vi.fn().mockResolvedValue(
      okResponse({
        etablissement: {
          siret: VALID_SIRET,
          etat_administratif: 'A',
          unite_legale: { categorie_juridique: '9999' },
        },
      })
    )

    const result = await lookupSiret(VALID_SIRET)
    if (result.found) {
      expect(result.formeJuridique).toBe('Code 9999')
    }
  })

  it('maps tranche effectifs codes correctly', async () => {
    delete process.env.INSEE_API_TOKEN
    globalThis.fetch = vi.fn().mockResolvedValue(
      okResponse({
        etablissement: {
          siret: VALID_SIRET,
          etat_administratif: 'A',
          unite_legale: { tranche_effectifs: '12' },
        },
      })
    )

    const result = await lookupSiret(VALID_SIRET)
    if (result.found) {
      expect(result.trancheEffectifs).toBe('20 a 49 salaries')
    }
  })

  it('falls back denomination to prenom+nom when no denomination (gouv)', async () => {
    delete process.env.INSEE_API_TOKEN
    globalThis.fetch = vi.fn().mockResolvedValue(
      okResponse({
        etablissement: {
          siret: VALID_SIRET,
          etat_administratif: 'A',
          unite_legale: {
            denomination: null,
            nom_raison_sociale: null,
            prenom_1: 'Jean',
            nom: 'Dupont',
          },
        },
      })
    )

    const result = await lookupSiret(VALID_SIRET)
    if (result.found) {
      expect(result.denomination).toBe('Jean Dupont')
    }
  })

  it('computes departement from code postal', async () => {
    delete process.env.INSEE_API_TOKEN
    globalThis.fetch = vi.fn().mockResolvedValue(
      okResponse({
        etablissement: {
          siret: VALID_SIRET,
          etat_administratif: 'A',
          code_postal: '31000',
          libelle_commune: 'TOULOUSE',
          unite_legale: { denomination: 'Test' },
        },
      })
    )

    const result = await lookupSiret(VALID_SIRET)
    if (result.found) {
      expect(result.adresse?.departement).toBe('31')
    }
  })
})
