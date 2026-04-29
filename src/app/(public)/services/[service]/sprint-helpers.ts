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
