/**
 * Data Quality Scoring & Validation
 * Calculates a quality score (0-100) for each provider record
 * and generates flags for missing/invalid data
 */

import { supabase } from './supabase-admin'

export interface QualityReport {
  score: number
  flags: string[]
}

/**
 * Calculate data quality score for a provider record
 */
export function calculateQualityScore(provider: Record<string, unknown>): QualityReport {
  let score = 0
  const flags: string[] = []

  // Identity (30 points)
  if (provider.name) score += 10; else flags.push('missing_name')
  if (provider.siren) score += 10; else flags.push('missing_siren')
  if (provider.siret) score += 10; else flags.push('missing_siret')

  // Address (25 points)
  if (provider.address_street) score += 5; else flags.push('missing_street')
  if (provider.address_city) score += 5; else flags.push('missing_city')
  if (provider.address_postal_code) score += 5; else flags.push('missing_postal_code')
  if (provider.address_department) score += 5; else flags.push('missing_department')
  if (provider.latitude && provider.longitude) score += 5; else flags.push('missing_gps')

  // Contact (15 points)
  if (provider.phone) score += 10; else flags.push('missing_phone')
  if (provider.email) score += 5; else flags.push('missing_email')

  // Business info (20 points)
  if (provider.code_naf) score += 5; else flags.push('missing_naf')
  if (provider.creation_date) score += 5; else flags.push('missing_creation_date')
  if (provider.legal_form) score += 5; else flags.push('missing_legal_form')
  if (provider.specialty) score += 5; else flags.push('missing_specialty')

  // Extras (10 points)
  if (provider.website) score += 3
  if (provider.description) score += 4
  if (provider.employee_count) score += 3

  return {
    score: Math.min(100, score),
    flags,
  }
}

/**
 * Validate a SIRET number (Luhn algorithm)
 */
export function isValidSiret(siret: string): boolean {
  const clean = siret.replace(/\s/g, '')
  if (clean.length !== 14 || !/^\d{14}$/.test(clean)) return false

  let sum = 0
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(clean[i], 10)
    if (i % 2 === 0) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

/**
 * Validate a SIREN number
 */
export function isValidSiren(siren: string): boolean {
  const clean = siren.replace(/\s/g, '')
  if (clean.length !== 9 || !/^\d{9}$/.test(clean)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(clean[i], 10)
    if (i % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

/**
 * Validate a French postal code
 */
export function isValidPostalCode(code: string): boolean {
  return /^(?:0[1-9]|[1-8]\d|9[0-5]|97[1-6]|98[4-9])\d{3}$/.test(code)
}

/**
 * Validate a French phone number
 */
export function isValidPhone(phone: string): boolean {
  const clean = phone.replace(/[\s.-]/g, '')
  return /^(\+33|0)[1-9]\d{8}$/.test(clean)
}

/**
 * Batch update quality scores for providers
 */
export async function updateQualityScores(
  options: { limit?: number; offset?: number } = {}
): Promise<{ updated: number; errors: number }> {
  const limit = options.limit || 500
  const offset = options.offset || 0
  let updated = 0
  let errors = 0

  const { data: providers, error } = await supabase
    .from('providers')
    .select('*')
    .eq('is_artisan', true)
    .range(offset, offset + limit - 1)

  if (error || !providers) {
    console.error('Error fetching providers:', error?.message)
    return { updated: 0, errors: 1 }
  }

  for (const provider of providers) {
    const { score, flags } = calculateQualityScore(provider)

    const { error: updateError } = await supabase
      .from('providers')
      .update({
        data_quality_score: score,
        data_quality_flags: flags,
      })
      .eq('id', provider.id)

    if (updateError) {
      errors++
    } else {
      updated++
    }
  }

  return { updated, errors }
}
