/**
 * Manifest + orchestration de publication du dataset RGE sur data.gouv.fr.
 *
 * Dernière brique du Pilier #1 "data-authority" : le helper bas-niveau
 * (`ensureDataset` / `syncRemoteResource`, cf. `./datagouv.ts`) était
 * *future-ready* mais jamais appelé. Ce module câble l'orchestration mensuelle
 * (invoquée par `src/app/api/cron/datagouv-publish`).
 *
 * WHY ce module existe séparé de `datagouv.ts` : garder le helper HTTP pur
 * (aucune dépendance métier RGE / SITE_URL) et isoler ici la spec RGE.
 *
 * ⚠️ AUCUNE publication ne part sans que Marvin pose EXPLICITEMENT
 * `DATAGOUV_API_KEY` + `DATAGOUV_PUBLISH_ENABLED=true` en prod (double gate côté
 * cron). Publier = action sortante irréversible-ish sur une plateforme publique.
 */

import { SITE_URL } from '@/lib/seo/config'
import {
  ensureDataset,
  syncRemoteResource,
  type DataGouvConfig,
  type DataGouvDatasetManifest,
  type DataGouvRemoteResource,
} from './datagouv'

/**
 * Licence de publication data.gouv.fr.
 *
 * ⚠️ DÉCISION EN ATTENTE (Marvin) : incohérence à trancher avant activation.
 *   - Le site (`/open-data`, `/datasets/*` Schema.org) déclare **Etalab 2.0**
 *     (= Licence Ouverte v2 = `lov2`).
 *   - `docs/datagouv-rge-manifest.json` déclare **CC-BY 4.0** (`cc-by`) avec
 *     texte d'attribution dédié.
 * Défaut ici = `lov2` pour rester COHÉRENT avec ce que les pages publiques
 * promettent déjà aux réutilisateurs. Basculer sur `'cc-by'` si l'équipe
 * aligne aussi les pages /open-data + le Dataset schema. Ne PAS publier sous
 * des termes différents de ceux affichés sur le site.
 */
const RGE_DATASET_LICENSE: DataGouvDatasetManifest['license'] = 'lov2'

/** Slug stable data.gouv.fr — sert de clé d'upsert idempotent. */
export const RGE_DATASET_SLUG = 'annuaire-artisans-rge-france'

export const RGE_DATASET_MANIFEST: DataGouvDatasetManifest = {
  slug: RGE_DATASET_SLUG,
  title: 'Annuaire des artisans RGE de France — ServicesArtisans',
  description:
    "Liste des entreprises certifiées RGE (Reconnu Garant de l'Environnement), " +
    "~50 000 fiches actualisées mensuellement. Source initiale : ADEME / France Rénov'. " +
    'Enrichissement ServicesArtisans : géolocalisation WGS84, normalisation des slugs ' +
    'métiers, regroupement par organisme certificateur, date de validité maximale. ' +
    'Documentation du schéma : ' +
    `${SITE_URL}/datasets/rge#schema`,
  tags: [
    'rge',
    'renovation-energetique',
    'artisans',
    'ademe',
    'maprimerenov',
    'cee',
    'france-renov',
    'pompe-a-chaleur',
    'isolation',
    'chauffagiste',
  ],
  license: RGE_DATASET_LICENSE,
  frequency: 'monthly',
  temporalCoverageStart: '2026-04-01',
}

/**
 * Ressources distantes synchronisées sur le dataset. On pointe les URLs
 * STABLES `rge-latest.*` (jamais les snapshots horodatés) : data.gouv.fr
 * re-fetch automatiquement la source, donc l'URL stable = 1 seule ressource
 * qui suit toujours la dernière publication. `syncRemoteResource` est
 * idempotent sur l'URL → no-op aux runs suivants.
 */
export const RGE_REMOTE_RESOURCES: readonly DataGouvRemoteResource[] = [
  {
    title: 'Annuaire RGE — CSV (UTF-8 BOM, dernière publication)',
    url: `${SITE_URL}/datasets/rge/rge-latest.csv`,
    format: 'csv',
    description:
      'CSV avec en-tête, UTF-8 BOM (Excel-compatible). Colonnes : SIRET, nom, slug, ' +
      'adresse géocodée, qualifications RGE actives, date de validité, organisme.',
  },
  {
    title: 'Annuaire RGE — NDJSON (streaming, dernière publication)',
    url: `${SITE_URL}/datasets/rge/rge-latest.json`,
    format: 'json',
    description:
      'Newline-delimited JSON (1 fiche/ligne). Préserve la structure imbriquée des ' +
      'qualifications. Optimal jq / Spark / BigQuery / ETL streaming.',
  },
]

export type PublishRgeResult = {
  datasetId: string
  page: string
  resources: { title: string; url: string; id: string }[]
}

/**
 * Publie (ou met à jour, idempotent) le dataset RGE + ses ressources distantes
 * sur data.gouv.fr. Ne DOIT être appelé qu'avec une config valide
 * (`getDataGouvConfig()` non-null) — le cron garantit ce contrat.
 *
 * Idempotent : ré-exécutable sans effet de bord (dataset existant réutilisé,
 * ressources déjà présentes = no-op). Throw `DataGouvApiError` en cas d'échec
 * HTTP amont (remonté au cron → 500, réessayé au prochain schedule).
 */
export async function publishRgeDataset(cfg: DataGouvConfig): Promise<PublishRgeResult> {
  const dataset = await ensureDataset(cfg, RGE_DATASET_MANIFEST)

  const resources: PublishRgeResult['resources'] = []
  for (const resource of RGE_REMOTE_RESOURCES) {
    const synced = await syncRemoteResource(cfg, dataset.id, resource)
    resources.push({ title: resource.title, url: resource.url, id: synced.id })
  }

  return { datasetId: dataset.id, page: dataset.page, resources }
}
