/**
 * Retire des descriptions IA stockées toute phrase citant une date de validité
 * RGE figée (« …valables jusqu'au 30 mai 2026 »).
 *
 * WHY : le prompt historique (`rge-description-v1.ts`) demandait de citer
 * `rge_valid_until` textuellement. Quand l'ADEME renouvelle une qualification,
 * le sync hebdo met à jour les champs structurés (badge, liste qualifs,
 * `rge_valid_until`) MAIS le texte figé garde l'ancienne année → date périmée
 * visible. La date juste reste affichée, live, dans le badge / la section RGE :
 * on supprime donc la phrase datée de la prose plutôt que de la laisser dériver.
 *
 * À n'appliquer QU'aux descriptions stockées (`providers.description` / `bio`),
 * jamais au fallback `generateRgeMinimalDescription` (lui est généré au rendu
 * avec la valeur live, donc toujours correct).
 */

// Une phrase = suite de caractères jusqu'à un . ! ? final. On cible celles qui
// contiennent un marqueur de validité + « jusqu'au » + une année (19xx/20xx)
// OU une date jj/mm/aaaa. Couvre « valable(s) », « valide(s) », « validité
// confirmée », « certifications … valables ».
// Signal unique observé sur 6000 descriptions réelles : une phrase de validité
// RGE = « …jusqu'au|jusqu'en …<date> ». Toutes les formulations passent par là
// (« valables jusqu'au », « certifié RGE jusqu'au », « reconnu Garant … jusqu'au »,
// « titulaire … jusqu'au », « validée jusqu'au »…). On cible donc « jusqu'au|en »
// + une date (jj/mm/aaaa ou <année>) dans la même phrase, et on retire la phrase.
// « jusqu'à 3 offres » (pas « au/en », pas de date) n'est jamais touché.
// Date = jj/mm/aaaa, année 19xx/20xx, OU année écrite en toutes lettres
// (« deux mille vingt-neuf ») — l'IA orthographie parfois la date en mots.
const VALIDITY_DATE_SENTENCE =
  /[^.!?]*(?:jusqu['’](?:au|en)\b|valab|valid|échéance|echeance)[^.!?]*?(?:\b(?:19|20)\d{2}\b|\d{1,2}\/\d{1,2}\/\d{2,4}|\bmille\b)[^.!?]*[.!?]/gi

export function stripValidityDate(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(VALIDITY_DATE_SENTENCE, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .trim()
}

/**
 * Formate une date ISO en français long (« 30 mai 2030 »), sans dépendre de la
 * locale runtime (mois hardcodés — cf. LastUpdated, robuste sur Edge/ICU minimal).
 */
const MOIS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]
function formatDateFr(validUntil: string): string | null {
  const d = new Date(validUntil)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getUTCDate()} ${MOIS_FR[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/**
 * Ré-injecte la date de validité RGE **live** (depuis `rge_valid_until`, resync
 * hebdo ADEME) dans une description nettoyée. À utiliser après `stripValidityDate`
 * pour que la prose porte toujours la VRAIE date, jamais une date figée.
 *
 * Idempotent : si la date formatée est déjà présente dans le texte (ex. fallback
 * `generateRgeMinimalDescription`), on n'ajoute rien.
 */
export function appendLiveValidity(text: string, validUntil: string | null | undefined): string {
  if (!validUntil) return text
  const fr = formatDateFr(validUntil)
  if (!fr) return text
  if (text.includes(fr)) return text
  const sentence = `Validité RGE confirmée jusqu'au ${fr} (source : annuaire ADEME).`
  return text ? `${text} ${sentence}` : sentence
}
