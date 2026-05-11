/**
 * data.gouv.fr API helper — Action #4 Sprint D Ahrefs 2026-05-03.
 *
 * Wrapper minimaliste autour de l'API v1 data.gouv.fr pour publier et
 * synchroniser le dataset RGE. Auth : `X-API-KEY` (PAT généré sur le profil
 * data.gouv.fr du compte producteur).
 *
 * État au 2026-05-03 : helper *future-ready*. Pas câblé en cron actif tant
 * que la société SAS n'est pas validée par data.gouv.fr (KBIS J+4-10).
 * Cf. `docs/datagouv-rge-submission.md` checklist bloqueurs amont.
 *
 * Convention :
 *   - `getDataGouvConfig()` retourne null si DATAGOUV_API_KEY absent
 *     (= mode no-op safe par défaut, jamais d'erreur runtime).
 *   - Les fonctions `*Resource()` sont idempotentes (PUT update si l'id existe,
 *     POST create sinon). Référencer une URL distante (CSV/JSON/Parquet hébergés
 *     sur servicesartisans.fr) = 0 upload, 0 quota, suivi automatique.
 *   - Erreurs : throw `DataGouvApiError` avec code HTTP + message API.
 *
 * Usage prévu (post KBIS validé) :
 *   const cfg = getDataGouvConfig()
 *   if (!cfg) return  // env absent en CI/dev
 *   const dataset = await ensureDataset(cfg, RGE_DATASET_MANIFEST)
 *   await syncRemoteResource(cfg, dataset.id, RGE_RESOURCE_CSV)
 *   await syncRemoteResource(cfg, dataset.id, RGE_RESOURCE_PARQUET)
 *
 * Référence API : https://doc.data.gouv.fr/api/reference/
 */

const DATAGOUV_BASE_URL = 'https://www.data.gouv.fr/api/1'

export type DataGouvConfig = {
  apiKey: string
  baseUrl: string
  organizationId?: string
}

export type DataGouvDatasetManifest = {
  /** Slug stable utilisé pour upsert. Ex `annuaire-artisans-rge-france`. */
  slug: string
  title: string
  description: string
  tags: readonly string[]
  /** Code licence data.gouv.fr — `lov2` (Licence Ouverte v2) ou `cc-by`. */
  license: 'lov2' | 'cc-by'
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual'
  /** ISO date début (YYYY-MM-DD) */
  temporalCoverageStart: string
}

export type DataGouvRemoteResource = {
  /** Titre court ≤ 100 chars */
  title: string
  /** URL distante absolue (https obligatoire). Suivi automatique côté data.gouv.fr. */
  url: string
  /** Format MIME — csv / json / parquet */
  format: 'csv' | 'json' | 'parquet'
  description?: string
}

export type DataGouvDataset = {
  id: string
  slug: string
  uri: string
  page: string
}

export class DataGouvApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    message: string
  ) {
    super(message)
    this.name = 'DataGouvApiError'
  }
}

/**
 * Returns the data.gouv.fr config from env, or null if no API key set.
 * Safe default = no-op (the helper does nothing in dev/CI without env).
 */
export function getDataGouvConfig(): DataGouvConfig | null {
  const apiKey = process.env.DATAGOUV_API_KEY
  if (!apiKey || apiKey.length < 10) return null
  return {
    apiKey,
    baseUrl: process.env.DATAGOUV_API_BASE_URL || DATAGOUV_BASE_URL,
    organizationId: process.env.DATAGOUV_ORGANIZATION_ID,
  }
}

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

async function dgFetch<T>(cfg: DataGouvConfig, path: string, opts: FetchOptions = {}): Promise<T> {
  const url = `${cfg.baseUrl.replace(/\/$/, '')}${path}`
  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers: {
      'X-API-KEY': cfg.apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new DataGouvApiError(
      res.status,
      text,
      `data.gouv.fr ${opts.method ?? 'GET'} ${path} → ${res.status}`
    )
  }
  return (await res.json()) as T
}

/**
 * Returns the dataset by slug, or null if not found (404).
 */
export async function getDatasetBySlug(
  cfg: DataGouvConfig,
  slug: string
): Promise<DataGouvDataset | null> {
  try {
    return await dgFetch<DataGouvDataset>(cfg, `/datasets/${encodeURIComponent(slug)}/`)
  } catch (err) {
    if (err instanceof DataGouvApiError && err.status === 404) return null
    throw err
  }
}

/**
 * Idempotent : creates the dataset if missing, otherwise returns the existing one.
 * Does NOT update title/description on existing datasets (safer — avoid
 * overwriting manual editorial tweaks done in the data.gouv.fr UI).
 */
export async function ensureDataset(
  cfg: DataGouvConfig,
  manifest: DataGouvDatasetManifest
): Promise<DataGouvDataset> {
  const existing = await getDatasetBySlug(cfg, manifest.slug)
  if (existing) return existing

  const body: Record<string, unknown> = {
    title: manifest.title,
    description: manifest.description,
    slug: manifest.slug,
    tags: manifest.tags,
    license: manifest.license,
    frequency: manifest.frequency,
    temporal_coverage: { start: manifest.temporalCoverageStart },
    ...(cfg.organizationId ? { organization: { id: cfg.organizationId } } : {}),
  }

  return await dgFetch<DataGouvDataset>(cfg, '/datasets/', {
    method: 'POST',
    body,
  })
}

type DataGouvResource = {
  id: string
  title: string
  url: string
  format: string
}

/**
 * Synchronizes a single remote resource on a dataset. Idempotent :
 *   - If a resource with the same URL exists → no-op (data.gouv.fr re-fetches
 *     automatically since URL is the source of truth).
 *   - Otherwise → POST a new remote resource.
 *
 * Format MIME : data.gouv.fr maps `format` to mime automatically.
 */
export async function syncRemoteResource(
  cfg: DataGouvConfig,
  datasetId: string,
  resource: DataGouvRemoteResource
): Promise<DataGouvResource> {
  // List existing resources to check idempotency.
  const list = await dgFetch<{ data: DataGouvResource[] } | DataGouvResource[]>(
    cfg,
    `/datasets/${encodeURIComponent(datasetId)}/resources/`
  )
  const existing = Array.isArray(list) ? list : list.data
  const match = existing.find((r) => r.url === resource.url)
  if (match) return match

  return await dgFetch<DataGouvResource>(
    cfg,
    `/datasets/${encodeURIComponent(datasetId)}/resources/`,
    {
      method: 'POST',
      body: {
        title: resource.title,
        url: resource.url,
        format: resource.format,
        filetype: 'remote',
        ...(resource.description ? { description: resource.description } : {}),
      },
    }
  )
}
