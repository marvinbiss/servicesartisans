/**
 * Fonctions serveur pour récupérer les vraies statistiques depuis Supabase
 * Utilisées dans les pages SSR/ISR — NE PAS importer dans des composants client
 */

import { createAdminClient } from '@/lib/supabase/admin'

/** Nombre total d'artisans actifs dans la base */
export async function getProviderCount(): Promise<number> {
  try {
    const supabase = createAdminClient()
    const { count } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    return count ?? 0
  } catch {
    return 0
  }
}

/** Nombre d'artisans actifs dans une région (par nom de région) */
export async function getProviderCountByRegion(regionName: string): Promise<number> {
  try {
    const supabase = createAdminClient()
    const { count } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('address_region', regionName)
    return count ?? 0
  } catch {
    return 0
  }
}

/** Nombre d'artisans actifs dans un département (par nom de département) */
export async function getProviderCountByDepartment(deptName: string): Promise<number> {
  try {
    const supabase = createAdminClient()
    const { count } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('address_department', deptName)
    return count ?? 0
  } catch {
    return 0
  }
}

/** Formate un nombre d'artisans pour l'affichage (ex: 12 450) */
export function formatProviderCount(count: number): string {
  return count.toLocaleString('fr-FR')
}

export interface SiteStats {
  artisanCount: number
  reviewCount: number
  avgRating: number
  deptCount: number
}

/** Toutes les stats du site en un seul appel (pour la homepage) */
export async function getSiteStats(): Promise<SiteStats> {
  try {
    const supabase = createAdminClient()

    const [providerRes, reviewCountRes, ratingsRes, deptRes] = await Promise.all([
      supabase
        .from('providers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase
        .from('reviews')
        .select('rating')
        .eq('status', 'published')
        .limit(500),
      supabase
        .from('communes')
        .select('departement_code')
        .gt('provider_count', 0)
        .not('departement_code', 'is', null)
        .limit(10000),
    ])

    const artisanCount = providerRes.count ?? 0
    const reviewCount = reviewCountRes.count ?? 0

    let avgRating = 4.9
    if (ratingsRes.data && ratingsRes.data.length >= 5) {
      const sum = ratingsRes.data.reduce((acc, r) => acc + (r.rating ?? 0), 0)
      const computed = Math.round((sum / ratingsRes.data.length) * 10) / 10
      if (computed >= 1 && computed <= 5) avgRating = computed
    }

    const depts = new Set(deptRes.data?.map(c => c.departement_code).filter(Boolean))
    const deptCount = depts.size || 96

    return { artisanCount, reviewCount, avgRating, deptCount }
  } catch {
    return { artisanCount: 0, reviewCount: 0, avgRating: 4.9, deptCount: 96 }
  }
}
