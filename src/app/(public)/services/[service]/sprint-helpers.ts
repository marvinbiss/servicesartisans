/**
 * Helpers locaux Sprint 0.2 ULTRA DOMINATION SEO Phase 0 — extraits de
 * `page.tsx` pour pouvoir être testés unitairement sans charger toute la page
 * server-component.
 *
 * Aucune dépendance Next.js / Supabase — pure logique déterministe.
 */

export function countLabelForSummary(count: number): string {
  // Audit Sprint 0.2 : NaN/Infinity → fallback générique pour ne pas afficher
  // "plus de Infinity+" ou "NaN+" en SERP.
  if (!Number.isFinite(count) || count <= 0) return 'des centaines de'
  if (count >= 1000) return `plus de ${Math.floor(count / 100) * 100}+`
  return `${count}+`
}

export type EnBrefTradeShape =
  | {
      priceRange: { min: number; max: number; unit: string }
    }
  | null
  | undefined

export function buildEnBrefPoints({
  serviceName,
  providerCount,
  trade,
  villesCount,
}: {
  serviceName: string
  providerCount: number
  trade: EnBrefTradeShape
  villesCount: number
}): string[] {
  const points: string[] = []
  if (providerCount > 0) {
    points.push(
      `${providerCount.toLocaleString('fr-FR')} ${serviceName.toLowerCase()} vérifiés SIREN`
    )
  } else {
    points.push(
      `Annuaire ${serviceName.toLowerCase()} couvrant ${villesCount.toLocaleString('fr-FR')}+ villes`
    )
  }
  if (trade) {
    // Audit Sprint 0.2 : ordonner min/max (DB peut renvoyer min > max sur
    // fixtures) pour ne pas afficher "90–60 €/h" en SERP.
    const lo = Math.min(trade.priceRange.min, trade.priceRange.max)
    const hi = Math.max(trade.priceRange.min, trade.priceRange.max)
    points.push(`Fourchette de prix : ${lo}–${hi} ${trade.priceRange.unit}`)
  }
  points.push('Devis gratuits sous 24h, sans engagement')
  points.push('Données SIRENE officielles, mises à jour quotidiennement')
  return points
}

/**
 * Bullets TL;DR pour le hub /services/[s].
 *
 * Distinct de `buildEnBrefPoints` : optimisé AI Overviews + Speakable
 * (SpeakableSpecification) — réponses directes à des questions fréquentes
 * type "combien coûte un X", "comment trouver un X", "quels documents
 * doit fournir un X". Pas de répétition du compteur déjà présent dans
 * EnBrefBox + Hero — chaque bullet apporte une info différente.
 *
 * Retourne `[]` si aucune info exploitable (TldrBlock se rend null).
 */
export function buildServiceTldrBullets({
  serviceName,
  trade,
  topCity,
  villesCount,
}: {
  serviceName: string
  trade: EnBrefTradeShape
  topCity: string | null
  villesCount: number
}): string[] {
  const bullets: string[] = []
  const sName = serviceName.toLowerCase()

  if (trade) {
    const lo = Math.min(trade.priceRange.min, trade.priceRange.max)
    const hi = Math.max(trade.priceRange.min, trade.priceRange.max)
    bullets.push(
      `Tarif moyen ${sName} en France : ${lo}–${hi} ${trade.priceRange.unit} (devis gratuit pour un prix exact).`
    )
  }
  bullets.push(
    `Un artisan ${sName} sérieux fournit obligatoirement : devis écrit signé, attestation SIRET, attestation d’assurance décennale et garantie biennale.`
  )
  if (topCity) {
    bullets.push(
      `Demande forte à ${topCity} et ${Math.max(0, villesCount - 1).toLocaleString('fr-FR')}+ autres villes — réponse moyenne sous 24h, intervention sous 48-72h selon urgence.`
    )
  } else {
    bullets.push(
      `Disponibles dans ${villesCount.toLocaleString('fr-FR')}+ villes — réponse moyenne sous 24h, intervention sous 48-72h selon urgence.`
    )
  }
  bullets.push(
    `Comparez plusieurs devis avant de signer (recommandation officielle service-public.fr) — chaque demande envoie votre projet à 1 seul artisan, jamais partagé.`
  )
  return bullets
}
