/**
 * Topical authority renovation energetique — types publics.
 *
 * Architecture trois niveaux :
 *   - pillar    : hub thematique (ex : "pompe-a-chaleur") — 14 entries
 *   - cluster   : sous-thematique (ex : "pompe-a-chaleur-air-eau") — ~5/pillar
 *   - long-tail : page geste x detail (ex : "pompe-a-chaleur-air-eau-prix-2026")
 *
 * Source taxonomy : `src/lib/clusters/taxonomy.ts`. KW + volume + KD valides
 * par CSV Ahrefs date (champ `ahrefsSourceDate` obligatoire — gate audit).
 *
 * Publication gate : `published_at != null && noindex = false` requires
 * `critic_passed_at != null` cote DB (mig 524 contrainte logique cote app).
 */

export type ClusterType = 'pillar' | 'cluster' | 'long-tail'

export type AhrefsKwData = {
  primaryKw: string
  volumeMonthly: number
  kdAhrefs: number
  cpcEur: number
  ahrefsSourceDate: string
}

export type ClusterSeed = AhrefsKwData & {
  slug: string
  parentClusterSlug: string | null
  clusterType: ClusterType
  serviceSlug: string | null
}

export type ClusterDraft = ClusterSeed & {
  contentJsonb: ClusterContent
}

export type ClusterContent = {
  h1: string
  metaTitle: string
  metaDescription: string
  intro: string
  sections: ReadonlyArray<{
    h2: string
    body: string
    factsInjected?: ReadonlyArray<string>
  }>
  faq: ReadonlyArray<{ question: string; answer: string }>
  ctaText: string
  schemaOrgKeys: ReadonlyArray<'Article' | 'FAQPage' | 'BreadcrumbList' | 'HowTo'>
  citedSources: ReadonlyArray<{ url: string; title: string; retrievedAt: string }>
  author: { name: string; role: string; profileUrl?: string }
  generatedBy: string
  generatedAt: string
}

export type ClusterRow = ClusterSeed & {
  contentJsonb: ClusterContent | null
  criticScore: Record<string, unknown> | null
  criticPassedAt: string | null
  publishedAt: string | null
  noindex: boolean
  createdAt: string
  updatedAt: string
}
