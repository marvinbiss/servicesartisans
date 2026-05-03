import { createAdminClient } from '@/lib/supabase/admin'

export type RegionBucket = {
  region: string
  region_slug: string
  nb_rge_active: number
  nb_rge_expired: number
  top_qualification: string | null
  top_qualification_count: number
}

export type QualificationBucket = { code: string; nb_artisans: number; rank: number }
export type SpecialtyBucket = { specialty: string; nb_rge_active: number; share_pct: number }
export type OrganismeBucket = { organisme: string; nb_artisans: number }

export type RgeSnapshot = {
  yearmonth: string
  captured_at: string
  total_rge_active: number
  total_rge_expired: number
  total_providers: number
  by_region: RegionBucket[]
  by_qualification: QualificationBucket[]
  by_specialty: SpecialtyBucket[]
  organismes: OrganismeBucket[]
  methodology: string
  source_note: string
}

const IS_BUILD = process.env.NEXT_BUILD_SKIP_DB === '1' && !process.env.NEXT_PUBLIC_SUPABASE_URL

export async function getLatestRgeSnapshot(): Promise<RgeSnapshot | null> {
  if (IS_BUILD) return null
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('barometre_rge_snapshots')
      .select('*')
      .order('yearmonth', { ascending: false })
      .limit(1)
    if (error || !data || data.length === 0) return null
    return data[0] as RgeSnapshot
  } catch {
    return null
  }
}
