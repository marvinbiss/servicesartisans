/**
 * CEE Market Prices — lecture dynamique des cours de marché CEE.
 *
 * Les cours (classique / précarité en €/MWhc) sont stockés dans la table
 * `cee_market_prices` pour permettre la mise à jour admin sans redéploiement.
 *
 * Cache mémoire 1h (module-level) avec fallback sur les constantes en dur
 * si la DB est indisponible (fail-open).
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Fallback constants (identiques aux anciennes valeurs en dur dans enrich.ts)
export const CEE_PRICE_CLASSIQUE_FALLBACK = 9
export const CEE_PRICE_PRECARITE_FALLBACK = 16

export interface CeeMarketPrices {
  classique: number
  precarite: number
}

// ---------- Cache mémoire module-level (TTL 1h) ----------

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 heure

let cachedPrices: CeeMarketPrices | null = null
let cacheExpiry = 0

function getCached(): CeeMarketPrices | null {
  if (cachedPrices && Date.now() < cacheExpiry) {
    return cachedPrices
  }
  return null
}

function setCache(prices: CeeMarketPrices): void {
  cachedPrices = prices
  cacheExpiry = Date.now() + CACHE_TTL_MS
}

/** Invalide le cache (utile après un POST admin). */
export function invalidateCeePricesCache(): void {
  cachedPrices = null
  cacheExpiry = 0
}

// ---------- Lecture DB ----------

/**
 * Retourne les derniers cours CEE (classique + précarité) par effective_date.
 *
 * - Cache mémoire 1h pour éviter un round-trip DB à chaque qualification.
 * - Fail-open : si la table n'existe pas ou si la requête échoue, retourne
 *   les constantes en dur (même comportement qu'avant la migration 420).
 */
export async function getLatestCeePrices(supabase: SupabaseClient): Promise<CeeMarketPrices> {
  // 1. Cache hit ?
  const cached = getCached()
  if (cached) return cached

  // 2. Fetch DB — on récupère le cours le plus récent par price_type
  //    via un ORDER BY effective_date DESC + LIMIT, puis on filtre côté JS.
  try {
    const { data, error } = await supabase
      .from('cee_market_prices')
      .select('price_type, eur_per_mwhc')
      .order('effective_date', { ascending: false })
      .limit(20) // Assez pour avoir au moins 1 de chaque type

    if (error) {
      logger.warn('getLatestCeePrices: DB error — fallback constantes', {
        action: 'cee-market-prices',
        error: error.message,
      })
      return fallbackPrices()
    }

    if (!data || data.length === 0) {
      logger.warn('getLatestCeePrices: table vide — fallback constantes', {
        action: 'cee-market-prices',
      })
      return fallbackPrices()
    }

    // Premier de chaque type = le plus récent (ORDER BY effective_date DESC)
    let classique: number | null = null
    let precarite: number | null = null

    for (const row of data) {
      if (row.price_type === 'classique' && classique === null) {
        classique = Number(row.eur_per_mwhc)
      }
      if (row.price_type === 'precarite' && precarite === null) {
        precarite = Number(row.eur_per_mwhc)
      }
      if (classique !== null && precarite !== null) break
    }

    const prices: CeeMarketPrices = {
      classique: classique ?? CEE_PRICE_CLASSIQUE_FALLBACK,
      precarite: precarite ?? CEE_PRICE_PRECARITE_FALLBACK,
    }

    setCache(prices)
    return prices
  } catch (err) {
    // Fail-open : erreur réseau, table inexistante, etc.
    logger.warn('getLatestCeePrices: exception — fallback constantes', {
      action: 'cee-market-prices',
      error: err instanceof Error ? err.message : String(err),
    })
    return fallbackPrices()
  }
}

function fallbackPrices(): CeeMarketPrices {
  return {
    classique: CEE_PRICE_CLASSIQUE_FALLBACK,
    precarite: CEE_PRICE_PRECARITE_FALLBACK,
  }
}
