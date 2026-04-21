import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes } from '@/lib/data/france'
import { tradeContent } from '@/lib/data/trade-content'
import inseeCommunes from '@/lib/data/insee-communes.json'
import { PROVIDER_BATCH_SIZE } from '@/lib/seo/sitemap-config'

export const maxDuration = 60

/** Escape XML special characters in sitemap URLs to prevent invalid XML */
function escapeXml(s: string): string {
  return (
    s
      // eslint-disable-next-line no-control-regex -- intentional: strip invalid XML 1.0 control chars
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  )
}

const specialtyToSlug: Record<string, string> = {
  plombier: 'plombier',
  electricien: 'electricien',
  chauffagiste: 'chauffagiste',
  menuisier: 'menuisier',
  'menuisier-metallique': 'serrurier',
  carreleur: 'carreleur',
  couvreur: 'couvreur',
  macon: 'macon',
  peintre: 'peintre-en-batiment',
  charpentier: 'charpentier',
  isolation: 'isolation-thermique',
  platrier: 'platrier',
  finition: 'peintre-en-batiment',
  serrurier: 'serrurier',
  jardinier: 'jardinier',
  paysagiste: 'paysagiste',
  vitrier: 'vitrier',
  miroitier: 'miroitier',
  cuisiniste: 'cuisiniste',
  'installateur-de-cuisine': 'cuisiniste',
  solier: 'solier',
  'poseur-de-parquet': 'poseur-de-parquet',
  parqueteur: 'poseur-de-parquet',
  moquettiste: 'solier',
  nettoyage: 'nettoyage',
  'nettoyage-professionnel': 'nettoyage',
  terrassier: 'terrassier',
  terrassement: 'terrassier',
  zingueur: 'zingueur',
  'couvreur-zingueur': 'zingueur',
  etancheiste: 'etancheiste',
  etancheite: 'etancheiste',
  facadier: 'facadier',
  facade: 'facadier',
  ravalement: 'facadier',
  plaquiste: 'platrier',
  platrerie: 'platrier',
  metallier: 'metallier',
  metallerie: 'metallier',
  ferronnier: 'ferronnier',
  ferronnerie: 'ferronnier',
  storiste: 'storiste',
  store: 'storiste',
  volet: 'storiste',
  'salle-de-bain': 'salle-de-bain',
  'installateur-de-salle-de-bain': 'salle-de-bain',
  'architecte-interieur': 'architecte-interieur',
  'architecte-d-interieur': 'architecte-interieur',
  decoration: 'decorateur',
  decorateur: 'decorateur',
  'decorateur-interieur': 'decorateur',
  'peintre-decorateur': 'decorateur',
  domoticien: 'domoticien',
  domotique: 'domoticien',
  'pompe-a-chaleur': 'pompe-a-chaleur',
  pac: 'pompe-a-chaleur',
  'panneaux-solaires': 'panneaux-solaires',
  photovoltaique: 'panneaux-solaires',
  solaire: 'panneaux-solaires',
  'isolation-thermique': 'isolation-thermique',
  ite: 'isolation-thermique',
  iti: 'isolation-thermique',
  'renovation-energetique': 'renovation-energetique',
  rge: 'renovation-energetique',
  'borne-recharge': 'borne-recharge',
  'borne-electrique': 'borne-recharge',
  ramoneur: 'ramoneur',
  ramonage: 'ramoneur',
  'amenagement-exterieur': 'paysagiste',
  pisciniste: 'pisciniste',
  piscine: 'pisciniste',
  alarme: 'alarme-securite',
  securite: 'alarme-securite',
  videosurveillance: 'alarme-securite',
  'alarme-securite': 'alarme-securite',
  antenniste: 'antenniste',
  antenne: 'antenniste',
  ascensoriste: 'ascensoriste',
  ascenseur: 'ascensoriste',
  diagnostiqueur: 'diagnostiqueur',
  diagnostic: 'diagnostiqueur',
  dpe: 'diagnostiqueur',
  geometre: 'geometre',
  'geometre-expert': 'geometre',
  desinsectisation: 'desinsectisation',
  desinsectiseur: 'desinsectisation',
  nuisibles: 'desinsectisation',
  deratisation: 'deratisation',
  deratiseur: 'deratisation',
  demenageur: 'demenageur',
  demenagement: 'demenageur',
  climaticien: 'climaticien',
}

// Pre-compute lookup maps once at module level
const serviceMap = new Map<string, string>()
for (const s of services) {
  serviceMap.set(
    s.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim(),
    s.slug
  )
}

const villeMap = new Map<string, string>()
for (const v of villes) {
  villeMap.set(
    v.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim(),
    v.slug
  )
}

const inseeMap = inseeCommunes as Record<string, { n: string }>
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

for (const entry of Object.values(inseeMap)) {
  const norm = entry.n
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
  if (!villeMap.has(norm)) {
    villeMap.set(norm, slugify(entry.n))
  }
}

// Arrondissement INSEE codes → main city slug
const arrondissementMap: Record<string, string> = {}
for (let i = 1; i <= 20; i++) arrondissementMap[`751${String(i).padStart(2, '0')}`] = 'paris'
for (let i = 1; i <= 16; i++) arrondissementMap[`132${String(i).padStart(2, '0')}`] = 'marseille'
for (let i = 81; i <= 89; i++) arrondissementMap[`693${String(i)}`] = 'lyon'

// Also add tradeContent keys to specialtyToSlug for broader coverage
for (const key of Object.keys(tradeContent)) {
  if (!specialtyToSlug[key]) {
    specialtyToSlug[key] = key
  }
}

/**
 * Dynamic API route for provider sitemaps.
 * Serves /sitemap/providers-{id}.xml via next.config.js rewrite.
 *
 * Why an API route instead of generateSitemaps()?
 * generateSitemaps() runs at build time. If Supabase is unavailable during
 * Vercel build (or noindex flags are wrong), provider sitemaps are omitted
 * from the build output → 404 at runtime. This API route runs at request time
 * with 1-hour CDN caching, guaranteeing availability.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const id = searchParams.get('id')

  if (!id || !/^\d+$/.test(id)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const batchIndex = parseInt(id, 10)
  const offset = batchIndex * PROVIDER_BATCH_SIZE

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const { logger } = await import('@/lib/logger')
    const supabase = createAdminClient()

    // Single-call RPC to bypass PostgREST max-rows pagination AND guarantee an
    // atomic snapshot (no race window between sub-batches).
    // Requires migration 457 (get_provider_sitemap + idx_providers_sitemap).
    // If rawFetched < PROVIDER_BATCH_SIZE unexpectedly, inspect Max rows in
    // Supabase → API settings (must stay ≥ PROVIDER_BATCH_SIZE).
    const t0 = Date.now()
    const { data: rpcRows, error } = await supabase.rpc('get_provider_sitemap', {
      p_offset: offset,
      p_limit: PROVIDER_BATCH_SIZE,
    })

    if (error) throw error
    const fetchMs = Date.now() - t0

    type Row = {
      id: string
      name: string | null
      slug: string | null
      stable_id: string | null
      specialty: string | null
      address_city: string | null
      updated_at: string | null
    }
    const allProviders = (rpcRows as Row[] | null) ?? []

    const urls = allProviders
      .filter((p): p is typeof p & { name: string; specialty: string; address_city: string } =>
        Boolean(p.name?.trim() && p.specialty?.trim() && p.address_city?.trim())
      )
      .map((p) => {
        const normalizedSpecialty = p.specialty
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
        const serviceSlug =
          serviceMap.get(normalizedSpecialty) || specialtyToSlug[p.specialty.toLowerCase()]
        const rawCity = p.address_city
        const isInsee = /^\d{4,5}$/.test(rawCity) || /^[0-9][A-Z0-9]\d{3}$/.test(rawCity)
        const arrondissementSlug = isInsee ? arrondissementMap[rawCity] : undefined
        const cityName = isInsee ? inseeMap[rawCity]?.n || rawCity : rawCity
        const normalizedCity = cityName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
        const locationSlug = arrondissementSlug || villeMap.get(normalizedCity)
        const publicId = p.slug || p.stable_id || p.id

        if (!serviceSlug || !locationSlug || !publicId) return null

        const lastmod = p.updated_at
          ? new Date(p.updated_at).toISOString().split('T')[0]
          : undefined
        const loc = escapeXml(`${SITE_URL}/services/${serviceSlug}/${locationSlug}/${publicId}`)
        return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>monthly</changefreq><priority>0.3</priority></url>`
      })
      .filter((entry): entry is string => entry !== null)

    // warn level is intentional: production logger suppresses info, and this
    // metric must stay visible so a regression (e.g. db-max-rows reverted to
    // 1000) surfaces in Vercel runtime logs without a dashboard lookup.
    logger.warn('[metric] sitemap-providers emitted', {
      batchIndex,
      rawFetched: allProviders.length,
      urlsEmitted: urls.length,
      fetchMs,
    })

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
    ].join('\n')

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch {
    // Return empty but valid sitemap on error
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>'
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=60',
      },
    })
  }
}
