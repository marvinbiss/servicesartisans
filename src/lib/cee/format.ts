/** Escape HTML special chars to prevent XSS in email templates. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Format euros with French locale (ex: "1 250 €"). */
export function formatEuros(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
}

/** Format euros simple without currency symbol (ex: "1 250"). */
export function formatEurosRaw(amount: number): string {
  return Math.round(amount).toLocaleString('fr-FR')
}
