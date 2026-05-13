/**
 * Clean phone number: keep only digits and leading +
 * Strips ALL non-digit characters (spaces, dots, dashes, parentheses,
 * non-breaking spaces U+00A0, narrow no-break spaces U+202F, etc.)
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
}

/**
 * Validate French phone number (accepts 0x, +33x, 0033x formats)
 */
/**
 * Format a phone number for use in a tel: link.
 * Strips spaces, dots, dashes, parentheses, then prefixes +33 if starts with 0.
 */
export function formatPhoneForTel(phone: string): string {
  const stripped = phone.replace(/[\s.\-()]/g, '')
  if (stripped.startsWith('0')) {
    return '+33' + stripped.slice(1)
  }
  return stripped
}

/**
 * Validate French phone number (accepts 0x, +33x, 0033x formats)
 */
export function isValidFrenchPhone(phone: string): boolean {
  const cleaned = cleanPhone(phone)
  return (
    /^0[1-9]\d{8}$/.test(cleaned) ||
    /^\+33[1-9]\d{8}$/.test(cleaned) ||
    /^0033[1-9]\d{8}$/.test(cleaned)
  )
}

/**
 * Format a French phone number for display as the user types.
 *
 * - `0612345678`     → `06 12 34 56 78`
 * - `+33612345678`   → `+33 6 12 34 56 78`
 * - `0033612345678`  → `0033 6 12 34 56 78`
 * - partial input    → progressively grouped
 *
 * Caps the digit count so paste-into-input never gets a runaway string. The
 * function is idempotent — pass its own output back in and it returns the
 * same string.
 */
export function formatFrenchPhoneAsTyped(raw: string): string {
  if (!raw) return ''
  const cleaned = cleanPhone(raw)

  // Country prefixes — keep the canonical groups (cc / leading 0 / pairs).
  if (cleaned.startsWith('+33')) {
    const rest = cleaned.slice(3, 12) // up to 9 digits
    if (!rest) return '+33'
    const head = rest[0]
    const pairs = rest.slice(1).match(/.{1,2}/g) ?? []
    return ['+33', head, ...pairs].filter(Boolean).join(' ')
  }
  if (cleaned.startsWith('0033')) {
    const rest = cleaned.slice(4, 13)
    if (!rest) return '0033'
    const head = rest[0]
    const pairs = rest.slice(1).match(/.{1,2}/g) ?? []
    return ['0033', head, ...pairs].filter(Boolean).join(' ')
  }

  // Standard 0X XX XX XX XX layout, capped at 10 digits.
  const digits = cleaned.replace(/^\+/, '').slice(0, 10)
  const pairs = digits.match(/.{1,2}/g) ?? []
  return pairs.join(' ')
}
