/**
 * Détecte si un artisan possède au moins une qualification RGE encore active.
 *
 * Source : registre RGE ADEME (data.gouv.fr — Licence Etalab 2.0).
 * Utilisé pour gater l'exception "tel public sur fiche non revendiquée"
 * documentée dans CLAUDE.md (2026-05-07) + memory
 * `servicesartisans-rge-phone-exception-2026-05-07.md`.
 *
 * Une qualif est "active" si `Date.parse(date_fin) > now`. On rejette les
 * date_fin manquantes / invalides (pas de signal => pas d'autorisation).
 */
export interface RgeQualification {
  code: string
  nom: string
  organisme: string
  domaine: string | null
  meta_domaine: string | null
  date_debut: string
  date_fin: string
  url: string | null
}

export function hasActiveRgeQualification(
  qualifications: RgeQualification[] | null | undefined,
  now: number = Date.now()
): boolean {
  if (!Array.isArray(qualifications) || qualifications.length === 0) return false
  return qualifications.some((q) => {
    if (!q?.date_fin) return false
    const end = Date.parse(q.date_fin)
    return Number.isFinite(end) && end > now
  })
}
