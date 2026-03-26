/**
 * Clean phone number: remove spaces, dots, dashes, parentheses
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/[\s.\-()]/g, '')
}

/**
 * Validate French phone number (accepts 0x, +33x, 0033x formats)
 */
export function isValidFrenchPhone(phone: string): boolean {
  const cleaned = cleanPhone(phone)
  return /^0[1-9]\d{8}$/.test(cleaned) || /^\+33[1-9]\d{8}$/.test(cleaned) || /^0033[1-9]\d{8}$/.test(cleaned)
}
