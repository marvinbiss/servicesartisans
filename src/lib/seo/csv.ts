/**
 * CSV helpers — Sprint AI Ahrefs 2026-05-03.
 *
 * Module leaf (zéro import) pour escape RFC 4180 + ligne CSV.
 *
 * Pourquoi un module séparé : Next.js App Router enforce sur `route.ts` un
 * `OmitWithTag<T, ValidExports>` au build qui rejette tout export non-handler
 * (GET/POST/OPTIONS…). Toute helper utility doit donc vivre hors route.ts.
 *
 * Usage : `import { escapeCsvField, toCsvRow } from '@/lib/seo/csv'`
 */

/**
 * Escape une valeur CSV selon RFC 4180.
 *
 * Quote la valeur si elle contient virgule, quote ou newline. Double les
 * quotes internes. Sinon retourne la valeur telle quelle.
 */
export function escapeCsvField(value: string | undefined): string {
  const v = value ?? ''
  const needsQuote = /[",\r\n]/.test(v)
  if (!needsQuote) return v
  // Double les quotes internes puis quote la valeur entière (RFC 4180 §2.5).
  return `"${v.replace(/"/g, '""')}"`
}

export function toCsvRow(fields: ReadonlyArray<string | undefined>): string {
  return fields.map(escapeCsvField).join(',')
}
