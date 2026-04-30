import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  MapPin,
  Building2,
  Users,
  ArrowRight,
  Shield,
  Clock,
  ChevronRight,
  Wrench,
  HelpCircle,
  Map,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema, getCollectionPageSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import {
  departements,
  getDepartementBySlug,
  getVillesByDepartement,
  services,
  getRegionSlugByName,
} from '@/lib/data/france'
import { getProviderCountByDepartment, formatProviderCount } from '@/lib/data/stats'
import { getDepartmentImage } from '@/lib/data/images'
import { generateDepartementContent, hashCode } from '@/lib/seo/location-content'
import { getTradeContent } from '@/lib/data/trade-content'
import { getDeptPreposition, getDeptArticle } from '@/lib/geo-strings'
import CrossIntentLinks from '@/components/seo/CrossIntentLinks'
import OrphanRescueLinks from '@/components/seo/OrphanRescueLinks'
import SeasonalLinks from '@/components/seo/SeasonalLinks'
import { SocialProofBanner } from '@/components/SocialProofBanner'
import GeoPageCTA from '@/components/conversion/GeoPageCTA'
import { Thermometer, Home, TrendingUp, AlertTriangle, Globe, Star, Euro } from 'lucide-react'

export function generateStaticParams() {
  return departements.map((dept) => ({ departement: dept.slug }))
}

export const dynamicParams = false
export const revalidate = 86400

interface PageProps {
  params: Promise<{ departement: string }>
}

function truncateTitle(title: string, maxLen = 41): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { departement: deptSlug } = await params
  const dept = getDepartementBySlug(deptSlug)
  if (!dept) return { title: 'Département non trouvé' }

  const metaContent = generateDepartementContent(dept)
  const artisanCount = await getProviderCountByDepartment(dept.name)

  const titleHash = Math.abs(hashCode(`title-dept-${dept.slug}`))
  const countPrefix = artisanCount >= 50 ? `${formatProviderCount(artisanCount)} ` : ''
  const titleTemplates = [
    `${countPrefix}Artisans ${dept.name} (${dept.code}) 2026 — Devis gratuit`,
    `Artisan ${dept.name} 2026 — Devis gratuit 24h`,
    `${dept.name} : ${countPrefix}artisans qualifiés — Devis 2026`,
    `Artisans ${dept.name} 2026 — Comparez ${countPrefix || 'les pros'}`,
    `${dept.name} (${dept.code}) — Annuaire ${countPrefix}artisans 2026`,
  ]
  const title = truncateTitle(titleTemplates[titleHash % titleTemplates.length])

  const descHash = Math.abs(hashCode(`desc-dept-${dept.slug}`))
  const artisanStr = artisanCount > 0 ? `${formatProviderCount(artisanCount)} artisans, ` : ''
  const descTemplates = [
    `Trouvez des artisans qualifiés ${getDeptPreposition(dept.name)} (${dept.code}). ${artisanStr}${metaContent.profile.climateLabel}, ${services.length} corps de métier. Devis gratuit.`,
    `${dept.name} : ${artisanStr}annuaire d'artisans référencés SIREN. ${metaContent.profile.housingLabel}, ${metaContent.profile.climateLabel.toLowerCase()}. Comparez les devis.`,
    `Artisans en ${dept.name} (${dept.code}), ${dept.region}. ${artisanStr}${dept.population} hab., chef-lieu ${dept.chefLieu}. Devis gratuits en ligne.`,
    `${artisanStr}${services.length} corps de métier ${getDeptPreposition(dept.name)}. ${metaContent.profile.economyLabel}, ${metaContent.profile.housingLabel.toLowerCase()}. Devis gratuit.`,
    `Tous les artisans ${getDeptArticle(dept.name)} (${dept.code}). ${artisanStr}${metaContent.profile.climateLabel}, ${metaContent.profile.economyLabel.toLowerCase()}. Comparez gratuitement.`,
  ]
  const description = descTemplates[descHash % descTemplates.length]

  const deptImage = getDepartmentImage(dept.code)

  return {
    title,
    description,
    // Hub pages are always indexed — rich geographic content has value even with 0 providers
    robots: { index: true, follow: true },
    alternates: getAlternates(`/departements/${deptSlug}`),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/departements/${deptSlug}`,
      images: [{ url: deptImage.src, width: 1200, height: 630, alt: `Artisans en ${dept.name}` }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [deptImage.src],
    },
  }
}

export default async function DepartementPage({ params }: PageProps) {
  const { departement: deptSlug } = await params
  const dept = getDepartementBySlug(deptSlug)
  if (!dept) notFound()

  const villesDuDepartement = getVillesByDepartement(dept.code)
  const content = generateDepartementContent(dept)
  const deptArtisanCount = await getProviderCountByDepartment(dept.name)

  // Other departments in the same region
  const siblingDepts = departements.filter((d) => d.region === dept.region && d.slug !== dept.slug)

  const regionSlug = getRegionSlugByName(dept.region)

  // Top service for cross-linking
  const topServiceSlug = content.profile.topServiceSlugs[0] || 'plombier'
  const topServiceTrade = getTradeContent(topServiceSlug)
  const topServiceName = topServiceTrade?.name || 'Plombier'

  // Top 5 services for intent variants
  const top5Services = content.profile.topServiceSlugs
    .slice(0, 5)
    .map((s) => {
      const t = getTradeContent(s)
      return t ? { slug: s, name: t.name } : null
    })
    .filter((x): x is { slug: string; name: string } => x !== null)

  // Reorder services by profile priority
  const topServiceSlugsSet = new Set(content.profile.topServiceSlugs.slice(0, 5))
  const orderedServices = [...services].sort((a, b) => {
    const ai = content.profile.topServiceSlugs.indexOf(a.slug)
    const bi = content.profile.topServiceSlugs.indexOf(b.slug)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  // JSON-LD structured data
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Départements', url: '/departements' },
    { name: `${dept.name} (${dept.code})`, url: `/departements/${dept.slug}` },
  ])

  const collectionPageSchema = getCollectionPageSchema({
    name: `Artisans en ${dept.name} (${dept.code})`,
    description: `Trouvez des artisans qualifiés ${getDeptPreposition(dept.name)} (${dept.code}). ${services.length} corps de métier, artisans référencés.`,
    url: `/departements/${dept.slug}`,
    itemCount: services.length,
  })

  const faqSchema = getFAQSchema(content.faqItems)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Artisans ${getDeptPreposition(dept.name)} (${dept.code}) — annuaire ${dept.region}`,
    description: `Annuaire d'artisans ${getDeptPreposition(dept.name)} (${dept.code}, ${dept.region}). ${services.length} corps de métier, ${dept.population} habitants, chef-lieu ${dept.chefLieu}.`,
    image: `${SITE_URL}/opengraph-image`,
    url: `${SITE_URL}/departements/${dept.slug}`,
    mainEntityOfPage: `${SITE_URL}/departements/${dept.slug}`,
    inLanguage: 'fr-FR',
    datePublished: '2026-01-15T08:00:00+02:00',
    dateModified: monthlyAnchorIso(),
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints: string[] = [
    deptArtisanCount > 0
      ? `${formatProviderCount(deptArtisanCount)} artisan${deptArtisanCount > 1 ? 's' : ''} référencé${deptArtisanCount > 1 ? 's' : ''} ${getDeptPreposition(dept.name)}`
      : `${services.length} corps de métier disponibles ${getDeptPreposition(dept.name)}`,
    `Chef-lieu : ${dept.chefLieu} · Région ${dept.region}`,
    `${dept.population} habitants · ${villesDuDepartement.length || dept.villes.length} villes couvertes`,
    `Profil : ${content.profile.climateLabel}, ${content.profile.economyLabel.toLowerCase()}`,
  ]

  const tldrBullets: string[] = [
    `Annuaire d'artisans ${getDeptArticle(dept.name)} (${dept.code}) — ${services.length} corps de métier, ${formatProviderCount(deptArtisanCount || 0)} pros référencés.`,
    `Profil départemental : ${content.profile.climateLabel.toLowerCase()}, ${content.profile.housingLabel.toLowerCase()}, ${content.profile.economyLabel.toLowerCase()}.`,
    `Maillage : ${villesDuDepartement.length || dept.villes.length} villes du ${dept.code} couvertes, du chef-lieu ${dept.chefLieu} aux communes périphériques.`,
    `Notre rôle : mise en relation gratuite avec un artisan vérifié SIREN, devis sous 24 h, sans engagement.`,
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[breadcrumbSchema, articleSchema, collectionPageSchema, faqSchema]} />
      {/* ─── PREMIUM DARK HERO ──────────────────────────────── */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(61,139,104,0.12) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(61,139,104,0.06) 0%, transparent 50%)',
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
          {/* Breadcrumb */}
          <div className="mb-10">
            <Breadcrumb
              items={[
                ...(regionSlug ? [{ label: dept.region, href: `/regions/${regionSlug}` }] : []),
                { label: 'Départements', href: '/departements' },
                { label: `${dept.name} (${dept.code})` },
              ]}
              className="text-charcoal-400 [[&_a]:text-charcoal-400_a]:text-charcoal-400 [[&_a:hover]:text-white_a:hover]:text-primary-400 [[&_svg]:text-charcoal-600_svg]:text-charcoal-600"
            />
          </div>

          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/15 backdrop-blur-sm rounded-full border border-accent-400/25">
                <Map className="w-4 h-4 text-accent-400" />
                <span className="text-sm font-medium text-accent-200">Département</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/15 backdrop-blur-sm rounded-full border border-cyan-400/25">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-200">
                  {content.profile.climateLabel}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/15 backdrop-blur-sm rounded-full border border-accent-400/25">
                <Home className="w-4 h-4 text-accent-400" />
                <span className="text-sm font-medium text-accent-200">
                  {content.profile.housingLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-accent-500/15 backdrop-blur rounded-2xl flex items-center justify-center border border-accent-400/20">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-primary-200">
                  {dept.code}
                </span>
              </div>
              <div>
                {(() => {
                  const h1Hash = Math.abs(hashCode(`h1-dept-${dept.slug}`))
                  const h1Templates = [
                    `Artisans ${getDeptPreposition(dept.name)}`,
                    `Artisans ${getDeptPreposition(dept.name)} (${dept.code}) : annuaire`,
                    `${dept.name} : artisans qualifiés par ville`,
                    `Artisans ${getDeptArticle(dept.name)} (${dept.code})`,
                    `Tous les artisans ${getDeptPreposition(dept.name)}, ${dept.region}`,
                  ]
                  return (
                    <h1
                      className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.025em] leading-[1.1]"
                      data-speakable="true"
                    >
                      {h1Templates[h1Hash % h1Templates.length]}
                    </h1>
                  )
                })()}
                <p className="text-charcoal-400 mt-1">{dept.region}</p>
              </div>
            </div>

            <p className="text-lg text-charcoal-400 max-w-2xl leading-relaxed mb-8">
              {content.profile.climateLabel}, {content.profile.economyLabel.toLowerCase()},{' '}
              {content.profile.housingLabel.toLowerCase()}. {services.length} corps de métier
              disponibles dans le département.
            </p>

            {/* Location info */}
            <div className="flex flex-wrap gap-4 mb-8 text-sm">
              {deptArtisanCount > 0 && (
                <div className="flex items-center gap-2 text-charcoal-300">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>
                    {formatProviderCount(deptArtisanCount)} artisan{deptArtisanCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-charcoal-300">
                <Building2 className="w-4 h-4 text-accent-400" />
                <span>Chef-lieu : {dept.chefLieu}</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-300">
                <Users className="w-4 h-4 text-accent-400" />
                <span>{dept.population} habitants</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-300">
                <MapPin className="w-4 h-4 text-accent-400" />
                <span>
                  {villesDuDepartement.length || dept.villes.length} ville
                  {(villesDuDepartement.length || dept.villes.length) > 1 ? 's' : ''} couvertes
                </span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">Données SIREN officielles</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">Devis gratuits</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ─── Article byline + En bref — E-E-A-T DOM signals + FS Position 0 ── */}
        <section className="mb-10 max-w-4xl">
          <ArticleMeta
            author={SITE_NAME}
            datePublished="2026-01-15"
            dateModified={monthlyAnchorIso().slice(0, 10)}
            className="mb-5"
          />
          <EnBrefBox keyPoints={enBrefPoints} />
        </section>

        {/* ─── HERO CTA ───────────────────────────────────────── */}
        <GeoPageCTA
          title={`Besoin d'un artisan ${getDeptPreposition(dept.name)} ?`}
          subtitle="Devis gratuit et sans engagement d'artisans vérifiés"
          ville={dept.chefLieu}
        />

        {/* ─── SERVICES ─────────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-charcoal-900 tracking-tight">
                Trouver un artisan dans le {dept.name}
              </h2>
              <p className="text-sm text-charcoal-500">
                {services.length} corps de métier disponibles
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {orderedServices.map((service) => (
              <Link
                key={service.slug}
                href={`/departements/${dept.slug}/${service.slug}`}
                className={`bg-white rounded-2xl shadow-soft p-5 text-center hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group ${topServiceSlugsSet.has(service.slug) ? 'border-2 border-accent-200' : 'border border-sand-200'}`}
              >
                {topServiceSlugsSet.has(service.slug) && (
                  <span className="inline-block text-[10px] font-bold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full mb-2">
                    Prioritaire
                  </span>
                )}
                <span className="font-semibold text-charcoal-800 group-hover:text-primary-400 transition-colors block text-sm">
                  {service.name}
                </span>
                <span className="block text-xs text-charcoal-400 mt-1.5">dans le {dept.code}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── SOCIAL PROOF ───────────────────────────────────── */}
        <div className="mb-16">
          <SocialProofBanner ville={dept.chefLieu} variant="card" />
        </div>

        {/* ─── PROFIL DU DÉPARTEMENT ────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-charcoal-900 tracking-tight">
                Profil du {dept.name}
              </h2>
              <p className="text-sm text-charcoal-500">
                {content.profile.climateLabel} · {content.profile.economyLabel}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-sand-300 p-8">
            <p className="text-charcoal-700 leading-relaxed mb-6">{content.intro}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-cyan-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-cyan-700 uppercase tracking-wider mb-1">
                  Climat
                </div>
                <div className="text-sm text-charcoal-800 font-medium">
                  {content.profile.climateLabel}
                </div>
              </div>
              <div className="bg-accent-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-accent-700 uppercase tracking-wider mb-1">
                  Habitat
                </div>
                <div className="text-sm text-charcoal-800 font-medium">
                  {content.profile.housingLabel}
                </div>
              </div>
              <div className="bg-violet-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-violet-700 uppercase tracking-wider mb-1">
                  Économie
                </div>
                <div className="text-sm text-charcoal-800 font-medium">
                  {content.profile.economyLabel}
                </div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                  Population
                </div>
                <div className="text-sm text-charcoal-800 font-medium">
                  {dept.population} habitants
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Problématiques courantes
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {content.profile.climaticIssues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-charcoal-600">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {issue}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-charcoal-700 leading-relaxed">{content.contexteHabitat}</p>
          </div>
        </section>

        {/* ─── CONTENU SEO ────────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-400" />
            </div>
            <h2 className="font-heading text-2xl font-semibold text-charcoal-900 tracking-tight">
              Artisanat dans le {dept.name}
            </h2>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-sand-300 p-8">
              <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-4">
                Services prioritaires
              </h3>
              <p className="text-charcoal-700 leading-relaxed">{content.servicesPrioritaires}</p>
            </div>
            <div className="bg-white rounded-2xl border border-sand-300 p-8">
              <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-4">
                Conseils pour vos travaux
              </h3>
              <p className="text-charcoal-700 leading-relaxed">{content.conseilsDepartement}</p>
            </div>
          </div>
        </section>

        {/* ─── PRINCIPALES VILLES ───────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-charcoal-900 tracking-tight">
                Principales villes du {dept.name}
              </h2>
              <p className="text-sm text-charcoal-500">
                {villesDuDepartement.length > 0 ? villesDuDepartement.length : dept.villes.length}{' '}
                villes référencées
              </p>
            </div>
          </div>
          {villesDuDepartement.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {villesDuDepartement.slice(0, 20).map((ville) => (
                  <Link
                    key={ville.slug}
                    href={`/villes/${ville.slug}`}
                    className="bg-white rounded-2xl border border-sand-300 p-4 hover:shadow-card-hover hover:border-primary-200 hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg flex items-center justify-center group-hover:from-indigo-100 group-hover:to-indigo-200 transition-colors">
                        <MapPin className="w-5 h-5 text-accent-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-charcoal-800 group-hover:text-primary-400 transition-colors text-sm truncate">
                          {ville.name}
                        </div>
                        <div className="text-xs text-charcoal-400">{ville.population} hab.</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {/* Service links per city for top service */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-3">
                  {topServiceName} par ville
                </h3>
                <div className="flex flex-wrap gap-2">
                  {villesDuDepartement.slice(0, 20).map((ville) => (
                    <Link
                      key={`svc-${ville.slug}`}
                      href={`/services/${topServiceSlug}/${ville.slug}`}
                      className="text-sm text-primary-500 hover:text-primary-800 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-primary-100"
                    >
                      {topServiceName} à {ville.name}
                    </Link>
                  ))}
                </div>
              </div>
              {villesDuDepartement.length > 20 && (
                <div className="mt-6 text-center">
                  <Link
                    href="/villes"
                    className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-500 font-medium text-sm transition-colors"
                  >
                    Voir les {villesDuDepartement.length} villes du {dept.name}{' '}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {dept.villes.slice(0, 20).map((villeName) => (
                <span
                  key={villeName}
                  className="bg-white border border-sand-300 rounded-full px-4 py-2 text-sm text-charcoal-700 hover:bg-primary-50 hover:text-primary-500 hover:border-primary-200 transition-colors"
                >
                  {villeName}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ─── SERVICES PAR VILLE ───────────────────────────── */}
        {villesDuDepartement.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-charcoal-900 tracking-tight">
                Services par ville dans le {dept.name}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {villesDuDepartement.slice(0, 2).map((ville) => (
                <div key={ville.slug} className="bg-white rounded-2xl border border-sand-300 p-6">
                  <h3 className="font-heading font-semibold text-charcoal-900 mb-4">
                    Artisans à {ville.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {orderedServices.slice(0, 5).map((service) => (
                      <Link
                        key={`${service.slug}-${ville.slug}`}
                        href={`/services/${service.slug}/${ville.slug}`}
                        className="text-sm text-charcoal-600 hover:text-primary-400 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-primary-100"
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/villes/${ville.slug}`}
                    className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-500 text-sm font-medium mt-4"
                  >
                    Tous les artisans <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── PARENT REGION ────────────────────────────────── */}
        {regionSlug && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-charcoal-900 tracking-tight">
                Région {dept.region}
              </h2>
            </div>
            <Link
              href={`/regions/${regionSlug}`}
              className="inline-flex items-center gap-3 bg-white border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300 text-charcoal-800 hover:text-primary-600 px-6 py-4 rounded-2xl text-base font-semibold transition-colors"
            >
              <Globe className="w-5 h-5 text-primary-400" />
              Tous les artisans en {dept.region}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        )}

        {/* ─── OTHER DEPARTMENTS ─────────────────────────────── */}
        {siblingDepts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-charcoal-900 tracking-tight">
                Autres départements en {dept.region}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {siblingDepts.map((d) => (
                <Link
                  key={d.slug}
                  href={`/departements/${d.slug}`}
                  className="bg-white border border-sand-300 hover:bg-primary-50 hover:border-primary-200 text-charcoal-700 hover:text-primary-500 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  {d.name} ({d.code})
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── MAILLAGE TERRITORIAL COMPLET ─────────────────── */}
        {/* Linke chaque combinaison service × ville du département.
            Objectif : éliminer les "orphan pages" flaggées par Ahrefs
            (chaque /services/[service]/[ville] du département reçoit
            au moins un inlink depuis sa page département parente). */}
        {villesDuDepartement.length > 0 && (
          <section className="mb-16 border-t border-sand-200 pt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-sand-100 rounded-xl flex items-center justify-center">
                <Map className="w-5 h-5 text-charcoal-600" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal-900 tracking-tight">
                  Tous les artisans dans les villes du {dept.name}
                </h2>
                <p className="text-sm text-charcoal-500">
                  {villesDuDepartement.length} ville
                  {villesDuDepartement.length > 1 ? 's' : ''} ×{' '}
                  {Math.min(orderedServices.length, 12)} métiers
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {orderedServices.slice(0, 12).map((svc) => (
                <details
                  key={`mesh-${svc.slug}`}
                  className="bg-white rounded-xl border border-sand-200 overflow-hidden"
                >
                  <summary className="cursor-pointer px-5 py-3 font-medium text-charcoal-800 hover:bg-sand-50 select-none">
                    {svc.name} — {villesDuDepartement.length} villes du {dept.name}
                  </summary>
                  <div className="px-5 py-4 border-t border-sand-200 bg-sand-50/40">
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm">
                      {villesDuDepartement.map((v) => (
                        <Link
                          key={`mesh-${svc.slug}-${v.slug}`}
                          href={`/services/${svc.slug}/${v.slug}`}
                          className="text-charcoal-600 hover:text-primary-500 underline decoration-dotted underline-offset-2"
                        >
                          {svc.name} à {v.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ─── INTENT VARIANTS FOR TOP SERVICES ──────────────── */}
        {villesDuDepartement.length > 0 && top5Services.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal-900 tracking-tight">
                  Recherches populaires dans le {dept.name}
                </h2>
                <p className="text-sm text-charcoal-500">Tarifs, avis, devis, urgences</p>
              </div>
            </div>
            <div className="space-y-4">
              {top5Services.map((svc) => (
                <div key={svc.slug} className="bg-white rounded-2xl border border-sand-300 p-5">
                  <h3 className="font-semibold text-charcoal-900 mb-3 text-sm">
                    {svc.name} à {villesDuDepartement[0].name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/services/${svc.slug}/${villesDuDepartement[0].slug}`}
                      className="inline-flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Euro className="w-3.5 h-3.5" /> Tarifs
                    </Link>
                    <Link
                      href={`/avis/${svc.slug}/${villesDuDepartement[0].slug}`}
                      className="inline-flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Star className="w-3.5 h-3.5" /> Avis
                    </Link>
                    <Link
                      href={`/services/${svc.slug}/${villesDuDepartement[0].slug}`}
                      className="inline-flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Devis
                    </Link>
                    <Link
                      href={`/urgence/${svc.slug}/${villesDuDepartement[0].slug}`}
                      className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Urgence
                    </Link>
                    <Link
                      href={`/services/${svc.slug}/${villesDuDepartement[0].slug}`}
                      className="inline-flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Artisans
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── TL;DR pré-FAQ — capture FS Position 0 / AI Overviews ──── */}
        <section className="mb-10 max-w-4xl">
          <TldrBlock bullets={tldrBullets} />
        </section>

        {/* ─── FAQ ───────────────────────────────────────────── */}
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
            {content.faqItems.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-sand-300 p-6">
                <h3 className="font-semibold text-charcoal-900 mb-2">{faq.question}</h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className="relative bg-charcoal-950 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(232,107,75,0.12) 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
            Besoin d'un artisan dans le {dept.name} ?
          </h2>
          <p className="text-charcoal-400 mb-8 max-w-lg mx-auto">
            Devis gratuit et sans engagement de professionnels qualifiés.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-400 via-primary-400 to-primary-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-cta hover:shadow-cta hover:-translate-y-0.5 transition-all duration-300"
            >
              Obtenir mon devis gratuit
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-charcoal-300 hover:text-white font-medium transition-colors"
            >
              Voir les services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SEO INTERNAL LINKS ─────────────────────────────── */}
      <section className="py-16 bg-white border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-8 tracking-tight">
            Voir aussi
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                Services populaires
              </h3>
              <div className="space-y-2">
                {orderedServices.slice(0, 5).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {s.name}
                  </Link>
                ))}
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-500 text-sm font-medium mt-3"
              >
                Tous les services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Region */}
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                Région {dept.region}
              </h3>
              <div className="space-y-2">
                {regionSlug && (
                  <Link
                    href={`/regions/${regionSlug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                    Artisans en {dept.region}
                  </Link>
                )}
                {siblingDepts.slice(0, 3).map((d) => (
                  <Link
                    key={d.slug}
                    href={`/departements/${d.slug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {d.name} ({d.code})
                  </Link>
                ))}
              </div>
              <Link
                href="/departements"
                className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-500 text-sm font-medium mt-3"
              >
                Tous les départements <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                Navigation
              </h3>
              <div className="space-y-2">
                <Link
                  href="/villes"
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  Toutes les villes
                </Link>
                <Link
                  href="/regions"
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  Toutes les régions
                </Link>
                <Link
                  href="/departements"
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  Tous les départements
                </Link>
                <Link
                  href="/devis"
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  Demander un devis
                </Link>
                <Link
                  href="/comment-ca-marche"
                  className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  Comment ça marche
                </Link>
              </div>
            </div>
          </div>

          {/* Dept × Service cross-links */}
          <div className="mt-10">
            <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
              Services dans le {dept.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {orderedServices.slice(0, 5).map((s) => (
                <Link
                  key={`dept-svc-${s.slug}`}
                  href={`/departements/${dept.slug}/${s.slug}`}
                  className="inline-flex items-center gap-1.5 bg-accent-50 text-accent-700 hover:bg-accent-100 hover:text-accent-800 px-3 py-1.5 rounded-lg text-sm transition-colors border border-accent-100 hover:border-accent-200"
                >
                  {s.name} dans le {dept.code}
                </Link>
              ))}
            </div>
          </div>

          {/* Intent variant links — devis, avis, tarifs */}
          {villesDuDepartement.length > 0 && (
            <div className="mt-10 grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                  Devis dans le {dept.name}
                </h3>
                <div className="space-y-1.5">
                  {orderedServices.slice(0, 2).map((s) => (
                    <Link
                      key={`devis-${s.slug}-${villesDuDepartement[0].slug}`}
                      href={`/services/${s.slug}/${villesDuDepartement[0].slug}`}
                      className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-1 transition-colors"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Devis {s.name.toLowerCase()} à {villesDuDepartement[0].name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                  Avis dans le {dept.name}
                </h3>
                <div className="space-y-1.5">
                  {orderedServices.slice(0, 2).map((s) => (
                    <Link
                      key={`avis-${s.slug}-${villesDuDepartement[0].slug}`}
                      href={`/avis/${s.slug}/${villesDuDepartement[0].slug}`}
                      className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-1 transition-colors"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Avis {s.name.toLowerCase()} à {villesDuDepartement[0].name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                  Tarifs dans le {dept.name}
                </h3>
                <div className="space-y-1.5">
                  {orderedServices.slice(0, 2).map((s) => (
                    <Link
                      key={`tarifs-${s.slug}-${villesDuDepartement[0].slug}`}
                      href={`/services/${s.slug}/${villesDuDepartement[0].slug}`}
                      className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-1 transition-colors"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Tarifs {s.name.toLowerCase()} à {villesDuDepartement[0].name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── CROSS-INTENT LINKS FOR TOP SERVICES ────────────── */}
      {top5Services.slice(0, 3).map((svc) => (
        <CrossIntentLinks
          key={svc.slug}
          service={svc.slug}
          serviceName={svc.name}
          currentIntent="services"
        />
      ))}

      <OrphanRescueLinks currentPath={`/departements/${deptSlug}`} serviceSlug={topServiceSlug} />

      {/* ─── EDITORIAL CREDIBILITY ──────────────────────────── */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand-100 rounded-2xl border border-sand-300 p-6">
            <h3 className="text-sm font-semibold text-charcoal-700 mb-2">
              Méthodologie éditoriale
            </h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Les profils climatiques et économiques sont des estimations basées sur les
              caractéristiques régionales. Les données démographiques proviennent de l'INSEE.
              ServicesArtisans est un annuaire indépendant — nous ne réalisons pas de travaux.
            </p>
          </div>
        </div>
      </section>

      {/* Services de saison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SeasonalLinks />
      </div>

      {/* Confiance & Sécurité */}
      <section className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-charcoal-900 mb-4">Confiance & Sécurité</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/notre-processus-de-verification"
              className="text-sm text-primary-400 hover:text-primary-600 flex items-center gap-1.5"
            >
              Processus de vérification
            </Link>
            <Link
              href="/politique-avis"
              className="text-sm text-primary-400 hover:text-primary-600 flex items-center gap-1.5"
            >
              Politique d'avis
            </Link>
            <Link
              href="/mediation"
              className="text-sm text-primary-400 hover:text-primary-600 flex items-center gap-1.5"
            >
              Médiation
            </Link>
            <Link
              href="/cgv"
              className="text-sm text-primary-400 hover:text-primary-600 flex items-center gap-1.5"
            >
              CGV
            </Link>
          </div>
        </div>
      </section>

      {/* ─── STICKY CTA + EXIT INTENT ─────────────────────── */}
      <GeoPageCTA
        title={`Comparez les devis d'artisans ${getDeptPreposition(dept.name)}`}
        subtitle="Gratuit, sans engagement, artisans vérifiés SIREN"
        ville={dept.chefLieu}
        variant="sticky-only"
      />
    </div>
  )
}
