import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  MapPin,
  ArrowRight,
  Shield,
  Clock,
  ChevronRight,
  Wrench,
  HelpCircle,
  Euro,
  CheckCircle,
  Building2,
  Users,
  Globe,
  Thermometer,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getServiceSchema } from '@/lib/seo/jsonld'
import {
  regions,
  getRegionBySlug,
  services as allServices,
  getVillesByDepartement,
  parsePopulation,
} from '@/lib/data/france'
import { getTradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { generateRegionContent, hashCode, getRegionalMultiplier } from '@/lib/seo/location-content'
import { selectFittingTitle } from '@/lib/seo/title-selector'
import { getServiceImageForContext } from '@/lib/data/images'
import PriceTable from '@/components/seo/PriceTable'
import GeoPageCTA from '@/components/conversion/GeoPageCTA'
import { SocialProofBanner } from '@/components/SocialProofBanner'
import EnBrefBox from '@/components/seo/EnBrefBox'
import SnippetBaitSummary from '@/components/seo/SnippetBaitSummary'
import TldrBlock from '@/components/flagship/TldrBlock'
import { relatedServices } from '@/lib/constants/navigation'
import { getRegionPreposition, getRegionArticle } from '@/lib/geo-strings'

export function generateStaticParams() {
  // Pre-render top 5 services per region (16 × 5 = 80 pages) — rest via ISR
  // Pivot full RGE 2026-05-03 : serrurier retiré (commodity hors RGE) —
  // remplacé par pompe-a-chaleur (gravity hub RGE).
  const topServices = ['plombier', 'electricien', 'chauffagiste', 'couvreur', 'pompe-a-chaleur']
  return regions.flatMap((r) => topServices.map((s) => ({ region: r.slug, service: s })))
}

export const dynamicParams = true
export const revalidate = 86400

interface PageProps {
  params: Promise<{ region: string; service: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region: regionSlug, service: serviceSlug } = await params
  const region = getRegionBySlug(regionSlug)
  const trade = getTradeContent(serviceSlug)
  if (!region || !trade) notFound()

  const multiplier = getRegionalMultiplier(region.name)
  const minPrice = Math.round(trade.priceRange.min * multiplier)
  const maxPrice = Math.round(trade.priceRange.max * multiplier)
  const deptCount = region.departments.length

  const titleHash = Math.abs(hashCode(`title-region-svc-${regionSlug}-${serviceSlug}`))
  // Sprint 2 — variants gradués + first-fitting via title-selector partagé.
  const titleTemplates = [
    `${trade.name} RGE ${region.name} 2026 — Devis Gratuit 24h`,
    `${trade.name} ${region.name} 2026 — ${deptCount} départements`,
    `${trade.name} RGE ${getRegionPreposition(region.name)} 2026 : pros certifiés`,
    `${trade.name} RGE ${region.name} 2026 — Tarifs + Devis Gratuit`,
    `${trade.name} ${region.name} 2026 : comparez les pros RGE`,
    `${trade.name} RGE ${region.name} 2026`,
    `${trade.name} ${region.name}`,
  ]
  // maxLen 46 raw : +19 char brand suffix = ≤ 65 char rendu (Google SERP cutoff).
  const title = selectFittingTitle(titleTemplates, titleHash, 46)

  const descHash = Math.abs(hashCode(`desc-region-svc-${regionSlug}-${serviceSlug}`))
  const descTemplates = [
    `Trouvez un ${trade.name.toLowerCase()} ${getRegionPreposition(region.name)}. Tarif moyen : ${minPrice}–${maxPrice} ${trade.priceRange.unit}. ${deptCount} départements couverts. Devis gratuit.`,
    `${trade.name} ${getRegionPreposition(region.name)} : comparez les devis. ${minPrice} à ${maxPrice} ${trade.priceRange.unit}. Artisans RGE certifiés dans ${deptCount} départements.`,
    `Besoin d’un ${trade.name.toLowerCase()} ${getRegionPreposition(region.name)} ? ${minPrice}–${maxPrice} ${trade.priceRange.unit}. Comparez gratuitement les artisans.`,
    `${region.name} : ${trade.name.toLowerCase()} disponible dans ${deptCount} départements. De ${minPrice} à ${maxPrice} ${trade.priceRange.unit}. Devis gratuits.`,
  ]
  const description = descTemplates[descHash % descTemplates.length]

  const serviceImage = getServiceImageForContext(serviceSlug, regionSlug)

  return {
    title,
    description,
    alternates: getAlternates(`/regions/${regionSlug}/${serviceSlug}`),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/regions/${regionSlug}/${serviceSlug}`,
      images: [
        {
          url: serviceImage.src,
          width: 800,
          height: 600,
          alt: `${trade.name} ${getRegionPreposition(region.name)}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [serviceImage.src],
    },
  }
}

export default async function RegionServicePage({ params }: PageProps) {
  const { region: regionSlug, service: serviceSlug } = await params
  const region = getRegionBySlug(regionSlug)
  const trade = getTradeContent(serviceSlug)
  if (!region || !trade) notFound()

  const content = generateRegionContent(region)
  const deptCount = region.departments.length
  const deptCitiesMap = Object.fromEntries(
    region.departments.map((dept) => [dept.code, getVillesByDepartement(dept.code)])
  )
  const allCities = region.departments
    .flatMap((dept) => deptCitiesMap[dept.code])
    .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
  const cityCount = allCities.length
  const multiplier = getRegionalMultiplier(region.name)
  const minPrice = Math.round(trade.priceRange.min * multiplier)
  const maxPrice = Math.round(trade.priceRange.max * multiplier)

  // Other services
  const allTradeSlugs = getTradesSlugs()
  const otherServices = allTradeSlugs
    .filter((s) => s !== serviceSlug)
    .slice(0, 12)
    .map((s) => {
      const t = getTradeContent(s)
      return t ? { slug: s, name: t.name } : null
    })
    .filter(Boolean) as { slug: string; name: string }[]

  // Related services
  const relatedSlugs = relatedServices[serviceSlug] || []
  const relatedServicesData = relatedSlugs
    .map((s) => {
      const t = getTradeContent(s)
      return t ? { slug: s, name: t.name } : null
    })
    .filter((x): x is { slug: string; name: string } => x !== null)

  // Other regions
  const otherRegions = regions.filter((r) => r.slug !== regionSlug)

  // Hash-selected tips
  const selectedTips = trade.tips
    .map((tip, i) => ({ tip, score: Math.abs(hashCode(`tip-region-${i}-${regionSlug}`)) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((t) => t.tip)

  // FAQ
  const tradeFaq = trade.faq
    .map((f, i) => ({ ...f, score: Math.abs(hashCode(`faq-region-${i}-${regionSlug}`)) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
  const regionFaq = content.faqItems.slice(0, 2)
  const allFaq = [...tradeFaq.map((f) => ({ question: f.q, answer: f.a })), ...regionFaq]

  // JSON-LD
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Régions', url: '/regions' },
    { name: region.name, url: `/regions/${regionSlug}` },
    { name: trade.name, url: `/regions/${regionSlug}/${serviceSlug}` },
  ])

  const faqSchema = getFAQSchema(allFaq)

  const serviceSchema = getServiceSchema({
    name: `${trade.name} ${getRegionPreposition(region.name)}`,
    description: `Service de ${trade.name.toLowerCase()} ${getRegionPreposition(region.name)}. Tarif moyen : ${minPrice}–${maxPrice} ${trade.priceRange.unit}. ${deptCount} départements couverts.`,
    areaServed: region.name,
    category: trade.name,
  })

  // Sprint M.2 2026-05-03 — Snippet 10x : EnBrefBox / TldrBlock / SnippetBaitSummary
  // câblés sur ce template (234 combos région×service, 0 composant snippet préalable).
  // ImmediateAnswerBlock skip volontairement (template statique sans DB providerCount
  // régional fiable — pas d'invention de stats côté CTR).
  const enBrefPoints = [
    `${trade.name} ${getRegionPreposition(region.name)} : tarif moyen ${minPrice}–${maxPrice} ${trade.priceRange.unit} (coefficient régional ${multiplier.toFixed(2)}x).`,
    `${deptCount} département${deptCount > 1 ? 's' : ''} couvert${deptCount > 1 ? 's' : ''}, ${cityCount} ville${cityCount > 1 ? 's' : ''} de la région adressables.`,
    `Climat ${content.profile.climateLabel.toLowerCase()} — typologies bâti et saisonnalité prises en compte.`,
    'Artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC) — sync ADEME hebdo + SIREN INSEE.',
    'Devis gratuit sous 24 h, lead exclusif (1 demande = 1 artisan retenu).',
  ]

  const tldrBullets = [
    `${trade.name} ${getRegionPreposition(region.name)} : ${minPrice}–${maxPrice} ${trade.priceRange.unit} en 2026 (coef ${multiplier.toFixed(2)}x).`,
    `Couverture ${deptCount} département${deptCount > 1 ? 's' : ''} · ${cityCount} ville${cityCount > 1 ? 's' : ''} de la région.`,
    `Climat ${content.profile.climateLabel.toLowerCase()} — interventions adaptées à la saisonnalité régionale.`,
    'Comparez 3 devis d’artisans locaux, gratuit et sans engagement.',
  ]

  // Top 8 autres métiers de la région avec prix régionaux ajustés (multiplier).
  // SnippetBaitSummary gère les unités hétérogènes (prose neutre si mix €/h+€/m²).
  const snippetTrades = otherServices
    .slice(0, 8)
    .map((s) => {
      const t = getTradeContent(s.slug)
      if (!t) return null
      return {
        name: t.name,
        slug: s.slug,
        min: Math.round(t.priceRange.min * multiplier),
        max: Math.round(t.priceRange.max * multiplier),
        unit: t.priceRange.unit,
      }
    })
    .filter(
      (x): x is { name: string; slug: string; min: number; max: number; unit: string } => x !== null
    )

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[breadcrumbSchema, faqSchema, serviceSchema]} />

      {/* ─── DARK HERO ──────────────────────────────────────── */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(61,139,104,0.20) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(200, 73, 42,0.10) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(61,139,104,0.06) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-28 md:pt-14 md:pb-36">
          <div className="mb-10">
            <Breadcrumb
              items={[
                { label: 'Régions', href: '/regions' },
                { label: region.name, href: `/regions/${regionSlug}` },
                { label: trade.name },
              ]}
              className="text-charcoal-400 [[&_a]:text-charcoal-400_a]:text-charcoal-400 [[&_a:hover]:text-white_a:hover]:text-primary-400 [[&_svg]:text-charcoal-600_svg]:text-charcoal-600"
            />
          </div>

          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-900/15 backdrop-blur-sm rounded-full border border-charcoal-400/25">
                <Globe className="w-4 h-4 text-charcoal-300" />
                <span className="text-sm font-medium text-charcoal-200">{region.name}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/15 backdrop-blur-sm rounded-full border border-cyan-400/25">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-200">
                  {content.profile.climateLabel}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/15 backdrop-blur-sm rounded-full border border-accent-400/25">
                <Euro className="w-4 h-4 text-accent-400" />
                <span className="text-sm font-medium text-accent-200">
                  {minPrice}–{maxPrice} {trade.priceRange.unit}
                </span>
              </div>
            </div>

            {(() => {
              const h1Hash = Math.abs(hashCode(`h1-region-svc-${regionSlug}-${serviceSlug}`))
              const h1Templates = [
                `${trade.name} ${getRegionPreposition(region.name)}`,
                `${trade.name} ${getRegionPreposition(region.name)} : pros qualifiés`,
                `${region.name} : ${trade.name.toLowerCase()} par département`,
                `${trade.name} qualifié ${getRegionPreposition(region.name)}`,
                `Tous les ${trade.name.toLowerCase()}s ${getRegionArticle(region.name)}`,
              ]
              return (
                <h1
                  data-speakable="true"
                  className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 tracking-[-0.025em] leading-[1.1]"
                >
                  {h1Templates[h1Hash % h1Templates.length]}
                </h1>
              )
            })()}

            <p className="text-lg text-charcoal-400 max-w-2xl leading-relaxed mb-8">
              Trouvez un {trade.name.toLowerCase()} qualifié {getRegionPreposition(region.name)}.{' '}
              {deptCount} départements, {cityCount} villes couvertes. Tarif moyen régional :{' '}
              {minPrice} à {maxPrice} {trade.priceRange.unit}.
            </p>

            <div className="flex flex-wrap gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 text-charcoal-300">
                <Building2 className="w-4 h-4 text-charcoal-400" />
                <span>
                  {deptCount} département{deptCount > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-300">
                <MapPin className="w-4 h-4 text-charcoal-400" />
                <span>
                  {cityCount} ville{cityCount > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-300">
                <Users className="w-4 h-4 text-charcoal-400" />
                <span>{allServices.length} corps de métier</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">Artisans RGE certifiés</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">Devis 100 % gratuit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sprint M.2 2026-05-03 — Snippet 10x : EnBrefBox + TldrBlock + SnippetBait
          pour Featured Snippets / AI Overviews / [data-speakable]. */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          <EnBrefBox
            summary={`${trade.name} ${getRegionPreposition(region.name)} en 2026 : tarif moyen ${minPrice}–${maxPrice} ${trade.priceRange.unit} (coefficient régional ${multiplier.toFixed(2)}x), ${deptCount} départements et ${cityCount} villes adressables. Artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC), devis gratuit sous 24 h.`}
            keyPoints={enBrefPoints}
          />
          <TldrBlock
            title={`${trade.name} ${getRegionPreposition(region.name)} — l'essentiel`}
            bullets={tldrBullets}
          />
        </div>
      </section>

      {snippetTrades.length > 0 && (
        <section className="bg-sand-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SnippetBaitSummary trades={snippetTrades} />
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ─── CTA CONVERSION — above the fold ─────────────── */}
        <GeoPageCTA
          title={`Besoin d'un ${trade.name.toLowerCase()} ${getRegionPreposition(region.name)} ?`}
          subtitle="Devis gratuit et sans engagement d'artisans RGE certifiés"
          service={serviceSlug}
        />

        {/* ─── SERVICE OVERVIEW + REGIONAL PRICING ──────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
              <Euro className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-charcoal-900 tracking-tight">
                Tarifs {trade.name.toLowerCase()} {getRegionPreposition(region.name)}
              </h2>
              <p className="text-sm text-charcoal-500">
                Coefficient régional : {multiplier.toFixed(2)}x
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-sand-300 p-8">
            <div className="grid sm:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-sand-100 rounded-xl">
                <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-1">
                  Tarif horaire min.
                </div>
                <div className="text-2xl font-bold text-charcoal-900">{minPrice} €</div>
              </div>
              <div className="text-center p-4 bg-accent-50 rounded-xl">
                <div className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-1">
                  Tarif horaire max.
                </div>
                <div className="text-2xl font-bold text-accent-700">{maxPrice} €</div>
              </div>
              <div className="text-center p-4 bg-sand-100 rounded-xl">
                <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-1">
                  Moyenne nationale
                </div>
                <div className="text-2xl font-bold text-charcoal-900">
                  {trade.priceRange.min}–{trade.priceRange.max} €
                </div>
              </div>
            </div>
            <p className="text-sm text-charcoal-500">
              Les tarifs {getRegionPreposition(region.name)} sont{' '}
              {multiplier >= 1.05 ? 'supérieurs' : multiplier <= 0.95 ? 'inférieurs' : 'proches de'}{' '}
              la moyenne nationale (coefficient {multiplier.toFixed(2)}).{' '}
              {content.profile.economyLabel}.
            </p>
          </div>
        </section>

        {/* ─── PRICE TABLE (CommonTasks) ─────────────────────── */}
        {trade.commonTasks && trade.commonTasks.length > 0 && (
          <section className="mb-16">
            <PriceTable
              tasks={trade.commonTasks}
              tradeName={trade.name}
              priceRange={{ min: minPrice, max: maxPrice, unit: trade.priceRange.unit }}
            />
          </section>
        )}

        {/* ─── DEPARTMENTS GRID ─────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-sand-200 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-charcoal-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-charcoal-900 tracking-tight">
                {trade.name} par département {getRegionPreposition(region.name)}
              </h2>
              <p className="text-sm text-charcoal-500">
                {deptCount} département{deptCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {region.departments.map((dept) => (
              <Link
                key={dept.code}
                href={`/departements/${dept.slug}/${serviceSlug}`}
                className="bg-white rounded-2xl border border-sand-300 p-6 hover:shadow-card-hover hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center group-hover:from-primary-100 group-hover:to-primary-200 transition-colors">
                      <span className="text-accent-700 font-bold text-sm">{dept.code}</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold text-charcoal-900 group-hover:text-accent-700 transition-colors">
                        {trade.name} en {dept.name}
                      </h3>
                      <span className="text-xs text-charcoal-400">
                        {deptCitiesMap[dept.code].length} ville
                        {deptCitiesMap[dept.code].length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-charcoal-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {deptCitiesMap[dept.code].slice(0, 3).map((city) => (
                    <span
                      key={city.slug}
                      className="text-xs bg-sand-50 text-charcoal-500 px-2.5 py-1 rounded-full group-hover:bg-accent-50 group-hover:text-primary-400 transition-colors"
                    >
                      {city.name}
                    </span>
                  ))}
                  {deptCitiesMap[dept.code].length > 3 && (
                    <span className="text-xs text-charcoal-400 px-2 py-1">
                      +{deptCitiesMap[dept.code].length - 3}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── TOP CITIES ───────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-charcoal-900 tracking-tight">
                {trade.name} dans les principales villes
              </h2>
              <p className="text-sm text-charcoal-500">Accès rapide par ville</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allCities.slice(0, 15).map((city) => (
              <Link
                key={city.slug}
                href={`/services/${serviceSlug}/${city.slug}`}
                className="bg-white rounded-2xl border border-sand-300 p-4 hover:shadow-card-hover hover:border-primary-200 hover:-translate-y-0.5 transition-all group text-center"
              >
                <div className="font-semibold text-charcoal-800 group-hover:text-primary-400 transition-colors text-sm">
                  {city.name}
                </div>
                <div className="text-xs text-charcoal-400 mt-1">{trade.name}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── SOCIAL PROOF MID-PAGE ────────────────────────── */}
        <section className="mb-16">
          <SocialProofBanner variant="card" metier={trade.name} />
        </section>

        {/* ─── TIPS ─────────────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="font-heading text-2xl font-semibold text-charcoal-900 tracking-tight">
              Conseils pour choisir votre {trade.name.toLowerCase()}{' '}
              {getRegionPreposition(region.name)}
            </h2>
          </div>
          <div className="space-y-4">
            {selectedTips.map((tip, i) => (
              <div key={i} className="bg-white rounded-2xl border border-sand-300 p-6">
                <p className="text-sm text-charcoal-700 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="font-heading text-2xl font-semibold text-charcoal-900 tracking-tight">
              Questions fréquentes
            </h2>
          </div>
          <div className="space-y-4">
            {allFaq.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-sand-300 p-6">
                <h3 className="font-semibold text-charcoal-900 mb-2">{faq.question}</h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── RELATED SERVICES ─────────────────────────────── */}
        {relatedServicesData.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-charcoal-900 tracking-tight">
                Services complémentaires {getRegionPreposition(region.name)}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {relatedServicesData.map((s) => (
                <Link
                  key={`related-${s.slug}`}
                  href={`/regions/${regionSlug}/${s.slug}`}
                  className="bg-white border border-primary-200 hover:bg-primary-50 hover:border-primary-300 text-charcoal-700 hover:text-primary-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  {s.name} {getRegionPreposition(region.name)}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── OTHER SERVICES ─────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-accent-600" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-charcoal-900 tracking-tight">
              Autres services {getRegionPreposition(region.name)}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {otherServices.map((s) => (
              <Link
                key={s.slug}
                href={`/regions/${regionSlug}/${s.slug}`}
                className="bg-white border border-sand-300 hover:bg-accent-50 hover:border-accent-200 text-charcoal-700 hover:text-accent-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </section>

        {/* ─── NATIONAL HUB LINKS ─────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-400" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-charcoal-900 tracking-tight">
              {trade.name} en France
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/services/${serviceSlug}`}
              className="bg-white border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300 text-charcoal-700 hover:text-primary-600 px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              {trade.name} — Annuaire national
            </Link>
            <Link
              href={`/tarifs/${serviceSlug}`}
              className="bg-white border border-sand-300 hover:bg-sand-50 hover:border-sand-400 text-charcoal-700 hover:text-charcoal-900 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Tarifs {trade.name.toLowerCase()} en France
            </Link>
            <Link
              href={`/avis/${serviceSlug}`}
              className="bg-white border border-sand-300 hover:bg-sand-50 hover:border-sand-400 text-charcoal-700 hover:text-charcoal-900 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Avis {trade.name.toLowerCase()}
            </Link>
            <Link
              href={`/devis/${serviceSlug}`}
              className="bg-white border border-sand-300 hover:bg-sand-50 hover:border-sand-400 text-charcoal-700 hover:text-charcoal-900 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Devis {trade.name.toLowerCase()}
            </Link>
          </div>
        </section>
      </div>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="relative bg-charcoal-950 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(200, 73, 42,0.12) 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
            Besoin d'un {trade.name.toLowerCase()} {getRegionPreposition(region.name)} ?
          </h2>
          <p className="text-charcoal-400 mb-8 max-w-lg mx-auto">
            Devis gratuit et sans engagement d'artisans RGE certifiés.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/devis/${serviceSlug}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-400 via-primary-400 to-primary-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-cta hover:shadow-cta hover:-translate-y-0.5 transition-all duration-300"
            >
              Obtenir mon devis gratuit
            </Link>
            <Link
              href={`/services/${serviceSlug}`}
              className="inline-flex items-center gap-2 text-charcoal-300 hover:text-white font-medium transition-colors"
            >
              Voir le service <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SEO INTERNAL LINKS ───────────────────────────── */}
      <section className="py-16 bg-white border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-8 tracking-tight">
            Voir aussi
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                {trade.name} par département
              </h3>
              <div className="space-y-2">
                {region.departments.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/departements/${d.slug}/${serviceSlug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {trade.name} en {d.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                Autres régions
              </h3>
              <div className="space-y-2">
                {otherRegions.slice(0, 12).map((r) => (
                  <Link
                    key={r.slug}
                    href={`/regions/${r.slug}/${serviceSlug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {trade.name} en {r.name}
                  </Link>
                ))}
              </div>
              <Link
                href="/regions"
                className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-500 text-sm font-medium mt-3"
              >
                Toutes les régions <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                Navigation
              </h3>
              <div className="space-y-2">
                <Link
                  href={`/services/${serviceSlug}`}
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  {trade.name} en France
                </Link>
                <Link
                  href={`/devis/${serviceSlug}`}
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  Devis {trade.name.toLowerCase()}
                </Link>
                <Link
                  href={`/regions/${regionSlug}`}
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  Artisans {getRegionPreposition(region.name)}
                </Link>
                <Link
                  href="/services"
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  Tous les services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STICKY MOBILE CTA + EXIT INTENT ────────────── */}
      <GeoPageCTA variant="sticky-only" service={serviceSlug} />

      {/* ─── EDITORIAL CREDIBILITY ──────────────────────────── */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand-100 rounded-2xl border border-sand-300 p-6">
            <h3 className="text-sm font-semibold text-charcoal-700 mb-2">
              Méthodologie éditoriale
            </h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Les tarifs indiqués sont des estimations basées sur les données nationales ajustées
              par un coefficient régional. Les données proviennent de sources publiques (INSEE, base
              SIRENE). ServicesArtisans est un annuaire indépendant — nous ne réalisons pas de
              travaux.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
