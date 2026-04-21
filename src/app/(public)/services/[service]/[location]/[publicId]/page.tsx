import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  getProviderByStableId,
  getProviderBySlug,
  getProviderById,
  getServiceBySlug,
  getLocationBySlug,
  getProviderCountByServiceAndLocation,
} from '@/lib/supabase'
import { getArtisanUrl } from '@/lib/utils'
import { resolveProviderCity } from '@/lib/insee-resolver'
import ArtisanPageClient from '@/components/artisan/ArtisanPageClient'
import ArtisanInternalLinks from '@/components/artisan/ArtisanInternalLinks'
import { ArtisanSchema } from '@/components/artisan/ArtisanSchema'
import { Review } from '@/components/artisan'
import type { LegacyArtisan } from '@/types/legacy'
import type { Service, Location } from '@/types'
import { getServiceImageForContext } from '@/lib/data/images'
import { getRegionPreposition } from '@/lib/geo-strings'
import { cleanAdemeText } from '@/lib/descriptions/retrieval'
import { getCeeOpsForRgeService } from '@/lib/rge/service-guides-map'

/** Raw provider row from select('*') — includes all DB columns the mapper reads */
interface ProviderRecord {
  id: string
  stable_id?: string | null
  slug?: string | null
  name?: string | null
  business_name?: string | null
  first_name?: string | null
  last_name?: string | null
  specialty?: string | null
  description?: string | null
  bio?: string | null
  address_street?: string | null
  address_city?: string | null
  address_postal_code?: string | null
  address_region?: string | null
  is_verified?: boolean | null
  is_active?: boolean | null
  is_center?: boolean | null
  noindex?: boolean | null
  rating_average?: number | null
  average_rating?: number | null
  review_count?: number | null
  team_size?: number | null
  available_24h?: boolean | null
  accepts_new_clients?: boolean | null
  free_quote?: boolean | null
  phone?: string | null
  phone_secondary?: string | null
  email?: string | null
  website?: string | null
  siret?: string | null
  legal_form?: string | null
  legal_form_code?: string | null
  creation_date?: string | null
  latitude?: number | null
  longitude?: number | null
  opening_hours?: Record<string, { ouvert: boolean; debut: string; fin: string }> | null
  intervention_radius_km?: number | null
  services_offered?: string[] | null
  service_prices?: Array<{
    name: string
    description?: string
    price: string
    duration?: string
  }> | null
  faq?: Array<{ question: string; answer: string }> | null
  created_at?: string | null
  updated_at?: string | null
  user_id?: string | null
  // RGE ADEME (migration 380)
  rge_qualifications?: Array<{
    code: string
    nom: string
    organisme: string
    domaine: string | null
    meta_domaine: string | null
    date_debut: string
    date_fin: string
    url: string | null
  }> | null
  rge_valid_until?: string | null
  rge_organismes?: string[] | null
  rge_source_url?: string | null
}
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { hashCode } from '@/lib/seo/location-content'
import { getQuartierBySlug, services as staticServicesList, villes } from '@/lib/data/france'
import ServiceQuartierPage from './ServiceQuartierPage'

export const revalidate = 86400

// Pre-render top service×city×quartier combos for ISR warming
const TOP_CITIES_QUARTIER = 3
export function generateStaticParams() {
  const topCities = villes.slice(0, TOP_CITIES_QUARTIER)
  // Pre-render top 10 services × 30 cities × quartiers for better ISR coverage
  const topServices = staticServicesList.slice(0, 5)
  return topServices.flatMap((s) =>
    topCities.flatMap((v) => {
      const quartiers = v.quartiers || []
      return quartiers.map((q) => ({
        service: s.slug,
        location: v.slug,
        publicId: q
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      }))
    })
  )
}
export const dynamicParams = true

interface PageProps {
  params: Promise<{
    service: string
    location: string
    publicId: string
  }>
}

// Convert provider data to LegacyArtisan format (sub-components still read legacy fields)
function convertToArtisan(
  provider: ProviderRecord,
  service: Service | null,
  location: Location | null,
  serviceSlug: string
): LegacyArtisan {
  const specialty = service?.name || provider.specialty || 'Artisan'
  const city = location?.name || provider.address_city || ''
  const name = provider.name || provider.business_name || 'Artisan'

  // Generate description if missing or too short (WITHOUT fake ratings).
  //
  // Priorité (ordre) :
  //   1. existingDesc en DB (contenu éditorial LLM ou saisi par l'artisan)
  //   2. Si provider RGE sans description publiée : bloc factuel ADEME-grounded
  //      (pas de texte boilerplate hallucinant à la Helpful Content Update).
  //      Les ~3 700 judged_fail en attente de Sonnet regen tombent ici.
  //   3. Fallback générique (derniers cas : non-RGE sans description).
  const existingDesc = provider.description || provider.bio
  const hasRgeQualifs =
    Array.isArray(provider.rge_qualifications) && provider.rge_qualifications.length > 0
  const description =
    existingDesc && existingDesc.length > 50
      ? existingDesc
      : hasRgeQualifs
        ? generateRgeMinimalDescription(
            name,
            city || 'leur région',
            provider.rge_qualifications as Array<{
              nom?: string | null
              organisme?: string | null
            }>,
            provider.rge_valid_until ?? null
          )
        : generateDescription(name, specialty, city || 'votre région', provider, serviceSlug)

  // Only show member_since if it's a meaningful past year.
  // Providers imported in the current year (e.g. 2026 bulk import) would show
  // "Inscrit depuis 2026" which is not informative.
  const memberYear = provider.created_at ? new Date(provider.created_at).getFullYear() : null
  const currentYear = new Date().getFullYear()

  return {
    id: provider.id,
    stable_id: provider.stable_id || undefined,
    slug: provider.slug || undefined,
    business_name: name,
    first_name: provider.first_name || null,
    last_name: provider.last_name || null,
    city: city,
    postal_code: String(location?.postal_code || provider.address_postal_code || '').replace(
      /\.0$/,
      ''
    ),
    address: provider.address_street || '',
    department: location?.department_name || undefined,
    department_code: location?.department_code || undefined,
    region: location?.region_name || undefined,
    specialty: specialty,
    specialty_slug: serviceSlug,
    city_slug: location?.slug || undefined,
    description: description,
    bio: provider.bio || undefined,
    average_rating: provider.rating_average || provider.average_rating || 0,
    review_count: provider.review_count || 0,
    is_verified: provider.is_verified || false,
    is_center: provider.is_center || false,
    team_size: provider.team_size || undefined,
    services: provider.services_offered || [],
    service_prices:
      provider.service_prices && provider.service_prices.length > 0
        ? provider.service_prices.map((sp) => ({
            name: sp.name,
            description: sp.description || '',
            price: sp.price,
            duration: sp.duration,
          }))
        : [],
    prices_are_estimated: false,
    accepts_new_clients: provider.accepts_new_clients === true ? true : undefined,
    free_quote: provider.free_quote === true ? true : undefined,
    available_24h: provider.available_24h || false,
    phone_secondary: provider.phone_secondary || undefined,
    opening_hours:
      provider.opening_hours && Object.keys(provider.opening_hours).length > 0
        ? provider.opening_hours
        : undefined,
    intervention_radius_km: provider.intervention_radius_km || undefined,
    member_since: memberYear && memberYear < currentYear ? memberYear.toString() : undefined,
    created_at: provider.created_at || undefined,
    siret: provider.siret || undefined,
    creation_date: provider.creation_date || undefined,
    legal_form: provider.legal_form_code || provider.legal_form || undefined,
    phone: provider.phone || undefined,
    email: provider.email || undefined,
    website: provider.website || undefined,
    latitude: provider.latitude || undefined,
    longitude: provider.longitude || undefined,
    faq: provider.faq && provider.faq.length > 0 ? provider.faq : undefined,
    updated_at: provider.updated_at || undefined,
    // RGE ADEME — certifications officielles issues du dataset data.gouv.fr
    // liste-des-entreprises-rge-2 (migration 380, sync cron hebdo).
    // Indispensable pour que <ArtisanHero> → <RgeBadge> affiche le badge.
    rge_qualifications: provider.rge_qualifications ?? null,
    rge_valid_until: provider.rge_valid_until ?? null,
    rge_organismes: provider.rge_organismes ?? null,
    rge_source_url: provider.rge_source_url ?? null,
    // Legacy fields — undefined at runtime (columns dropped), kept for sub-component compat
    // Will be removed when each sub-component migrates to v2 Artisan type
  }
}

// RGE-grounded minimal description — fallback pour les providers RGE dont
// la description LLM n'a pas encore été publiée (judged_fail en attente
// Sonnet regen, ou batch pas encore traité).
//
// Pourquoi cette fonction existe : avant 2026-04-20 le seul fallback était
// `generateDescription()` qui crache un texte boilerplate auto-généré
// (même structure intro + CTA + "Informations basées sur..."). Pour Google
// Helpful Content Update (sections 4.6.5 et 4.6.6 des guidelines
// évaluateurs), ce pattern = AI-generated scale content = spam signal.
//
// Ce qu'on fait à la place : ancrer exclusivement sur les données ADEME
// réelles (qualifications nominatives, date de validité, organismes
// certificateurs). Le contenu varie naturellement d'une fiche à l'autre
// car les qualifications varient d'un artisan RGE à l'autre (pas de
// template uniforme). Zéro hallucination, zéro superlatif.
function generateRgeMinimalDescription(
  name: string,
  city: string,
  qualifications: Array<{ nom?: string | null; organisme?: string | null }>,
  validUntil: string | null
): string {
  // Les labels bruts ADEME arrivent avec des accents droppés ("gnrateur
  // photovoltaque", "pompe  chaleur"). cleanAdemeText restaure les accents
  // avant affichage public — sinon Google et utilisateur voient du texte
  // cassé alors que la donnée est correcte.
  const qualNames = qualifications
    .map((q) => cleanAdemeText((q?.nom ?? '').trim()))
    .filter((n) => n.length > 0)
    .slice(0, 5)
  const organismes = Array.from(
    new Set(
      qualifications
        .map((q) => cleanAdemeText((q?.organisme ?? '').trim()))
        .filter((o) => o.length > 0)
    )
  ).slice(0, 3)
  const validUntilFr = (() => {
    if (!validUntil) return null
    const d = new Date(validUntil)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  })()

  const parts: string[] = []
  parts.push(
    `${name} est un artisan certifié RGE (Reconnu Garant de l'Environnement) basé à ${city}.`
  )
  if (qualNames.length > 0) {
    parts.push(`Qualifications RGE actives : ${qualNames.join(' ; ')}.`)
  }
  if (organismes.length > 0) {
    parts.push(
      `Certification${organismes.length > 1 ? 's délivrées' : ' délivrée'} par ${organismes.join(', ')}.`
    )
  }
  if (validUntilFr) {
    parts.push(`Validité confirmée jusqu'au ${validUntilFr}.`)
  }
  parts.push(
    `Cette qualification RGE permet aux clients de ${name} de solliciter les dispositifs d'aide publique à la rénovation énergétique, notamment MaPrimeRénov' et les Certificats d'Économies d'Énergie (CEE), sous réserve d'éligibilité.`
  )
  parts.push(
    `Les données de qualification proviennent de l'annuaire officiel ADEME publié sur france-renov.gouv.fr, synchronisé chaque semaine.`
  )
  return parts.join(' ')
}

// Generate a rich, unique description based on all available provider data
function generateDescription(
  name: string,
  specialty: string,
  city: string,
  provider?: ProviderRecord | null,
  serviceSlug?: string
): string {
  const spe = specialty.toLowerCase()
  const parts: string[] = []

  // Hash-varied intro templates to reduce duplicate content across similar profiles
  const introKey = `desc-${provider?.stable_id || provider?.slug || provider?.id || name}-${serviceSlug || spe}`
  const introHash = hashCode(introKey)
  const introTemplates = [
    `${name} est un professionnel spécialisé en ${spe} à ${city}.`,
    `Basé à ${city}, ${name} intervient en ${spe} pour les particuliers et professionnels.`,
    `${name} propose ses services de ${spe} à ${city} et ses environs.`,
    `Professionnel en ${spe}, ${name} exerce à ${city} auprès d'une clientèle locale.`,
    `À ${city}, ${name} met son expertise en ${spe} au service de vos projets.`,
  ]
  parts.push(introTemplates[introHash % introTemplates.length])

  // Company history and experience
  if (provider?.creation_date) {
    const year = new Date(provider.creation_date).getFullYear()
    const age = new Date().getFullYear() - year
    if (age > 1) {
      parts.push(
        `Fondée en ${year}, l'entreprise bénéficie de plus de ${age} ans de présence dans la région.`
      )
    }
  }

  // Verification
  if (provider?.siret) {
    parts.push(
      `Entreprise immatriculée et référencée (SIRET ${provider.siret.substring(0, 9)}...).`
    )
  }

  // Legal form
  if (provider?.legal_form_code || provider?.legal_form) {
    parts.push(`Forme juridique : ${provider.legal_form_code || provider.legal_form}.`)
  }

  // Rating
  const rating = provider?.rating_average || provider?.average_rating
  if (rating && rating >= 4) {
    parts.push(`Noté ${Number(rating).toFixed(1)}/5 par ses clients.`)
  }

  // Service-specific expertise (programmatic based on specialty slug)
  const serviceDescriptions: Record<string, string> = {
    plombier: `Les prestations couvrent l'installation, la réparation et l'entretien de plomberie : robinetterie, canalisations, sanitaires, chauffe-eau et dépannage de fuites.`,
    electricien: `Les interventions incluent la mise aux normes électriques, l'installation de tableaux, le câblage, le dépannage et la pose d'éclairage intérieur et extérieur.`,
    chauffagiste: `Spécialiste en systèmes de chauffage : installation, entretien et dépannage de chaudières, radiateurs, planchers chauffants et pompes à chaleur.`,
    serrurier: `Interventions en serrurerie : ouverture de portes, changement de serrures, blindage, installation de systèmes de sécurité et reproduction de clés.`,
    menuisier: `Travaux de menuiserie intérieure et extérieure : fabrication et pose de portes, fenêtres, placards, escaliers et aménagements sur mesure.`,
    couvreur: `Travaux de couverture : réfection de toiture, pose de tuiles et ardoises, zinguerie, étanchéité et isolation de combles.`,
    macon: `Travaux de maçonnerie : construction, rénovation, extension, dalles, murs porteurs, fondations et ravalement de façade.`,
    carreleur: `Pose de carrelage et faïence : sols, murs, douches à l'italienne, terrasses et mosaïques pour tous types de projets.`,
    'peintre-en-batiment': `Travaux de peinture intérieure et extérieure : préparation des surfaces, enduits, peinture décorative et ravalement.`,
    climaticien: `Installation et maintenance de climatisation : pose de splits, gainable, réversible et contrats d'entretien annuel.`,
  }
  const svcDesc = serviceDescriptions[serviceSlug || '']
  if (svcDesc) {
    parts.push(svcDesc)
  }

  // Zone d'intervention
  parts.push(`Zone d'intervention : ${city} et communes environnantes.`)

  // CTA
  parts.push(`Contactez ${name} pour obtenir un devis gratuit et personnalisé, sans engagement.`)

  // Freshness / E-E-A-T: signal that content is data-derived
  parts.push('Informations basées sur les données professionnelles déclarées.')

  return parts.join(' ')
}

/** Row shape from the similar-artisans lightweight query */
interface SimilarProviderRow {
  id: string
  stable_id: string | null
  slug: string | null
  name: string | null
  specialty: string | null
  rating_average: number | null
  review_count: number | null
  address_city: string | null
  is_verified: boolean | null
  // Requis pour propager rel="nofollow" dans ArtisanSimilar et concentrer
  // le PageRank sur les fiches RGE visibles (noindex=false).
  noindex: boolean | null
}

/** Row shape from the reviews query */
interface ReviewRow {
  id: string
  rating: number
  content: string | null
  created_at: string
  author_name: string | null
  has_media: boolean | null
  reply: string | null
  reply_date: string | null
}

// Fetch similar artisans (same specialty, same department)
async function getSimilarArtisans(providerId: string, specialty: string, postalCode?: string) {
  try {
    const { supabase } = await import('@/lib/supabase')
    const deptCode = postalCode && postalCode.length >= 2 ? postalCode.substring(0, 2) : null

    let query = supabase
      .from('providers')
      .select(
        'id, stable_id, slug, name, specialty, rating_average, review_count, address_city, is_verified, phone, noindex'
      )
      .eq('is_active', true)
      .neq('id', providerId)
      .order('phone', { ascending: false, nullsFirst: false })
      .order('rating_average', { ascending: false, nullsFirst: false })
      .limit(8)

    // Match exact specialty (fast — uses index)
    if (specialty) {
      query = query.eq('specialty', specialty.toLowerCase())
    }

    // Prefer same department
    if (deptCode) {
      query = query.like('address_postal_code', `${deptCode}%`)
    }

    const { data } = await query

    return ((data || []) as SimilarProviderRow[]).map((p) => {
      const resolved = resolveProviderCity(p)
      return {
        id: p.id,
        stable_id: p.stable_id || undefined,
        slug: p.slug || undefined,
        name: p.name || 'Artisan',
        specialty: p.specialty || specialty,
        rating: p.rating_average || 0,
        reviews: p.review_count || 0,
        city: resolved.address_city || '',
        is_verified: p.is_verified || false,
        noindex: p.noindex ?? false,
      }
    })
  } catch {
    return []
  }
}

// Fetch reviews for provider (only real reviews from database)
async function getProviderReviews(providerId: string, serviceName?: string): Promise<Review[]> {
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: reviews } = await supabase
      .from('reviews')
      .select(
        `
        id,
        rating,
        content,
        created_at,
        author_name,
        has_media,
        reply,
        reply_date
      `
      )
      .eq('provider_id', providerId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(100) // Increased limit to show more reviews

    if (reviews && reviews.length > 0) {
      return (reviews as ReviewRow[]).map((r) => ({
        id: r.id,
        author: r.author_name || 'Client',
        rating: r.rating,
        date: new Date(r.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        comment: r.content || '',
        dateISO: r.created_at ? r.created_at.split('T')[0] : undefined,
        service: serviceName || '',
        verified: false,
        hasPhoto: r.has_media || false,
        artisan_response: r.reply || null,
        artisan_responded_at: r.reply_date || null,
      }))
    }

    // No fake reviews! Return empty array if no real reviews in database
    return []
  } catch {
    // On error, return empty array (no fake reviews!)
    return []
  }
}

function truncateTitle(title: string, maxLen = 58): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug, location: locationSlug, publicId } = await params

  // ─── QUARTIER DETECTION ──────────────────────────────────
  const quartierMatch = getQuartierBySlug(locationSlug, publicId)
  if (quartierMatch) {
    const { ville, quartierName } = quartierMatch
    const staticSvc = staticServicesList.find((s) => s.slug === serviceSlug)
    if (!staticSvc) return { title: 'Non trouvé', robots: { index: false, follow: false } }

    const svcLower = staticSvc.name.toLowerCase()
    let providerCount = 0
    try {
      providerCount = await getProviderCountByServiceAndLocation(serviceSlug, locationSlug)
    } catch {
      /* best-effort */
    }
    const hasProviders = providerCount > 0

    const tHash = Math.abs(hashCode(`sq-title-${serviceSlug}-${locationSlug}-${publicId}`))
    const titleTemplates = hasProviders
      ? [
          `${staticSvc.name} à ${quartierName}, ${ville.name} — ${providerCount} pros`,
          `${providerCount} ${svcLower}s à ${quartierName} (${ville.name})`,
          `${staticSvc.name} ${quartierName} ${ville.name} : devis gratuit`,
          `Trouver un ${svcLower} à ${quartierName}, ${ville.name}`,
        ]
      : [
          `${staticSvc.name} à ${quartierName}, ${ville.name} — Devis gratuit`,
          `${svcLower} à ${quartierName} (${ville.name}) : artisans vérifiés`,
          `Trouver un ${svcLower} à ${quartierName}, ${ville.name}`,
        ]
    const title = truncateTitle(titleTemplates[tHash % titleTemplates.length])

    const dHash = Math.abs(hashCode(`sq-desc-${serviceSlug}-${locationSlug}-${publicId}`))
    const descTemplates = hasProviders
      ? [
          `${providerCount} ${svcLower}s référencés à ${quartierName}, ${ville.name} (${ville.departementCode}). Devis gratuit ${getRegionPreposition(ville.region)}.`,
          `Comparez les ${svcLower}s à ${quartierName} (${ville.name}). ${providerCount} artisans vérifiés SIREN. Devis gratuit.`,
        ]
      : [
          `Trouvez un ${svcLower} qualifié à ${quartierName}, ${ville.name} (${ville.departementCode}). Artisans vérifiés, devis gratuit.`,
          `${svcLower} à ${quartierName} (${ville.name}) : annuaire d'artisans référencés ${getRegionPreposition(ville.region)}. Devis gratuit.`,
        ]
    const description = descTemplates[dHash % descTemplates.length]

    return {
      title,
      description,
      // All service×quartier pages indexed — rich content exists even with few providers
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'fr_FR',
        url: `${SITE_URL}/services/${serviceSlug}/${locationSlug}/${publicId}`,
        images: [
          {
            url: getServiceImageForContext(serviceSlug, locationSlug).src,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [getServiceImageForContext(serviceSlug, locationSlug).src],
      },
      alternates: getAlternates(`/services/${serviceSlug}/${locationSlug}/${publicId}`),
    }
  }

  // ─── PROVIDER DETAIL (existing logic) ────────────────────
  try {
    // Parallel lookups to minimize total latency
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(publicId)
    const [stableIdResult, slugResult, service] = await Promise.all([
      (isUuid ? getProviderById(publicId) : getProviderByStableId(publicId)).catch(() => null),
      (isUuid ? Promise.resolve(null) : getProviderBySlug(publicId)).catch(() => null),
      getServiceBySlug(serviceSlug).catch(() => null),
    ])
    const rawProvider = stableIdResult || slugResult
    if (!rawProvider || (rawProvider as unknown as ProviderRecord).is_active === false) {
      notFound()
    }

    // Cast to access DB columns that TS can't infer from select('*')
    const provider = rawProvider as unknown as ProviderRecord

    // Resolve provider's real city (may be INSEE code in DB)
    const resolved = resolveProviderCity(provider)
    const realCity = resolved.address_city || provider.address_city || ''
    const displayName = provider.name || provider.business_name || 'Artisan'
    const serviceName = service?.name || 'Artisan'

    // Compute canonical from provider's REAL data, not URL segments
    const canonicalPath = getArtisanUrl({
      stable_id: provider.stable_id,
      slug: provider.slug,
      specialty: provider.specialty,
      city: realCity,
    })
    const ratingStr =
      provider.rating_average && Number(provider.rating_average) >= 1
        ? ` ${Number(provider.rating_average).toFixed(1)}★`
        : ''
    const title = truncateTitle(`${displayName} - ${serviceName} à ${realCity}${ratingStr}`)

    // Build rich meta description (~150-160 chars) for optimal Google SERP display
    // Structure: Nom, métier à ville — détails (note, avis, zone). Devis gratuit.
    const svcLower = serviceName.toLowerCase()
    const rating = provider.rating_average ? Number(provider.rating_average) : 0
    const reviewCount = provider.review_count || 0

    // Core: "Jean Dupont, plombier à Lyon"
    let desc = `${displayName}, ${svcLower} à ${realCity}`

    // Add availability / intervention details
    if (provider.available_24h) {
      desc += ' — Intervention 7j/7'
    } else if (provider.intervention_radius_km && provider.intervention_radius_km > 0) {
      desc += ` — Intervention dans un rayon de ${provider.intervention_radius_km} km`
    } else {
      desc += ` et ses environs`
    }
    desc += '.'

    // Add rating + review count if available
    if (rating >= 1 && reviewCount > 0) {
      desc += ` Note ${rating.toFixed(1)}/5 sur ${reviewCount} avis.`
    } else if (rating >= 1) {
      desc += ` Note ${rating.toFixed(1)}/5.`
    }

    // Add SIRET verified if available
    if (provider.siret) {
      desc += ' SIRET vérifié.'
    }

    // Add verified badge if applicable (and no SIRET already shown)
    if (provider.is_verified && !provider.siret) {
      desc += ' Artisan vérifié.'
    }

    // Always end with CTA
    desc += ' Devis gratuit en ligne.'

    // If description is still short (<140 chars), pad with service-specific context
    if (desc.length < 140) {
      desc += ` Comparez les ${svcLower}s à ${realCity} et demandez un devis personnalisé sans engagement.`
    }

    // Trim to 160 chars max (clean word boundary)
    const description = desc.length > 160 ? desc.slice(0, 159).replace(/\s+\S*$/, '') + '…' : desc

    // Noindex only if provider is explicitly flagged by admin.
    // Non-canonical URLs are handled by redirect() in the page component + alternates.canonical.
    // Previously also checked isWrongUrl, but this caused 710+ false noindex pages because
    // the sitemap used stable_id while getArtisanUrl preferred slug.
    const shouldNoindex = provider.noindex === true

    const serviceImage = getServiceImageForContext(serviceSlug, locationSlug)
    const ogAlt = `${displayName} - ${serviceName} à ${realCity}`
    const ogImage = serviceImage.src

    return {
      title,
      description,
      robots: shouldNoindex
        ? { index: false, follow: true }
        : {
            index: true,
            follow: true,
            'max-snippet': -1 as const,
            'max-image-preview': 'large' as const,
            'max-video-preview': -1 as const,
          },
      openGraph: {
        title,
        description,
        type: 'profile',
        locale: 'fr_FR',
        url: `${SITE_URL}${canonicalPath}`,
        images: [{ url: ogImage, width: 1200, height: 630, alt: ogAlt }],
      },
      twitter: {
        card: 'summary_large_image' as const,
        title,
        description,
        images: [ogImage],
      },
      alternates: getAlternates(canonicalPath),
    }
  } catch {
    // Don't noindex on transient DB errors — ISR will retry and Google will recrawl.
    // Returning index:true prevents permanent noindex from temporary failures.
    return { title: 'Artisan non trouvé' }
  }
}

export default async function ProviderPage({ params }: PageProps) {
  const { service: serviceSlug, location: locationSlug, publicId } = await params

  // ─── QUARTIER DETECTION ──────────────────────────────────
  const quartierMatch = getQuartierBySlug(locationSlug, publicId)
  if (quartierMatch) {
    return (
      <ServiceQuartierPage
        serviceSlug={serviceSlug}
        locationSlug={locationSlug}
        quartierSlug={publicId}
      />
    )
  }

  // ─── PROVIDER DETAIL (existing logic) ────────────────────
  // Run ALL lookups in parallel to minimize total latency
  let provider: ProviderRecord | null = null
  let service: Service | null = null
  let location: Location | null = null

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(publicId)
    const [stableIdResult, slugResult, svcResult, locResult] = await Promise.all([
      (isUuid ? getProviderById(publicId) : getProviderByStableId(publicId)).catch(() => null),
      (isUuid ? Promise.resolve(null) : getProviderBySlug(publicId)).catch(() => null),
      getServiceBySlug(serviceSlug).catch(() => null),
      getLocationBySlug(locationSlug).catch(() => null),
    ])
    provider = (stableIdResult || slugResult) as ProviderRecord | null
    service = svcResult as Service | null
    location = locResult as Location | null

    // Fallback: if no match, try a deduped variant of the publicId.
    // Migration 378 rewrote slugs to dedupe consecutive identical tokens
    // (e.g. "brandon-marx-marx-marx-plomberie-..." → "brandon-marx-plomberie-...").
    // Google may still serve the old URL; this retry keeps it alive and the
    // canonical redirect below will then 307 the visitor to the clean URL.
    if (!provider && !isUuid) {
      const dedupedPublicId = publicId
        .split('-')
        .filter((w, i, arr) => w !== arr[i - 1])
        .join('-')
      if (dedupedPublicId !== publicId && dedupedPublicId.length > 0) {
        const retryResult = await getProviderBySlug(dedupedPublicId).catch(() => null)
        if (retryResult) provider = retryResult as ProviderRecord
      }
    }
  } catch {
    // Graceful degradation
  }

  if (!provider || provider.is_active === false) {
    notFound()
  }

  // Canonical redirect: if the URL segments don't match the canonical slugs, redirect
  // Use provider's REAL city (resolved from INSEE if needed), NOT the URL's location
  const resolvedProvider = resolveProviderCity(provider)
  const canonicalUrl = getArtisanUrl({
    stable_id: provider.stable_id,
    slug: provider.slug,
    specialty: provider.specialty,
    city: resolvedProvider.address_city || provider.address_city,
  })
  const currentPath = `/services/${serviceSlug}/${locationSlug}/${publicId}`
  // Only redirect if canonical URL has a valid ID segment (avoid redirect to hub page)
  const canonicalId = canonicalUrl.split('/').pop()
  if (canonicalId && currentPath !== canonicalUrl) {
    redirect(canonicalUrl)
  }

  // Convert to Artisan format
  const artisan = convertToArtisan(provider, service, location, serviceSlug)

  // Fetch reviews and similar artisans in parallel (graceful degradation)
  let reviews: Review[] = []
  let similarArtisans: Awaited<ReturnType<typeof getSimilarArtisans>> = []
  try {
    ;[reviews, similarArtisans] = await Promise.all([
      getProviderReviews(provider.id, service?.name || artisan.specialty),
      getSimilarArtisans(provider.id, artisan.specialty, artisan.postal_code),
    ])
  } catch {
    // Graceful degradation — page renders without reviews/similar artisans
  }

  const isClaimed = !!provider.user_id

  return (
    <>
      {/* Preload hints */}
      <link rel="dns-prefetch" href="//umjmbdbwcsxrvfqktiui.supabase.co" />

      {/* JSON-LD structured data — rendered SERVER-SIDE for immediate bot visibility */}
      <ArtisanSchema artisan={artisan} isClaimed={isClaimed} />

      <ArtisanPageClient
        initialArtisan={artisan}
        initialReviews={reviews}
        artisanId={provider.id}
        similarArtisans={similarArtisans}
        isClaimed={isClaimed}
        hasSiret={!!provider.siret}
      />

      {/* ─── DEVIS CTA BANNER — only for claimed profiles ───── */}
      {isClaimed && (
        <section className="py-8 bg-gradient-to-r from-primary-50 to-sand-100 border-t border-b border-primary-200/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-charcoal-900 font-heading">
                  Besoin de ce professionnel ?
                </h2>
                <p className="text-sm text-charcoal-600 mt-1">
                  Demandez un devis gratuit et sans engagement.
                </p>
              </div>
              <Link
                href={`/devis/${serviceSlug}/${locationSlug}`}
                className="inline-flex items-center gap-2 bg-primary-400 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl shadow-cta hover:shadow-lg transition-all whitespace-nowrap"
              >
                Obtenir mon devis gratuit
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Lien retour vers le listing service+location (maillage bidirectionnel) */}
      <section className="py-6 bg-white border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/services/${serviceSlug}/${locationSlug}`}
            className="inline-flex items-center gap-2 px-5 py-3 bg-sand-50 hover:bg-primary-50 border border-sand-200 hover:border-primary-200 rounded-xl text-sm font-medium text-charcoal-700 hover:text-primary-600 transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voir tous les {(service?.name || artisan.specialty).toLowerCase()}s à {artisan.city}
          </Link>
        </div>
      </section>

      {/* Internal Links — Maillage interne (SEO) */}
      <ArtisanInternalLinks
        serviceSlug={serviceSlug}
        locationSlug={locationSlug}
        serviceName={service?.name || artisan.specialty}
        cityName={artisan.city}
        regionName={location?.region_name}
        departmentName={location?.department_name}
        departmentCode={location?.department_code}
      />

      {/* Primes CEE éligibles — maillage RGE→CEE, affiché uniquement si l'artisan
          a des qualifications RGE qui permettent au client de toucher des aides. */}
      {(() => {
        const artisanHasRgeQualifs =
          Array.isArray(provider.rge_qualifications) && provider.rge_qualifications.length > 0
        if (!artisanHasRgeQualifs) return null
        const ceeOps = getCeeOpsForRgeService(serviceSlug).slice(0, 6)
        if (!ceeOps.length) return null
        return (
          <section className="py-8 bg-emerald-50/40 border-t border-emerald-200/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 mb-2">
                Primes CEE éligibles avec {artisan.business_name}
              </h2>
              <p className="text-sm text-charcoal-600 mb-5 max-w-3xl">
                Votre artisan RGE vous permet de cumuler ces primes CEE 2026 avec MaPrimeRénov' et
                la TVA 5,5 % — cliquez pour consulter le guide et le barème officiel.
              </p>
              <ul className="flex flex-wrap gap-2">
                {ceeOps.map((op) => (
                  <li key={op.code}>
                    <Link
                      href={`/cee/${op.code.toLowerCase()}/guide`}
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white hover:border-emerald-500 hover:bg-emerald-100 transition px-3 py-2 text-sm"
                    >
                      <span className="font-bold text-emerald-900">{op.code}</span>
                      <span className="text-charcoal-700">{op.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link
                  href={`/rge/${serviceSlug}`}
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                >
                  Tous les artisans RGE {(service?.name || artisan.specialty).toLowerCase()} →
                </Link>
              </div>
            </div>
          </section>
        )
      })()}

      {/* ─── EDITORIAL CREDIBILITY ──────────────────────────── */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand-50 rounded-2xl border border-sand-200 p-6">
            <h3 className="text-sm font-semibold text-charcoal-700 mb-2">
              Informations sur ce profil
            </h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Les informations de ce profil sont fournies par l'artisan et vérifiées via l'API
              SIRENE (INSEE). Les tarifs affichés, lorsqu'ils sont renseignés, sont indicatifs et
              propres à cet artisan. Les avis sont collectés auprès de clients ayant fait appel à
              ses services. ServicesArtisans est un annuaire indépendant — nous facilitons la mise
              en relation mais ne garantissons pas les prestations.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Safety Links (E-E-A-T) */}
      <section className="py-8 bg-sand-50 border-t border-sand-200">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-sm font-semibold text-charcoal-500 uppercase tracking-wide mb-3">
            Confiance &amp; Sécurité
          </h2>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link
              href="/notre-processus-de-verification"
              className="text-primary-400 hover:text-primary-600"
            >
              Comment nous référençons les artisans
            </Link>
            <Link href="/politique-avis" className="text-primary-400 hover:text-primary-600">
              Notre politique des avis
            </Link>
            <Link href="/mediation" className="text-primary-400 hover:text-primary-600">
              Service de médiation
            </Link>
          </nav>
        </div>
      </section>
    </>
  )
}
