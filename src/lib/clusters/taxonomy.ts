/**
 * Taxonomy seed renovation energetique — 14 piliers + clusters initiaux.
 *
 * Source verite KW : audits Ahrefs 2026-05-04 (memory bloc1-niche v3).
 * Tout ajout requiert :
 *   - @kw-primary (un seul mot-cle dominant verifiable Ahrefs)
 *   - volume / KD / CPC depuis CSV Ahrefs (champ `ahrefsSourceDate` daté)
 *   - serviceSlug si applicable (FK soft vers services.slug)
 *
 * Audit pre-commit `scripts/audit-cluster-ahrefs-source.mjs` valide chaque
 * entree contre snapshot CSV (regle Ahrefs-first SA 2026-05-04).
 *
 * Loaded a build-time uniquement (pas d'I/O). Sert de seed pour
 * `scripts/cluster-import-seeds.mjs` qui insert dans `renovation_clusters`.
 */

import type { ClusterSeed } from './types'

const AHREFS_SNAPSHOT_DATE = '2026-05-04'

const ahrefs = (
  primaryKw: string,
  volumeMonthly: number,
  kdAhrefs: number,
  cpcEur: number
): Pick<
  ClusterSeed,
  'primaryKw' | 'volumeMonthly' | 'kdAhrefs' | 'cpcEur' | 'ahrefsSourceDate'
> => ({
  primaryKw,
  volumeMonthly,
  kdAhrefs,
  cpcEur,
  ahrefsSourceDate: AHREFS_SNAPSHOT_DATE,
})

export const PILLAR_SEEDS: ReadonlyArray<ClusterSeed> = [
  {
    slug: 'pompe-a-chaleur',
    parentClusterSlug: null,
    clusterType: 'pillar',
    serviceSlug: 'pompe-a-chaleur',
    ...ahrefs('pompe a chaleur', 230000, 18, 3.2),
  },
  {
    slug: 'ventilation-vmc',
    parentClusterSlug: null,
    clusterType: 'pillar',
    serviceSlug: 'ventilation',
    ...ahrefs('vmc', 90000, 1, 2.1),
  },
  {
    slug: 'maprimerenov',
    parentClusterSlug: null,
    clusterType: 'pillar',
    serviceSlug: null,
    ...ahrefs('maprimerenov', 165000, 22, 2.8),
  },
  {
    slug: 'audit-energetique',
    parentClusterSlug: null,
    clusterType: 'pillar',
    serviceSlug: 'audit-energetique',
    ...ahrefs('audit energetique', 40000, 8, 4.5),
  },
  {
    slug: 'isolation-thermique',
    parentClusterSlug: null,
    clusterType: 'pillar',
    serviceSlug: 'isolation-thermique',
    ...ahrefs('isolation thermique', 35000, 10, 3.1),
  },
  {
    slug: 'panneaux-solaires',
    parentClusterSlug: null,
    clusterType: 'pillar',
    serviceSlug: 'panneaux-solaires',
    ...ahrefs('panneaux solaires', 110000, 25, 4.2),
  },
  {
    slug: 'ballon-thermodynamique',
    parentClusterSlug: null,
    clusterType: 'pillar',
    serviceSlug: 'chauffe-eau-thermodynamique',
    ...ahrefs('ballon thermodynamique', 28000, 6, 2.4),
  },
  {
    slug: 'dpe-diagnostic',
    parentClusterSlug: null,
    clusterType: 'pillar',
    serviceSlug: null,
    ...ahrefs('dpe', 75000, 19, 1.9),
  },
  {
    slug: 'chauffe-eau-thermodynamique',
    parentClusterSlug: null,
    clusterType: 'pillar',
    serviceSlug: 'chauffe-eau-thermodynamique',
    ...ahrefs('chauffe eau thermodynamique', 22000, 7, 2.3),
  },
  {
    slug: 'renovation-globale',
    parentClusterSlug: null,
    clusterType: 'pillar',
    serviceSlug: 'renovation-energetique',
    ...ahrefs('renovation globale', 18000, 12, 3.6),
  },
  {
    slug: 'passoire-thermique',
    parentClusterSlug: null,
    clusterType: 'pillar',
    serviceSlug: null,
    ...ahrefs('passoire thermique', 14000, 4, 2.2),
  },
  {
    slug: 'fenetres-double-vitrage',
    parentClusterSlug: null,
    clusterType: 'pillar',
    serviceSlug: 'fenetres',
    ...ahrefs('double vitrage', 26000, 15, 2.9),
  },
  {
    slug: 'cee-certificats',
    parentClusterSlug: null,
    clusterType: 'pillar',
    serviceSlug: null,
    ...ahrefs('certificats economie energie', 9500, 5, 1.8),
  },
  {
    slug: 'chaudiere-condensation',
    parentClusterSlug: null,
    clusterType: 'pillar',
    serviceSlug: 'chauffagiste',
    ...ahrefs('chaudiere condensation', 12000, 11, 2.7),
  },
]

export const CLUSTER_SEEDS: ReadonlyArray<ClusterSeed> = [
  {
    slug: 'pompe-a-chaleur-air-eau',
    parentClusterSlug: 'pompe-a-chaleur',
    clusterType: 'cluster',
    serviceSlug: 'pompe-a-chaleur',
    ...ahrefs('pompe a chaleur air eau', 49000, 13, 3.4),
  },
  {
    slug: 'pompe-a-chaleur-air-air',
    parentClusterSlug: 'pompe-a-chaleur',
    clusterType: 'cluster',
    serviceSlug: 'pompe-a-chaleur',
    ...ahrefs('pompe a chaleur air air', 27000, 11, 3.1),
  },
  {
    slug: 'pompe-a-chaleur-geothermique',
    parentClusterSlug: 'pompe-a-chaleur',
    clusterType: 'cluster',
    serviceSlug: 'pompe-a-chaleur',
    ...ahrefs('pompe a chaleur geothermique', 5300, 7, 3.8),
  },
  {
    slug: 'pompe-a-chaleur-prix',
    parentClusterSlug: 'pompe-a-chaleur',
    clusterType: 'cluster',
    serviceSlug: 'pompe-a-chaleur',
    ...ahrefs('prix pompe a chaleur', 36000, 14, 3.6),
  },
  {
    slug: 'vmc-double-flux',
    parentClusterSlug: 'ventilation-vmc',
    clusterType: 'cluster',
    serviceSlug: 'ventilation',
    ...ahrefs('vmc double flux', 22000, 5, 2.6),
  },
  {
    slug: 'vmc-simple-flux',
    parentClusterSlug: 'ventilation-vmc',
    clusterType: 'cluster',
    serviceSlug: 'ventilation',
    ...ahrefs('vmc simple flux', 8200, 3, 1.9),
  },
  {
    slug: 'vmc-hygroreglable',
    parentClusterSlug: 'ventilation-vmc',
    clusterType: 'cluster',
    serviceSlug: 'ventilation',
    ...ahrefs('vmc hygroreglable', 4100, 2, 2.1),
  },
  {
    slug: 'maprimerenov-2026-conditions',
    parentClusterSlug: 'maprimerenov',
    clusterType: 'cluster',
    serviceSlug: null,
    ...ahrefs('maprimerenov 2026 conditions', 14000, 9, 1.6),
  },
  {
    slug: 'maprimerenov-simulation',
    parentClusterSlug: 'maprimerenov',
    clusterType: 'cluster',
    serviceSlug: null,
    ...ahrefs('simulation maprimerenov', 33000, 16, 2.4),
  },
  {
    slug: 'maprimerenov-plafond-ressources',
    parentClusterSlug: 'maprimerenov',
    clusterType: 'cluster',
    serviceSlug: null,
    ...ahrefs('maprimerenov plafond ressources', 8700, 8, 1.8),
  },
  {
    slug: 'maprimerenov-cumul-cee',
    parentClusterSlug: 'maprimerenov',
    clusterType: 'cluster',
    serviceSlug: null,
    ...ahrefs('cumul maprimerenov cee', 3600, 4, 1.5),
  },
  {
    slug: 'audit-energetique-prix',
    parentClusterSlug: 'audit-energetique',
    clusterType: 'cluster',
    serviceSlug: 'audit-energetique',
    ...ahrefs('prix audit energetique', 9500, 7, 4.1),
  },
  {
    slug: 'audit-energetique-obligatoire',
    parentClusterSlug: 'audit-energetique',
    clusterType: 'cluster',
    serviceSlug: 'audit-energetique',
    ...ahrefs('audit energetique obligatoire', 12000, 6, 3.2),
  },
  {
    slug: 'isolation-combles',
    parentClusterSlug: 'isolation-thermique',
    clusterType: 'cluster',
    serviceSlug: 'isolation-thermique',
    ...ahrefs('isolation combles', 18000, 9, 2.8),
  },
  {
    slug: 'isolation-murs-exterieurs',
    parentClusterSlug: 'isolation-thermique',
    clusterType: 'cluster',
    serviceSlug: 'isolation-thermique',
    ...ahrefs('isolation murs exterieurs', 14000, 11, 3.5),
  },
  {
    slug: 'dpe-classe-energie',
    parentClusterSlug: 'dpe-diagnostic',
    clusterType: 'cluster',
    serviceSlug: null,
    ...ahrefs('classe energie dpe', 12000, 10, 1.7),
  },
  {
    slug: 'dpe-passoire-energetique',
    parentClusterSlug: 'dpe-diagnostic',
    clusterType: 'cluster',
    serviceSlug: null,
    ...ahrefs('dpe passoire', 4800, 3, 1.4),
  },
]

export const ALL_SEEDS: ReadonlyArray<ClusterSeed> = [...PILLAR_SEEDS, ...CLUSTER_SEEDS]

export function getSeedBySlug(slug: string): ClusterSeed | undefined {
  return ALL_SEEDS.find((s) => s.slug === slug)
}

export function getChildrenOf(parentSlug: string): ReadonlyArray<ClusterSeed> {
  return ALL_SEEDS.filter((s) => s.parentClusterSlug === parentSlug)
}

export const TAXONOMY_VERSION = '2026-05-21-v1'
