/**
 * Helpers locaux Sprint 0.2 ULTRA DOMINATION SEO Phase 0 — extraits de
 * `page.tsx` pour pouvoir être testés unitairement sans charger toute la page
 * server-component.
 *
 * Aucune dépendance Next.js / Supabase — pure logique déterministe.
 */

export function countLabelForSummary(count: number): string {
  if (count >= 1000) return `plus de ${Math.floor(count / 100) * 100}+`
  if (count > 0) return `${count}+`
  return 'des centaines de'
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
    points.push(
      `Fourchette de prix : ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit}`
    )
  }
  points.push('Devis gratuits sous 24h, sans engagement')
  points.push('Données SIRENE officielles, mises à jour quotidiennement')
  return points
}
