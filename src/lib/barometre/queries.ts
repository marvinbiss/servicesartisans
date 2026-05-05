/**
 * Fonctions serveur pour requêter barometre_stats depuis Supabase
 * Utilisées dans les pages SSR/ISR — NE PAS importer dans des composants client
 *
 * Toutes les fonctions exposées sont wrappées avec unstable_cache (Next.js Data Cache)
 * pour garantir que les résultats sont mis en cache côté serveur et que les pages
 * utilisant ces données soient éligibles au CDN caching (ISR).
 * Sans ce wrapper, les appels Supabase JS (fetch tiers) ne passent pas par le
 * cache Next.js, ce qui force un rendu dynamique à chaque requête.
 *
 * ⚠️ PIVOT FULL RGE 2026-05-05 — la table source `barometre_stats` agrège TOUS
 * les providers actifs (RGE + non-RGE), pas uniquement les artisans RGE certifiés.
 * Toutes les fonctions de ce module retournent donc des `nb_artisans` qui ne sont
 * PAS RGE-filtered. Pour les pages publiques qui doivent afficher un compte
 * RGE-only, utiliser `getProviderCount()` / `getProviderCountByDepartment()` /
 * `getProviderCountByRegion()` de `@/lib/data/stats.ts` (RGE-default depuis
 * 2026-05-05). Workaround temporaire en place sur le baromètre national :
 * si totalArtisans > 75 000 → fallback ~50 000 (cf. Vague 2).
 *
 * Roadmap : ajouter colonne `nb_artisans_rge` à `barometre_stats` + recron pour
 * supprimer le workaround et exposer la valeur RGE directement.
 */

import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

const IS_BUILD = process.env.NEXT_BUILD_SKIP_DB === '1' && !process.env.NEXT_PUBLIC_SUPABASE_URL

/** Durée de cache par défaut : 24h (alignée sur revalidate des pages baromètre) */
const CACHE_TTL = 86400

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BarometreStatRow {
  id: number
  metier: string
  metier_slug: string
  ville: string | null
  ville_slug: string | null
  departement: string | null
  departement_code: string | null
  region: string | null
  region_slug: string | null
  nb_artisans: number
  note_moyenne: number | null
  nb_avis: number
  taux_verification: number
  variation_trimestre: number | null
  updated_at: string
}

export interface NationalStats {
  totalArtisans: number
  noteGlobale: number
  totalAvis: number
  tauxVerifGlobal: number
  nbMetiers: number
  nbVilles: number
}

// ---------------------------------------------------------------------------
// Requêtes
// ---------------------------------------------------------------------------

/** Stats nationales par métier (ville=null, dept=null, region=null) */
async function _getStatsByMetier(metierSlug: string): Promise<BarometreStatRow | null> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('barometre_stats')
      .select('*')
      .eq('metier_slug', metierSlug)
      .is('ville', null)
      .is('departement', null)
      .is('region', null)
      .single()
    return data as BarometreStatRow | null
  } catch {
    return null
  }
}

export async function getStatsByMetier(metierSlug: string): Promise<BarometreStatRow | null> {
  if (IS_BUILD) return null
  return unstable_cache(_getStatsByMetier, ['barometre-stats-metier', metierSlug], {
    revalidate: CACHE_TTL,
    tags: ['barometre'],
  })(metierSlug)
}

/** Stats par métier dans une ville */
async function _getStatsByMetierVille(
  metierSlug: string,
  villeSlug: string
): Promise<BarometreStatRow | null> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('barometre_stats')
      .select('*')
      .eq('metier_slug', metierSlug)
      .eq('ville_slug', villeSlug)
      .single()
    return data as BarometreStatRow | null
  } catch {
    return null
  }
}

export async function getStatsByMetierVille(
  metierSlug: string,
  villeSlug: string
): Promise<BarometreStatRow | null> {
  if (IS_BUILD) return null
  return unstable_cache(
    _getStatsByMetierVille,
    ['barometre-stats-metier-ville', metierSlug, villeSlug],
    {
      revalidate: CACHE_TTL,
      tags: ['barometre'],
    }
  )(metierSlug, villeSlug)
}

/** Tous les métiers dans une région */
async function _getStatsByRegion(regionSlug: string): Promise<BarometreStatRow[]> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('barometre_stats')
      .select('*')
      .eq('region_slug', regionSlug)
      .is('ville', null)
      .is('departement', null)
      .order('nb_artisans', { ascending: false })
    return (data ?? []) as BarometreStatRow[]
  } catch {
    return []
  }
}

export async function getStatsByRegion(regionSlug: string): Promise<BarometreStatRow[]> {
  if (IS_BUILD) return []
  return unstable_cache(_getStatsByRegion, ['barometre-stats-region', regionSlug], {
    revalidate: CACHE_TTL,
    tags: ['barometre'],
  })(regionSlug)
}

/** Tous les métiers dans un département */
async function _getStatsByDepartement(deptCode: string): Promise<BarometreStatRow[]> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('barometre_stats')
      .select('*')
      .eq('departement_code', deptCode)
      .is('ville', null)
      .order('nb_artisans', { ascending: false })
    return (data ?? []) as BarometreStatRow[]
  } catch {
    return []
  }
}

export async function getStatsByDepartement(deptCode: string): Promise<BarometreStatRow[]> {
  if (IS_BUILD) return []
  return unstable_cache(_getStatsByDepartement, ['barometre-stats-dept', deptCode], {
    revalidate: CACHE_TTL,
    tags: ['barometre'],
  })(deptCode)
}

/**
 * Stats globales nationales (somme de tous les métiers niveau national).
 *
 * ⚠️ PIVOT FULL RGE 2026-05-05 — la table `barometre_stats` n'est PAS RGE-only :
 * `nb_artisans` agrège tous providers actifs (RGE + non-RGE), pas juste les
 * RGE certifiés. La fonction renvoie donc un `totalArtisans` qui inclut des
 * artisans hors-RGE. Les consumers SSR/UI publics doivent :
 *   1) soit re-borner la valeur (workaround Vague 2 : si totalArtisans > 75 000,
 *      remplacer par ~50 000 estimation RGE),
 *   2) soit re-filtrer côté DB en utilisant `getProviderCount()` de
 *      `@/lib/data/stats.ts` (RGE-default) pour le tile "X artisans".
 *
 * `tauxVerifGlobal` reflète la verification SIREN, PAS la certification RGE.
 *
 * Tant que la table `barometre_stats` n'a pas une colonne `nb_artisans_rge`
 * dédiée + un cron de resync, ne JAMAIS afficher `totalArtisans` brut sur une
 * page publique sans encadrement copy "tous corps de métier confondus".
 */
async function _getNationalStats(): Promise<NationalStats> {
  try {
    const supabase = createAdminClient()

    // Métiers au niveau national
    const { data: national } = await supabase
      .from('barometre_stats')
      .select('*')
      .is('ville', null)
      .is('departement', null)
      .is('region', null)

    const rows = (national ?? []) as BarometreStatRow[]

    const totalArtisans = rows.reduce((s, r) => s + r.nb_artisans, 0)
    const totalAvis = rows.reduce((s, r) => s + r.nb_avis, 0)
    const ratedRows = rows.filter((r) => r.note_moyenne !== null)
    const noteGlobale =
      ratedRows.length > 0
        ? Math.round(
            (ratedRows.reduce((s, r) => s + (r.note_moyenne ?? 0) * r.nb_artisans, 0) /
              ratedRows.reduce((s, r) => s + r.nb_artisans, 0)) *
              100
          ) / 100
        : 4.2
    const tauxVerifGlobal =
      totalArtisans > 0
        ? Math.round(
            (rows.reduce((s, r) => s + r.taux_verification * r.nb_artisans, 0) / totalArtisans) *
              10000
          ) / 10000
        : 0

    // Count distinct villes
    const { count: villeCount } = await supabase
      .from('barometre_stats')
      .select('*', { count: 'exact', head: true })
      .not('ville', 'is', null)

    return {
      totalArtisans,
      noteGlobale,
      totalAvis,
      tauxVerifGlobal,
      nbMetiers: rows.length,
      nbVilles: villeCount ?? 0,
    }
  } catch {
    return {
      // Pivot full RGE 2026-05-05 — fallback aligné sur le périmètre RGE
      // (~50 000 fiches publiées). La page baromètre re-borne via
      // RGE_TOTAL_FALLBACK = 50000 si la valeur DB sort du cadre.
      totalArtisans: 50000,
      noteGlobale: 4.2,
      totalAvis: 0,
      tauxVerifGlobal: 0,
      nbMetiers: 0,
      nbVilles: 0,
    }
  }
}

export async function getNationalStats(): Promise<NationalStats> {
  if (IS_BUILD) {
    return {
      // Pivot full RGE 2026-05-05 — fallback aligné sur le périmètre RGE
      // (~50 000 fiches publiées). La page baromètre re-borne via
      // RGE_TOTAL_FALLBACK = 50000 si la valeur DB sort du cadre.
      totalArtisans: 50000,
      noteGlobale: 4.2,
      totalAvis: 0,
      tauxVerifGlobal: 0,
      nbMetiers: 0,
      nbVilles: 0,
    }
  }
  return unstable_cache(_getNationalStats, ['barometre-national-stats'], {
    revalidate: CACHE_TTL,
    tags: ['barometre'],
  })()
}

/** Top N métiers par nb_artisans (niveau national) */
async function _getTopMetiers(limit: number): Promise<BarometreStatRow[]> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('barometre_stats')
      .select('*')
      .is('ville', null)
      .is('departement', null)
      .is('region', null)
      .order('nb_artisans', { ascending: false })
      .limit(limit)
    return (data ?? []) as BarometreStatRow[]
  } catch {
    return []
  }
}

export async function getTopMetiers(limit = 10): Promise<BarometreStatRow[]> {
  if (IS_BUILD) return []
  return unstable_cache(_getTopMetiers, ['barometre-top-metiers', String(limit)], {
    revalidate: CACHE_TTL,
    tags: ['barometre'],
  })(limit)
}

/** Top N villes par nb_artisans (toutes spécialités confondues) */
async function _getTopVilles(
  limit: number
): Promise<{ ville: string; ville_slug: string; total: number }[]> {
  try {
    const supabase = createAdminClient()
    // On récupère les villes et on agrège côté client
    const { data } = await supabase
      .from('barometre_stats')
      .select('ville, ville_slug, nb_artisans')
      .not('ville', 'is', null)
      .order('nb_artisans', { ascending: false })
      .limit(5000)

    if (!data) return []

    // Agrège par ville
    const villeMap = new Map<string, { ville: string; ville_slug: string; total: number }>()
    for (const row of data) {
      if (!row.ville || !row.ville_slug) continue
      const existing = villeMap.get(row.ville_slug)
      if (existing) {
        existing.total += row.nb_artisans
      } else {
        villeMap.set(row.ville_slug, {
          ville: row.ville,
          ville_slug: row.ville_slug,
          total: row.nb_artisans,
        })
      }
    }

    return Array.from(villeMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
  } catch {
    return []
  }
}

export async function getTopVilles(
  limit = 10
): Promise<{ ville: string; ville_slug: string; total: number }[]> {
  if (IS_BUILD) return []
  return unstable_cache(_getTopVilles, ['barometre-top-villes', String(limit)], {
    revalidate: CACHE_TTL,
    tags: ['barometre'],
  })(limit)
}

/** Stats d'un métier dans les top 20 villes */
async function _getMetierTopVilles(
  metierSlug: string,
  villeNames: string[]
): Promise<BarometreStatRow[]> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('barometre_stats')
      .select('*')
      .eq('metier_slug', metierSlug)
      .in('ville', villeNames)
      .order('nb_artisans', { ascending: false })
    return (data ?? []) as BarometreStatRow[]
  } catch {
    return []
  }
}

export async function getMetierTopVilles(
  metierSlug: string,
  villeNames: string[]
): Promise<BarometreStatRow[]> {
  if (IS_BUILD) return []
  return unstable_cache(_getMetierTopVilles, ['barometre-metier-top-villes', metierSlug], {
    revalidate: CACHE_TTL,
    tags: ['barometre'],
  })(metierSlug, villeNames)
}
