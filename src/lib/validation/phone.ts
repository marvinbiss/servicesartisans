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
export function isValidFrenchPhone(phone: string): boolean {
  const cleaned = cleanPhone(phone)
  return /^0[1-9]\d{8}$/.test(cleaned) || /^\+33[1-9]\d{8}$/.test(cleaned) || /^0033[1-9]\d{8}$/.test(cleaned)
}
