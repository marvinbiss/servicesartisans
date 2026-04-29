import { describe, it, expect } from 'vitest'
import { getGovernmentServiceSchema, getFinancialProductSchema } from '../jsonld'
import { SITE_URL } from '../config'

// ---------------------------------------------------------------------------
// getGovernmentServiceSchema
// ---------------------------------------------------------------------------

describe('getGovernmentServiceSchema', () => {
  const baseParams = {
    name: "Certificats d'Économies d'Énergie (CEE)",
    description: 'Aide publique pour la rénovation énergétique',
    url: `${SITE_URL}/aides/cee`,
  }

  it('includes @context https://schema.org', () => {
    const schema = getGovernmentServiceSchema(baseParams)
    expect(schema['@context']).toBe('https://schema.org')
  })

  it('has @type GovernmentService', () => {
    const schema = getGovernmentServiceSchema(baseParams)
    expect(schema['@type']).toBe('GovernmentService')
  })

  it('propagates name, description, url', () => {
    const schema = getGovernmentServiceSchema(baseParams)
    expect(schema.name).toBe(baseParams.name)
    expect(schema.description).toBe(baseParams.description)
    expect(schema.url).toBe(baseParams.url)
  })

  it('defaults serviceType to "Financial Assistance"', () => {
    const schema = getGovernmentServiceSchema(baseParams)
    expect(schema.serviceType).toBe('Financial Assistance')
  })

  it('uses the provided serviceType when given', () => {
    const schema = getGovernmentServiceSchema({ ...baseParams, serviceType: 'Energy Grant' })
    expect(schema.serviceType).toBe('Energy Grant')
  })

  it('serviceOperator is an object with name and url', () => {
    const schema = getGovernmentServiceSchema(baseParams)
    const op = schema.serviceOperator as Record<string, unknown>
    expect(typeof op).toBe('object')
    expect(op).toHaveProperty('name')
    expect(op).toHaveProperty('url')
  })

  it('uses custom serviceOperator when provided', () => {
    const schema = getGovernmentServiceSchema({
      ...baseParams,
      serviceOperator: { name: 'ANAH', url: 'https://www.anah.fr' },
    })
    const op = schema.serviceOperator as Record<string, unknown>
    expect(op.name).toBe('ANAH')
    expect(op.url).toBe('https://www.anah.fr')
  })

  it('includes sameAs as an array when provided', () => {
    const sameAs = ['https://www.ecologie.gouv.fr/', 'https://france-renov.gouv.fr/']
    const schema = getGovernmentServiceSchema({ ...baseParams, sameAs })
    expect(Array.isArray(schema.sameAs)).toBe(true)
    expect(schema.sameAs).toEqual(sameAs)
  })

  it('omits sameAs when not provided', () => {
    const schema = getGovernmentServiceSchema(baseParams)
    expect(schema).not.toHaveProperty('sameAs')
  })

  it('includes audience when provided', () => {
    const schema = getGovernmentServiceSchema({
      ...baseParams,
      audience: 'Propriétaires résidentiels',
    })
    const aud = schema.audience as Record<string, unknown>
    expect(aud['@type']).toBe('Audience')
    expect(aud.audienceType).toBe('Propriétaires résidentiels')
  })

  it('includes temporalCoverage when provided', () => {
    const schema = getGovernmentServiceSchema({
      ...baseParams,
      temporalCoverage: '2026-01-01/2030-12-31',
    })
    expect(schema.temporalCoverage).toBe('2026-01-01/2030-12-31')
  })

  it('areaServed is France', () => {
    const schema = getGovernmentServiceSchema(baseParams)
    const area = schema.areaServed as Record<string, unknown>
    expect(area['@type']).toBe('Country')
    expect(area.name).toBe('France')
  })
})

// ---------------------------------------------------------------------------
// getFinancialProductSchema
// ---------------------------------------------------------------------------

describe('getFinancialProductSchema', () => {
  const baseParams = {
    name: "MaPrimeRénov'",
    description: "Aide de l'État pour financer la rénovation énergétique",
    url: `${SITE_URL}/aides/maprimerenov`,
  }

  it('includes @context https://schema.org', () => {
    const schema = getFinancialProductSchema(baseParams)
    expect(schema['@context']).toBe('https://schema.org')
  })

  it('has @type FinancialProduct', () => {
    const schema = getFinancialProductSchema(baseParams)
    expect(schema['@type']).toBe('FinancialProduct')
  })

  it('propagates name, description, url', () => {
    const schema = getFinancialProductSchema(baseParams)
    expect(schema.name).toBe(baseParams.name)
    expect(schema.description).toBe(baseParams.description)
    expect(schema.url).toBe(baseParams.url)
  })

  it('defaults category to "Government Grant"', () => {
    const schema = getFinancialProductSchema(baseParams)
    expect(schema.category).toBe('Government Grant')
  })

  it('uses the provided category when given', () => {
    const schema = getFinancialProductSchema({ ...baseParams, category: 'Tax Credit' })
    expect(schema.category).toBe('Tax Credit')
  })

  it('provider is an object with name', () => {
    const schema = getFinancialProductSchema(baseParams)
    const provider = schema.provider as Record<string, unknown>
    expect(typeof provider).toBe('object')
    expect(provider).toHaveProperty('name')
  })

  it('areaServed is France', () => {
    const schema = getFinancialProductSchema(baseParams)
    const area = schema.areaServed as Record<string, unknown>
    expect(area['@type']).toBe('Country')
    expect(area.name).toBe('France')
  })

  it('includes amount when provided', () => {
    const schema = getFinancialProductSchema({ ...baseParams, amount: '70000' })
    expect(schema.amount).toBe('70000')
  })

  it('omits amount when not provided', () => {
    const schema = getFinancialProductSchema(baseParams)
    expect(schema).not.toHaveProperty('amount')
  })

  it('includes annualPercentageRate when provided', () => {
    const schema = getFinancialProductSchema({ ...baseParams, annualPercentageRate: 0 })
    expect(schema.annualPercentageRate).toBe(0)
  })

  it('includes interestRate when provided', () => {
    const schema = getFinancialProductSchema({ ...baseParams, interestRate: 0 })
    expect(schema.interestRate).toBe(0)
  })

  it('omits interestRate when not provided', () => {
    const schema = getFinancialProductSchema(baseParams)
    expect(schema).not.toHaveProperty('interestRate')
  })
})
