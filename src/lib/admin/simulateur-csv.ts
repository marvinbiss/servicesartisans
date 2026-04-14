/**
 * Utilitaires CSV pour l'export admin simulateur.
 * Extrait de route.ts car Next.js 14 n'accepte que les HTTP methods +
 * `dynamic`/`revalidate`/`runtime` comme named exports dans app/api/.../route.ts.
 */

export const CSV_COLUMNS: Array<{ key: string; label: string }> = [
  { key: 'public_id', label: 'public_id' },
  { key: 'created_at', label: 'created_at' },
  { key: 'categorie_anah', label: 'categorie' },
  { key: 'parcours', label: 'parcours' },
  { key: 'zone_climatique', label: 'zone' },
  { key: 'rfr_tranche', label: 'rfr_tranche' },
  { key: 'surface_m2', label: 'surface_m2' },
  { key: 'mpr_total', label: 'mpr_total' },
  { key: 'cee_fourchette_bas', label: 'cee_bas' },
  { key: 'cee_fourchette_haut', label: 'cee_haut' },
  { key: 'coup_pouce_estimation', label: 'cdp_haut' },
  { key: 'reste_a_charge_bas', label: 'reste_a_charge_bas' },
  { key: 'reste_a_charge_haut', label: 'reste_a_charge_haut' },
  { key: 'pipedrive_deal_id', label: 'pipedrive_deal_id' },
  { key: 'barometre_version', label: 'baremes_version' },
]

/**
 * Escape une cellule CSV selon RFC 4180.
 * Quote si la cellule contient une virgule, guillemet, saut de ligne ou point-virgule.
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str === '') return ''
  const needsQuote = /[",\n\r;]/.test(str)
  if (!needsQuote) return str
  return `"${str.replace(/"/g, '""')}"`
}

/** Transforme RFR en tranche 10k (RGPD §4 — anonymisation douce pour export). */
export function rfrToTranche(rfr: number | null | undefined): string {
  if (typeof rfr !== 'number' || !Number.isFinite(rfr)) return ''
  const tranche = Math.floor(rfr / 10_000) * 10_000
  return `${tranche}-${tranche + 9999}`
}

export function buildCsv(
  rows: Array<Record<string, unknown>>,
  columns: Array<{ key: string; label: string }> = CSV_COLUMNS
): string {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const raw = row[c.key]
          return escapeCsvCell(raw)
        })
        .join(',')
    )
    .join('\n')
  return `${header}\n${body}`
}
