/**
 * CSV escape conforme RFC 4180 + mitigation injection formules Excel/LibreOffice.
 *
 * Extrait hors de `src/app/api/open-data/[dataset]/route.ts` : Next.js 14
 * interdit tout export ≠ `GET/POST/...` dans un fichier route.ts (build error
 * TS : "is not a valid Route export field").
 *
 * Règles :
 * - `null`/`undefined` → string vide
 * - `\r`/`\n` détectés → quoté (RFC 4180)
 * - `,` et `"` détectés → quoté
 * - valeur commençant par `=`, `+`, `-`, `@`, `\t`, `\r` → préfixée d'un
 *   apostrophe `'` (Excel/LibreOffice traitent ces préfixes comme formules
 *   actives à l'ouverture du fichier — vecteur d'exécution code local)
 */
export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  let s = String(value)
  // Préfixe formule — neutraliser AVANT le quote pour que l'apostrophe
  // soit dans la string entre quotes (sinon Excel l'ignore).
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`
  }
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}
