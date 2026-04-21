/**
 * Pure aggregation for the monthly RGE barometer. No DB, no fs — testable in isolation.
 * Consumed by `scripts/generate-barometre-rge.ts`.
 */

export type RgeQualif = {
  code?: string | null
  nom?: string | null
  libelle?: string | null
  organisme?: string | null
  date_debut?: string | null
  date_fin?: string | null
}

export type ProviderRow = {
  id: string
  specialty: string | null
  address_region: string | null
  rge_qualifications: RgeQualif[] | null
  rge_valid_until: string | null
  rge_organismes: string[] | null
}

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

export type Snapshot = {
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

export const METHODOLOGY = [
  'Base : providers actifs (is_active = true) de ServicesArtisans.',
  'Source RGE : synchronisation hebdomadaire du répertoire ADEME (annuaire-entreprises.data.gouv.fr).',
  'RGE actif = au moins une qualification avec rge_valid_until >= premier jour du mois du snapshot.',
  'RGE expiré = qualifications présentes mais rge_valid_until < mois du snapshot.',
  'Agrégats région : address_region (INSEE). Qualifications : rge_qualifications[].code normalisés.',
  'Top 10 qualifications nationales, top 12 spécialités, tous les organismes certificateurs.',
].join(' ')

export const SOURCE_NOTE = 'ADEME annuaire-entreprises RGE officiel — sync hebdo'

export function slugifyRegion(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function validYearMonth(yearmonth: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(yearmonth)
}

export function aggregate(
  rows: ProviderRow[],
  yearmonth: string,
  totalProviders: number,
  now: Date = new Date()
): Snapshot {
  if (!validYearMonth(yearmonth)) {
    throw new Error(`Invalid yearmonth "${yearmonth}" — expected YYYY-MM`)
  }
  const cutoff = `${yearmonth}-01`

  let totalActive = 0
  let totalExpired = 0
  const regionMap = new Map<string, RegionBucket & { qualCounts: Map<string, number> }>()
  const qualMap = new Map<string, number>()
  const specialtyMap = new Map<string, number>()
  const orgMap = new Map<string, number>()

  for (const r of rows) {
    const quals = Array.isArray(r.rge_qualifications) ? r.rge_qualifications : []
    if (quals.length === 0) continue

    const isActive = typeof r.rge_valid_until === 'string' && r.rge_valid_until >= cutoff
    if (isActive) totalActive += 1
    else totalExpired += 1

    if (r.address_region) {
      const slug = slugifyRegion(r.address_region)
      let bucket = regionMap.get(slug)
      if (!bucket) {
        bucket = {
          region: r.address_region,
          region_slug: slug,
          nb_rge_active: 0,
          nb_rge_expired: 0,
          top_qualification: null,
          top_qualification_count: 0,
          qualCounts: new Map(),
        }
        regionMap.set(slug, bucket)
      }
      if (isActive) bucket.nb_rge_active += 1
      else bucket.nb_rge_expired += 1
      for (const q of quals) {
        const code = (q.code || '').trim()
        if (!code) continue
        bucket.qualCounts.set(code, (bucket.qualCounts.get(code) ?? 0) + 1)
      }
    }

    if (isActive && r.specialty) {
      specialtyMap.set(r.specialty, (specialtyMap.get(r.specialty) ?? 0) + 1)
    }

    if (isActive) {
      const seen = new Set<string>()
      for (const q of quals) {
        const code = (q.code || '').trim()
        if (!code || seen.has(code)) continue
        seen.add(code)
        qualMap.set(code, (qualMap.get(code) ?? 0) + 1)
      }
    }

    const organismes = Array.isArray(r.rge_organismes) ? r.rge_organismes : []
    const seenOrgs = new Set<string>()
    for (const o of organismes) {
      const key = (o || '').trim()
      if (!key || seenOrgs.has(key)) continue
      seenOrgs.add(key)
      orgMap.set(key, (orgMap.get(key) ?? 0) + 1)
    }
  }

  const by_region: RegionBucket[] = Array.from(regionMap.values())
    .map((b) => {
      let topCode: string | null = null
      let topCount = 0
      for (const [code, n] of Array.from(b.qualCounts.entries())) {
        if (n > topCount) {
          topCode = code
          topCount = n
        }
      }
      return {
        region: b.region,
        region_slug: b.region_slug,
        nb_rge_active: b.nb_rge_active,
        nb_rge_expired: b.nb_rge_expired,
        top_qualification: topCode,
        top_qualification_count: topCount,
      }
    })
    .sort((a, b) => b.nb_rge_active - a.nb_rge_active)

  const by_qualification: QualificationBucket[] = Array.from(qualMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([code, nb_artisans], i) => ({ code, nb_artisans, rank: i + 1 }))

  const by_specialty: SpecialtyBucket[] = Array.from(specialtyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([specialty, nb]) => ({
      specialty,
      nb_rge_active: nb,
      share_pct: totalActive > 0 ? Math.round((nb / totalActive) * 1000) / 10 : 0,
    }))

  const organismes: OrganismeBucket[] = Array.from(orgMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([organisme, nb_artisans]) => ({ organisme, nb_artisans }))

  return {
    yearmonth,
    captured_at: now.toISOString(),
    total_rge_active: totalActive,
    total_rge_expired: totalExpired,
    total_providers: totalProviders,
    by_region,
    by_qualification,
    by_specialty,
    organismes,
    methodology: METHODOLOGY,
    source_note: SOURCE_NOTE,
  }
}
