/**
 * Persistance des préférences contact utilisateur entre deux demandes de devis.
 *
 * Pourquoi pas dans le draft `sa:devis-draft` :
 * - Le draft est wiped après chaque submit réussi (sinon on rejoue un ancien
 *   service + ville). Les coordonnées contact (nom/email/téléphone) doivent
 *   au contraire survivre pour pré-remplir le PROCHAIN devis.
 * - Séparer prefs et draft donne deux durées de vie différentes.
 *
 * RGPD : les coordonnées sont déjà transmises au CRM Pipedrive lors du
 * submit (consentement explicite via checkbox). Le stockage local n'introduit
 * pas de donnée supplémentaire — il ne fait que mémoriser ce que l'utilisateur
 * a déjà accepté de partager. L'utilisateur peut effacer via "Recommencer" du
 * FormRecoveryBanner ou en vidant le cache navigateur.
 *
 * Schéma versionné via la clé pour permettre les évolutions sans planter
 * (bump la version, l'ancien JSON devient invisible).
 */
const PREFS_KEY = 'sa:user-prefs:v1'

export type UserContactPrefs = {
  nom: string
  email: string
  telephone: string
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function isValidPrefs(value: unknown): value is UserContactPrefs {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return typeof v.nom === 'string' && typeof v.email === 'string' && typeof v.telephone === 'string'
}

export function loadUserContactPrefs(): UserContactPrefs | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!isValidPrefs(parsed)) return null
    // Sanity check : ne renvoie pas un blob vide
    if (!parsed.nom && !parsed.email && !parsed.telephone) return null
    return parsed
  } catch {
    return null
  }
}

export function saveUserContactPrefs(prefs: Partial<UserContactPrefs>): void {
  if (!isBrowser()) return
  try {
    const existing = loadUserContactPrefs() || { nom: '', email: '', telephone: '' }
    const next: UserContactPrefs = {
      nom: (prefs.nom ?? existing.nom).trim(),
      email: (prefs.email ?? existing.email).trim(),
      telephone: (prefs.telephone ?? existing.telephone).trim(),
    }
    // Don't persist an empty payload
    if (!next.nom && !next.email && !next.telephone) return
    localStorage.setItem(PREFS_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

export function clearUserContactPrefs(): void {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(PREFS_KEY)
  } catch {
    // ignore
  }
}
