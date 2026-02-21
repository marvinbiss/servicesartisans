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
