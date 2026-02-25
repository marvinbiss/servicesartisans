/**
 * Provider URL Resolver — Shared module for resolving provider data → sitemap URL.
 *
 * Used by:
 *   1. tools/refresh-provider-sitemaps.ts (build-time refresh)
 *   2. src/app/api/sitemap-providers/route.ts (legacy fallback)
 *
 * Extracts the slug resolution logic that was previously embedded in the route.
 */

import { SITE_URL } from '@/lib/seo/config'
import { services, villes } from '@/lib/data/france'
import { tradeContent } from '@/lib/data/trade-content'
import inseeCommunes from '@/lib/data/insee-communes.json'

// ── Specialty → Service slug mapping ────────────────────────────────────────

export const specialtyToSlug: Record<string, string> = {
  'plombier': 'plombier',
  'electricien': 'electricien',
  'chauffagiste': 'chauffagiste',
  'menuisier': 'menuisier',
  'menuisier-metallique': 'serrurier',
  'carreleur': 'carreleur',
  'couvreur': 'couvreur',
  'macon': 'macon',
  'peintre': 'peintre-en-batiment',
  'charpentier': 'charpentier',
  'isolation': 'isolation-thermique',
  'platrier': 'platrier',
  'finition': 'peintre-en-batiment',
  'serrurier': 'serrurier',
  'jardinier': 'jardinier',
  'paysagiste': 'paysagiste',
  'vitrier': 'vitrier',
  'miroitier': 'miroitier',
  'cuisiniste': 'cuisiniste',
  'installateur-de-cuisine': 'cuisiniste',
  'solier': 'solier',
  'poseur-de-parquet': 'poseur-de-parquet',
  'parqueteur': 'poseur-de-parquet',
  'moquettiste': 'solier',
  'nettoyage': 'nettoyage',
  'nettoyage-professionnel': 'nettoyage',
  'terrassier': 'terrassier',
  'terrassement': 'terrassier',
  'zingueur': 'zingueur',
  'couvreur-zingueur': 'zingueur',
  'etancheiste': 'etancheiste',
  'etancheite': 'etancheiste',
  'facadier': 'facadier',
  'facade': 'facadier',
  'ravalement': 'facadier',
  'plaquiste': 'platrier',
  'platrerie': 'platrier',
  'metallier': 'metallier',
  'metallerie': 'metallier',
  'ferronnier': 'ferronnier',
  'ferronnerie': 'ferronnier',
  'storiste': 'storiste',
  'store': 'storiste',
  'volet': 'storiste',
  'salle-de-bain': 'salle-de-bain',
  'installateur-de-salle-de-bain': 'salle-de-bain',
  'architecte-interieur': 'architecte-interieur',
  'architecte-d-interieur': 'architecte-interieur',
  'decoration': 'decorateur',
  'decorateur': 'decorateur',
  'peintre-decorateur': 'decorateur',
  'domoticien': 'domoticien',
  'domotique': 'domoticien',
  'pompe-a-chaleur': 'pompe-a-chaleur',
  'pac': 'pompe-a-chaleur',
  'panneaux-solaires': 'panneaux-solaires',
  'photovoltaique': 'panneaux-solaires',
  'solaire': 'panneaux-solaires',
  'isolation-thermique': 'isolation-thermique',
  'ite': 'isolation-thermique',
  'iti': 'isolation-thermique',
  'renovation-energetique': 'renovation-energetique',
  'rge': 'renovation-energetique',
  'borne-recharge': 'borne-recharge',
  'borne-electrique': 'borne-recharge',
  'ramoneur': 'ramoneur',
  'ramonage': 'ramoneur',
  'amenagement-exterieur': 'paysagiste',
  'pisciniste': 'pisciniste',
  'piscine': 'pisciniste',
  'alarme': 'alarme-securite',
  'securite': 'alarme-securite',
  'videosurveillance': 'alarme-securite',
  'alarme-securite': 'alarme-securite',
  'antenniste': 'antenniste',
  'antenne': 'antenniste',
  'ascensoriste': 'ascensoriste',
  'ascenseur': 'ascensoriste',
  'diagnostiqueur': 'diagnostiqueur',
  'diagnostic': 'diagnostiqueur',
  'dpe': 'diagnostiqueur',
  'geometre': 'geometre',
  'geometre-expert': 'geometre',
  'desinsectisation': 'desinsectisation',
  'desinsectiseur': 'desinsectisation',
  'nuisibles': 'desinsectisation',
  'deratisation': 'deratisation',
  'deratiseur': 'deratisation',
  'demenageur': 'demenageur',
  'demenagement': 'demenageur',
  'climaticien': 'climaticien',
}

// ── Pre-computed lookup maps (initialized once at module load) ───────────────

const serviceMap = new Map<string, string>()
for (const s of services) {
  serviceMap.set(
    s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(),
    s.slug
  )
}

const villeMap = new Map<string, string>()
for (const v of villes) {
  villeMap.set(
    v.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(),
    v.slug
  )
}

const inseeMap = inseeCommunes as Record<string, { n: string }>

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

for (const entry of Object.values(inseeMap)) {
  const norm = entry.n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  if (!villeMap.has(norm)) {
    villeMap.set(norm, slugify(entry.n))
  }
}

// Arrondissement INSEE codes → main city slug
const arrondissementMap: Record<string, string> = {}
for (let i = 1; i <= 20; i++) arrondissementMap[`751${String(i).padStart(2, '0')}`] = 'paris'
for (let i = 1; i <= 16; i++) arrondissementMap[`132${String(i).padStart(2, '0')}`] = 'marseille'
for (let i = 81; i <= 89; i++) arrondissementMap[`693${String(i)}`] = 'lyon'

// Extend specialtyToSlug with tradeContent keys
for (const key of Object.keys(tradeContent)) {
  if (!specialtyToSlug[key]) {
    specialtyToSlug[key] = key
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

export type ProviderRow = {
  id: string
  name: string | null
  slug: string | null
  stable_id: string | null
  specialty: string | null
  address_city: string | null
  updated_at: string | null
}

export type ResolvedProviderUrl = {
  url: string
  lastmod: string | undefined
  providerId: string
}

// ── Core resolver ────────────────────────────────────────────────────────────

/**
 * Resolve a provider row into a sitemap URL.
 * Returns null if the provider cannot be mapped (missing specialty, city, or slug).
 */
export function resolveProviderUrl(p: ProviderRow): ResolvedProviderUrl | null {
  if (!p.name || !p.specialty || !p.address_city) return null

  const normalizedSpecialty = p.specialty.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  const serviceSlug = serviceMap.get(normalizedSpecialty) || specialtyToSlug[p.specialty.toLowerCase()]

  const rawCity = p.address_city
  const isInsee = /^\d{4,5}$/.test(rawCity) || /^[0-9][A-Z0-9]\d{3}$/.test(rawCity)
  const arrondissementSlug = isInsee ? arrondissementMap[rawCity] : undefined
  const cityName = isInsee ? (inseeMap[rawCity]?.n || rawCity) : rawCity
  const normalizedCity = cityName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  const locationSlug = arrondissementSlug || villeMap.get(normalizedCity)

  const publicId = p.slug || p.stable_id || p.id

  if (!serviceSlug || !locationSlug || !publicId) return null

  const url = `${SITE_URL}/services/${serviceSlug}/${locationSlug}/${publicId}`
  const lastmod = p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : undefined

  return { url, lastmod, providerId: p.id }
}

// ── Columns needed for the SELECT query ─────────────────────────────────────

export const PROVIDER_SELECT_COLUMNS = 'id, name, slug, stable_id, specialty, address_city, updated_at' as const
