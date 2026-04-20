/**
 * ADEME text cleaning — pure, client-safe utilities.
 *
 * Restaure les accents droppés par le dataset ADEME RGE
 * ("arothermique" → "aérothermique", "pompe  chaleur" → "pompe à chaleur",
 * "photovoltaque" → "photovoltaïque", etc).
 *
 * Zéro I/O, aucune dépendance serveur : importable dans un `'use client'`.
 * Réutilisé côté rendu (RgeBadge, ArtisanSchema, PartnerSiretLookup) et
 * côté pipeline LLM (retrieval.ts re-exporte pour la génération descriptions).
 */

// JS regex \b is ASCII-only even with /u. We build a Unicode-aware "word
// boundary" via negative lookaround on \p{L} so that "é" counts as a letter
// and already-correct words ("énergies") aren't re-accented into "éénergies".
const W_BEFORE = '(?<!\\p{L})'
const W_AFTER = '(?!\\p{L})'
const uw = (body: string, flags = 'gu'): RegExp => new RegExp(W_BEFORE + body + W_AFTER, flags)

const ACCENT_FIXES: Array<[RegExp, string]> = [
  [uw('arothermique'), 'aérothermique'],
  [uw('Arothermique'), 'Aérothermique'],
  [uw('gothermique'), 'géothermique'],
  [uw('Gothermique'), 'Géothermique'],
  [uw('photovoltaque'), 'photovoltaïque'],
  [uw('Photovoltaque'), 'Photovoltaïque'],
  [uw('gnrateur'), 'générateur'],
  [uw('Gnrateur'), 'Générateur'],
  [uw('chaudire'), 'chaudière'],
  [uw('chaudires'), 'chaudières'],
  [uw('Chaudire'), 'Chaudière'],
  [uw('fentre'), 'fenêtre'],
  [uw('fentres'), 'fenêtres'],
  [uw('Fentre'), 'Fenêtre'],
  [uw('pole'), 'poêle'],
  [uw('poles'), 'poêles'],
  [uw('indpendant'), 'indépendant'],
  [uw('indpendants'), 'indépendants'],
  [uw('rseau'), 'réseau'],
  [uw('Rseau'), 'Réseau'],
  [uw('nergie'), 'énergie'],
  [uw('nergies'), 'énergies'],
  [uw('nergetique'), 'énergétique'],
  [uw('nergetiques'), 'énergétiques'],
  [uw('Energie'), 'Énergie'],
  [uw('Energetique'), 'Énergétique'],
  [uw('quipement'), 'équipement'],
  [uw('quipements'), 'équipements'],
  [uw('Quipement'), 'Équipement'],
  [uw('intrieur'), 'intérieur'],
  [uw('extrieur'), 'extérieur'],
  [uw('amnagement'), 'aménagement'],
  // Pattern: "pompe  chaleur" (double space where "à" was dropped)
  [new RegExp('(?<!\\p{L})(pompe)\\s{2}(chaleur)(?!\\p{L})', 'giu'), '$1 à $2'],
  // Collapse residual multi-spaces AFTER the above restorations.
  [/\s{2,}/g, ' '],
]

export const cleanAdemeText = (raw: string): string => {
  let out = raw
  for (const [re, rep] of ACCENT_FIXES) out = out.replace(re, rep)
  return out.trim()
}
