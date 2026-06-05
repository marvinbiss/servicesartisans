/**
 * MprBaremeChip — chip catégorie barème MaPrimeRénov' (Bleu/Jaune/Violet/Rose).
 *
 * Les 4 catégories de revenus ANAH sont un signal d'autorité : les afficher
 * avec leur couleur de référence (repère visuel France Rénov') au lieu de
 * texte nu. Familles Tailwind alignées sur src/lib/simulateur/anah-thresholds.ts
 * (bleu/amber/purple/pink). Server component, zéro JS client.
 *
 * Le bleu est une exception sémantique au ban blue-* de DESIGN.md — couleur
 * officielle du barème, skip ctx « Bleu/barème/MaPrimeRénov » dans
 * scripts/audit-design-tokens.mjs.
 */

export type MprCategorie = 'bleu' | 'jaune' | 'violet' | 'rose'

export function isMprCategorie(value: unknown): value is MprCategorie {
  return value === 'bleu' || value === 'jaune' || value === 'violet' || value === 'rose'
}

export const MPR_CATEGORIE_LABEL: Record<MprCategorie, string> = {
  bleu: 'Bleu',
  jaune: 'Jaune',
  violet: 'Violet',
  rose: 'Rose',
}

const STYLES: Record<MprCategorie, { chip: string; dot: string }> = {
  // Barème MaPrimeRénov' — bleu = très modestes (couleur officielle ANAH)
  bleu: { chip: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  jaune: { chip: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-400' },
  violet: { chip: 'bg-purple-50 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
  rose: { chip: 'bg-pink-50 text-pink-800 border-pink-200', dot: 'bg-pink-500' },
}

export default function MprBaremeChip({
  categorie,
  suffix,
}: {
  categorie: MprCategorie
  /** Texte optionnel après le label (ex. « très modestes »). */
  suffix?: string
}) {
  const s = STYLES[categorie]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold whitespace-nowrap ${s.chip}`}
    >
      <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
      {MPR_CATEGORIE_LABEL[categorie]}
      {suffix ? <span className="font-normal">{suffix}</span> : null}
    </span>
  )
}
