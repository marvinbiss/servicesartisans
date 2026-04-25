import 'server-only'
import { timingSafeEqual } from 'node:crypto'

/**
 * Compare deux secrets en temps constant.
 *
 * Encode les deux strings en UTF-8 AVANT de comparer la longueur, pour éviter
 * un side-channel sur les chaînes non-ASCII (où `string.length` en UTF-16
 * code units diffère du byte length UTF-8). Les secrets sont supposés ASCII
 * en pratique, mais cette défense en profondeur évite une RangeError silencieuse
 * + leak de timing si jamais un secret contenait du multi-byte.
 *
 * Retourne `false` (fail-closed) si :
 *   - l'un des deux est null/undefined/vide
 *   - les byte lengths diffèrent
 *   - les bytes diffèrent
 */
export function timingSafeStringEqual(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (!a || !b) return false
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  try {
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}
