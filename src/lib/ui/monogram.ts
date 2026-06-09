/**
 * Avatars monogramme — initiales sur fond de marque, couleur déterministe.
 *
 * On n'utilise PLUS de photos stock (Unsplash) ni de faux visages pour la
 * social proof : ça sonnait « template » et n'est lié à aucune personne réelle.
 * Un monogramme est honnête, cohérent avec le design system et lisible. Les
 * vrais `avatar_url`, s'ils existent un jour, peuvent le remplacer au cas par cas.
 *
 * Module pur (server + client safe) — partagé homepage / cartes / CTAs.
 */

export const MONO_BG = [
  'bg-primary-100 text-primary-600',
  'bg-accent-100 text-accent-700',
  'bg-sand-200 text-charcoal-700',
] as const

/** "DUPONT JEAN (Plombier)" -> "DJ" ; tolère noms vides / non-latins. */
export function initials(name: string): string {
  const parts = (name || '')
    .replace(/\s*\(.*$/, '')
    .replace(/[^A-Za-zÀ-ÿ ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

/** Couleur de fond déterministe d'après un seed (nom, id…). */
export function monoClass(seed: string): string {
  let h = 0
  for (const c of seed) h = (h + c.charCodeAt(0)) % MONO_BG.length
  return MONO_BG[h]
}
