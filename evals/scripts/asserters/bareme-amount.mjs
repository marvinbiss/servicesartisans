/**
 * Custom asserter for MaPrimeRénov' gold cases.
 *
 * Routes by `vars.category`:
 *   - bareme_amount + plafond_revenus : numeric integer extraction + tolerance
 *   - eligibilite + cumul_aides       : oui/non strict match
 *   - delai                           : numeric integer extraction
 *   - default                         : exact-equal fallback
 *
 * Honours `metadata.verified === false` by short-circuiting to pass
 * with `reason` flagged so dashboards distinguish "skipped (unverified)"
 * from "asserted and passed". Memory feedback_legal_data_quality: zero
 * tolerance for fabricated gold answers. Unverified cases never gate CI.
 *
 * @param {string} output       Raw provider output
 * @param {object} context      Promptfoo test context with .vars
 * @returns {{pass:boolean, reason:string}}
 */
export default function assertBareme(output, context) {
  const vars = context?.vars ?? {}
  const metadata = vars.metadata ?? {}

  if (metadata.verified === false) {
    return {
      pass: true,
      reason: `skipped — metadata.verified=false (case ${vars.id ?? 'unknown'} pending source confirmation)`,
    }
  }

  if (metadata.deprecated === true) {
    return {
      pass: true,
      reason: `skipped — metadata.deprecated=true (case ${vars.id ?? 'unknown'} retained for history${metadata.deprecated_at ? `, deprecated_at=${metadata.deprecated_at}` : ''})`,
    }
  }

  const expected = vars.expected_answer
  const category = vars.category
  const tolerance = Number(vars.tolerance_eur ?? 0)
  const outputStr = String(output ?? '').trim()

  if (outputStr === 'INCONNU') {
    return {
      pass: false,
      reason: `provider returned INCONNU for verified case ${vars.id ?? '?'} (expected "${expected}")`,
    }
  }

  switch (category) {
    case 'bareme_amount':
    case 'plafond_revenus':
    case 'delai': {
      const expectedNum = Number(expected)
      if (!Number.isFinite(expectedNum)) {
        return { pass: false, reason: `expected_answer "${expected}" is not numeric` }
      }
      const match = outputStr.match(/-?\d+/)
      if (!match) {
        return { pass: false, reason: `no numeric value in output: "${outputStr}"` }
      }
      const actual = Number(match[0])
      const diff = Math.abs(actual - expectedNum)
      if (diff <= tolerance) {
        return {
          pass: true,
          reason: `${actual} matches ${expectedNum} (tolerance ${tolerance})`,
        }
      }
      return {
        pass: false,
        reason: `${actual} differs from ${expectedNum} by ${diff} (tolerance ${tolerance})`,
      }
    }

    case 'eligibilite':
    case 'cumul_aides': {
      const normalised = outputStr.toLowerCase()
      const expectedNorm = String(expected).toLowerCase()
      if (normalised === expectedNorm) {
        return { pass: true, reason: `boolean match "${expectedNorm}"` }
      }
      return {
        pass: false,
        reason: `expected "${expectedNorm}" got "${normalised}"`,
      }
    }

    default: {
      if (outputStr === String(expected)) {
        return { pass: true, reason: `exact match "${expected}"` }
      }
      return {
        pass: false,
        reason: `expected "${expected}" got "${outputStr}"`,
      }
    }
  }
}
