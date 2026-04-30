/**
 * Helpers locaux Sprint 0.2 ULTRA DOMINATION SEO Phase 0 — extraits du
 * server-component `/villes/[ville]/page.tsx` pour pouvoir être testés
 * unitairement sans charger toute la page.
 *
 * Aucune dépendance Next.js / Supabase — pure logique déterministe.
 */

/**
 * Bullets TL;DR pour le hub `/villes/[v]`.
 *
 * Distinct de `enBrefPoints` (capture chiffrée) et de `ImmediateAnswerBlock`
 * (réponse immédiate front-end) : optimisé AI Overviews + Speakable —
 * chaque bullet répond à une intention de recherche fréquente :
 *   1. Combien d'artisans dans la ville
 *   2. Comment vérifier la fiabilité (SIREN, devis, décennale)
 *   3. Délai de réponse (intention transactionnelle "rapide")
 *   4. Promesse leads exclusifs (différenciateur)
 *
 * Si `rgeCount > 0`, on ajoute une 5e bullet axée MaPrimeRénov' (intention
 * YMYL aide financière, gros volume requêtes "aide rénovation [ville]").
 *
 * Retourne `[]` si le contenu est trop pauvre — TldrBlock se rend null.
 */
export function buildVilleTldrBullets({
  villeName,
  departementCode,
  servicesCount,
  villeProviderCount,
  rgeCount,
  climateLabel,
  citySizeLabel,
}: {
  villeName: string
  departementCode: string
  servicesCount: number
  villeProviderCount: number
  rgeCount: number
  climateLabel: string | null
  citySizeLabel: string | null
}): string[] {
  if (villeProviderCount <= 0) return []

  const bullets: string[] = []
  const profileSuffix = [climateLabel, citySizeLabel].filter(Boolean).join(', ')

  bullets.push(
    `${villeProviderCount.toLocaleString('fr-FR')} artisans actifs à ${villeName} (${departementCode})${
      profileSuffix ? ` — ${profileSuffix.toLowerCase()}` : ''
    }, répartis sur ${servicesCount} corps de métier.`
  )
  bullets.push(
    `Vérification systématique : numéro SIREN officiel, attestation d'assurance décennale, devis écrit signé avant tout démarrage de travaux.`
  )
  bullets.push(
    `Réponse moyenne sous 24h, intervention sous 48-72h hors urgence — chaque demande de devis est envoyée à un seul artisan, jamais partagée à plusieurs.`
  )
  if (rgeCount > 0) {
    bullets.push(
      `${rgeCount.toLocaleString('fr-FR')} artisan${rgeCount > 1 ? 's' : ''} certifié${rgeCount > 1 ? 's' : ''} RGE à ${villeName} pour MaPrimeRénov' (jusqu'à 11 000 €), CEE et TVA réduite à 5,5 %.`
    )
  }
  bullets.push(
    `Comparaison gratuite : recevez plusieurs devis détaillés (recommandation officielle service-public.fr) avant de choisir votre artisan.`
  )
  return bullets
}
