import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const LEGAL_VARS = [
  'COMPANY_SIRET',
  'COMPANY_LEGAL_NAME',
  'COMPANY_ADDRESS',
  'COMPANY_DIRECTEUR_PUBLICATION',
] as const

const VALID_LEGAL_ENV = {
  COMPANY_SIRET: '12345678901234',
  COMPANY_LEGAL_NAME: 'ServicesArtisans SAS',
  COMPANY_ADDRESS: '1 rue de la République, 75001 Paris',
  COMPANY_DIRECTEUR_PUBLICATION: 'Marvin Bissohong',
} as const

const stubEnv = (env: Record<string, string | undefined>) => {
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) {
      vi.stubEnv(k, '')
    } else {
      vi.stubEnv(k, v)
    }
  }
}

const importFresh = async () => {
  vi.resetModules()
  return await import('./company-identity')
}

describe('company-identity — status resolution', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    stubEnv({ COMPANY_STATUS: undefined, NEXT_PHASE: undefined, NODE_ENV: undefined })
    for (const v of LEGAL_VARS) stubEnv({ [v]: undefined })
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it("default status is 'pre-launch' when COMPANY_STATUS is unset", async () => {
    const mod = await importFresh()
    expect(mod.companyIdentity.status).toBe('pre-launch')
    expect(mod.isPlatformLaunched()).toBe(false)
  })

  it("status is 'launched' only when explicitly set to 'launched'", async () => {
    stubEnv({ COMPANY_STATUS: 'launched', ...VALID_LEGAL_ENV })
    const mod = await importFresh()
    expect(mod.companyIdentity.status).toBe('launched')
    expect(mod.isPlatformLaunched()).toBe(true)
  })

  it("typo on COMPANY_STATUS falls back to 'pre-launch' with a warn", async () => {
    stubEnv({ COMPANY_STATUS: 'lauched' })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const mod = await importFresh()
    expect(mod.companyIdentity.status).toBe('pre-launch')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('COMPANY_STATUS="lauched" invalide'))
  })
})

describe('company-identity — LCEN check', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    stubEnv({ COMPANY_STATUS: undefined, NEXT_PHASE: undefined, NODE_ENV: undefined })
    for (const v of LEGAL_VARS) stubEnv({ [v]: undefined })
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('does NOT throw at runtime when launched but vars missing (regression GSC 2026-04-26)', async () => {
    stubEnv({ COMPANY_STATUS: 'launched', NODE_ENV: 'production', NEXT_PHASE: undefined })
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await expect(importFresh()).resolves.toBeDefined()
    expect(error).toHaveBeenCalledWith(expect.stringContaining('LCEN art.6 violation'))
  })

  it('THROWS at build-time when launched but vars missing (deploy blocker)', async () => {
    stubEnv({
      COMPANY_STATUS: 'launched',
      NODE_ENV: 'production',
      NEXT_PHASE: 'phase-production-build',
    })
    await expect(importFresh()).rejects.toThrow(/LCEN art.6 violation/)
  })

  it('does NOT throw at build-time when pre-launch (no vars required)', async () => {
    stubEnv({
      COMPANY_STATUS: 'pre-launch',
      NODE_ENV: 'production',
      NEXT_PHASE: 'phase-production-build',
    })
    await expect(importFresh()).resolves.toBeDefined()
  })

  it('does NOT throw in dev / test when launched but vars missing', async () => {
    stubEnv({ COMPANY_STATUS: 'launched', NODE_ENV: 'development', NEXT_PHASE: undefined })
    await expect(importFresh()).resolves.toBeDefined()
  })

  it('passes build-time check when all vars are valid', async () => {
    stubEnv({
      COMPANY_STATUS: 'launched',
      NODE_ENV: 'production',
      NEXT_PHASE: 'phase-production-build',
      ...VALID_LEGAL_ENV,
    })
    await expect(importFresh()).resolves.toBeDefined()
  })

  it('rejects malformed SIRET at build-time', async () => {
    stubEnv({
      COMPANY_STATUS: 'launched',
      NODE_ENV: 'production',
      NEXT_PHASE: 'phase-production-build',
      ...VALID_LEGAL_ENV,
      COMPANY_SIRET: 'abc',
    })
    await expect(importFresh()).rejects.toThrow(/COMPANY_SIRET invalide/)
  })

  it('tolerates whitespace in SIRET (Kbis copy-paste)', async () => {
    stubEnv({
      COMPANY_STATUS: 'launched',
      NODE_ENV: 'production',
      NEXT_PHASE: 'phase-production-build',
      ...VALID_LEGAL_ENV,
      COMPANY_SIRET: '123 456 789 01234',
    })
    await expect(importFresh()).resolves.toBeDefined()
  })
})

describe('company-identity — isCompanyRegistered', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    stubEnv({ COMPANY_STATUS: undefined, NEXT_PHASE: undefined, NODE_ENV: undefined })
    for (const v of LEGAL_VARS) stubEnv({ [v]: undefined })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('returns true with the baked provisional editor (GROUPE MARGUERITE) when env is empty', async () => {
    // Depuis 2026-06-29 l'éditeur provisoire GROUPE MARGUERITE SAS est baké en
    // fallback dans company-identity → l'entité est immatriculée même sans env.
    const mod = await importFresh()
    expect(mod.isCompanyRegistered()).toBe(true)
    expect(mod.companyIdentity.legalName).toBe('GROUPE MARGUERITE')
    expect(mod.companyIdentity.siret.replace(/\s+/g, '')).toBe('10464462000015')
  })

  it('returns true when all 3 are set and valid', async () => {
    stubEnv(VALID_LEGAL_ENV)
    const mod = await importFresh()
    expect(mod.isCompanyRegistered()).toBe(true)
  })

  it('returns false when SIRET is malformed even if non-null', async () => {
    stubEnv({ ...VALID_LEGAL_ENV, COMPANY_SIRET: 'abc' })
    const mod = await importFresh()
    expect(mod.isCompanyRegistered()).toBe(false)
  })
})
